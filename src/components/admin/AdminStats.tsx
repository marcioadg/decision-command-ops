
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { companyService } from '@/services/admin/companyService';
import { userService } from '@/services/admin/userService';
import { Building2, Users, UserCheck, Activity } from 'lucide-react';

export const AdminStats = () => {
  const companies = companyService.getAll();
  const users = userService.getAll();
  const activeUsers = users.filter(u => u.isActive);
  const activeCompanies = companies.filter(c => c.isActive);

  const stats = [
    {
      title: 'Total Companies',
      value: companies.length,
      icon: Building2,
      color: 'text-tactical-accent'
    },
    {
      title: 'Active Companies',
      value: activeCompanies.length,
      icon: Building2,
      color: 'text-green-400'
    },
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Active Users',
      value: activeUsers.length,
      icon: UserCheck,
      color: 'text-green-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="tactical-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-tactical-text/80">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold font-mono ${stat.color}`}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
