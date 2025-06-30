
import { Users, LogIn, Clock, Activity } from 'lucide-react';
import { AdminUser } from '@/types/admin/AdminUser';

interface UserStatsProps {
  users: AdminUser[];
  filteredUsers: AdminUser[];
}

export const UserStats = ({ users, filteredUsers }: UserStatsProps) => {
  const activeUsers = users.filter(u => u.isActive).length;
  const adminUsers = users.filter(u => u.role === 'company_admin').length;
  const totalLogins = users.reduce((sum, user) => sum + (user.loginCount || 0), 0);
  const recentlyActive = users.filter(user => {
    if (!user.lastLogin) return false;
    const lastLogin = new Date(user.lastLogin);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastLogin > weekAgo;
  }).length;

  return (
    <div className="flex items-center gap-6 text-tactical-accent mb-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5" />
        <span>User Management ({filteredUsers.length} of {users.length} users)</span>
      </div>
      <div className="flex items-center gap-4 text-tactical-text/60 text-sm font-mono">
        <div className="flex items-center gap-1">
          <Activity className="h-4 w-4 text-green-400" />
          <span>{activeUsers} Active</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-blue-400" />
          <span>{adminUsers} Admins</span>
        </div>
        <div className="flex items-center gap-1">
          <LogIn className="h-4 w-4 text-yellow-400" />
          <span>{totalLogins} Total Logins</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-purple-400" />
          <span>{recentlyActive} Active This Week</span>
        </div>
      </div>
    </div>
  );
};
