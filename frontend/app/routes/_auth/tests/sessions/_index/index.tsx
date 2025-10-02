import { useNavigate } from '@remix-run/react';
import { FilterIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import { TestSessionStatus } from 'app/graphql/graphqlTypes';
import {
  PaginateTestSessionsDocument,
  PaginateTestSessionsQuery,
  usePaginateTestSessionsQuery,
} from 'app/graphql/operations/testSession/paginateTestSessions.query.generated';
import { useDeleteTestSessionMutation } from 'app/graphql/operations/testSession/deleteTestSession.mutation.generated';
import { useStartTestSessionMutation } from 'app/graphql/operations/testSession/startTestSession.mutation.generated';
import { PaginationControls } from 'app/shared/components/custom/PaginationControls';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppCheckbox } from 'app/shared/components/ui/checkbox/AppCheckbox';
import { AppDialog } from 'app/shared/components/ui/dialog/AppDialog';
import { AppPopover } from 'app/shared/components/ui/popover/AppPopover';
import { AppSkeleton } from 'app/shared/components/ui/skeleton/AppSkeleton';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { apolloService } from 'app/shared/services/apollo.service';

import { TestSessionCard } from './components/TestSessionCard';

type TestSessionEntity = PaginateTestSessionsQuery['paginatedTestSessions']['items'][number];

const STATUS_OPTIONS = [
  { value: TestSessionStatus.Pending, label: 'Pending' },
  { value: TestSessionStatus.InProgress, label: 'In Progress' },
  { value: TestSessionStatus.Completed, label: 'Completed' },
  { value: TestSessionStatus.Expired, label: 'Expired' },
  { value: TestSessionStatus.Cancelled, label: 'Cancelled' },
];

export default function TestSessionsIndex() {
  const navigate = useNavigate();
  const [isStartConfirmModalOpen, setIsStartConfirmModalOpen] = useState(false);
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [optimisticDeletedId, setOptimisticDeletedId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<TestSessionStatus[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const selectedSession = useRef<TestSessionEntity | null>(null);

  // Number of test sessions displayed per page in the pagination grid
  const ITEMS_PER_PAGE = 10;

  const { data, loading, error } = usePaginateTestSessionsQuery({
    variables: {
      paginationInput: {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      },
      filterInput:
        selectedStatuses.length > 0
          ? {
              statuses: selectedStatuses,
            }
          : undefined,
    },
    fetchPolicy: 'network-only',
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

  function handleStatusToggle(status: TestSessionStatus) {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
    // Reset to first page when filter changes
    setCurrentPage(1);
  }

  function handleClearFilters() {
    setSelectedStatuses([]);
    setCurrentPage(1);
  }

  function renderStartConfirmationModal() {
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

  function renderDeleteConfirmationModal() {
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

  function renderTestSessionCard(session: TestSessionEntity) {
    return <TestSessionCard key={session.id} session={session} onDelete={handleDeleteSession} />;
  }

  function renderSkeletonCard(index: number) {
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

  function renderSkeletonCards() {
    return Array.from({ length: 6 }).map((_, index) => renderSkeletonCard(index));
  }

  if (loading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='mb-6'>
          <AppTypography.h1>Test Sessions</AppTypography.h1>
          <AppTypography.p className='text-muted-foreground mt-2'>Manage and view all test sessions</AppTypography.p>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>{renderSkeletonCards()}</div>
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
      <div className='mb-6 flex items-center justify-between'>
        <AppTypography.h1>Test Sessions</AppTypography.h1>

        {/* Filter Button */}
        <AppPopover.Root open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <AppPopover.Trigger asChild>
            <AppButton variant='outline' size='sm' className='gap-2'>
              <FilterIcon className='h-4 w-4' />
              Filter
              {selectedStatuses.length > 0 && (
                <AppBadge variant='secondary' className='ml-1 h-5 px-1'>
                  {selectedStatuses.length}
                </AppBadge>
              )}
            </AppButton>
          </AppPopover.Trigger>
          <AppPopover.Content align='end' className='w-64'>
            <div className='space-y-4'>
              <AppTypography.p className='text-sm font-semibold'>Filter by Status</AppTypography.p>

              <div className='space-y-3'>
                {STATUS_OPTIONS.map((option) => (
                  <div key={option.value} className='flex items-center space-x-2'>
                    <AppCheckbox
                      id={option.value}
                      checked={selectedStatuses.includes(option.value)}
                      onCheckedChange={() => handleStatusToggle(option.value)}
                    />
                    <label
                      htmlFor={option.value}
                      className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                      {option.label}
                    </label>
                  </div>
                ))}
              </div>

              {selectedStatuses.length > 0 && (
                <div className='border-t pt-3'>
                  <AppButton variant='outline' size='sm' onClick={handleClearFilters} className='w-full'>
                    Clear Filters
                  </AppButton>
                </div>
              )}
            </div>
          </AppPopover.Content>
        </AppPopover.Root>
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
            {testSessions.map(renderTestSessionCard)}
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

      {renderStartConfirmationModal()}
      {renderDeleteConfirmationModal()}
    </div>
  );
}
