import { FileTextIcon, PlusIcon } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppTypography } from 'app/shared/components/typography/AppTypography';

import { produce } from 'immer';
import { QuestionData, QuestionItem } from './QuestionItem';
import { ImportQuestionsDialog } from './ImportQuestionsDialog';

interface QuestionManagerProps {
  readonly questions: QuestionData[];
  readonly onSaveQuestions: (questions: QuestionData[]) => void;
  readonly isSaving: boolean;
}

export const QuestionManager = memo(({ questions, onSaveQuestions, isSaving }: QuestionManagerProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [localQuestions, setLocalQuestions] = useState<QuestionData[]>(questions);

  function handleAddQuestion() {
    const newQuestion: QuestionData = {
      questionText: '',
      points: 5,
      options: [],
      allowMultipleCorrect: false,
      isNew: true,
    };

    const updatedQuestions = [...localQuestions, newQuestion];
    setLocalQuestions(updatedQuestions);
  }

  function handleImportQuestions(importedQuestions: QuestionData[]) {
    const updatedQuestions = [...localQuestions, ...importedQuestions];
    setLocalQuestions(updatedQuestions);
  }

  const questionsItems = useMemo(() => {
    function handleQuestionChange(index: number, updatedQuestion: QuestionData) {
      const updatedQuestions = produce(localQuestions, (draft) => {
        draft[index] = updatedQuestion;
      });
      setLocalQuestions(updatedQuestions);
    }
    return localQuestions.map((question, index) => (
      <QuestionItem index={index} question={question} onQuestionChange={handleQuestionChange} />
    ));
  }, [localQuestions]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <AppTypography.h3>Questions</AppTypography.h3>
        <div className='flex gap-2'>
          <AppButton type='button' onClick={handleAddQuestion} variant='outline'>
            <PlusIcon className='mr-2 h-4 w-4' />
            Add Question
          </AppButton>
          <AppButton type='button' onClick={() => setIsImportDialogOpen(true)} variant='outline'>
            <FileTextIcon className='mr-2 h-4 w-4' />
            Import Questions
          </AppButton>
          <AppButton
            type='button'
            onClick={() => onSaveQuestions(localQuestions)}
            disabled={isSaving || localQuestions.length === 0}>
            {isSaving ? 'Saving...' : 'Save Questions'}
          </AppButton>
        </div>
      </div>

      {localQuestions.length > 0 ? (
        <AppAccordion.Root type='single'>{questionsItems}</AppAccordion.Root>
      ) : (
        <div className='rounded-md border border-dashed p-8 text-center'>
          <AppTypography.muted>
            No questions added yet. Click "Add Question" to create a new question.
          </AppTypography.muted>
        </div>
      )}

      <ImportQuestionsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportQuestions={handleImportQuestions}
      />
    </div>
  );
});
