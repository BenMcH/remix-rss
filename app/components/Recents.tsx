import { Feed } from '@prisma/client';
import { Form } from 'remix';


const Recents: React.FC<{feeds: Feed[]}> = ({feeds}) => {
  return (
    <section id="recents" className="max-w-sm md:px-4 mt-4">
      <h2>Subscriptions</h2>
      <ol className="flex flex-col gap-3">
        {feeds.map((recent) => (
          <li key={recent.url} className="flex flex-row gap-2">
            <a href={`/?feed=${recent.url}`}>{recent.title}</a>
            <Form method="post">
              <input type="hidden" name="id" value={recent.id} />
              <button
                aira-label={`Unsubscribe from ${recent.title}`}
                className="px-4 border bg-slate-200 dark:bg-slate-600"
                name="_action"
                value="delete_subscription"
                type="submit">X</button>
            </Form>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default Recents;
