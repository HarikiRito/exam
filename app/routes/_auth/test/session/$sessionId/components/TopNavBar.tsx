'use client';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppProgress } from 'app/shared/components/progress/AppProgress';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { useRef } from 'react';

interface TopNavBarProps {
  readonly timeLeft: string;
  readonly progressPercentage: number;
  readonly currentQuestionNumber: number;
  readonly totalQuestions: number;
  readonly onFinishExam: () => void;
}

export function TopNavBar({
  timeLeft,
  progressPercentage,
  currentQuestionNumber,
  totalQuestions,
  onFinishExam,
}: TopNavBarProps) {
  const [ref, { width }] = useElementSpace<HTMLButtonElement>();
  return (
    <header className='flex h-[60px] items-center justify-between border-b bg-white px-4'>
      <span className='invisible' style={{ width }}></span>
      <div className='flex flex-col items-center gap-1 md:flex-row md:gap-4'>
        <div className='text-lg font-semibold tabular-nums' aria-live='polite' aria-atomic='true'>
          {timeLeft}
        </div>
        <div className='w-24 md:w-48'>
          <AppProgress
            value={progressPercentage}
            className='h-2'
            aria-label={`Exam progress: ${progressPercentage.toFixed(0)}%`}
          />
        </div>
        <div className='text-sm text-gray-600'>
          Question {currentQuestionNumber} of {totalQuestions}
        </div>
      </div>
      <AppButton ref={ref} onClick={onFinishExam} variant='default' aria-label='Finish exam'>
        Finish Exam
      </AppButton>
    </header>
  );
}
