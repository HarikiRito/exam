import { useNavigate, useParams } from '@remix-run/react';
import { TestSessionStatus } from 'app/graphql/graphqlTypes';
import { useGetTestSessionQuery } from 'app/graphql/operations/testSession/getTestSession.query.generated';
import { testSessionState, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppSkeleton } from 'app/shared/components/ui/skeleton/AppSkeleton';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { FinishExamDialog } from './components/FinishExamDialog';
import { QuestionOverviewSheet } from './components/QuestionOverviewSheet';
import { QuestionSection } from './components/QuestionSection';
import { TopNavBar } from './components/TopNavBar';

export default function ExamInterface() {
  testSessionStore.useResetHook();
  const snapshot = testSessionStore.useStateSnapshot();
  const { sessionId } = useParams();
  const navigate = useNavigate();
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

  const testStatus = testSessionData?.testSession?.status;
  const isTestInProgress = testStatus === TestSessionStatus.InProgress;

  useEffect(() => {
    const questions = testSession?.questions;
    if (!testSession?.orderedQuestions || !questions) return;

    const orderedQuestions = testSession.orderedQuestions;

    // Create a map of questionId to order
    const orderMap = orderedQuestions.reduce<Record<string, number>>((acc, item) => {
      acc[item.questionId] = item.order;
      return acc;
    }, {});

    const items = questions.map((question) => {
      const order = orderMap[question.id] || 0;
      return {
        question,
        order,
      };
    });

    items.sort((a, b) => a.order - b.order);

    testSessionState.questions = items.map((item) => item.question);
  }, [testSession]);

  useEffect(() => {
    if (!testSession) return;

    const expiredAt = dayjs(testSession.expiredAt);

    const timeLeftInSeconds = expiredAt.diff(dayjs(), 'seconds');

    testSessionState.timeLeft = timeLeftInSeconds;
  }, [testSession]);

  // Combined loading state
  const loading = testSessionLoading;
  const error = testSessionError;

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
  if (error || !isTestInProgress) {
    return (
      <div className='flex h-screen flex-col items-center justify-center bg-white p-6'>
        <AppCard.Root className='border-destructive w-full max-w-md'>
          <AppCard.Header>
            <AppCard.Title className='text-destructive'>Error Loading Test Session</AppCard.Title>
          </AppCard.Header>
          <AppCard.Content>
            <AppTypography.p className='text-muted-foreground'>
              Failed to load test session data. Make sure the test session is still in progress.
            </AppTypography.p>
            <AppButton onClick={() => navigate(APP_ROUTES.testSessions)} className='mt-4'>
              Back to Test Sessions
            </AppButton>
          </AppCard.Content>
        </AppCard.Root>
      </div>
    );
  }

  // No questions state
  if (snapshot.totalQuestions === 0) {
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
      {/* Top Navigation Bar */}
      <TopNavBar />

      {/* Main Content Area */}
      <main className='flex flex-1 flex-col items-center justify-start bg-gray-50 px-4 py-6 sm:px-6 lg:px-8'>
        <div className='max-w-[400px]'>
          <QuestionOverviewSheet />
        </div>
        <QuestionSection />
      </main>

      {/* Bottom Navigation Buttons */}
      <footer className='flex h-[80px] items-center justify-between border-t bg-white px-4 sm:px-6 lg:px-8'>
        <AppButton
          variant='outline'
          onClick={testSessionState.handlePrevious}
          disabled={snapshot.isFirstQuestion}
          aria-label='Previous question'>
          <ChevronLeft className='mr-2 h-5 w-5' />
          Previous
        </AppButton>

        <AppButton onClick={testSessionState.handleNext} disabled={snapshot.isLastQuestion} aria-label='Next question'>
          Next
          <ChevronRight className='ml-2 h-5 w-5' />
        </AppButton>
      </footer>

      {/* Finish Exam Confirmation Dialog */}
      <FinishExamDialog />
    </div>
  );
}
