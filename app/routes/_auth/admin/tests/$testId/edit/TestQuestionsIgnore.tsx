import { useParams } from '@remix-run/react';
import { CheckIcon, Eye, EyeOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useBatchIgnoreQuestionsMutation } from 'app/graphql/operations/test/batchIgnoreQuestions.mutation.generated';
import { GetTestDocument, GetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { AppAccordion } from 'app/shared/components/accordion/AppAccordion';
import { AppBadge } from 'app/shared/components/badge/AppBadge';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { apolloService } from 'app/shared/services/apollo.service';
import { cn } from 'app/shared/utils/className';
import { testEditStore } from './testEditStore';
import { AppMarkdown } from 'app/shared/components/markdown/AppMarkdown';
type Question = NonNullable<GetTestQuery['test']>['questionCollections'][number]['questions'][number];

export function TestQuestionsIgnore() {
  const { testId } = useParams();
  const testEditState = testEditStore.useStateSnapshot();

  // Component-specific state
  const [selectedIgnoreQuestionIds, setSelectedIgnoreQuestionIds] = useState<string[]>([]);

  // Mutation for batch ignoring questions
  const [batchIgnoreQuestions, { loading: batchIgnoreLoading }] = useBatchIgnoreQuestionsMutation({
    onCompleted: () => {
      toast.success('Questions updated successfully!');
      apolloService.invalidateQueries([GetTestDocument]);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update questions: ${error.message}`);
    },
  });

  const initialIgnoreQuestionIds = useMemo(() => {
    const ignoredQuestions = testEditState.testDetails?.testIgnoreQuestions || [];
    return new Set(ignoredQuestions.map((iq) => iq.questionId));
  }, [testEditState.testDetails?.testIgnoreQuestions]);

  // wrap in useMemo to avoid re-rendering
  const questionCollections = useMemo(() => {
    return testEditState.testDetails?.questionCollections || [];
  }, [testEditState.testDetails?.questionCollections]);

  useEffect(() => {
    setSelectedIgnoreQuestionIds(Array.from(initialIgnoreQuestionIds));
  }, [initialIgnoreQuestionIds]);

  // Group questions by collection
  const questionsByCollectionMap = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    questionCollections.forEach((collection) => {
      groups[collection.id] = collection.questions;
    });
    return groups;
  }, [questionCollections]);

  function handleQuestionSelect(questionId: string, isSelected: boolean) {
    if (isSelected) {
      return setSelectedIgnoreQuestionIds((prev) => [...prev, questionId]);
    }
    setSelectedIgnoreQuestionIds((prev) => prev.filter((id) => id !== questionId));
  }

  function saveIgnoreQuestions() {
    if (!testId) {
      toast.error('Test not found');
      return;
    }

    const questionIgnoreData = selectedIgnoreQuestionIds.map((questionId) => ({
      questionId,
    }));

    batchIgnoreQuestions({
      variables: {
        input: {
          testId,
          questionIgnoreData,
        },
      },
    });
  }

  function _renderQuestionOptions(question: Question) {
    if (!question.options || question.options.length === 0) {
      return <div className='text-muted-foreground py-2 text-sm'>No options available</div>;
    }

    return (
      <div className='space-y-2 py-2'>
        {question.options.map((option) => (
          <div
            key={option.id}
            className={cn(
              'flex items-center justify-between rounded-md border p-3',
              option.isCorrect && 'bg-green-50',
            )}>
            <div className='flex items-center gap-3'>
              <AppMarkdown>{option.optionText}</AppMarkdown>
            </div>
            {option.isCorrect && <CheckIcon className='h-4 w-4 text-green-600' />}
          </div>
        ))}
      </div>
    );
  }

  function _renderQuestionRow(question: Question) {
    const isIgnore = selectedIgnoreQuestionIds.includes(question.id);

    return (
      <div key={question.id} className='rounded-lg border'>
        <AppAccordion.Root type='single' collapsible>
          <AppAccordion.Item value={question.id} className={cn('p-3')}>
            <AppAccordion.Trigger className='w-full items-center p-0 text-left hover:no-underline'>
              <div className='flex w-full items-center gap-3'>
                <div className='flex w-full items-center gap-2'>
                  <div className='flex items-center gap-2 truncate' title={question.questionText}>
                    <AppMarkdown>{question.questionText}</AppMarkdown>
                    <span className='text-muted-foreground'>({question.points.toString()} pts)</span>
                  </div>
                  {isIgnore && <AppBadge className='text-xs'>Ignored</AppBadge>}
                </div>
              </div>
              <AppButton
                variant='ghost'
                size='icon'
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuestionSelect(question.id, !isIgnore);
                }}>
                {isIgnore ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
              </AppButton>
            </AppAccordion.Trigger>

            <AppAccordion.Content>{_renderQuestionOptions(question)}</AppAccordion.Content>
          </AppAccordion.Item>
        </AppAccordion.Root>
      </div>
    );
  }

  function _renderQuestionCollections() {
    if (questionCollections.length === 0) {
      return <div className='text-muted-foreground py-8 text-center'>No ignored questions found.</div>;
    }

    return questionCollections.map((collection) => {
      const questions = questionsByCollectionMap[collection.id] || [];
      return (
        <>
          <div key={collection.id} className='flex w-full items-center justify-between'>
            <div className='flex items-center gap-3'>
              <AppTypography.h4>{collection.title}</AppTypography.h4>
              <AppBadge variant='outline'>{questions.length} questions</AppBadge>
              {selectedIgnoreQuestionIds.length > 0 && (
                <AppBadge variant='destructive'>{selectedIgnoreQuestionIds.length} ignored</AppBadge>
              )}
            </div>
          </div>
          <div className='space-y-2'>{questions.map((question) => _renderQuestionRow(question))}</div>
        </>
      );
    });
  }

  function _renderSaveButton() {
    const shouldShowSaveButton =
      initialIgnoreQuestionIds.size !== selectedIgnoreQuestionIds.length ||
      selectedIgnoreQuestionIds.some((id) => !initialIgnoreQuestionIds.has(id));
    return (
      shouldShowSaveButton && (
        <AppButton onClick={saveIgnoreQuestions} isLoading={batchIgnoreLoading}>
          Save
        </AppButton>
      )
    );
  }

  if (!testEditState.testDetails) {
    return null;
  }

  return (
    <AppCard.Root>
      <AppCard.Header>
        <AppCard.Title>Available Questions</AppCard.Title>
        <AppCard.Description>
          Questions that are available for the test. You can ignore them to make sure they are not used in the test.
        </AppCard.Description>
      </AppCard.Header>

      <AppCard.Content className='space-y-4'>
        {_renderQuestionCollections()}
        {_renderSaveButton()}
      </AppCard.Content>
    </AppCard.Root>
  );
}
