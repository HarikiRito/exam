import { DownloadIcon, FileTextIcon, PlusIcon, CopyIcon } from 'lucide-react';
import { memo, useMemo, useState, useRef, useEffect } from 'react';

import { AppAccordion } from 'app/shared/components/ui/accordion/AppAccordion';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { AppDialog } from 'app/shared/components/ui/dialog/AppDialog';

import { produce } from 'immer';
import { QuestionData, QuestionItem } from './QuestionItem';
import { ImportQuestionsDialog } from './ImportQuestionsDialog';
import { useExportQuestionsLazyQuery } from 'app/graphql/operations/questions/exportQuestions.query.generated';
import { toast } from 'sonner';

interface QuestionManagerProps {
  readonly questions: QuestionData[];
  readonly onSaveQuestions: (questions: QuestionData[]) => void;
  readonly isSaving: boolean;
  readonly collectionId?: string;
}

export const QuestionManager = memo(({ questions, onSaveQuestions, isSaving, collectionId }: QuestionManagerProps) => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportedJson, setExportedJson] = useState<string>('');
  const [localQuestions, setLocalQuestions] = useState<QuestionData[]>(questions);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);

  const questionRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [exportQuestions, { loading: isExporting }] = useExportQuestionsLazyQuery();

  useEffect(() => {
    if (scrollToIndex === null) return;
    if (!questionRefs.current[scrollToIndex]) return;

    const element = questionRefs.current[scrollToIndex];
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setScrollToIndex(null);
  }, [scrollToIndex, localQuestions]);

  function handleAddQuestion() {
    const newQuestion: QuestionData = {
      questionText: '',
      points: 5,
      options: [],
      allowMultipleCorrect: false,
      isNew: true,
    };

    const updatedQuestions = [newQuestion, ...localQuestions];
    setLocalQuestions(updatedQuestions);
  }

  function handleImportQuestions(importedQuestions: QuestionData[]) {
    const originalLength = localQuestions.length;
    const updatedQuestions = [...localQuestions, ...importedQuestions];
    setLocalQuestions(updatedQuestions);

    if (importedQuestions.length === 0) return;

    setScrollToIndex(originalLength);
  }

  async function handleExportQuestions() {
    if (!collectionId) {
      toast.error('No collection selected');
      return;
    }

    const questionIds = localQuestions.filter((q) => q.id).map((q) => q.id!);

    if (questionIds.length === 0) {
      toast.error('No questions to export');
      return;
    }

    const result = await exportQuestions({
      variables: { questionIds },
    });

    if (!result.data) {
      toast.error('Failed to export questions');
      return;
    }

    setExportedJson(result.data.exportQuestions);
    setIsExportDialogOpen(true);
  }

  function handleCopyJson() {
    navigator.clipboard
      .writeText(exportedJson)
      .then(() => {
        toast.success('JSON copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  }

  const questionsItems = useMemo(() => {
    function handleQuestionChange(index: number, updatedQuestion: QuestionData) {
      const updatedQuestions = produce(localQuestions, (draft) => {
        draft[index] = updatedQuestion;
      });
      setLocalQuestions(updatedQuestions);
    }
    return localQuestions.map((question, index) => (
      <div
        key={index}
        ref={(el) => {
          questionRefs.current[index] = el;
        }}>
        <QuestionItem index={index} question={question} onQuestionChange={handleQuestionChange} />
      </div>
    ));
  }, [localQuestions]);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <AppTypography.h3>Questions</AppTypography.h3>
        <div className='flex gap-2'>
          <AppButton type='button' onClick={handleAddQuestion} variant='outline'>
            <PlusIcon className='mr-2 h-4 w-4' />
            Add Question
          </AppButton>
          <AppButton type='button' onClick={() => setIsImportDialogOpen(true)} variant='outline'>
            <FileTextIcon className='mr-2 h-4 w-4' />
            Import Questions
          </AppButton>
          <AppButton
            type='button'
            onClick={handleExportQuestions}
            variant='outline'
            disabled={isExporting || localQuestions.filter((q) => q.id).length === 0}>
            <DownloadIcon className='mr-2 h-4 w-4' />
            {isExporting ? 'Exporting...' : 'Export Questions'}
          </AppButton>
          <AppButton
            type='button'
            onClick={() => onSaveQuestions(localQuestions)}
            disabled={isSaving || localQuestions.length === 0}>
            {isSaving ? 'Saving...' : 'Save Questions'}
          </AppButton>
        </div>
      </div>

      {localQuestions.length > 0 ? (
        <AppAccordion.Root type='single'>{questionsItems}</AppAccordion.Root>
      ) : (
        <div className='rounded-md border border-dashed p-8 text-center'>
          <AppTypography.muted>
            No questions added yet. Click "Add Question" to create a new question.
          </AppTypography.muted>
        </div>
      )}

      <ImportQuestionsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImportQuestions={handleImportQuestions}
      />

      <AppDialog.Root open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <AppDialog.Content className='max-h-[90vh]'>
          <AppDialog.Header>
            <div className='flex items-center justify-between'>
              <AppDialog.Title>Exported Questions</AppDialog.Title>
              <AppButton type='button' onClick={handleCopyJson} variant='outline' size='sm'>
                <CopyIcon className='mr-2 h-4 w-4' />
                Copy Content
              </AppButton>
            </div>
            <AppDialog.Description>Review the exported questions in JSON format below.</AppDialog.Description>
          </AppDialog.Header>

          <div className='flex-1 overflow-auto'>
            <pre className='bg-muted max-h-96 overflow-auto rounded-md p-4 text-sm whitespace-pre-wrap'>
              {exportedJson ? JSON.stringify(JSON.parse(exportedJson), null, 2) : ''}
            </pre>
          </div>
        </AppDialog.Content>
      </AppDialog.Root>
    </div>
  );
});
