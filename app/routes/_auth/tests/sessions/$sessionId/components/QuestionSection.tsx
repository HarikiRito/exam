import { AppCard } from 'app/shared/components/card/AppCard';
import { AppLabel } from 'app/shared/components/label/AppLabel';
import { AppButton } from 'app/shared/components/button/AppButton';
import { Flag, FlagOff, AlertCircle } from 'lucide-react';
import { cn } from 'app/shared/utils/className';
import { useState } from 'react';
import { ReportQuestionDialog } from './ReportQuestionDialog';
import { AppMarkdown } from 'app/shared/components/markdown/AppMarkdown';
import { AppCheckbox } from 'app/shared/components/checkbox/AppCheckbox';
import { testSessionState, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';

interface Question {
  id: string;
  questionText: string;
  options: string[];
}

interface QuestionSectionProps {
  readonly question: Question;
  readonly selectedAnswerIndexes?: number[];
  readonly isFlagged: boolean;
}

export function QuestionSection({ question, selectedAnswerIndexes = [], isFlagged }: QuestionSectionProps) {
  const snapshot = testSessionStore.useStateSnapshot();

  return (
    <div className='flex h-full w-full flex-col justify-end p-0'>
      {' '}
      {/* Removed Card and adjusted padding */}
      <div className='mb-8 flex items-start justify-between'>
        <AppMarkdown className='text-3xl font-bold'>{question.questionText}</AppMarkdown>
        <div className='ml-4 flex flex-shrink-0 gap-2'>
          <AppButton
            variant='ghost'
            size='icon'
            onClick={() => snapshot.handleToggleFlag(question.id)}
            aria-pressed={isFlagged}
            aria-label={isFlagged ? 'Unflag question' : 'Flag question'}>
            {isFlagged ? (
              <Flag className='h-6 w-6 fill-blue-500 text-blue-500' />
            ) : (
              <FlagOff className='h-6 w-6 text-gray-400' />
            )}
          </AppButton>
          <AppButton
            variant='ghost'
            size='icon'
            onClick={() => (testSessionState.isReportQuestionDialogOpen = true)}
            aria-label='Report question'>
            <AlertCircle className='h-6 w-6 text-gray-400' />
          </AppButton>
        </div>
      </div>
      <div className='grid gap-4 md:grid-cols-2'>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswerIndexes.includes(index);
          return (
            <AppCard.Root
              key={index}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-sm',
                isSelected && 'border-blue-500 ring-2 ring-blue-500',
              )}
              onClick={() => snapshot.handleSelectAnswer(question.id, index, !isSelected)}>
              <AppCard.Content className='flex h-full min-h-24 items-center p-4'>
                <AppCheckbox
                  id={`option-${question.id}-${index}`}
                  checked={isSelected}
                  onCheckedChange={(checked: boolean) => snapshot.handleSelectAnswer(question.id, index, checked)}
                  className='mr-3'
                  aria-labelledby={`label-option-${question.id}-${index}`}
                />
                <div className='flex-1 cursor-pointer flex-wrap text-base font-medium'>
                  <AppMarkdown>{option}</AppMarkdown>
                </div>
              </AppCard.Content>
            </AppCard.Root>
          );
        })}
      </div>
      <ReportQuestionDialog />
    </div>
  );
}
