import { useNavigate, useParams } from '@remix-run/react';
import { useState } from 'react';
import { PlusIcon, CheckIcon } from 'lucide-react';
import { toast } from 'sonner';
import { userStore } from 'app/shared/stores/user.store';
import { useSnapshot } from 'valtio';

import { useGetTestQuery } from 'app/graphql/operations/test/getTest.query.generated';
import { usePaginateUsersQuery } from 'app/graphql/operations/user/paginateUsers.query.generated';
import { useCreateTestSessionMutation } from 'app/graphql/operations/testSession/createTestSession.mutation.generated';
import { AppButton } from 'app/shared/components/button/AppButton';
import { AppDialog } from 'app/shared/components/dialog/AppDialog';
import { AppInput } from 'app/shared/components/input/AppInput';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { APP_ROUTES } from 'app/shared/constants/routes';

export default function AdminTestDetail() {
  const navigate = useNavigate();
  const { testId } = useParams();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const snap = useSnapshot(userStore);

  // Fetch test details
  const { data: testData, loading: testLoading } = useGetTestQuery({
    variables: { id: testId! },
    skip: !testId,
  });

  // Fetch users for the modal
  const { data: usersData, loading: usersLoading } = usePaginateUsersQuery({
    variables: {
      paginationInput: {
        page: 1,
        limit: 50,
        search: searchTerm,
      },
    },
    skip: !isCreateSessionOpen,
  });

  // Create test session mutation
  const [createTestSession, { loading: createSessionLoading }] = useCreateTestSessionMutation({
    onCompleted: () => {
      toast.success('Test sessions created successfully!');
      setIsCreateSessionOpen(false);
      setSelectedUserIds([]);
      setSearchTerm('');
    },
    onError: (error) => {
      toast.error(`Failed to create test sessions: ${error.message}`);
    },
  });

  function handleUserToggle(userId: string) {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  function handleCreateTestSession() {
    if (selectedUserIds.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    createTestSession({
      variables: {
        input: {
          testId: testId!,
          userIds: selectedUserIds,
        },
      },
    });
  }

  function handleCloseModal() {
    setIsCreateSessionOpen(false);
    setSelectedUserIds([]);
    setSearchTerm('');
  }

  if (testLoading) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>Loading...</AppTypography.h1>
      </div>
    );
  }

  if (!testData?.test) {
    return (
      <div className='container mx-auto py-6'>
        <AppTypography.h1>Test not found</AppTypography.h1>
        <AppButton onClick={() => navigate(APP_ROUTES.adminTests)} className='mt-4'>
          Back to Tests
        </AppButton>
      </div>
    );
  }

  const test = testData.test;
  const users = usersData?.paginatedUsers?.items || [];

  return (
    <div className='container mx-auto py-6'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <AppTypography.h1>Test Details</AppTypography.h1>
          <AppTypography.p className='text-muted-foreground'>
            Manage test information and create test sessions
          </AppTypography.p>
        </div>
        <div className='flex gap-2'>
          <AppButton variant='outline' onClick={() => navigate(APP_ROUTES.adminTests)}>
            Back to Tests
          </AppButton>
          <AppButton onClick={() => setIsCreateSessionOpen(true)} className='flex items-center gap-2'>
            <PlusIcon className='h-4 w-4' />
            Create Test Session
          </AppButton>
        </div>
      </div>

      {/* Test Summary Card */}
      <div className='bg-card rounded-lg border p-6 shadow-sm'>
        <div className='space-y-4'>
          <div>
            <AppTypography.h2 className='mb-2 text-xl font-semibold'>{test.name}</AppTypography.h2>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div>
                <AppTypography.small className='text-muted-foreground'>Total Time</AppTypography.small>
                <AppTypography.p className='font-medium'>
                  {test.totalTime ? `${test.totalTime} minutes` : 'Not specified'}
                </AppTypography.p>
              </div>
              <div>
                <AppTypography.small className='text-muted-foreground'>Question Collections</AppTypography.small>
                <AppTypography.p className='font-medium'>
                  {test.questionCollections.length} collection(s)
                </AppTypography.p>
              </div>
            </div>
          </div>

          {test.questionCollections.length > 0 && (
            <div>
              <AppTypography.h3 className='mb-3 text-lg font-medium'>Collections</AppTypography.h3>
              <div className='space-y-2'>
                {test.questionCollections.map((collection) => (
                  <div key={collection.id} className='rounded border p-3'>
                    <AppTypography.p className='font-medium'>{collection.title}</AppTypography.p>
                    {collection.description && (
                      <AppTypography.small className='text-muted-foreground'>
                        {collection.description}
                      </AppTypography.small>
                    )}
                    <AppTypography.small className='text-muted-foreground mt-1 block'>
                      {collection.questions.length} question(s)
                    </AppTypography.small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Test Session Modal */}
      <AppDialog.Root open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
        <AppDialog.Content className='max-w-2xl'>
          <AppDialog.Header>
            <AppDialog.Title>Create Test Session</AppDialog.Title>
            <AppDialog.Description>
              Select users to create test sessions for "{test.name}". Each selected user will receive their own test
              session.
            </AppDialog.Description>
          </AppDialog.Header>

          <div className='space-y-4'>
            {/* Search Input */}
            <div>
              <AppTypography.small className='text-muted-foreground mb-2 block'>Search Users</AppTypography.small>
              <AppInput
                placeholder='Search by name or email...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full'
              />
            </div>

            {/* Users List */}
            <div className='max-h-96 overflow-y-auto'>
              {usersLoading ? (
                <div className='text-muted-foreground py-4 text-center'>Loading users...</div>
              ) : users.length === 0 ? (
                <div className='text-muted-foreground py-4 text-center'>No users found</div>
              ) : (
                <div className='space-y-2'>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className='hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded border p-3'
                      onClick={() => handleUserToggle(user.id)}>
                      <div className='flex h-5 w-5 items-center justify-center rounded border'>
                        {selectedUserIds.includes(user.id) && <CheckIcon className='text-primary h-3 w-3' />}
                      </div>
                      <div className='flex-1'>
                        <AppTypography.p className='font-medium'>
                          {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}{' '}
                          {snap.user?.email === user.email && '(You)'}
                        </AppTypography.p>
                        <AppTypography.small className='text-muted-foreground'>{user.email}</AppTypography.small>
                      </div>
                      {!user.isActive && (
                        <span className='bg-muted text-muted-foreground rounded px-2 py-1 text-xs'>Inactive</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedUserIds.length > 0 && (
              <div className='bg-muted rounded p-3'>
                <AppTypography.small className='text-muted-foreground'>
                  {selectedUserIds.length} user(s) selected
                </AppTypography.small>
              </div>
            )}
          </div>

          <AppDialog.Footer>
            <AppButton variant='outline' onClick={handleCloseModal}>
              Cancel
            </AppButton>
            <AppButton
              onClick={handleCreateTestSession}
              disabled={selectedUserIds.length === 0 || createSessionLoading}
              isLoading={createSessionLoading}>
              {createSessionLoading ? 'Creating...' : 'Create Sessions'}
            </AppButton>
          </AppDialog.Footer>
        </AppDialog.Content>
      </AppDialog.Root>
    </div>
  );
}
