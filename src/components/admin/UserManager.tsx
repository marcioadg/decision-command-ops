
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabaseUserService } from '@/services/admin/supabaseUserService';
import { companyService } from '@/services/admin/companyService';
import { AdminUser, CreateAdminUserData } from '@/types/admin/AdminUser';
import { useToast } from '@/hooks/use-toast';

export const UserManager = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [companies] = useState(companyService.getAll());
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateAdminUserData>({
    name: '',
    username: '',
    email: '',
    companyId: '',
    role: 'user',
    password: '',
  });

  // Load users from Supabase on component mount
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
    setFormData({
      name: '',
      username: '',
      email: '',
      companyId: '',
      role: 'user',
      password: '',
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        const updated = await supabaseUserService.update(editingUser.id, updateData);
        if (updated) {
          await loadUsers(); // Reload users from database
          toast({
            title: "User Updated",
            description: `${formData.name} has been updated successfully.`,
          });
        }
      } else {
        // Note: User creation via admin panel would require additional Supabase Auth setup
        // For now, we'll show a message that users need to sign up through the normal flow
        toast({
          title: "User Creation",
          description: "Users must sign up through the normal registration process. Admin user creation coming soon.",
          variant: "destructive",
        });
        return;
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error saving user:', err);
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      companyId: user.companyId,
      role: user.role,
      password: '', // Don't populate password for security
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await supabaseUserService.delete(user.id);
        await loadUsers(); // Reload users from database
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
          <CardTitle className="flex items-center gap-2 text-tactical-accent">
            <Users className="h-5 w-5" />
            User Management ({users.length} users)
          </CardTitle>
          <div className="flex gap-4">
            <Select value={filterCompany} onValueChange={setFilterCompany}>
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
            <Button onClick={loadUsers} variant="outline" className="border-tactical-border text-tactical-text hover:bg-tactical-bg">
              Refresh
            </Button>
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
                      placeholder="Username"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
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
                      disabled={editingUser ? true : false} // Can't change email for existing users
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
                      onClick={() => setIsDialogOpen(false)}
                      className="border-tactical-border text-tactical-text hover:bg-tactical-bg"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg"
                      disabled={!editingUser} // Only allow updates for now
                    >
                      {editingUser ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-tactical-accent">Name</TableHead>
              <TableHead className="text-tactical-accent">Username</TableHead>
              <TableHead className="text-tactical-accent">Email</TableHead>
              <TableHead className="text-tactical-accent">Company</TableHead>
              <TableHead className="text-tactical-accent">Role</TableHead>
              <TableHead className="text-tactical-accent">Status</TableHead>
              <TableHead className="text-tactical-accent">Created</TableHead>
              <TableHead className="text-tactical-accent">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-tactical-text font-medium">{user.name}</TableCell>
                <TableCell className="text-tactical-text/80">{user.username || 'N/A'}</TableCell>
                <TableCell className="text-tactical-text/80">{user.email}</TableCell>
                <TableCell className="text-tactical-text/80">{user.companyName}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    user.role === 'company_admin' ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-900/30 text-gray-400'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    user.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                  }`}>
                    {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </TableCell>
                <TableCell className="text-tactical-text/60 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(user)}
                      className="border-tactical-border text-tactical-text hover:bg-tactical-bg"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(user)}
                      className="border-red-800 text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-tactical-text/60">
            No users found. {filterCompany !== 'all' ? 'Try changing the company filter.' : 'Users will appear here when they register.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
