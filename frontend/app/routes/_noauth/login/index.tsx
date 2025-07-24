import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import { IsAuthenticatedDocument } from 'app/graphql/operations/auth/isAuthenticated.query.generated';
import { useLoginMutation, type LoginMutation } from 'app/graphql/operations/auth/login.mutation.generated';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppForm } from 'app/shared/components/ui/form/AppForm';
import { AppInput } from 'app/shared/components/ui/input/AppInput';
import { AppLink } from 'app/shared/components/ui/link/AppLink';
import { clientEnvironment } from 'app/shared/constants/environment';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { CookieKey, CookieService } from 'app/shared/services/cookie.service';
import client from 'app/shared/utils/apollo';
import { cn } from 'app/shared/utils/className';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
// Create Zod schema for login validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <div className='bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-3xl'>
        <LoginForm />
      </div>
    </div>
  );
}

function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const navigate = useNavigate();
  const [login, { loading }] = useLoginMutation({
    onCompleted: (data: LoginMutation) => {
      const loginData = data.login;
      if (!loginData) return;
      const { accessToken, refreshToken } = loginData;
      CookieService.setValue(CookieKey.AccessToken, accessToken);
      CookieService.setValue(CookieKey.RefreshToken, refreshToken);

      toast.success('Login successful!');

      client.writeQuery({
        query: IsAuthenticatedDocument,
        data: {
          isAuthenticated: true,
        },
      });

      navigate(APP_ROUTES.testSessions);
    },
    onError: () => {
      toast.error('Login failed. Please try again.');
    },
  });

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: clientEnvironment.isDev
      ? {
          email: 'owner@example.com',
          password: 'password123',
        }
      : undefined,
  });

  const formState = form.formState;

  async function onSubmit(formData: LoginFormData) {
    await login({
      variables: {
        input: {
          email: formData.email,
          password: formData.password,
        },
      },
    });
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <AppCard.Root className='overflow-hidden p-0'>
        <AppCard.Content className='grid p-0 md:grid-cols-2'>
          <AppForm.Root {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='p-6 md:p-8'>
              <div className='flex flex-col gap-6'>
                <div className='flex flex-col items-center text-center'>
                  <h1 className='text-2xl font-bold'>Welcome back</h1>
                  <p className='text-muted-foreground text-balance'>Login to your account</p>
                </div>

                <AppForm.Field
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <AppForm.Item>
                      <AppForm.Label htmlFor='email'>Email</AppForm.Label>
                      <AppForm.Control>
                        <AppInput id='email' type='email' placeholder='your@email.com' {...field} />
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
                      <AppForm.Label htmlFor='password'>Password</AppForm.Label>
                      <AppForm.Control>
                        <AppInput id='password' type='password' placeholder='Enter your password' {...field} />
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
                  Login
                </AppButton>

                <div className='text-center text-sm'>
                  Don&apos;t have an account?{' '}
                  <AppLink href={APP_ROUTES.register} variant='default' className='underline underline-offset-4'>
                    Sign up
                  </AppLink>
                </div>
              </div>
            </form>
          </AppForm.Root>

          <div className='bg-muted relative hidden md:block'>
            <img
              src='https://picsum.photos/800/800'
              alt='Image'
              className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
            />
          </div>
        </AppCard.Content>
      </AppCard.Root>

      <div className='text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4'>
        By clicking continue, you agree to our <AppLink href='#'>Terms of Service</AppLink> and{' '}
        <AppLink href='#'>Privacy Policy</AppLink>.
      </div>
    </div>
  );
}
