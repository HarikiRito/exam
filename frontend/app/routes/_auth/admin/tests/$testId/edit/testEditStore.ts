import { GetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { createProxyWithReset } from 'app/shared/utils/valtio';

class TestEditState {
  testDetails: GetTestQuery['test'] | null = null;
  isLoading = false;
}

export const testEditStore = createProxyWithReset(new TestEditState());
