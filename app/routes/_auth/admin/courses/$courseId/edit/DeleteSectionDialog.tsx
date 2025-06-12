import { toast } from 'sonner';

import { editCourseSectionState } from 'app/routes/_auth/admin/courses/$courseId/edit/courseEditStore';
import { useRemoveCourseSectionMutation } from 'app/graphql/operations/courseSection/removeCourseSection.mutation.generated';
import { CourseSectionsByCourseIdDocument } from 'app/graphql/operations/courseSection/courseSectionsByCourseId.query.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';
import { apolloService } from 'app/shared/services/apollo.service';

const mutation = editCourseSectionState.proxyState;

export function DeleteSectionDialog() {
  const state = editCourseSectionState.useStateSnapshot();

  const [removeCourseSection, { loading: isLoading }] = useRemoveCourseSectionMutation({
    onCompleted: () => {
      mutation.deletingSectionId = null;
      toast.success('Section deleted successfully!');
      apolloService.invalidateQueries([CourseSectionsByCourseIdDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to delete section: ${error.message}`);
    },
  });

  async function handleDeleteSection() {
    if (!state.deletingSectionId) return;

    await removeCourseSection({
      variables: {
        id: state.deletingSectionId,
      },
    });
  }

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
          <AppButton variant='destructive' className='text-white' onClick={handleDeleteSection} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </AppButton>
        </AppDialog.Footer>
      </AppDialog.Content>
    </AppDialog.Root>
  );
}
