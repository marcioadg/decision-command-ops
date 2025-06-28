
import { Decision } from '@/types/Decision';

interface ReflectionQuestionsProps {
  questions: string[] | undefined;
  editMode: boolean;
  onUpdate: (questions: string[]) => void;
}

export const ReflectionQuestions = ({ questions, editMode, onUpdate }: ReflectionQuestionsProps) => {
  const handleQuestionsChange = (value: string) => {
    onUpdate(value.split('\n').filter(q => q.trim()));
  };

  return (
    <div>
      <label className="block text-xs font-mono text-tactical-text/80 mb-2 uppercase">Standard Questions</label>
      {editMode ? (
        <textarea
          value={questions?.join('\n') || ''}
          onChange={(e) => handleQuestionsChange(e.target.value)}
          className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-2 text-tactical-text focus:border-tactical-accent focus:outline-none h-24 resize-none"
          placeholder="What went well with this decision?&#10;What could have been improved?&#10;What would I do differently next time?"
        />
      ) : (
        <div className="text-tactical-text/80">
          {questions?.length ? (
            <ul className="list-disc list-inside space-y-1">
              {questions.map((question, index) => (
                <li key={index} className="text-sm">{question}</li>
              ))}
            </ul>
          ) : (
            'No standard questions set'
          )}
        </div>
      )}
    </div>
  );
};
