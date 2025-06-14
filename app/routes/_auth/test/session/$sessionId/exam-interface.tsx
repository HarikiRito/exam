import { useState, useEffect, useCallback } from 'react';
import { AppSheet } from 'app/shared/components/sheet/AppSheet';
import { AppButton } from 'app/shared/components/button/AppButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TopNavBar } from './components/top-nav-bar';
import { QuestionSection } from './components/question-section';
import { QuestionOverviewSheet } from './components/question-overview-sheet';
import { FinishExamDialog } from './components/finish-exam-dialog';

// Helper function to format time
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Mock Exam Questions
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    questionText: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctAnswerIndex: 2,
  },
  {
    id: 'q2',
    questionText: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    correctAnswerIndex: 1,
  },
  {
    id: 'q3',
    questionText: 'What is the largest ocean on Earth?',
    options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
    correctAnswerIndex: 3,
  },
  {
    id: 'q4',
    questionText: 'Who painted the Mona Lisa?',
    options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
    correctAnswerIndex: 2,
  },
  {
    id: 'q5',
    questionText: 'What is the chemical symbol for water?',
    options: ['O2', 'H2O', 'CO2', 'NaCl'],
    correctAnswerIndex: 1,
  },
  {
    id: 'q6',
    questionText: 'How many continents are there?',
    options: ['5', '6', '7', '8'],
    correctAnswerIndex: 2,
  },
  {
    id: 'q7',
    questionText: 'What is the highest mountain in the world?',
    options: ['K2', 'Mount Everest', 'Kangchenjunga', 'Lhotse'],
    correctAnswerIndex: 1,
  },
  {
    id: 'q8',
    questionText: 'Which country is famous for the Great Wall?',
    options: ['India', 'Japan', 'China', 'South Korea'],
    correctAnswerIndex: 2,
  },
  {
    id: 'q9',
    questionText: 'What is the currency of Japan?',
    options: ['Yuan', 'Won', 'Yen', 'Dollar'],
    correctAnswerIndex: 2,
  },
  {
    id: 'q10',
    questionText: 'What is the smallest prime number?',
    options: ['0', '1', '2', '3'],
    correctAnswerIndex: 2,
  },
];

export default function ExamInterface() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30 * 60 * 1000); // 30 minutes in milliseconds
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [examStarted, setExamStarted] = useState(false); // To start timer only when exam begins
  const [isFinishExamDialogOpen, setIsFinishExamDialogOpen] = useState(false);

  const totalQuestions = MOCK_QUESTIONS.length;
  const answeredQuestionsCount = Object.keys(selectedAnswers).length;
  const progressPercentage = (answeredQuestionsCount / totalQuestions) * 100;

  const handleSelectAnswer = useCallback((questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const handleToggleFlag = useCallback((questionId: string) => {
    setFlaggedQuestions((prev) => {
      const newFlags = new Set(prev);
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      return newFlags;
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // If on last question, trigger finish exam dialog
      setIsFinishExamDialogOpen(true);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const handleFinishExamConfirmed = useCallback(() => {
    console.info('Exam Finished! Submitting answers:', selectedAnswers);
    console.info('Flagged questions:', Array.from(flaggedQuestions));
    alert('Exam Finished! Check console for results.');
    setIsFinishExamDialogOpen(false);
    // Here you would typically navigate away or show results
  }, [selectedAnswers, flaggedQuestions]);

  const handleJumpToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
    setIsOverviewOpen(false);
  }, []);

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1000);
      }, 1000);
    } else if (timeLeft === 0) {
      console.info("Time's up! Submitting exam.");
      // You might want to trigger a submission function here
      handleFinishExamConfirmed();
    }
    return () => clearInterval(timer);
  }, [examStarted, timeLeft, handleFinishExamConfirmed]);

  // Start exam on component mount
  useEffect(() => {
    setExamStarted(true);
  }, []);

  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex h-screen flex-col bg-white'>
      {/* Top Navigation Bar */}
      <TopNavBar
        timeLeft={formatTime(timeLeft)}
        progressPercentage={progressPercentage}
        currentQuestionNumber={currentQuestionIndex + 1}
        totalQuestions={totalQuestions}
        onToggleOverview={() => setIsOverviewOpen(true)}
        onFinishExam={() => setIsFinishExamDialogOpen(true)}
      />

      {/* Main Content Area */}
      <main className='flex flex-1 flex-col items-center justify-center bg-[#F8FAFC] p-4 md:p-6 lg:p-8'>
        <QuestionSection
          question={currentQuestion}
          selectedAnswerIndex={selectedAnswers[currentQuestion.id]}
          onSelectAnswer={handleSelectAnswer}
          isFlagged={flaggedQuestions.has(currentQuestion.id)}
          onToggleFlag={handleToggleFlag}
        />
      </main>

      {/* Bottom Navigation Buttons */}
      <footer className='flex h-[80px] items-center justify-between border-t bg-white px-4 md:px-6 lg:px-8'>
        <AppButton variant='outline' onClick={handlePrevious} disabled={isFirstQuestion} aria-label='Previous question'>
          <ChevronLeft className='mr-2 h-5 w-5' />
          Previous
        </AppButton>

        <AppButton onClick={handleNext} aria-label={isLastQuestion ? 'Finish exam' : 'Next question'}>
          {isLastQuestion ? 'Finish Exam' : 'Next'}
          <ChevronRight className='ml-2 h-5 w-5' />
        </AppButton>
      </footer>

      {/* Question Overview Popup */}
      <AppSheet.Root open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
        <AppSheet.Content side='left' className='w-[320px] p-0 sm:w-[320px]'>
          <QuestionOverviewSheet
            questions={MOCK_QUESTIONS}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswers={selectedAnswers}
            flaggedQuestions={flaggedQuestions}
            onJumpToQuestion={handleJumpToQuestion}
          />
        </AppSheet.Content>
      </AppSheet.Root>

      {/* Finish Exam Confirmation Dialog */}
      <FinishExamDialog
        isOpen={isFinishExamDialogOpen}
        onClose={() => setIsFinishExamDialogOpen(false)}
        onConfirm={handleFinishExamConfirmed}
      />
    </div>
  );
}
