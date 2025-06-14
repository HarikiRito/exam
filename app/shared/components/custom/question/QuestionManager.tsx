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
  readonly onQuestionsChange: (questions: QuestionData[]) => void;
  readonly onSaveQuestions: () => void;
  readonly isSaving: boolean;
}

export const QuestionManager = memo(
  ({ questions, onQuestionsChange, onSaveQuestions, isSaving }: QuestionManagerProps) => {
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

    function handleAddQuestion() {
      const newQuestion: QuestionData = {
        questionText: '',
        points: 5,
        options: [],
        allowMultipleCorrect: false,
        isNew: true,
      };

      const updatedQuestions = [...questions, newQuestion];
      onQuestionsChange(updatedQuestions);
    }

    function handleImportQuestions(importedQuestions: QuestionData[]) {
      const updatedQuestions = [...questions, ...importedQuestions];
      onQuestionsChange(updatedQuestions);
    }

    const questionsItems = useMemo(() => {
      function handleQuestionChange(index: number, updatedQuestion: QuestionData) {
        const updatedQuestions = produce(questions, (draft) => {
          draft[index] = updatedQuestion;
        });
        onQuestionsChange(updatedQuestions);
      }
      return questions.map((question, index) => (
        <QuestionItem index={index} question={question} onQuestionChange={handleQuestionChange} />
      ));
    }, [questions, onQuestionsChange]);

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
            <AppButton type='button' onClick={onSaveQuestions} disabled={isSaving || questions.length === 0}>
              {isSaving ? 'Saving...' : 'Save Questions'}
            </AppButton>
          </div>
        </div>

        {questions.length > 0 ? (
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
  },
);
