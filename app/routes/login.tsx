import { Form, ActionFunction, LoaderFunction, Link, json } from 'remix';
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

  return json({});
};

export default function Screen() {
  return (
    <Form method='post' style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'}}>
      <h1>Login</h1>
      <button className="px-4 border bg-slate-200 dark:bg-slate-600">Sign In With Auth0</button>

      <p><Link to="/">Home</Link></p>
    </Form>
  );
}
