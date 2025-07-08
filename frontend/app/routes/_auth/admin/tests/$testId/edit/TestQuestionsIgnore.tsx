import { useParams } from '@remix-run/react';
import { Flag, FlagOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useBatchIgnoreQuestionsMutation } from 'app/graphql/operations/test/batchIgnoreQuestions.mutation.generated';
import { GetTestDocument, GetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppMarkdown } from 'app/shared/components/ui/markdown/AppMarkdown';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { apolloService } from 'app/shared/services/apollo.service';
import { testEditStore } from './testEditStore';
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

  function _renderQuestionRow(question: Question) {
    const isIgnore = selectedIgnoreQuestionIds.includes(question.id);

    return (
      <div key={question.id} className='rounded-lg border p-3'>
        <div className='flex w-full items-center justify-between p-0 text-left hover:no-underline'>
          <div className='flex w-full items-center gap-3'>
            <div className='flex w-full items-center gap-2'>
              <div className='flex items-center gap-2 truncate' title={question.questionText}>
                <AppMarkdown>{question.questionText}</AppMarkdown>
                <span className='text-muted-foreground'>({question.points.toString()} pts)</span>
              </div>
              {isIgnore && <AppBadge className='text-xs'>Ignored</AppBadge>}
            </div>
          </div>
          {/* TODO: Add a view button that link to the question detail page */}
          <AppButton
            variant='ghost'
            size='icon'
            onClick={(e) => {
              e.stopPropagation();
              handleQuestionSelect(question.id, !isIgnore);
            }}>
            {isIgnore ? <FlagOff className='size-4' /> : <Flag className='size-4' />}
          </AppButton>
        </div>
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
