import { Feed } from '@prisma/client';
import { useFetcher } from '@remix-run/react';
import FeedLink from './FeedLink';

function SubscriptionForm({recent, firstFeed}: {recent: Feed, firstFeed: boolean}) {
  let fetcher = useFetcher();

  if (fetcher.state !== 'idle') {
    return null;
  }

  return (
    <tr key={recent.url}>
      <td className={`${!firstFeed ? `pt-4` : ''} md:w-80`}>
        <FeedLink feed={recent} />
      </td>
      <td className={!firstFeed ? `pt-4` : ''}>
        <fetcher.Form method="post" action="/?index">
          <input type="hidden" name="id" value={recent.id} />
          <button
            aira-label={`Unsubscribe from ${recent.title}`}
            className="px-4 border bg-slate-200 disabled:bg-slate-400 dark:bg-slate-600 disabled:dark:bg-slate-800"
            name="_action"
            value="delete_subscription"
            type="submit">X</button>
        </fetcher.Form>
      </td>
    </tr>
  )
}

const Recents: React.FC<{feeds: Feed[]}> = ({feeds}) => {
  if (feeds.length === 0) {
    return <></>
  }
  return (
    <aside id="recents" className="md:w-20 md:h-screen px-4 md:py-8 md:flex-grow-0">
      <h2>Subscriptions</h2>
      <div className="h-full overflow-y-auto pb-4 pr-2">
        <table className="mt-4">
          <tbody>
            {feeds.map((recent) => (
              <SubscriptionForm recent={recent} firstFeed={recent === feeds[0]} key={recent.id} />
            ))}
          </tbody>
        </table>
      </div>
    </aside>
  );
}

export default Recents;
