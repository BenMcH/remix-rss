import { useMemo, useState } from 'react';

export type FeedItemPost = {
	contentSnippet: string;
	date: string;
	title: string
	link: string;
	content: string;
}

const FeedItem: React.FC<{item: FeedItemPost}> = ({item}) => {
  let contentSnippet = item.contentSnippet || '';

  contentSnippet = contentSnippet.split('\n')[0];

  const [showAllContent, setShowAllContent] = useState(false);

  const renderedDate = useMemo(() => {
    const date = new Date(item.date);
    return date.toLocaleString(); 
  }, [item.date]);

  return (
    <li key={item.date}>
      <h3 className="text-lg font-bold">{item.title}</h3>
      <h4 className="text-sm font-bold">{renderedDate}</h4>
      <p>
        {contentSnippet !== item.content && (
          <>
            <a href='#' onClick={(e) => {e.preventDefault(); setShowAllContent(!showAllContent)}}>{showAllContent ? 'Read Less' : 'Read More'}</a>
            {' | '}
          </>
        )}
        <a href={item.link} target='_blank'>{'Open Link'}</a>
      </p>
      {showAllContent ? 
        <p className="pl-4 border-l border-l-slate-500" dangerouslySetInnerHTML={{__html: item.content || ''}} />  
        : <p className="pl-4 border-l border-l-slate-500">{contentSnippet}</p>
      }
    </li>
  )
}

export default FeedItem;
