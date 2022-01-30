import bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from '~/services/session.server';
import { getUserByEmail } from '~/utils/user.server';

export let authenticator = new Authenticator<User>(sessionStorage, {
  sessionErrorKey: 'error',
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get('email')?.toString();
    let password = form.get('password')?.toString();

	if (!email || !password) {
		return Promise.reject('Email and password are required');
	}

    let user = await getUserByEmail(email);

	if (!user) {
		return Promise.reject('User not found');
	}

	const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

	if (!passwordsMatch) {
		return Promise.reject('Invalid password');
	}

    return user;
  }),
  'user-pass'
);
