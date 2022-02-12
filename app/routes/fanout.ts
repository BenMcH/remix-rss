import { LoaderFunction } from "remix"
import { rssFanout, rssQueue } from "~/queues/rss.server"

export let loader: LoaderFunction = async ({request}) => {
	let query = request.url.split('?')[1];
	let params = new URLSearchParams(query);

	if (params.get('schedule')) {
		await rssFanout.add('rss-fanout', {})
	}

	let fanout = await rssFanout.getDelayed()
	let rss = await rssQueue.getDelayed()

	return {
		rss,
		fanout
	}
}

