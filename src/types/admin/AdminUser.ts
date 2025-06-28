
export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  companyId: string;
  companyName: string;
  role: 'user' | 'company_admin';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserData {
  name: string;
  username: string;
  email: string;
  companyId: string;
  role: 'user' | 'company_admin';
  password: string;
}
