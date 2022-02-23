import { useEffect } from "react";
import { LoaderFunction, useLoaderData, MetaFunction, Form, ActionFunction, redirect, json, useFetcher, useTransition, useActionData } from "remix";
import FeedLink from "~/components/FeedLink";
import { authenticator } from "~/services/auth.server";
import { deleteFeed, getAllFeeds } from "~/services/feed.server";

export let meta: MetaFunction = () => {
	return {
		title: 'All RSS Feeds'
	}
}

export let action: ActionFunction = async ({request}) => {
	let user = await authenticator.isAuthenticated(request);

	let isAdmin = user && user.isAdmin;

	if (!isAdmin) {
		return json("Only admins can perform this action");
	}

	let body = await request.formData();

	let deletedFeed = body.get('feedId')?.toString();

	if (!deletedFeed) {
		return json("No feedId provided");
	}

	await deleteFeed({id: deletedFeed})

	return "successfully deleted feed";
}

export let loader: LoaderFunction = async ({request}) => {
	let [data, user] = await Promise.all([getAllFeeds(), authenticator.isAuthenticated(request)]);

	let isAdmin = user && user.isAdmin;

	return {
		data,
		isAdmin
	}
}

type FeedPost = {
	id: string
	url: string
	title: string
}

export default function FeedList() {
	const {data, isAdmin} = useLoaderData<{data: FeedPost[], isAdmin: boolean}>();

	return (
		<main className="max-w-xl mx-auto">
			<h1>All known feeds</h1>
			<table>
				<tbody>
					{data.map((item) => ( 
						<FeedRow key={item.id} feed={item} isAdmin={isAdmin} />
					))}
				</tbody>
			</table>
		</main>
	)	
}


function FeedRow({feed, isAdmin}: {feed: FeedPost, isAdmin: boolean}) {
	let fetcher = useFetcher();

	useEffect(() => {
		if (fetcher.data && !fetcher.data.startsWith('successfully')) {
			alert(fetcher.data)
		}
	}, [fetcher.data])

	if (fetcher.state !== 'idle') {
		return null;
	}

	return (
		<tr>
			{isAdmin && <td>
				<fetcher.Form method="post" action="/feed/all">
					<input type="hidden" name="feedId" value={feed.id} />
					<button type="submit" className="px-4 border bg-slate-200 dark:bg-slate-600 my-2 mr-2">&times;</button>
				</fetcher.Form>
			</td>}
			<td className="flex flex-wrap"><FeedLink feed={feed} linkHint /></td>
		</tr>
	)
};
