
import { DecisionCategory } from '@/types/Decision';

interface DecisionCardHeaderProps {
  title: string;
  category: DecisionCategory;
}

export const DecisionCardHeader = ({ title, category }: DecisionCardHeaderProps) => {
  const getCategoryBadgeColor = () => {
    switch (category) {
      case 'People': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Capital': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Strategy': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Product': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Timing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Personal': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    }
  };

  return (
    <div className="mb-3">
      {/* Decision Title - Full Width, Emphasized */}
      <h4 className="font-semibold text-sm text-tactical-text leading-tight mb-2 w-full">
        {title}
      </h4>
      
      {/* Category Badge - Below Title */}
      <div className="flex justify-start">
        <span className={`px-2 py-1 text-xs font-mono rounded border ${getCategoryBadgeColor()}`}>
          {category}
        </span>
      </div>
    </div>
  );
};
