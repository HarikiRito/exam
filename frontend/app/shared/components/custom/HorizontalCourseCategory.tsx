'use client';

import {
  HorizontalCourseCard,
  HorizontalCourseCardProps,
} from 'app/shared/components/custom/card/HorizontalCourseCard';
import { cn } from 'app/shared/utils/className';

export interface HorizontalCourseCategoryProps {
  readonly title: string;
  readonly courses: HorizontalCourseCardProps[] | undefined;
  readonly onViewMore?: () => void;
  readonly className?: string;
}

export function HorizontalCourseCategory({
  title,
  courses = [], // Default to empty array if undefined
  onViewMore,
  className,
}: HorizontalCourseCategoryProps) {
  function handleViewMoreClick() {
    if (onViewMore) {
      onViewMore();
    }
  }

  return (
    <section className={cn('mb-12', className)}>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>{title}</h2>
        <button onClick={handleViewMoreClick} className='text-blue-500 hover:underline'>
          More
        </button>
      </div>

      {/* Horizontal scrolling container */}
      <div className='relative'>
        {/* Horizontally scrollable container */}
        <div className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex gap-4 overflow-x-auto pr-1 pb-2 pl-1'>
          {courses.map((course) => (
            <div key={course.id} className='max-w-[200px] min-w-[200px] flex-shrink-0'>
              <HorizontalCourseCard {...course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
