import { Feed } from '@prisma/client';
import { Form } from 'remix';


const Recents: React.FC<{ maxWidth?: string, feeds: Feed[]}> = ({maxWidth = '100%', feeds}) => {
  return (
    <section id='recents' style={{maxWidth, marginRight: '2em'}}>
      <ol>
        {feeds.map((recent) => (
          <li key={recent.url}>
            <a href={`/?feed=${recent.url}`}>{recent.title}</a>
            <Form method="post">
              <input type="hidden" name="id" value={recent.id} />
              <button name="_action" value="delete_subscription" type="submit">X</button>
            </Form>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default Recents;
