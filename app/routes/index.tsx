import Parser from 'rss-parser';
import { MetaFunction, LinksFunction, LoaderFunction, Form, Link } from "remix";
import { useRouteData } from "remix";

import stylesUrl from "../styles/index.css";
import { getFeed } from '../services/rss';
import { useEffect, useState } from 'react';

export let meta: MetaFunction = () => {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!"
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async ({request}) => {
  const params: any = {}
  const {searchParams} = new URL(request.url);
  const feedParam = searchParams.get('feed');
  if (feedParam) {
    const feed = await getFeed(feedParam);

    return {feed, feedName: feedParam};
  }

  return {}
};

const Recents: React.FC<{recents: string[]}> = ({recents}) => (
  <section id="recents">
    <h4>{'recent feeds'}</h4>

    <ol>
      {recents.map((recent) => (
        <li key={recent}>
          <a href={`/?feed=${recent}`}>{recent}</a>
        </li>
      ))}
    </ol>
  </section>
)

export default function Index() {
  let data = useRouteData();

  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    const feeds = JSON.parse(localStorage.getItem('recentRssFeeds') || '[]');

    console.log({feeds})

    setRecents(feeds);
  }, []);

  useEffect(() => {
    if (data.feedName) {
      console.log(data.feedName)
      let newRecents = [data.feedName, ...recents.filter((recent) => recent !== data.feedName)];

      newRecents = newRecents.slice(0, 10)

      console.log(newRecents)

      setRecents(newRecents);
      localStorage.setItem('recentRssFeeds', JSON.stringify(newRecents))
    }
  }, [data.feedName]);

  if (data.feed) {
    const feed = data.feed as Parser.Output<{ [key: string]: any; }>;

    return (
      <div style={{maxWidth: '600px', margin: '0 auto'}}>
        <Link to="/">{'< Return Home'}</Link>
        <h2>{feed.title}</h2>
        <h4>{feed.description}</h4>
        <img src={feed.image?.url} />

        <ul>
        {feed.items.map(item => (
          <li key={item.isoDate}>
            <p>{item.title}</p>
            <p>{item.contentSnippet}</p>
            <p><a href={item.link} target="_blank">{'Read More'}</a></p>
          </li>
        ))}
        </ul>
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

      {recents.length > 0 && <Recents recents={recents} />}
    </div>
  )
}
