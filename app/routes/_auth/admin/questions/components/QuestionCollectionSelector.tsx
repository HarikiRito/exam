import { Control } from 'react-hook-form';

import { PaginateQuestionCollectionsQuery } from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { AppCombobox } from 'app/shared/components/combobox/AppCombobox';
import { AppForm } from 'app/shared/components/form/AppForm';

import { QuestionFormData } from './QuestionEditAndCreatePage';

type QuestionCollection = PaginateQuestionCollectionsQuery['paginatedQuestionCollections']['items'][0];

interface QuestionCollectionSelectorProps {
  readonly control: Control<QuestionFormData>;
  readonly collections: QuestionCollection[];
  readonly loading: boolean;
}

export function QuestionCollectionSelector({ control, collections, loading }: QuestionCollectionSelectorProps) {
  const collectionOptions = collections.map((collection) => ({
    value: collection.id,
    label: collection.title,
  }));

  return (
    <AppForm.Field
      control={control}
      name='questionCollectionId'
      render={({ field }) => (
        <AppForm.Item>
          <AppForm.Label>Question Collection</AppForm.Label>
          <AppForm.Control>
            <AppCombobox
              options={collectionOptions}
              value={field.value}
              onValueChange={field.onChange}
              placeholder={loading ? 'Loading collections...' : 'Select a question collection'}
              emptyMessage='No collections found.'
              disabled={loading}
              className='w-full'
            />
          </AppForm.Control>
          <AppForm.Description>Choose the collection this question belongs to.</AppForm.Description>
          <AppForm.Message />
        </AppForm.Item>
      )}
    />
  );
}
