import Parser from 'rss-parser';
import { InternalFeed } from '~/routes';
import { db } from '~/utils/db.server';

const parser = new Parser();

let feeds = new Map<string, InternalFeed>();

async function insertFeedPosts(feed: InternalFeed) {
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

export const getFeed = async (url: string): Promise<InternalFeed>  => {
  const existingFeed = feeds.get(url);

  if (existingFeed) {
    return existingFeed;
  }

  const feed = await parser.parseURL(url)

  const newFeed: InternalFeed = {
    title: feed.title || '',
    description: feed.description || '',
    items: feed.items.map((item) => {
      return ({
        content: item.content || '',
        date: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate!).toISOString() : '',
        link: item.link || '',
        title: item.title || '',
        contentSnippet: item.contentSnippet || '',
        isoDate: item.isoDate || '',
      })
    }),
    url,
  }

  await insertFeedPosts(newFeed);

  feeds.set(url, newFeed);
  setTimeout(() => feeds.delete(url), 60000);


  return newFeed;
}
