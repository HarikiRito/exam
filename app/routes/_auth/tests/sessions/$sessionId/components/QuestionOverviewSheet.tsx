'use client';

import { testSessionState, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/button/AppButton';

export function QuestionOverviewSheet() {
  const snapshot = testSessionStore.useStateSnapshot();

  return (
    <div className='flex flex-wrap gap-1'>
      {snapshot.questions.map((question, index) => {
        const isAnswered = snapshot.selectedAnswers[question.id] && snapshot.selectedAnswers[question.id]!.size > 0;
        const isCurrent = index === snapshot.currentQuestionIndex;
        const isFlagged = snapshot.flaggedQuestions.has(question.id);

        return (
          <AppButton
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
