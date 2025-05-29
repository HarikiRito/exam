import { useState } from 'react';
import { toast } from 'sonner';

import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppTypography } from 'app/shared/components/typography/AppTypography';

import { CollectionAccordionSteps } from 'app/routes/_auth/admin/collections/components/CollectionEditAndCreatePage';
import { QuestionData } from 'app/shared/components/custom/question/QuestionItem';
import { QuestionManager } from 'app/shared/components/custom/question/QuestionManager';

interface ManageQuestionsStepProps {
  readonly collectionId?: string;
  readonly initialQuestions?: QuestionData[];
}

export function ManageQuestionsStep({ collectionId, initialQuestions = [] }: ManageQuestionsStepProps) {
  const [questions, setQuestions] = useState<QuestionData[]>(initialQuestions);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);

  // Handle saving questions
  function handleSaveQuestions() {
    setIsSavingQuestions(true);

    if (!collectionId) {
      toast.error('No collection ID found. Please create or select a collection first.');
      setIsSavingQuestions(false);
      return;
    }

    // Validate that there are questions to save
    if (!questions || questions.length === 0) {
      toast.error('No questions to save. Please add at least one question.');
      setIsSavingQuestions(false);
      return;
    }

    // Check if all the questions must have at least one correct option
    for (const question of questions) {
      if (!question.options.some((option) => option.isCorrect)) {
        toast.error('All questions must have at least one correct option.');
        setIsSavingQuestions(false);
        return;
      }
    }

    // TODO: Implement question saving logic
    // This will handle:
    // - Creating new questions (isNew: true)
    // - Updating existing questions (isEdited: true)
    // - Deleting questions (isDeleted: true)
    // - Managing question options for each question

    // For now, simulate successful save
    setTimeout(() => {
      toast.success('Questions saved successfully!');
      setIsSavingQuestions(false);
    }, 1000);
  }

  function handleQuestionsChange(updatedQuestions: QuestionData[]) {
    setQuestions(updatedQuestions);
  }

  return (
    <AppAccordion.Item value={CollectionAccordionSteps.ManageQuestions} className='mb-4 rounded-md border'>
      <AppAccordion.Trigger className='px-4'>
        <div className='flex w-full items-center'>
          <AppTypography.h3 className='flex-1 text-left'>Manage Questions</AppTypography.h3>
          <span className='text-muted-foreground text-sm'>Step 2</span>
        </div>
      </AppAccordion.Trigger>
      <AppAccordion.Content className='px-4 pb-4'>
        {collectionId && (
          <QuestionManager
            questions={questions}
            onQuestionsChange={handleQuestionsChange}
            onSaveQuestions={handleSaveQuestions}
            isSaving={isSavingQuestions}
          />
        )}
      </AppAccordion.Content>
    </AppAccordion.Item>
  );
}
