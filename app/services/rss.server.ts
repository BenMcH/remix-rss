import Parser from 'rss-parser';
import { insertFeedPosts } from '~/services/feedPost.server';
import { TNetworkRssFeed } from './rss-types';

const parser = new Parser();

const manualRedirectFetch: typeof fetch = (url, opt = {}) => fetch(url, { ...opt, redirect: 'manual' })
  .then((res) => [301, 302].includes(res.status) ?
    manualRedirectFetch(url, opt)
    : res
  )

export const getFeed = async (url: string): Promise<TNetworkRssFeed> => {
  const data = await manualRedirectFetch(url).then(result => result.text());
  const feed = await parser.parseString(data)

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
