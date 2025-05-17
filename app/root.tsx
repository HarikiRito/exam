import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import type { LinksFunction } from '@remix-run/node';

import './tailwind.css';
import { Toaster } from 'app/shared/components/sonner/AppSonner';
import { useNavigate } from '@remix-run/react';
import { useIsAuthenticatedQuery } from 'app/graphql/operations/auth/isAuthenticated.generated';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useEffect } from 'react';

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

export default function App() {
  const navigate = useNavigate();
  const { data, loading } = useIsAuthenticatedQuery();

  useEffect(() => {
    if (!data?.isAuthenticated) {
      navigate(APP_ROUTES.login);
    }
  }, [data?.isAuthenticated, navigate]);

  if (loading) return <div>Loading...</div>;

  return <Outlet />;
}
