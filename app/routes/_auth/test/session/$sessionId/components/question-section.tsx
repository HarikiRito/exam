import { AppCard } from 'app/shared/components/card/AppCard';
import { AppRadioGroup } from 'app/shared/components/radio-group/AppRadioGroup';
import { AppLabel } from 'app/shared/components/label/AppLabel';
import { AppButton } from 'app/shared/components/button/AppButton';
import { Flag, FlagOff, AlertCircle } from 'lucide-react';
import { cn } from 'app/shared/utils/className';
import { useState } from 'react';
import { ReportQuestionDialog } from './report-question-dialog';

interface Question {
  id: string;
  questionText: string;
  options: string[];
}

interface QuestionSectionProps {
  readonly question: Question;
  readonly selectedAnswerIndex?: number;
  readonly onSelectAnswer: (questionId: string, optionIndex: number) => void;
  readonly isFlagged: boolean;
  readonly onToggleFlag: (questionId: string) => void;
}

export function QuestionSection({
  question,
  selectedAnswerIndex,
  onSelectAnswer,
  isFlagged,
  onToggleFlag,
}: QuestionSectionProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  function handleReportSubmit(reason: string, details: string) {
    console.info(`Reporting question ${question.id}: Reason - ${reason}, Details - ${details}`);
    // Here you would typically send this report to your backend
    setIsReportDialogOpen(false);
  }

  return (
    <div className='w-full max-w-3xl p-0'>
      {' '}
      {/* Removed Card and adjusted padding */}
      <div className='mb-8 flex items-start justify-between'>
        <h1 className='text-xl leading-relaxed font-bold md:text-2xl lg:text-3xl'>{question.questionText}</h1>
        <div className='ml-4 flex flex-shrink-0 gap-2'>
          <AppButton
            variant='ghost'
            size='icon'
            onClick={() => onToggleFlag(question.id)}
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
            onClick={() => setIsReportDialogOpen(true)}
            aria-label='Report question'>
            <AlertCircle className='h-6 w-6 text-gray-400' />
          </AppButton>
        </div>
      </div>
      <AppRadioGroup.Root
        value={selectedAnswerIndex !== undefined ? String(selectedAnswerIndex) : ''}
        onValueChange={(value) => onSelectAnswer(question.id, Number(value))}
        className='grid gap-4 md:grid-cols-2'>
        {question.options.map((option, index) => (
          <AppCard.Root
            key={index}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:border-blue-500 hover:shadow-sm',
              selectedAnswerIndex === index && 'border-blue-500 ring-2 ring-blue-500',
            )}
            onClick={() => onSelectAnswer(question.id, index)}>
            <AppCard.Content className='flex items-center p-4'>
              <AppRadioGroup.Item
                value={String(index)}
                id={`option-${question.id}-${index}`}
                className='sr-only'
                aria-labelledby={`label-option-${question.id}-${index}`}
              />
              <div
                className={cn(
                  'mr-3 flex h-5 w-5 items-center justify-center rounded-full border-2',
                  selectedAnswerIndex === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300',
                )}>
                {selectedAnswerIndex === index && <div className='h-2.5 w-2.5 rounded-full bg-white' />}
              </div>
              <AppLabel
                htmlFor={`option-${question.id}-${index}`}
                id={`label-option-${question.id}-${index}`}
                className='flex-1 cursor-pointer text-base font-medium'>
                {option}
              </AppLabel>
            </AppCard.Content>
          </AppCard.Root>
        ))}
      </AppRadioGroup.Root>
      <ReportQuestionDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}
