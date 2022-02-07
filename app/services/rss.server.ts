import Parser from 'rss-parser';
import { FeedItemPost } from '~/components/FeedItem';
import { insertFeedPosts } from '~/utils/feedPost.server';

export type InternalFeed = {
  title: string
  url: string
  description: string
  image?: string
  items: Array<Omit<FeedItemPost, 'id'> & {content: string}>
}

const parser = new Parser();

let feeds: Map<string, InternalFeed>;

feeds = new Map<string, InternalFeed>();

declare global {
  var __feedsCache: Map<string, InternalFeed> | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new cache every time another file changes
if (process.env.NODE_ENV === 'production') {
  feeds = new Map<string, InternalFeed>();
} else {
  if (!global.__feedsCache) {
    global.__feedsCache = new Map<string, InternalFeed>();
  }
  feeds = global.__feedsCache;
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
