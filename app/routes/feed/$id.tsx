import FeedItem from '~/components/FeedItem';
import { ActionFunction, HeadersFunction, json, LoaderFunction, MetaFunction, redirect } from "@remix-run/node";
import {Form, Link, useLoaderData } from '@remix-run/react'
import { authenticator } from "~/services/auth.server";
import { TFeed } from '~/services/rss-types';
import { getFeedById, PAGE_SIZE } from '~/services/feed.server';
import { createFeedSubscription, deleteSubscription, isUserSubscribed } from '~/services/subscription.server';
import { countFeedPosts } from '~/services/feedPost.server';

export let meta: MetaFunction = ({data}) => {
  return {
    title: data.feed?.title,
    description: data.feed?.description
  };
};

export let headers: HeadersFunction = ({}) => {
  return {
    'Cache-Control': 'private, max-age=180'
  };
};

export let action: ActionFunction = async ({request, params}) => {
  let [body, user] = await Promise.all([
    request.formData(),
    authenticator.isAuthenticated(request)
  ]);

  let action = body.get('_action')?.toString()
  let feedParam = params.id!;

  if (user) {

    let feed = await getFeedById(feedParam);

    if (!feed) return {}

    if (action === 'subscribe') {
      await createFeedSubscription(user, feed)
    } else if (action === 'unsubscribe') {
      await deleteSubscription(user, feed.id)
    }

    return {}
  }
}


export let loader: LoaderFunction = async ({request, params}) => {
  const {searchParams} = new URL(request.url);
  const feedParam = params.id!;
  let page = Number.parseInt(searchParams.get('page')?.toString() || '1', 10);

  if (page < 1) {
    return json<LoaderType>({
      error: 'Feed not found',
    })
  }

  const user = await authenticator.isAuthenticated(request);

  try {
    let feed = await getFeedById(feedParam, page);

    if (!feed || page < 1) {
      return json<LoaderType>({
        error: 'Feed not found'
      })
    }

    let postCount = await countFeedPosts(feed)

    let maxPage = Math.ceil(postCount / PAGE_SIZE);

    if (feed.FeedPost.length === 0) {
      return redirect(`/feed/${feed.id}?page=${maxPage}`);
    }

    let count = user ? await isUserSubscribed(user, feed) : 0;

    let state: UserState = user ? count > 0 ? 'subscribed' : 'unsubscribed' : 'logged out';

    const newFeed: TFeed = {
	  id: feed.id,
      title: feed.title,
      description: feed.description,
      items: feed.FeedPost,
      url: feed.url
    }

    return json<LoaderType>({feed: newFeed, error: null, page, maxPage, state}, {
      headers: {
        'Cache-Control': 'private, max-age=180'
      }
    })
  } catch(error: any) {
    return {feed: null, error: error.message, page}
  }
};

type UserState = 'unsubscribed' | 'subscribed' | 'logged out';
type FeedPageParams = {feed: TFeed, page: number, maxPage: number, state: UserState, error: null}
type ErrorParams = {error: string}
type LoaderType =  (FeedPageParams | ErrorParams)

export default function Feed() {
  let loaderData = useLoaderData<LoaderType>();

	if (loaderData.error !== null) {
		return (
			<h1>Error! Unable to fetch feed. This shouldn't happen :( {loaderData.error}</h1>	
		)
	}

	let {page, maxPage, state, feed} = loaderData;

	return (
    <table className="w-[95vw] md:w-[80vw] mx-auto">
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
