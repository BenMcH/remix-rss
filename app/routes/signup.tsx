import { MetaFunction, LinksFunction, LoaderFunction, Form, Link, HeadersFunction, ActionFunction, redirect, useActionData, json } from 'remix';

import stylesUrl from '~/styles/index.css';
import { createUser } from '~/utils/user.server';
import { authenticator } from '~/services/auth.server';


export let meta: MetaFunction = ({data}) => {
  return {
    title: 'RSS Reader'
  };
};

export let links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: stylesUrl }];
};

export let action: ActionFunction = async ({request}) => {
	const newRequest = request.clone()
	const formData = await request.formData();
	let email = formData.get('email')?.toString();
	let password = formData.get('password')?.toString();


	if (!email || !password) {
		return {
			error: 'Invalid email or password',
		}
	}

	try {
		await createUser(email, password)
	} catch (error) {
		return {
			error: 'Failure creating user. Do you already have an account?',
		}
	}

	await authenticator.authenticate('user-pass', newRequest, {
		successRedirect: '/',
		failureRedirect: '/login',
	});
};

export default function Index() {
	const data = useActionData()
	console.log({data})
  return (
      <Form method='post' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
		<h1>Sign Up</h1>
        <label>{'Email'} <input type='email' name='email'/></label>
        <label>{'Password'} <input type='password' name='password'/></label>
        <div><button type='submit'>{'Sign Up'}</button></div>
		<p>{data?.error}</p>
		<p>Already a member? <Link to='/login'>Login</Link></p>
      </Form>
  )
}
