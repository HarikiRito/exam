import { GetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { QuestionCountByPointsQuery } from 'app/graphql/operations/questionCollection/questionCountByPoints.query.generated';
import { createProxyWithReset } from 'app/shared/utils/valtio';

class TestEditState {
  testDetails: GetTestQuery['test'] | null = null;
  isLoading = false;
  questionCounts: QuestionCountByPointsQuery['questionCountByPoints'] | null = null;
}

export const testEditStore = createProxyWithReset(new TestEditState());
