import { rssFanout } from "~/queues/rss.server"

export let loader = async () => {
	console.log(await rssFanout.getDelayed())

	return {}
}

