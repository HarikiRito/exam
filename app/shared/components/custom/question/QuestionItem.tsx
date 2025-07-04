import { produce } from 'immer';
import { RotateCcwIcon, TrashIcon } from 'lucide-react';
import { memo, useState } from 'react';

import { AppAccordion } from 'app/shared/components/ui/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppInput } from 'app/shared/components/ui/input/AppInput';
import { AppLabel } from 'app/shared/components/ui/label/AppLabel';
import { AppTextarea } from 'app/shared/components/ui/textarea/AppTextarea';
import { AppTooltip } from 'app/shared/components/ui/tooltip/AppTooltip';

import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppMarkdown } from 'app/shared/components/ui/markdown/AppMarkdown';
import { useDebounce } from 'app/shared/hooks/useDebounce';
import { cn } from 'app/shared/utils/className';
import { CorrectOptionToggle } from './CorrectOptionToggle';
import { QuestionOption, QuestionOptionsManager } from './QuestionOptionsManager';

export interface QuestionData {
  id?: string;
  questionText: string;
  points: number;
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

export const QuestionItem = memo(({ index, question, onQuestionChange }: QuestionItemProps) => {
  const [questionText, setQuestionText] = useState(question.questionText);
  const [points, setPoints] = useState(question.points);

  const debouncedOnQuestionChange = useDebounce(onQuestionChange, 300);

  function handleQuestionTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuestionText(e.target.value);

    const updatedQuestion = produce(question, (draft) => {
      draft.questionText = e.target.value;
      draft.isEdited = true;
    });

    debouncedOnQuestionChange(index, updatedQuestion);
  }

  function handlePointsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const pointsValue = Number(e.target.value);
    setPoints(pointsValue);

    const updatedQuestion = produce(question, (draft) => {
      draft.points = pointsValue;
      draft.isEdited = true;
    });

    debouncedOnQuestionChange(index, updatedQuestion);
  }

  function handleToggleMultipleCorrect(value: boolean) {
    const updatedQuestion = produce(question, (draft) => {
      draft.allowMultipleCorrect = value;
      draft.isEdited = true;
    });

    debouncedOnQuestionChange(index, updatedQuestion);
  }

  function handleOptionsChange(options: QuestionOption[]) {
    const updatedQuestion = produce(question, (draft) => {
      draft.options = options;
      draft.isEdited = true;
    });

    debouncedOnQuestionChange(index, updatedQuestion);
  }

  function handleDeleteQuestion() {
    const updatedQuestion = produce(question, (draft) => {
      draft.isDeleted = true;
      draft.isEdited = false;
    });

    debouncedOnQuestionChange(index, updatedQuestion);
  }

  function handleUndoDelete() {
    const updatedQuestion = produce(question, (draft) => {
      draft.isDeleted = false;
      draft.isEdited = true;
    });

    debouncedOnQuestionChange(index, updatedQuestion);
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
    function _renderBadge() {
      if (question.isNew) {
        return <AppBadge variant='outline'>New</AppBadge>;
      }

      if (question.isEdited) {
        return <AppBadge variant='outline'>Edited</AppBadge>;
      }

      if (question.isDeleted) {
        return <AppBadge variant='destructive'>Pending Delete</AppBadge>;
      }

      return null;
    }

    return (
      <div className='flex w-full items-center justify-between'>
        <span className={cn({ 'line-through': question.isDeleted })}>
          <AppMarkdown>{questionText || `Question ${index + 1}`}</AppMarkdown>
        </span>

        <div className='flex items-center gap-2'>
          {_renderBadge()}
          <span>{question.isDeleted ? renderUndoDeleteButton() : renderDeleteButton()}</span>
        </div>
      </div>
    );
  }

  return (
    <AppAccordion.Item
      value={index.toString()}
      className={cn('border-border mb-4 rounded-md border', { 'opacity-50': question.isDeleted })}>
      <AppAccordion.Trigger className='px-4 hover:no-underline'>{renderQuestionHeaderContent()}</AppAccordion.Trigger>
      <AppAccordion.Content className='px-4 pb-4'>
        <div className='space-y-6'>
          {/* Question Text */}
          <div>
            <AppLabel htmlFor={`question-text-${index}`}>Question</AppLabel>
            <AppTextarea
              id={`question-text-${index}`}
              placeholder='Enter your question text'
              rows={3}
              value={questionText}
              onChange={handleQuestionTextChange}
              className='mt-2'
            />
          </div>

          {/* Points Input */}
          <div>
            <AppLabel htmlFor={`question-points-${index}`}>Points</AppLabel>
            <AppInput
              id={`question-points-${index}`}
              type='number'
              placeholder='5'
              min={0}
              value={points}
              onChange={handlePointsChange}
              className='mt-2'
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
});
