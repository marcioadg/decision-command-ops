
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminUser, CreateAdminUserData } from '@/types/admin/AdminUser';
import { Company } from '@/types/admin/Company';

interface UserFormProps {
  editingUser: AdminUser | null;
  companies: Company[];
  onSubmit: (data: CreateAdminUserData) => Promise<void>;
  onCancel: () => void;
}

export const UserForm = ({ editingUser, companies, onSubmit, onCancel }: UserFormProps) => {
  const [formData, setFormData] = useState<CreateAdminUserData>({
    name: editingUser?.name || '',
    email: editingUser?.email || '',
    companyId: editingUser?.companyId || '',
    role: editingUser?.role || 'user',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="bg-tactical-bg border-tactical-border text-tactical-text"
          required
        />
      </div>
      <div>
        <Input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="bg-tactical-bg border-tactical-border text-tactical-text"
          required
          disabled={editingUser ? true : false}
        />
      </div>
      <div>
        <Select value={formData.companyId} onValueChange={(value) => setFormData({...formData, companyId: value})}>
          <SelectTrigger className="bg-tactical-bg border-tactical-border text-tactical-text">
            <SelectValue placeholder="Select Company" />
          </SelectTrigger>
          <SelectContent className="bg-tactical-surface border-tactical-border">
            {companies.map(company => (
              <SelectItem key={company.id} value={company.id} className="text-tactical-text">
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select value={formData.role} onValueChange={(value: 'user' | 'company_admin') => setFormData({...formData, role: value})}>
          <SelectTrigger className="bg-tactical-bg border-tactical-border text-tactical-text">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-tactical-surface border-tactical-border">
            <SelectItem value="user" className="text-tactical-text">User</SelectItem>
            <SelectItem value="company_admin" className="text-tactical-text">Company Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {!editingUser && (
        <div>
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="bg-tactical-bg border-tactical-border text-tactical-text"
            disabled
          />
          <p className="text-xs text-tactical-text/60 mt-1">
            User creation through admin panel coming soon. Users must register normally.
          </p>
        </div>
      )}
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="border-tactical-border text-tactical-text hover:bg-tactical-bg"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg"
          disabled={!editingUser}
        >
          {editingUser ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};
