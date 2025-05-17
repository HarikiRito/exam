import { Navigate, Outlet } from '@remix-run/react';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useIsAuthenticatedQuery } from 'app/graphql/operations/auth/isAuthenticated.generated';

export default function Page() {
  const { data, loading } = useIsAuthenticatedQuery();

  if (loading) return <div>Loading...</div>;

  if (data && data.isAuthenticated) {
    return <Navigate to={APP_ROUTES.dashboard} />;
  }
  return <Outlet />;
}
