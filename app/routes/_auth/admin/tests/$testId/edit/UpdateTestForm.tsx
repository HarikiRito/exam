import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { UpdateTestInput } from 'app/graphql/graphqlTypes';
import { GetTestDocument } from 'app/graphql/operations/test/getTest.query.generated';
import { useUpdateTestMutation } from 'app/graphql/operations/test/updateTest.mutation.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { apolloService } from 'app/shared/services/apollo.service';
import { testEditStore } from './testEditStore';

// Validation schema
const updateTestSchema = z.object({
  name: z.string().min(1, 'Test name is required').max(255, 'Test name must be less than 255 characters'),
  totalTime: z.coerce.number().min(1, 'Total time is required'),
});

type UpdateTestFormData = z.infer<typeof updateTestSchema>;

export function UpdateTestForm() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const testEditState = testEditStore.useStateSnapshot();

  // Update test mutation
  const [updateTest, { loading: updateLoading }] = useUpdateTestMutation({
    onCompleted: () => {
      toast.success('Test updated successfully!');
      apolloService.invalidateQueries([GetTestDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to update test: ${error.message}`);
    },
  });

  // Form setup
  const form = useForm<UpdateTestFormData>({
    resolver: zodResolver(updateTestSchema),
    defaultValues: {
      name: '',
      totalTime: 0,
    },
    mode: 'onBlur',
  });

  // Update form when test data loads
  useEffect(() => {
    if (testEditState.testDetails) {
      form.reset({
        name: testEditState.testDetails.name,
        totalTime: testEditState.testDetails.totalTime ?? 120,
      });
    }
  }, [testEditState.testDetails, form]);

  function onSubmit(data: UpdateTestFormData) {
    if (!testId) {
      toast.error('Test ID not found');
      return;
    }

    const input: UpdateTestInput = {
      name: data.name,
      totalTime: data.totalTime,
    };

    updateTest({
      variables: { id: testId, input },
    });
  }

  return (
    <AppForm.Root {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <AppForm.Field
          control={form.control}
          name='name'
          render={({ field }) => (
            <AppForm.Item>
              <AppForm.Label className='pb-1'>Test Name</AppForm.Label>
              <AppForm.Control>
                <AppInput placeholder='Enter test name' {...field} />
              </AppForm.Control>
              <AppForm.Message />
            </AppForm.Item>
          )}
        />

        <AppForm.Field
          control={form.control}
          name='totalTime'
          render={({ field }) => (
            <AppForm.Item>
              <AppForm.Label className='pb-1'>Total Time (minutes)</AppForm.Label>
              <AppForm.Control>
                <AppInput placeholder='Enter total time (minutes)' {...field} type='number' />
              </AppForm.Control>
              <AppForm.Message />
            </AppForm.Item>
          )}
        />

        {form.formState.isDirty && (
          <div className='flex justify-end gap-4'>
            <AppButton type='button' variant='outline' onClick={() => navigate(APP_ROUTES.adminTests)}>
              Cancel
            </AppButton>
            <AppButton type='submit' disabled={updateLoading}>
              {updateLoading ? 'Updating...' : 'Update Test'}
            </AppButton>
          </div>
        )}
      </form>
    </AppForm.Root>
  );
}
