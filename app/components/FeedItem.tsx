import Parser from "rss-parser";
import { useState } from "react";

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

export default FeedItem;