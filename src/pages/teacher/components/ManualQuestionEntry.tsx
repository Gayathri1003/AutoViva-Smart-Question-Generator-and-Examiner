import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuestionStore } from '../../../store/questionStore';

interface ManualQuestionEntryProps {
  subjectId: string;
  onQuestionAdded?: () => void;
}

const ManualQuestionEntry: React.FC<ManualQuestionEntryProps> = ({ subjectId, onQuestionAdded }) => {
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const { addQuestion } = useQuestionStore();

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleAddQuestion = () => {
    if (!text.trim()) {
      toast.error('Please enter the question text');
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      toast.error('Please fill in all options');
      return;
    }

    try {
      addQuestion({
        text,
        options,
        correct_answer: correctAnswer,
        difficulty,
        subject_id: subjectId,
      });

      // Reset form
      setText('');
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
      setDifficulty('medium');

      if (onQuestionAdded) onQuestionAdded();
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          placeholder="Enter the question..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
        {options.map((option, index) => (
          <div key={index} className="mb-2">
            <div className="flex items-center">
              <input
                type="radio"
                checked={correctAnswer === index}
                onChange={() => setCorrectAnswer(index)}
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              />
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <button
        onClick={handleAddQuestion}
        className="w-full flex justify-center items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
      >
        Add Question
      </button>
    </div>
  );
};

export default ManualQuestionEntry;