
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  companyId: string;
  companyName: string;
  role: 'user' | 'company_admin';
  isActive: boolean;
  lastLogin?: string;
  loginCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserData {
  name: string;
  email: string;
  companyId: string;
  role: 'user' | 'company_admin';
  password: string;
}
