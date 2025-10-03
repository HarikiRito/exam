import { useParams } from '@remix-run/react';
import { Loader2 } from 'lucide-react';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { ResultHeader } from './components/ResultHeader';
import { GroupedQuestionsList } from './components/GroupedQuestionsList';
import { useGetTestSessionResultQuery } from 'app/graphql/operations/testSession/getTestSessionResult.query.generated';
import { resultStore } from './state';

export default function TestSessionResultPage() {
  resultStore.useResetHook();
  const { sessionId } = useParams();

  const { data, loading, error } = useGetTestSessionResultQuery({
    variables: { id: sessionId! },
    skip: !sessionId,
  });

  if (loading) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <Loader2 className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  if (error || !data?.testSessionResult) {
    return (
      <div className='container mx-auto max-w-6xl py-8'>
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <AppTypography.p className='text-red-700'>
            Failed to load test results. Please try again later.
          </AppTypography.p>
        </div>
      </div>
    );
  }

  const result = data.testSessionResult;
  const { testSession, questions } = result;

  return (
    <div className='flex h-full flex-col overflow-y-auto'>
      <div className='container mx-auto max-w-6xl space-y-6 py-8'>
        <ResultHeader
          testName={testSession.test.name}
          completedAt={testSession.completedAt}
          userName={testSession.user?.email}
          pointsEarned={testSession.pointsEarned}
          maxPoints={testSession.maxPoints}
        />

        <GroupedQuestionsList questions={questions} />
      </div>
    </div>
  );
}
