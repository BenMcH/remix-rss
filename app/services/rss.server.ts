import Parser from 'rss-parser';
import { InternalFeed } from '~/routes';

const parser = new Parser();

let feeds = new Map<string, InternalFeed>();

export const getFeed = async (url: string): Promise<InternalFeed>  => {
  const existingFeed = feeds.get(url);

  if (existingFeed) {
    return existingFeed;
  }

  const feed = await parser.parseURL(url)

  const newFeed: InternalFeed = {
    title: feed.title || '',
    description: feed.description || '',
    items: feed.items.map((item) => ({
      content: item.content || '',
      date: new Date(item.isoDate || item.pubDate || '').toISOString(),
      link: item.link || '',
      title: item.title || '',
      contentSnippet: item.contentSnippet || '',
      isoDate: item.isoDate || '',
    })),
    url,
  }

  feeds.set(url, newFeed);
  setTimeout(() => feeds.delete(url), 60000);


  return newFeed;
}
