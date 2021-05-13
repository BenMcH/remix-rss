import Parser from "rss-parser";

const parser = new Parser();

let feeds = new Map<string, Parser.Output<any>>();

export const getFeed = async (url: string): Promise<Parser.Output<any>>  => {
  const existingFeed = feeds.get(url);

  if (existingFeed) {
    return existingFeed;
  }

  const feed = await parser.parseURL(url)

  feeds.set(url, feed);
  setTimeout(() => feeds.delete(url), 60000);

  return feed;
}
