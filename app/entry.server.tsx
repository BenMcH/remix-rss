import { renderToString } from 'react-dom/server';
import { RemixServer } from '@remix-run/react';
import type { EntryContext } from '@remix-run/node';
import { feedCleaner, rssFanout } from './queues/rss.server';

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  });
}

declare global {
  var appStartSignal: undefined | true;
}

if (!global.appStartSignal) {
  global.appStartSignal = true;
  
  rssFanout?.drain()?.then(() => {
		rssFanout!.add('rss-fanout', null, {
      repeat: {
        cron: '*/30 * * * *'
      }
    })
  })

 feedCleaner?.drain()?.then(() => {
		feedCleaner!.add('feed-cleaner', {}, {
      repeat: {
        cron: '0 * * * *'
      }
    })
  })
}
