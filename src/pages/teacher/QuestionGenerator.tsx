import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../../store/teacherStore';
import { useQuestionStore } from '../../store/questionStore';
import { FileText, Plus, BookOpen } from 'lucide-react';

const QuestionGenerator = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [method, setMethod] = useState<'document' | 'manual' | 'topic'>('document');
  const { getTeacherAssignments } = useTeacherStore();
  const { addQuestion } = useQuestionStore();

  const assignment = subjectId ? 
    getTeacherAssignments(subjectId).find(a => a.id === subjectId) : 
    null;

  if (!assignment) {
    return (
      <div className="p-8">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Subject Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a subject to generate questions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Questions</h1>
          <p className="text-sm text-gray-500">Subject: {assignment.subjectName}</p>
        </div>
        <button
          onClick={() => navigate('/teacher')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Go to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Document */}
        <div 
          onClick={() => setMethod('document')}
          className={`cursor-pointer p-6 rounded-lg border-2 transition-colors ${
            method === 'document' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <FileText className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
            <p className="mt-2 text-sm text-gray-500">
              Generate questions from a document
            </p>
          </div>
        </div>

        {/* Manual Entry */}
        <div 
          onClick={() => setMethod('manual')}
          className={`cursor-pointer p-6 rounded-lg border-2 transition-colors ${
            method === 'manual' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <Plus className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Manual Entry</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create questions manually
            </p>
          </div>
        </div>

        {/* Topic Based */}
        <div 
          onClick={() => setMethod('topic')}
          className={`cursor-pointer p-6 rounded-lg border-2 transition-colors ${
            method === 'topic' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-200'
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <BookOpen className="h-8 w-8 text-indigo-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Topic Based</h3>
            <p className="mt-2 text-sm text-gray-500">
              Generate questions from a topic
            </p>
          </div>
        </div>
      </div>

      {/* Question Form */}
      <div className="mt-8">
        {method === 'manual' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Add New Question</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Question Text</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Enter your question here..."
                />
              </div>

              {[1, 2, 3, 4].map((num) => (
                <div key={num}>
                  <label className="block text-sm font-medium text-gray-700">Option {num}</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder={`Enter option ${num}`}
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option>Option 1</option>
                    <option>Option 2</option>
                    <option>Option 3</option>
                    <option>Option 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Marks</label>
                <input
                  type="number"
                  min="1"
                  className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  defaultValue="1"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Add Question
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGenerator;