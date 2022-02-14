export type TFeed = {
	id: string
	description: string
	image?: string
	items: Array<FeedItemPost>
	title: string
	url: string
};

export type FeedItemPost = {
	id: string;
	contentSnippet: string;
	date: string;
	title: string
	link: string;
}

export type TNetworkRssFeed = Omit<TFeed, 'items' | 'id'> & {
	items: Array<Omit<TFeed['items'][number], 'id'> & {content: string}>
}
