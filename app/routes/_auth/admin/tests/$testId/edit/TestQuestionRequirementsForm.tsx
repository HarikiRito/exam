import { zodResolver } from '@hookform/resolvers/zod';
import { useParams } from '@remix-run/react';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { UpdateTestQuestionRequirementInput } from 'app/graphql/graphqlTypes';
import { GetTestQuery, useGetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { useUpdateTestQuestionRequirementMutation } from 'app/graphql/operations/test/updateTestQuestionRequirement.mutation.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTypography } from 'app/shared/components/typography/AppTypography';

// Validation schema for question requirements
const questionRequirementSchema = z.object({
  numberOfQuestions: z.number().min(1, 'Number of questions must be at least 1'),
  pointsPerQuestion: z.number().min(0, 'Points per question must be at least 0'),
});

const testQuestionRequirementsSchema = z.object({
  requirements: z
    .array(questionRequirementSchema)
    .min(1, 'At least one question requirement is needed')
    .refine(
      (requirements) => {
        const points = requirements.map((req) => req.pointsPerQuestion);
        const uniquePoints = new Set(points);
        return uniquePoints.size === points.length;
      },
      {
        message: 'Points per question must be unique for each requirement',
      },
    ),
});

type TestQuestionRequirementsFormData = z.infer<typeof testQuestionRequirementsSchema>;

export function TestQuestionRequirementsForm() {
  const { testId } = useParams();

  // Fetch current test data including question counts
  const { data: testData, loading: testLoading } = useGetTestQuery({
    variables: { id: testId! },
    skip: !testId,
  });

  // Update test question requirements mutation
  const [updateTestQuestionRequirement, { loading: updateLoading }] = useUpdateTestQuestionRequirementMutation({
    onCompleted: () => {
      toast.success('Test question requirements updated successfully!');
    },
    onError: (error) => {
      toast.error(`Failed to update test question requirements: ${error.message}`);
    },
  });

  // Form setup
  const form = useForm<TestQuestionRequirementsFormData>({
    resolver: zodResolver(testQuestionRequirementsSchema),
    defaultValues: {
      requirements: [{ numberOfQuestions: 1, pointsPerQuestion: 1 }],
    },
    mode: 'all',
  });

  const formState = form.formState;

  // Field array for dynamic requirements
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'requirements',
  });

  const requirements = form.watch('requirements');
  const totalPoints = requirements.reduce((acc, curr) => acc + curr.pointsPerQuestion * curr.numberOfQuestions, 0);

  // Update form when test data loads
  useEffect(() => {
    if (testData?.test.testQuestionCounts && testData.test.testQuestionCounts.length > 0) {
      const requirements = testData.test.testQuestionCounts.map(
        (count: GetTestQuery['test']['testQuestionCounts'][0]) => ({
          numberOfQuestions: count.numberOfQuestions,
          pointsPerQuestion: count.points,
        }),
      );
      form.reset({ requirements });
    }
  }, [testData, form]);

  function handleAddRequirement() {
    append({ numberOfQuestions: 1, pointsPerQuestion: 5 });
  }

  function handleRemoveRequirement(index: number) {
    remove(index);
  }

  function onSubmit(data: TestQuestionRequirementsFormData) {
    if (!testId) {
      toast.error('Test ID not found');
      return;
    }

    const input: UpdateTestQuestionRequirementInput[] = data.requirements.map((req) => ({
      numberOfQuestions: req.numberOfQuestions,
      pointsPerQuestion: req.pointsPerQuestion,
    }));

    updateTestQuestionRequirement({
      variables: { testId, input },
    });
  }

  if (testLoading) {
    return (
      <AppCard.Root>
        <AppCard.Header>
          <AppCard.Title>Question Requirements</AppCard.Title>
        </AppCard.Header>
        <AppCard.Content>
          <AppTypography.p>Loading...</AppTypography.p>
        </AppCard.Content>
      </AppCard.Root>
    );
  }

  return (
    <>
      <AppTypography.h4>Question Requirements</AppTypography.h4>
      <AppTypography.p>
        This is the question requirements for the test. You can add or remove requirements as needed.
      </AppTypography.p>
      <AppForm.Root {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            {fields.map((field, index) => (
              <div key={field.id} className='space-y-4 rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  {fields.length > 0 && (
                    <AppButton
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => handleRemoveRequirement(index)}
                      className='text-red-600 hover:text-red-700'>
                      <Trash2 className='h-4 w-4' />
                      Remove
                    </AppButton>
                  )}
                </div>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <AppForm.Field
                    control={form.control}
                    name={`requirements.${index}.numberOfQuestions`}
                    render={({ field }) => (
                      <AppForm.Item>
                        <AppForm.Label>Number of Questions</AppForm.Label>
                        <AppForm.Control>
                          <AppInput
                            type='text'
                            inputMode='numeric'
                            placeholder='Enter number of questions'
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value, 10) || 0);
                            }}
                          />
                        </AppForm.Control>
                        <AppForm.Message />
                      </AppForm.Item>
                    )}
                  />

                  <AppForm.Field
                    control={form.control}
                    name={`requirements.${index}.pointsPerQuestion`}
                    render={({ field }) => (
                      <AppForm.Item>
                        <AppForm.Label>Points per Question</AppForm.Label>
                        <AppForm.Control>
                          <AppInput
                            type='text'
                            inputMode='numeric'
                            placeholder='Enter points per question'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          />
                        </AppForm.Control>
                        <AppForm.Message />
                      </AppForm.Item>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Display form-level error for unique points validation */}
          {formState.errors.requirements?.root && (
            <div className='text-sm text-red-600'>{formState.errors.requirements.root?.message}</div>
          )}

          {/* Total points for the test estimation */}
          <div className='text-muted-foreground text-sm'>Total points {totalPoints}</div>
          <div className='flex items-center justify-between'>
            <AppButton
              type='button'
              variant='outline'
              onClick={handleAddRequirement}
              className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Add Requirement
            </AppButton>

            <AppButton type='submit' disabled={updateLoading}>
              {updateLoading ? 'Updating...' : 'Update Requirements'}
            </AppButton>
          </div>
        </form>
      </AppForm.Root>
    </>
  );
}
