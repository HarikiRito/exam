import { PermissionEnum } from 'app/graphql/graphqlTypes';
import { useCheckPermission } from 'app/shared/hooks/useCheckPermission';

interface Props {
  readonly children: React.ReactNode;
  readonly permissions: PermissionEnum[];
}

/**
 * This component is used to check if the user has the required permissions to interact with the component.
 */
export function Authorized({ children, permissions }: Props) {
  const hasPermissions = useCheckPermission(permissions);

  if (!hasPermissions) {
    return null;
  }

  return children;
}
