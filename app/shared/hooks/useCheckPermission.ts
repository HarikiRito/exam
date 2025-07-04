import { PermissionEnum } from 'app/graphql/graphqlTypes';
import { useMeQuery } from 'app/graphql/operations/auth/me.query.generated';

export function useCheckPermission(permissions: PermissionEnum[]) {
  const { data } = useMeQuery({
    fetchPolicy: 'cache-first',
  });
  const userPermissions = new Set(data?.me?.permissions);

  return permissions.every((permission) => userPermissions.has(permission));
}
