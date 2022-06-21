import { LoaderFunction } from '@remix-run/node';
import { authenticator, getHost } from '~/services/auth.server';

export let loader: LoaderFunction = async ({ request }) => {
	let params = new URLSearchParams();
	params.append('returnTo', getHost());
	params.append('client_id', process.env.CLIENT_ID!);

	await authenticator.logout(request, { redirectTo: `https://mchone.us.auth0.com/v2/logout?${params.toString()}` });
}
