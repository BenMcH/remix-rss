import Queue, {Queue as IQueue} from 'bull';
import { getFeed } from "~/services/rss.server";
import { db } from '~/utils/db.server';

declare global {
  var __rssQueue: IQueue<any> | undefined;
  var __rssFanoutQueue: IQueue<any> | undefined;
}

let rssQueue: IQueue<any>;
let rssFanout: IQueue<any>;


if (global.__rssQueue) {
	global.__rssQueue.close();
}

rssQueue = global.__rssQueue = Queue('rss-fetch', {
	redis: {
		host: process.env.REDIS_SERVICE_HOST || 'localhost',
		password: process.env.REDIS_PASSWORD || 'redis',
		lazyConnect: false
	}
});

rssQueue.process(3, (job, done) => getFeed(job.data.url)
	.then(() => console.log(`fetched rss feed: ${job.data.url}`))
	.then(() => done())
	.catch(err => done(err)));

if (global.__rssFanoutQueue) {
	global.__rssFanoutQueue.close();
}

rssFanout = global.__rssFanoutQueue = Queue('rss-fanout', {
	redis: {
		host: process.env.REDIS_SERVICE_HOST || 'localhost',
		password: process.env.REDIS_PASSWORD || 'redis',
		lazyConnect: false
	}
});

rssFanout.process(async (job) => {
	console.log("Starting fan-out for rss feeds")
	let feeds = await db.feed.findMany({
		select: {
			url: true
		},
	});
	console.log(`Scanning ${feeds.length} feeds`)

	return rssQueue.addBulk(feeds.map(feed => ({data: {url: feed.url}})))
});

rssFanout.removeJobs('*').then(() => {
	console.log("Adding job")
	rssFanout.add({}, {
		repeat: {
			every: 1000 * 60 * 30
		}
	}).then(() => {
		console.log("Added job")
	});
})

export { rssQueue, rssFanout };
