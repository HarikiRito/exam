import { testSessionState, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
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
      questionText += `\n\n*(Select ${question.correctOptionCount} options)*`;
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
        <AppMarkdown className='text-3xl'>{text}</AppMarkdown>
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
      <div className='grid gap-4 md:grid-cols-2'>
        {question.options.map((option, index) => {
          const isSelected = selectedAnswerByQuestionIdMap[question.id]?.has(option.id);
          return (
            <AppCard.Root
              key={index}
              className={cn(
                'cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-sm',
                isSelected && 'border-blue-500 ring-2 ring-blue-500',
              )}
              onClick={() => testSessionState.handleSelectAnswer(question, option.id)}>
              <AppCard.Content className='flex h-full min-h-24 items-center p-4'>
                <AppCheckbox
                  id={`option-${question.id}-${index}`}
                  checked={isSelected}
                  onCheckedChange={() => testSessionState.handleSelectAnswer(question, option.id)}
                  className='mr-3'
                  aria-labelledby={`label-option-${question.id}-${index}`}
                />
                <div className='flex-1 cursor-pointer flex-wrap text-base font-medium'>
                  <AppMarkdown>{option.optionText}</AppMarkdown>
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
