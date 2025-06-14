'use client';

import { AppAlertDialog } from 'app/shared/components/alert-dialog/AppAlertDialog';
import { AppButton } from 'app/shared/components/button/AppButton';

interface FinishExamDialogProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export function FinishExamDialog({ isOpen, onClose, onConfirm }: FinishExamDialogProps) {
  return (
    <AppAlertDialog.Root open={isOpen} onOpenChange={onClose}>
      <AppAlertDialog.Content>
        <AppAlertDialog.Header>
          <AppAlertDialog.Title>Are you sure you want to finish the exam?</AppAlertDialog.Title>
          <AppAlertDialog.Description>
            Once you finish, you will not be able to return to the questions.
          </AppAlertDialog.Description>
        </AppAlertDialog.Header>
        <AppAlertDialog.Footer>
          <AppAlertDialog.Cancel asChild>
            <AppButton variant='outline' onClick={onClose}>
              Cancel
            </AppButton>
          </AppAlertDialog.Cancel>
          <AppAlertDialog.Action asChild>
            <AppButton onClick={onConfirm}>Finish Exam</AppButton>
          </AppAlertDialog.Action>
        </AppAlertDialog.Footer>
      </AppAlertDialog.Content>
    </AppAlertDialog.Root>
  );
}
