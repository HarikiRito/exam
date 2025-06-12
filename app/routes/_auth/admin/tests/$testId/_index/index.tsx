import { useParams, useNavigate } from '@remix-run/react';
import { PencilIcon, ArrowLeft } from 'lucide-react';

import { useGetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { AppBadge } from 'app/shared/components/badge/AppBadge';
import { APP_ROUTES } from 'app/shared/constants/routes';

export default function TestDetail() {
  const { testId } = useParams();
  const navigate = useNavigate();

  if (!testId) {
    navigate(APP_ROUTES.adminTests);
    return null;
  }

  // Fetch test data
  const { data: testData, loading: testLoading } = useGetTestQuery({
    variables: { id: testId },
  });

  const test = testData?.test;

  if (testLoading) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>Loading...</AppTypography.h1>
      </div>
    );
  }

  if (!test) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>Test not found</AppTypography.h1>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center gap-4'>
        <AppButton variant='outline' size='icon' onClick={() => navigate(APP_ROUTES.adminTests)}>
          <ArrowLeft className='h-4 w-4' />
        </AppButton>
        <div className='flex-1'>
          <AppTypography.h1>{test.name}</AppTypography.h1>
          <AppTypography.muted>Test details and configuration</AppTypography.muted>
        </div>
        <AppButton onClick={() => navigate(APP_ROUTES.adminTestEdit(testId))} className='flex items-center gap-2'>
          <PencilIcon className='h-4 w-4' />
          Edit Test
        </AppButton>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Basic Information */}
        <AppCard.Root>
          <AppCard.Header>
            <AppCard.Title>Basic Information</AppCard.Title>
          </AppCard.Header>
          <AppCard.Content className='space-y-4'>
            <div>
              <AppTypography.large className='font-medium'>Test Name</AppTypography.large>
              <AppTypography.p>{test.name}</AppTypography.p>
            </div>

            <div>
              <AppTypography.large className='font-medium'>Associated Course</AppTypography.large>
              {test.course ? (
                <AppTypography.p>{test.course.title}</AppTypography.p>
              ) : (
                <AppTypography.muted>No course assigned</AppTypography.muted>
              )}
            </div>

            <div>
              <AppTypography.large className='font-medium'>Course Section</AppTypography.large>
              {test.courseSection ? (
                <AppTypography.p>{test.courseSection.title}</AppTypography.p>
              ) : (
                <AppTypography.muted>No section assigned</AppTypography.muted>
              )}
            </div>
          </AppCard.Content>
        </AppCard.Root>

        {/* Question Collections */}
        <AppCard.Root>
          <AppCard.Header>
            <AppCard.Title>Question Collections</AppCard.Title>
            <AppCard.Description>Collections associated with this test</AppCard.Description>
          </AppCard.Header>
          <AppCard.Content>
            {test.questionCollections.length > 0 ? (
              <div className='space-y-3'>
                {test.questionCollections.map((collection) => (
                  <div key={collection.id} className='rounded-lg border p-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <AppTypography.large className='font-medium'>{collection.title}</AppTypography.large>
                        {collection.description && (
                          <AppTypography.muted className='mt-1'>{collection.description}</AppTypography.muted>
                        )}
                      </div>
                      <AppBadge variant='secondary'>Collection</AppBadge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AppTypography.muted>No collections assigned to this test yet.</AppTypography.muted>
            )}
          </AppCard.Content>
        </AppCard.Root>

        {/* Test Question Counts */}
        {test.testQuestionCounts.length > 0 && (
          <AppCard.Root>
            <AppCard.Header>
              <AppCard.Title>Question Counts</AppCard.Title>
              <AppCard.Description>Number of questions and points configuration</AppCard.Description>
            </AppCard.Header>
            <AppCard.Content>
              <div className='space-y-3'>
                {test.testQuestionCounts.map((count) => (
                  <div key={count.id} className='flex items-center justify-between rounded-lg border p-3'>
                    <div>
                      <AppTypography.large className='font-medium'>
                        {count.numberOfQuestions} Questions
                      </AppTypography.large>
                      <AppTypography.muted>{count.points} points each</AppTypography.muted>
                    </div>
                    <AppBadge variant='outline'>{count.numberOfQuestions * count.points} total points</AppBadge>
                  </div>
                ))}
              </div>
            </AppCard.Content>
          </AppCard.Root>
        )}

        {/* Test Question Points */}
        {test.testQuestionPoints.length > 0 && (
          <AppCard.Root>
            <AppCard.Header>
              <AppCard.Title>Custom Question Points</AppCard.Title>
              <AppCard.Description>Individual question point overrides</AppCard.Description>
            </AppCard.Header>
            <AppCard.Content>
              <div className='space-y-3'>
                {test.testQuestionPoints.map((point) => (
                  <div key={point.id} className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='flex-1'>
                      <AppTypography.large className='font-medium'>
                        {point.question?.questionText || 'Question'}
                      </AppTypography.large>
                    </div>
                    <AppBadge variant='secondary'>{point.points} points</AppBadge>
                  </div>
                ))}
              </div>
            </AppCard.Content>
          </AppCard.Root>
        )}

        {/* Ignored Questions */}
        {test.testIgnoreQuestions.length > 0 && (
          <AppCard.Root>
            <AppCard.Header>
              <AppCard.Title>Ignored Questions</AppCard.Title>
              <AppCard.Description>Questions excluded from this test</AppCard.Description>
            </AppCard.Header>
            <AppCard.Content>
              <div className='space-y-3'>
                {test.testIgnoreQuestions.map((ignored) => (
                  <div key={ignored.id} className='rounded-lg border p-3'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <AppTypography.large className='font-medium'>
                          {ignored.question?.questionText || 'Question'}
                        </AppTypography.large>
                        {ignored.reason && (
                          <AppTypography.muted className='mt-1'>Reason: {ignored.reason}</AppTypography.muted>
                        )}
                      </div>
                      <AppBadge variant='destructive'>Ignored</AppBadge>
                    </div>
                  </div>
                ))}
              </div>
            </AppCard.Content>
          </AppCard.Root>
        )}
      </div>
    </div>
  );
}
