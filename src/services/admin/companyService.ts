
import { Company, CreateCompanyData } from '@/types/admin/Company';

const STORAGE_KEY = 'admin_companies';

const getStoredCompanies = (): Company[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveCompanies = (companies: Company[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
};

const generateId = () => `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const companyService = {
  getAll: (): Company[] => {
    return getStoredCompanies();
  },

  getById: (id: string): Company | null => {
    const companies = getStoredCompanies();
    return companies.find(c => c.id === id) || null;
  },

  create: (data: CreateCompanyData): Company => {
    const companies = getStoredCompanies();
    const newCompany: Company = {
      id: generateId(),
      ...data,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userCount: 0,
    };
    companies.push(newCompany);
    saveCompanies(companies);
    return newCompany;
  },

  update: (id: string, data: Partial<CreateCompanyData>): Company | null => {
    const companies = getStoredCompanies();
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return null;

    companies[index] = {
      ...companies[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    saveCompanies(companies);
    return companies[index];
  },

  delete: (id: string): boolean => {
    const companies = getStoredCompanies();
    const filteredCompanies = companies.filter(c => c.id !== id);
    if (filteredCompanies.length === companies.length) return false;
    
    saveCompanies(filteredCompanies);
    return true;
  },

  updateUserCount: (companyId: string, count: number) => {
    const companies = getStoredCompanies();
    const company = companies.find(c => c.id === companyId);
    if (company) {
      company.userCount = count;
      company.updatedAt = new Date().toISOString();
      saveCompanies(companies);
    }
  }
};
