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

export type Auth = {
  __typename?: 'Auth';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type Course = {
  __typename?: 'Course';
  createdAt: Scalars['DateTime']['output'];
  creator: User;
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CourseSection = {
  __typename?: 'CourseSection';
  courseId: Scalars['ID']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type CreateCourseInput = {
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateCourseSectionInput = {
  courseId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type CreateQuestionInput = {
  courseSectionId?: InputMaybe<Scalars['ID']['input']>;
  options?: InputMaybe<Array<QuestionOptionInput>>;
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
  questionIds: Array<Scalars['ID']['input']>;
};

export type CreateTestSessionInput = {
  courseSectionId?: InputMaybe<Scalars['ID']['input']>;
  testId: Scalars['ID']['input'];
};

export type CreateUserQuestionAnswerInput = {
  questionId: Scalars['ID']['input'];
  selectedOptionId: Scalars['ID']['input'];
  testSessionId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
};

export type LoginInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  completeTestSession: TestSession;
  createCourse: Course;
  createCourseSection: CourseSection;
  createQuestion: Question;
  createQuestionOption: QuestionOption;
  createTest: Test;
  createTestSession: TestSession;
  createTodo: Todo;
  createUserQuestionAnswer: UserQuestionAnswer;
  deleteQuestion: Scalars['Boolean']['output'];
  deleteQuestionOption: Scalars['Boolean']['output'];
  deleteTest: Scalars['Boolean']['output'];
  deleteTestSession: Scalars['Boolean']['output'];
  deleteUserQuestionAnswer: Scalars['Boolean']['output'];
  register: Auth;
  removeCourse: Scalars['Boolean']['output'];
  removeCourseSection: Scalars['Boolean']['output'];
  renewToken: Auth;
  updateCourse: Course;
  updateCourseSection: CourseSection;
  updateQuestion: Question;
  updateQuestionOption: QuestionOption;
  updateTest: Test;
  updateUserQuestionAnswer: UserQuestionAnswer;
};


export type MutationCompleteTestSessionArgs = {
  id: Scalars['ID']['input'];
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


export type MutationCreateUserQuestionAnswerArgs = {
  input: CreateUserQuestionAnswerInput;
};


export type MutationDeleteQuestionArgs = {
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


export type MutationDeleteUserQuestionAnswerArgs = {
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


export type MutationUpdateQuestionOptionArgs = {
  id: Scalars['ID']['input'];
  input: UpdateQuestionOptionInput;
};


export type MutationUpdateTestArgs = {
  id: Scalars['ID']['input'];
  input: UpdateTestInput;
};


export type MutationUpdateUserQuestionAnswerArgs = {
  id: Scalars['ID']['input'];
  input: UpdateUserQuestionAnswerInput;
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

export type PaginatedUserQuestionAnswer = {
  __typename?: 'PaginatedUserQuestionAnswer';
  items: Array<UserQuestionAnswer>;
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
  limit: Scalars['Int']['input'];
  page: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  course: Course;
  courseSection: CourseSection;
  isAuthenticated: Scalars['Boolean']['output'];
  login: Auth;
  me: User;
  paginatedCourses: PaginatedCourse;
  paginatedQuestionOptions: PaginatedQuestionOption;
  paginatedQuestions: PaginatedQuestion;
  paginatedTests: PaginatedTest;
  paginatedUserQuestionAnswers: PaginatedUserQuestionAnswer;
  question: Question;
  questionOption: QuestionOption;
  test: Test;
  testSession: TestSession;
  todos: Array<Todo>;
  userQuestionAnswer: UserQuestionAnswer;
};


export type QueryCourseArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCourseSectionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLoginArgs = {
  input: LoginInput;
};


export type QueryPaginatedCoursesArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedQuestionOptionsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedQuestionsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedTestsArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryPaginatedUserQuestionAnswersArgs = {
  paginationInput?: InputMaybe<PaginationInput>;
};


export type QueryQuestionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuestionOptionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTestSessionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserQuestionAnswerArgs = {
  id: Scalars['ID']['input'];
};

export type Question = {
  __typename?: 'Question';
  id: Scalars['ID']['output'];
  options: Array<QuestionOption>;
  questionText: Scalars['String']['output'];
  section?: Maybe<CourseSection>;
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

export type RegisterInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Test = {
  __typename?: 'Test';
  course?: Maybe<Course>;
  courseSection?: Maybe<CourseSection>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type TestSession = {
  __typename?: 'TestSession';
  completedAt?: Maybe<Scalars['DateTime']['output']>;
  courseSection?: Maybe<CourseSection>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  test: Test;
  totalScore: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userQuestionAnswers: Array<UserQuestionAnswer>;
};

export type Todo = {
  __typename?: 'Todo';
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
};

export type UpdateCourseInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateCourseSectionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQuestionInput = {
  courseSectionId?: InputMaybe<Scalars['ID']['input']>;
  options?: InputMaybe<Array<QuestionOptionInput>>;
  questionText?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateQuestionOptionInput = {
  isCorrect?: InputMaybe<Scalars['Boolean']['input']>;
  optionText?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTestInput = {
  courseId?: InputMaybe<Scalars['ID']['input']>;
  courseSectionId?: InputMaybe<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  questionIds: Array<Scalars['ID']['input']>;
};

export type UpdateTestSessionInput = {
  completedAt?: InputMaybe<Scalars['DateTime']['input']>;
  totalScore?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateUserQuestionAnswerInput = {
  selectedOptionId?: InputMaybe<Scalars['ID']['input']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type UserQuestionAnswer = {
  __typename?: 'UserQuestionAnswer';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  question: Question;
  selectedOption: QuestionOption;
  testSession: TestSession;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};
