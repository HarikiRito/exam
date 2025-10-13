import { AppTabs } from 'app/shared/components/ui/tabs/AppTabs';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { QuestionResultCard } from './QuestionResultCard';
import { GetTestSessionResultQuery } from 'app/graphql/operations/testSession/getTestSessionResult.query.generated';
import { resultStore, FilterTab } from '../state';

type QuestionResult = GetTestSessionResultQuery['testSessionResult']['questions'][number];

interface GroupedQuestionsListProps {
  readonly questions: QuestionResult[];
}

export function GroupedQuestionsList({ questions }: GroupedQuestionsListProps) {
  const snap = resultStore.useStateSnapshot();

  const sortedQuestions = [...questions].sort((a, b) => a.order - b.order);

  const correctQuestions = sortedQuestions.filter((q) => q.isCorrect);
  const incorrectQuestions = sortedQuestions.filter((q) => !q.isCorrect);

  function handleTabChange(value: string) {
    resultStore.proxyState.setFilterTab(value as FilterTab);
  }

  function getQuestionsToDisplay() {
    switch (snap.filterTab) {
      case 'correct':
        return correctQuestions;
      case 'incorrect':
        return incorrectQuestions;
      default:
        return sortedQuestions;
    }
  }

  const displayQuestions = getQuestionsToDisplay();

  return (
    <div>
      <AppTabs.Root value={snap.filterTab} onValueChange={handleTabChange}>
        <AppTabs.List>
          <AppTabs.Trigger value='all'>All ({sortedQuestions.length})</AppTabs.Trigger>
          <AppTabs.Trigger value='correct'>Correct ({correctQuestions.length})</AppTabs.Trigger>
          <AppTabs.Trigger value='incorrect'>Incorrect ({incorrectQuestions.length})</AppTabs.Trigger>
        </AppTabs.List>

        <AppTabs.Content value={snap.filterTab} className='mt-6 space-y-4'>
          {displayQuestions.length === 0 ? (
            <AppTypography.muted className='py-8 text-center'>No questions in this category</AppTypography.muted>
          ) : (
            displayQuestions.map((questionResult) => (
              <QuestionResultCard
                key={questionResult.question.id}
                questionResult={questionResult}
                questionNumber={questionResult.order}
              />
            ))
          )}
        </AppTabs.Content>
      </AppTabs.Root>
    </div>
  );
}
