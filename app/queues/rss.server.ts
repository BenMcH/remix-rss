import {Queue, Worker, QueueScheduler} from 'bullmq';
import { getFeed } from "~/services/rss.server";
import { db } from '~/utils/db.server';
import {v4} from 'uuid'


const redisConnection = {
	host: process.env.REDIS_SERVICE_HOST || 'localhost',
	password: process.env.REDIS_PASSWORD || 'redis',
	enableOfflineQueue: false
}

declare global {
  var __rssQueue: Queue<any> | undefined;
  var __rssQueueWorker: Worker<any> | undefined;
  var __rssFanoutQueue: Queue<any> | undefined;
  var __rssFanoutWorker: Worker<any> | undefined;
  var __rssSchedulers: Array<QueueScheduler> | undefined;
}

let rssQueue: Queue<any>;
let rssFanoutWorker: Worker<any>;
let rssFanout: Queue<any>;


if (global.__rssQueue) {
	global.__rssQueue.close();
	global.__rssQueueWorker?.close();

	for (let scheduler of global.__rssSchedulers || []) {
		scheduler.close();
	}

	__rssSchedulers = []
}

rssQueue = global.__rssQueue = new Queue<{url: string}>('rss-fetch', {
	connection: redisConnection
});

let rssQueueWorker = new Worker('rss-fetch', async (job) => {
	await getFeed(job.data.url)
	console.log(`fetched rss feed: ${job.data.url}`)
}, {
	connection: redisConnection,
})

global.__rssSchedulers ||= []

global.__rssSchedulers.push(new QueueScheduler('rss-fetch', {
	connection: redisConnection,
}))


if (global.__rssFanoutQueue) {
	global.__rssFanoutQueue.close();
	global.__rssFanoutWorker?.close();
}

rssFanout = global.__rssFanoutQueue = new Queue('rss-fanout', {
	connection: redisConnection
});

rssFanoutWorker = new Worker('rss-fanout', async (job) => {
	console.log("Starting fan-out for rss feeds")
	let feeds = await db.feed.findMany({
		select: {
			url: true
		},
	});
	console.log(`Scanning ${feeds.length} feeds`)

	return rssQueue.addBulk(feeds.map(feed => ({
		name: 'rss-fetch',
		data: {
			url: feed.url
		},
		opts: {
			jobId: v4()
		}
	})))
}, {connection: redisConnection});

global.__rssSchedulers.push(new QueueScheduler('rss-fanout', {
	connection: redisConnection,
}))

rssFanout.removeRepeatable('rss-fanout', {every: 1000 * 60 * 30}).then(() => {
	console.log("Adding job")
	rssFanout.add('rss-fanout', {}, {
		repeat: {
			every: 1000 * 60 * 30
		},
		jobId: v4()
	}).then(() => {
		console.log("Added job")
	});
})

export { rssQueue, rssFanout };
