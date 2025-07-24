import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import { ApolloError } from '@apollo/client';
import { useRegisterMutation } from 'app/graphql/operations/auth/register.mutation.generated';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppForm } from 'app/shared/components/ui/form/AppForm';
import { AppInput } from 'app/shared/components/ui/input/AppInput';
import { AppLink } from 'app/shared/components/ui/link/AppLink';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { cn } from 'app/shared/utils/className';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// Create Zod schema for register validation
const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-3xl'>
        <RegisterForm />
      </div>
    </div>
  );
}

function RegisterForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();

  const [register, { loading }] = useRegisterMutation({
    onCompleted: () => {
      toast.success('Registration successful! Please log in to continue.');
      setIsSuccess(true);
    },
    onError: (error: ApolloError) => {
      toast.error(`Registration failed: ${error.message}`);
    },
  });

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const formState = form.formState;

  async function onSubmit(formData: RegisterFormData) {
    await register({
      variables: {
        input: {
          email: formData.email,
          password: formData.password,
        },
      },
    });
  }

  function handleBackToLogin() {
    navigate(APP_ROUTES.login);
  }

  const successContent = (
    <div className='p-6 md:p-8'>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col items-center text-center'>
          <h1 className='text-2xl font-bold text-green-600'>Registration Successful!</h1>
          <p className='text-muted-foreground mt-3 text-balance'>
            Your account has been created successfully. You can now log in with your credentials.
          </p>
        </div>

        <AppButton onClick={handleBackToLogin} className='w-full'>
          Back to Login
        </AppButton>
      </div>
    </div>
  );

  const registerContent = (
    <AppForm.Root {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 md:p-8'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center text-center'>
            <h1 className='text-2xl font-bold'>Create your account</h1>
            <p className='text-muted-foreground text-balance'>Enter your details to get started</p>
          </div>

          <AppForm.Field
            control={form.control}
            name='email'
            render={({ field }) => (
              <AppForm.Item>
                <AppForm.Label htmlFor={emailId}>Email</AppForm.Label>
                <AppForm.Control>
                  <AppInput id={emailId} type='email' placeholder='your@email.com' {...field} />
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
                  <AppInput id={passwordId} type='password' placeholder='Enter your password' {...field} />
                </AppForm.Control>
                <AppForm.Message />
              </AppForm.Item>
            )}
          />

          <AppForm.Field
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <AppForm.Item>
                <AppForm.Label htmlFor={confirmPasswordId}>Confirm Password</AppForm.Label>
                <AppForm.Control>
                  <AppInput id={confirmPasswordId} type='password' placeholder='Confirm your password' {...field} />
                </AppForm.Control>
                <AppForm.Message />
              </AppForm.Item>
            )}
          />

          <AppButton
            type='submit'
            className='w-full'
            disabled={!formState.isValid || loading}
            isLoading={loading || formState.isSubmitting}>
            Create Account
          </AppButton>

          <div className='text-center text-sm'>
            Already have an account?{' '}
            <AppLink href={APP_ROUTES.login} variant='default' className='underline underline-offset-4'>
              Sign in
            </AppLink>
          </div>
        </div>
      </form>
    </AppForm.Root>
  );

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <AppCard.Root className='overflow-hidden p-0'>
        <AppCard.Content className='grid p-0 md:grid-cols-2'>
          {!isSuccess ? successContent : registerContent}

          <div className='bg-muted relative hidden md:block'>
            <img
              src='https://picsum.photos/800/800'
              alt='Image'
              className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
            />
          </div>
        </AppCard.Content>
      </AppCard.Root>
    </div>
  );
}
