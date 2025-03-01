'use client';

import { AppCard } from 'app/shared/components/card/AppCard';
import { AppHoverCard } from 'app/shared/components/hover-card/AppHoverCard';
import { cn } from 'app/shared/utils/className';

export interface HorizontalCourseCardProps {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly image: string;
  readonly progress: number;
  readonly chapters: number;
  readonly items: number;
  readonly className?: string;
  readonly onContinue?: (id: number) => void;
}

export function HorizontalCourseCard({
  id,
  title,
  description,
  image,
  progress,
  chapters,
  items,
  className,
  onContinue,
}: HorizontalCourseCardProps) {
  function handleContinueClick() {
    if (onContinue) {
      onContinue(id);
    }
  }

  // Determine level based on id (matching the logic from the original route file)
  const level = id % 3 === 0 ? 'Advanced' : id % 2 === 0 ? 'Intermediate' : 'Beginner';

  return (
    <AppHoverCard.Root>
      <AppHoverCard.Trigger asChild>
        <div>
          <AppCard.Root className={cn('h-full cursor-pointer overflow-hidden', className)}>
            <div className='relative aspect-video overflow-hidden'>
              <img src={image} alt={title} className='h-full w-full object-cover' />
            </div>

            <AppCard.Content className='p-3'>
              <AppCard.Title className='line-clamp-1 text-sm font-medium'>{title}</AppCard.Title>

              {/* Course stats - simplified */}
              <div className='mt-2 flex items-center justify-between text-xs'>
                <div className='flex items-center gap-2'>
                  <span>{chapters} chapters</span>
                  <span>•</span>
                  <span>{items} items</span>
                </div>
                <div>
                  <span>{progress}%</span>
                </div>
              </div>
            </AppCard.Content>
          </AppCard.Root>
        </div>
      </AppHoverCard.Trigger>

      <AppHoverCard.Content className='w-80'>
        <div className='space-y-3'>
          <div className='flex justify-between'>
            <h3 className='font-medium'>{title}</h3>
            <span className='rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800'>
              {progress > 0 ? `${progress}% Complete` : 'New'}
            </span>
          </div>

          <p className='text-muted-foreground text-sm'>{description}</p>

          <div className='border-t pt-3'>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div>
                <span className='text-muted-foreground'>Chapters:</span> {chapters}
              </div>
              <div>
                <span className='text-muted-foreground'>Items:</span> {items}
              </div>
              <div className='col-span-2'>
                <span className='text-muted-foreground'>Level:</span> {level}
              </div>
            </div>
          </div>

          <div className='flex justify-end'>
            <button className='text-sm text-blue-600 hover:underline' onClick={handleContinueClick}>
              {progress === 0 ? 'Start Course' : 'Continue Learning'}
            </button>
          </div>
        </div>
      </AppHoverCard.Content>
    </AppHoverCard.Root>
  );
}
