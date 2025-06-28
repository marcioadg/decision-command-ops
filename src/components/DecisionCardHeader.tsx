
import { DecisionCategory } from '@/types/Decision';

interface DecisionCardHeaderProps {
  title: string;
  category: DecisionCategory;
}

export const DecisionCardHeader = ({ title, category }: DecisionCardHeaderProps) => {
  const getTitleColor = () => {
    switch (category) {
      case 'People': return 'text-blue-400';
      case 'Capital': return 'text-green-400';
      case 'Strategy': return 'text-purple-400';
      case 'Product': return 'text-gray-400';
      case 'Timing': return 'text-yellow-400';
      case 'Personal': return 'text-pink-400';
      default: return 'text-tactical-text';
    }
  };

  return (
    <div className="mb-3">
      {/* Decision Title - Emphasized and Larger with Category Color */}
      <h4 className={`font-bold text-lg leading-tight w-full ${getTitleColor()}`}>
        {title}
      </h4>
    </div>
  );
};
