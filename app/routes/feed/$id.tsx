import FeedItem from '~/components/FeedItem';
import { ActionFunction, Form, Link, LoaderFunction, MetaFunction, redirect, useLoaderData } from "remix";
import { authenticator } from "~/services/auth.server";
import { TFeed } from '~/services/rss-types';
import { getFeed, getFeedById, PAGE_SIZE } from '~/utils/feed.server';
import { db } from '~/utils/db.server';
import { createFeedSubscription } from '~/utils/user.server';

export let meta: MetaFunction = ({data}) => {
  return {
    title: data.feed?.title,
    description: data.feed?.description
  };
};

export let action: ActionFunction = async ({request, params}) => {
  const body = await request.formData();

  const action = body.get('_action')?.toString()

  let user = await authenticator.isAuthenticated(request);
  const feedParam = params.id!;

  if (user) {

    let feed = await getFeedById(feedParam);

    if (!feed) return {}

    if (action === 'subscribe') {
      await createFeedSubscription(user, feed)
    } else if (action === 'unsubscribe') {
      await db.feedSubscription.deleteMany({
        where: {
          userId: user.id,
          feedId: feed.id
        }
      })
    }

    return {}
  }
}


export let loader: LoaderFunction = async ({request, params}) => {
  const {searchParams} = new URL(request.url);
  const feedParam = params.id!;
  let page = Number.parseInt(searchParams.get('page')?.toString() || '1', 10);

  if (page < 1) {
    return {
      feed: null,
      error: 'Feed not found'
    }
  }

  const user = await authenticator.isAuthenticated(request);

  try {
    let feed = await getFeedById(feedParam, page);

    if (!feed || page < 1) {
      return {
        feed: null,
        error: 'Feed not found'
      }
    }

    let postCount = await db.feedPost.count({
      where: {
        feedId: feed.id
      }
    });

    let maxPage = Math.ceil(postCount / PAGE_SIZE);

    if (feed.FeedPost.length === 0) {
      return redirect(`/feed/${feed.id}?page=${maxPage}`);
    }

    let count = user ? await db.feedSubscription.count({
      where: {
        user: user, 
        feedId: feed.id
      }
    }) : 0;

    let state: UserState = user ? count > 0 ? 'subscribed' : 'unsubscribed' : 'logged out';

    const newFeed: TFeed = {
	  id: feed.id,
      title: feed.title,
      description: feed.description,
      items: feed.FeedPost,
      url: feed.url
    }

    return {feed: newFeed, error: null, page, maxPage, state}
  } catch(error: any) {
    return {feed: null, error: error.message, page}
  }
};

type UserState = 'unsubscribed' | 'subscribed' | 'logged out';
type LoaderType = {feed: TFeed, error: null, page: number, maxPage: number, state: UserState} | {feed: null, error: string, page: number, maxPage: undefined, state: undefined};

export default function Feed() {
	const {error, feed, page, maxPage, state} = useLoaderData<LoaderType>();

	if (error || !feed) {
		return (
			<h1>Error! Unable to fetch feed. This shouldn't happen :( {error}</h1>	
		)
	}

	return (
    <table className="w-[95vw] md:w-[75vw] mx-auto">
      <thead>
        <tr>
          <th align="left"><h1 className="mt-4">{feed.title}</h1></th>
          <th align="right">
            {state !== 'logged out' &&
            <Form method="post" action={`/feed/${feed.id}`} replace>
              {state === 'subscribed' ? (
                <button name="_action" value="unsubscribe" className="bg-red-500 border-red-500 text-white px-4 py-2 border rounded-md">
                  Unsubscribe 
                </button>
              ) : (
                <button name="_action" value="subscribe" className="bg-green-500 border-green-500 text-white px-4 py-2 border rounded-md">
                  Subscribe 
                </button>
              )}
            </Form>}
          </th>
        </tr>
        <tr>
          <th colSpan={2} align="left">
            {(feed.description && feed.description !== feed.title) && <h2 className="max-w-5xl text-sm">{feed.description}</h2>}
          </th>
        </tr>
        <tr>
          <th colSpan={2}>
            {feed.image && <img className="max-w-xl" src={feed.image} />}
          </th>
        </tr>
      </thead>
      <tbody>
        {feed.items.map(item => (
          <FeedItem item={item} key={item.id} />
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className="pb-2" colSpan={2}>
            {page > 1 && (<><Link to={`/feed/${feed.id}?page=${page-1}`}>{'Prev'}</Link> | </>)}
            {page < maxPage && (<Link to={`/feed/${feed.id}?page=${page+1}`}>{'Next'}</Link> )}
          </td>
        </tr>
      </tfoot>
    </table>
	);
}
