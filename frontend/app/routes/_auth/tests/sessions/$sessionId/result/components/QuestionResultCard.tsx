import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppMarkdown } from 'app/shared/components/ui/markdown/AppMarkdown';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { CheckCircle2, XCircle } from 'lucide-react';
import { GetTestSessionResultQuery } from 'app/graphql/operations/testSession/getTestSessionResult.query.generated';
import { cn } from 'app/shared/utils/className';

type QuestionResult = GetTestSessionResultQuery['testSessionResult']['questions'][number];

interface QuestionResultCardProps {
  readonly questionResult: QuestionResult;
  readonly questionNumber: number;
}

export function QuestionResultCard({ questionResult, questionNumber }: QuestionResultCardProps) {
  const { question, isCorrect, selectedOptions } = questionResult;

  return (
    <AppCard.Root className={cn(isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50')}>
      <AppCard.Header className='pb-3'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1'>
            <div className='mb-2 flex items-center gap-2'>
              <span className='text-muted-foreground text-sm font-medium'>Question {questionNumber}</span>
              {isCorrect ? (
                <AppBadge variant='outline' className='border-green-300 bg-green-100 text-green-700'>
                  <CheckCircle2 className='mr-1 h-3 w-3' />
                  Correct
                </AppBadge>
              ) : (
                <AppBadge variant='outline' className='border-red-300 bg-red-100 text-red-700'>
                  <XCircle className='mr-1 h-3 w-3' />
                  Incorrect
                </AppBadge>
              )}
            </div>
            <AppMarkdown className='text-base font-medium'>{question.questionText}</AppMarkdown>
          </div>
        </div>
      </AppCard.Header>

      {!isCorrect && selectedOptions && selectedOptions.length > 0 && (
        <AppCard.Content>
          <AppTypography.muted className='mb-2'>Your answer:</AppTypography.muted>
          <div className='space-y-2'>
            {selectedOptions.map((opt, idx) => (
              <div key={idx} className='flex items-center gap-2 rounded-lg border-2 border-red-400 bg-red-100 p-3'>
                <XCircle className='h-4 w-4 text-red-600' />
                <span className='flex-1 text-red-900'>{opt.optionText}</span>
              </div>
            ))}
          </div>
        </AppCard.Content>
      )}
    </AppCard.Root>
  );
}
