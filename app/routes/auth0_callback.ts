// app/routes/auth/auth0/callback.tsx
import type { LoaderFunction } from "remix";

import { authenticator } from "~/services/auth.server";

export let loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate("auth0", request, {
    successRedirect: "/",
    failureRedirect: "/login",
  });
};
