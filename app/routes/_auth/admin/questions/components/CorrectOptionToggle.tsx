import { AppSwitch } from 'app/shared/components/switch/AppSwitch';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { questionFormState } from '../store';

export function CorrectOptionToggle() {
  const state = questionFormState.useStateSnapshot();
  const mutation = questionFormState.proxyState;

  function handleToggleChange(isAllowMultipleCorrectAnswer: boolean) {
    mutation.allowMultipleCorrect = isAllowMultipleCorrectAnswer;
  }

  return (
    <div className='flex items-center justify-between rounded-lg border p-4'>
      <div className='space-y-1'>
        <AppTypography.h4>Answer Type</AppTypography.h4>
        <AppTypography.muted>
          {state.allowMultipleCorrect ? 'Multiple correct answers allowed' : 'Only one correct answer allowed'}
        </AppTypography.muted>
      </div>
      <div className='flex items-center space-x-2'>
        <AppTypography.small>Single</AppTypography.small>
        <AppSwitch checked={state.allowMultipleCorrect} onCheckedChange={handleToggleChange} />
        <AppTypography.small>Multiple</AppTypography.small>
      </div>
    </div>
  );
}
