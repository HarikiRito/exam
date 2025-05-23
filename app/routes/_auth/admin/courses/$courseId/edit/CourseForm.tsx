import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useParams } from '@remix-run/react';
import { toast } from 'sonner';
import { z } from 'zod';

import { useUpdateCourseMutation } from 'app/graphql/operations/course/updateCourse.mutation.generated';
import { GetCourseDocument } from 'app/graphql/operations/course/getCourse.query.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppForm } from 'app/shared/components/form/AppForm';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { apolloService } from 'app/shared/services/apollo.service';

// Course schema
const courseSchema = z.object({
  title: z.string().min(1, 'Title must be at least 1 character'),
  description: z.string().optional(),
});

export type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  readonly initialData: {
    title: string;
    description: string;
  };
}

export function CourseForm({ initialData }: CourseFormProps) {
  const { courseId } = useParams();

  const [updateCourse, { loading: isLoading }] = useUpdateCourseMutation({
    onCompleted: () => {
      toast.success('Course updated successfully!');
      apolloService.invalidateQueries([GetCourseDocument]);
    },
    onError: (error) => {
      toast.error(`Failed to update course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Course form
  const courseForm = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    mode: 'onBlur',
    defaultValues: initialData,
  });

  async function handleSubmit(data: CourseFormData) {
    if (!courseId) return;

    await updateCourse({
      variables: {
        id: courseId,
        input: {
          title: data.title,
          description: data.description,
        },
      },
    });
  }

  return (
    <div className='rounded-lg border p-6 shadow-sm'>
      <AppTypography.h2 className='mb-4'>Course Details</AppTypography.h2>
      <AppForm.Root {...courseForm}>
        <form onSubmit={courseForm.handleSubmit(handleSubmit)} className='space-y-6'>
          <AppForm.Field
            control={courseForm.control}
            name='title'
            render={({ field }) => (
              <AppForm.Item>
                <AppForm.Label>Course Title</AppForm.Label>
                <AppForm.Control>
                  <AppInput placeholder='Enter course title' {...field} />
                </AppForm.Control>
                <AppForm.Message />
              </AppForm.Item>
            )}
          />

          <AppForm.Field
            control={courseForm.control}
            name='description'
            render={({ field }) => (
              <AppForm.Item>
                <AppForm.Label>Course Description</AppForm.Label>
                <AppForm.Control>
                  <AppTextarea placeholder='Enter course description' rows={4} {...field} />
                </AppForm.Control>
                <AppForm.Message />
              </AppForm.Item>
            )}
          />

          <div className='flex justify-end pt-4'>
            <AppButton type='submit' disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Course'}
            </AppButton>
          </div>
        </form>
      </AppForm.Root>
    </div>
  );
}
