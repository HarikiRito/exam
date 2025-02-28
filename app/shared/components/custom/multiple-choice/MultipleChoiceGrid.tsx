'use client';

import * as React from 'react';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppLabel } from 'app/shared/components/label/AppLabel';
import { AppRadioGroup } from 'app/shared/components/radio-group/AppRadioGroup';
import { cn } from 'app/shared/utils/className';
import { AppButton } from 'app/shared/components/button/AppButton';

export interface MultipleChoiceOption {
  value: string;
  label: string;
}

export interface MultipleChoiceGridProps {
  readonly question: string;
  readonly options: MultipleChoiceOption[];
  readonly defaultValue?: string;
  readonly value?: string;
  readonly onValueChange?: (value: string) => void;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly className?: string;
  readonly description?: string;
}

export function MultipleChoiceGrid({
  question,
  options,
  defaultValue,
  value,
  onValueChange,
  disabled,
  required,
  className,
  description,
}: MultipleChoiceGridProps) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);

  function handleValueChange(value: string) {
    setSelectedValue(value);
    if (onValueChange) {
      onValueChange(value);
    }
  }

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
        {options.map((option) => (
          <AppButton variant='outline' className='h-30 w-full cursor-pointer' size='sm'>
            {option.label}
          </AppButton>
        ))}
      </div>
    </div>
  );
}
