import FeedItem from '~/components/FeedItem';
import { Link, LoaderFunction, MetaFunction, redirect, useLoaderData } from "remix";
import { authenticator } from "~/services/auth.server";
import * as userService from '~/utils/user.server'
import { TFeed } from '~/services/rss-types';
import { getFeed, PAGE_SIZE } from '~/utils/feed.server';
import { db } from '~/utils/db.server';

export let meta: MetaFunction = ({data}) => {
  return {
    title: data.feed?.title,
    description: data.feed?.description
  };
};


export let loader: LoaderFunction = async ({request}) => {
  const {searchParams} = new URL(request.url);
  const feedParam = searchParams.get('feed');
  let page = Number.parseInt(searchParams.get('page')?.toString() || '1', 10);

  if (!feedParam) {
	  throw redirect('/')
  }

  const user = await authenticator.isAuthenticated(request);

  try {
    let feed = await getFeed(feedParam, page);

    if (!feed) {
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
      return redirect(`/feed?feed=${feedParam}&page=${maxPage}`);
    }

    if (user) {
      await userService.createFeedSubscription(user, feed);
    }

    const newFeed: TFeed = {
      title: feed.title,
      description: feed.description,
      items: feed.FeedPost,
      url: feed.url
    }

    return {feed: newFeed, error: null, page, maxPage}
  } catch(error: any) {
    return {feed: null, error: error.message, page}
  }
};

type LoaderType = {feed: TFeed, error: null, page: number, maxPage: number} | {feed: null, error: string, page: number, maxPage: undefined};

export default function Feed() {
	const {error, feed, page, maxPage} = useLoaderData<LoaderType>();

	if (error || !feed) {
		return (
			<h1>Error! Unable to fetch feed. This shouldn't happen :( {error}</h1>	
		)
	}

	return (
    <table className="w-full">
      <thead>
        <tr>
          <th colSpan={2} align="left"><h1 className="mt-4">{feed.title}</h1></th>
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
            {page > 1 && (<><Link to={`/feed?feed=${feed.url}&page=${page-1}`}>{'Prev'}</Link> | </>)}
            {page < maxPage && (<Link to={`/feed?feed=${feed.url}&page=${page+1}`}>{'Next'}</Link> )}
          </td>
        </tr>
      </tfoot>
    </table>
	);
}
