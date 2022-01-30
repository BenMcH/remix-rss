// app/services/auth.server.ts
import bcrypt from 'bcrypt';
import { User } from "@prisma/client";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/services/session.server";
import { getUserByEmail } from "~/utils/user.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export let authenticator = new Authenticator<User>(sessionStorage, {
  sessionErrorKey: "error",
});

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get("email")?.toString();
    let password = form.get("password")?.toString();

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

    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    return user;
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  "user-pass"
);
