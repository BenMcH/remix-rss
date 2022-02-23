import { Feed } from "@prisma/client";
import { TNetworkRssFeed } from "~/services/rss-types";
import { db } from "../utils/db.server";

export async function insertFeedPosts(feed: TNetworkRssFeed) {
  const dbFeed = await db.feed.findFirst({
    where: {
      url: feed.url,
    }, select: {
      id: true,
    }
  });

  if (dbFeed === null) {
    return;
  }

  await db.feedPost.createMany({
	  data: feed.items.map((post) => ({
		  content: post.content,
		  contentSnippet: post.contentSnippet,
		  date: post.date,
		  feedId: dbFeed.id,
		  link: post.link,
		  title: post.title
	  })),
	  skipDuplicates: true
  });
}

export async function getPostContent(postId: string) {
	return db.feedPost.findFirst({
		where: {
			id: postId,
		}, select: {
			content: true,
		}
	});
}

export async function countFeedPosts(feed: Pick<Feed, 'id'>) {
    return db.feedPost.count({
      where: {
        feedId: feed.id
      }
    });
};
