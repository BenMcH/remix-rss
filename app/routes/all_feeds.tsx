import { Link } from "react-router-dom";
import { LoaderFunction, useLoaderData } from "remix";
import { db } from "~/utils/db.server";

export let loader: LoaderFunction = async ({request}) => {
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
			<ul className="mt-4">
				{data.map((item) => ( 
					<li key={item.url}><Link to={`/?feed=${item.url}`}>{item.title}</Link></li>
				))}
			</ul>
		</main>
	)	
}