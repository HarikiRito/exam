import { createProxyWithReset } from 'app/shared/utils/valtio';

export interface CollectionFormData {
  title: string;
  description: string;
}

class CollectionFormState {
  // Form data
  title = '';
  description = '';

  // Current collection being edited (for edit mode)
  editingCollectionId: string | null = null;

  // Loading states
  isLoading = false;
  isSavingQuestions = false;
  savedQuestionCount = 0;
  totalQuestionsToSave = 0;
}

export const collectionFormState = createProxyWithReset(new CollectionFormState());
