import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuestionStore } from '../../../store/questionStore';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentUploaderProps {
  subjectId: string;
  onQuestionsGenerated?: () => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ subjectId, onQuestionsGenerated }) => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { addQuestion } = useQuestionStore();

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('File size exceeds 2MB limit');
        return;
      }
      setFile(selectedFile);
      await extractTextFromPDF(selectedFile);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        fullText += pageText + '\n';
      }

      setExtractedText(fullText);
      toast.success('Text extracted from PDF successfully');
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast.error('Failed to extract text from PDF');
      setExtractedText('');
    }
  };

  const handleGenerateMCQs = async () => {
    if (!extractedText) {
      toast.error('No text extracted to generate questions');
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
              text: `Generate 5 multiple choice questions based on this text. Format as JSON array with structure:
                [
                  {
                    "text": "question text",
                    "options": ["option1", "option2", "option3", "option4"],
                    "correct_answer": "A",
                    "difficulty": "medium"
                  }
                ]
                
                Text: ${extractedText.substring(0, 1000)}`
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
      if (onQuestionsGenerated) {
        onQuestionsGenerated();
      }
    } catch (error) {
      console.error('Error generating MCQs:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload PDF Document (Max 2MB)
        </label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      {file && (
        <div>
          <p className="text-sm text-gray-500">Uploaded File: {file.name}</p>
          {extractedText && (
            <div className="mt-4">
              <h3 className="text-lg font-bold">Extracted Text</h3>
              <pre className="p-4 bg-gray-100 rounded-lg max-h-60 overflow-auto mt-2">
                {extractedText}
              </pre>
            </div>
          )}
          <button
            onClick={handleGenerateMCQs}
            disabled={loading}
            className="mt-4 w-full flex justify-center items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {loading ? 'Generating Questions...' : 'Generate Questions'}
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;