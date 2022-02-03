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
    <>
      <tr>
        <td className="text-lg font-bold"> {item.title} </td>
        <td className="text-sm font-bold">{renderedDate}</td>
      </tr>
      <tr>
        <td colSpan={2} className="pl-4 border-l border-l-slate-500">
          {showAllContent ?  <p dangerouslySetInnerHTML={{__html: item.content || ''}} /> : <>{contentSnippet}</>}
        </td>
      </tr>
      <tr>
        <p>
          <td>
            {contentSnippet !== item.content && (
              <button type="button" onClick={() => setShowAllContent(!showAllContent)}>{showAllContent ? 'Read Less' : 'Read More'}</button>
            )}
          </td>
          <td className="pl-4">
            <a href={item.link} target='_blank'>{'Open Link'}</a>
          </td>
        </p>
      </tr>
    </>
  )
}

export default FeedItem;
