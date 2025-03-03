// UserProfile interface for profile page variants
export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role: string;
  level: number;
  levelProgress: number;
  bio: string;
  skills: string[];
  achievements: string[];
  coursesCompleted: number;
  totalCourses: number;
  hoursSpent: number;
  joinedDate: string;
}

// Mock user data to be shared across variants
export const userData: UserProfile = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://avatars.githubusercontent.com/u/12345678',
  role: 'Software Developer',
  level: 4,
  levelProgress: 75,
  bio: 'Passionate software developer with a focus on web technologies. Always eager to learn and share knowledge with the community.',
  skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'CSS'],
  achievements: ['Fast Learner', 'Team Player', 'Top Contributor', 'Problem Solver', 'Mentor'],
  coursesCompleted: 12,
  totalCourses: 20,
  hoursSpent: 156,
  joinedDate: 'Jan 2023',
};
