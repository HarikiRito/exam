import { useState } from 'react';
import { FileTextIcon } from 'lucide-react';
import { guardSync } from 'safe-guard-data';

import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';
import { AppTextarea } from 'app/shared/components/textarea/AppTextarea';
import { AppTypography } from 'app/shared/components/typography/AppTypography';

import { questionBatchSchema, type QuestionItemData } from './questionBatchSchema';
import type { QuestionData } from './QuestionItem';

interface ImportQuestionsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onImportQuestions: (questions: QuestionData[]) => void;
}

export function ImportQuestionsDialog({ open, onOpenChange, onImportQuestions }: ImportQuestionsDialogProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValid, setIsValid] = useState(false);

  function handleJsonInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setJsonInput(value);
    validateJson(value);
  }

  function validateJson(jsonString: string) {
    if (!jsonString.trim()) {
      setValidationErrors([]);
      setIsValid(false);
      return;
    }

    const result = guardSync(() => JSON.parse(jsonString));

    if (!result.hasData()) {
      setValidationErrors(['Invalid JSON format. Please check your syntax.']);
      setIsValid(false);
      return;
    }

    const validationResult = questionBatchSchema.safeParse(result.data);

    if (validationResult.success) {
      setValidationErrors([]);
      setIsValid(true);
      return;
    }
    const errors = validationResult.error.errors.map((error) => {
      const path = error.path.length > 0 ? `${error.path.join('.')}: ` : '';
      return `${path}${error.message}`;
    });
    setValidationErrors(errors);
    setIsValid(false);
  }

  function transformToQuestionData(importedQuestions: QuestionItemData[]): QuestionData[] {
    return importedQuestions.map((item) => ({
      questionText: item.question,
      points: item.points,
      options: item.options.map((option) => ({
        optionText: option.text,
        isCorrect: option.correct,
      })),
      allowMultipleCorrect: item.options.filter((option) => option.correct).length > 1,
      isNew: true,
    }));
  }

  function handleImport() {
    if (!isValid || !jsonInput.trim()) return;

    const parseResult = guardSync(() => JSON.parse(jsonInput));

    if (!parseResult.hasData()) {
      setValidationErrors(['Failed to parse JSON. Please check your syntax.']);
      return;
    }

    const validationResult = guardSync(() => questionBatchSchema.parse(parseResult.data));

    if (!validationResult.hasData()) {
      setValidationErrors(['Failed to import questions. Please try again.']);
      return;
    }

    const transformedQuestions = transformToQuestionData(validationResult.data);
    onImportQuestions(transformedQuestions);
    handleClose();
  }

  function handleClose() {
    setJsonInput('');
    setValidationErrors([]);
    setIsValid(false);
    onOpenChange(false);
  }

  function _renderValidationErrors() {
    if (validationErrors.length === 0) return null;

    return (
      <div className='border-destructive bg-destructive/10 rounded-md border p-3'>
        <AppTypography.small className='text-destructive font-medium'>Validation Errors:</AppTypography.small>
        <ul className='mt-2 space-y-1'>
          {validationErrors.map((error, index) => (
            <li key={index} className='text-destructive text-sm'>
              • {error}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const placeholderJson = `[
  {
    "question": "What is the capital of France?",
    "points": 5,
    "options": [
      {
        "text": "Paris",
        "correct": true
      },
      {
        "text": "London",
        "correct": false
      }
    ],
    "explanation": "Optional explanation text",
    "sources": ["Optional source URLs"]
  }
]`;

  return (
    <AppDialog.Root open={open} onOpenChange={onOpenChange}>
      <AppDialog.Content className='max-w-4xl'>
        <AppDialog.Header>
          <AppDialog.Title>
            <div className='flex items-center gap-2'>
              <FileTextIcon className='h-5 w-5' />
              Import Questions
            </div>
          </AppDialog.Title>
          <AppDialog.Description>
            Enter valid JSON data to import multiple questions at once. The JSON must be an array of question objects
            following the specified format.
          </AppDialog.Description>
        </AppDialog.Header>

        <div className='space-y-4'>
          <div>
            <AppTypography.small className='font-medium'>JSON Input:</AppTypography.small>
            <AppTextarea
              placeholder={placeholderJson}
              value={jsonInput}
              onChange={handleJsonInputChange}
              rows={20}
              className='mt-2 font-mono text-sm'
            />
          </div>

          {_renderValidationErrors()}
        </div>

        <AppDialog.Footer>
          <AppButton variant='outline' onClick={handleClose}>
            Cancel
          </AppButton>
          <AppButton onClick={handleImport} disabled={!isValid}>
            Import Questions
          </AppButton>
        </AppDialog.Footer>
      </AppDialog.Content>
    </AppDialog.Root>
  );
}
