import { useState } from 'react';
import { PlusIcon } from 'lucide-react';

import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppAlertDialog } from 'app/shared/components/alert-dialog/AppAlertDialog';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppTypography } from 'app/shared/components/typography/AppTypography';

import { QuestionItem, QuestionData } from './QuestionItem';

interface QuestionManagerProps {
  readonly questions: QuestionData[];
  readonly onQuestionsChange: (questions: QuestionData[]) => void;
  readonly onSaveQuestions: () => void;
  readonly isSaving: boolean;
}

export function QuestionManager({ questions, onQuestionsChange, onSaveQuestions, isSaving }: QuestionManagerProps) {
  const [questionToDeleteIndex, setQuestionToDeleteIndex] = useState<number | null>(null);
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(['question-0']);

  // Filter out deleted questions for display
  const visibleQuestions = questions.filter((q) => !q.isDeleted);

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
    const newIndex = visibleQuestions.length;
    setOpenAccordionItems([...openAccordionItems, `question-${newIndex}`]);
  }

  function handleDeleteQuestion(index: number) {
    setQuestionToDeleteIndex(index);
  }

  function handleConfirmDeleteQuestion() {
    if (questionToDeleteIndex === null) return;

    const updatedQuestions = [...questions];
    const questionToDelete = updatedQuestions[questionToDeleteIndex];

    if (!questionToDelete) {
      setQuestionToDeleteIndex(null);
      return;
    }

    // If it's a new question, remove it completely
    if (questionToDelete.isNew) {
      updatedQuestions.splice(questionToDeleteIndex, 1);
    } else {
      // Otherwise mark it as deleted
      updatedQuestions[questionToDeleteIndex] = {
        ...questionToDelete,
        isDeleted: true,
      };
    }

    onQuestionsChange(updatedQuestions);
    setQuestionToDeleteIndex(null);
  }

  function handleQuestionChange(index: number, updatedQuestion: QuestionData) {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
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
          <AppButton type='button' onClick={onSaveQuestions} disabled={isSaving || visibleQuestions.length === 0}>
            {isSaving ? 'Saving...' : 'Save Questions'}
          </AppButton>
        </div>
      </div>

      {visibleQuestions.length > 0 ? (
        <AppAccordion.Root type='multiple' value={openAccordionItems} onValueChange={setOpenAccordionItems}>
          {visibleQuestions.map((question, index) => (
            <QuestionItem
              key={question.id || `new-${index}`}
              index={index}
              question={question}
              onQuestionChange={handleQuestionChange}
              onRequestDelete={handleDeleteQuestion}
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

      {/* Delete Question Dialog */}
      <AppAlertDialog.Root open={questionToDeleteIndex !== null}>
        <AppAlertDialog.Content>
          <AppAlertDialog.Header>
            <AppAlertDialog.Title>Delete Question</AppAlertDialog.Title>
            <AppAlertDialog.Description>
              Are you sure you want to delete this question? This action cannot be undone.
            </AppAlertDialog.Description>
          </AppAlertDialog.Header>
          <AppAlertDialog.Footer>
            <AppAlertDialog.Cancel onClick={() => setQuestionToDeleteIndex(null)}>Cancel</AppAlertDialog.Cancel>
            <AppAlertDialog.Action
              onClick={handleConfirmDeleteQuestion}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Delete
            </AppAlertDialog.Action>
          </AppAlertDialog.Footer>
        </AppAlertDialog.Content>
      </AppAlertDialog.Root>
    </div>
  );
}
