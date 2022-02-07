import { MetaFunction, LoaderFunction, Link, ActionFunction, redirect } from 'remix';
import { useLoaderData } from 'remix';

import { Feed } from '@prisma/client';
import FeedSearch from '~/components/FeedSearch';
import { db } from '~/utils/db.server';
import FeedLink from '~/components/FeedLink';

export interface IFeed {
  url: string
  name: string
}

export let meta: MetaFunction = ({data}) => {
  return {
    title: data.queryParam ? `Search Results: ${data.queryParam}` : 'Search Results',
  };
};

export let loader: LoaderFunction = async ({request}) => {
	let query = request.url.split('?')[1];

	let params = new URLSearchParams(query);

	let queryParam = params.get('query');

	if (!queryParam) {
		return redirect('/');
	}

	let results = await db.feed.findMany({
		where: {

			OR: [{
				title: {
					contains: queryParam,
					mode: 'insensitive'
				},
			},
			{
				description: {
					contains: queryParam,
					mode: 'insensitive'
				},
			}
		]
		}
	});

	return {results, queryParam}
};

export default function Index() {
  let data = useLoaderData<{results: Array<Feed>, queryParam: string}>();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-2">
		<main className="max-w-xl mx-auto">
			<h1>Search Results for {data.queryParam}</h1>
			<ul className="mt-4">
				{data.results.map((item) => ( 
					<li key={item.url}>
						<FeedLink feed={item} />
						{item.description && <p className="text-sm">{item.description}</p>}
					</li>
				))}
			</ul>
		</main>
    </div>
  )
}
