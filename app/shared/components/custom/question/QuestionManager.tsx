import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppAlertDialog } from 'app/shared/components/alert-dialog/AppAlertDialog';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppTypography } from 'app/shared/components/typography/AppTypography';

import { produce } from 'immer';
import { QuestionData, QuestionItem } from './QuestionItem';

interface QuestionManagerProps {
  readonly questions: QuestionData[];
  readonly onQuestionsChange: (questions: QuestionData[]) => void;
  readonly onSaveQuestions: () => void;
  readonly isSaving: boolean;
}

export function QuestionManager({ questions, onQuestionsChange, onSaveQuestions, isSaving }: QuestionManagerProps) {
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);

  function handleAddQuestion() {
    const newQuestion: QuestionData = {
      questionText: '',
      options: [],
      allowMultipleCorrect: false,
      isNew: true,
    };

    const updatedQuestions = [...questions, newQuestion];
    onQuestionsChange(updatedQuestions);

    // Open the newly added question accordion
    const newIndex = questions.length;
    setOpenAccordionItems([...openAccordionItems, `question-${newIndex}`]);
  }

  function handleQuestionChange(index: number, updatedQuestion: QuestionData) {
    const updatedQuestions = produce(questions, (draft) => {
      draft[index] = updatedQuestion;
    });
    onQuestionsChange(updatedQuestions);
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <AppTypography.h3>Questions</AppTypography.h3>
        <div className='flex gap-2'>
          <AppButton type='button' onClick={handleAddQuestion} variant='outline'>
            <PlusIcon className='mr-2 h-4 w-4' />
            Add Question
          </AppButton>
          <AppButton type='button' onClick={onSaveQuestions} disabled={isSaving || questions.length === 0}>
            {isSaving ? 'Saving...' : 'Save Questions'}
          </AppButton>
        </div>
      </div>

      {questions.length > 0 ? (
        <AppAccordion.Root type='multiple' value={openAccordionItems} onValueChange={setOpenAccordionItems}>
          {questions.map((question, index) => (
            <QuestionItem
              key={question.id || `new-${index}`}
              index={index}
              question={question}
              onQuestionChange={handleQuestionChange}
            />
          ))}
        </AppAccordion.Root>
      ) : (
        <div className='rounded-md border border-dashed p-8 text-center'>
          <AppTypography.muted>
            No questions added yet. Click "Add Question" to create a new question.
          </AppTypography.muted>
        </div>
      )}
    </div>
  );
}
