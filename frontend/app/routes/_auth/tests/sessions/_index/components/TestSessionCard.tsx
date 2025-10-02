import { useNavigate } from '@remix-run/react';
import { CalendarIcon, Trash2Icon, UserIcon } from 'lucide-react';
import dayjs from 'dayjs';

import { PermissionEnum, TestSessionStatus } from 'app/graphql/graphqlTypes';
import { PaginateTestSessionsQuery } from 'app/graphql/operations/testSession/paginateTestSessions.query.generated';
import { Authorized } from 'app/shared/components/custom/Authorized';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';

import { ScoreRing } from './ScoreRing';

type TestSessionEntity = PaginateTestSessionsQuery['paginatedTestSessions']['items'][number];

interface TestSessionCardProps {
  readonly session: TestSessionEntity;
  readonly onDelete: (session: TestSessionEntity) => void;
  readonly onStart: (session: TestSessionEntity) => void;
}

// Convert decimal ratio to percentage
const PERCENTAGE_MULTIPLIER = 100;

/**
 * Displays a test session card with user info, status, and action buttons.
 * - Shows ScoreRing only for completed test sessions
 * - Renders "Start Test" button for pending sessions
 * - Renders "Resume Test" button for in-progress sessions
 * - Displays session metadata on hover
 */
export function TestSessionCard({ session, onDelete, onStart }: TestSessionCardProps) {
  const navigate = useNavigate();

  function _formatDateTime(dateString: string | null | undefined) {
    if (!dateString) return 'Not set';
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  }

  function _getStatusVariant(status: TestSessionStatus) {
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

  function _getStatusDisplay(status: TestSessionStatus) {
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

  function _handleStartTest() {
    onStart(session);
  }

  function _handleResumeTest() {
    navigate(`/tests/sessions/${session.id}`);
  }

  const percentage =
    session.maxPoints > 0 ? Math.round((session.pointsEarned / session.maxPoints) * PERCENTAGE_MULTIPLIER) : 0;
  const userName = session.user
    ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || session.user.username
    : 'Unknown User';

  return (
    <AppCard.Root className='group overflow-hidden transition-all hover:shadow-lg'>
      <AppCard.Content className='p-0'>
        {/* Header Section with Status Badge */}
        <div className='bg-muted/50 flex items-center justify-between px-4 py-3'>
          <div className='flex items-center gap-2'>
            <UserIcon className='text-muted-foreground h-4 w-4' />
            <span className='text-sm font-semibold'>{userName}</span>
          </div>
          <div className='flex items-center gap-2'>
            <AppBadge variant={_getStatusVariant(session.status)}>{_getStatusDisplay(session.status)}</AppBadge>
            <Authorized permissions={[PermissionEnum.SessionDelete]}>
              <AppButton
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session);
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
            {session.status === TestSessionStatus.Completed && (
              <ScoreRing percentage={percentage} pointsEarned={session.pointsEarned} maxPoints={session.maxPoints} />
            )}

            {/* Expiry Date - Only show if set */}
            {session.expiredAt && (
              <div className='flex flex-col items-end'>
                <span className='text-muted-foreground text-xs'>Expires</span>
                <div className='flex items-center gap-1'>
                  <CalendarIcon className='text-muted-foreground h-3 w-3' />
                  <span className='text-xs font-medium'>{_formatDateTime(session.expiredAt)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info - Shows on hover */}
          <div className='mb-4 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100'>
            <div className='border-muted space-y-2 border-t pt-3'>
              <div className='flex items-center justify-between text-xs'>
                <span className='text-muted-foreground'>Created</span>
                <span className='font-medium'>{_formatDateTime(session.createdAt)}</span>
              </div>
              {session.startedAt && (
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Started</span>
                  <span className='font-medium'>{_formatDateTime(session.startedAt)}</span>
                </div>
              )}
              {session.completedAt && (
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Completed</span>
                  <span className='font-medium'>{_formatDateTime(session.completedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button - Only for Pending and InProgress */}
          {session.status === TestSessionStatus.Pending && (
            <AppButton onClick={_handleStartTest} className='w-full' size='sm'>
              Start Test
            </AppButton>
          )}
          {session.status === TestSessionStatus.InProgress && (
            <AppButton onClick={_handleResumeTest} className='w-full' size='sm'>
              Resume Test
            </AppButton>
          )}
        </div>
      </AppCard.Content>
    </AppCard.Root>
  );
}
