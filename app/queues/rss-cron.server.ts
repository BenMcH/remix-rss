import { CronJob } from "quirrel/remix";
import { db } from "~/utils/db.server";
import rssQueue from "./rss.server";

export default CronJob('/api/jobs/rss-fanout', '0 * * * *', async () => {
	let feeds = await db.feed.findMany({
		select: {
			url: true
		},
	});

	await rssQueue.enqueueMany(feeds.map(feed => ({payload: feed.url, options: {
		exclusive: true
	}})));
});
