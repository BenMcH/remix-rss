import { LoaderFunction, Link, Outlet } from 'remix';
import { useLoaderData } from 'remix';

import Recents from '~/components/Recents';
import { authenticator } from '~/services/auth.server';
import * as userService from '~/utils/user.server';
import { Feed } from '@prisma/client';
import FeedSearch from '~/components/FeedSearch';

export interface IFeed {
  url: string
  name: string
}

export let loader: LoaderFunction = async ({request}) => {
  const user = await authenticator.isAuthenticated(request);

  const userFeeds = user ? await userService.getSubscribedFeeds(user) : [];

  return {email: user?.email, userFeeds}
};

export default function FeedLayout() {
	let data = useLoaderData<{email?: string, userFeeds: Feed[]}>();

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
