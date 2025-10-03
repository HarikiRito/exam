import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { CheckCircle2, XCircle, Trophy } from 'lucide-react';

// Convert decimal ratio to percentage (multiply by 100)
const PERCENTAGE_MULTIPLIER = 100;

interface ResultOverviewProps {
  readonly pointsEarned: number;
  readonly maxPoints: number;
  readonly correctCount: number;
  readonly incorrectCount: number;
  readonly totalQuestions: number;
}

export function ResultOverview({
  pointsEarned,
  maxPoints,
  correctCount,
  incorrectCount,
  totalQuestions,
}: ResultOverviewProps) {
  const percentage = maxPoints > 0 ? Math.round((pointsEarned / maxPoints) * PERCENTAGE_MULTIPLIER) : 0;

  return (
    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
      <div className='bg-card flex items-start gap-2.5 rounded-lg border p-3'>
        <div className='bg-primary/10 rounded-lg p-2'>
          <Trophy className='text-primary h-5 w-5' />
        </div>
        <div>
          <AppTypography.small className='text-muted-foreground'>Score</AppTypography.small>
          <AppTypography.p className='text-xl font-bold'>
            {pointsEarned}/{maxPoints}
          </AppTypography.p>
          <AppTypography.small className='text-muted-foreground text-xs'>{percentage}%</AppTypography.small>
        </div>
      </div>

      <div className='bg-card flex items-start gap-2.5 rounded-lg border p-3'>
        <div className='rounded-lg bg-green-500/10 p-2'>
          <CheckCircle2 className='h-5 w-5 text-green-600' />
        </div>
        <div>
          <AppTypography.small className='text-muted-foreground'>Correct</AppTypography.small>
          <AppTypography.p className='text-xl font-bold text-green-600'>{correctCount}</AppTypography.p>
          <AppTypography.small className='text-muted-foreground text-xs'>
            {totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * PERCENTAGE_MULTIPLIER) : 0}%
          </AppTypography.small>
        </div>
      </div>

      <div className='bg-card flex items-start gap-2.5 rounded-lg border p-3'>
        <div className='rounded-lg bg-red-500/10 p-2'>
          <XCircle className='h-5 w-5 text-red-600' />
        </div>
        <div>
          <AppTypography.small className='text-muted-foreground'>Incorrect</AppTypography.small>
          <AppTypography.p className='text-xl font-bold text-red-600'>{incorrectCount}</AppTypography.p>
          <AppTypography.small className='text-muted-foreground text-xs'>
            {totalQuestions > 0 ? Math.round((incorrectCount / totalQuestions) * PERCENTAGE_MULTIPLIER) : 0}%
          </AppTypography.small>
        </div>
      </div>

      <div className='bg-card flex items-start gap-2.5 rounded-lg border p-3'>
        <div className='rounded-lg bg-blue-500/10 p-2'>
          <CheckCircle2 className='h-5 w-5 text-blue-600' />
        </div>
        <div>
          <AppTypography.small className='text-muted-foreground'>Total</AppTypography.small>
          <AppTypography.p className='text-xl font-bold'>{totalQuestions}</AppTypography.p>
        </div>
      </div>
    </div>
  );
}
