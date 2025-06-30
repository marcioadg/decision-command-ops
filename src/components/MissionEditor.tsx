
import { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save, X } from 'lucide-react';

interface MissionEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const MissionEditor = ({
  value,
  onChange,
  onSave,
  onCancel,
  isSaving
}: MissionEditorProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const remainingChars = 500 - value.length;

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      onSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What is your current most important mission? (Press Ctrl+Enter to save, Esc to cancel)"
          className="min-h-[60px] resize-none font-mono text-sm bg-gray-900/50 border-yellow-500/30 text-gray-100 placeholder:text-gray-500 focus:border-yellow-500/50 focus:ring-yellow-500/20"
          maxLength={500}
          autoFocus
        />
        <div className={`absolute bottom-2 right-2 text-xs transition-opacity ${
          isFocused || remainingChars <= 50 ? 'opacity-100' : 'opacity-50'
        } ${remainingChars <= 0 ? 'text-red-400' : remainingChars <= 50 ? 'text-yellow-400' : 'text-gray-400'}`}>
          {remainingChars}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving || remainingChars < 0}
          className="bg-green-600 hover:bg-green-700 text-white border-green-500/30"
        >
          <Save className="w-3 h-3 mr-1" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
        {!isSaving && (
          <span className="text-xs text-gray-500 ml-2">
            Ctrl+Enter to save • Esc to cancel
          </span>
        )}
      </div>
    </div>
  );
};
