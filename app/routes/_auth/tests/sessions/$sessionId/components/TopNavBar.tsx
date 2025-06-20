'use client';

import { testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppProgress } from 'app/shared/components/progress/AppProgress';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';

interface TopNavBarProps {
  readonly timeLeft: string;
  readonly progressPercentage: number;
  readonly totalQuestions: number;
}

export function TopNavBar({ timeLeft, progressPercentage, totalQuestions }: TopNavBarProps) {
  const snapshot = testSessionStore.useStateSnapshot();
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
          Question {snapshot.currentQuestionIndex + 1} of {totalQuestions}
        </div>
      </div>
      <AppButton ref={ref} onClick={snapshot.handleFinishExam} variant='default' aria-label='Finish exam'>
        Finish Exam
      </AppButton>
    </header>
  );
}
