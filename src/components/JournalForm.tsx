
import { useState } from 'react';

interface JournalFormProps {
  onComplete: (journalData: { title: string; notes: string }) => void;
  onCancel: () => void;
}

export const JournalForm = ({ onComplete, onCancel }: JournalFormProps) => {
  const [responses, setResponses] = useState({
    question1: '',
    question2: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (responses.question1.trim() && responses.question2.trim()) {
      const notes = `What's keeping me awake at night:\n${responses.question1}\n\nWhere I'm flirting with disaster:\n${responses.question2}`;
      const title = `Decision needed: ${responses.question1.split('.')[0].substring(0, 50)}${responses.question1.length > 50 ? '...' : ''}`;
      
      onComplete({ title, notes });
    }
  };

  const isValid = responses.question1.trim() && responses.question2.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-mono text-tactical-accent mb-3">
            What is keeping you awake at night?
          </label>
          <textarea
            value={responses.question1}
            onChange={(e) => setResponses(prev => ({ ...prev, question1: e.target.value }))}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-3 text-tactical-text focus:border-tactical-accent focus:outline-none h-24 resize-none"
            placeholder="What concerns, worries, or unresolved issues are on your mind?"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-mono text-tactical-accent mb-3">
            Where are you flirting with disaster?
          </label>
          <textarea
            value={responses.question2}
            onChange={(e) => setResponses(prev => ({ ...prev, question2: e.target.value }))}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-3 text-tactical-text focus:border-tactical-accent focus:outline-none h-24 resize-none"
            placeholder="What risks are you taking or avoiding that could lead to problems?"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-tactical-border text-tactical-text hover:bg-tactical-surface rounded font-mono text-sm"
        >
          CANCEL
        </button>
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 px-4 py-2 bg-tactical-accent hover:bg-tactical-accent/80 text-tactical-bg font-mono text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          CREATE DECISION
        </button>
      </div>
    </form>
  );
};
