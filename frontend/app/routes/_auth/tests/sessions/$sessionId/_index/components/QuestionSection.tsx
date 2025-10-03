import { testSessionState, testSessionStore } from '../state';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCheckbox } from 'app/shared/components/ui/checkbox/AppCheckbox';
import { AppMarkdown } from 'app/shared/components/ui/markdown/AppMarkdown';
import { cn } from 'app/shared/utils/className';
import { AlertCircle, Flag, FlagOff } from 'lucide-react';
import { ReportQuestionDialog } from './ReportQuestionDialog';
import { useMemo } from 'react';

export function QuestionSection() {
  const snapshot = testSessionStore.useStateSnapshot();

  // Get current question and related data from the state
  const question = snapshot.questions[snapshot.currentQuestionIndex];

  const selectedAnswerByQuestionIdMap = snapshot.selectedAnswers;

  // Always call hooks first, before any early returns
  const text = useMemo(() => {
    if (!question) return '';
    let questionText = question.questionText;
    const isMultipleAnswer = question.correctOptionCount > 1;
    if (isMultipleAnswer) {
      questionText += `\n*(Select ${question.correctOptionCount} options)*`;
    }
    return questionText;
  }, [question]);

  if (!question) {
    return null;
  }

  const isFlagged = snapshot.flaggedQuestions.has(question.id);

  return (
    <div className='flex h-full w-full flex-col justify-end p-0'>
      <div className='mb-8 flex items-start justify-between'>
        <AppMarkdown className='text-xl'>{text}</AppMarkdown>
        <div className='ml-4 flex flex-shrink-0 gap-2'>
          <AppButton
            variant='ghost'
            size='icon'
            onClick={() => testSessionState.handleToggleFlag(question.id)}
            aria-pressed={isFlagged}
            aria-label={isFlagged ? 'Unflag question' : 'Flag question'}>
            {isFlagged ? (
              <Flag className='h-6 w-6 fill-yellow-500 text-yellow-500' />
            ) : (
              <FlagOff className='h-6 w-6 text-gray-400' />
            )}
          </AppButton>
          <AppButton
            variant='ghost'
            size='icon'
            onClick={() => {
              testSessionState.isReportQuestionDialogOpen = true;
            }}
            aria-label='Report question'>
            <AlertCircle className='h-6 w-6 text-gray-400' />
          </AppButton>
        </div>
      </div>
      <div className='grid gap-2 md:grid-cols-2'>
        {(question.options ?? []).map((option, index) => {
          const isSelected = selectedAnswerByQuestionIdMap[question.id]?.has(option.id);
          return (
            <div
              key={index}
              className={cn(
                'bg-card hover:bg-accent/50 flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 transition-all hover:border-blue-400',
                isSelected && 'border-blue-500 bg-blue-50 ring-1 ring-blue-500',
              )}
              onClick={() => testSessionState.handleSelectAnswer(question, option.id)}>
              <AppCheckbox
                id={`option-${question.id}-${index}`}
                checked={isSelected}
                className='pointer-events-none'
                aria-labelledby={`label-option-${question.id}-${index}`}
              />
              <div className='flex-1 text-sm leading-snug'>
                <AppMarkdown>{option.optionText}</AppMarkdown>
              </div>
            </div>
          );
        })}
      </div>
      <ReportQuestionDialog />
    </div>
  );
}
