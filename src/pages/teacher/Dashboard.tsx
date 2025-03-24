import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTeacherStore } from '../../store/teacherStore';
import SubjectList from './components/SubjectList';
import DeployedExams from './components/DeployedExams';
import QuestionGenerator from './QuestionGenerator';
import ResultsView from './ResultsView';
import QuestionSetup from './exam/QuestionSetup';
import SubjectDashboard from './SubjectDashboard';
import BatchManagement from './BatchManagement';
import { useQuestionStore } from '../../store/questionStore';
import toast from 'react-hot-toast';

const TeacherDashboard = () => {
  const { user } = useAuthStore();
  const { getTeacherAssignments } = useTeacherStore();
  const { questionsToDeploy } = useQuestionStore();
  const navigate = useNavigate();

  const assignments = user ? getTeacherAssignments(user.id) : [];

  const handleProceedToSetup = () => {
    if (questionsToDeploy.length === 0) {
      toast.error('No questions selected for deployment');
      return;
    }
    
    const subjectId = questionsToDeploy[0]?.subject_id;
    if (!subjectId) {
      toast.error('Subject ID is missing from selected questions');
      return;
    }
    navigate(`/teacher/subject/${subjectId}/exam-setup`);
  };

  return (
    <Routes>
      <Route
        index
        element={
          <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/teacher/subject/${assignment.id}`)}
                >
                  <h2 className="text-lg font-semibold text-gray-900">{assignment.subjectName}</h2>
                  <p className="text-sm text-gray-500 mt-1">{assignment.subjectCode}</p>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>Class: {assignment.class}</p>
                    <p>Semester: {assignment.semester}</p>
                    <p>Department: {assignment.department}</p>
                  </div>
                  <span className={`mt-4 inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    assignment.isLab ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {assignment.isLab ? 'Lab' : 'Theory'}
                  </span>
                </div>
              ))}
            </div>

            <DeployedExams />

            {questionsToDeploy.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4">Questions Selected for Deployment</h2>
                <ul className="space-y-4">
                  {questionsToDeploy.map((question, index) => (
                    <li key={question.id} className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{index + 1}. {question.text}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {question.options.map((option, idx) => (
                          <p
                            key={idx}
                            className={
                              question.correct_answer === String.fromCharCode(65 + idx)
                                ? 'text-green-600'
                                : ''
                            }
                          >
                            {String.fromCharCode(65 + idx)}. {option}
                          </p>
                        ))}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Difficulty: {question.difficulty}
                      </p>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleProceedToSetup}
                  className="mt-4 w-full flex justify-center items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Proceed to Exam Setup
                </button>
              </div>
            )}
          </div>
        }
      />
      <Route path="questions" element={<QuestionGenerator />} />
      <Route path="results" element={<ResultsView />} />
      <Route path="batches" element={<BatchManagement />} />
      <Route path="subject/:subjectId/*" element={<SubjectDashboard />} />
      <Route path="subject/:subjectId/exam-setup" element={<QuestionSetup />} />
    </Routes>
  );
};

export default TeacherDashboard;