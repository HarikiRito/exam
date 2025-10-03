'use client';

import { useNavigate, useParams } from '@remix-run/react';
import { SubmitTestSessionInput } from 'app/graphql/graphqlTypes';
import { useSubmitTestSessionMutation } from 'app/graphql/operations/testSession/submitTestSession.mutation.generated';
import { testSessionState, testSessionStore } from '../state';
import { AppAlertDialog } from 'app/shared/components/ui/alert-dialog/AppAlertDialog';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { toast } from 'sonner';

export function FinishExamDialog() {
  const snapshot = testSessionStore.useStateSnapshot();
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const totalQuestionLeftCount = snapshot.totalQuestions - snapshot.totalAnsweredQuestions;
  const totalQuestionFlaggedCount = snapshot.flaggedQuestions.size;

  const isShowWarning = totalQuestionLeftCount > 0 || totalQuestionFlaggedCount > 0;

  // Submit test session mutation
  const [submitTestSession, { loading: submitLoading }] = useSubmitTestSessionMutation({
    onCompleted: () => {
      toast.success('Test session submitted successfully!');
      testSessionState.stopTimer();
      testSessionState.isFinishExamDialogOpen = false;
      // Navigate back to test sessions list
      navigate('/tests/sessions');
    },
    onError: (error) => {
      toast.error(`Failed to submit test session: ${error.message}`);
    },
  });

  function handleSubmitTestSession() {
    if (!sessionId) {
      toast.error('Session ID is missing');
      return;
    }

    // Transform selectedAnswers to the required format using the ordered questions
    const answers: SubmitTestSessionInput['answers'] = snapshot.questions.map((question) => ({
      questionId: question.id,
      questionOptionIds: Array.from(snapshot.selectedAnswers[question.id] || []),
    }));

    submitTestSession({
      variables: {
        sessionId,
        input: {
          answers,
        },
      },
    });
  }

  return (
    <AppAlertDialog.Root
      open={snapshot.isFinishExamDialogOpen}
      onOpenChange={(open) => (testSessionState.isFinishExamDialogOpen = open)}>
      <AppAlertDialog.Content>
        <AppAlertDialog.Header>
          <AppAlertDialog.Title>Are you sure you want to finish the exam and submit your answers?</AppAlertDialog.Title>
          <AppAlertDialog.Description>
            Once you finish, the exam will be submitted and you will not be able to return to the questions.
            {isShowWarning && (
              <p className='mt-2'>
                Here are what you may missing before you finish the exam:
                <ul className='list-disc pl-5 font-bold'>
                  {totalQuestionLeftCount > 0 && <li>{totalQuestionLeftCount} questions not answered</li>}
                  {totalQuestionFlaggedCount > 0 && <li>{totalQuestionFlaggedCount} questions flagged</li>}
                </ul>
              </p>
            )}
          </AppAlertDialog.Description>
        </AppAlertDialog.Header>
        <AppAlertDialog.Footer>
          <AppAlertDialog.Cancel asChild>
            <AppButton variant='outline' onClick={() => (testSessionState.isFinishExamDialogOpen = false)}>
              Cancel
            </AppButton>
          </AppAlertDialog.Cancel>
          <AppAlertDialog.Action asChild>
            <AppButton onClick={handleSubmitTestSession} disabled={submitLoading}>
              {submitLoading ? 'Submitting...' : 'Finish Exam'}
            </AppButton>
          </AppAlertDialog.Action>
        </AppAlertDialog.Footer>
      </AppAlertDialog.Content>
    </AppAlertDialog.Root>
  );
}
