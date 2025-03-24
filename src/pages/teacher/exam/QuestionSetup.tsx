import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../../../store/teacherStore';
import { useQuestionStore } from '../../../store/questionStore';
import { Search, X } from 'lucide-react';

const QuestionSetup = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const { getTeacherAssignments } = useTeacherStore();
  const { questions } = useQuestionStore();

  const assignment = subjectId ? 
    getTeacherAssignments(subjectId).find(a => a.id === subjectId) : 
    null;

  const totalMarks = selectedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

  const handleSelectQuestion = (question: any) => {
    setSelectedQuestions([...selectedQuestions, { ...question, marks: 1 }]);
  };

  const handleRemoveQuestion = (index: number) => {
    setSelectedQuestions(selectedQuestions.filter((_, i) => i !== index));
  };

  const handleUpdateMarks = (index: number, marks: number) => {
    const updatedQuestions = [...selectedQuestions];
    updatedQuestions[index].marks = marks;
    setSelectedQuestions(updatedQuestions);
  };

  if (!assignment) {
    return <div>Subject not found</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Setup Exam Questions</h1>
          <p className="text-sm text-gray-500">
            {assignment.subjectName} - Class {assignment.class} - Semester {assignment.semester}
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Selected Questions */}
        <div>
          <h2 className="text-lg font-medium mb-4">Selected Questions</h2>
          {selectedQuestions.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
              No questions selected yet
            </div>
          ) : (
            <div className="space-y-4">
              {selectedQuestions.map((question, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">{index + 1}.</span>
                    <div className="flex-1 mx-4">
                      <p className="font-medium">{question.text}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {question.options.map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`text-sm p-2 rounded ${
                              optIndex === question.correct_answer
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center">
                    <label className="text-sm text-gray-600 mr-2">Marks:</label>
                    <input
                      type="number"
                      min="1"
                      value={question.marks}
                      onChange={(e) => handleUpdateMarks(index, parseInt(e.target.value))}
                      className="w-20 text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Questions */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Deploy Exam</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Title</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    defaultValue={60}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pass Percentage</label>
                  <input
                    type="number"
                    defaultValue={40}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select Batches</label>
                <div className="mt-2 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No batches have been created for this subject yet. Please create batches in the Batch Management section before deploying an exam.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={selectedQuestions.length === 0}
                >
                  Deploy Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSetup;