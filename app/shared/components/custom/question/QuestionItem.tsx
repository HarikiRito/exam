import { RotateCcwIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';
import { produce } from 'immer';

import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppLabel } from 'app/shared/components/label/AppLabel';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTooltip } from 'app/shared/components/tooltip/AppTooltip';

import { CorrectOptionToggle } from './CorrectOptionToggle';
import { QuestionOption, QuestionOptionsManager } from './QuestionOptionsManager';
import { cn } from 'app/shared/utils/className';

export interface QuestionData {
  id?: string;
  questionText: string;
  options: QuestionOption[];
  allowMultipleCorrect: boolean;
  isNew?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}

interface QuestionItemProps {
  readonly index: number;
  readonly question: QuestionData;
  readonly onQuestionChange: (index: number, updatedQuestion: QuestionData) => void;
}

export function QuestionItem({ index, question, onQuestionChange }: QuestionItemProps) {
  const [questionText, setQuestionText] = useState(question.questionText);

  function handleQuestionTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuestionText(e.target.value);

    const updatedQuestion = produce(question, (draft) => {
      draft.questionText = e.target.value;
      draft.isEdited = true;
    });

    onQuestionChange(index, updatedQuestion);
  }

  function handleToggleMultipleCorrect(value: boolean) {
    const updatedQuestion = produce(question, (draft) => {
      draft.allowMultipleCorrect = value;
      draft.isEdited = true;
    });

    onQuestionChange(index, updatedQuestion);
  }

  function handleOptionsChange(options: QuestionOption[]) {
    const updatedQuestion = produce(question, (draft) => {
      draft.options = options;
      draft.isEdited = true;
    });

    onQuestionChange(index, updatedQuestion);
  }

  function handleDeleteQuestion() {
    const updatedQuestion = produce(question, (draft) => {
      draft.isDeleted = true;
      draft.isEdited = false;
    });

    onQuestionChange(index, updatedQuestion);
  }

  function handleUndoDelete() {
    const updatedQuestion = produce(question, (draft) => {
      draft.isDeleted = false;
      draft.isEdited = true;
    });

    onQuestionChange(index, updatedQuestion);
  }

  function renderUndoDeleteButton() {
    return (
      <AppTooltip.Root>
        <AppTooltip.Trigger asChild>
          <AppButton
            type='button'
            variant='ghost'
            size='icon'
            onClick={(e) => {
              e.stopPropagation();
              handleUndoDelete();
            }}
            className='h-8 w-8'>
            <RotateCcwIcon className='h-4 w-4' />
          </AppButton>
        </AppTooltip.Trigger>
        <AppTooltip.Content side='top'>Undo delete</AppTooltip.Content>
      </AppTooltip.Root>
    );
  }

  function renderDeleteButton() {
    return (
      <AppTooltip.Root>
        <AppTooltip.Trigger asChild>
          <AppButton
            type='button'
            variant='ghost'
            size='icon'
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteQuestion();
            }}
            className='text-destructive hover:text-destructive h-8 w-8'>
            <TrashIcon className='h-4 w-4' />
          </AppButton>
        </AppTooltip.Trigger>
        <AppTooltip.Content side='top'>Delete question</AppTooltip.Content>
      </AppTooltip.Root>
    );
  }

  function renderQuestionHeaderContent() {
    return (
      <div className='flex w-full items-center justify-between'>
        <span className={cn({ 'line-through': question.isDeleted })}>{questionText || `Question ${index + 1}`}</span>

        {question.isDeleted ? renderUndoDeleteButton() : renderDeleteButton()}
      </div>
    );
  }

  return (
    <AppAccordion.Item
      value={`question-${index}`}
      className={cn('border-border mb-4 rounded-md border', { 'opacity-50': question.isDeleted })}>
      <AppAccordion.Trigger className='px-4'>{renderQuestionHeaderContent()}</AppAccordion.Trigger>
      <AppAccordion.Content className='px-4 pb-4'>
        <div className='space-y-6'>
          {/* Question Text */}
          <div>
            <AppLabel htmlFor={`question-text-${index}`}>Question Text</AppLabel>
            <AppTextarea
              id={`question-text-${index}`}
              placeholder='Enter your question text'
              rows={3}
              value={questionText}
              onChange={handleQuestionTextChange}
            />
          </div>

          {/* Multiple Choice Toggle */}
          <CorrectOptionToggle
            allowMultipleCorrect={question.allowMultipleCorrect}
            onToggleChange={handleToggleMultipleCorrect}
          />

          {/* Question Options Manager */}
          <QuestionOptionsManager
            options={question.options}
            allowMultipleCorrect={question.allowMultipleCorrect}
            onOptionsChange={handleOptionsChange}
          />
        </div>
      </AppAccordion.Content>
    </AppAccordion.Item>
  );
}
