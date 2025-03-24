import { create } from 'zustand';
import { Question } from '../types/exam';
import toast from 'react-hot-toast';

interface QuestionState {
  questions: Question[];
  questionsToDeploy: Question[];
  addQuestion: (question: Omit<Question, 'id'>) => void;
  updateQuestion: (id: string, question: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  getQuestionsBySubject: (subjectId: string) => Question[];
  setQuestionsToDeploy: (questions: Question[]) => void;
  clearQuestionsToDeploy: () => void;
}

export const useQuestionStore = create<QuestionState>((set, get) => ({
  questions: [],
  questionsToDeploy: [],

  addQuestion: (questionData) => {
    try {
      const newQuestion: Question = {
        id: Date.now().toString(),
        ...questionData,
      };

      set((state) => ({
        questions: [...state.questions, newQuestion],
      }));

      toast.success('Question added successfully');
      return newQuestion;
    } catch (error) {
      toast.error('Failed to add question');
      throw error;
    }
  },

  updateQuestion: (id, questionData) => {
    try {
      set((state) => ({
        questions: state.questions.map((question) =>
          question.id === id ? { ...question, ...questionData } : question
        ),
      }));
      toast.success('Question updated successfully');
    } catch (error) {
      toast.error('Failed to update question');
      throw error;
    }
  },

  deleteQuestion: (id) => {
    try {
      set((state) => ({
        questions: state.questions.filter((question) => question.id !== id),
        questionsToDeploy: state.questionsToDeploy.filter((question) => question.id !== id),
      }));
      toast.success('Question deleted successfully');
    } catch (error) {
      toast.error('Failed to delete question');
      throw error;
    }
  },

  getQuestionsBySubject: (subjectId) => {
    return get().questions.filter((question) => question.subject_id === subjectId);
  },

  setQuestionsToDeploy: (questions) => {
    set({ questionsToDeploy: questions });
  },

  clearQuestionsToDeploy: () => {
    set({ questionsToDeploy: [] });
  },
}));