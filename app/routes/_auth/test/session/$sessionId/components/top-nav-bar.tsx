'use client';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppProgress } from 'app/shared/components/progress/AppProgress';
import { Menu } from 'lucide-react';

interface TopNavBarProps {
  readonly timeLeft: string;
  readonly progressPercentage: number;
  readonly currentQuestionNumber: number;
  readonly totalQuestions: number;
  readonly onToggleOverview: () => void;
  readonly onFinishExam: () => void;
}

export function TopNavBar({
  timeLeft,
  progressPercentage,
  currentQuestionNumber,
  totalQuestions,
  onToggleOverview,
  onFinishExam,
}: TopNavBarProps) {
  return (
    <header className='flex h-[60px] items-center justify-between border-b bg-[#F9FAFB] px-4 md:px-6 lg:px-8'>
      <div className='flex items-center gap-2'>
        <AppButton variant='ghost' size='icon' onClick={onToggleOverview} aria-label='Open questions overview'>
          <Menu className='h-5 w-5' />
          <span className='sr-only md:not-sr-only md:ml-2'>Questions Overview</span>
        </AppButton>
      </div>
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
      <AppButton onClick={onFinishExam} variant='destructive' aria-label='Finish exam'>
        Finish Exam
      </AppButton>
    </header>
  );
}
