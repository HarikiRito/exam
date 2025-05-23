import { editCourseSectionState } from 'app/routes/_auth/admin/courses/$courseId/edit/state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';

interface DeleteSectionDialogProps {
  readonly isLoading: boolean;
  readonly onConfirm: (sectionId: string) => Promise<void>;
}

const mutation = editCourseSectionState.proxyState;

export function DeleteSectionDialog({ isLoading, onConfirm }: DeleteSectionDialogProps) {
  const state = editCourseSectionState.useStateSnapshot();

  return (
    <AppDialog.Root
      open={!!state.deletingSectionId}
      onOpenChange={(open) => {
        if (!open) mutation.deletingSectionId = null;
      }}>
      <AppDialog.Content>
        <AppDialog.Header>
          <AppDialog.Title>Delete Section</AppDialog.Title>
          <AppDialog.Description>
            Are you sure you want to delete this section? This action cannot be undone.
          </AppDialog.Description>
        </AppDialog.Header>
        <AppDialog.Footer>
          <AppButton variant='outline' onClick={() => (mutation.deletingSectionId = null)}>
            Cancel
          </AppButton>
          <AppButton
            variant='destructive'
            className='text-white'
            onClick={() => {
              if (!state.deletingSectionId) return;
              onConfirm(state.deletingSectionId);
            }}
            disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </AppButton>
        </AppDialog.Footer>
      </AppDialog.Content>
    </AppDialog.Root>
  );
}
