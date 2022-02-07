import { db } from "./db.server";
import * as rss from '~/services/rss.server';
import { insertFeedPosts } from "./feedPost.server";

async function getFeed(url: string) {
	let feed = await db.feed.findFirst({
		where: { url },
		select: { id: true }
	});

	return feed || createFeed(url);
}

async function createFeed(url: string) {
	const feed = await rss.getFeed(url);

	if (feed) {
		let dbFeed = await db.feed.create({
			data: {
				url,
				title: feed.title,
				description: feed.description
			}
		});

		let internalFeed: rss.InternalFeed = {
			...dbFeed,
			items: feed.items
		}

		await insertFeedPosts(internalFeed)

		return {id: dbFeed.id};
	}

	return null;
}

export {
	createFeed,
	getFeed
}
