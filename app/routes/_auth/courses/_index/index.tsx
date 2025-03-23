import { HorizontalCourseCategory } from 'app/shared/components/custom/HorizontalCourseCategory';
import { HorizontalCourseCardProps } from 'app/shared/components/custom/card/HorizontalCourseCard';
import { Link } from '@remix-run/react';

// Mock course data
const COURSES: Record<string, HorizontalCourseCardProps[]> = {
  recommended: [
    {
      id: 1,
      title: 'Introduction to JavaScript',
      image: 'https://placehold.co/600x400/4338ca/white?text=JavaScript',
      description: 'Learn the fundamentals of JavaScript programming language',
      chapters: 8,
      items: 42,
      progress: 0,
    },
    {
      id: 2,
      title: 'React Fundamentals',
      image: 'https://placehold.co/600x400/0ea5e9/white?text=React',
      description: 'Build interactive UIs with the popular React library',
      chapters: 10,
      items: 56,
      progress: 0,
    },
    {
      id: 3,
      title: 'Advanced CSS Techniques',
      image: 'https://placehold.co/600x400/16a34a/white?text=CSS',
      description: 'Master advanced CSS concepts including Flexbox and Grid',
      chapters: 6,
      items: 35,
      progress: 0,
    },
    // Adding more items to demonstrate horizontal scrolling
    {
      id: 11,
      title: 'HTML5 for Beginners',
      image: 'https://placehold.co/600x400/dc2626/white?text=HTML5',
      description: 'Learn the latest HTML standards and best practices',
      chapters: 5,
      items: 28,
      progress: 0,
    },
    {
      id: 12,
      title: 'UI/UX Fundamentals',
      image: 'https://placehold.co/600x400/9333ea/white?text=UI/UX',
      description: 'Create beautiful user interfaces with good user experience',
      chapters: 7,
      items: 32,
      progress: 0,
    },
  ],
  featured: [
    {
      id: 4,
      title: 'Data Structures and Algorithms',
      image: 'https://placehold.co/600x400/6d28d9/white?text=DSA',
      description: 'Master essential computer science concepts for interviews',
      chapters: 13,
      items: 149,
      progress: 0,
    },
    {
      id: 5,
      title: 'System Design for Interviews',
      image: 'https://placehold.co/600x400/047857/white?text=System+Design',
      description: 'Learn how to design scalable systems for technical interviews',
      chapters: 16,
      items: 81,
      progress: 0,
    },
    {
      id: 6,
      title: "The LeetCode Beginner's Guide",
      image: 'https://placehold.co/600x400/f97316/white?text=LeetCode',
      description: 'A step-by-step approach to solving coding problems',
      chapters: 4,
      items: 17,
      progress: 0,
    },
    {
      id: 7,
      title: 'Top Interview Questions',
      image: 'https://placehold.co/600x400/0f172a/white?text=Interview',
      description: 'Comprehensive collection of most frequently asked questions',
      chapters: 9,
      items: 48,
      progress: 0,
    },
    // Adding more items to demonstrate horizontal scrolling
    {
      id: 13,
      title: 'Behavioral Interview Prep',
      image: 'https://placehold.co/600x400/475569/white?text=Behavioral',
      description: 'Prepare for behavioral questions in tech interviews',
      chapters: 6,
      items: 24,
      progress: 0,
    },
    {
      id: 14,
      title: 'Dynamic Programming',
      image: 'https://placehold.co/600x400/84cc16/white?text=DP',
      description: 'Master the art of solving complex algorithmic problems',
      chapters: 12,
      items: 78,
      progress: 0,
    },
  ],
  learn: [
    {
      id: 8,
      title: 'TypeScript Masterclass',
      image: 'https://placehold.co/600x400/3178c6/white?text=TypeScript',
      description: 'Learn how to build type-safe applications with TypeScript',
      chapters: 8,
      items: 52,
      progress: 0,
    },
    {
      id: 9,
      title: 'Full Stack Web Development',
      image: 'https://placehold.co/600x400/ef4444/white?text=Full+Stack',
      description: 'Comprehensive guide to building modern web applications',
      chapters: 20,
      items: 106,
      progress: 0,
    },
    {
      id: 10,
      title: 'DevOps Fundamentals',
      image: 'https://placehold.co/600x400/facc15/white?text=DevOps',
      description: 'Learn essential DevOps practices and tools',
      chapters: 12,
      items: 68,
      progress: 0,
    },
    // Adding more items to demonstrate horizontal scrolling
    {
      id: 15,
      title: 'Cloud Computing with AWS',
      image: 'https://placehold.co/600x400/fb923c/white?text=AWS',
      description: 'Master AWS services and cloud architecture',
      chapters: 14,
      items: 92,
      progress: 0,
    },
    {
      id: 16,
      title: 'Mobile App Development',
      image: 'https://placehold.co/600x400/4ade80/white?text=Mobile',
      description: 'Build cross-platform mobile applications',
      chapters: 10,
      items: 56,
      progress: 0,
    },
  ],
};

export default function CourseRoute() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='mb-8 text-3xl font-bold'>Courses</h1>

      {/* Course categories with horizontal scrolling */}
      <HorizontalCourseCategory
        title='Recommended'
        courses={COURSES.recommended.map((course) => ({
          ...course,
          renderItem: (courseItem) => (
            <Link to={`/courses/${courseItem.id}`} className='transition-colors hover:bg-gray-100'>
              {/* Existing horizontal course card content */}
            </Link>
          ),
        }))}
      />
      <HorizontalCourseCategory
        title='Featured'
        courses={COURSES.featured.map((course) => ({
          ...course,
          renderItem: (courseItem) => (
            <Link to={`/courses/${courseItem.id}`} className='transition-colors hover:bg-gray-100'>
              {/* Existing horizontal course card content */}
            </Link>
          ),
        }))}
      />
      <HorizontalCourseCategory
        title='Learn'
        courses={COURSES.learn.map((course) => ({
          ...course,
          renderItem: (courseItem) => (
            <Link to={`/courses/${courseItem.id}`} className='transition-colors hover:bg-gray-100'>
              {/* Existing horizontal course card content */}
            </Link>
          ),
        }))}
      />
    </div>
  );
}
