import { AppSwitch } from 'app/shared/components/ui/switch/AppSwitch';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';

interface CorrectOptionToggleProps {
  readonly allowMultipleCorrect: boolean;
  readonly onToggleChange: (value: boolean) => void;
}

export function CorrectOptionToggle({ allowMultipleCorrect, onToggleChange }: CorrectOptionToggleProps) {
  return (
    <div className='flex items-center justify-between rounded-lg border p-4'>
      <div className='space-y-1'>
        <AppTypography.h4>Answer Type</AppTypography.h4>
        <AppTypography.muted>
          {allowMultipleCorrect ? 'Multiple correct answers allowed' : 'Only one correct answer allowed'}
        </AppTypography.muted>
      </div>
      <div className='flex items-center space-x-2'>
        <AppTypography.small>Single</AppTypography.small>
        <AppSwitch checked={allowMultipleCorrect} onCheckedChange={onToggleChange} />
        <AppTypography.small>Multiple</AppTypography.small>
      </div>
    </div>
  );
}
