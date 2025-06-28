
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminStats } from '@/components/admin/AdminStats';
import { CompanyManager } from '@/components/admin/CompanyManager';
import { UserManager } from '@/components/admin/UserManager';
import { Shield, LogOut, Database } from 'lucide-react';

const Admin = () => {
  const { user, profile, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
  };

  // Check if user has admin access
  if (!profile || (profile.role !== 'admin' && profile.role !== 'company_admin')) {
    return (
      <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 font-mono mb-4">ACCESS DENIED</h1>
          <p className="text-tactical-text font-mono">Insufficient privileges for admin console</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
      {/* Admin Header */}
      <div className="border-b border-red-800/30 bg-tactical-surface/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold font-mono text-red-500 tracking-wider">
                  ADMIN CONSOLE
                </h1>
                <p className="text-sm text-tactical-text/60 font-mono">
                  ADMINISTRATIVE ACCESS • {profile.name.toUpperCase()} • {profile.role.toUpperCase()}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-800 text-red-400 hover:bg-red-900/20 font-mono"
            >
              <LogOut className="h-4 w-4 mr-2" />
              LOGOUT
            </Button>
          </div>
        </div>
      </div>

      {/* Admin Content */}
      <div className="container mx-auto px-6 py-8">
        <AdminStats />
        
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="bg-tactical-surface border border-tactical-border">
            <TabsTrigger 
              value="companies" 
              className="data-[state=active]:bg-red-900/30 data-[state=active]:text-red-400 text-tactical-text font-mono"
            >
              <Database className="h-4 w-4 mr-2" />
              COMPANIES
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-red-900/30 data-[state=active]:text-red-400 text-tactical-text font-mono"
            >
              <Shield className="h-4 w-4 mr-2" />
              USERS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            <CompanyManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
