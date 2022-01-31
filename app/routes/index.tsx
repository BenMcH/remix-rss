import Parser from 'rss-parser';
import { MetaFunction, LinksFunction, LoaderFunction, Form, Link, HeadersFunction } from "remix";
import { useLoaderData } from "remix";

import { getFeed } from '~/services/rss.server';
import Recents from '~/components/Recents';
import FeedItem, { FeedItemPost } from '~/components/FeedItem';

export interface IFeed {
  url: string
  name: string
}


export let meta: MetaFunction = ({data}) => {
  return {
    title: data.feed?.title || "RSS Reader",
    description: data.feed?.description || "Read an rss feed in peace"
  };
};

export let headers: HeadersFunction = ({loaderHeaders}) => ({
  'Cache-Control': loaderHeaders.get('Cache-Control') || 'public, max-age=60, s-max-age=300, stale-while-revalidate=300'
})

export let loader: LoaderFunction = async ({request}) => {
  const {searchParams} = new URL(request.url);
  const feedParam = searchParams.get('feed');
  if (feedParam) {
    const feed = await getFeed(feedParam);

    return new Response(JSON.stringify({feed, feedName: feedParam}), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-max-age=300, stale-while-revalidate=300'
      }
    });
  }

  return {}
};

export type Feed = {
  title: string
  url: string
  description: string
  image?: string
  items: FeedItemPost[]
}

export default function Index() {
  let data = useLoaderData<{feed?: Feed}>();

  if (data.feed) {
    const feed = data.feed;

    return (
      <div className="flex flex-col-reverse md:flex-row">
        <Recents feedTitle={feed.title} feedUrl={data.feed.url} maxWidth="20%" />
        <div>
          <Link to="/">{'< Return Home'}</Link>
          <h2 className="text-2xl font-bold">{feed.title}</h2>
          {(feed.description && feed.description !== feed.title) && <h4 className="text-xl">{feed.description}</h4>}
          {feed.image && <img className="max-w-xl" src={feed.image} />}
          <ul className="mt-4 flex flex-col gap-2">
            {feed.items.map(item => (
              <FeedItem item={item} key={item.isoDate} />
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl ">Welcome to the RSS Reader</h1>
      <Form method="get" className="flex flex-row gap-4">
        <label>{'RSS Feed:'} <input type="text" name="feed" className="border" /></label>
        <button type="submit" className="px-4 border bg-slate-200 dark:bg-slate-600">{'Go'}</button>
      </Form>

      <Recents />
    </div>
  )
}
