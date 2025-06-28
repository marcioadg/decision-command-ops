
import { AdminUser, CreateAdminUserData } from '@/types/admin/AdminUser';
import { companyService } from './companyService';

const STORAGE_KEY = 'admin_users';

const getStoredUsers = (): AdminUser[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveUsers = (users: AdminUser[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  // Update company user counts
  const companies = companyService.getAll();
  companies.forEach(company => {
    const userCount = users.filter(u => u.companyId === company.id && u.isActive).length;
    companyService.updateUserCount(company.id, userCount);
  });
};

const generateId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const userService = {
  getAll: (): AdminUser[] => {
    return getStoredUsers();
  },

  getByCompany: (companyId: string): AdminUser[] => {
    return getStoredUsers().filter(u => u.companyId === companyId);
  },

  getById: (id: string): AdminUser | null => {
    const users = getStoredUsers();
    return users.find(u => u.id === id) || null;
  },

  create: (data: CreateAdminUserData): AdminUser => {
    const users = getStoredUsers();
    const company = companyService.getById(data.companyId);
    
    const newUser: AdminUser = {
      id: generateId(),
      name: data.name,
      username: data.username,
      email: data.email,
      companyId: data.companyId,
      companyName: company?.name || 'Unknown Company',
      role: data.role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    saveUsers(users);
    return newUser;
  },

  update: (id: string, data: Partial<Omit<CreateAdminUserData, 'password'>>): AdminUser | null => {
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;

    if (data.companyId && data.companyId !== users[index].companyId) {
      const company = companyService.getById(data.companyId);
      users[index].companyName = company?.name || 'Unknown Company';
    }

    users[index] = {
      ...users[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    saveUsers(users);
    return users[index];
  },

  delete: (id: string): boolean => {
    const users = getStoredUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    if (filteredUsers.length === users.length) return false;
    
    saveUsers(filteredUsers);
    return true;
  },

  toggleActive: (id: string): AdminUser | null => {
    const users = getStoredUsers();
    const user = users.find(u => u.id === id);
    if (!user) return null;

    user.isActive = !user.isActive;
    user.updatedAt = new Date().toISOString();
    saveUsers(users);
    return user;
  }
};
