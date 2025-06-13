import { Check, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Control, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCommand } from 'app/shared/components/command/AppCommand';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTooltip } from 'app/shared/components/tooltip/AppTooltip';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { questionFormState } from '../store';

import { cn } from 'app/shared/utils/className';
import { QuestionFormData } from './QuestionEditAndCreatePage';

interface QuestionOptionsManagerProps {
  readonly control: Control<QuestionFormData>;
}

export function QuestionOptionsManager({ control }: QuestionOptionsManagerProps) {
  const state = questionFormState.useStateSnapshot();

  const { fields, append, remove, update, replace } = useFieldArray({
    control,
    name: 'options',
  });

  const [newOptionText, setNewOptionText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  function handleAddOption() {
    const trimmedNewOptionText = newOptionText.trim();

    if (trimmedNewOptionText) {
      const isDuplicate = fields.some(
        (field) => field.optionText.trim().toLowerCase() === trimmedNewOptionText.toLowerCase(),
      );

      if (isDuplicate) {
        toast.error(`Option "${trimmedNewOptionText}" already exists.`);
        return;
      }

      const option = {
        optionText: trimmedNewOptionText,
        isCorrect: false,
      };
      append(option);
      setNewOptionText('');
    }
  }

  function handleRemoveOption(index: number) {
    remove(index);
  }

  function handleToggleCorrect(index: number) {
    // Don't toggle if we're editing this item
    if (editingIndex === index) return;

    const currentOption = fields[index];
    if (!currentOption) return;

    const newIsCorrect = !currentOption.isCorrect;

    if (!state.allowMultipleCorrect && newIsCorrect) {
      for (const [optionIndex, field] of fields.entries()) {
        if (optionIndex !== index) {
          update(optionIndex, {
            optionText: field.optionText,
            isCorrect: false,
          });
        }
      }
    }

    update(index, {
      optionText: currentOption.optionText,
      isCorrect: newIsCorrect,
    });
  }

  function handleStartEdit(index: number) {
    const currentOption = fields[index];
    if (!currentOption) return;

    setEditingIndex(index);
    setEditingText(currentOption.optionText);
  }

  function handleSaveEdit(index: number) {
    const trimmedText = editingText.trim();

    if (!trimmedText) {
      toast.error('Option text cannot be empty.');
      return;
    }

    // Check for duplicates (excluding the current item)
    const isDuplicate = fields.some(
      (field, fieldIndex) =>
        fieldIndex !== index && field.optionText.trim().toLowerCase() === trimmedText.toLowerCase(),
    );

    if (isDuplicate) {
      toast.error(`Option "${trimmedText}" already exists.`);
      return;
    }

    const currentOption = fields[index];
    if (!currentOption) return;

    update(index, {
      optionText: trimmedText,
      isCorrect: currentOption.isCorrect,
    });

    setEditingIndex(null);
    setEditingText('');
  }

  function handleCancelEdit() {
    setEditingIndex(null);
    setEditingText('');
  }

  function handleEditKeyDown(event: React.KeyboardEvent, index: number) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSaveEdit(index);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancelEdit();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddOption();
    }
  }

  useEffect(() => {
    const isAllowMultipleCorrect = state.allowMultipleCorrect;

    const correctOptions = fields.filter((field) => field.isCorrect);
    if (!isAllowMultipleCorrect && correctOptions.length > 1) {
      const firstCorrectOption = correctOptions[0];
      const newOptions = fields.map((field) => {
        if (field.isCorrect && field.optionText !== firstCorrectOption?.optionText) {
          return { ...field, isCorrect: false };
        }
        return field;
      });
      replace(newOptions);
    }
  }, [state.allowMultipleCorrect, fields, replace]);

  return (
    <AppForm.Field
      control={control}
      name='options'
      render={() => (
        <AppForm.Item>
          <AppForm.Label>Answer Options</AppForm.Label>
          <div className='space-y-4'>
            <div className='flex gap-2'>
              <AppInput
                placeholder='Enter new option text'
                value={newOptionText}
                onChange={(e) => setNewOptionText(e.target.value)}
                onKeyDown={handleKeyDown}
                className='flex-1'
              />
              <AppButton type='button' onClick={handleAddOption} size='sm' disabled={!newOptionText.trim()}>
                <PlusIcon className='h-4 w-4' />
                Add Option
              </AppButton>
            </div>

            {fields.length > 0 ? (
              <div className='rounded-md border'>
                <AppCommand.Root>
                  <AppCommand.List className='max-h-full'>
                    {fields.map((field, index) => (
                      <AppCommand.Item
                        key={field.id}
                        className={cn(
                          'hover:bg-accent pointer-events-auto flex cursor-pointer items-center justify-between p-3',
                          field.isCorrect && 'bg-green-50',
                          editingIndex === index && 'bg-blue-50',
                        )}
                        onSelect={() => handleToggleCorrect(index)}>
                        <div className='flex flex-1 items-center gap-2'>
                          {editingIndex === index ? (
                            <AppInput
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              onKeyDown={(e) => handleEditKeyDown(e, index)}
                              onBlur={() => handleSaveEdit(index)}
                              className='flex-1'
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className='flex-1'>{field.optionText}</span>
                          )}
                          {field.isCorrect && <Check className='h-4 w-4 text-green-600' />}
                        </div>
                        <div className='flex items-center gap-1'>
                          {editingIndex === index ? (
                            <>
                              <AppButton
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEdit(index);
                                }}
                                className='h-8 w-8 p-0 text-green-600 hover:text-green-700'>
                                <Check className='h-4 w-4' />
                              </AppButton>
                              <AppButton
                                type='button'
                                variant='ghost'
                                size='sm'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                                className='h-8 w-8 p-0'>
                                ×
                              </AppButton>
                            </>
                          ) : (
                            <>
                              <AppTooltip.Root>
                                <AppTooltip.Trigger asChild>
                                  <AppButton
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartEdit(index);
                                    }}
                                    className='h-8 w-8 p-0'>
                                    <PencilIcon className='h-4 w-4' />
                                  </AppButton>
                                </AppTooltip.Trigger>
                                <AppTooltip.Content side='top'>Edit option</AppTooltip.Content>
                              </AppTooltip.Root>
                              <AppTooltip.Root>
                                <AppTooltip.Trigger asChild>
                                  <AppButton
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveOption(index);
                                    }}
                                    className='text-destructive hover:text-destructive h-8 w-8 p-0'>
                                    <TrashIcon className='h-4 w-4' />
                                  </AppButton>
                                </AppTooltip.Trigger>
                                <AppTooltip.Content side='top'>Delete option</AppTooltip.Content>
                              </AppTooltip.Root>
                            </>
                          )}
                        </div>
                      </AppCommand.Item>
                    ))}
                  </AppCommand.List>
                </AppCommand.Root>
              </div>
            ) : (
              <div className='rounded-md border border-dashed p-8 text-center'>
                <AppTypography.muted>No options added yet. Add at least 2 options to continue.</AppTypography.muted>
              </div>
            )}

            <div className='text-muted-foreground text-sm'>
              <p>• Click on an option to mark it as correct/incorrect</p>
              <p>• You need at least 2 options</p>
              <p>• At least one option must be marked as correct</p>
              {!state.allowMultipleCorrect && <p>• Only one option can be correct (single answer mode)</p>}
            </div>
          </div>
          <AppForm.Message />
        </AppForm.Item>
      )}
    />
  );
}
