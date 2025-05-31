import { useState } from 'react';
import { toast } from 'sonner';

import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppTypography } from 'app/shared/components/typography/AppTypography';

import { useCreateQuestionMutation } from 'app/graphql/operations/question/createQuestion.mutation.generated';
import { useDeleteQuestionMutation } from 'app/graphql/operations/question/deleteQuestion.mutation.generated';
import { useUpdateQuestionMutation } from 'app/graphql/operations/question/updateQuestion.mutation.generated';
import { GetQuestionCollectionDocument } from 'app/graphql/operations/questionCollection/getQuestionCollection.query.generated';
import { CollectionAccordionSteps } from 'app/routes/_auth/admin/collections/components/CollectionEditAndCreatePage';
import { QuestionData } from 'app/shared/components/custom/question/QuestionItem';
import { QuestionManager } from 'app/shared/components/custom/question/QuestionManager';
import { apolloService } from 'app/shared/services/apollo.service';
import { guardAsync } from 'safe-guard-data';
import { useUniqueId } from 'app/shared/hooks/useUniqueId';

interface ManageQuestionsStepProps {
  readonly collectionId?: string;
  readonly initialQuestions?: QuestionData[];
}

export function ManageQuestionsStep({ collectionId, initialQuestions = [] }: ManageQuestionsStepProps) {
  const [questions, setQuestions] = useState<QuestionData[]>(initialQuestions);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);

  const [updateQuestion] = useUpdateQuestionMutation({});
  const [createQuestion] = useCreateQuestionMutation({});
  const [deleteQuestion] = useDeleteQuestionMutation({});

  const [completedQuestionCount, setCompletedQuestionCount] = useState(0);
  const [totalQuestionToSave, setTotalQuestionToSave] = useState(questions.length);

  // Handle saving questions
  async function handleSaveQuestions() {
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

    setCompletedQuestionCount(0);
    setTotalQuestionToSave(
      questions.filter((question) => question.isNew || question.isEdited || question.isDeleted).length,
    );

    const validQuestions = questions.filter((question) => {
      const isNewAndMarkedAsDeleted = question.isNew && question.isDeleted;

      return !isNewAndMarkedAsDeleted;
    });

    // Check if all the questions must have at least one correct option
    for (const question of validQuestions) {
      if (!question.options.some((option) => option.isCorrect)) {
        toast.error('All questions must have at least one correct option.');
        setIsSavingQuestions(false);
        return;
      }
    }

    for (const question of validQuestions) {
      if (question.isDeleted) {
        if (!question.id) {
          toast.error(`Question ID is required to delete a question: ${question.questionText}`);
          setIsSavingQuestions(false);
          return;
        }

        const result = await guardAsync(
          deleteQuestion({
            variables: {
              id: question.id,
            },
          }),
        );

        if (!result.hasData()) {
          toast.error(`Failed to delete question: ${question.questionText}`);
          setIsSavingQuestions(false);
          return;
        }

        setCompletedQuestionCount((prev) => prev + 1);
        continue;
      }

      if (question.isNew) {
        const result = await guardAsync(
          createQuestion({
            variables: {
              input: {
                questionText: question.questionText,
                options: question.options,
                questionCollectionId: collectionId,
              },
            },
          }),
        );

        if (!result.hasData()) {
          toast.error(`Failed to create question: ${question.questionText}`);
          setIsSavingQuestions(false);
          return;
        }

        setCompletedQuestionCount((prev) => prev + 1);
        continue;
      }

      if (question.isEdited) {
        if (!question.id) {
          toast.error('Question ID is required to update a question.');
          setIsSavingQuestions(false);
          return;
        }

        const result = await guardAsync(
          updateQuestion({
            variables: {
              id: question.id,
              input: {
                questionText: question.questionText,
                options: question.options,
                questionCollectionId: collectionId,
              },
            },
          }),
        );

        if (!result.hasData()) {
          toast.error(`Failed to update question: ${question.questionText}`);
          setIsSavingQuestions(false);
          return;
        }

        setCompletedQuestionCount((prev) => prev + 1);
        continue;
      }
    }

    apolloService.invalidateQueries([GetQuestionCollectionDocument]);
    setIsSavingQuestions(false);
  }

  function handleQuestionsChange(updatedQuestions: QuestionData[]) {
    setQuestions(updatedQuestions);
  }

  return (
    <AppAccordion.Item value={CollectionAccordionSteps.ManageQuestions} className='mb-4 rounded-md border'>
      <AppAccordion.Trigger className='px-4'>
        <div className='flex w-full items-center'>
          <AppTypography.h3 className='flex-1 text-left'>
            Manage Questions ({completedQuestionCount} / {totalQuestionToSave})
          </AppTypography.h3>
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
