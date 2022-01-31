import { Form, ActionFunction, LoaderFunction, useActionData, Link } from 'remix';
import { AuthorizationError } from 'remix-auth';
import { authenticator } from '~/services/auth.server';

export let action: ActionFunction = async ({ request }) => {
  try {
	const user = await authenticator.authenticate('user-pass', request, {
		successRedirect: '/',
		throwOnError: true,
	});
  } catch (error) {
	  if (error instanceof AuthorizationError) {
		  return {
			  error: 'Invalid email or password',
		  }
	  }

	  throw error;
  }
};

export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });

  return {}
};

export default function Screen() {
	let data = useActionData()
	console.log({data})
  return (
    <Form method='post' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
	  <h1>Login</h1>
      <label>Email: <input type='email' name='email' required /></label>
      <label>Password: <input
        type='password'
        name='password'
        autoComplete='current-password'
        required
      /></label>
      <button>Sign In</button>
	  <p>{data?.error}</p>

	  <p>Not a member? <Link to='/signup'>Sign up now!</Link></p>
	  <p><Link to="/">Home</Link></p>
    </Form>
  );
}
