'use client';

import { testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/button/AppButton';

interface Question {
  id: string;
  questionText: string;
  options: string[];
}

interface QuestionOverviewSheetProps {
  readonly questions: Question[];
}

export function QuestionOverviewSheet({ questions }: QuestionOverviewSheetProps) {
  const snapshot = testSessionStore.useStateSnapshot();
  return (
    <div className='flex flex-wrap gap-1'>
      {questions.map((question, index) => {
        const isAnswered = (snapshot.selectedAnswers[question.id] || []).length > 0;
        const isCurrent = index === snapshot.currentQuestionIndex;
        const isFlagged = snapshot.flaggedQuestions.has(question.id);

        return (
          <AppButton
            key={question.id}
            variant='outline'
            size='icon'
            onClick={() => snapshot.handleJumpToQuestion(index)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Question ${index + 1}, ${isAnswered ? 'answered' : 'unanswered'}${isFlagged ? ', flagged' : ''}`}>
            {index + 1}
          </AppButton>
        );
      })}
    </div>
  );
}
