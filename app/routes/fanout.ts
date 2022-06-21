import { json, LoaderFunction } from "@remix-run/node"
import { rssQueue } from "~/queues/rss.server"

export let loader: LoaderFunction = async ({ request }) => {
	let query = request.url.split('?')[1];

	let [active, waiting, delayed] = await Promise.all([
		rssQueue?.getActive(),
		rssQueue?.getWaiting(),
		rssQueue?.getDelayed(),
	])

	return json({
		active,
		delayed,
		waiting
	});
}

