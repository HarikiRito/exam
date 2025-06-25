'use client';

import { testSessionState, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { cn } from 'app/shared/utils/className';

export function QuestionOverviewSheet() {
  const snapshot = testSessionStore.useStateSnapshot();

  return (
    <div className='flex flex-wrap gap-1'>
      {snapshot.questions.map((question, index) => {
        const isAnswered =
          snapshot.selectedAnswers[question.id] &&
          snapshot.selectedAnswers[question.id]!.size === question.correctOptionCount;
        const isCurrent = index === snapshot.currentQuestionIndex;
        const isFlagged = snapshot.flaggedQuestions.has(question.id);

        return (
          <AppButton
            className={cn(
              isCurrent && 'border-blue-500 text-blue-500 hover:text-blue-500',
              isAnswered && 'bg-blue-500 text-white hover:bg-blue-600',
              isFlagged && 'border-transparent bg-yellow-500 text-white hover:bg-yellow-500 hover:text-white',
            )}
            key={question.id}
            variant='outline'
            size='icon'
            onClick={() => testSessionState.handleJumpToQuestion(index)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Question ${index + 1}, ${isAnswered ? 'answered' : 'unanswered'}${isFlagged ? ', flagged' : ''}`}>
            {index + 1}
          </AppButton>
        );
      })}
    </div>
  );
}
