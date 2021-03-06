import { User } from '@prisma/client';
import { Authenticator } from 'remix-auth';
import { Auth0Strategy } from 'remix-auth-auth0';
import { sessionStorage } from '~/services/session.server';
import { createUser, getUserByEmail } from '~/services/user.server';

export let authenticator = new Authenticator<User>(sessionStorage, {
  sessionErrorKey: 'error',
});

if (!process.env.CLIENT_ID) {
  throw new Error('Missing CLIENT_ID env');
}

if (!process.env.CLIENT_SECRET) {
  throw new Error('Missing CLIENT_SECRET env');
}

let auth0Strategy = new Auth0Strategy(
  {
    callbackURL: `${getHost()}/auth0_callback`,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    domain: "mchone.us.auth0.com",
  },
  async ({ profile }) => {
    let email = profile.emails[0].value;

    return await getUserByEmail(email) || createUser(email);
  }
);

authenticator.use(auth0Strategy);

export function getHost() {
  return process.env.APP_HOST || 'http://localhost:3000';
}
