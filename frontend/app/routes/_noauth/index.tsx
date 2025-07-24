import { Navigate, Outlet, useLocation } from '@remix-run/react';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useIsAuthenticatedQuery } from 'app/graphql/operations/auth/isAuthenticated.query.generated';

const excludeRoutes = [APP_ROUTES.about];
export default function Page() {
  const { data, loading } = useIsAuthenticatedQuery();
  const pathname = useLocation().pathname;

  if (loading) return <div>Loading...</div>;

  if (data && data.isAuthenticated && !excludeRoutes.includes(pathname)) {
    return <Navigate to={APP_ROUTES.testSessions} />;
  }
  return <Outlet />;
}
