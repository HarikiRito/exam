export const APP_ROUTES = {
  dashboard: '/dashboard',
  courses: '/courses',
  profile: '/profile',
  login: '/login',
  adminCourses: '/admin/courses',
  adminCourseDetail: (courseId: string) => `/admin/courses/${courseId}`,
  adminCourseEdit: (courseId: string) => `/admin/courses/${courseId}/edit`,
  adminCourseCreate: '/admin/courses/create',
};
