import { useQuestionCountByPointsQuery } from 'app/graphql/operations/questionCollection/questionCountByPoints.query.generated';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { testEditStore } from './testEditStore';
import { useMemo } from 'react';

export function QuestionCountsByPoints() {
  const testEditState = testEditStore.useStateSnapshot();

  // Get collection IDs from the test data
  const collectionIds = testEditState.testDetails?.questionCollections?.map((collection) => collection.id) || [];

  // Fetch question counts by points
  const { data: questionCountsData, loading } = useQuestionCountByPointsQuery({
    variables: { collectionIds },
    skip: collectionIds.length === 0,
  });

  // Sort by points for better organization
  const sortedQuestionCounts = useMemo(() => {
    if (!questionCountsData?.questionCountByPoints) return [];
    return [...questionCountsData.questionCountByPoints].sort((a, b) => a.points - b.points);
  }, [questionCountsData?.questionCountByPoints]);

  if (loading) {
    return (
      <AppCard.Root>
        <AppCard.Header>
          <AppCard.Title>Available Questions by Points</AppCard.Title>
        </AppCard.Header>
        <AppCard.Content>
          <AppTypography.p>Loading question counts...</AppTypography.p>
        </AppCard.Content>
      </AppCard.Root>
    );
  }

  if (!questionCountsData?.questionCountByPoints || questionCountsData.questionCountByPoints.length === 0) {
    return (
      <AppCard.Root>
        <AppCard.Header>
          <AppCard.Title>Available Questions by Points</AppCard.Title>
        </AppCard.Header>
        <AppCard.Content>
          <AppTypography.p className='text-muted-foreground'>
            No questions available in the selected collections.
          </AppTypography.p>
        </AppCard.Content>
      </AppCard.Root>
    );
  }

  return (
    <AppCard.Root>
      <AppCard.Header>
        <AppCard.Title>Available Questions by Points</AppCard.Title>
      </AppCard.Header>
      <AppCard.Content>
        <div className='flex flex-wrap gap-2'>
          {sortedQuestionCounts.map((pointCount) => (
            <AppBadge key={pointCount.points} variant='outline'>
              {pointCount.points} points:
              <span>{pointCount.count}</span>
            </AppBadge>
          ))}
        </div>
        <AppTypography.p>
          Total: <span>{sortedQuestionCounts.reduce((acc, curr) => acc + curr.count, 0)} questions</span>
        </AppTypography.p>
      </AppCard.Content>
    </AppCard.Root>
  );
}
