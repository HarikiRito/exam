import { useNavigate } from '@remix-run/react';
import { CalendarIcon, ClockIcon, TrophyIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { TestSessionStatus } from 'app/graphql/graphqlTypes';
import {
  PaginateTestSessionsDocument,
  PaginateTestSessionsQuery,
  usePaginateTestSessionsQuery,
} from 'app/graphql/operations/testSession/paginateTestSessions.query.generated';
import { useStartTestSessionMutation } from 'app/graphql/operations/testSession/startTestSession.mutation.generated';
import { AppBadge } from 'app/shared/components/badge/AppBadge';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';
import { AppSkeleton } from 'app/shared/components/skeleton/AppSkeleton';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { apolloService } from 'app/shared/services/apollo.service';
import dayjs from 'dayjs';

type TestSessionEntity = PaginateTestSessionsQuery['paginatedTestSessions']['items'][number];
export default function TestSessionsIndex() {
  const navigate = useNavigate();
  const [isStartConfirmModalOpen, setIsStartConfirmModalOpen] = useState(false);

  const selectedSession = useRef<TestSessionEntity | null>(null);

  const { data, loading, error } = usePaginateTestSessionsQuery({
    variables: {
      paginationInput: {
        page: 1,
        limit: 50, // Display more items since we're using cards
      },
    },
  });

  // Start test session mutation
  const [startTestSession, { loading: startLoading }] = useStartTestSessionMutation({
    onCompleted: (data) => {
      toast.success('Test session started successfully!');
      setIsStartConfirmModalOpen(false);
      selectedSession.current = null;
      apolloService.invalidateQueries([PaginateTestSessionsDocument]);
      // Navigate to the started test session
      navigate(`/tests/sessions/${data.startTestSession.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to start test session: ${error.message}`);
    },
  });

  function formatDateTime(dateString: string | null | undefined) {
    if (!dateString) return 'Not set';

    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  }

  function getStatusVariant(status: TestSessionStatus) {
    switch (status) {
      case TestSessionStatus.Completed:
        return 'default';
      case TestSessionStatus.InProgress:
        return 'secondary';
      case TestSessionStatus.Pending:
        return 'outline';
      case TestSessionStatus.Expired:
      case TestSessionStatus.Cancelled:
        return 'destructive';
      default:
        return 'outline';
    }
  }

  function getStatusDisplay(status: TestSessionStatus) {
    switch (status) {
      case TestSessionStatus.Completed:
        return 'Completed';
      case TestSessionStatus.InProgress:
        return 'In Progress';
      case TestSessionStatus.Pending:
        return 'Pending';
      case TestSessionStatus.Expired:
        return 'Expired';
      case TestSessionStatus.Cancelled:
        return 'Cancelled';
      default:
        return status;
    }
  }

  function handleSessionAction(session: TestSessionEntity) {
    if (session.status === TestSessionStatus.InProgress) {
      // Resume test - navigate directly
      navigate(`/tests/sessions/${session.id}`);
    } else if (session.status === TestSessionStatus.Pending) {
      // Start test - show confirmation modal
      selectedSession.current = session;
      setIsStartConfirmModalOpen(true);
    } else {
      // View results or session details
      navigate(`/tests/sessions/${session.id}`);
    }
  }

  function handleConfirmStartSession() {
    if (!selectedSession.current) return;

    startTestSession({
      variables: {
        id: selectedSession.current.id,
      },
    });
  }

  function _renderStartConfirmationModal() {
    return (
      <AppDialog.Root open={isStartConfirmModalOpen} onOpenChange={setIsStartConfirmModalOpen}>
        <AppDialog.Content className='sm:max-w-md'>
          <AppDialog.Header>
            <AppDialog.Title>Start Test Session</AppDialog.Title>
            <AppDialog.Description>
              Are you sure you want to start this test session? Once started, the timer will begin and you cannot
              restart the session.
            </AppDialog.Description>
          </AppDialog.Header>

          <div className='space-y-4'>
            <div className='bg-muted rounded-md p-4'>
              <AppTypography.p className='text-destructive text-sm font-medium'>⚠️ Important Notice</AppTypography.p>
              <AppTypography.p className='text-muted-foreground mt-2 text-sm'>
                • The test timer will start immediately after confirmation
              </AppTypography.p>
              <AppTypography.p className='text-muted-foreground text-sm'>
                • You cannot pause or restart the session once started
              </AppTypography.p>
              <AppTypography.p className='text-muted-foreground text-sm'>
                • Make sure you have sufficient time to complete the test
              </AppTypography.p>
            </div>
          </div>

          <AppDialog.Footer>
            <AppButton
              variant='outline'
              onClick={() => {
                setIsStartConfirmModalOpen(false);
                selectedSession.current = null;
              }}>
              Cancel
            </AppButton>
            <AppButton onClick={handleConfirmStartSession} disabled={startLoading} variant='destructive'>
              {startLoading ? 'Starting...' : 'Start Test Session'}
            </AppButton>
          </AppDialog.Footer>
        </AppDialog.Content>
      </AppDialog.Root>
    );
  }

  function _renderTestSessionCard(session: TestSessionEntity) {
    const canStart = session.status === TestSessionStatus.Pending || session.status === TestSessionStatus.InProgress;

    return (
      <AppCard.Root key={session.id} className='transition-all hover:shadow-md'>
        <AppCard.Header>
          <div className='flex items-start justify-between'>
            <div className='flex-1'>
              <AppCard.Title className='text-lg'>
                {session.test.name} #{session.id.slice(-8)}
              </AppCard.Title>
              <AppCard.Description className='mt-1'>Created: {formatDateTime(session.createdAt)}</AppCard.Description>
            </div>
            <AppBadge variant={getStatusVariant(session.status)}>{getStatusDisplay(session.status)}</AppBadge>
          </div>
        </AppCard.Header>

        <AppCard.Content>
          <div className='space-y-3'>
            {/* Expiry Time */}
            <div className='flex items-center gap-2 text-sm'>
              <CalendarIcon className='text-muted-foreground h-4 w-4' />
              <span className='text-muted-foreground'>Expires:</span>
              <span className='font-medium'>{formatDateTime(session.expiredAt)}</span>
            </div>

            <div className='flex items-center gap-2 text-sm'>
              <TrophyIcon className='text-muted-foreground h-4 w-4' />
              <span className='text-muted-foreground'>Total score:</span>
              <span className='font-medium'>{session.maxPoints}</span>
            </div>

            {/* Points Earned (if completed) */}
            {session.status === TestSessionStatus.Completed && (
              <div className='flex items-center gap-2 text-sm'>
                <TrophyIcon className='h-4 w-4 text-green-600' />
                <span className='text-muted-foreground'>Score:</span>
                <span className='font-medium text-green-600'>{session.pointsEarned}</span>
              </div>
            )}

            {/* Started At (if started) */}
            {session.startedAt && (
              <div className='flex items-center gap-2 text-sm'>
                <ClockIcon className='text-muted-foreground h-4 w-4' />
                <span className='text-muted-foreground'>Started:</span>
                <span className='font-medium'>{formatDateTime(session.startedAt)}</span>
              </div>
            )}

            {/* Completed At (if completed) */}
            {session.completedAt && (
              <div className='flex items-center gap-2 text-sm'>
                <ClockIcon className='h-4 w-4 text-green-600' />
                <span className='text-muted-foreground'>Completed:</span>
                <span className='font-medium text-green-600'>{formatDateTime(session.completedAt)}</span>
              </div>
            )}
          </div>
        </AppCard.Content>

        <AppCard.Footer>
          <AppButton
            onClick={() => handleSessionAction(session)}
            variant={canStart ? 'default' : 'secondary'}
            className='w-full'>
            {session.status === TestSessionStatus.InProgress
              ? 'Resume Test'
              : session.status === TestSessionStatus.Pending
                ? 'Start Test'
                : session.status === TestSessionStatus.Completed
                  ? 'View Results'
                  : 'View Session'}
          </AppButton>
        </AppCard.Footer>
      </AppCard.Root>
    );
  }

  function _renderSkeletonCards() {
    return Array.from({ length: 6 }).map((_, index) => (
      <AppCard.Root key={index}>
        <AppCard.Header>
          <div className='flex items-start justify-between'>
            <div className='flex-1 space-y-2'>
              <AppSkeleton className='h-5 w-48' />
              <AppSkeleton className='h-4 w-32' />
            </div>
            <AppSkeleton className='h-6 w-20' />
          </div>
        </AppCard.Header>
        <AppCard.Content>
          <div className='space-y-3'>
            <AppSkeleton className='h-4 w-full' />
            <AppSkeleton className='h-4 w-3/4' />
            <AppSkeleton className='h-4 w-1/2' />
          </div>
        </AppCard.Content>
      </AppCard.Root>
    ));
  }

  if (loading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='mb-6'>
          <AppTypography.h1>Test Sessions</AppTypography.h1>
          <AppTypography.p className='text-muted-foreground mt-2'>Manage and view all test sessions</AppTypography.p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>{_renderSkeletonCards()}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-6'>
        <div className='mb-6'>
          <AppTypography.h1>Test Sessions</AppTypography.h1>
        </div>
        <AppCard.Root className='border-destructive'>
          <AppCard.Content className='pt-6'>
            <AppTypography.p className='text-destructive'>Error loading test sessions: {error.message}</AppTypography.p>
          </AppCard.Content>
        </AppCard.Root>
      </div>
    );
  }

  const testSessions = data?.paginatedTestSessions.items || [];
  const totalItems = data?.paginatedTestSessions.pagination.totalItems || 0;

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <AppTypography.h1>Test Sessions</AppTypography.h1>
          <AppTypography.p className='text-muted-foreground mt-2'>
            {totalItems === 0
              ? 'No test sessions found'
              : `Showing ${testSessions.length} of ${totalItems} test sessions`}
          </AppTypography.p>
        </div>
      </div>

      {testSessions.length === 0 ? (
        <AppCard.Root>
          <AppCard.Content className='pt-6 text-center'>
            <AppTypography.p className='text-muted-foreground'>No test sessions available yet.</AppTypography.p>
          </AppCard.Content>
        </AppCard.Root>
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {testSessions.map(_renderTestSessionCard)}
        </div>
      )}

      {_renderStartConfirmationModal()}
    </div>
  );
}
