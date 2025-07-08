import { PermissionEnum } from 'app/graphql/graphqlTypes';
import { useMeQuery } from 'app/graphql/operations/auth/me.query.generated';

export function useCheckPermission(permissions: PermissionEnum[]) {
  const userPermissions = useUserPermissions();

  return hasPermission(permissions, userPermissions);
}

export function useUserPermissions() {
  const { data } = useMeQuery({
    fetchPolicy: 'cache-first',
  });
  return new Set(data?.me?.permissions);
}

export function hasPermission(permissions: PermissionEnum[], userPermissions: Set<PermissionEnum>) {
  return permissions.every((permission) => userPermissions.has(permission));
}
