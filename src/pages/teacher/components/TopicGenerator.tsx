import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuestionStore } from '../../../store/questionStore';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

interface TopicGeneratorProps {
  subjectId: string;
  onQuestionsGenerated?: () => void;
}

const TopicGenerator: React.FC<TopicGeneratorProps> = ({ subjectId, onQuestionsGenerated }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const { addQuestion } = useQuestionStore();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a valid topic');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate ${count} multiple choice questions about ${topic}. Format as JSON array with structure:
                [
                  {
                    "text": "question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correct_answer": "A",
                    "difficulty": "medium"
                  }
                ]`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format from API');
      }

      const questions = JSON.parse(data.candidates[0].content.parts[0].text);

      // Add questions to store
      for (const q of questions) {
        await addQuestion({
          text: q.text,
          options: q.options,
          correct_answer: q.correct_answer,
          difficulty: q.difficulty,
          subject_id: subjectId,
        });
      }

      toast.success('Questions generated successfully!');
      setTopic('');
      if (onQuestionsGenerated) {
        onQuestionsGenerated();
      }
    } catch (error) {
      console.error('Topic generation error:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Enter Topic</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={4}
          placeholder="Enter the topic for generating questions..."
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
        <input
          type="number"
          min="1"
          max="20"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
          className="w-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex justify-center items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
      >
        {loading ? (
          <>
            <AiOutlineLoading3Quarters className="animate-spin mr-2" />
            Generating Questions...
          </>
        ) : (
          'Generate Questions'
        )}
      </button>
    </div>
  );
};

export default TopicGenerator;