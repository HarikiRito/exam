'use client';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { cn } from 'app/shared/utils/className';

export interface MultipleChoiceOption {
  value: string;
  label: string;
}

export interface MultipleChoiceGridProps {
  readonly question: string;
  readonly options: MultipleChoiceOption[];
  readonly defaultValue?: string;
  readonly className?: string;
  readonly description?: string;
}

export function MultipleChoiceGrid({ question, options, className, description }: MultipleChoiceGridProps) {
  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Question Card */}
      <AppCard.Root>
        <AppCard.Header>
          <AppCard.Title>{question}</AppCard.Title>
          {description && <AppCard.Description>{description}</AppCard.Description>}
        </AppCard.Header>
      </AppCard.Root>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
        {options.map((option, index) => (
          <AppButton key={index} variant='outline' className='h-30 w-full cursor-pointer' size='sm'>
            {option.label}
          </AppButton>
        ))}
      </div>
    </div>
  );
}
