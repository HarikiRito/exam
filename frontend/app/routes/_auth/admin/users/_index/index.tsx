import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import { createColumnHelper } from '@tanstack/react-table';
import { PencilIcon, PlusIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useImmer } from 'use-immer';
import { z } from 'zod';

import {
  PaginateUsersDocument,
  PaginateUsersQuery,
  usePaginateUsersQuery,
} from 'app/graphql/operations/user/paginateUsers.query.generated';
import { useGetAllRolesQuery } from 'app/graphql/operations/role/getAllRoles.query.generated';
import { useAdminCreateUserMutation } from 'app/graphql/operations/user/adminCreateUser.mutation.generated';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppDataTable } from 'app/shared/components/ui/table/AppDataTable';
import { AppDialog } from 'app/shared/components/ui/dialog/AppDialog';
import { AppForm } from 'app/shared/components/ui/form/AppForm';
import { AppInput } from 'app/shared/components/ui/input/AppInput';
import { AppSelect } from 'app/shared/components/ui/select/AppSelect';
import { AppSwitch } from 'app/shared/components/ui/switch/AppSwitch';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { useCheckPermission, useUserPermissions, hasPermission } from 'app/shared/hooks/useCheckPermission';
import { PERMISSION_ROUTE } from 'app/shared/constants/permission';
import { UnauthorizedMessage } from 'app/shared/components/custom/Authorized';
import { PermissionEnum } from 'app/graphql/graphqlTypes';
import { capitalize } from 'app/shared/utils/string';
import { apolloService } from 'app/shared/services/apollo.service';

// Type for a single user item from the query
type UserItem = PaginateUsersQuery['paginatedUsers']['items'][0];

// Create Zod schema for user creation validation
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().min(1, 'Role is required'),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

export default function AdminUsers() {
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const isAuthorized = useCheckPermission(PERMISSION_ROUTE.adminUsers);
  const userPermissions = useUserPermissions();

  const [pagination, setPagination] = useImmer({
    page: 1,
    limit: 20,
    search: '',
  });

  // Fetch users data
  const { data } = usePaginateUsersQuery({
    variables: {
      paginationInput: {
        page: pagination.page,
        limit: pagination.limit,
        search: pagination.search,
      },
    },
  });

  function handlePageChange(page: number, pageSize: number) {
    setPagination((draft) => {
      draft.page = page;
      draft.limit = pageSize;
    });
  }

  function handleUserStatusToggle(userId: string, currentStatus: boolean) {
    // TODO: Implement API call to toggle user active status
    toast.info('User status toggle functionality coming soon');
    console.log('Toggle user status:', { userId, currentStatus });
  }

  // Get table data and total items count
  const tableData = data?.paginatedUsers.items || [];
  const totalItems = data?.paginatedUsers.pagination.totalItems || 0;

  // Setup column definitions
  const columnHelper = createColumnHelper<UserItem>();
  const columns = [
    columnHelper.accessor('email', {
      header: 'Email',
      cell: (info) => {
        const email = info.getValue();
        return (
          <div>
            <div className='font-medium'>{email}</div>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('firstName', {
      header: 'Name',
      cell: (info) => {
        const firstName = info.getValue();
        const lastName = info.row.original.lastName;
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        return fullName || '-';
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('roles', {
      header: 'Role',
      cell: (info) => {
        const roles = info.getValue();
        if (!roles || roles.length === 0) return '-';
        // Display the first role name with capitalized first character
        const roleName = roles[0]?.name;
        return roleName ? capitalize(roleName) : '-';
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: (info) => {
        const isActive = info.getValue();
        const userId = info.row.original.id;
        return (
          <div className='flex items-center gap-2'>
            <AppSwitch
              disabled={!hasPermission([PermissionEnum.UserCreate], userPermissions)}
              checked={isActive}
              onCheckedChange={() => handleUserStatusToggle(userId, isActive)}
            />
            <AppBadge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Inactive'}</AppBadge>
          </div>
        );
      },
      enableSorting: true,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => {
        const userId = info.getValue();
        return (
          <div className='flex items-center gap-2'>
            <AppButton
              disabled={!hasPermission([PermissionEnum.UserCreate], userPermissions)}
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminUserEdit(userId))}
              aria-label='Edit user'>
              <PencilIcon className='h-4 w-4' />
            </AppButton>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ];

  if (!isAuthorized) {
    return <UnauthorizedMessage />;
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center justify-between'>
        <AppTypography.h1>Users Management</AppTypography.h1>
        <AppButton onClick={() => setIsCreateDialogOpen(true)} className='flex items-center gap-2'>
          <PlusIcon className='h-4 w-4' />
          Add User
        </AppButton>
      </div>

      <AppDataTable
        columns={columns}
        data={tableData}
        searchPlaceholder='Search users...'
        totalItems={totalItems}
        pageSize={pagination.limit}
        currentPage={pagination.page}
        onPageChange={handlePageChange}
      />

      <CreateUserDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
    </div>
  );
}

function CreateUserDialog({ isOpen, onClose }: { readonly isOpen: boolean; readonly onClose: () => void }) {
  const emailId = useId();
  const passwordId = useId();
  const roleId = useId();

  // Fetch all roles
  const { data: rolesData } = useGetAllRolesQuery();
  const roles = rolesData?.getAllRoles || [];

  const defaultUserRole = roles.find((role) => role.name.toLowerCase() === 'user');

  // Create user mutation
  const [createUser, { loading: isCreating }] = useAdminCreateUserMutation({
    onCompleted: () => {
      toast.success('User created successfully!');
      onClose();
      form.reset();
      apolloService.invalidateQueries([PaginateUsersDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    values: {
      email: '',
      password: 'password123',
      roleId: defaultUserRole?.id || '', // Set default roleId if 'user' role exists
    },
  });

  useEffect(() => {
    if (!defaultUserRole) return;
    form.setValue('roleId', defaultUserRole.id);
  }, [defaultUserRole, form]);

  function onSubmit(data: CreateUserFormData) {
    createUser({
      variables: {
        input: {
          email: data.email,
          password: data.password,
          roleId: data.roleId,
        },
      },
    });
  }

  function handleClose() {
    form.reset();
    onClose();
  }

  return (
    <AppDialog.Root open={isOpen} onOpenChange={handleClose}>
      <AppDialog.Content>
        <AppDialog.Header>
          <AppDialog.Title>Create New User</AppDialog.Title>
          <AppDialog.Description>
            Add a new user to the system. The default password can be changed later.
          </AppDialog.Description>
        </AppDialog.Header>

        <AppForm.Root {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <AppForm.Field
              control={form.control}
              name='email'
              render={({ field }) => (
                <AppForm.Item>
                  <AppForm.Label htmlFor={emailId}>Email</AppForm.Label>
                  <AppForm.Control>
                    <AppInput id={emailId} type='email' placeholder='user@example.com' {...field} />
                  </AppForm.Control>
                  <AppForm.Message />
                </AppForm.Item>
              )}
            />

            <AppForm.Field
              control={form.control}
              name='password'
              render={({ field }) => (
                <AppForm.Item>
                  <AppForm.Label htmlFor={passwordId}>Password</AppForm.Label>
                  <AppForm.Control>
                    <AppInput id={passwordId} placeholder='Enter password' {...field} />
                  </AppForm.Control>
                  <AppForm.Message />
                </AppForm.Item>
              )}
            />

            <AppForm.Field
              control={form.control}
              name='roleId'
              render={({ field }) => (
                <AppForm.Item>
                  <AppForm.Label htmlFor={roleId}>Role</AppForm.Label>
                  <AppSelect.Root onValueChange={field.onChange} defaultValue={field.value}>
                    <AppForm.Control>
                      <AppSelect.Trigger id={roleId}>
                        <AppSelect.Value placeholder='Select a role' />
                      </AppSelect.Trigger>
                    </AppForm.Control>
                    <AppSelect.Content>
                      {roles.map((role) => (
                        <AppSelect.Item key={role.id} value={role.id}>
                          {capitalize(role.name)}
                        </AppSelect.Item>
                      ))}
                    </AppSelect.Content>
                  </AppSelect.Root>
                  <AppForm.Message />
                </AppForm.Item>
              )}
            />

            <AppDialog.Footer>
              <AppButton type='button' variant='outline' onClick={handleClose}>
                Cancel
              </AppButton>
              <AppButton type='submit' disabled={!form.formState.isValid || isCreating}>
                {isCreating ? 'Creating...' : 'Create User'}
              </AppButton>
            </AppDialog.Footer>
          </form>
        </AppForm.Root>
      </AppDialog.Content>
    </AppDialog.Root>
  );
}
