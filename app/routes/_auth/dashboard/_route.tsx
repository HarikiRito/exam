import { CourseCard } from 'app/shared/components/custom/card/CourseCard';
import { LearningSummaryCard, LearningSummaryCardProps } from 'app/shared/components/custom/card/LearningSummaryCard';
import { UserProfileCard, UserProfileCardProps } from 'app/shared/components/custom/card/UserProfileCard';

export default function AuthDashboard() {
  // Dummy user data
  const userData: UserProfileCardProps = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    level: 'Intermediate',
    score: 1250,
    rank: 'Gold',
    progress: 68,
    avatar: 'https://i.pravatar.cc/150?img=12',
  };

  // Dummy learning summary data
  const learningSummaryData: LearningSummaryCardProps = {
    coursesProgress: {
      label: 'Courses Completed',
      current: 2,
      total: 8,
      value: 25,
    },
    assignmentsProgress: {
      label: 'Assignments Submitted',
      current: 12,
      total: 15,
      value: 80,
    },
    quizzesProgress: {
      label: 'Quizzes Passed',
      current: 18,
      total: 20,
      value: 90,
    },
    weeklyStudyGoal: {
      current: 7.5,
      total: 10,
    },
  };

  // Dummy course data
  const courses = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Learn the core concepts of JavaScript programming',
      progress: 85,
      category: 'Programming',
      level: 'Beginner',
      duration: '4 weeks',
    },
    {
      id: 2,
      title: 'React for Beginners',
      description: 'Build modern user interfaces with React',
      progress: 42,
      category: 'Web Development',
      level: 'Intermediate',
      duration: '6 weeks',
    },
    {
      id: 3,
      title: 'Advanced TypeScript',
      description: 'Master TypeScript for large-scale applications',
      progress: 12,
      category: 'Programming',
      level: 'Advanced',
      duration: '8 weeks',
    },
    {
      id: 4,
      title: 'CSS Grid & Flexbox',
      description: 'Modern layout techniques for responsive design',
      progress: 65,
      category: 'Web Design',
      level: 'Intermediate',
      duration: '3 weeks',
    },
    {
      id: 5,
      title: 'Node.js API Development',
      description: 'Build robust backend services with Node.js',
      progress: 0,
      category: 'Backend',
      level: 'Intermediate',
      duration: '5 weeks',
    },
    {
      id: 6,
      title: 'Data Structures & Algorithms',
      description: 'Essential computer science concepts for developers',
      progress: 0,
      category: 'Computer Science',
      level: 'Advanced',
      duration: '10 weeks',
    },
  ];

  function handleContinueCourse(courseId: number) {
    console.log(`Continue course with ID: ${courseId}`);
    // Navigation or other logic would go here
  }

  return (
    <div className='mx-auto max-w-7xl p-6'>
      <h1 className='mb-6 text-2xl font-bold'>Learning Dashboard</h1>

      {/* Top row: User info and overall progress */}
      <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* User Profile Card */}
        <UserProfileCard {...userData} />

        {/* Learning Summary Card */}
        <LearningSummaryCard {...learningSummaryData} />
      </div>

      {/* Courses Grid */}
      <h2 className='mb-4 text-xl font-semibold'>Your Courses</h2>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            description={course.description}
            progress={course.progress}
            category={course.category}
            level={course.level as 'Beginner' | 'Intermediate' | 'Advanced'}
            duration={course.duration}
            onContinue={handleContinueCourse}
          />
        ))}
      </div>
    </div>
  );
}
