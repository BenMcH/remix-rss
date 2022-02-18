import { LoaderFunction } from "remix"
import { rssFanout, rssQueue } from "~/queues/rss.server"

export let loader: LoaderFunction = async ({request}) => {
	let query = request.url.split('?')[1];
	let params = new URLSearchParams(query);

	if (params.get('schedule')) {
		await rssFanout.add('rss-fanout', null)
	}

	let active = await rssQueue.getActive();
	let waiting = await rssQueue.getWaiting()
	let delayed = await rssQueue.getDelayed();

	return {
		active,
		delayed,
		waiting
	}
}

