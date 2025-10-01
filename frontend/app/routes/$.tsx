import { Link } from '@remix-run/react';

import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';

export default function NotFound() {
  return (
    <div className='container mx-auto flex min-h-[60vh] flex-col items-center justify-center py-12 text-center'>
      <AppTypography.h1 className='mb-2 text-6xl font-bold'>404</AppTypography.h1>
      <AppTypography.h2 className='mb-4'>Page Not Found</AppTypography.h2>
      <AppTypography.p className='text-muted-foreground mb-6'>
        The page you're looking for does not exist or has been removed.
      </AppTypography.p>
      <AppButton asChild>
        <Link to='/'>Back to Home Page</Link>
      </AppButton>
    </div>
  );
}
