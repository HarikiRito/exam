import { useEffect, useState } from 'react';
import { AppTypography } from 'app/shared/components/ui/typography/AppTypography';
import { CourseVideoPlayer } from './components/CourseVideoPlayer';
import { CourseVideoList } from './components/CourseVideoList';
import { CourseVideo } from './types';

interface CourseData {
  courseId: number;
  courseTitle: string;
  currentVideo: CourseVideo;
  videos: CourseVideo[];
}

export default function CourseContent() {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const courseId = 1; // Replace with dynamic courseId as needed

  useEffect(() => {
    // Mock course data - in a real app, fetch this from an API or database
    const videos: CourseVideo[] = [
      {
        id: 1,
        title: 'Introduction to the Course',
        description: 'An overview of what you will learn in this course',
        duration: '5:30',
        thumbnail: 'https://placehold.co/600x400/4338ca/white?text=Intro',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        progress: 100,
      },
      {
        id: 2,
        title: 'Core Concepts',
        description: 'Understanding the fundamental concepts',
        duration: '12:45',
        thumbnail: 'https://placehold.co/600x400/0ea5e9/white?text=Core',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        progress: 75,
      },
      {
        id: 3,
        title: 'Practical Applications',
        description: 'How to apply what you learned in real-world scenarios',
        duration: '8:15',
        thumbnail: 'https://placehold.co/600x400/16a34a/white?text=Practice',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        progress: 0,
      },
      {
        id: 4,
        title: 'Advanced Techniques',
        description: 'Take your skills to the next level with advanced approaches',
        duration: '15:20',
        thumbnail: 'https://placehold.co/600x400/dc2626/white?text=Advanced',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        progress: 0,
      },
      {
        id: 5,
        title: 'Final Project',
        description: 'Build a complete project using everything you learned',
        duration: '20:10',
        thumbnail: 'https://placehold.co/600x400/9333ea/white?text=Project',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        progress: 0,
      },
    ];

    // For demo purposes, hardcode a course title based on the courseId
    const courseTitles: Record<number, string> = {
      1: 'Introduction to JavaScript',
      2: 'React Fundamentals',
      3: 'Advanced CSS Techniques',
      4: 'Data Structures and Algorithms',
      5: 'System Design for Interviews',
      6: "The LeetCode Beginner's Guide",
      7: 'Top Interview Questions',
      8: 'TypeScript Masterclass',
      9: 'Full Stack Web Development',
      10: 'DevOps Fundamentals',
      11: 'HTML5 for Beginners',
      12: 'UI/UX Fundamentals',
      13: 'Behavioral Interview Prep',
      14: 'Dynamic Programming',
      15: 'Cloud Computing with AWS',
      16: 'Mobile App Development',
    };

    const currentVideo = videos[0];

    if (!currentVideo) {
      return;
    }

    setCourseData({
      courseId,
      courseTitle: courseTitles[courseId] || 'Course Content',
      currentVideo,
      videos,
    });
  }, [courseId]);

  if (!courseData) {
    return <div>Loading...</div>; // Handle loading state
  }

  const { courseTitle, currentVideo, videos } = courseData;

  return (
    <div className='px-4 py-8'>
      <AppTypography.h1 className='mb-6'>{courseTitle}</AppTypography.h1>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Main content area with video player */}
        <div className='lg:col-span-2'>
          <CourseVideoPlayer video={currentVideo} />
        </div>

        {/* Sidebar with video list */}
        <div className='lg:col-span-1'>
          <CourseVideoList videos={videos} currentVideoId={currentVideo.id} />
        </div>
      </div>
    </div>
  );
}
