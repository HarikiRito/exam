'use client';

import { Link } from '@remix-run/react';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { cn } from 'app/shared/utils/className';
import { CheckCircleIcon, PlayCircleIcon } from 'lucide-react';
import { CourseVideo } from '../types';

interface CourseVideoListProps {
  readonly videos: CourseVideo[];
  readonly currentVideoId: number;
}

export function CourseVideoList({ videos, currentVideoId }: CourseVideoListProps) {
  return (
    <div className='flex flex-col gap-2'>
      {videos.map((video) => (
        <CourseVideoItem key={video.id} video={video} isActive={video.id === currentVideoId} />
      ))}
    </div>
  );
}

interface CourseVideoItemProps {
  readonly video: CourseVideo;
  readonly isActive: boolean;
}

function CourseVideoItem({ video, isActive }: CourseVideoItemProps) {
  const { title, thumbnail, duration, description, progress } = video;

  // Determine the status icon based on progress
  function renderStatusIcon() {
    if (progress === 100) {
      return <CheckCircleIcon className='h-5 w-5 text-green-500' />;
    } else if (isActive) {
      return <PlayCircleIcon className='h-5 w-5 text-blue-500' />;
    } else {
      return <PlayCircleIcon className='h-5 w-5 text-gray-400' />;
    }
  }

  return (
    <Link to={`/courses/${video.id}`} prefetch='intent'>
      <AppCard.Root
        className={cn('cursor-pointer transition-colors hover:bg-gray-50', isActive ? 'ring-2 ring-blue-500' : '')}>
        <div className='flex gap-4'>
          {/* Thumbnail */}
          <div className='relative h-20 w-24 flex-shrink-0 sm:h-24 sm:w-32'>
            <img src={thumbnail} alt={title} className='h-full w-full rounded-l-lg object-cover' />
            <div className='absolute right-1 bottom-1 rounded bg-black/70 px-1 text-xs text-white'>{duration}</div>
          </div>

          {/* Content */}
          <div className='flex flex-grow flex-col justify-between py-2 pr-2'>
            <div>
              <div className='flex items-start justify-between gap-2'>
                <AppTypography.h4 className='line-clamp-1 text-sm font-semibold'>{title}</AppTypography.h4>
                {renderStatusIcon()}
              </div>
              <AppTypography.p className='mt-1 line-clamp-2 text-xs text-gray-500'>{description}</AppTypography.p>
            </div>

            {/* Progress indicator */}
            {progress > 0 && progress < 100 && (
              <div className='mt-2 h-1.5 w-full rounded-full bg-gray-200'>
                <div className='h-1.5 rounded-full bg-blue-500' style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        </div>
      </AppCard.Root>
    </Link>
  );
}
