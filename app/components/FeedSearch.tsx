import { Feed } from "@prisma/client";
import { useEffect, useRef } from "react";
import { Form, Link, useFetcher, useTransition } from "remix";

export default function FeedSearch() {
	let transition = useTransition()

	let submitting = transition.state !== 'idle' && transition.submission?.formData.get('feed')?.toString() !== undefined

	let ref = useRef<HTMLFormElement>(null);
	let inputRef = useRef<HTMLInputElement>(null);

	let searchFetcher = useFetcher<{results: Array<Pick<Feed, 'description' | 'url' | 'title'>>}>();

	useEffect(() => {
		if (transition.state === 'idle') {
			ref.current?.reset();
			inputRef.current?.blur()
		}	
	}, [transition.state])

	return (
      <Form method="post" action="/?index" className="flex flex-row gap-4" ref={ref}>
        <label>
			{'Search:'} <input type="text" name="feed" className="border" list="search-list" onInput={(event) => {
				if (ref.current){ 
					let formData = new FormData(ref.current)
					let feed = formData.get('feed')?.toString()

					if (feed) {
						searchFetcher.load('/feed/search?query=' + formData.get('feed')?.toString())
					}
				}
			}} />
			<datalist id="search-list">
				{searchFetcher.data?.results?.slice(0, 10)?.map((item) => (
					<option key={item.url} value={item.title} />
				))}
			</datalist>
		</label>
        <span className="flex flex-row items-end"><button type="submit" className="px-4 border bg-slate-200 dark:bg-slate-600 py-1" disabled={submitting}>{submitting ? 'Loading' : 'Go'}</button></span>
        <Link to="/feed/all">{'All Feeds'}</Link>
      </Form>
	);
}
