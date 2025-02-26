'use client';

import { AppCard } from 'app/shared/components/card/AppCard';
import { AppLabel } from 'app/shared/components/label/AppLabel';
import { AppRadioGroup } from 'app/shared/components/radio-group/AppRadioGroup';
import { cn } from 'app/shared/utils/className';

export interface MultipleChoiceOption {
  value: string;
  label: string;
}

export interface MultipleChoiceProps {
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

export function MultipleChoice({
  question,
  options,
  defaultValue,
  value,
  onValueChange,
  disabled,
  required,
  className,
  description,
}: MultipleChoiceProps) {
  return (
    <AppCard.Root className={cn('w-full', className)}>
      <AppCard.Header>
        <AppCard.Title>{question}</AppCard.Title>
        {description && <AppCard.Description>{description}</AppCard.Description>}
      </AppCard.Header>
      <AppCard.Content>
        <AppRadioGroup.Root
          data-slot='multiple-choice'
          defaultValue={defaultValue}
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          required={required}>
          {options.map((option) => (
            <div key={option.value} className='flex items-center gap-2'>
              <AppRadioGroup.Item value={option.value} id={option.value}></AppRadioGroup.Item>
              <AppLabel htmlFor={option.value}>{option.label}</AppLabel>
            </div>
          ))}
        </AppRadioGroup.Root>
      </AppCard.Content>
    </AppCard.Root>
  );
}
