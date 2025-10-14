import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { supabaseUserService } from '@/services/admin/supabaseUserService';
import { companyService } from '@/services/admin/companyService';
import { AdminUser, CreateAdminUserData } from '@/types/admin/AdminUser';
import { createAdminUser } from '@/services/admin/createAdminUserService';
import { useToast } from '@/hooks/use-toast';
import { UserStats } from './UserStats';
import { UserFilters } from './UserFilters';
import { UserForm } from './UserForm';
import { UserTable } from './UserTable';

export const UserManager = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies] = useState(companyService.getAll());
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedUsers = await supabaseUserService.getAll();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load users from database.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
  };

  const handleSubmit = async (formData: CreateAdminUserData) => {
    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        const updated = await supabaseUserService.update(editingUser.id, updateData);
        if (updated) {
          await loadUsers();
          toast({
            title: "User Updated",
            description: `${updated.name} has been updated successfully.`,
          });
        }
      } else {
        // Create new user using edge function
        const { data, error } = await createAdminUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          companyId: formData.companyId,
          role: formData.role
        });

        if (error) {
          throw error;
        }

        toast({
          title: "User Created",
          description: `${formData.name} has been created successfully.`,
        });
        
        await loadUsers();
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving user:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await supabaseUserService.delete(user.id);
        await loadUsers();
        toast({
          title: "User Deleted",
          description: `${user.name} has been deleted.`,
          variant: "destructive",
        });
      } catch (err) {
        console.error('Error deleting user:', err);
        toast({
          title: "Error",
          description: "Failed to delete user. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const filteredUsers = filterCompany === 'all' 
    ? users 
    : users.filter(u => u.companyId === filterCompany);

  if (loading) {
    return (
      <Card className="tactical-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-tactical-text font-mono">Loading users...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="tactical-card">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-400 font-mono mb-4">{error}</p>
            <Button onClick={loadUsers} className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="tactical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            <UserStats users={users} filteredUsers={filteredUsers} />
          </CardTitle>
          <div className="flex gap-4">
            <UserFilters
              companies={companies}
              filterCompany={filterCompany}
              onFilterChange={setFilterCompany}
              onRefresh={loadUsers}
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg"
                  onClick={resetForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-tactical-surface border-tactical-border">
                <DialogHeader>
                  <DialogTitle className="text-tactical-accent">
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </DialogTitle>
                </DialogHeader>
                <UserForm
                  editingUser={editingUser}
                  companies={companies}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <UserTable
          users={filteredUsers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
};
