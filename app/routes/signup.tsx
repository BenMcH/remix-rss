import { MetaFunction, LinksFunction, LoaderFunction, Form, Link, HeadersFunction, ActionFunction, redirect } from "remix";
import { useLoaderData } from "remix";

import stylesUrl from "~/styles/index.css";
import Recents from '~/components/Recents';
import { db } from '~/utils/db.server';
import { createUser } from "~/utils/user.server";


export let meta: MetaFunction = ({data}) => {
  return {
    title: "RSS Reader"
  };
};

export let links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export let loader: LoaderFunction = async ({request}) => {
  return {}
};

export let action: ActionFunction = async ({request}) => {
	const formData = await request.formData();
	let email = formData.get('email')?.toString();
	let password = formData.get('password')?.toString();


	if (!email || !password) {
		throw new Response('Invalid email or password', {
			status: 400,	
		})
	}

	await createUser(email, password)

	return redirect('/')
};

export default function Index() {
  return (
      <Form method="post" style={{display: 'flex', flexDirection: 'column', alignItems: "center", gap: '1rem'}}>
		<h1>Sign Up</h1>
        <label>{'Email'} <input type="email" name="email"/></label>
        <label>{'Password'} <input type="password" name="password"/></label>
        <div><button type="submit">{'Sign Up'}</button></div>
		<p>&nbsp;</p>
		<p>Already a member? <Link to="/login">Login</Link></p>
      </Form>
  )
}
