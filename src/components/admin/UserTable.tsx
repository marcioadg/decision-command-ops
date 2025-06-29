
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { AdminUser } from '@/types/admin/AdminUser';

interface UserTableProps {
  users: AdminUser[];
  onEdit: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

export const UserTable = ({ users, onEdit, onDelete }: UserTableProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-tactical-text/60">
        No users found. Users will appear here when they register.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-tactical-accent">Name</TableHead>
          <TableHead className="text-tactical-accent">Email</TableHead>
          <TableHead className="text-tactical-accent">Company</TableHead>
          <TableHead className="text-tactical-accent">Role</TableHead>
          <TableHead className="text-tactical-accent">Status</TableHead>
          <TableHead className="text-tactical-accent">Created</TableHead>
          <TableHead className="text-tactical-accent">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="text-tactical-text font-medium">{user.name}</TableCell>
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
                  onClick={() => onEdit(user)}
                  className="border-tactical-border text-tactical-text hover:bg-tactical-bg"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(user)}
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
  );
};
