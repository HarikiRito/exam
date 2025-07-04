import type { MetaFunction } from '@remix-run/node';
import { Navigate } from 'react-router-dom';
import { APP_ROUTES } from 'app/shared/constants/routes';

export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App' }, { name: 'description', content: 'Welcome to Remix!' }];
};

export default function Page() {
  return <Navigate to={APP_ROUTES.testSessions} />;
}
