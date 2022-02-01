import { LoaderFunction } from 'remix';
import { authenticator, getHost } from '~/services/auth.server';

export let loader: LoaderFunction = async ({request}) => {
	await authenticator.logout(request, { redirectTo: `https://mchone.us.auth0.com/v2/logout?client_id=${process.env.CLIENT_ID}&returnTo=${getHost()}` });
}
