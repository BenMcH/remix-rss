import type { IFeed } from '~/routes';
import { useState, useEffect } from 'react';

const fetchRecents = (): IFeed[] => JSON.parse(localStorage.getItem('recentRssFeeds') || '[]');
const persistRecents = (feeds: IFeed[]) => localStorage.setItem('recentRssFeeds', JSON.stringify(feeds));

const Recents: React.FC<{feedTitle?: string, feedUrl?: string, maxWidth?: string}> = ({feedTitle, feedUrl, maxWidth = '100%'}) => {
  const [recents, setRecents] = useState<IFeed[]>([]);

  const resetRecents = () => {
    setRecents([]);
    persistRecents([]);
  }

  const reset: React.MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
	resetRecents();
  }

  useEffect(() => {
    const feeds = fetchRecents();

    setRecents(feeds);
  }, []);

  useEffect(() => {
    if (feedUrl && feedTitle) {
      let existingRecents = fetchRecents();
      let newRecents = [{url: feedUrl, name: feedTitle}, ...existingRecents.filter((recent) => recent.url !== feedUrl)];

      newRecents = newRecents.slice(0, 10)

      setRecents(newRecents);
      persistRecents(newRecents);
    }
  }, [feedTitle, feedUrl]);

  return (
    <section id='recents' style={{maxWidth, marginRight: '2em'}}>
      <h4>{'recent feeds - '}<a href='#' onClick={reset}>{'Clear Recents'}</a></h4>

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

export default Recents;
