import { FeedItemPost } from "~/components/FeedItem";
import { InternalFeed } from "~/services/rss.server";
import { db } from "./db.server";


export async function insertFeedPosts(feed: InternalFeed) {
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
