import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useGetAllRolesQuery } from 'app/graphql/operations/role/getAllRoles.query.generated';
import { useAdminEditUserMutation } from 'app/graphql/operations/user/adminEditUser.mutation.generated';
import { AdminEditUserInput } from 'app/graphql/graphqlTypes';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppForm } from 'app/shared/components/ui/form/AppForm';
import { AppInput } from 'app/shared/components/ui/input/AppInput';
import { AppSelect } from 'app/shared/components/ui/select/AppSelect';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { capitalize } from 'app/shared/utils/string';

// Create Zod schema for user edit validation
const editUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().min(1, 'Role is required'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

export default function EditUserPage() {
  const navigate = useNavigate();
  const params = useParams();
  const userId = params.userId;

  // Fetch all roles
  const { data: rolesData } = useGetAllRolesQuery();
  const roles = rolesData?.getAllRoles || [];

  // Edit user mutation
  const [editUser, { loading: isUpdating }] = useAdminEditUserMutation({
    onCompleted: () => {
      toast.success('User updated successfully!');
      navigate(APP_ROUTES.adminUsers);
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  // TODO: Fetch user data based on userId
  // For now, using placeholder data
  const userData = {
    id: userId,
    email: 'user@example.com',
    roleId: '', // TODO: Get from actual user data
    // Don't pre-fill password for security reasons
  };

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: userData.email,
      password: '',
      roleId: userData.roleId,
    },
  });

  function onSubmit(data: EditUserFormData) {
    if (!userId) return;

    const updateInput: AdminEditUserInput = {
      email: data.email,
      roleId: data.roleId,
    };

    // Only include password if it's not empty
    if (data.password.trim()) {
      updateInput.password = data.password;
    }

    editUser({
      variables: {
        id: userId,
        input: updateInput,
      },
    });
  }

  function handleCancel() {
    navigate(APP_ROUTES.adminUsers);
  }

  if (!userId) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>User not found</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminUsers)}>Back to Users</AppButton>
      </div>
    );
  }

  return (
    <div className='p-4 px-8'>
      <div className='mb-6'>
        <AppButton variant='outline' onClick={handleCancel} className='mb-4 flex items-center gap-2'>
          <ArrowLeftIcon className='h-4 w-4' />
          Back to Users
        </AppButton>

        <AppTypography.h1>Edit User</AppTypography.h1>
        <AppTypography.p className='text-muted-foreground'>Update user information and credentials.</AppTypography.p>
      </div>

      <AppCard.Root>
        <AppCard.Header>
          <AppCard.Title>User Information</AppCard.Title>
          <AppCard.Description>
            Edit the user's email and password. Leave password empty to keep current password.
          </AppCard.Description>
        </AppCard.Header>

        <AppCard.Content>
          <AppForm.Root {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <AppForm.Field
                control={form.control}
                name='email'
                render={({ field }) => (
                  <AppForm.Item>
                    <AppForm.Label htmlFor='email'>Email Address</AppForm.Label>
                    <AppForm.Control>
                      <AppInput id='email' type='email' placeholder='user@example.com' {...field} />
                    </AppForm.Control>
                    <AppForm.Description>The user will use this email address to log in.</AppForm.Description>
                    <AppForm.Message />
                  </AppForm.Item>
                )}
              />

              <AppForm.Field
                control={form.control}
                name='password'
                render={({ field }) => (
                  <AppForm.Item>
                    <AppForm.Label htmlFor='password'>New Password</AppForm.Label>
                    <AppForm.Control>
                      <AppInput id='password' type='password' placeholder='Enter new password' {...field} />
                    </AppForm.Control>
                    <AppForm.Description>Leave empty to keep the current password unchanged.</AppForm.Description>
                    <AppForm.Message />
                  </AppForm.Item>
                )}
              />

              <AppForm.Field
                control={form.control}
                name='roleId'
                render={({ field }) => (
                  <AppForm.Item>
                    <AppForm.Label htmlFor='role'>Role</AppForm.Label>
                    <AppSelect.Root onValueChange={field.onChange} defaultValue={field.value}>
                      <AppForm.Control>
                        <AppSelect.Trigger id='role'>
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
                    <AppForm.Description>Select the user's role in the system.</AppForm.Description>
                    <AppForm.Message />
                  </AppForm.Item>
                )}
              />

              <div className='flex items-center gap-4 pt-4'>
                <AppButton type='submit' disabled={!form.formState.isValid || isUpdating}>
                  {isUpdating ? 'Updating...' : 'Update User'}
                </AppButton>

                <AppButton type='button' variant='outline' onClick={handleCancel}>
                  Cancel
                </AppButton>
              </div>
            </form>
          </AppForm.Root>
        </AppCard.Content>
      </AppCard.Root>
    </div>
  );
}
