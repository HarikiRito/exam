import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from '@remix-run/react';
import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { useGetQuestionQuery } from 'app/graphql/operations/question/getQuestion.query.generated';
import { usePaginateQuestionCollectionsQuery } from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { useCreateQuestionMutation } from 'app/graphql/operations/question/createQuestion.mutation.generated';
import { useUpdateQuestionMutation } from 'app/graphql/operations/question/updateQuestion.mutation.generated';
import { PaginateQuestionsDocument } from 'app/graphql/operations/question/paginateQuestions.query.generated';
import { questionFormState } from '../state';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { apolloService } from 'app/shared/services/apollo.service';

import { QuestionCollectionSelector } from 'app/shared/components/custom/question/QuestionCollectionSelector';
import { QuestionOptionsManager } from 'app/shared/components/custom/question/QuestionOptionsManager';
import { CorrectOptionToggle } from 'app/shared/components/custom/question/CorrectOptionToggle';

// Question form schema
const questionSchema = z.object({
  questionText: z.string().min(1, 'You must enter a question'),
  questionCollectionId: z.string().min(1, 'You must select a question collection'),
  points: z.number().min(0, 'Points must not be negative').default(5),
  options: z
    .array(
      z.object({
        optionText: z.string().min(1, 'Option text is required'),
        isCorrect: z.boolean(),
      }),
    )
    .min(2, 'At least 2 options are required')
    .refine((options) => options.some((option) => option.isCorrect), 'At least one option must be marked as correct'),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionEditAndCreatePageProps {
  readonly mode: 'create' | 'edit';
}

export function QuestionEditAndCreatePage({ mode }: QuestionEditAndCreatePageProps) {
  // Initialize state
  questionFormState.useResetHook();
  const state = questionFormState.useStateSnapshot();
  const mutation = questionFormState.proxyState;

  const isEdit = mode === 'edit';

  const navigate = useNavigate();
  const { questionId } = useParams();

  // Fetch question data for edit mode
  const { data: questionData, loading: questionLoading } = useGetQuestionQuery({
    variables: { id: questionId! },
    skip: !isEdit || !questionId,
  });

  // Fetch question collections for the dropdown
  const { data: collectionsData, loading: collectionsLoading } = usePaginateQuestionCollectionsQuery({
    variables: {
      paginationInput: {
        page: 1,
        limit: 100, // Get all collections for the dropdown
      },
    },
  });

  // Create question mutation
  const [createQuestion, { loading: createLoading }] = useCreateQuestionMutation({
    onCompleted: () => {
      toast.success('Question created successfully!');
      apolloService.invalidateQueries([PaginateQuestionsDocument]);
      navigate(APP_ROUTES.adminQuestions);
    },
    onError: (error) => {
      toast.error(`Failed to create question: ${error.message}`);
    },
  });

  // Update question mutation
  const [updateQuestion, { loading: updateLoading }] = useUpdateQuestionMutation({
    onCompleted: () => {
      toast.success('Question updated successfully!');
      apolloService.invalidateQueries([PaginateQuestionsDocument]);
      navigate(APP_ROUTES.adminQuestions);
    },
    onError: (error) => {
      toast.error(`Failed to update question: ${error.message}`);
    },
  });

  // Initialize form
  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    mode: 'onBlur',
    defaultValues: {
      questionText: '',
      questionCollectionId: '',
      points: 5,
      options: [],
    },
  });

  // Update form when question data is loaded (edit mode)
  useEffect(() => {
    if (isEdit && questionData?.question) {
      const question = questionData.question;
      const formData = {
        questionText: question.questionText,
        questionCollectionId: question.collection?.id || '',
        points: question.points,
        options: question.options.map((option) => ({
          id: option.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
        })),
      };

      form.reset(formData);
      mutation.questionText = question.questionText;
      mutation.questionCollectionId = question.collection?.id || '';
      mutation.options = question.options.map((option) => ({
        optionText: option.optionText,
        isCorrect: option.isCorrect,
      }));
      mutation.editingQuestionId = question.id;
    }
  }, [questionData, form, isEdit, mutation]);

  // Check the question data to see if there are multiple correct options
  useEffect(() => {
    if (!questionData?.question) return;

    let count = 0;
    for (const option of questionData.question.options) {
      if (option.isCorrect) {
        count++;
      }

      if (count > 1) {
        mutation.allowMultipleCorrect = true;
        break;
      }
    }
  }, [questionData, mutation]);

  // Handle form submission
  async function handleSubmit(data: QuestionFormData) {
    mutation.isSaving = true;

    const options = data.options.map((option) => ({
      optionText: option.optionText,
      isCorrect: option.isCorrect,
    }));

    if (isEdit && questionId) {
      await updateQuestion({
        variables: {
          id: questionId,
          input: {
            questionText: data.questionText,
            questionCollectionId: data.questionCollectionId,
            points: data.points,
            options,
          },
        },
      });
    } else {
      await createQuestion({
        variables: {
          input: {
            questionText: data.questionText,
            questionCollectionId: data.questionCollectionId,
            points: data.points,
            options,
          },
        },
      });
    }

    mutation.isSaving = false;
  }

  if (isEdit && questionLoading) {
    return (
      <div className='p-6'>
        <AppTypography.h1>Loading question...</AppTypography.h1>
      </div>
    );
  }

  const isLoading = createLoading || updateLoading || state.isSaving;
  const collections = collectionsData?.paginatedQuestionCollections.items || [];

  // Helper function to determine the submit button text
  function _renderSubmitButtonText(): string {
    if (isLoading) {
      return isEdit ? 'Updating...' : 'Creating...';
    }
    return isEdit ? 'Update Question' : 'Create Question';
  }

  return (
    <div className='p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <AppTypography.h1>{isEdit ? 'Edit Question' : 'Create New Question'}</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminQuestions)} variant='outline'>
          Back to Questions
        </AppButton>
      </div>

      <div className='space-y-8'>
        <AppForm.Root {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            {/* Question Text */}
            <AppForm.Field
              control={form.control}
              name='questionText'
              render={({ field }) => (
                <AppForm.Item>
                  <AppForm.Label>Question</AppForm.Label>
                  <AppForm.Control>
                    <AppTextarea placeholder='Enter your question text' rows={3} {...field} />
                  </AppForm.Control>
                  <AppForm.Message />
                </AppForm.Item>
              )}
            />

            {/* Question Collection Selector */}
            <QuestionCollectionSelector
              collections={collections}
              loading={collectionsLoading}
              value={form.watch('questionCollectionId')}
              onValueChange={(value) => {
                form.setValue('questionCollectionId', value || '');
              }}
            />

            {/* Points Input */}
            <AppForm.Field
              control={form.control}
              name='points'
              render={({ field }) => (
                <AppForm.Item>
                  <AppForm.Label>Points</AppForm.Label>
                  <AppForm.Control>
                    <AppInput
                      type='number'
                      placeholder='5'
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </AppForm.Control>
                  <AppForm.Message />
                </AppForm.Item>
              )}
            />

            {/* Multiple Choice Toggle */}
            <CorrectOptionToggle
              allowMultipleCorrect={state.allowMultipleCorrect}
              onToggleChange={(value) => {
                mutation.allowMultipleCorrect = value;
              }}
            />

            {/* Question Options Manager */}
            <QuestionOptionsManager
              options={form.getValues('options')}
              onOptionsChange={(options) => {
                form.setValue('options', options);
              }}
              allowMultipleCorrect={state.allowMultipleCorrect}
            />

            {/* Submit Button */}
            <div className='flex justify-end pt-4'>
              <AppButton type='submit' disabled={isLoading}>
                {_renderSubmitButtonText()}
              </AppButton>
            </div>
          </form>
        </AppForm.Root>
      </div>
    </div>
  );
}
