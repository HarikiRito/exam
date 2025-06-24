import { GetQuestionsByIdsQuery } from 'app/graphql/operations/question/getQuestionsByIds.query.generated';
import { createProxyWithReset } from 'app/shared/utils/valtio';
import { toast } from 'sonner';
import { proxySet } from 'valtio/utils';

type QuestionItem = GetQuestionsByIdsQuery['questions'][number];

const initialState = {
  currentQuestionIndex: 0,
  selectedAnswers: {} as Record<string, Set<string>>,
  flaggedQuestions: proxySet<string>(),
  timeLeft: 3000 * 60 * 1000, // Default 50 minutes in milliseconds
  examStarted: false,
  isFinishExamDialogOpen: false,
  isReportQuestionDialogOpen: false,
  timerInterval: null,
  questions: [] as QuestionItem[],
};

export const testSessionStore = createProxyWithReset(initialState);
const state = testSessionStore.proxyState;

export const actions = {
  handleToggleFlag(questionId: string) {
    const flaggedQuestions = state.flaggedQuestions;
    if (flaggedQuestions.has(questionId)) {
      flaggedQuestions.delete(questionId);
    } else {
      flaggedQuestions.add(questionId);
    }
  },

  handleSelectAnswer(question: QuestionItem, selected: boolean) {
    const selectedAnswers = state.selectedAnswers;
    const correctOptionCount = question.correctOptionCount;

    if (!selectedAnswers[question.id]) {
      selectedAnswers[question.id] = new Set<string>();
    }

    const currentSelectedAnswers = selectedAnswers[question.id]!;

    const isCurrentOptionSelected = currentSelectedAnswers.has(question.id);

    const currentCount = currentSelectedAnswers.size;

    if (currentCount === correctOptionCount && !isCurrentOptionSelected) {
      return toast.error(`Max ${correctOptionCount} options can be selected. Please deselect an option.`);
    }

    if (selected) {
      currentSelectedAnswers.add(question.id);
    } else {
      currentSelectedAnswers.delete(question.id);
    }

    selectedAnswers[question.id] = currentSelectedAnswers;
  },

  handleStartExam() {
    if (!state.examStarted) {
      state.examStarted = true;
      actions.startTimer();
    }
  },

  startTimer() {
    // Clear any existing timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    // Start new timer that decreases timeLeft every second
    // state.timerInterval = setInterval(() => {
    //   if (state.timeLeft > 0) {
    //     state.timeLeft -= 1000; // Decrease by 1 second (1000ms)
    //   } else {
    //     // Time's up - auto-submit exam
    //     testSessionActions.handleFinishExamConfirmed();
    //     testSessionActions.stopTimer();
    //   }
    // }, 1000);
  },

  stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  },

  handleFinishExam() {
    state.isFinishExamDialogOpen = true;
  },

  handleFinishExamConfirmed() {
    console.info('Exam Finished! Submitting answers:', state.selectedAnswers);
    actions.stopTimer();
    state.isFinishExamDialogOpen = false;
  },

  handleJumpToQuestion(index: number) {
    state.currentQuestionIndex = index;
  },

  handlePrevious() {
    state.currentQuestionIndex = Math.max(0, state.currentQuestionIndex - 1);
  },

  handleNext() {
    state.currentQuestionIndex = Math.max(0, state.currentQuestionIndex + 1);
  },

  submitReportQuestion(reason: string, details: string) {
    console.info('Report Question:', reason, details);
  },
};

export { state as testSessionState, actions as testSessionActions };
