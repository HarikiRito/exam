import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useCreateCourseMutation } from 'app/graphql/operations/course/createCourse.mutation.generated';
import { PaginateCoursesDocument } from 'app/graphql/operations/course/paginateCourse.query.generated';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppForm } from 'app/shared/components/ui/form/AppForm';
import { AppInput } from 'app/shared/components/ui/input/AppInput';
import { AppTextarea } from 'app/shared/components/ui/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { apolloService } from 'app/shared/services/apollo.service';

// Create Zod schema for course validation
const courseSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function CreateCourse() {
  const navigate = useNavigate();
  const [createCourse, { loading }] = useCreateCourseMutation();

  // Initialize form with Zod resolver
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Handle form submission
  async function handleSubmit(data: CourseFormData) {
    const result = await createCourse({
      variables: {
        input: {
          title: data.title,
          description: data.description,
        },
      },
    });

    if (!result.data?.createCourse) {
      toast.error('Failed to create course. Please try again.');
      return;
    }

    toast.success('Course created successfully!');
    apolloService.invalidateQueries([PaginateCoursesDocument]);

    navigate(APP_ROUTES.adminCourses);
  }

  return (
    <div className='p-6'>
      <div className='mb-8 flex items-center justify-between'>
        <AppTypography.h1>Create New Course</AppTypography.h1>
      </div>

      <div className='p-8'>
        <AppForm.Root {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
            <AppForm.Field
              control={form.control}
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
              control={form.control}
              name='description'
              render={({ field }) => (
                <AppForm.Item>
                  <AppForm.Label>Course Description</AppForm.Label>
                  <AppForm.Control>
                    <AppTextarea placeholder='Enter course description' rows={6} {...field} />
                  </AppForm.Control>
                  <AppForm.Message />
                </AppForm.Item>
              )}
            />

            <div className='flex justify-end pt-4'>
              <AppButton type='submit' disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
              </AppButton>
            </div>
          </form>
        </AppForm.Root>
      </div>
    </div>
  );
}
