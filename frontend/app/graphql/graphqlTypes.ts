export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  UUID: { input: any; output: any; }
};

export type AddMultiCollectionToTestInput = {
  collectionIds: Array<Scalars['ID']['input']>;
  testId: Scalars['ID']['input'];
};

export type Auth = {
  __typename?: 'Auth';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type BatchDeleteQuestionPointsInput = {
  questionIds: Array<Scalars['ID']['input']>;
  testId: Scalars['ID']['input'];
};

export type BatchIgnoreQuestionsInput = {
  questionIgnoreData: Array<QuestionIgnoreData>;
  testId: Scalars['ID']['input'];
};

export type BatchUpdateQuestionPointsInput = {
  questionPoints: Array<QuestionPointsInput>;
  testId: Scalars['ID']['input'];
};

export type Course = {
  __typename?: 'Course';
  createdAt: Scalars['DateTime']['output'];
  creator: User;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CourseSection = {
  __typename?: 'CourseSection';
  courseId: Scalars['ID']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  sectionId?: Maybe<Scalars['ID']['output']>;
  title: Scalars['String']['output'];
};

export type CourseSectionFilterInput = {
  onlyRoot?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateCourseInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateCourseSectionInput = {
  courseId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  sectionId?: InputMaybe<Scalars['ID']['input']>;
  title: Scalars['String']['input'];
};

export type CreateQuestionCollectionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateQuestionInput = {
  options: Array<QuestionOptionInput>;
  points: Scalars['Int']['input'];
  questionCollectionId: Scalars['ID']['input'];
  questionText: Scalars['String']['input'];
};

export type CreateQuestionOptionInput = {
  isCorrect: Scalars['Boolean']['input'];
  optionText: Scalars['String']['input'];
  questionId: Scalars['ID']['input'];
};

export type CreateTestInput = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  courseSectionId?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  totalTime: Scalars['Int']['input'];
};

export type CreateTestSessionInput = {
  testId: Scalars['ID']['input'];
  userIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addMultiCollectionToTest: Scalars['Boolean']['output'];
  batchIgnoreQuestions: Scalars['Boolean']['output'];
  createCourse: Course;
  createCourseSection: CourseSection;
  createQuestion: Question;
  createQuestionCollection: QuestionCollection;
  createQuestionOption: QuestionOption;
  createTest: Test;
  createTestSession: Array<TestSession>;
  createTodo: Todo;
  deleteQuestion: Scalars['Boolean']['output'];
  deleteQuestionCollection: Scalars['Boolean']['output'];
  deleteQuestionOption: Scalars['Boolean']['output'];
  deleteTest: Scalars['Boolean']['output'];
  deleteTestSession: Scalars['Boolean']['output'];
  register: Auth;
  removeCourse: Scalars['Boolean']['output'];
  removeCourseSection: Scalars['Boolean']['output'];
  renewToken: Auth;
  startTestSession: TestSession;
  submitTestSession: TestSession;
  updateBatchQuestionsByCollection: Scalars['Boolean']['output'];
  updateCourse: Course;
  updateCourseSection: CourseSection;
  updateQuestion: Question;
  updateQuestionCollection: QuestionCollection;
  updateQuestionOption: QuestionOption;
  updateTest: Test;
  updateTestQuestionRequirement: Scalars['Boolean']['output'];
};


export type MutationAddMultiCollectionToTestArgs = {
  input: AddMultiCollectionToTestInput;
};


export type MutationBatchIgnoreQuestionsArgs = {
  input: BatchIgnoreQuestionsInput;
};


export type MutationCreateCourseArgs = {
  input: CreateCourseInput;
};


export type MutationCreateCourseSectionArgs = {
  input: CreateCourseSectionInput;
};


export type MutationCreateQuestionArgs = {
  input: CreateQuestionInput;
};


export type MutationCreateQuestionCollectionArgs = {
  input: CreateQuestionCollectionInput;
};


export type MutationCreateQuestionOptionArgs = {
  input: CreateQuestionOptionInput;
};


export type MutationCreateTestArgs = {
  input: CreateTestInput;
};


export type MutationCreateTestSessionArgs = {
  input: CreateTestSessionInput;
};


export type MutationCreateTodoArgs = {
  input: NewTodo;
};


export type MutationDeleteQuestionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteQuestionCollectionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteQuestionOptionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTestSessionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRemoveCourseArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRemoveCourseSectionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRenewTokenArgs = {
  refreshToken: Scalars['String']['input'];
};


export type MutationStartTestSessionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSubmitTestSessionArgs = {
  input: SubmitTestSessionInput;
  sessionId: Scalars['ID']['input'];
};


export type MutationUpdateBatchQuestionsByCollectionArgs = {
  input: UpdateBatchQuestionsByCollectionInput;
};


export type MutationUpdateCourseArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCourseInput;
};


export type MutationUpdateCourseSectionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCourseSectionInput;
};


export type MutationUpdateQuestionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateQuestionInput;
};


export type MutationUpdateQuestionCollectionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateQuestionCollectionInput;
};


export type MutationUpdateQuestionOptionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateQuestionOptionInput;
};


export type MutationUpdateTestArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTestInput;
};


export type MutationUpdateTestQuestionRequirementArgs = {
  input: Array<UpdateTestQuestionRequirementInput>;
  testId: Scalars['ID']['input'];
};

export type NewTodo = {
  text: Scalars['String']['input'];
};

export type PaginatedCourse = {
  __typename?: 'PaginatedCourse';
  items: Array<Course>;
  pagination: Pagination;
};

export type PaginatedQuestion = {
  __typename?: 'PaginatedQuestion';
  items: Array<Question>;
  pagination: Pagination;
};

export type PaginatedQuestionCollection = {
  __typename?: 'PaginatedQuestionCollection';
  items: Array<QuestionCollection>;
  pagination: Pagination;
};

export type PaginatedQuestionOption = {
  __typename?: 'PaginatedQuestionOption';
  items: Array<QuestionOption>;
  pagination: Pagination;
};

export type PaginatedTest = {
  __typename?: 'PaginatedTest';
  items: Array<Test>;
  pagination: Pagination;
};

export type PaginatedTestSession = {
  __typename?: 'PaginatedTestSession';
  items: Array<TestSession>;
  pagination: Pagination;
};

export type PaginatedUser = {
  __typename?: 'PaginatedUser';
  items: Array<User>;
  pagination: Pagination;
};

export type Pagination = {
  __typename?: 'Pagination';
  currentPage: Scalars['Int']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  totalItems: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export enum PermissionEnum {
  CollectionCreate = 'COLLECTION_CREATE',
  CollectionDelete = 'COLLECTION_DELETE',
  CollectionRead = 'COLLECTION_READ',
  CollectionUpdate = 'COLLECTION_UPDATE',
  CourseCreate = 'COURSE_CREATE',
  CourseDelete = 'COURSE_DELETE',
  CourseRead = 'COURSE_READ',
  CourseSectionCreate = 'COURSE_SECTION_CREATE',
  CourseSectionDelete = 'COURSE_SECTION_DELETE',
  CourseSectionRead = 'COURSE_SECTION_READ',
  CourseSectionUpdate = 'COURSE_SECTION_UPDATE',
  CourseUpdate = 'COURSE_UPDATE',
  MediaCreate = 'MEDIA_CREATE',
  MediaDelete = 'MEDIA_DELETE',
  MediaRead = 'MEDIA_READ',
  MediaUpdate = 'MEDIA_UPDATE',
  QuestionCreate = 'QUESTION_CREATE',
  QuestionDelete = 'QUESTION_DELETE',
  QuestionOptionCreate = 'QUESTION_OPTION_CREATE',
  QuestionOptionDelete = 'QUESTION_OPTION_DELETE',
  QuestionOptionRead = 'QUESTION_OPTION_READ',
  QuestionOptionUpdate = 'QUESTION_OPTION_UPDATE',
  QuestionRead = 'QUESTION_READ',
  QuestionUpdate = 'QUESTION_UPDATE',
  SessionCreate = 'SESSION_CREATE',
  SessionDelete = 'SESSION_DELETE',
  SessionRead = 'SESSION_READ',
  SessionUpdate = 'SESSION_UPDATE',
  TestCreate = 'TEST_CREATE',
  TestDelete = 'TEST_DELETE',
  TestRead = 'TEST_READ',
  TestUpdate = 'TEST_UPDATE',
  UserCreate = 'USER_CREATE',
  UserRead = 'USER_READ',
  VideoCreate = 'VIDEO_CREATE',
  VideoDelete = 'VIDEO_DELETE',
  VideoRead = 'VIDEO_READ',
  VideoUpdate = 'VIDEO_UPDATE'
}

export type Query = {
  __typename?: 'Query';
  course: Course;
  courseSection: CourseSection;
  courseSectionsByCourseId: Array<CourseSection>;
  getAllPermissions: Array<PermissionEnum>;
  isAuthenticated: Scalars['Boolean']['output'];
  login: Auth;
  me: User;
  paginatedCourses: PaginatedCourse;
  paginatedQuestionCollections: PaginatedQuestionCollection;
  paginatedQuestions: PaginatedQuestion;
  paginatedTestSessions: PaginatedTestSession;
  paginatedTests: PaginatedTest;
  paginatedUsers: PaginatedUser;
  question: Question;
  questionCollection: QuestionCollection;
  questionOption: QuestionOption;
  questions: Array<Question>;
  test: Test;
  testSession: TestSession;
  todos: Array<Todo>;
};


export type QueryCourseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCourseSectionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCourseSectionsByCourseIdArgs = {
  courseId: Scalars['ID']['input'];
  filter?: InputMaybe<CourseSectionFilterInput>;
};


export type QueryLoginArgs = {
  input: LoginInput;
};


export type QueryPaginatedCoursesArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedQuestionCollectionsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedQuestionsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedTestSessionsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedTestsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedUsersArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryQuestionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuestionCollectionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuestionOptionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuestionsArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QueryTestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTestSessionArgs = {
  id: Scalars['ID']['input'];
};

export type Question = {
  __typename?: 'Question';
  collection?: Maybe<QuestionCollection>;
  correctOptionCount: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  options: Array<QuestionOption>;
  points: Scalars['Int']['output'];
  questionText: Scalars['String']['output'];
};

export type QuestionCollection = {
  __typename?: 'QuestionCollection';
  createdAt: Scalars['DateTime']['output'];
  creator: User;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  questions: Array<Question>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type QuestionIgnoreData = {
  questionId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type QuestionOption = {
  __typename?: 'QuestionOption';
  id: Scalars['ID']['output'];
  isCorrect: Scalars['Boolean']['output'];
  optionText: Scalars['String']['output'];
  question: Question;
};

export type QuestionOptionInput = {
  isCorrect: Scalars['Boolean']['input'];
  optionText: Scalars['String']['input'];
};

export type QuestionOrder = {
  __typename?: 'QuestionOrder';
  order: Scalars['Int']['output'];
  questionId: Scalars['ID']['output'];
};

export type QuestionPointsInput = {
  points: Scalars['Int']['input'];
  questionId: Scalars['ID']['input'];
};

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Role = {
  __typename?: 'Role';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type StartTestSessionInput = {
  expiredAt?: InputMaybe<Scalars['DateTime']['input']>;
  testTimeTaken: Scalars['Int']['input'];
};

export type SubmitTestSessionInput = {
  answers: Array<TestSessionAnswerInput>;
};

export type Test = {
  __typename?: 'Test';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  questionCollections: Array<QuestionCollection>;
  testIgnoreQuestions: Array<TestIgnoreQuestion>;
  testQuestionCounts: Array<TestQuestionCount>;
  totalTime?: Maybe<Scalars['Int']['output']>;
};

export type TestIgnoreQuestion = {
  __typename?: 'TestIgnoreQuestion';
  id: Scalars['ID']['output'];
  question?: Maybe<Question>;
  questionId: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  testId: Scalars['ID']['output'];
};

export type TestQuestionCount = {
  __typename?: 'TestQuestionCount';
  id: Scalars['ID']['output'];
  numberOfQuestions: Scalars['Int']['output'];
  points: Scalars['Int']['output'];
  testId: Scalars['ID']['output'];
};

export type TestSession = {
  __typename?: 'TestSession';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  createdAt: Scalars['DateTime']['output'];
  expiredAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  maxPoints: Scalars['Int']['output'];
  orderedQuestions: Array<QuestionOrder>;
  pointsEarned: Scalars['Int']['output'];
  questions: Array<Question>;
  startedAt?: Maybe<Scalars['DateTime']['output']>;
  status: TestSessionStatus;
  test: Test;
  testId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId?: Maybe<Scalars['ID']['output']>;
};

export type TestSessionAnswerInput = {
  questionId: Scalars['ID']['input'];
  questionOptionIds: Array<Scalars['ID']['input']>;
};

export enum TestSessionStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Expired = 'EXPIRED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

export type Todo = {
  __typename?: 'Todo';
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
};

export type UpdateBatchQuestionsByCollectionInput = {
  collectionId: Scalars['ID']['input'];
  questions: Array<UpdateQuestionData>;
};

export type UpdateCourseInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCourseSectionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  sectionId?: InputMaybe<Scalars['ID']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQuestionCollectionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQuestionData = {
  id?: InputMaybe<Scalars['ID']['input']>;
  options: Array<UpdateQuestionOptionInput>;
  points: Scalars['Int']['input'];
  questionText?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQuestionInput = {
  options?: InputMaybe<Array<QuestionOptionInput>>;
  points: Scalars['Int']['input'];
  questionCollectionId?: InputMaybe<Scalars['ID']['input']>;
  questionText?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQuestionOptionInput = {
  isCorrect?: InputMaybe<Scalars['Boolean']['input']>;
  optionText?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQuestionPointsByCollectionInput = {
  collectionId: Scalars['ID']['input'];
  points: Scalars['Int']['input'];
  testId: Scalars['ID']['input'];
};

export type UpdateTestInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  totalTime?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateTestQuestionRequirementInput = {
  numberOfQuestions: Scalars['Int']['input'];
  pointsPerQuestion: Scalars['Int']['input'];
};

export type UpdateTestSessionInput = {
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  totalScore?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  permissions: Array<PermissionEnum>;
  roles: Array<Role>;
  username: Scalars['String']['output'];
};
