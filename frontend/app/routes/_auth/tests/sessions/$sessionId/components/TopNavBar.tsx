'use client';

import { testSessionState, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppProgress } from 'app/shared/components/ui/progress/AppProgress';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { useEffect, useMemo } from 'react';

export function TopNavBar() {
  const snapshot = testSessionStore.useStateSnapshot();
  const [ref, { width }] = useElementSpace<HTMLButtonElement>();

  const formattedTimeLeft = useMemo(() => {
    const minutes = Math.floor(snapshot.timeLeft / 60);
    const seconds = snapshot.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [snapshot.timeLeft]);

  const progressPercentage = (snapshot.totalAnsweredQuestions / snapshot.totalQuestions) * 100;

  useEffect(() => {
    testSessionState.startTimer();

    return () => {
      testSessionState.stopTimer();
    };
  }, []);

  return (
    <header className='flex h-[60px] items-center justify-between border-b bg-white px-4 sm:px-6 lg:px-8'>
      <span className='invisible' style={{ width }}></span>
      <div className='flex flex-col items-center gap-1 md:flex-row md:gap-4'>
        <div className='text-lg font-semibold tabular-nums' aria-live='polite' aria-atomic='true'>
          {formattedTimeLeft}
        </div>
        <div className='w-24 md:w-48'>
          <AppProgress
            value={progressPercentage}
            className='h-2'
            aria-label={`Exam progress: ${progressPercentage.toFixed(0)}%`}
          />
        </div>
        <div className='text-sm text-gray-600'>
          Question {snapshot.currentQuestionIndex + 1} of {snapshot.questions.length}
        </div>
      </div>
      <AppButton
        ref={ref}
        onClick={() => (testSessionState.isFinishExamDialogOpen = true)}
        variant='default'
        aria-label='Finish exam'>
        Finish Exam
      </AppButton>
    </header>
  );
}
