'use client';

import { AppSheet } from 'app/shared/components/sheet/AppSheet';
import { AppButton } from 'app/shared/components/button/AppButton';
import { X, Check, Flag } from 'lucide-react';
import { cn } from 'app/shared/utils/className';

interface Question {
  id: string;
  questionText: string;
  options: string[];
}

interface QuestionOverviewSheetProps {
  readonly questions: Question[];
  readonly currentQuestionIndex: number;
  readonly selectedAnswers: { [key: string]: number };
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
    <div className='flex h-full flex-col'>
      <AppSheet.Header className='flex flex-row items-center justify-between border-b p-4'>
        <AppSheet.Title className='text-xl font-bold'>Question Overview</AppSheet.Title>
      </AppSheet.Header>
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7'>
          {questions.map((question, index) => {
            const isAnswered = selectedAnswers[question.id] !== undefined;
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
      </div>
    </div>
  );
}
