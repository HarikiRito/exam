import { PermissionEnum } from 'app/graphql/graphqlTypes';
import { useCheckPermission } from 'app/shared/hooks/useCheckPermission';

interface Props {
  readonly children: React.ReactNode;
  readonly permissions?: PermissionEnum[];
  readonly showUnauthorizedMessage?: boolean;
}

/**
 * This component is used to check if the user has the required permissions to interact with the component.
 */
export function Authorized({ children, permissions, showUnauthorizedMessage = false }: Props) {
  const hasPermissions = useCheckPermission(permissions ?? []);

  if (!hasPermissions) {
    if (showUnauthorizedMessage) {
      return <p className='p-2 text-2xl text-red-500'>You are not authorized to access this page.</p>;
    }
    return null;
  }

  return children;
}
