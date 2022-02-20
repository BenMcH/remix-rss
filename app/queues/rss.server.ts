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

declare global {
  var __rssQueue: Queue<{url: string}> | undefined;
  var __rssQueueWorker: Worker<{url: string}> | undefined;
  var __rssFanoutQueue: Queue<null> | undefined;
  var __rssFanoutWorker: Worker<null> | undefined;
  var __rssSchedulers: Array<QueueScheduler> | undefined;
}

let rssQueue: Queue<{url: string}>;
let rssFanout: Queue<null>;

if (process.env.REDIS_PASSWORD) {
	rssQueue = global.__rssQueue || (global.__rssQueue = new Queue<{url: string}>('rss-fetch', {
		connection: getRedisConnection(),
		defaultJobOptions: {
			removeOnComplete: true,
			removeOnFail: true,
		}
	}));

	global.__rssQueueWorker ||= new Worker('rss-fetch', async (job) => {
		await getFeed(job.data.url)
		log(`fetched rss feed: ${job.data.url}`)
	}, {
		connection: getRedisConnection(),
	});

	setInterval(() => {
		if (!global.__rssQueueWorker?.isRunning()) {
			global.__rssQueueWorker?.run();
		}
	}, 60000)

	global.__rssSchedulers ||= []

	if (global.__rssSchedulers.length === 0) {
		global.__rssSchedulers.push(new QueueScheduler('rss-fetch', {
			connection: getRedisConnection(),
		}))
	}


	rssFanout = global.__rssFanoutQueue || (global.__rssFanoutQueue = new Queue('rss-fanout', {
		connection: getRedisConnection(),
		defaultJobOptions: {
			removeOnComplete: true,
			removeOnFail: true,
		}
	}));

	global.__rssFanoutWorker ||= new Worker('rss-fanout', async (job) => {
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

	if (global.__rssSchedulers.length === 1) {
		global.__rssSchedulers.push(new QueueScheduler('rss-fanout', {
			connection: getRedisConnection(),
		}))
	}

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
