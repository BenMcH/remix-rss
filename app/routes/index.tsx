import Parser from 'rss-parser';
import { MetaFunction, LinksFunction, LoaderFunction, Form, Link, HeadersFunction } from "remix";
import { useLoaderData } from "remix";

import stylesUrl from "~/styles/index.css";
import { getFeed } from '~/services/rss';
import Recents from '~/components/Recents';
import FeedItem from '~/components/FeedItem';

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

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let headers: HeadersFunction = () => ({
  'Cache-Control': 'public, max-age=60, s-max-age=300, stale-while-revalidate=300'
})

export let loader: LoaderFunction = async ({request}) => {
  const {searchParams} = new URL(request.url);
  const feedParam = searchParams.get('feed');
  if (feedParam) {
    const feed = await getFeed(feedParam);

    return {feed, feedName: feedParam};
  }

  return {}
};

export default function Index() {
  let data = useLoaderData();

  if (data.feed) {
    const feed = data.feed as Parser.Output<{ [key: string]: any; }>;

    return (
      <div id="feed">
        <Recents feedTitle={feed.title} feedUrl={data.feedName} maxWidth="20%" />
        <div>
          <Link to="/">{'< Return Home'}</Link>
          <h2>{feed.title}</h2>
          <h4>{feed.description}</h4>
          <img style={{maxWidth: '600px'}} src={feed.image?.url} />

          <ul>
          {feed.items.map(item => (
            <FeedItem item={item} key={item.isoDate} />
          ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={{maxWidth: '600px', margin: '0 auto'}}>
      <h1>Welcome to the RSS Reader</h1>
      <Form method="get">
        <label>{'RSS Feed:'} <input type="text" name="feed"/></label>
        <button type="submit">{'Go'}</button>
      </Form>

      <Recents />
    </div>
  )
}
