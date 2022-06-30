import Parser from 'rss-parser';
import { insertFeedPosts } from '~/services/feedPost.server';
import { log } from '~/utils/logger';
import { TNetworkRssFeed } from './rss-types';

const parser = new Parser();

const manualRedirectFetch: typeof fetch = (url, opt = {}) => fetch(url, { ...opt, redirect: 'manual' })
  .then((res) => [301, 302].includes(res.status) ?
    manualRedirectFetch(url, opt)
    : res
  )

export const getFeed = async (url: string): Promise<TNetworkRssFeed> => {
  const data = await manualRedirectFetch(url).then(result => result.text());
  log(`Fetched feed for ${url}`)
  const feed = await parser.parseString(data)
  log(`Parsed feed for ${url}`)

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

  log(`inserting feed to db for ${url}`)
  await insertFeedPosts(newFeed);
  log(`inserted feed to db for ${url}`)

  return newFeed;
}
