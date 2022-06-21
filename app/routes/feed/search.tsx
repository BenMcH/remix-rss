import { MetaFunction, LoaderFunction, redirect, json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { Feed } from '@prisma/client';
import FeedLink from '~/components/FeedLink';
import { getFeed, searchFeeds } from '~/services/feed.server';

export interface IFeed {
  url: string
  name: string
}

export let meta: MetaFunction = ({data}) => {
  return {
    title: data.queryParam ? `Search Results: ${data.queryParam}` : 'Search Results',
  };
};

type LoaderData = {
	results: Awaited<ReturnType<typeof searchFeeds>>
	queryParam: string
}

export let loader: LoaderFunction = async ({request}) => {
	let query = request.url.split('?')[1];

	let params = new URLSearchParams(query);

	let queryParam = params.get('query');

	if (!queryParam) {
		return redirect('/');
	}

	if (queryParam.match(/^\/?r\/[\w_]+$/)) {
		queryParam = `/${queryParam}`.replace('//', '/')

		queryParam = `https://reddit.com${queryParam}.rss`;
	}

	if (queryParam.startsWith('http') && params.get('_action') === 'submit') {
		let url: URL | undefined;
		
		try {
			url = new URL(queryParam);
			let feed = url && await getFeed(queryParam, 1).catch(() => undefined);

			if (url && feed) {
				return redirect(`/feed/${feed.id}`);
			}
		} catch (e) {
			return json<LoaderData>({
				results: [],
				queryParam
			})
		}
	}

	let results = await searchFeeds(queryParam);

	return json<LoaderData>({results, queryParam});
};

export default function Index() {
  let data = useLoaderData<{results: Array<Pick<Feed, 'id' | 'description' | 'title' | 'url'>>, queryParam: string}>();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-2">
		<main className="max-w-xl mx-auto">
			<h1>Search Results for {data.queryParam}</h1>
			<ul className="mt-4">
				{data.results.map((item) => ( 
					<li key={item.id}>
						<FeedLink feed={item} />
						{item.description && <p className="text-sm">{item.description}</p>}
					</li>
				))}
			</ul>
		</main>
    </div>
  )
}
