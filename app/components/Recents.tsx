import { Feed } from '@prisma/client';
import { Form } from 'remix';


const Recents: React.FC<{feeds: Feed[]}> = ({feeds}) => {
  if (feeds.length === 0) {
    return <></>
  }
  return (
    <section id="recents" className="max-w-sm md:px-4">
      <h2>Subscriptions</h2>
      <table>
        {feeds.map((recent) => (
          <tr key={recent.url}>
            <td className={recent !== feeds[0] ? `pt-4` : ''}>
              <a href={`/?feed=${recent.url}`}>{recent.title}</a>
            </td>
            <td className={recent !== feeds[0] ? `pt-4` : ''}>
              <Form method="post">
                <input type="hidden" name="id" value={recent.id} />
                <button
                  aira-label={`Unsubscribe from ${recent.title}`}
                  className="px-4 border bg-slate-200 dark:bg-slate-600"
                  name="_action"
                  value="delete_subscription"
                  type="submit">X</button>
              </Form>
            </td>
          </tr>
        ))}
      </table>
    </section>
  );
}

export default Recents;
