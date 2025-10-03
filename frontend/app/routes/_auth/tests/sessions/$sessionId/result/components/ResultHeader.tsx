import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppTooltip } from 'app/shared/components/ui/tooltip/AppTooltip';
import { ArrowLeft, CalendarIcon, TrophyIcon, UserIcon } from 'lucide-react';
import { useNavigate } from '@remix-run/react';
import dayjs from 'dayjs';

// Convert decimal ratio to percentage (multiply by 100)
const PERCENTAGE_MULTIPLIER = 100;

interface ResultHeaderProps {
  readonly testName: string;
  readonly completedAt?: string | null;
  readonly userName?: string;
  readonly pointsEarned: number;
  readonly maxPoints: number;
}

export function ResultHeader({ testName, completedAt, userName, pointsEarned, maxPoints }: ResultHeaderProps) {
  const navigate = useNavigate();
  const percentage = maxPoints > 0 ? Math.round((pointsEarned / maxPoints) * PERCENTAGE_MULTIPLIER) : 0;
  const formattedDate = completedAt ? dayjs(completedAt).format('DD/MM/YYYY HH:mm') : 'Not completed';
  const fullDateTime = completedAt ? dayjs(completedAt).format('DD/MM/YYYY HH:mm:ss') : 'Not completed';

  function _getScoreVariant() {
    if (percentage >= 80) return 'default';
    if (percentage >= 50) return 'secondary';
    return 'destructive';
  }

  function _handleBack() {
    navigate(-1);
  }

  return (
    <div className='bg-muted/30 rounded-lg px-4 py-2.5'>
      <div className='flex items-center gap-3'>
        <AppButton variant='ghost' size='icon' onClick={_handleBack} className='h-8 w-8 shrink-0'>
          <ArrowLeft className='h-4 w-4' />
        </AppButton>
        <div className='bg-border h-4 w-px' />
        <AppTypography.small className='min-w-0 flex-1 truncate font-semibold'>{testName}</AppTypography.small>
        <div className='flex shrink-0 items-center gap-2'>
          <div className='bg-border h-4 w-px' />
          <UserIcon className='text-muted-foreground h-3.5 w-3.5' />
          <AppTypography.small className='text-muted-foreground'>{userName}</AppTypography.small>
          <div className='bg-border h-4 w-px' />
          <TrophyIcon className='text-muted-foreground h-3.5 w-3.5' />
          <AppTypography.small>
            {pointsEarned}/{maxPoints}
          </AppTypography.small>
          <AppBadge variant={_getScoreVariant()}>{percentage}%</AppBadge>
          <div className='bg-border h-4 w-px' />
          <AppTooltip.Root>
            <AppTooltip.Trigger asChild>
              <div className='flex cursor-help items-center gap-1.5'>
                <CalendarIcon className='text-muted-foreground h-3.5 w-3.5' />
                <AppTypography.small className='text-muted-foreground text-xs'>{formattedDate}</AppTypography.small>
              </div>
            </AppTooltip.Trigger>
            <AppTooltip.Content>Completed at: {fullDateTime}</AppTooltip.Content>
          </AppTooltip.Root>
        </div>
      </div>
    </div>
  );
}
