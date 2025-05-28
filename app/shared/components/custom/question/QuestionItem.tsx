import { TrashIcon } from 'lucide-react';
import { useState } from 'react';

import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppLabel } from 'app/shared/components/label/AppLabel';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTooltip } from 'app/shared/components/tooltip/AppTooltip';

import { CorrectOptionToggle } from './CorrectOptionToggle';
import { QuestionOption, QuestionOptionsManager } from './QuestionOptionsManager';

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
  readonly onRequestDelete: (index: number) => void;
}

export function QuestionItem({ index, question, onQuestionChange, onRequestDelete }: QuestionItemProps) {
  const [questionText, setQuestionText] = useState(question.questionText);

  function handleQuestionTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setQuestionText(e.target.value);

    const updatedQuestion: QuestionData = {
      ...question,
      questionText: e.target.value,
      isEdited: true,
    };

    onQuestionChange(index, updatedQuestion);
  }

  function handleToggleMultipleCorrect(value: boolean) {
    const updatedQuestion: QuestionData = {
      ...question,
      allowMultipleCorrect: value,
      isEdited: true,
    };

    onQuestionChange(index, updatedQuestion);
  }

  function handleOptionsChange(options: QuestionOption[]) {
    const updatedQuestion: QuestionData = {
      ...question,
      options,
      isEdited: true,
    };

    onQuestionChange(index, updatedQuestion);
  }

  function handleDeleteQuestion() {
    onRequestDelete(index);
  }

  return (
    <AppAccordion.Item value={`question-${index}`} className='border-border mb-4 rounded-md border'>
      <AppAccordion.Trigger className='px-4'>
        <div className='flex w-full items-center justify-between'>
          <span>{questionText || `Question ${index + 1}`}</span>
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
        </div>
      </AppAccordion.Trigger>
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
