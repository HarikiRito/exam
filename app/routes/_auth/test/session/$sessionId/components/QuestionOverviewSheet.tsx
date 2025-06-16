'use client';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppSheet } from 'app/shared/components/sheet/AppSheet';

interface Question {
  id: string;
  questionText: string;
  options: string[];
}

interface QuestionOverviewSheetProps {
  readonly questions: Question[];
  readonly currentQuestionIndex: number;
  readonly selectedAnswers: { [key: string]: number[] };
  readonly flaggedQuestions: Set<string>;
  readonly onJumpToQuestion: (index: number) => void;
}

export function QuestionOverviewSheet({
  questions,
  currentQuestionIndex,
  selectedAnswers,
  flaggedQuestions,
  onJumpToQuestion,
}: QuestionOverviewSheetProps) {
  return (
    <div className='flex flex-wrap gap-1'>
      {questions.map((question, index) => {
        const isAnswered = (selectedAnswers[question.id] || []).length > 0;
        const isCurrent = index === currentQuestionIndex;
        const isFlagged = flaggedQuestions.has(question.id);

        return (
          <AppButton
            key={question.id}
            variant='outline'
            size='icon'
            onClick={() => onJumpToQuestion(index)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Question ${index + 1}, ${isAnswered ? 'answered' : 'unanswered'}${isFlagged ? ', flagged' : ''}`}>
            {index + 1}
          </AppButton>
        );
      })}
    </div>
  );
}
