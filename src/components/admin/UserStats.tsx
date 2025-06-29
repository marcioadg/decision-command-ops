
import { Users } from 'lucide-react';
import { AdminUser } from '@/types/admin/AdminUser';

interface UserStatsProps {
  users: AdminUser[];
  filteredUsers: AdminUser[];
}

export const UserStats = ({ users, filteredUsers }: UserStatsProps) => {
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'company_admin').length;

  return (
    <div className="flex items-center gap-2 text-tactical-accent">
      <Users className="h-5 w-5" />
      User Management ({filteredUsers.length} of {users.length} users)
      <span className="text-tactical-text/60 text-sm font-mono">
        • {activeUsers} Active • {adminUsers} Admins
      </span>
    </div>
  );
};
