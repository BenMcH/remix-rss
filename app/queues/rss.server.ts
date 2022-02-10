import { Queue } from "quirrel/remix";
import { getFeed } from "~/services/rss.server";

export default Queue('/api/jobs/rss', async (feedUrl: string) => {
	console.log(`Fetching feed: ${feedUrl}`);

	await getFeed(feedUrl);	
});
