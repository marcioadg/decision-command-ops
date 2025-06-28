
import { DecisionCategory } from '@/types/Decision';

interface DecisionCardHeaderProps {
  title: string;
  category: DecisionCategory;
}

export const DecisionCardHeader = ({ title, category }: DecisionCardHeaderProps) => {
  return (
    <div className="mb-3">
      {/* Enhanced Decision Title with Background Box */}
      <div className="bg-tactical-surface/80 rounded-md px-4 py-3 border border-tactical-border/50 border-l-4 border-l-tactical-accent shadow-lg shadow-tactical-accent/10 hover:bg-tactical-surface/90 hover:border-tactical-accent/30 hover:shadow-tactical-accent/20 transition-all duration-200 group">
        <h4 className="font-bold text-xl leading-tight w-full text-tactical-accent tracking-wide group-hover:text-tactical-accent/90 transition-colors duration-200">
          {title}
        </h4>
      </div>
    </div>
  );
};
