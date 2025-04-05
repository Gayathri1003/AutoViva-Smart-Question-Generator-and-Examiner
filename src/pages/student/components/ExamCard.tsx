import React from 'react';
import { Play, Clock, CheckCircle } from 'lucide-react';
import { formatDateTime, isExamActive } from '../../../lib/utils/dateTime';

interface ExamCardProps {
  exam: {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    total_marks: number;
    pass_percentage: number;
  };
  onStart?: () => void;
  status: 'active' | 'attended';
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onStart, status }) => {
  const active = isExamActive(exam.start_time, exam.end_time);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{exam.title}</h3>
          <p className="mt-1 text-sm text-gray-500">{exam.description}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          status === 'attended' 
            ? 'bg-green-100 text-green-800'
            : active 
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-800'
        }`}>
          {status === 'attended' ? 'Completed' : active ? 'Active' : 'Upcoming'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        {/* ... existing exam details ... */}
      </div>

      {status === 'active' && active && onStart && (
        <>
          <p className="mt-4 text-xs text-red-600">
            Note: Exam will enter fullscreen mode and tab switching is monitored.
          </p>
          <button
            onClick={onStart}
            className="mt-2 w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Exam
          </button>
        </>
      )}
    </div>
  );
};

export default ExamCard;