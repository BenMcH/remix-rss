import { getFeed } from '~/services/rss.server';
import FeedItem from '~/components/FeedItem';
import { Link, LoaderFunction, MetaFunction, redirect, useLoaderData } from "remix";
import { authenticator } from "~/services/auth.server";
import * as userService from '~/utils/user.server'
import * as feedService from '~/utils/feed.server';
import { db } from '~/utils/db.server';
import { TFeed } from '~/services/rss-types';

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

  let [,dbFeed] = await Promise.all([getFeed(feedParam), feedService.getFeed(feedParam)]);

  if (!dbFeed) {
    return {
      feed: null,
      error: 'Feed not found'
    }
  }

  if (user && dbFeed) {
    await userService.createFeedSubscription(user, dbFeed);
  }

  const PAGE_SIZE = 20;

  try {
    let feed = await db.feed.findFirst({
      where: dbFeed,
      select: {
        title: true,
        url: true,
        description: true,
        FeedPost: {
          select: {
            contentSnippet: true,
            date: true,
            id: true,
            title: true,
            link: true,
          },
          orderBy: {
            date: 'desc'
          },
          take: PAGE_SIZE,
          skip: PAGE_SIZE * page - PAGE_SIZE
        }
      }
    });

    if (feed) {
      const newFeed: TFeed = {
        title: feed.title,
        description: feed.description,
        items: feed.FeedPost,
        url: feed.url
      }

      return {feed: newFeed, error: null, page}
    }

  } catch(error: any) {
    return {feed: null, error: error.message, page}
  }
};

type LoaderType = {feed: TFeed, error: null, page: number} | {feed: null, error: string, page: number}

export default function Feed() {
	const {error, feed, page} = useLoaderData<LoaderType>();

	if (error || !feed) {
		return (
			<h1>Error! Unable to fetch feed. This shouldn't happen :( {error}</h1>	
		)
	}

	return (
		<>
      <h2 className="mt-4">{feed.title}</h2>
      {(feed.description && feed.description !== feed.title) && <h4 className="text-xl">{feed.description}</h4>}
      {feed.image && <img className="max-w-xl" src={feed.image} />}

      <table className="w-full">
        <tbody>
          {feed.items.map(item => (
            <FeedItem item={item} key={item.id} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="pb-2" colSpan={2}>
              {page > 1 && (<><Link to={`/feed?feed=${feed.url}&page=${page-1}`}>{'Prev'}</Link> | </>)}
              <Link to={`/feed?feed=${feed.url}&page=${page+1}`}>{'Next'}</Link> 
            </td>
          </tr>
        </tfoot>
      </table>
		</>
	);
}
