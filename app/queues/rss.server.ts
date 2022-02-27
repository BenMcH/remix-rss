import { Queue as BullQueue } from 'bullmq';
import { getFeed } from "~/services/rss.server";
import { db } from '~/utils/db.server';
import IORedis from 'ioredis';
import { log } from '~/utils/logger';
import { Queue } from '~/utils/queue.server';


const getRedisConnection = () => {
	return new IORedis(`redis://user:${process.env.REDIS_PASSWORD || 'redis'}@${process.env.REDIS_SERVICE_HOST || 'localhost'}:6379/0`, {
		reconnectOnError: () => 1,
		maxRetriesPerRequest: null,
		enableReadyCheck: false
	});
};

type Optional<T, v = undefined> = T | v;

let rssQueue: Optional<BullQueue<{ url: string }>>;

let rssFanout: Optional<BullQueue<null>>;

if (process.env.REDIS_PASSWORD || process.env.REDIS_SERVICE_HOST || process.env.REDIS) {
	rssQueue = Queue('rss-fetch', async ({ data }) => {
		await getFeed(data.url)
		log(`fetched rss feed: ${data.url}`)
	}, getRedisConnection());

	rssFanout = Queue('rss-fanout', async () => {
		log("Starting fan-out for rss feeds")
		let feeds = await db.feed.findMany({
			select: {
				url: true
			},
		});
		log(`Scanning ${feeds.length} feeds`)

		return rssQueue!.addBulk(feeds.map(feed => ({
			name: 'rss-fetch',
			data: {
				url: feed.url
			},
			opts: {
				jobId: feed.url,
				timeout: 15000
			}
		})))
	}, getRedisConnection());
}

export { rssQueue, rssFanout };
