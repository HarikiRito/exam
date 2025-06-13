import { useNavigate, useParams } from '@remix-run/react';
import { useEffect } from 'react';

import { useGetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { testEditStore } from './testEditStore';
import { TestQuestionCollectionsManager } from './TestQuestionCollectionsManager';
import { TestQuestionRequirementsForm } from './TestQuestionRequirementsForm';
import { TestQuestionsIgnore } from './TestQuestionsIgnore';
import { UpdateTestForm } from './UpdateTestForm';

const testEditMutation = testEditStore.proxyState;
export default function EditTestPage() {
  testEditStore.useResetHook();
  const { testId } = useParams();
  const navigate = useNavigate();
  const testEditState = testEditStore.useStateSnapshot();

  if (!testId) {
    navigate(APP_ROUTES.adminTests);
    return null;
  }

  // Fetch test data
  const { data: testData, loading: testLoading } = useGetTestQuery({
    variables: { id: testId },
  });

  // Update store when test data loads
  useEffect(() => {
    testEditMutation.isLoading = testLoading;

    if (!testData) {
      return;
    }

    testEditMutation.testDetails = testData.test;
  }, [testData, testLoading]);

  if (testLoading || testEditState.isLoading) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>Loading...</AppTypography.h1>
      </div>
    );
  }

  if (!testEditState.testDetails) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>Test not found</AppTypography.h1>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6'>
        <AppTypography.h1>Edit Test: {testEditState.testDetails.name}</AppTypography.h1>
      </div>

      <div className='space-y-6'>
        <UpdateTestForm />
        <TestQuestionCollectionsManager />
        <TestQuestionRequirementsForm />
        <TestQuestionsIgnore />
      </div>
    </div>
  );
}
