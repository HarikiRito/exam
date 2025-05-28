import { PaginateQuestionCollectionsQuery } from 'app/graphql/operations/questionCollection/paginateQuestionCollections.query.generated';
import { AppCombobox } from 'app/shared/components/combobox/AppCombobox';
import { AppForm } from 'app/shared/components/form/AppForm';

type QuestionCollection = PaginateQuestionCollectionsQuery['paginatedQuestionCollections']['items'][0];

interface QuestionCollectionSelectorProps {
  readonly collections: QuestionCollection[];
  readonly loading: boolean;
  readonly value: string | undefined;
  readonly onValueChange: (value: string | undefined) => void;
}

export function QuestionCollectionSelector({
  collections,
  loading,
  value,
  onValueChange,
}: QuestionCollectionSelectorProps) {
  const collectionOptions = collections.map((collection) => ({
    value: collection.id,
    label: collection.title,
  }));

  return (
    <>
      <AppForm.Label>Question Collection</AppForm.Label>
      <AppCombobox
        options={collectionOptions}
        value={value || ''}
        onValueChange={onValueChange}
        placeholder={loading ? 'Loading collections...' : 'Select a collection'}
        emptyMessage='No collections found.'
        disabled={loading}
        className='w-full'
      />
      <AppForm.Description>Choose the collection this question belongs to.</AppForm.Description>
    </>
  );
}
