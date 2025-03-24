import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../../../store/teacherStore';
import { useQuestionStore } from '../../../store/questionStore';
import { useAuthStore } from '../../../store/authStore';
import { Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const QuestionSetup = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const { getTeacherAssignments } = useTeacherStore();
  const { questions, getQuestionsBySubject } = useQuestionStore();

  const assignment = subjectId ? 
    getTeacherAssignments(user!.id).find(a => a.id === subjectId) : 
    null;

  // Get questions for this subject
  const subjectQuestions = subjectId ? getQuestionsBySubject(subjectId) : [];

  const filteredQuestions = subjectQuestions.filter(q =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedQuestions.find(sq => sq.id === q.id)
  );

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

  const handleDeployExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    const examData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      duration_minutes: parseInt(formData.get('duration') as string),
      pass_percentage: parseInt(formData.get('passPercentage') as string),
      start_time: formData.get('startTime') as string,
      end_time: formData.get('endTime') as string,
      subject_id: subjectId!,
      teacher_id: user!.id,
      questions: selectedQuestions,
      total_marks: totalMarks,
      class: assignment!.class,
      semester: parseInt(assignment!.semester.toString()),
      is_active: true,
    };

    try {
      // Here you would call your deploy exam function
      // await deployExam(examData);
      toast.success('Exam deployed successfully');
      navigate('/teacher');
    } catch (error) {
      toast.error('Failed to deploy exam');
    }
  };

  if (!assignment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-medium">Subject Not Found</h2>
          <p className="text-red-600 mt-1">The selected subject could not be found. Please return to the dashboard and try again.</p>
          <button
            onClick={() => navigate('/teacher')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
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
            <form onSubmit={handleDeployExam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Exam Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    required
                    defaultValue={60}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pass Percentage</label>
                  <input
                    type="number"
                    name="passPercentage"
                    required
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
                    name="startTime"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  disabled={selectedQuestions.length === 0}
                >
                  Deploy Exam
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Available Questions</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow transition-shadow"
                >
                  <p className="font-medium">{question.text}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {question.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className={`text-sm p-2 rounded ${
                          index === question.correct_answer
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm text-gray-500 capitalize">
                      Difficulty: {question.difficulty}
                    </span>
                    <button
                      onClick={() => handleSelectQuestion(question)}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                    >
                      Select Question
                    </button>
                  </div>
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No questions available. Try adding some questions first!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSetup;