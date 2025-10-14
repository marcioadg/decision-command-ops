import { supabase } from '@/integrations/supabase/client';

export interface CreateAdminUserRequest {
  email: string;
  password: string;
  name: string;
  companyId: string;
  role: 'user' | 'company_admin';
}

export const createAdminUser = async (userData: CreateAdminUserRequest) => {
  try {
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      body: userData
    });

    if (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error calling create-admin-user function:', error);
    return { data: null, error };
  }
};

// Quick helper to create Rodrivm De Paula
export const createRodrivmDePaula = async () => {
  return createAdminUser({
    email: 'rodri.depaula@gmail.com',
    password: 'DecisionCommand@123',
    name: 'Rodrivm De Paula',
    companyId: '18393310-43a2-4d62-a3b1-b95db135764b',
    role: 'company_admin'
  });
};