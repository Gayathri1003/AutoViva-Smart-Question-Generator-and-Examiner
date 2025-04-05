import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { useExamStore } from '../../../store/examStore';
import ExamTimer from './ExamTimer';
import ExamQuestion from './ExamQuestion';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import toast from 'react-hot-toast';
import { Exam, Question, QuestionStatus } from '../../../types/exam';

interface ExamSessionProps {
  exam: Exam;
  onClose: () => void;
}

const ExamSession: React.FC<ExamSessionProps> = ({ exam, onClose }) => {
  const { user } = useAuthStore();
  const { submitExam } = useExamStore();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [questionStatus, setQuestionStatus] = useState<QuestionStatus>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const MAX_TAB_SWITCHES = 2; // Allow 1 warning before submission

  const [randomizedQuestions] = useState(() => {
    return [...exam.questions].sort(() => Math.random() - 0.5);
  });

  useEffect(() => {
    // Initialize answers and status
    const initialAnswers: Record<string, number | null> = {};
    const initialStatus: QuestionStatus = {};
    randomizedQuestions.forEach(q => {
      initialAnswers[q.id] = null;
      initialStatus[q.id] = 'unanswered';
    });
    setAnswers(initialAnswers);
    setQuestionStatus(initialStatus);

    // Enter fullscreen mode
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }

    // Auto-submit on time end
    const endTime = new Date(exam.end_time).getTime();
    const timeUntilEnd = endTime - Date.now();
    if (timeUntilEnd > 0) {
      const timeout = setTimeout(() => handleSubmit(true), timeUntilEnd);
      return () => clearTimeout(timeout);
    }

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount === MAX_TAB_SWITCHES) {
            toast.error('Warning: One more tab switch will submit your exam!');
          } else if (newCount > MAX_TAB_SWITCHES) {
            handleSubmit(true);
            toast.error('Exam submitted due to multiple tab switches!');
          }
          return newCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen();
      }
    };
  }, []);

  const currentQuestion = randomizedQuestions[currentQuestionIndex];

  const handleAnswer = (answer: number) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
    setQuestionStatus(prev => ({ ...prev, [currentQuestion.id]: 'answered' }));
  };

  const handleFlagQuestion = () => {
    setQuestionStatus(prev => ({
      ...prev,
      [currentQuestion.id]: prev[currentQuestion.id] === 'flagged' ? 'unanswered' : 'flagged'
    }));
  };

  const handleSubmit = async (isAutoSubmit: boolean = false) => {
    if (isSubmitting) return;

    const unansweredCount = Object.values(answers).filter(a => a === null).length;
    
    if (!isAutoSubmit && unansweredCount > 0) {
      const confirm = window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
      if (!confirm) return;
    }

    try {
      setIsSubmitting(true);
      const answersArray = Object.entries(answers)
        .filter(([_, answer]) => answer !== null)
        .map(([questionId, selectedOption]) => ({
          questionId,
          selectedOption: selectedOption as number,
          isCorrect: exam.questions.find((q) => q.id === questionId)?.correct_answer === selectedOption
        }));

      const correctAnswers = answersArray.filter(a => a.isCorrect).length;
      const percentage = (correctAnswers / exam.questions.length) * 100;

      await submitExam({
        examId: exam.id,
        studentId: user!.id,
        studentName: user!.name,
        answers: answersArray,
        totalQuestions: exam.questions.length,
        correctAnswers,
        wrongAnswers: exam.questions.length - correctAnswers,
        score: correctAnswers,
        percentage,
        status: percentage >= exam.pass_percentage ? 'pass' : 'fail',
        submittedAt: new Date().toISOString(),
      });

      toast.success(isAutoSubmit ? 'Exam time ended. Your answers have been submitted.' : 'Exam submitted successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to submit exam');
      setIsSubmitting(false);
    }
  };

  // Rest of the JSX remains the same
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... existing JSX ... */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ExamQuestion
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id]}
                onAnswer={handleAnswer}
              />
              {/* ... existing navigation buttons ... */}
            </div>
          </div>
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* ... existing question navigator ... */}
              <div className="mt-6 space-y-4">
                <p className="text-sm text-red-600">
                  Tab switches: {tabSwitchCount}/{MAX_TAB_SWITCHES}
                </p>
                {/* ... existing buttons ... */}
              </div>
              {/* ... existing legend ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSession;