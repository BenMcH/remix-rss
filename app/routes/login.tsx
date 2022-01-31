import { Form, ActionFunction, LoaderFunction, Link } from 'remix';
import { authenticator } from '~/services/auth.server';

export let action: ActionFunction = async ({ request }) => {
    await authenticator.authenticate('auth0', request, {
      successRedirect: '/',
      failureRedirect: '/login'
    });
};

export let loader: LoaderFunction = async ({ request }) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  });

  return {}
};

export default function Screen() {
  return (
    <Form method='post' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
      <h1>Login</h1>
      <button>Sign In With Auth0</button>

      <p>Not a member? <Link to='/signup'>Sign up now!</Link></p>
      <p><Link to="/">Home</Link></p>
    </Form>
  );
}
