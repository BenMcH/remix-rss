import Parser from "rss-parser";
import { Feed } from "~/routes";

const parser = new Parser();

let feeds = new Map<string, Feed>();

export const getFeed = async (url: string): Promise<Feed>  => {
  const existingFeed = feeds.get(url);

  if (existingFeed) {
    return existingFeed;
  }

  const feed = await parser.parseURL(url)

  const newFeed: Feed = {
    title: feed.title || '',
    description: feed.description || '',
    items: feed.items.map((item) => ({
      content: item.content || '',
      date: item.isoDate || '',
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
