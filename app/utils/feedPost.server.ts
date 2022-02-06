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

  await Promise.all(
    feed.items.map((post) => 
      db.feedPost.upsert({
        where: {
          feedId_date_link: {
            date: post.date,
            feedId: dbFeed.id,
            link: post.link,
          }
        },
        create: {
            feedId: dbFeed.id,
            title: post.title,
            link: post.link,
            date: post.date,
            content: post.content,
            contentSnippet: post.contentSnippet,
        },
        update: {}
      })
  ));
}
