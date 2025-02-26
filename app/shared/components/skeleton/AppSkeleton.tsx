import { cn } from 'app/shared/utils/className';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='skeleton' className={cn('bg-primary/10 animate-pulse rounded-md', className)} {...props} />;
}

export const AppSkeleton = Skeleton;
