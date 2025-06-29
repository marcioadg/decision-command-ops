
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Company } from '@/types/admin/Company';

interface UserFiltersProps {
  companies: Company[];
  filterCompany: string;
  onFilterChange: (value: string) => void;
  onRefresh: () => void;
}

export const UserFilters = ({ 
  companies, 
  filterCompany, 
  onFilterChange, 
  onRefresh 
}: UserFiltersProps) => {
  return (
    <div className="flex gap-4">
      <Select value={filterCompany} onValueChange={onFilterChange}>
        <SelectTrigger className="w-48 bg-tactical-bg border-tactical-border text-tactical-text">
          <SelectValue placeholder="Filter by company" />
        </SelectTrigger>
        <SelectContent className="bg-tactical-surface border-tactical-border">
          <SelectItem value="all" className="text-tactical-text">All Companies</SelectItem>
          {companies.map(company => (
            <SelectItem key={company.id} value={company.id} className="text-tactical-text">
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        className="border-tactical-border text-tactical-text hover:bg-tactical-bg"
      >
        Refresh
      </Button>
    </div>
  );
};
