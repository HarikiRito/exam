'use client';

import { testSessionActions, testSessionStore } from 'app/routes/_auth/tests/sessions/$sessionId/state';
import { AppAlertDialog } from 'app/shared/components/alert-dialog/AppAlertDialog';
import { AppButton } from 'app/shared/components/button/AppButton';

export function FinishExamDialog() {
  const snapshot = testSessionStore.useStateSnapshot();
  return (
    <AppAlertDialog.Root open={snapshot.isFinishExamDialogOpen} onOpenChange={testSessionActions.handleFinishExam}>
      <AppAlertDialog.Content>
        <AppAlertDialog.Header>
          <AppAlertDialog.Title>Are you sure you want to finish the exam?</AppAlertDialog.Title>
          <AppAlertDialog.Description>
            Once you finish, you will not be able to return to the questions.
          </AppAlertDialog.Description>
        </AppAlertDialog.Header>
        <AppAlertDialog.Footer>
          <AppAlertDialog.Cancel asChild>
            <AppButton variant='outline' onClick={testSessionActions.handleFinishExam}>
              Cancel
            </AppButton>
          </AppAlertDialog.Cancel>
          <AppAlertDialog.Action asChild>
            <AppButton onClick={testSessionActions.handleFinishExamConfirmed}>Finish Exam</AppButton>
          </AppAlertDialog.Action>
        </AppAlertDialog.Footer>
      </AppAlertDialog.Content>
    </AppAlertDialog.Root>
  );
}
