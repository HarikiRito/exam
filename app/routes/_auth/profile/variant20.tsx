import { AppAvatar } from 'app/shared/components/avatar/AppAvatar';
import { AppBadge } from 'app/shared/components/badge/AppBadge';
import { AppCard } from 'app/shared/components/card/AppCard';
import { AppProgress } from 'app/shared/components/progress/AppProgress';
import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { UserProfile } from './types';
import { AppSeparator } from 'app/shared/components/separator/AppSeparator';
import { cn } from 'app/shared/utils/className';

type HeaderSectionProps = {
  readonly user: UserProfile;
  readonly learningPathData: {
    currentPath: {
      name: string;
      progress: number;
      startDate: string;
      estimatedCompletion: string;
      skillsAcquired: string[];
      skillsInProgress: string[];
      upcomingSkills: string[];
    };
    pathStatistics: {
      averageDailyStudyTime: number;
      daysActive: number;
      coursesCompleted: number;
      quizPassed: number;
      projectsSubmitted: number;
      codingChallengesSolved: number;
    };
  };
  readonly careerPathData: {
    currentRole: string;
    targetRole: string;
    keySkillsNeeded: string[];
    careerProgressPercent: number;
  };
  readonly daysLeft: number;
  readonly earnedPoints: number;
};

function HeaderSection({ user, learningPathData, careerPathData, daysLeft, earnedPoints }: HeaderSectionProps) {
  return (
    <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4'>
      {/* Profile Card from variant17 */}
      <div className='lg:col-span-1'>
        <AppCard.Root>
          <AppCard.Content className='flex flex-col items-center p-6 text-center'>
            <AppAvatar.Root className='mb-4 size-24'>
              <AppAvatar.Image
                src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                alt={user.name}
              />
              <AppAvatar.Fallback>{user.name.charAt(0)}</AppAvatar.Fallback>
            </AppAvatar.Root>

            <AppTypography.h3 className='mb-1'>{user.name}</AppTypography.h3>
            <AppBadge className='mb-2'>{user.role}</AppBadge>
            <AppTypography.p className='text-muted-foreground mb-4 text-sm'>{user.email}</AppTypography.p>

            <div className='w-full'>
              <div className='mb-1 flex items-center justify-between'>
                <AppTypography.small>Level {user.level}</AppTypography.small>
                <AppTypography.small>{user.levelProgress}%</AppTypography.small>
              </div>
              <AppProgress value={user.levelProgress} />
            </div>

            <div className='bg-muted/50 mt-4 flex w-full items-center justify-between rounded-lg p-3'>
              <div className='flex items-center gap-2'>
                <div className='bg-primary/20 flex size-8 items-center justify-center rounded-full'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='10' />
                    <polyline points='12 6 12 12 16 14' />
                  </svg>
                </div>
                <AppTypography.small className='font-medium'>Study Streak</AppTypography.small>
              </div>
              <AppTypography.small className='font-bold'>
                {learningPathData.pathStatistics.daysActive} days
              </AppTypography.small>
            </div>

            {/* Career Progress from variant8 */}
            <div className='mt-4 w-full'>
              <AppTypography.small className='text-muted-foreground'>Career Path Progress</AppTypography.small>
              <div className='mt-1 flex justify-between'>
                <AppTypography.small>{careerPathData.currentRole}</AppTypography.small>
                <AppTypography.small>{careerPathData.targetRole}</AppTypography.small>
              </div>
              <AppProgress value={careerPathData.careerProgressPercent} className='mt-1' />
              <AppTypography.small className='text-muted-foreground mt-1 block text-center'>
                {careerPathData.careerProgressPercent}% Complete
              </AppTypography.small>
            </div>

            {/* XP Points from variant7 */}
            <div className='bg-primary/10 mt-4 w-full rounded-lg p-3'>
              <div className='text-center'>
                <div className='text-primary text-2xl font-bold'>{earnedPoints} XP</div>
                <AppTypography.small className='text-muted-foreground'>Experience Points</AppTypography.small>
              </div>
            </div>
          </AppCard.Content>
        </AppCard.Root>
      </div>

      {/* Current Learning Path from variant17 */}
      <div className='lg:col-span-3'>
        <AppCard.Root className='h-full'>
          <AppCard.Header className='pb-0'>
            <AppCard.Title>Bio</AppCard.Title>
          </AppCard.Header>
          <AppCard.Content className='mt-0'>
            <AppTypography.p title={user.bio} className='text-muted-foreground mt-3 line-clamp-4 overflow-auto text-sm'>
              {user.bio}
            </AppTypography.p>
          </AppCard.Content>
          <AppSeparator />
          <AppCard.Header>
            <AppCard.Title>Current Learning Path</AppCard.Title>
            <AppCard.Description>Track your education journey</AppCard.Description>
          </AppCard.Header>
          <AppCard.Content>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between'>
              <div>
                <div className='flex items-center gap-2'>
                  <AppTypography.h3 className='text-xl'>{learningPathData.currentPath.name}</AppTypography.h3>
                  <AppBadge className='bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                    Active
                  </AppBadge>
                </div>
                <AppTypography.p className='text-muted-foreground mt-1 text-sm'>
                  Started on {learningPathData.currentPath.startDate} • Estimated completion:{' '}
                  {learningPathData.currentPath.estimatedCompletion}
                </AppTypography.p>
              </div>

              <div className='mt-4 flex items-center gap-2 md:mt-0'>
                <div className='text-right'>
                  <AppTypography.p className='font-bold'>{daysLeft} days left</AppTypography.p>
                  <AppTypography.small className='text-muted-foreground'>
                    until estimated completion
                  </AppTypography.small>
                </div>
                <div className='flex size-12 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='10' />
                    <polyline points='12 6 12 12 16 14' />
                  </svg>
                </div>
              </div>
            </div>

            <div className='mt-6'>
              <div className='mb-2 flex items-center justify-between'>
                <AppTypography.small className='text-muted-foreground'>Overall Progress</AppTypography.small>
                <AppTypography.small className='font-medium'>
                  {learningPathData.currentPath.progress}%
                </AppTypography.small>
              </div>
              <AppProgress value={learningPathData.currentPath.progress} className='h-3' />

              <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='bg-primary/5 rounded-lg p-4'>
                  <AppTypography.small className='text-muted-foreground mb-2 block'>
                    Skills Acquired
                  </AppTypography.small>
                  <div className='flex flex-wrap gap-2'>
                    {learningPathData.currentPath.skillsAcquired.map((skill, idx) => (
                      <AppBadge key={idx} variant='outline'>
                        {skill}
                      </AppBadge>
                    ))}
                  </div>
                </div>

                <div className='bg-primary/5 rounded-lg p-4'>
                  <AppTypography.small className='text-muted-foreground mb-2 block'>In Progress</AppTypography.small>
                  <div className='flex flex-wrap gap-2'>
                    {learningPathData.currentPath.skillsInProgress.map((skill, idx) => (
                      <AppBadge key={idx} variant='outline'>
                        {skill}
                      </AppBadge>
                    ))}
                  </div>
                </div>

                <div className='bg-primary/5 rounded-lg p-4'>
                  <AppTypography.small className='text-muted-foreground mb-2 block'>Up Next</AppTypography.small>
                  <div className='flex flex-wrap gap-2'>
                    {learningPathData.currentPath.upcomingSkills.map((skill, idx) => (
                      <AppBadge key={idx} variant='outline' className='bg-muted/50'>
                        {skill}
                      </AppBadge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </AppCard.Content>
        </AppCard.Root>
      </div>
    </div>
  );
}

// Variant 20: Comprehensive Profile Dashboard
export function ProfileVariant20({ user }: { readonly user: UserProfile }) {
  // Mock learning path data from variant17
  const learningPathData = {
    currentPath: {
      name: 'Frontend Developer Path',
      progress: 68,
      startDate: 'January 15, 2023',
      estimatedCompletion: 'August 30, 2023',
      skillsAcquired: ['HTML', 'CSS', 'JavaScript', 'React Basics'],
      skillsInProgress: ['Advanced React', 'TypeScript', 'State Management'],
      upcomingSkills: ['Testing', 'Performance Optimization', 'GraphQL'],
    },
    pathStatistics: {
      averageDailyStudyTime: 1.5, // hours
      daysActive: 120,
      coursesCompleted: user.coursesCompleted,
      quizPassed: 28,
      projectsSubmitted: 8,
      codingChallengesSolved: 65,
    },
  };

  // Activity feed data from variant9
  const activityFeed = [
    {
      type: 'course-completion',
      title: 'Completed a Course',
      content: 'Advanced React Patterns',
      date: '2 days ago',
      likes: 23,
      comments: 5,
    },
    {
      type: 'achievement',
      title: 'Earned an Achievement',
      content: 'Problem Solver - Solved 50 coding challenges',
      date: '1 week ago',
      likes: 45,
      comments: 12,
    },
    {
      type: 'post',
      title: 'Shared a Post',
      content:
        'Just discovered this amazing resource for learning system design. Highly recommended for anyone looking to level up their architecture skills!',
      date: '2 weeks ago',
      likes: 89,
      comments: 15,
    },
    {
      type: 'milestone',
      title: 'Reached a Milestone',
      content: 'Completed 10 courses in the JavaScript learning path',
      date: '1 month ago',
      likes: 56,
      comments: 8,
    },
  ];

  // Skills assessment data from variant8
  const skillProficiency = [
    { name: 'JavaScript', level: 85 },
    { name: 'React', level: 80 },
    { name: 'TypeScript', level: 75 },
    { name: 'Node.js', level: 60 },
    { name: 'CSS', level: 70 },
  ];

  // Career path data from variant8
  const careerPathData = {
    currentRole: user.role,
    targetRole: 'Senior Software Architect',
    keySkillsNeeded: ['System Design', 'Architecture Patterns', 'Team Leadership', 'Cloud Infrastructure'],
    careerProgressPercent: 65,
  };

  // Achievement data from variant7
  const achievementData = [
    {
      name: 'Fast Learner',
      description: 'Complete 3 courses in your first month',
      points: 150,
      icon: '🚀',
      dateEarned: 'Feb 15, 2023',
    },
    {
      name: 'Consistent',
      description: 'Log in for 15 consecutive days',
      points: 100,
      icon: '📅',
      dateEarned: 'Mar 2, 2023',
    },
    {
      name: 'Team Player',
      description: 'Collaborate on 5 group projects',
      points: 200,
      icon: '👥',
      dateEarned: 'Apr 10, 2023',
    },
    {
      name: 'JavaScript Master',
      description: 'Score 95% or higher on JavaScript assessment',
      points: 300,
      icon: '💻',
      dateEarned: 'Locked',
    },
    {
      name: 'Community Mentor',
      description: 'Help 10 other students with their questions',
      points: 250,
      icon: '🏆',
      dateEarned: 'Locked',
    },
  ];

  // Calculate total earned points
  const earnedPoints = achievementData
    .filter((achievement) => achievement.dateEarned !== 'Locked')
    .reduce((total, achievement) => total + achievement.points, 0);

  // Calculate days left in current path
  const today = new Date();
  const completionDate = new Date(learningPathData.currentPath.estimatedCompletion);
  const daysLeft = Math.ceil((completionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className='mx-auto max-w-7xl px-4'>
      <HeaderSection
        user={user}
        learningPathData={learningPathData}
        careerPathData={careerPathData}
        daysLeft={daysLeft}
        earnedPoints={earnedPoints}
      />
      {/* Main Content Section */}
      <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
        {/* Left Column - Skills Assessment & Achievements */}
        <div className='space-y-8'>
          {/* Learning Stats from variant4 */}
          <AppCard.Root className='bg-background'>
            <AppCard.Header>
              <AppCard.Title>Learning Stats</AppCard.Title>
            </AppCard.Header>
            <AppCard.Content>
              <div className='space-y-6'>
                <div>
                  <AppTypography.large>
                    {user.coursesCompleted}/{user.totalCourses}
                  </AppTypography.large>
                  <AppTypography.small className='text-muted-foreground'>Courses Completed</AppTypography.small>
                </div>

                <div>
                  <AppTypography.large>{user.hoursSpent}</AppTypography.large>
                  <AppTypography.small className='text-muted-foreground'>Hours Spent</AppTypography.small>
                </div>

                <div>
                  <AppTypography.h4 className='mb-2'>Quick Achievements</AppTypography.h4>
                  <div className='flex flex-col gap-2'>
                    {user.achievements.map((achievement, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <div className='bg-primary size-2 rounded-full'></div>
                        <span>{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AppCard.Content>
          </AppCard.Root>

          {/* Skills Assessment from variant8 */}
          <AppCard.Root>
            <AppCard.Header>
              <AppCard.Title className='flex items-center gap-2'>
                <span className='text-primary'>🧠</span> Skills Assessment
              </AppCard.Title>
              <AppCard.Description>Current skill proficiency levels</AppCard.Description>
            </AppCard.Header>
            <AppCard.Content>
              <div className='space-y-4'>
                {skillProficiency.map((skill, index) => (
                  <div key={index}>
                    <div className='mb-1 flex justify-between'>
                      <AppTypography.small>{skill.name}</AppTypography.small>
                      <AppTypography.small>{skill.level}%</AppTypography.small>
                    </div>
                    <AppProgress
                      value={skill.level}
                      className={
                        skill.level > 80
                          ? 'bg-emerald-100 [&>div]:bg-emerald-500'
                          : skill.level > 60
                            ? 'bg-blue-100 [&>div]:bg-blue-500'
                            : 'bg-amber-100 [&>div]:bg-amber-500'
                      }
                    />
                  </div>
                ))}
              </div>

              <div className='mt-6'>
                <AppTypography.h4 className='mb-3'>Skills to Develop</AppTypography.h4>
                <div className='flex flex-wrap gap-2'>
                  {careerPathData.keySkillsNeeded.map((skill, index) => (
                    <AppBadge key={index} variant='outline' className='border-primary/50'>
                      {skill}
                    </AppBadge>
                  ))}
                </div>
              </div>
            </AppCard.Content>
          </AppCard.Root>

          {/* Achievements from variant7 */}
          <AppCard.Root>
            <AppCard.Header>
              <AppCard.Title className='flex items-center gap-2'>
                <span className='text-xl'>🏆</span>
                Achievements
              </AppCard.Title>
              <AppCard.Description>Earn badges by completing learning goals</AppCard.Description>
            </AppCard.Header>
            <AppCard.Content>
              <div className='space-y-4'>
                {achievementData.map((achievement, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-4 rounded-lg p-3',
                      achievement.dateEarned === 'Locked'
                        ? 'bg-muted/30 opacity-60'
                        : 'bg-primary/10 hover:bg-primary/20 transition-colors',
                    )}>
                    <div className='bg-background flex size-12 flex-shrink-0 items-center justify-center rounded-full text-2xl'>
                      {achievement.icon}
                    </div>
                    <div className='flex-grow'>
                      <div className='flex justify-between'>
                        <AppTypography.h4>{achievement.name}</AppTypography.h4>
                        <AppBadge variant='secondary'>{achievement.points} XP</AppBadge>
                      </div>
                      <AppTypography.small>{achievement.description}</AppTypography.small>
                    </div>
                    <div className='text-muted-foreground text-xs'>
                      {achievement.dateEarned === 'Locked' ? (
                        <div className='flex items-center gap-1'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='12'
                            height='12'
                            fill='currentColor'
                            viewBox='0 0 16 16'>
                            <path d='M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z' />
                          </svg>
                          Locked
                        </div>
                      ) : (
                        <div className='flex items-center gap-1'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='12'
                            height='12'
                            fill='currentColor'
                            viewBox='0 0 16 16'>
                            <path d='M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z' />
                          </svg>
                          {achievement.dateEarned}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </AppCard.Content>
          </AppCard.Root>
        </div>

        {/* Main Column - Activity Feed from variant9 */}
        <div className='space-y-6 md:col-span-2'>
          {/* Activity Feed */}
          {activityFeed.map((activity, index) => (
            <AppCard.Root key={index}>
              <AppCard.Content className='p-5'>
                <div className='flex gap-3'>
                  <AppAvatar.Root className='size-10'>
                    <AppAvatar.Image
                      src={`https://ui-avatars.com/api/?name=${user.name}&background=random`}
                      alt={user.name}
                    />
                    <AppAvatar.Fallback>{user.name.charAt(0)}</AppAvatar.Fallback>
                  </AppAvatar.Root>
                  <div className='flex-grow'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                      <div>
                        <AppTypography.p className='font-medium'>{user.name}</AppTypography.p>
                        <AppTypography.small className='text-muted-foreground'>{activity.title}</AppTypography.small>
                      </div>
                      <AppTypography.small className='text-muted-foreground mt-1 sm:mt-0'>
                        {activity.date}
                      </AppTypography.small>
                    </div>

                    <div className='mt-3'>
                      <AppTypography.p className='mb-4'>{activity.content}</AppTypography.p>

                      {activity.type === 'achievement' && (
                        <div className='bg-primary/5 mb-4 flex items-center gap-3 rounded-lg p-4'>
                          <div className='bg-primary/20 text-primary flex size-10 flex-shrink-0 items-center justify-center rounded-full'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='20'
                              height='20'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'>
                              <circle cx='12' cy='8' r='7' />
                              <polyline points='8.21 13.89 7 23 12 20 17 23 15.79 13.88' />
                            </svg>
                          </div>
                          <div>
                            <AppTypography.p className='font-medium'>Problem Solver</AppTypography.p>
                            <AppTypography.small>Solved 50 coding challenges</AppTypography.small>
                          </div>
                        </div>
                      )}

                      {activity.type === 'course-completion' && (
                        <div className='mb-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/20'>
                          <div className='flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='20'
                              height='20'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'>
                              <path d='M22 10v6M2 10l10-5 10 5-10 5z' />
                              <path d='M6 12v5c3 3 9 3 12 0v-5' />
                            </svg>
                          </div>
                          <div>
                            <AppTypography.p className='font-medium'>Advanced React Patterns</AppTypography.p>
                            <AppTypography.small>Course completed with 95% score</AppTypography.small>
                          </div>
                        </div>
                      )}

                      {activity.type === 'milestone' && (
                        <div className='mb-4 flex items-center gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20'>
                          <div className='flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='20'
                              height='20'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'>
                              <rect x='2' y='7' width='20' height='14' rx='2' ry='2' />
                              <path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' />
                            </svg>
                          </div>
                          <div>
                            <AppTypography.p className='font-medium'>JavaScript Learning Path</AppTypography.p>
                            <AppTypography.small>Completed 10 of 15 courses</AppTypography.small>
                          </div>
                        </div>
                      )}

                      <div className='flex items-center justify-between'>
                        <div className='flex gap-6'>
                          <button className='text-muted-foreground hover:text-foreground flex items-center gap-1'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='16'
                              height='16'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'>
                              <path d='M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3' />
                            </svg>
                            <span>{activity.likes}</span>
                          </button>
                          <button className='text-muted-foreground hover:text-foreground flex items-center gap-1'>
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='16'
                              height='16'
                              viewBox='0 0 24 24'
                              fill='none'
                              stroke='currentColor'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'>
                              <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
                            </svg>
                            <span>{activity.comments}</span>
                          </button>
                        </div>
                        <button className='text-muted-foreground hover:text-foreground'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='16'
                            height='16'
                            viewBox='0 0 24 24'
                            fill='none'
                            stroke='currentColor'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'>
                            <circle cx='18' cy='5' r='3' />
                            <circle cx='6' cy='12' r='3' />
                            <circle cx='18' cy='19' r='3' />
                            <line x1='8.59' y1='13.51' x2='15.42' y2='17.49' />
                            <line x1='15.41' y1='6.51' x2='8.59' y2='10.49' />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </AppCard.Content>
            </AppCard.Root>
          ))}
        </div>
      </div>
    </div>
  );
}
