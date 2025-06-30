
import { Calendar } from 'lucide-react';

interface ReflectionPromptProps {
  shouldShow: boolean;
}

export const ReflectionPrompt = ({ shouldShow }: ReflectionPromptProps) => {
  if (!shouldShow) {
    return null;
  }

  return (
    <div className="bg-tactical-accent/10 border border-tactical-accent/30 rounded p-4 mb-4">
      <div className="flex items-center space-x-2 mb-2">
        <Calendar className="w-4 h-4 text-tactical-accent" />
        <span className="text-sm font-mono text-tactical-accent">REFLECTION RECOMMENDED</span>
      </div>
      <p className="text-xs text-tactical-text/80">
        This decision has been executed. Set up a 30-day reflection to review its outcomes and assess its accuracy.
      </p>
    </div>
  );
};
