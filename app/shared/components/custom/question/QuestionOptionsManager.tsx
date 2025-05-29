import { Check, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCommand } from 'app/shared/components/command/AppCommand';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTooltip } from 'app/shared/components/tooltip/AppTooltip';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { AppLabel } from 'app/shared/components/label/AppLabel';
import { useImmer } from 'use-immer';
import { cn } from 'app/shared/utils/className';

export interface QuestionOption {
  id?: string;
  optionText: string;
  isCorrect: boolean;
  isDeleted?: boolean;
}

interface QuestionOptionsManagerProps {
  readonly options: QuestionOption[];
  readonly allowMultipleCorrect: boolean;
  readonly onOptionsChange: (options: QuestionOption[]) => void;
}

export function QuestionOptionsManager({
  options,
  allowMultipleCorrect,
  onOptionsChange,
}: QuestionOptionsManagerProps) {
  const [newOptionText, setNewOptionText] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [localOptions, setLocalOptions] = useImmer<QuestionOption[]>(options || []);

  // Update local state when props change
  useEffect(() => {
    setLocalOptions(options || []);
  }, [options, setLocalOptions]);

  function handleAddOption() {
    const trimmedNewOptionText = newOptionText.trim();

    if (trimmedNewOptionText) {
      const isDuplicate = localOptions.some(
        (option) => option.optionText.trim().toLowerCase() === trimmedNewOptionText.toLowerCase(),
      );

      if (isDuplicate) {
        toast.error(`Option "${trimmedNewOptionText}" already exists.`);
        return;
      }

      const option: QuestionOption = {
        optionText: trimmedNewOptionText,
        isCorrect: false,
      };
      setLocalOptions((draft) => {
        draft.push(option);
      });

      // Pass the updated array instead of the draft
      const updatedOptions = [...localOptions, option];
      onOptionsChange?.(updatedOptions);
      setNewOptionText('');
    }
  }

  function handleRemoveOption(index: number) {
    setLocalOptions((draft) => {
      const optionToUpdate = draft[index];

      if (!optionToUpdate) return;

      // If it's an existing option with an ID, mark it as deleted
      if (optionToUpdate.id) {
        optionToUpdate.isDeleted = true;
      } else {
        // Otherwise just remove it from the array
        draft.splice(index, 1);
      }
    });

    // Create a new array with the updates applied
    const updatedOptions = localOptions
      .map((option, idx) => {
        if (idx === index) {
          if (option.id) {
            return { ...option, isDeleted: true };
          } else {
            return null; // Will be filtered out
          }
        }
        return option;
      })
      .filter((option): option is QuestionOption => option !== null);

    onOptionsChange?.(updatedOptions);
  }

  function handleToggleCorrect(index: number) {
    // Don't toggle if we're editing this item
    if (editingIndex === index) return;

    setLocalOptions((draft) => {
      const currentOption = draft[index];
      if (!currentOption) return;

      const newIsCorrect = !currentOption.isCorrect;

      if (!allowMultipleCorrect && newIsCorrect) {
        // If only one answer can be correct, set all others to false
        draft.forEach((option, idx) => {
          if (idx !== index) {
            option.isCorrect = false;
          }
        });
      }

      currentOption.isCorrect = newIsCorrect;
    });

    // Create a new array with the updates applied
    const updatedOptions = localOptions.map((option, idx) => {
      if (idx === index) {
        const newIsCorrect = !option.isCorrect;
        return { ...option, isCorrect: newIsCorrect };
      } else if (!allowMultipleCorrect && idx !== index) {
        // Set all others to false if only one can be correct
        return { ...option, isCorrect: false };
      }
      return option;
    });

    onOptionsChange?.(updatedOptions);
  }

  function handleStartEdit(index: number) {
    const currentOption = localOptions[index];
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
    const isDuplicate = localOptions.some(
      (option, optionIndex) =>
        optionIndex !== index && option.optionText.trim().toLowerCase() === trimmedText.toLowerCase(),
    );

    if (isDuplicate) {
      toast.error(`Option "${trimmedText}" already exists.`);
      return;
    }

    setLocalOptions((draft) => {
      const currentOption = draft[index];
      if (!currentOption) return;

      currentOption.optionText = trimmedText;
    });

    // Create a new array with the updates applied
    const updatedOptions = localOptions.map((option, idx) => {
      if (idx === index) {
        return { ...option, optionText: trimmedText };
      }
      return option;
    });

    onOptionsChange(updatedOptions);
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

  return (
    <div>
      <AppLabel>Answer Options</AppLabel>
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

        {localOptions.length > 0 ? (
          <div className='rounded-md border'>
            <AppCommand.Root>
              <AppCommand.List>
                {localOptions.map((option, index) => (
                  <AppCommand.Item
                    key={option.id || `new-option-${index}`}
                    className={cn(
                      'hover:bg-accent pointer-events-auto flex cursor-pointer items-center justify-between p-3',
                      option.isCorrect && 'bg-green-50',
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
                        <span className='flex-1'>{option.optionText}</span>
                      )}
                      {option.isCorrect && <Check className='h-4 w-4 text-green-600' />}
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
          {!allowMultipleCorrect && <p>• Only one option can be correct (single answer mode)</p>}
        </div>
      </div>
    </div>
  );
}
