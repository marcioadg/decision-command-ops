
import { DecisionCategory } from '@/types/Decision';

interface DecisionCardHeaderProps {
  title: string;
  category: DecisionCategory;
}

export const DecisionCardHeader = ({ title, category }: DecisionCardHeaderProps) => {
  return (
    <div className="mb-3">
      {/* Decision Title - Emphasized and Larger */}
      <h4 className="font-bold text-lg text-tactical-text leading-tight w-full">
        {title}
      </h4>
    </div>
  );
};
