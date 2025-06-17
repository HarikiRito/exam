import { createProxyWithReset } from 'app/shared/utils/valtio';
import { proxySet } from 'valtio/utils';

class State {
  currentQuestionIndex: number = 0;
  selectedAnswers: Record<string, number[]> = {};
  flaggedQuestions: Set<string> = proxySet<string>();
  timeLeft: number = 3000 * 60 * 1000;
  examStarted: boolean = false;
  isFinishExamDialogOpen: boolean = false;
  isReportQuestionDialogOpen: boolean = false;

  handleToggleFlag(questionId: string) {
    const flaggedQuestions = state.flaggedQuestions;
    if (flaggedQuestions.has(questionId)) {
      flaggedQuestions.delete(questionId);
    } else {
      flaggedQuestions.add(questionId);
    }
  }

  handleSelectAnswer(questionId: string, optionIndex: number, isSelected: boolean) {
    const selectedAnswers = state.selectedAnswers;
    if (isSelected) {
      selectedAnswers[questionId] = [optionIndex];
    } else {
      delete selectedAnswers[questionId];
    }
  }

  handleStartExam() {
    state.examStarted = true;
  }

  handleFinishExam() {
    state.isFinishExamDialogOpen = true;
  }

  handleFinishExamConfirmed = () => {
    console.info('Exam Finished! Submitting answers:', state.selectedAnswers);
  };

  handleJumpToQuestion(index: number) {
    state.currentQuestionIndex = index;
  }

  handlePrevious() {
    state.currentQuestionIndex = Math.max(0, state.currentQuestionIndex - 1);
  }

  handleNext() {
    state.currentQuestionIndex = Math.max(0, state.currentQuestionIndex + 1);
  }

  submitReportQuestion(reason: string, details: string) {
    console.info('Report Question:', reason, details);
  }
}

export const testSessionStore = createProxyWithReset(new State());
const state = testSessionStore.proxyState;

export { state as testSessionState };
