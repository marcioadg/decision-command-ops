
import { supabase } from '@/integrations/supabase/client';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  username?: string;
  role: 'user' | 'admin' | 'company_admin';
}

export const createUser = async (userData: CreateUserData) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          username: userData.username,
          role: userData.role
        }
      }
    });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getUserProfiles = async () => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin' | 'company_admin') => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
