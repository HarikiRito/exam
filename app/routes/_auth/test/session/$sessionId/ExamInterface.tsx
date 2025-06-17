import { AppButton } from 'app/shared/components/button/AppButton';
import { createProxyWithReset } from 'app/shared/utils/valtio';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect } from 'react';
import { proxySet } from 'valtio/utils';
import { FinishExamDialog } from './components/FinishExamDialog';
import { QuestionOverviewSheet } from './components/QuestionOverviewSheet';
import { QuestionSection } from './components/QuestionSection';
import { TopNavBar } from './components/TopNavBar';
import { testSessionStore } from 'app/routes/_auth/test/session/$sessionId/state';

// Helper function to format time
function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Mock Exam Questions
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    questionText: 'Which of the following is the correct way to declare a variable in JavaScript?',
    options: [
      '```javascript\nvar x = 10;\n```',
      '```javascript\nlet x = 10;\n```',
      '```javascript\nconst x = 10;\n```',
      'All of the above',
    ],
    correctAnswerIndex: 3,
  },
  {
    id: 'q2',
    questionText: 'What is the output of the following code?\n```javascript\nconsole.log(typeof null);\n```',
    options: ['"object"', '"null"', '"undefined"', '"string"'],
    correctAnswerIndex: 0,
  },
  {
    id: 'q3',
    questionText:
      'How do you import a component named `MyComponent` from `./MyComponent.tsx` in React?\n```typescript\n// Your code here\n```',
    options: [
      '`import MyComponent from "./MyComponent";`',
      '`import { MyComponent } from "./MyComponent";`',
      '`require("./MyComponent");`',
      '`const MyComponent = require("./MyComponent");`',
    ],
    correctAnswerIndex: 1,
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

const state = testSessionStore.proxyState;

export default function ExamInterface() {
  testSessionStore.useResetHook();
  const snapshot = testSessionStore.useStateSnapshot();

  const totalQuestions = MOCK_QUESTIONS.length;
  const answeredQuestionsCount = Object.keys(snapshot.selectedAnswers).length;
  const progressPercentage = (answeredQuestionsCount / totalQuestions) * 100;

  // Start exam on component mount
  useEffect(() => {
    state.handleStartExam();
  }, []);

  const currentQuestion = MOCK_QUESTIONS[snapshot.currentQuestionIndex];
  const isFirstQuestion = snapshot.currentQuestionIndex === 0;
  const isLastQuestion = snapshot.currentQuestionIndex === totalQuestions - 1;

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div className='flex h-screen flex-col bg-white'>
      {/* Top Navigation Bar */}
      <TopNavBar
        timeLeft={formatTime(snapshot.timeLeft)}
        progressPercentage={progressPercentage}
        totalQuestions={totalQuestions}
      />

      {/* Main Content Area */}
      <main className='flex flex-1 flex-col items-center justify-start bg-gray-50 px-4 py-6 md:px-6 lg:px-8'>
        <div className='max-w-[400px]'>
          <QuestionOverviewSheet questions={MOCK_QUESTIONS} />
        </div>
        <QuestionSection
          question={currentQuestion}
          selectedAnswerIndexes={snapshot.selectedAnswers[currentQuestion.id] || []}
          isFlagged={snapshot.flaggedQuestions.has(currentQuestion.id)}
        />
      </main>

      {/* Bottom Navigation Buttons */}
      <footer className='flex h-[80px] items-center justify-between border-t bg-white px-4 md:px-6 lg:px-8'>
        <AppButton
          variant='outline'
          onClick={state.handlePrevious}
          disabled={isFirstQuestion}
          aria-label='Previous question'>
          <ChevronLeft className='mr-2 h-5 w-5' />
          Previous
        </AppButton>

        <AppButton onClick={state.handleNext} aria-label={isLastQuestion ? 'Finish exam' : 'Next question'}>
          {isLastQuestion ? 'Finish Exam' : 'Next'}
          <ChevronRight className='ml-2 h-5 w-5' />
        </AppButton>
      </footer>

      {/* Finish Exam Confirmation Dialog */}
      <FinishExamDialog
        isOpen={snapshot.isFinishExamDialogOpen}
        onClose={state.handleFinishExam}
        onConfirm={state.handleFinishExamConfirmed}
      />
    </div>
  );
}
