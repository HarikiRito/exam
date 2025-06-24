'use client';

import { testSessionActions, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppProgress } from 'app/shared/components/progress/AppProgress';
import { useElementSpace } from 'app/shared/hooks/useElementSpace';
import { useMemo } from 'react';

const state = testSessionStore.proxyState;

export function TopNavBar() {
  const snapshot = testSessionStore.useStateSnapshot();
  const [ref, { width }] = useElementSpace<HTMLButtonElement>();

  const formattedTimeLeft = useMemo(() => {
    const minutes = Math.floor(state.timeLeft / 60000);
    const seconds = Math.floor((state.timeLeft % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const progressPercentage = useMemo(() => {
    return (snapshot.currentQuestionIndex / snapshot.questions.length) * 100;
  }, [snapshot.currentQuestionIndex, snapshot.questions.length]);

  return (
    <header className='flex h-[60px] items-center justify-between border-b bg-white px-4'>
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
      <AppButton ref={ref} onClick={testSessionActions.handleFinishExam} variant='default' aria-label='Finish exam'>
        Finish Exam
      </AppButton>
    </header>
  );
}
