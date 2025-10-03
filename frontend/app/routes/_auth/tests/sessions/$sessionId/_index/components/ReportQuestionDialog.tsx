import { testSessionState, testSessionStore } from '../state';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppDialog } from 'app/shared/components/ui/dialog/AppDialog';
import { AppLabel } from 'app/shared/components/ui/label/AppLabel';
import { AppRadioGroup } from 'app/shared/components/ui/radio-group/AppRadioGroup';
import { AppTextarea } from 'app/shared/components/ui/textarea/AppTextarea';
import { useState } from 'react';
import { toast } from 'sonner';

const REPORT_REASONS = [
  'Question is incorrect',
  'Answer options are unclear',
  'Typographical error',
  'Content is irrelevant',
  'Other',
];

export function ReportQuestionDialog() {
  const snapshot = testSessionStore.useStateSnapshot();
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReasonDetails, setOtherReasonDetails] = useState('');

  function handleSubmit() {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting this question.');
      return;
    }

    const details = selectedReason === 'Other' ? otherReasonDetails : '';
    testSessionState.submitReportQuestion(selectedReason, details);
    setSelectedReason('');
    setOtherReasonDetails('');
  }

  function onDialogOpenChange(open: boolean) {
    snapshot.isReportQuestionDialogOpen = open;
  }

  return (
    <AppDialog.Root open={snapshot.isReportQuestionDialogOpen} onOpenChange={onDialogOpenChange}>
      <AppDialog.Content className='sm:max-w-[425px]'>
        <AppDialog.Header>
          <AppDialog.Title>Report Question</AppDialog.Title>
          <AppDialog.Description>Please select a reason for reporting this question.</AppDialog.Description>
        </AppDialog.Header>
        <div className='grid gap-4 py-4'>
          <AppRadioGroup.Root value={selectedReason} onValueChange={setSelectedReason}>
            {REPORT_REASONS.map((reason) => (
              <div key={reason} className='flex items-center space-x-2'>
                <AppRadioGroup.Item value={reason} id={`reason-${reason.replace(/\s/g, '-').toLowerCase()}`} />
                <AppLabel htmlFor={`reason-${reason.replace(/\s/g, '-').toLowerCase()}`}>{reason}</AppLabel>
              </div>
            ))}
          </AppRadioGroup.Root>
          {selectedReason === 'Other' && (
            <AppTextarea
              placeholder="Please provide details for 'Other' reason..."
              value={otherReasonDetails}
              onChange={(e) => setOtherReasonDetails(e.target.value)}
              className='mt-2'
            />
          )}
        </div>
        <AppDialog.Footer>
          <AppButton variant='outline' onClick={() => (testSessionState.isReportQuestionDialogOpen = false)}>
            Cancel
          </AppButton>
          <AppButton
            onClick={handleSubmit}
            disabled={!selectedReason || (selectedReason === 'Other' && !otherReasonDetails)}>
            Submit Report
          </AppButton>
        </AppDialog.Footer>
      </AppDialog.Content>
    </AppDialog.Root>
  );
}
