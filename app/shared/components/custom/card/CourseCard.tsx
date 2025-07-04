'use client';

import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppProgress } from 'app/shared/components/ui/progress/AppProgress';
import { cn } from 'app/shared/utils/className';

export interface CourseCardProps {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly progress: number;
  readonly category: string;
  readonly level: 'Beginner' | 'Intermediate' | 'Advanced';
  readonly duration: string;
  readonly onContinue?: (id: number) => void;
  readonly className?: string;
}

export function CourseCard({
  id,
  title,
  description,
  progress,
  category,
  level,
  duration,
  onContinue,
  className,
}: CourseCardProps) {
  function handleContinueClick() {
    if (onContinue) {
      onContinue(id);
    }
  }

  return (
    <AppCard.Root className={cn('flex h-full flex-col', className)}>
      <AppCard.Header>
        <div className='flex items-start justify-between'>
          <AppCard.Title>{title}</AppCard.Title>
          <AppBadge variant={level === 'Beginner' ? 'secondary' : level === 'Intermediate' ? 'default' : 'destructive'}>
            {level}
          </AppBadge>
        </div>
        <AppCard.Description>{description}</AppCard.Description>
      </AppCard.Header>
      <AppCard.Content className='flex-grow'>
        <div className='flex flex-col gap-2'>
          <div className='flex justify-between text-sm'>
            <span>Category: {category}</span>
            <span>Duration: {duration}</span>
          </div>
          <div className='mt-4'>
            <div className='mb-1 flex justify-between'>
              <span className='text-sm font-medium'>Progress</span>
              <span className='text-sm font-medium'>{progress}%</span>
            </div>
            <AppProgress value={progress} className='w-full' />
          </div>
        </div>
      </AppCard.Content>
      <AppCard.Footer className='flex justify-end'>
        <button className='text-primary text-sm font-medium hover:underline' onClick={handleContinueClick}>
          {progress === 0 ? 'Start Course' : 'Continue Learning'}
        </button>
      </AppCard.Footer>
    </AppCard.Root>
  );
}
