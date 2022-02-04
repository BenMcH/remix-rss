// app/services/session.server.ts
import { createCookieSessionStorage } from 'remix';

// export the whole sessionStorage object
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET || 'secret'],
    secure: process.env.NODE_ENV === 'production',
  },
});

if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error('Missing SESSION_SECRET env');
}

// you can also export the methods individually for your own usage
export let { getSession, commitSession, destroySession } = sessionStorage;
