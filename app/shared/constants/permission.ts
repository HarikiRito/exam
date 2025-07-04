import { PermissionEnum } from 'app/graphql/graphqlTypes';
import { APP_ROUTES } from 'app/shared/constants/routes';

/**
 * Permission for each route
 */
export const PERMISSION_ROUTE: Record<keyof typeof APP_ROUTES, PermissionEnum[]> = {
  dashboard: [],
  courses: [],
  profile: [],
  login: [],
  adminCourses: [PermissionEnum.CourseRead],
  adminCourseDetail: [PermissionEnum.CourseRead],
  adminCourseEdit: [PermissionEnum.CourseRead, PermissionEnum.CourseUpdate],
  adminCourseCreate: [PermissionEnum.CourseCreate],
  adminQuestions: [PermissionEnum.QuestionRead],
  adminQuestionDetail: [PermissionEnum.QuestionRead],
  adminQuestionEdit: [PermissionEnum.QuestionRead, PermissionEnum.QuestionUpdate],
  adminQuestionCreate: [PermissionEnum.QuestionCreate],
  adminCollections: [PermissionEnum.CollectionRead],
  adminCollectionDetail: [PermissionEnum.CollectionRead],
  adminCollectionEdit: [PermissionEnum.CollectionRead, PermissionEnum.CollectionUpdate],
  adminCollectionCreate: [PermissionEnum.CollectionCreate],
  adminTests: [PermissionEnum.TestRead],
  adminTestDetail: [PermissionEnum.TestRead],
  adminTestEdit: [PermissionEnum.TestRead, PermissionEnum.TestUpdate],
  adminTestCreate: [PermissionEnum.TestCreate],
  adminUsers: [PermissionEnum.UserRead],
  adminUserEdit: [PermissionEnum.UserCreate],
  testSessions: [PermissionEnum.SessionRead],
};
