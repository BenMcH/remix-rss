import Parser from 'rss-parser';
import type { MetaFunction, LinksFunction, LoaderFunction } from "remix";
import { useRouteData } from "remix";

import stylesUrl from "../styles/index.css";
import { getFeed } from '../services/rss';

export let meta: MetaFunction = () => {
  return {
    title: "Remix Starter",
    description: "Welcome to remix!"
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async () => {
  const feed = await getFeed('https://www.engadget.com/rss.xml');

  return {feed};
};

export default function Index() {
  let data = useRouteData();

  const feed = data.feed as Parser.Output<{ [key: string]: any; }>;

  console.log({feed: data.feed});

  return (
    <div style={{maxWidth: '600px', margin: '0 auto'}}>
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
