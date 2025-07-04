'use client';

import { CourseItemFragment } from 'app/graphql/operations/course/course.fragment.generated';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppHoverCard } from 'app/shared/components/ui/hover-card/AppHoverCard';
import { cn } from 'app/shared/utils/className';

export interface HorizontalCourseCardProps extends CourseItemFragment {
  readonly className?: string;
}

export function HorizontalCourseCard({ title, description, className }: HorizontalCourseCardProps) {
  function handleContinueClick() {
    // TODO: Implement continue learning
  }

  const level = 'Advanced';
  const image = 'https://picsum.photos/200/300'; // Mock image URL
  const chapters = 5; // Mock chapters count
  const items = 20; // Mock items count
  const progress = 75; // Mock progress percentage

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
              {'Start Course'}
            </button>
          </div>
        </div>
      </AppHoverCard.Content>
    </AppHoverCard.Root>
  );
}
