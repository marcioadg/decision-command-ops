
import { useState } from 'react';

interface JournalFormProps {
  onComplete: (journalData: { title: string; notes: string }) => void;
  onCancel: () => void;
}

export const JournalForm = ({ onComplete, onCancel }: JournalFormProps) => {
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (response.trim()) {
      const notes = response;
      const title = `${response.split('.')[0].substring(0, 50)}${response.length > 50 ? '...' : ''}`;
      
      onComplete({ title, notes });
    }
  };

  const isValid = response.trim();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-mono text-tactical-accent mb-3">
            What is keeping you awake at night OR where are you flirting with disaster?
          </label>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            className="w-full bg-tactical-bg border border-tactical-border rounded px-3 py-3 text-tactical-text focus:border-tactical-accent focus:outline-none h-32 resize-none"
            placeholder="What concerns, worries, or risks are on your mind that need a decision?"
            autoFocus
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
