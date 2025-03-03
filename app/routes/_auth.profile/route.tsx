import { AppTypography } from 'app/shared/components/typography/AppTypography';
import { UserProfile } from './types';
import { ProfileVariant20 } from './variant20';

// Mock user data that includes totalCourses for backwards compatibility
const userData: UserProfile & { totalCourses: number } = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://avatars.githubusercontent.com/u/12345678',
  role: 'Software Developer',
  level: 4,
  levelProgress: 75,
  bio: 'Passionate software developer with a focus on web technologies. Always eager to learn and share knowledge with the community. I am a software developer with a passion for building web applications. I am a software developer with a passion for building web applications. I am a software developer with a passion for building web applications. My name is Alex Johnson and I am a software developer with a passion for building web applications. Currently, I am working on a project to build a web application to help people learn new skills. I am a software developer with a passion for building web applications. I am a software developer with a passion for building web applications. I am a software developer with a passion for building web applications. My name is Alex Johnson and I am a software developer with a passion for building web applications. Currently, I am working on a project to build a web application to help people learn new skills.  ',
  skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'CSS'],
  achievements: ['Fast Learner', 'Team Player', 'Top Contributor', 'Problem Solver', 'Mentor'],
  coursesCompleted: 12,
  hoursSpent: 156,
  joinedDate: 'Jan 2023',
  totalCourses: 20, // Added for backwards compatibility
};

export default function ProfilePage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-8'>
        <AppTypography.h2>Profile Dashboard</AppTypography.h2>
      </div>

      <ProfileVariant20 user={userData} />
    </div>
  );
}
