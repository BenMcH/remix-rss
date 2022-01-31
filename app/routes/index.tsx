import { MetaFunction, LinksFunction, LoaderFunction, Form, Link, HeadersFunction, ActionFunction, redirect, useActionData } from 'remix';
import { useLoaderData } from 'remix';

import { getFeed } from '~/services/rss.server';
import Recents from '~/components/Recents';
import FeedItem, { FeedItemPost } from '~/components/FeedItem';
import { authenticator } from '~/services/auth.server';
import * as userService from '~/utils/user.server';
import * as feedService from '~/utils/feed.server';
import { Feed } from '@prisma/client';

export interface IFeed {
  url: string
  name: string
}

export let meta: MetaFunction = ({data}) => {
  return {
    title: data.feed?.title || 'RSS Reader',
    description: data.feed?.description || 'Read an rss feed in peace'
  };
};

export let action: ActionFunction = async ({request}) => {
  let formData = await request.formData();
  let feed = formData.get('feed')?.toString();
  let action = formData.get('_action')?.toString();

  const user = await authenticator.isAuthenticated(request)

  if (action === 'delete_subscription') {
    let id = formData.get('id')?.toString()
    if (!id) {
      return {error: 'id is required'};
    }

    await userService.deleteSubscription(user, id);

    return {}
  }

  if (!feed || !feed.startsWith('http')) {
    return {
      error: 'Feed not found'
    }
  }

  let dbFeed = await feedService.getFeed(feed);

  if (user && dbFeed) {
    await userService.createFeedSubscription(user, dbFeed);
  }

  return redirect(`/?feed=${feed}`);
}

export let headers: HeadersFunction = ({loaderHeaders}) => ({
  'Cache-Control': loaderHeaders.get('Cache-Control') || 'public, max-age=60, s-max-age=300, stale-while-revalidate=300'
})

export let loader: LoaderFunction = async ({request}) => {
  const {searchParams} = new URL(request.url);
  const feedParam = searchParams.get('feed');

  const user = await authenticator.isAuthenticated(request);

  const userFeeds = user ? await userService.getSubscribedFeeds(user) : [];

  if (feedParam) {
    const feed = await getFeed(feedParam);

    return new Response(JSON.stringify({feed, feedName: feedParam, email: user?.email, userFeeds}), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-max-age=300, stale-while-revalidate=300'
      }
    });
  }

  return {
    email: user?.email,
    userFeeds
  }
};

export type InternalFeed = {
  title: string
  url: string
  description: string
  image?: string
  items: FeedItemPost[]
}

export default function Index() {
  let data = useLoaderData<{feed?: InternalFeed, email?: string, userFeeds: Feed[]}>();
  let actionData = useActionData();

  if (data.feed) {
    const feed = data.feed;

    return (
      <div className="flex flex-col-reverse md:flex-row">
        <Recents feeds={data.userFeeds} />
        <div>
          <Link to='/'>{'< Return Home'}</Link>
          {data.email ? <>
            Hi, {data.email}! <Link to='/logout'>Logout</Link>
          </> : <Link to='/login'>Login</Link>}
          <h2 className="text-2xl font-bold">{feed.title}</h2>
          {(feed.description && feed.description !== feed.title) && <h4 className="text-xl">{feed.description}</h4>}
          {feed.image && <img className="max-w-xl" src={feed.image} />}

          <ul className="mt-4 flex flex-col gap-2">
          {feed.items.map(item => (
            <FeedItem item={item} key={item.isoDate} />
          ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl ">Welcome to the RSS Reader</h1>
      {data.email ? <>
        Hi, {data.email}! <Link to='/logout'>Logout</Link>
      </> : <Link to='/login'>Login</Link>}
      <Form method="get" className="flex flex-row gap-4">
        <label>{'RSS Feed:'} <input type="text" name="feed" className="border" /></label>
        <button type="submit" className="px-4 border bg-slate-200 dark:bg-slate-600">{'Go'}</button>
      </Form>

      <Recents feeds={data.userFeeds} />
    </div>
  )
}
