import { useNavigate } from '@remix-run/react';
import { createColumnHelper } from '@tanstack/react-table';
import { EyeIcon, PencilIcon, PlusIcon, TrashIcon } from 'lucide-react';

import { useDeleteCourseMutation } from 'app/graphql/operations/course/deleteCourse.mutation.generated';
import { usePaginateCoursesQuery } from 'app/graphql/operations/course/paginateCourse.query.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDataTable } from 'app/shared/components/table/AppDataTable';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { CourseItemFragment } from 'app/graphql/operations/course/course.fragment.generated';

export default function AdminCourses() {
  const navigate = useNavigate();

  const state = {
    page: 1,
    limit: 10,
    search: '',
  };

  // Fetch courses data
  const { data, refetch } = usePaginateCoursesQuery({
    variables: {
      paginationInput: {
        page: state.page,
        limit: state.limit,
        search: state.search,
      },
    },
  });

  // Delete course mutation
  const [deleteCourse] = useDeleteCourseMutation({
    onCompleted: () => {
      void refetch();
    },
  });

  // Handle course deletion
  function handleDeleteCourse(id: string) {
    if (confirm('Are you sure you want to delete this course?')) {
      void deleteCourse({
        variables: {
          id,
        },
      });
    }
  }

  // Setup column definitions
  const columnHelper = createColumnHelper<CourseItemFragment>();
  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => info.getValue(),
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => {
        const description = info.getValue();
        if (!description) {
          return '-';
        }

        return description.length > 100 ? `${description.substring(0, 100)}...` : description;
      },
      enableSorting: true,
      enableColumnFilter: true,
    }),
    columnHelper.accessor('id', {
      header: 'Actions',
      cell: (info) => {
        const courseId = info.getValue();
        return (
          <div className='flex items-center gap-2'>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminCourseDetail(courseId))}
              aria-label='View course'>
              <EyeIcon className='h-4 w-4' />
            </AppButton>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => navigate(APP_ROUTES.adminCourseEdit(courseId))}
              aria-label='Edit course'>
              <PencilIcon className='h-4 w-4' />
            </AppButton>
            <AppButton
              size='icon'
              variant='ghost'
              onClick={() => handleDeleteCourse(courseId)}
              aria-label='Delete course'>
              <TrashIcon className='text-destructive h-4 w-4' />
            </AppButton>
          </div>
        );
      },
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ];

  // Get table data and total items count
  const tableData = data?.paginatedCourses.items || [];
  const totalItems = data?.paginatedCourses.pagination.totalItems || 0;

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center justify-between'>
        <AppTypography.h1>Courses Management</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminCourseCreate)} className='flex items-center gap-2'>
          <PlusIcon className='h-4 w-4' />
          Add Course
        </AppButton>
      </div>

      <AppDataTable columns={columns} data={tableData} searchPlaceholder='Search courses...' totalItems={totalItems} />
    </div>
  );
}
