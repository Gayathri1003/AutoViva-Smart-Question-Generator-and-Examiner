import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeacherStore } from '../../store/teacherStore';
import { useAuthStore } from '../../store/authStore';
import { FileText, Plus, BookOpen } from 'lucide-react';
import TopicGenerator from './components/TopicGenerator';
import DocumentUploader from './components/DocumentUploader';
import ManualQuestionEntry from './components/ManualQuestionEntry';
import SubjectSelector from './components/SubjectSelector';

const QuestionGenerator = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams(); // Get subjectId from URL params
  const { user } = useAuthStore();
  const [method, setMethod] = useState<'document' | 'manual' | 'topic'>('document');
  const [selectedSubject, setSelectedSubject] = useState(subjectId || '');
  const { getTeacherAssignments } = useTeacherStore();

  const assignments = user ? getTeacherAssignments(user.id) : [];

  // Update selectedSubject when subjectId param changes
  useEffect(() => {
    if (subjectId) {
      setSelectedSubject(subjectId);
    }
  }, [subjectId]);

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleQuestionsGenerated = () => {
    // Optionally handle post-generation actions
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Questions</h1>
          <p className="text-sm text-gray-500">
            {selectedSubject 
              ? `Subject: ${assignments.find(a => a.id === selectedSubject)?.subjectName}`
              : 'Select a subject to begin'}
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          Go to Dashboard
        </button>
      </div>

      {!subjectId && ( // Only show subject selector if subjectId is not in URL
        <div className="mb-6">
          <SubjectSelector
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
          />
        </div>
      )}

      {selectedSubject && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <div className="mt-8">
            {method === 'document' && (
              <DocumentUploader
                subjectId={selectedSubject}
                onQuestionsGenerated={handleQuestionsGenerated}
              />
            )}
            {method === 'manual' && (
              <ManualQuestionEntry
                subjectId={selectedSubject}
                onQuestionAdded={handleQuestionsGenerated}
              />
            )}
            {method === 'topic' && (
              <TopicGenerator
                subjectId={selectedSubject}
                onQuestionsGenerated={handleQuestionsGenerated}
              />
            )}
          </div>
        </>
      )}

      {!selectedSubject && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Subject Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Please select a subject to generate questions
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionGenerator