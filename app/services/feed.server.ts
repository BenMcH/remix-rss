import { db } from "../utils/db.server";
import * as rss from '~/services/rss.server';
import { insertFeedPosts } from "./feedPost.server";
import { TNetworkRssFeed } from "~/services/rss-types";
import { Feed, FeedPost } from "@prisma/client";
import { Nullable } from "~/utils/types";

const PAGE_SIZE = 20;

type TDbFeed = Pick<Feed, 'id' | 'title' | 'url' | 'description'> & {
	FeedPost: Array<Pick<FeedPost, 'id' | 'title' | 'link' | 'contentSnippet' | 'date'>>
}

async function getAllFeeds() {
	return db.feed.findMany({
		select: {
			id: true,
			title: true,
			url: true
		},
		orderBy: {
			title: "asc"
		}
	});
}

async function getFeedById(id: Feed['id'], page = 1): Promise<Nullable<TDbFeed>> {
	let feed: Nullable<TDbFeed>  = await db.feed.findFirst({
		where: {id},
		select: {
			title: true,
			url: true,
			description: true,
			id: true,
			FeedPost: {
				select: {
					contentSnippet: true,
					date: true,
					id: true,
					title: true,
					link: true,
				},
				orderBy: {
					date: 'desc'
				},
				take: PAGE_SIZE,
				skip: PAGE_SIZE * page - PAGE_SIZE
			}
		}
	});

	return feed;
}

async function getFeed(url: string, page = 1): Promise<Nullable<TDbFeed>> {
	let feed: Nullable<TDbFeed>  = await db.feed.findFirst({
		where: {url},
		select: {
			title: true,
			url: true,
			description: true,
			id: true,
			FeedPost: {
				select: {
					contentSnippet: true,
					date: true,
					id: true,
					title: true,
					link: true,
				},
				orderBy: {
					date: 'desc'
				},
				take: PAGE_SIZE,
				skip: PAGE_SIZE * page - PAGE_SIZE
			}
		}
	});

	return feed || createFeed(url);
}

async function createFeed(url: string) {
	const feed = await rss.getFeed(url);
	
	if (feed && feed.items.length) {
		let dbFeed: Omit<TDbFeed, 'FeedPost'> = await db.feed.create({
			data: {
				url,
				title: feed.title,
				description: feed.description
			}
		});
		
		let internalFeed: TNetworkRssFeed = {
			...dbFeed,
			items: feed.items
		}
		
		await insertFeedPosts(internalFeed)
		
		return getFeed(url);
	}
	
	return null;
}

async function deleteFeed(feed: Pick<Feed, 'id'>) {
	await db.feedSubscription.deleteMany({
		where: { feed }
	});

	await db.feedPost.deleteMany({
		where: { feed }
	});

	await db.feed.deleteMany({
		where: { id: feed.id }
	});
}

async function searchFeeds(query: string) {
	return db.feed.findMany({
		select: {
			id: true,
			url: true,
			title: true,
			description: true
		},
		where: {
			OR: [
				{
					title: {
						contains: query,
						mode: 'insensitive'
					},
				},
				{
					description: {
						contains: query,
						mode: 'insensitive'
					},
				}
			]
		}
	});

}

export {
	createFeed,
	deleteFeed,
	getAllFeeds,
	getFeed,
	getFeedById,
	searchFeeds,
	PAGE_SIZE
}
