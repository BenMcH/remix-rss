import { db } from "./db.server";
import * as rss from '~/services/rss.server';


async function getFeed(url: string) {
	let feed = await db.feed.findFirst({
		where: { url },
	});

	return feed || createFeed(url);
}

async function createFeed(url: string) {
	const feed = await rss.getFeed(url);

	if (feed) {
		return db.feed.create({
			data: {
				url,
				title: feed.title
			}
		})
	}

	return null;
}

export {
	createFeed,
	getFeed
}
