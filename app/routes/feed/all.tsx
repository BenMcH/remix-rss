import { LoaderFunction, useLoaderData, MetaFunction } from "remix";
import FeedLink from "~/components/FeedLink";
import { db } from "~/utils/db.server";

export let meta: MetaFunction = () => {
	return {
		title: 'All RSS Feeds'
	}
}

export let loader: LoaderFunction = async () => {
	let data = await db.feed.findMany({
		select: {
			url: true,
			title: true
		},
		orderBy: {
			title: "asc"
		}
	});

	return {
		data
	}
}

export default function FeedList() {
	const {data} = useLoaderData<{data: {url: string, title: string}[]}>();

	return (
		<main className="max-w-xl mx-auto">
			<h1>All known feeds</h1>
			<ul className="flex flex-col gap-2">
				{data.map((item) => ( 
					<li key={item.url}><FeedLink feed={item} /></li>
				))}
			</ul>
		</main>
	)	
}
