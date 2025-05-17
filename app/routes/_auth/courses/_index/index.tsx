import { usePaginateCoursesQuery } from 'app/graphql/operations/course/paginateCourse.query.generated';
import { HorizontalCourseCategory } from 'app/shared/components/custom/HorizontalCourseCategory';

export default function CourseRoute() {
  const { data, loading, error } = usePaginateCoursesQuery();

  const items = data?.paginatedCourses.items ?? [];

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>Courses</h1>

      {/* Course categories with horizontal scrolling */}
      <HorizontalCourseCategory title='Recommended' courses={items} />
    </div>
  );
}
