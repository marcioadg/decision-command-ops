
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { userService } from '@/services/admin/userService';
import { companyService } from '@/services/admin/companyService';
import { AdminUser, CreateAdminUserData } from '@/types/admin/AdminUser';
import { useToast } from '@/hooks/use-toast';

export const UserManager = () => {
  const [users, setUsers] = useState<AdminUser[]>(userService.getAll());
  const [companies] = useState(companyService.getAll());
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState<CreateAdminUserData>({
    name: '',
    username: '',
    email: '',
    companyId: '',
    role: 'user',
    password: '',
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const { password, ...updateData } = formData;
      const updated = userService.update(editingUser.id, updateData);
      if (updated) {
        setUsers(userService.getAll());
        toast({
          title: "User Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      }
    } else {
      userService.create(formData);
      setUsers(userService.getAll());
      toast({
        title: "User Created",
        description: `${formData.name} has been created successfully.`,
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
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

  const handleDelete = (user: AdminUser) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      userService.delete(user.id);
      setUsers(userService.getAll());
      toast({
        title: "User Deleted",
        description: `${user.name} has been deleted.`,
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = (user: AdminUser) => {
    userService.toggleActive(user.id);
    setUsers(userService.getAll());
    toast({
      title: `User ${user.isActive ? 'Deactivated' : 'Activated'}`,
      description: `${user.name} has been ${user.isActive ? 'deactivated' : 'activated'}.`,
    });
  };

  const filteredUsers = filterCompany === 'all' 
    ? users 
    : users.filter(u => u.companyId === filterCompany);

  return (
    <Card className="tactical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tactical-accent">
            <Users className="h-5 w-5" />
            User Management
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
                        required
                      />
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
              <TableHead className="text-tactical-accent">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-tactical-text font-medium">{user.name}</TableCell>
                <TableCell className="text-tactical-text/80">{user.username}</TableCell>
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
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(user)}
                      className="border-tactical-border text-tactical-text hover:bg-tactical-bg"
                    >
                      {user.isActive ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
                    </Button>
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
            No users found. Create your first user to get started.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
