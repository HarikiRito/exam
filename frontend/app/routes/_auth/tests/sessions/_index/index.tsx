import { useNavigate } from '@remix-run/react';
import { CalendarIcon, Trash2Icon, UserIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { PermissionEnum, TestSessionStatus } from 'app/graphql/graphqlTypes';
import {
  PaginateTestSessionsDocument,
  PaginateTestSessionsQuery,
  usePaginateTestSessionsQuery,
} from 'app/graphql/operations/testSession/paginateTestSessions.query.generated';
import { useDeleteTestSessionMutation } from 'app/graphql/operations/testSession/deleteTestSession.mutation.generated';
import { useStartTestSessionMutation } from 'app/graphql/operations/testSession/startTestSession.mutation.generated';
import { Authorized } from 'app/shared/components/custom/Authorized';
import { PaginationControls } from 'app/shared/components/custom/PaginationControls';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppDialog } from 'app/shared/components/ui/dialog/AppDialog';
import { AppSkeleton } from 'app/shared/components/ui/skeleton/AppSkeleton';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { apolloService } from 'app/shared/services/apollo.service';
import dayjs from 'dayjs';

import { ScoreRing } from './components/ScoreRing';

type TestSessionEntity = PaginateTestSessionsQuery['paginatedTestSessions']['items'][number];

export default function TestSessionsIndex() {
  const navigate = useNavigate();
  const [isStartConfirmModalOpen, setIsStartConfirmModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [optimisticDeletedId, setOptimisticDeletedId] = useState<string | null>(null);

  const selectedSession = useRef<TestSessionEntity | null>(null);

  const itemsPerPage = 10;

  const { data, loading, error } = usePaginateTestSessionsQuery({
    variables: {
      paginationInput: {
        page: currentPage,
        limit: itemsPerPage,
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

  // Delete test session mutation
  const [deleteTestSession, { loading: deleteLoading }] = useDeleteTestSessionMutation({
    onCompleted: () => {
      toast.success('Test session deleted successfully!');
      setIsDeleteConfirmModalOpen(false);
      selectedSession.current = null;
      setOptimisticDeletedId(null);
      apolloService.invalidateQueries([PaginateTestSessionsDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to delete test session: ${error.message}`);
      setIsDeleteConfirmModalOpen(false);
      setOptimisticDeletedId(null);
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

  function handleDeleteSession(session: TestSessionEntity) {
    selectedSession.current = session;
    setIsDeleteConfirmModalOpen(true);
  }

  function handleConfirmDeleteSession() {
    if (!selectedSession.current) return;

    const sessionId = selectedSession.current.id;

    // Optimistic UI update - immediately hide the item
    setOptimisticDeletedId(sessionId);

    deleteTestSession({
      variables: { id: sessionId },
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

  function _renderDeleteConfirmationModal() {
    return (
      <AppDialog.Root open={isDeleteConfirmModalOpen} onOpenChange={setIsDeleteConfirmModalOpen}>
        <AppDialog.Content className='sm:max-w-md'>
          <AppDialog.Header>
            <AppDialog.Title>Delete Test Session</AppDialog.Title>
            <AppDialog.Description>
              This will permanently delete the test session and all associated data. This action cannot be undone.
            </AppDialog.Description>
          </AppDialog.Header>

          <AppDialog.Footer>
            <AppButton
              variant='outline'
              onClick={() => {
                setIsDeleteConfirmModalOpen(false);
                selectedSession.current = null;
              }}>
              Cancel
            </AppButton>
            <AppButton onClick={handleConfirmDeleteSession} disabled={deleteLoading} variant='destructive'>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </AppButton>
          </AppDialog.Footer>
        </AppDialog.Content>
      </AppDialog.Root>
    );
  }

  function _renderTestSessionCard(session: TestSessionEntity) {
    const percentage = session.maxPoints > 0 ? Math.round((session.pointsEarned / session.maxPoints) * 100) : 0;
    const userName = session.user
      ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || session.user.username
      : 'Unknown User';

    return (
      <AppCard.Root key={session.id} className='group overflow-hidden transition-all hover:shadow-lg'>
        <AppCard.Content className='p-0'>
          {/* Header Section with Status Badge */}
          <div className='bg-muted/50 flex items-center justify-between px-4 py-3'>
            <div className='flex items-center gap-2'>
              <UserIcon className='text-muted-foreground h-4 w-4' />
              <span className='text-sm font-semibold'>{userName}</span>
            </div>
            <div className='flex items-center gap-2'>
              <AppBadge variant={getStatusVariant(session.status)}>{getStatusDisplay(session.status)}</AppBadge>
              <Authorized permissions={[PermissionEnum.SessionDelete]}>
                <AppButton
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session);
                  }}
                  aria-label='Delete test session'>
                  <Trash2Icon className='h-4 w-4' />
                </AppButton>
              </Authorized>
            </div>
          </div>

          {/* Main Content */}
          <div className='p-4'>
            <div className='mb-4'>
              <AppTypography.p className='line-clamp-1 text-base font-medium'>{session.test.name}</AppTypography.p>
            </div>

            {/* Score and Date Section */}
            <div className='mb-4 flex items-center justify-between'>
              {/* Score Ring - Only show for completed tests */}
              {session.status === TestSessionStatus.Completed ? (
                <ScoreRing percentage={percentage} pointsEarned={session.pointsEarned} maxPoints={session.maxPoints} />
              ) : (
                <div className='flex items-center gap-2'>
                  <div className='bg-muted flex h-12 w-12 items-center justify-center rounded-full'>
                    <span className='text-muted-foreground text-sm font-semibold'>{session.maxPoints}</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='text-muted-foreground text-xs'>Total Points</span>
                    <span className='text-sm font-medium'>{session.maxPoints} pts</span>
                  </div>
                </div>
              )}

              {/* Expiry Date */}
              <div className='flex flex-col items-end'>
                <span className='text-muted-foreground text-xs'>Expires</span>
                <div className='flex items-center gap-1'>
                  <CalendarIcon className='text-muted-foreground h-3 w-3' />
                  <span className='text-xs font-medium'>{formatDateTime(session.expiredAt)}</span>
                </div>
              </div>
            </div>

            {/* Additional Info - Shows on hover */}
            <div className='mb-4 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100'>
              <div className='border-muted space-y-2 border-t pt-3'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Created</span>
                  <span className='font-medium'>{formatDateTime(session.createdAt)}</span>
                </div>
                {session.startedAt && (
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-muted-foreground'>Started</span>
                    <span className='font-medium'>{formatDateTime(session.startedAt)}</span>
                  </div>
                )}
                {session.completedAt && (
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-muted-foreground'>Completed</span>
                    <span className='font-medium'>{formatDateTime(session.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button - Only for Pending and InProgress */}
            {session.status === TestSessionStatus.Pending && (
              <AppButton onClick={() => handleSessionAction(session)} className='w-full' size='sm'>
                Start Test
              </AppButton>
            )}
            {session.status === TestSessionStatus.InProgress && (
              <AppButton onClick={() => handleSessionAction(session)} className='w-full' size='sm'>
                Resume Test
              </AppButton>
            )}
          </div>
        </AppCard.Content>
      </AppCard.Root>
    );
  }

  function _renderSkeletonCard(index: number) {
    return (
      <AppCard.Root key={index}>
        <AppCard.Content className='p-0'>
          <div className='bg-muted/50 flex items-center justify-between px-4 py-3'>
            <AppSkeleton className='h-4 w-32' />
            <AppSkeleton className='h-6 w-20' />
          </div>
          <div className='space-y-4 p-4'>
            <AppSkeleton className='h-4 w-full' />
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <AppSkeleton className='h-14 w-14 rounded-full' />
                <div className='space-y-2'>
                  <AppSkeleton className='h-3 w-16' />
                  <AppSkeleton className='h-4 w-20' />
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <AppSkeleton className='h-3 w-12' />
                <AppSkeleton className='h-3 w-24' />
              </div>
            </div>
            <AppSkeleton className='h-9 w-full' />
          </div>
        </AppCard.Content>
      </AppCard.Root>
    );
  }

  function _renderSkeletonCards() {
    return Array.from({ length: 6 }).map((_, index) => _renderSkeletonCard(index));
  }

  if (loading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='mb-6'>
          <AppTypography.h1>Test Sessions</AppTypography.h1>
          <AppTypography.p className='text-muted-foreground mt-2'>Manage and view all test sessions</AppTypography.p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>{_renderSkeletonCards()}</div>
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

  const allSessions = data?.paginatedTestSessions.items || [];
  const pagination = data?.paginatedTestSessions.pagination;
  const totalItems = pagination?.totalItems || 0;

  // Filter out optimistically deleted item
  const testSessions = allSessions.filter((session) => session.id !== optimisticDeletedId);

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <AppTypography.h1>Test Sessions</AppTypography.h1>
      </div>

      {testSessions.length === 0 ? (
        <AppCard.Root>
          <AppCard.Content className='pt-6 text-center'>
            <AppTypography.p className='text-muted-foreground'>No test sessions available yet.</AppTypography.p>
          </AppCard.Content>
        </AppCard.Root>
      ) : (
        <div className='relative'>
          {loading && (
            <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/80'>
              <div className='flex flex-col items-center gap-2'>
                <div className='border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent' />
                <AppTypography.p className='muted-foreground text-sm'>Loading...</AppTypography.p>
              </div>
            </div>
          )}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {testSessions.map(_renderTestSessionCard)}
          </div>
          {pagination && (
            <PaginationControls
              pagination={pagination}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              currentItemsCount={allSessions.length}
            />
          )}
        </div>
      )}

      {_renderStartConfirmationModal()}
      {_renderDeleteConfirmationModal()}
    </div>
  );
}
