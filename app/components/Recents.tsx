import { Feed } from '@prisma/client';
import { Form, useFetcher } from 'remix';

function SubscriptionForm({recent, firstFeed}: {recent: Feed, firstFeed: boolean}) {
  let fetcher = useFetcher();
  if (fetcher.state !== 'idle') {
    return null;
  }

  return (
    <tr key={recent.url}>
      <td className={!firstFeed ? `pt-4` : ''}>
        <a href={`/?feed=${recent.url}`} className="mr-2">{recent.title}</a>
      </td>
      <td className={!firstFeed ? `pt-4` : ''}>
        <fetcher.Form method="post">
          <input type="hidden" name="id" value={recent.id} />
          <button
            aira-label={`Unsubscribe from ${recent.title}`}
            className="px-4 border bg-slate-200 disabled:bg-slate-400 dark:bg-slate-600 disabled:dark:bg-slate-800"
            disabled={fetcher.state != 'idle'}
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
    <section id="recents" className="max-w-sm md:px-4 md:max-h-screen md:overflow-y-auto">
      <h2>Subscriptions</h2>
      <table className="mt-4">
        {feeds.map((recent) => (
          <SubscriptionForm recent={recent} firstFeed={recent === feeds[0]} />
        ))}
      </table>
    </section>
  );
}

export default Recents;
