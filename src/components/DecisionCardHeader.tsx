
import { DecisionCategory } from '@/types/Decision';

interface DecisionCardHeaderProps {
  title: string;
  category: DecisionCategory;
}

export const DecisionCardHeader = ({ title, category }: DecisionCardHeaderProps) => {
  return (
    <div className="mb-3">
      {/* Decision Title with Background Box */}
      <div className="bg-tactical-surface/50 rounded-md px-3 py-2 border border-tactical-border/30">
        <h4 className="font-bold text-lg leading-tight w-full text-gray-400">
          {title}
        </h4>
      </div>
    </div>
  );
};
