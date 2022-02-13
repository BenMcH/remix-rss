import { useMemo, useState } from 'react';
import { useFetcher } from 'remix';
import { FeedItemPost } from '~/services/rss-types';


const FeedItem: React.FC<{item: FeedItemPost}> = ({item}) => {
  let contentSnippet = item.contentSnippet || '';

  contentSnippet = contentSnippet.split('\n')[0];

  let fetcher = useFetcher()

  const [open, setOpen] = useState(false);

  const renderedDate = useMemo(() => {
    const date = new Date(item.date);
    return date.toLocaleString([], {day: '2-digit', month: '2-digit', year: '2-digit'}); 
  }, [item.date]);

  return (
    <>
      <tr className="cursor-pointer border-t" onClick={() => setOpen(!open)} onPointerEnter={() => fetcher.state === 'idle' && !fetcher.data && fetcher.load(`/api/posts/${item.id}`)}>
        <td className={`${open ? 'pt-2' : 'py-2'} md:truncate md:max-w-[75vw] pl-2`}>
          <span className="text-sm font-bold">{item.title}</span>
          {!open && <span className="text-xs font-light hidden md:inline">{contentSnippet}</span>}
          <noscript>
            <a href={item.link} target='_blank'>{'Open Link'}</a>
          </noscript>
        </td>
        <td className={`${open ? 'pt-2' : 'py-2'} text-xs pl-4 text-right`}>{renderedDate}</td>
      </tr>
      {open &&(
        <>
          <tr>
            <td colSpan={2} className="pl-2 border-l border-l-slate-500">
              <p dangerouslySetInnerHTML={{__html: fetcher.data?.post.content || (fetcher.state === 'loading' ? 'Loading...' : '')}} />
            </td>
          </tr>
          <tr>
            <td className="pl-4 pb-2" colSpan={2}>
              <a href={item.link} target='_blank'>{'Open Link'}</a> (via {new URL(item.link).hostname})
            </td>
          </tr>
        </>
      )}
    </>
  )
}

export default FeedItem;
