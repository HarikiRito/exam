import { GetTestSessionQuery } from 'app/graphql/operations/testSession/getTestSession.query.generated';
import { createProxyWithReset } from 'app/shared/utils/valtio';
import { toast } from 'sonner';
import { proxySet } from 'valtio/utils';

type QuestionItem = GetTestSessionQuery['testSession']['questions'][number];

export class State {
  currentQuestionIndex = 0;
  selectedAnswers = {} as Record<string, Set<string>>;
  flaggedQuestions = proxySet<string>();
  examStarted = false;
  isFinishExamDialogOpen = false;
  isReportQuestionDialogOpen = false;
  timerInterval: NodeJS.Timeout | null = null;
  questions = [] as QuestionItem[];
  timeLeft = 0;

  get isFirstQuestion() {
    return this.currentQuestionIndex === 0;
  }
  get isLastQuestion() {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get totalQuestions() {
    return this.questions.length;
  }

  get currentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  get totalAnsweredQuestions() {
    return Object.values(this.selectedAnswers).filter((answers) => answers.size > 0).length;
  }

  handleToggleFlag(questionId: string) {
    const flaggedQuestions = state.flaggedQuestions;
    if (flaggedQuestions.has(questionId)) {
      flaggedQuestions.delete(questionId);
    } else {
      flaggedQuestions.add(questionId);
    }
  }

  handleSelectAnswer(question: QuestionItem, optionId: string) {
    const selectedAnswers = this.selectedAnswers;
    const correctOptionCount = question.correctOptionCount;

    if (!selectedAnswers[question.id]) {
      selectedAnswers[question.id] = proxySet<string>();
    }

    const currentSelectedAnswers = selectedAnswers[question.id]!;

    const isCurrentOptionSelected = currentSelectedAnswers.has(optionId);

    const currentCount = currentSelectedAnswers.size;

    if (correctOptionCount > 1 && currentCount === correctOptionCount && !isCurrentOptionSelected) {
      return toast.error(`Max ${correctOptionCount} options can be selected. Please deselect an option.`);
    }

    if (correctOptionCount === 1) {
      currentSelectedAnswers.clear();
    }

    if (correctOptionCount === 1 && !isCurrentOptionSelected) {
      currentSelectedAnswers.add(optionId);
      this.selectedAnswers[question.id] = currentSelectedAnswers;
      return;
    }

    if (isCurrentOptionSelected) {
      currentSelectedAnswers.delete(optionId);
    } else {
      currentSelectedAnswers.add(optionId);
    }

    this.selectedAnswers[question.id] = currentSelectedAnswers;
  }

  handleStartExam() {
    if (!state.examStarted) {
      state.examStarted = true;
      this.startTimer();
    }
  }

  startTimer() {
    // Clear any existing timer
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
    }

    // Start new timer that decreases timeLeft every second
    state.timerInterval = setInterval(() => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    }, 1000);
  }

  stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  handleFinishExam() {
    state.isFinishExamDialogOpen = !state.isFinishExamDialogOpen;
  }

  handleJumpToQuestion(index: number) {
    state.currentQuestionIndex = index;
  }

  handlePrevious() {
    state.currentQuestionIndex--;
  }

  handleNext() {
    state.currentQuestionIndex++;
  }

  submitReportQuestion(reason: string, details: string) {
    console.info('Report Question:', reason, details);
  }
}

export const testSessionStore = createProxyWithReset(new State());
const state = testSessionStore.proxyState;

export { state as testSessionState };
