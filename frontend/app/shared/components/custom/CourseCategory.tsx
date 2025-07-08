'use client';

import { CourseCard, CourseCardProps } from 'app/shared/components/custom/card/CourseCard';

export interface CourseCategoryProps {
  readonly title: string;
  readonly courses: readonly CourseCardProps[];
  readonly onViewMore?: () => void;
  readonly className?: string;
}

export function CourseCategory({ title, courses, onViewMore, className }: CourseCategoryProps) {
  function handleViewMoreClick() {
    if (onViewMore) {
      onViewMore();
    }
  }

  return (
    <section className={`mb-12 ${className || ''}`}>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>{title}</h2>
        <button onClick={handleViewMoreClick} className='text-blue-500 hover:underline'>
          More
        </button>
      </div>

      {/* Horizontal scrolling container */}
      <div className='relative'>
        {/* Left shadow/gradient for scroll indication */}
        <div className='from-background pointer-events-none absolute top-0 left-0 z-10 h-full w-12 bg-gradient-to-r to-transparent' />

        {/* Horizontally scrollable container */}
        <div className='scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent flex gap-6 overflow-x-auto pr-1 pb-4 pl-1'>
          {courses.map((course) => (
            <div key={course.id} className='min-w-[280px] flex-shrink-0'>
              <CourseCard {...course} />
            </div>
          ))}
        </div>

        {/* Right shadow/gradient for scroll indication */}
        <div className='from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-gradient-to-l to-transparent' />
      </div>
    </section>
  );
}
