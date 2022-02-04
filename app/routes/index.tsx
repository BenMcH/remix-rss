import { MetaFunction, LoaderFunction, Form, Link, HeadersFunction, ActionFunction, redirect } from 'remix';
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

  return redirect(`/?feed=${feed}`);
}

export let loader: LoaderFunction = async ({request}) => {
  const {searchParams} = new URL(request.url);
  const feedParam = searchParams.get('feed');

  const user = await authenticator.isAuthenticated(request);

  const userFeeds = user ? await userService.getSubscribedFeeds(user) : [];

  if (feedParam) {
    const feed = await getFeed(feedParam);

    const dbFeed = await feedService.getFeed(feedParam);

    if (user && dbFeed) {
      await userService.createFeedSubscription(user, dbFeed);
    }


    return {feed, feedName: feedParam, email: user?.email, userFeeds}
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

  if (data.feed) {
    const feed = data.feed;

    return (
      <div className="flex flex-col-reverse md:flex-row gap-2">
        <Recents feeds={data.userFeeds} />
        <div className="flex-grow">
          <p className="flex justify-between">
            <Link to='/'>{'< Return Home'}</Link>
            <span className="text-right ">{data.email ? <span>Hi, {data.email}! <Link to='/logout'>Logout</Link></span> : <Link to='/login'>Login</Link>}</span>
          </p>
          <h2 className="mt-4">{feed.title}</h2>
          {(feed.description && feed.description !== feed.title) && <h4 className="text-xl">{feed.description}</h4>}
          {feed.image && <img className="max-w-xl" src={feed.image} />}

          <table className="w-full md:max-w-7xl">
            <tbody>
              {feed.items.map(item => (
                <FeedItem item={item} key={item.link} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-2">
      <h1>RSS Reader</h1>
      {data.email ? <p> Hi, {data.email}! <Link to='/logout'>Logout</Link> </p> : <Link to='/login'>Login</Link>}
      <Form method="post" className="flex flex-row gap-4">
        <label>{'RSS Feed:'} <input type="text" name="feed" className="border" /></label>
        <button type="submit" className="px-4 border bg-slate-200 dark:bg-slate-600">{'Go'}</button>
        <Link to="/all_feeds">{'All Feeds'}</Link>
      </Form>

      <Recents feeds={data.userFeeds} />
    </div>
  )
}
