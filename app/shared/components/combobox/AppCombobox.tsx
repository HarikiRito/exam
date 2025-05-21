'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from 'app/shared/utils/className';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCommand } from 'app/shared/components/command/AppCommand';
import { AppPopover } from 'app/shared/components/popover/AppPopover';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface AppComboboxProps {
  readonly options: ComboboxOption[];
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly placeholder?: string;
  readonly emptyMessage?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

export function AppCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select an option...',
  emptyMessage = 'No options found.',
  disabled = false,
  className,
}: AppComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <AppPopover.Root open={open} onOpenChange={setOpen}>
      <AppPopover.Trigger asChild>
        <AppButton
          variant='outline'
          role='combobox'
          aria-expanded={open}
          disabled={disabled}
          className={cn('w-full justify-between', className)}>
          {value ? options.find((option) => option.value === value)?.label : placeholder}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </AppButton>
      </AppPopover.Trigger>
      <AppPopover.Content className='w-full p-0'>
        <AppCommand.Root>
          <AppCommand.Input placeholder={`Search ${placeholder.toLowerCase()}`} />
          <AppCommand.List>
            <AppCommand.Empty>{emptyMessage}</AppCommand.Empty>
            <AppCommand.Group>
              {options.map((option) => (
                <AppCommand.Item
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}>
                  <Check className={cn('mr-2 h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')} />
                  {option.label}
                </AppCommand.Item>
              ))}
            </AppCommand.Group>
          </AppCommand.List>
        </AppCommand.Root>
      </AppPopover.Content>
    </AppPopover.Root>
  );
}
