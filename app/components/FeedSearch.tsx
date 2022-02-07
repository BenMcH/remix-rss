import { useEffect, useRef } from "react";
import { Form, Link, useTransition } from "remix";

export default function FeedSearch() {
	let transition = useTransition()

	let submitting = transition.state !== 'idle' && transition.submission?.formData.get('feed')?.toString() !== undefined

	let ref = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (transition.state === 'idle') {
			ref.current?.reset();
			ref.current?.querySelector<HTMLInputElement>('input[name=feed]')?.blur()
		}	
	}, [transition.state])

	return (
      <Form method="post" action="/?index" className="flex flex-row gap-4" ref={ref}>
        <label>{'Search:'} <input type="text" name="feed" className="border" /></label>
        <button type="submit" className="px-4 border bg-slate-200 dark:bg-slate-600" disabled={submitting}>{submitting ? 'Loading' : 'Go'}</button>
        <Link to="/all_feeds">{'All Feeds'}</Link>
      </Form>
	);
}
