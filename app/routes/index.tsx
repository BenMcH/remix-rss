import { MetaFunction, LoaderFunction, Link, ActionFunction, redirect } from 'remix';
import { useLoaderData } from 'remix';

import Recents from '~/components/Recents';
import { authenticator } from '~/services/auth.server';
import { Feed } from '@prisma/client';
import FeedSearch from '~/components/FeedSearch';
import { deleteSubscription, getSubscribedFeeds } from '~/services/subscription.server';

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

    await deleteSubscription(user, id);

    return {}
  }
}

export let loader: LoaderFunction = async ({request}) => {
  const user = await authenticator.isAuthenticated(request);

  const userFeeds = user ? await getSubscribedFeeds(user) : [];

  return {
    email: user?.email,
    userFeeds
  }
};

export default function Index() {
  let data = useLoaderData<{email?: string, userFeeds: Feed[]}>();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-2">
      <p className="text-right ">{data.email ? <span>Hi, {data.email}! <Link to='/logout'>Logout</Link></span> : <Link to='/login'>Login</Link>}</p>
      <h1>RSS Reader</h1>
      <FeedSearch />

      <Recents feeds={data.userFeeds} />
    </div>
  )
}
