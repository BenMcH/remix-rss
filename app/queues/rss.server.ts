import {Queue, Worker, QueueScheduler} from 'bullmq';
import { getFeed } from "~/services/rss.server";
import { db } from '~/utils/db.server';
import IORedis from 'ioredis';
import { log } from '~/utils/logger';


const getRedisConnection = () => {
	return new IORedis(`redis://user:${process.env.REDIS_PASSWORD || 'redis'}@${process.env.REDIS_SERVICE_HOST || 'localhost'}:6379/0`, {
		reconnectOnError: () => 1,
		maxRetriesPerRequest: null,
		enableReadyCheck: false
	});
};

type Undefinable<T, v = undefined> = T | v;

declare global {
  var __rssQueue: Undefinable<Queue<{url: string}>>;
  var __rssFanoutQueue: Undefinable<Queue<null>>;
  var __rssWorkers: {[key: string]: Undefinable<Worker>} | undefined;
  var __rssSchedulers: {[key: string]: Undefinable<QueueScheduler>} | undefined;
}

let rssQueue: Queue<{url: string}>;
let rssFanout: Queue<null>;

if (process.env.REDIS_PASSWORD || process.env.REDIS_SERVICE_HOST || process.env.REDIS) {
	let queueName = 'rss-fetch';

	rssQueue = global.__rssQueue || (global.__rssQueue = new Queue<{url: string}>(queueName, {
		connection: getRedisConnection(),
		defaultJobOptions: {
			removeOnComplete: true,
			removeOnFail: true,
		}
	}));

	global.__rssWorkers ||= {};

	global.__rssWorkers[queueName] ||= new Worker(queueName, async (job) => {
		await getFeed(job.data.url)
		log(`fetched rss feed: ${job.data.url}`)
	}, {
		connection: getRedisConnection(),
	});

	setInterval(() => {
		if (global.__rssWorkers && !global.__rssWorkers['rss-fetch']?.isRunning()) {
			global.__rssWorkers['rss-fetch']?.run();
		}
	}, 60000)

	global.__rssSchedulers ||= {}

	global.__rssSchedulers[queueName] ||= (new QueueScheduler(queueName, {
		connection: getRedisConnection(),
	}))

	queueName = 'rss-fanout'

	rssFanout = global.__rssFanoutQueue || (global.__rssFanoutQueue = new Queue(queueName, {
		connection: getRedisConnection(),
		defaultJobOptions: {
			removeOnComplete: true,
			removeOnFail: true,
		}
	}));

	global.__rssWorkers[queueName]||= new Worker(queueName, async (job) => {
		log("Starting fan-out for rss feeds")
		let feeds = await db.feed.findMany({
			select: {
				url: true
			},
		});
		log(`Scanning ${feeds.length} feeds`)

		return rssQueue.addBulk(feeds.map(feed => ({
			name: 'rss-fetch',
			data: {
				url: feed.url
			},
			opts: {
				jobId: feed.url,
				timeout: 15000
			}
		})))
	}, {connection: getRedisConnection()});

	global.__rssSchedulers[queueName] ||= (new QueueScheduler('rss-fanout', {
		connection: getRedisConnection(),
	}))

	global.__rssFanoutQueue.drain().then(() => {
		log("Adding job")
		global.__rssFanoutQueue!.add('rss-fanout', null, {
			repeat: {
				every: 1000 * 60 * 30
			},
			jobId: 'fanout'
		}).then(() => {
			log("Added job")
		});
	})
}

export { rssQueue, rssFanout };
