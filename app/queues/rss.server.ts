import { Queue as BullQueue } from 'bullmq';
import { getFeed } from "~/services/rss.server";
import { db } from '~/utils/db.server';
import IORedis from 'ioredis';
import { error, log } from '~/utils/logger';
import { Queue } from '~/utils/queue.server';
import { Feed } from '@prisma/client';
import { deleteOldFeedPosts } from '~/services/feedPost.server';
import { getAllFeeds } from '~/services/feed.server';


const getRedisConnection = () => {
	return new IORedis(`redis://user:${process.env.REDIS_PASSWORD || 'redis'}@${process.env.REDIS_SERVICE_HOST || 'localhost'}:6379/0`, {
		reconnectOnError: () => 1,
		maxRetriesPerRequest: null,
		enableReadyCheck: false
	});
};

type Optional<T, v = undefined> = T | v;

let rssQueue: Optional<BullQueue<{ url: string }>>;

let feedCleaner: Optional<BullQueue<{}>>;

let rssFanout: Optional<BullQueue<null>>;

const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => new Promise(async (resolve, reject) => {
	setTimeout(() => reject('Operation timed out'), ms);
	promise.then(resolve).catch(reject)
});

if (process.env.REDIS_PASSWORD || process.env.REDIS_SERVICE_HOST || process.env.REDIS) {
	rssQueue = Queue('rss-fetch', async ({ data }) => {
		try {
			log(`fetching rss feed: ${data.url}`)
			await timeout(getFeed(data.url), 5000)
			log(`fetched rss feed: ${data.url}`)
		} catch {
			error(`failed to fetch rss feed: ${data.url}`)
		}
	}, getRedisConnection());

	rssFanout = Queue('rss-fanout', async () => {
		log("Starting fan-out for rss feeds")
		const pendingFeeds = await (await rssQueue!.getWaiting()).map((job) => job.data.url)

		let feeds = await db.feed.findMany({
			select: {
				url: true
			},
			where: {
				NOT: {
					url: { in: pendingFeeds }
				}
			}
		});
		log(`Scanning ${feeds.length} feeds`)

		const result = await rssQueue!.addBulk(feeds.map(feed => ({
			name: 'rss-fetch',
			data: {
				url: feed.url
			},
			opts: {
				jobId: feed.url,
				timeout: 5000,

			}
		})))

		console.log("successfully queued rss feeds")

		return result;
	}, getRedisConnection());

	feedCleaner = Queue('feed-cleaner', async () => {
		const feeds = await getAllFeeds();

		for (let feed of feeds) {
			try {
				log(`cleaning: ${feed.id}`)
				await deleteOldFeedPosts(feed);
				log(`cleaned: ${feed.id}`)
			} catch {
				error(`failed to clean rss feed: ${feed.id}`)
			}
		}
	}, getRedisConnection());
}

export { rssQueue, rssFanout, feedCleaner };
