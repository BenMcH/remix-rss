import { rssFanout } from "~/queues/rss.server"

export let loader = async () => {
	rssFanout.add({}, {
		repeat: {
			cron: '0 * * * *'
		}
	})

	return {}
}
