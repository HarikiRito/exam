import { Form, Link } from '@remix-run/react';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppLabel } from 'app/shared/components/label/AppLabel';

export default function LoginPage() {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: Implement authentication logic
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-white px-4 py-12'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-black'>Login</h2>
        </div>
        <Form method='post' onSubmit={handleSubmit} className='space-y-6' aria-label='Login Form'>
          <div className='space-y-4'>
            <div>
              <AppLabel htmlFor='username' className='mb-2 block text-sm'>
                Username
              </AppLabel>
              <AppInput
                id='username'
                name='username'
                type='text'
                required
                placeholder='Enter username'
                aria-required='true'
              />
            </div>
            <div>
              <AppLabel htmlFor='password' className='mb-2 block text-sm'>
                Password
              </AppLabel>
              <AppInput
                id='password'
                name='password'
                type='password'
                required
                placeholder='Password'
                aria-required='true'
              />
            </div>
          </div>

          <AppButton type='submit' variant='default'>
            Sign in
          </AppButton>

          <div className='text-center text-sm'>
            Don't have an account?{' '}
            <Link to='/signup' className='text-blue-500 hover:underline'>
              Sign Up
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
