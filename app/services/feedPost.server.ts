import { Feed } from "@prisma/client";
import { TNetworkRssFeed } from "~/services/rss-types";
import { log } from "~/utils/logger";
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

const postsToKeep = 100

export async function deleteOldFeedPosts(feed: Pick<Feed, 'id'>) {
  let postCount = await db.feedPost.count({
    where: {
      feedId: feed.id
    }
  })

  if (postCount > postsToKeep) {
    log(`Deleting ${postCount - postsToKeep} posts for ${feed.id}`)
    const latestPosts = await db.feedPost.findMany({
      orderBy: {
        date: 'desc'
      },
      take: postsToKeep,
      where: {
        feedId: feed.id
      },
      select: {
        id: true
      }
    })

    let thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() - 30
    )

    await db.feedPost.deleteMany({
      where: {
        AND: [
          {
            NOT: {
              id: {
                in: latestPosts.map(p => p.id)
              }
            },
          },
          {
            date: {
              lt: thirtyDaysAgo.toISOString()
            }
          }
        ]

      }
    })
  }
}
