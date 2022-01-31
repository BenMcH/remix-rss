import tailwind from '~/tailwind.css';
import {
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from 'remix';
import type { MetaFunction } from 'remix';

export const meta: MetaFunction = () => {
  return { title: 'New Remix App' };
};

export const links: LinksFunction = () => [
  {rel: "stylesheet", href: tailwind},
]

export default function App() {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <noscript>
          <iframe src='https://www.googletagmanager.com/ns.html?id=GTM-KWPRT5Q' height='0' width='0' style={{display: 'none', visibility:'hidden'}}></iframe>
        </noscript>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}
