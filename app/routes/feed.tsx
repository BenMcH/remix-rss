import { LoaderFunction, Link, Outlet, json } from 'remix';
import { useLoaderData } from 'remix';

import Recents from '~/components/Recents';
import { authenticator } from '~/services/auth.server';
import { Feed } from '@prisma/client';
import FeedSearch from '~/components/FeedSearch';
import { getSubscribedFeeds } from '~/services/subscription.server';

export interface IFeed {
  url: string
  name: string
}

type LoaderData = {
  email: string | undefined,
  userFeeds: Awaited<ReturnType<typeof getSubscribedFeeds>>
}

export let loader: LoaderFunction = async ({request}) => {
  const user = await authenticator.isAuthenticated(request);

  const userFeeds = user ? await getSubscribedFeeds(user) : [];

  return json<LoaderData>({email: user?.email, userFeeds});
};

export default function FeedLayout() {
	let data = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-col-reverse md:flex-row gap-2">
      <Recents feeds={data.userFeeds} />
      <div className="flex-grow">
        <div className="flex justify-between pb-4">
          <Link to='/'>{'< Home  '}</Link>
          <section className="hidden lg:block">
            <FeedSearch />
          </section>
          <span className="text-right">{data.email ? <span>Hi, {data.email}! <Link to='/logout'>Logout</Link></span> : <Link to='/login'>Login</Link>}</span>
        </div>
        <section className="lg:hidden py-4">
          <FeedSearch />
        </section>
        <Outlet />
      </div>
    </div>
  );
}
