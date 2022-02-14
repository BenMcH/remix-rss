import { MetaFunction, LoaderFunction, redirect } from 'remix';
import { useLoaderData } from 'remix';

import { Feed } from '@prisma/client';
import { db } from '~/utils/db.server';
import FeedLink from '~/components/FeedLink';
import { getFeed } from '~/utils/feed.server';

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

	if (queryParam.startsWith('http')) {
		let url: URL | undefined;
		
		try {
			url = new URL(queryParam);
			let feed = url && await getFeed(queryParam);

			if (url && feed) {
				return redirect(`/feed/${feed.id}`);
			}
		} catch (e) {
			return {
				results: []
			}
		}

	}

	let results = await db.feed.findMany({
		select: {
			id: true,
			url: true,
			title: true,
			description: true
		},
		where: {
			OR: [
				{
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
  let data = useLoaderData<{results: Array<Pick<Feed, 'id' | 'description' | 'title'>>, queryParam: string}>();

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
