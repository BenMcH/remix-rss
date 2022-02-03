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

  const [hasOpened, setHasOpened] = useState(false)

  useEffect(() => {
    if (open) {
      setHasOpened(true)
    }
  }, [open, setHasOpened])

  const renderedDate = useMemo(() => {
    const date = new Date(item.date);
    return date.toLocaleString([], {day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit'}); 
  }, [item.date]);

  return (
    <>
      <tr className={hasOpened ? "" : "border-l"} onClick={() => setOpen(!open)}>
        <td className="truncate pl-4  max-w-sm md:max-w-lg lg:max-w-2xl xl:max-w-4xl"><span className="text-sm font-bold">{item.title}</span> {!open && <span className="text-xs font-light">{contentSnippet}</span>}</td>
        <td className="text-xs pl-4">{renderedDate}</td>
      </tr>
      {open &&(
        <>
          <tr>
            <td colSpan={2} className="pl-4 border-l border-l-slate-500">
              {open ?  <p dangerouslySetInnerHTML={{__html: item.content || ''}} /> : <>{contentSnippet}</>}
            </td>
          </tr>
          <tr>
            <td className="pl-4" colSpan={2}>
              <a href={item.link} target='_blank'>{'Open Link'}</a>
            </td>
          </tr>
        </>
      )}
    </>
  )
}

export default FeedItem;
