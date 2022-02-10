import { rssFanout } from "~/queues/rss.server"

export let loader = async () => {
	await rssFanout.add({}, {
		repeat: {
			cron: '0 * * * *'
		}
	})

	return {}
}
