import Parser from 'rss-parser';
import { insertFeedPosts } from '~/utils/feedPost.server';
import { TNetworkRssFeed } from './rss-types';

const parser = new Parser();

export const getFeed = async (url: string): Promise<TNetworkRssFeed>  => {
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


  return newFeed;
}
