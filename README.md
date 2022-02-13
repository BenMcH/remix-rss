# Remix RSS

This is my own personal RSS reader with accounts, background fetching of new posts, and a few other features, built on top of [Remix](https://github.com/remix-run/remix)! It is my attempt to get back the feel of Google Reader.

## Technologies

 - [Remix](https://remix.run)
 - [Remix Auth](https://github.com/sergiodxa/remix-auth)
 - [Auth0](https://auth0.com)
 - [Prisma ORM](https://prisma.io)
 - [TailwindCSS](https://tailwindcss.com)
 - [BullMQ](https://github.com/taskforcesh/bullmq)

Deployed with Kubernetes on [K3s](https://k3s.io)!

## Development

Running redis locally will allow you to test the background fetching of new posts, but is not requuired.

If you are going to use the background fetching, you will need to set the `REDIS_SERVICE_HOST` environment variable to the host of the redis service (Probably `localhost`) and set `REDIS_PASSWORD` to the password used for authentication on the running redis node.

Locally, you will need to create a .env file in the repo with the following content:

```
DATABASE_URL="Enter your postgres connection string here"
CLIENT_ID="Enter an auth0 client id here"
CLIENT_SECRET="Enter an auth0 client secret here"
```

Finally, simply `npm install` and `npm run dev` to start the development server and begin reading!
