import { AppTooltip } from 'app/shared/components/ui/tooltip/AppTooltip';

const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface ScoreRingProps {
  percentage: number;
  pointsEarned: number;
  maxPoints: number;
}

export function ScoreRing({ percentage, pointsEarned, maxPoints }: ScoreRingProps) {
  return (
    <AppTooltip.Provider>
      <AppTooltip.Root>
        <AppTooltip.Trigger asChild>
          <div className='relative h-16 w-16'>
            <svg className='h-16 w-16 -rotate-90 transform'>
              <circle
                cx='32'
                cy='32'
                r={RING_RADIUS}
                stroke='currentColor'
                strokeWidth='3.5'
                fill='none'
                className='text-muted'
              />
              <circle
                cx='32'
                cy='32'
                r={RING_RADIUS}
                stroke='currentColor'
                strokeWidth='3.5'
                fill='none'
                strokeDasharray={`${(percentage / 100) * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                className='text-primary transition-all'
                strokeLinecap='round'
              />
            </svg>
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-sm font-bold'>{percentage}%</span>
            </div>
          </div>
        </AppTooltip.Trigger>
        <AppTooltip.Content>
          <p>
            Score: {pointsEarned} / {maxPoints} points
          </p>
        </AppTooltip.Content>
      </AppTooltip.Root>
    </AppTooltip.Provider>
  );
}
