import { QuestionOptionItemFragment } from 'app/graphql/operations/question/questionOption.fragment.generated';
import { createProxyWithReset } from 'app/shared/utils/valtio';

export type QuestionOption = Omit<QuestionOptionItemFragment, 'id'> & {
  id?: string;
};

export interface QuestionFormData {
  questionText: string;
  questionCollectionId: string;
  options: QuestionOption[];
}

class QuestionFormState {
  // Form data
  questionText = '';
  questionCollectionId = '';
  options: QuestionOption[] = [];

  // Toggle for single vs multiple correct answers
  allowMultipleCorrect = false;

  // Current question being edited (for edit mode)
  editingQuestionId: string | null = null;

  // Loading states
  isLoading = false;
  isSaving = false;
}

export const questionFormState = createProxyWithReset(new QuestionFormState());
