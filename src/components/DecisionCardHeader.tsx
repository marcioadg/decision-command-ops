
import { DecisionCategory } from '@/types/Decision';

interface DecisionCardHeaderProps {
  title: string;
  category: DecisionCategory;
}

export const DecisionCardHeader = ({ title, category }: DecisionCardHeaderProps) => {
  return (
    <div className="mb-3">
      {/* Decision Title - Now always gray */}
      <h4 className="font-bold text-lg leading-tight w-full text-gray-400">
        {title}
      </h4>
    </div>
  );
};
