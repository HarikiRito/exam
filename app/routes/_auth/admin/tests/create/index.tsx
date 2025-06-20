import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { CreateTestInput } from 'app/graphql/graphqlTypes';
import { useCreateTestMutation } from 'app/graphql/operations/test/createTest.mutation.generated';
import { PaginateTestsDocument } from 'app/graphql/operations/test/paginateTests.query.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { apolloService } from 'app/shared/services/apollo.service';

// Validation schema
const createTestSchema = z.object({
  name: z.string().min(1, 'Test name is required').max(255, 'Test name must be less than 255 characters'),
  totalTime: z.coerce.number().min(1, 'Total time must be at least 1 minute'),
});

type CreateTestFormData = z.infer<typeof createTestSchema>;

export default function CreateTest() {
  const navigate = useNavigate();

  // Create test mutation
  const [createTest, { loading }] = useCreateTestMutation({
    onCompleted: (data) => {
      toast.success('Test created successfully!');
      apolloService.invalidateQueries([PaginateTestsDocument]);
      navigate(APP_ROUTES.adminTestEdit(data.createTest.id));
    },
    onError: (error) => {
      toast.error(`Failed to create test: ${error.message}`);
    },
  });

  // Form setup
  const form = useForm<CreateTestFormData>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      name: '',
      totalTime: 120,
    },
    mode: 'onBlur',
  });

  function onSubmit(data: CreateTestFormData) {
    const input: CreateTestInput = {
      name: data.name,
      totalTime: data.totalTime,
    };

    createTest({
      variables: { input },
    });
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <AppTypography.h1>Create New Test</AppTypography.h1>
      </div>

      <AppForm.Root {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <AppForm.Field
            control={form.control}
            name='name'
            render={({ field }) => (
              <AppForm.Item>
                <AppForm.Label>Test Name</AppForm.Label>
                <AppForm.Control>
                  <AppInput placeholder='Enter test name' {...field} />
                </AppForm.Control>
                <AppForm.Description>Choose a descriptive name for your test.</AppForm.Description>
                <AppForm.Message />
              </AppForm.Item>
            )}
          />
          <AppForm.Field
            control={form.control}
            name='totalTime'
            render={({ field }) => (
              <AppForm.Item>
                <AppForm.Label>Total Time (minutes)</AppForm.Label>
                <AppForm.Control>
                  <AppInput type='number' placeholder='Enter total time in minutes' {...field} />
                </AppForm.Control>
                <AppForm.Description>Set the maximum duration for the test in minutes.</AppForm.Description>
                <AppForm.Message />
              </AppForm.Item>
            )}
          />
          <div className='flex justify-end gap-4'>
            <AppButton type='button' variant='outline' onClick={() => navigate(APP_ROUTES.adminTests)}>
              Cancel
            </AppButton>
            <AppButton type='submit' disabled={loading}>
              {loading ? 'Creating...' : 'Create Test'}
            </AppButton>
          </div>
        </form>
      </AppForm.Root>
    </div>
  );
}
