import { MetaFunction, LoaderFunction, Link, ActionFunction, redirect } from 'remix';
import { useLoaderData } from 'remix';

import Recents from '~/components/Recents';
import FeedItem, { FeedItemPost } from '~/components/FeedItem';
import { authenticator } from '~/services/auth.server';
import * as userService from '~/utils/user.server';
import { Feed } from '@prisma/client';
import FeedSearch from '~/components/FeedSearch';

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

  return redirect(`/feed?feed=${feed}`);
}

export let loader: LoaderFunction = async ({request}) => {
  const user = await authenticator.isAuthenticated(request);

  const userFeeds = user ? await userService.getSubscribedFeeds(user) : [];

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
          <div className="flex justify-between">
            <Link to='/'>{'< Home'}</Link>
            <section className="hidden lg:block">
              <FeedSearch />
            </section>
            <span className="text-right ">{data.email ? <span>Hi, {data.email}! <Link to='/logout'>Logout</Link></span> : <Link to='/login'>Login</Link>}</span>
          </div>
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
          <section className="lg:hidden">
            <FeedSearch />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-2">
      <h1>RSS Reader</h1>
      <FeedSearch />

      <Recents feeds={data.userFeeds} />
    </div>
  )
}
