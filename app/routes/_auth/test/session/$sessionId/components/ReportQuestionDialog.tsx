import { useState } from 'react';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppRadioGroup } from 'app/shared/components/radio-group/AppRadioGroup';
import { AppLabel } from 'app/shared/components/label/AppLabel';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';

interface ReportQuestionDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: (reason: string, details: string) => void;
}

const REPORT_REASONS = [
  'Question is incorrect',
  'Answer options are unclear',
  'Typographical error',
  'Content is irrelevant',
  'Other',
];

export function ReportQuestionDialog({ isOpen, onClose, onSubmit }: ReportQuestionDialogProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReasonDetails, setOtherReasonDetails] = useState('');

  const handleSubmit = () => {
    if (selectedReason) {
      const details = selectedReason === 'Other' ? otherReasonDetails : '';
      onSubmit(selectedReason, details);
      setSelectedReason('');
      setOtherReasonDetails('');
    }
  };

  return (
    <AppDialog.Root open={isOpen} onOpenChange={onClose}>
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
          <AppButton variant='outline' onClick={onClose}>
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
