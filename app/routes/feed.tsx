import { MetaFunction, LoaderFunction, Link, Outlet } from 'remix';
import { useLoaderData } from 'remix';

import { getFeed } from '~/services/rss.server';
import Recents from '~/components/Recents';
import { FeedItemPost } from '~/components/FeedItem';
import { authenticator } from '~/services/auth.server';
import * as userService from '~/utils/user.server';
import * as feedService from '~/utils/feed.server';
import { Feed } from '@prisma/client';
import FeedSearch from '~/components/FeedSearch';

export interface IFeed {
  url: string
  name: string
}

export let meta: MetaFunction = ({data}) => {
  return {
    title: data.feed.title,
    description: data.feed.description
  };
};

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

export default function FeedLayout() {
	let data = useLoaderData<{feed: InternalFeed, email?: string, userFeeds: Feed[]}>();
	let feed = data.feed;

    return (
      <div className="flex flex-col-reverse md:flex-row gap-2">
        <Recents feeds={data.userFeeds} />
        <div className="flex-grow">
          <div className="flex justify-between">
            <Link to='/'>{'< Home  '}</Link>
            <section className="hidden lg:block">
              <FeedSearch />
            </section>
            <span className="text-right ">{data.email ? <span>Hi, {data.email}! <Link to='/logout'>Logout</Link></span> : <Link to='/login'>Login</Link>}</span>
          </div>
          <Outlet />
          <section className="lg:hidden">
            <FeedSearch />
          </section>
        </div>
      </div>
    );
}
