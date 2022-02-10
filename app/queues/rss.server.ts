console.log("loading queues")
import Queue from 'bull';
import { getFeed } from "~/services/rss.server";
import { db } from '~/utils/db.server';

console.log("loading queues")
export let rssQueue = Queue('rss-fetch', {
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		password: process.env.REDIS_PASSWORD || 'redis'
	},
	limiter: {
		max: 1,
		duration: 500
	}
});

rssQueue.process((job, done) => getFeed(job.data.url)
	.then(() => console.log(`fetched rss feed: ${job.data.url}`))
	.then(() => done())
	.catch(err => done(err)));

export let rssFanout = Queue('rss-fanout', {
	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		password: process.env.REDIS_PASSWORD || 'redis'
	}
});

rssFanout.process(async (job, done) => {
	let feeds = await db.feed.findMany({
		select: {
			url: true
		},
	});

	await rssQueue.addBulk(feeds.map(feed => ({data: {url: feed.url}})))

	done()
});
