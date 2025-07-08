import { useParams, useNavigate } from '@remix-run/react';
import { Edit } from 'lucide-react';
import { useGetQuestionQuery } from 'app/graphql/operations/question/getQuestion.query.generated';
import { AppButton } from 'app/shared/components/ui/button/AppButton';
import { AppCard } from 'app/shared/components/ui/card/AppCard';
import { AppBadge } from 'app/shared/components/ui/badge/AppBadge';
import { APP_ROUTES } from 'app/shared/constants/routes';
import { AppMarkdown } from 'app/shared/components/ui/markdown/AppMarkdown';
import { cn } from 'app/shared/utils/className';
import { useCheckPermission } from 'app/shared/hooks/useCheckPermission';
import { PERMISSION_ROUTE } from 'app/shared/constants/permission';
import { UnauthorizedMessage } from 'app/shared/components/custom/Authorized';

export default function QuestionDetailPage() {
  const hasPermission = useCheckPermission(PERMISSION_ROUTE.adminQuestions);

  const { questionId } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useGetQuestionQuery({
    variables: { id: questionId! },
    skip: !questionId || !hasPermission,
  });

  function handleEditClick() {
    if (questionId) {
      navigate(APP_ROUTES.adminQuestionEdit(questionId));
    }
  }

  if (!hasPermission) {
    return <UnauthorizedMessage />;
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-lg'>Loading question...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-lg text-red-600'>Error loading question: {error.message}</div>
      </div>
    );
  }

  if (!data?.question) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='text-lg'>Question not found</div>
      </div>
    );
  }

  const question = data.question;

  return (
    <div className='p-6'>
      {/* Header with Edit Button */}
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-2xl font-bold'>Question Details</h1>
        <AppButton onClick={handleEditClick} className='flex items-center gap-2'>
          <Edit className='h-4 w-4' />
          Edit Question
        </AppButton>
      </div>

      {/* Question Information Card */}
      <AppCard.Root className='mb-6'>
        <AppCard.Header>
          <div className='flex items-center justify-between'>
            <AppCard.Title>Question Information</AppCard.Title>
            <AppBadge variant='outline'>
              {question.points} {question.points === 1 ? 'Point' : 'Points'}
            </AppBadge>
          </div>
        </AppCard.Header>

        <AppCard.Content className='space-y-4'>
          {/* Collection Information */}
          {question.collection && (
            <div>
              <h3 className='mb-1 text-sm font-semibold text-gray-700'>Collection</h3>
              <p className='text-lg font-medium text-gray-900'>{question.collection.title}</p>
              {question.collection.description && (
                <p className='mt-1 text-sm text-gray-600'>{question.collection.description}</p>
              )}
            </div>
          )}

          {/* Question Text */}
          <div>
            <h3 className='mb-2 text-sm font-semibold text-gray-700'>Question</h3>
            <AppMarkdown className='text-lg leading-relaxed'>{question.questionText}</AppMarkdown>
          </div>

          {/* Options */}
          {question.options && question.options.length > 0 && (
            <div>
              <h3 className='mb-3 text-sm font-semibold text-gray-700'>Answer Options</h3>
              <div className='space-y-2'>
                {question.options.map((option, index) => (
                  <div
                    key={option.id}
                    className={cn(
                      'flex items-center rounded-lg border p-3',
                      option.isCorrect ? 'border-green-200 bg-green-50' : 'border-gray-200',
                    )}>
                    <div className='mr-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-sm font-medium'>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <AppMarkdown className='flex-grow text-gray-900'>{option.optionText}</AppMarkdown>
                  </div>
                ))}
              </div>
            </div>
          )}
        </AppCard.Content>
      </AppCard.Root>
    </div>
  );
}
