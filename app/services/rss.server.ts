import Parser from 'rss-parser';
import { insertFeedPosts } from '~/utils/feedPost.server';
import { TNetworkRssFeed } from './rss-types';

const parser = new Parser();

let feeds: Map<string, TNetworkRssFeed>;

declare global {
  var __feedsCache: Map<string, TNetworkRssFeed> | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new cache every time another file changes
if (process.env.NODE_ENV === 'production') {
  feeds = new Map<string, TNetworkRssFeed>();
} else {
  if (!global.__feedsCache) {
    global.__feedsCache = new Map<string, TNetworkRssFeed>();
  }
  feeds = global.__feedsCache;
}

export const getFeed = async (url: string): Promise<TNetworkRssFeed>  => {
  const existingFeed = feeds.get(url);

  if (existingFeed) {
    return existingFeed;
  }

  const feed = await parser.parseURL(url)

  const newFeed: TNetworkRssFeed = {
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
