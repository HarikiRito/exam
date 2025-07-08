import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { ArrowLeftIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppForm } from 'app/shared/components/ui/form/AppForm';
import { AppInput } from 'app/shared/components/ui/input/AppInput';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';

// Create Zod schema for user edit validation
const editUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

export default function EditUserPage() {
  const navigate = useNavigate();
  const params = useParams();
  const userId = params.userId;

  // TODO: Fetch user data based on userId
  // For now, using placeholder data
  const userData = {
    id: userId,
    email: 'user@example.com',
    // Don't pre-fill password for security reasons
  };

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    mode: 'onBlur',
    defaultValues: {
      email: userData.email,
      password: '',
    },
  });

  function onSubmit(data: EditUserFormData) {
    // TODO: Implement API call to update user
    console.log('Update user:', { userId, ...data });
    toast.success('User update functionality coming soon');

    // For now, just navigate back to users list
    navigate(APP_ROUTES.adminUsers);
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

              <div className='flex items-center gap-4 pt-4'>
                <AppButton type='submit' disabled={!form.formState.isValid}>
                  Update User
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
