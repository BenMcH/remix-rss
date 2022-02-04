import { useEffect, useMemo, useState } from 'react';

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

  const [open, setOpen] = useState(false);

  const renderedDate = useMemo(() => {
    const date = new Date(item.date);
    return date.toLocaleString([], {day: '2-digit', month: '2-digit', year: '2-digit'}); 
  }, [item.date]);

  return (
    <>
      <tr className="cursor-pointer border-t" onClick={() => setOpen(!open)}>
        <td className={`${open ? 'pt-2' : 'py-2'} md:truncate md:max-w-screen-2xl`}><span className="pl-2 text-sm font-bold">{item.title}</span> {!open && <span className="text-xs font-light hidden md:inline">{contentSnippet}</span>}</td>
        <td className="py-2 text-xs pl-4 text-right">{renderedDate}</td>
      </tr>
      {open &&(
        <>
          <tr>
            <td colSpan={2} className="pl-2 border-l border-l-slate-500">
              <p dangerouslySetInnerHTML={{__html: item.content || ''}} />
            </td>
          </tr>
          <tr>
            <td className="pl-4 pb-2" colSpan={2}>
              <a href={item.link} target='_blank'>{'Open Link'}</a>
            </td>
          </tr>
        </>
      )}
    </>
  )
}

export default FeedItem;
