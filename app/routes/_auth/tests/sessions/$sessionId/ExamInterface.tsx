import { useParams } from '@remix-run/react';
import { useGetQuestionsByIdsQuery } from 'app/graphql/operations/question/getQuestionsByIds.query.generated';
import { useGetTestSessionQuery } from 'app/graphql/operations/testSession/getTestSession.query.generated';
import { testSessionActions, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppSkeleton } from 'app/shared/components/skeleton/AppSkeleton';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { FinishExamDialog } from './components/FinishExamDialog';
import { QuestionOverviewSheet } from './components/QuestionOverviewSheet';
import { QuestionSection } from './components/QuestionSection';
import { TopNavBar } from './components/TopNavBar';

const state = testSessionStore.proxyState;

export default function ExamInterface() {
  testSessionStore.useResetHook();
  const snapshot = testSessionStore.useStateSnapshot();
  const { sessionId } = useParams();

  // Fetch test session data
  const {
    data: testSessionData,
    loading: testSessionLoading,
    error: testSessionError,
  } = useGetTestSessionQuery({
    variables: { id: sessionId! },
    skip: !sessionId,
  });

  const testSession = testSessionData?.testSession;

  // Extract question IDs from ordered questions
  const questionIds = useMemo(() => {
    return testSessionData?.testSession?.orderedQuestions?.map((item) => item.questionId) || [];
  }, [testSessionData]);

  // Fetch questions by IDs
  const {
    data: questionsData,
    loading: questionsLoading,
    error: questionsError,
  } = useGetQuestionsByIdsQuery({
    variables: { ids: questionIds },
    skip: questionIds.length === 0,
  });

  const questions = useMemo(() => {
    if (!testSession?.orderedQuestions || !questionsData?.questions) return [];

    const orderedQuestions = testSession.orderedQuestions;

    // Create a map of questionId to order
    const orderMap = orderedQuestions.reduce<Record<string, number>>((acc, item) => {
      acc[item.questionId] = item.order;
      return acc;
    }, {});

    const items = questionsData.questions.map((question) => {
      const order = orderMap[question.id] || 0;
      return {
        question,
        order,
      };
    });

    items.sort((a, b) => a.order - b.order);

    return items.map((item) => item.question);
  }, [testSession, questionsData]);

  useEffect(() => {
    if (questions.length === 0) return;

    state.questions = questions;
  }, [questions]);

  // Calculate remaining time based on test expiration
  const remainingTime = useMemo(() => {
    if (!testSessionData?.testSession?.expiredAt) return snapshot.timeLeft;

    const expiredAt = new Date(testSessionData.testSession.expiredAt).getTime();
    const now = Date.now();
    const remaining = Math.max(0, expiredAt - now);

    return remaining;
  }, [testSessionData?.testSession?.expiredAt, snapshot.timeLeft]);

  // Update state when data is loaded
  useEffect(() => {
    if (testSessionData?.testSession) {
      testSessionActions.handleStartExam();
      // Initialize time with calculated remaining time
      state.timeLeft = remainingTime;
    }
  }, [testSessionData, remainingTime]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      testSessionActions.stopTimer();
    };
  }, []);

  // Combined loading state
  const loading = testSessionLoading || questionsLoading;
  const error = testSessionError || questionsError;

  // Loading state
  if (loading) {
    return (
      <div className='flex h-screen flex-col bg-white'>
        {/* Top Navigation Bar Skeleton */}
        <div className='flex h-[60px] items-center justify-between border-b bg-white px-4 md:px-6 lg:px-8'>
          <AppSkeleton className='h-6 w-32' />
          <AppSkeleton className='h-6 w-48' />
          <AppSkeleton className='h-6 w-24' />
        </div>

        {/* Main Content Skeleton */}
        <main className='flex flex-1 flex-col items-center justify-start bg-gray-50 px-4 py-6'>
          <div className='w-full max-w-4xl space-y-6'>
            <AppSkeleton className='h-8 w-3/4' />
            <div className='space-y-4'>
              {Array.from({ length: 4 }).map((_, index) => (
                <AppSkeleton key={index} className='h-12 w-full' />
              ))}
            </div>
          </div>
        </main>

        {/* Bottom Navigation Skeleton */}
        <footer className='flex h-[80px] items-center justify-between border-t bg-white px-4'>
          <AppSkeleton className='h-10 w-24' />
          <AppSkeleton className='h-10 w-24' />
        </footer>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='flex h-screen flex-col items-center justify-center bg-white p-6'>
        <AppCard.Root className='border-destructive w-full max-w-md'>
          <AppCard.Header>
            <AppCard.Title className='text-destructive'>Error Loading Test Session</AppCard.Title>
          </AppCard.Header>
          <AppCard.Content>
            <AppTypography.p className='text-muted-foreground'>
              {error.message || 'Failed to load test session data'}
            </AppTypography.p>
          </AppCard.Content>
        </AppCard.Root>
      </div>
    );
  }

  // No questions state
  if (snapshot.questions.length === 0) {
    return (
      <div className='flex h-screen flex-col items-center justify-center bg-white p-6'>
        <AppCard.Root className='w-full max-w-md'>
          <AppCard.Header>
            <AppCard.Title>No Questions Available</AppCard.Title>
          </AppCard.Header>
          <AppCard.Content>
            <AppTypography.p className='text-muted-foreground'>
              This test session does not contain any questions.
            </AppTypography.p>
          </AppCard.Content>
        </AppCard.Root>
      </div>
    );
  }

  return (
    <div className='flex h-screen flex-col bg-white'>
      {/* Test Information Header */}
      {testSession && (
        <div className='border-b bg-gray-50 px-4 py-2'>
          <div className='flex items-center justify-between'>
            <div>
              <AppTypography.h2 className='text-lg font-semibold'>{testSession.test.name}</AppTypography.h2>
              <AppTypography.p className='text-muted-foreground text-sm'>
                Test Session ID: {testSession.id.slice(-8)}
              </AppTypography.p>
            </div>
            <div className='text-right'>
              <AppTypography.p className='text-sm font-medium'>
                Total Time: {testSession.test.totalTime ? `${testSession.test.totalTime} minutes` : 'Unlimited'}
              </AppTypography.p>
              <AppTypography.p className='text-muted-foreground text-sm'>
                Max Points: {testSession.maxPoints}
              </AppTypography.p>
            </div>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <TopNavBar />

      {/* Main Content Area */}
      <main className='flex flex-1 flex-col items-center justify-start bg-gray-50 px-4 py-6 md:px-6 lg:px-8'>
        <div className='max-w-[400px]'>
          <QuestionOverviewSheet />
        </div>
        <QuestionSection />
      </main>

      {/* Bottom Navigation Buttons */}
      <footer className='flex h-[80px] items-center justify-between border-t bg-white px-4 md:px-6 lg:px-8'>
        <AppButton
          variant='outline'
          onClick={testSessionActions.handlePrevious}
          disabled={snapshot.isFirstQuestion}
          aria-label='Previous question'>
          <ChevronLeft className='mr-2 h-5 w-5' />
          Previous
        </AppButton>

        <AppButton
          onClick={testSessionActions.handleNext}
          aria-label={snapshot.isLastQuestion ? 'Finish exam' : 'Next question'}>
          {snapshot.isLastQuestion ? 'Finish Exam' : 'Next'}
          <ChevronRight className='ml-2 h-5 w-5' />
        </AppButton>
      </footer>

      {/* Finish Exam Confirmation Dialog */}
      <FinishExamDialog />
    </div>
  );
}
