import Parser from 'rss-parser';
import { MetaFunction, LinksFunction, LoaderFunction, Form, Link } from "remix";
import { useRouteData } from "remix";

import stylesUrl from "../styles/index.css";
import { getFeed } from '../services/rss';
import { useEffect, useState } from 'react';

interface IFeed {
  url: string
  name: string
}

const fetchRecents = (): IFeed[] => JSON.parse(localStorage.getItem('recentRssFeeds') || '[]');
const persistRecents = (feeds: IFeed[]) => localStorage.setItem('recentRssFeeds', JSON.stringify(feeds));

export let meta: MetaFunction = ({data}) => {
  return {
    title: data.feed?.title || "RSS Reader",
    description: data.feed?.description || "Read an rss feed in peace"
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async ({request}) => {
  const {searchParams} = new URL(request.url);
  const feedParam = searchParams.get('feed');
  if (feedParam) {
    const feed = await getFeed(feedParam);

    return {feed, feedName: feedParam};
  }

  return {}
};

const Recents: React.FC<{recents: IFeed[], maxWidth?: string, clear: () => void}> = ({recents, clear, maxWidth = '100%'}) => {
  const reset: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    clear();
  }

  return (
    <section id="recents" style={{maxWidth, marginRight: '2em'}}>
      <h4>{'recent feeds - '}<a href="#" onClick={reset}>{'Clear Recents'}</a></h4>

      <ol>
        {recents.map((recent) => (
          <li key={recent.url}>
            <a href={`/?feed=${recent.url}`}>{recent.name}</a>
          </li>
        ))}
      </ol>
    </section>
  );
}

const FeedItem: React.FC<{item: Parser.Item}> = ({item}) => {
  let contentSnippet = item.contentSnippet || '';

  contentSnippet = contentSnippet.split('\n')[0];

  const [showAllContent, setShowAllContent] = useState(false);

  return (
    <li key={item.isoDate}>
      <h3>{item.title}</h3>
      <p>
        {contentSnippet !== item.content && (
          <>
            <a href="#" onClick={(e) => {e.preventDefault(); setShowAllContent(!showAllContent)}}>{showAllContent ? 'Read Less' : 'Read More'}</a>
            {' | '}
          </>
        )}
        <a href={item.link} target="_blank">{'Open Link'}</a>
      </p>
      {showAllContent ? 
        <p style={{paddingLeft: '2rem', borderLeft: '2px solid #333'}} dangerouslySetInnerHTML={{__html: item.content || ''}} />  
        : <p style={{paddingLeft: '2rem', borderLeft: '2px solid #333'}}>{showAllContent ? item.contentSnippet : contentSnippet}</p>
      }
    </li>
  )
}

export default function Index() {
  let data = useRouteData();


  const [recents, setRecents] = useState<IFeed[]>([]);

  const resetRecents = () => {
    setRecents([]);
    persistRecents([]);
  }

  useEffect(() => {
    const feeds = fetchRecents();

    setRecents(feeds);
  }, []);

  useEffect(() => {
    if (data.feedName && data.feed) {
      let existingRecents = fetchRecents();
      let newRecents = [{url: data.feedName, name: data.feed.title}, ...existingRecents.filter((recent) => recent.url !== data.feedName)];

      newRecents = newRecents.slice(0, 10)

      setRecents(newRecents);
      persistRecents(newRecents);
    }
  }, [data.feedName]);

  if (data.feed) {
    const feed = data.feed as Parser.Output<{ [key: string]: any; }>;

    return (
      <div id="feed">
        {recents.length > 0 && <Recents recents={recents} maxWidth={'300px'} clear={resetRecents} />}
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

      {recents.length > 0 && <Recents recents={recents} clear={resetRecents} />}
    </div>
  )
}
