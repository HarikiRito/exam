'use client';

import { AppCard } from 'app/shared/components/card/AppCard';
import { AppProgress } from 'app/shared/components/progress/AppProgress';
import { cn } from 'app/shared/utils/className';

export interface ProgressItemProps {
  readonly label: string;
  readonly current: number;
  readonly total: number;
  readonly value: number;
}

export interface LearningSummaryCardProps {
  readonly coursesProgress: ProgressItemProps;
  readonly assignmentsProgress: ProgressItemProps;
  readonly quizzesProgress: ProgressItemProps;
  readonly weeklyStudyGoal: {
    readonly current: number;
    readonly total: number;
  };
  readonly className?: string;
}

export function LearningSummaryCard({
  coursesProgress,
  assignmentsProgress,
  quizzesProgress,
  weeklyStudyGoal,
  className,
}: LearningSummaryCardProps) {
  return (
    <AppCard.Root className={cn(className)}>
      <AppCard.Header>
        <AppCard.Title>Learning Summary</AppCard.Title>
        <AppCard.Description>Your overall learning progress</AppCard.Description>
      </AppCard.Header>
      <AppCard.Content>
        <div className='space-y-4'>
          <div>
            <div className='mb-1 flex justify-between'>
              <span className='text-sm font-medium'>{coursesProgress.label}</span>
              <span className='text-sm font-medium'>
                {coursesProgress.current}/{coursesProgress.total}
              </span>
            </div>
            <AppProgress value={coursesProgress.value} className='w-full' />
          </div>
          <div>
            <div className='mb-1 flex justify-between'>
              <span className='text-sm font-medium'>{assignmentsProgress.label}</span>
              <span className='text-sm font-medium'>
                {assignmentsProgress.current}/{assignmentsProgress.total}
              </span>
            </div>
            <AppProgress value={assignmentsProgress.value} className='w-full' />
          </div>
          <div>
            <div className='mb-1 flex justify-between'>
              <span className='text-sm font-medium'>{quizzesProgress.label}</span>
              <span className='text-sm font-medium'>
                {quizzesProgress.current}/{quizzesProgress.total}
              </span>
            </div>
            <AppProgress value={quizzesProgress.value} className='w-full' />
          </div>
        </div>
      </AppCard.Content>
      <AppCard.Footer>
        <div className='flex w-full justify-between'>
          <span className='text-sm'>Weekly study goal: {weeklyStudyGoal.total} hours</span>
          <span className='text-sm font-medium'>
            {weeklyStudyGoal.current}/{weeklyStudyGoal.total} hours
          </span>
        </div>
      </AppCard.Footer>
    </AppCard.Root>
  );
}
