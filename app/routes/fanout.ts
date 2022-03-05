import { json, LoaderFunction } from "remix"
import { rssFanout, rssQueue } from "~/queues/rss.server"

export let loader: LoaderFunction = async ({ request }) => {
	let query = request.url.split('?')[1];
	let params = new URLSearchParams(query);

	if (params.get('schedule')) {
		await rssFanout?.add('rss-fanout', null)
	}

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

