
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  username: string | null;
  role: 'user' | 'admin' | 'company_admin';
  company_id: string | null;
  created_at: string;
  updated_at: string;
}

interface SecureAuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  signUp: (email: string, password: string, name: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  refreshProfile: () => Promise<void>;
}

const SecureAuthContext = createContext<SecureAuthContextType | undefined>(undefined);

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logAuthEvent = async (action: string, details?: any) => {
    try {
      if (user?.id) {
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            company_id: profile?.company_id,
            action,
            resource_type: 'auth',
            details
          });
      }
    } catch (error) {
      console.error('Error logging auth event:', error);
    }
  };

  const fetchUserProfile = async (userId: string, retries = 3): Promise<void> => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        if (retries > 0) {
          console.log(`Retrying profile fetch, ${retries} attempts remaining`);
          setTimeout(() => fetchUserProfile(userId, retries - 1), 1000);
          return;
        }
        setError('Failed to load user profile');
        return;
      }

      if (data) {
        console.log('User profile loaded:', data);
        const typedProfile: UserProfile = {
          ...data,
          role: data.role as 'user' | 'admin' | 'company_admin'
        };

        setProfile(typedProfile);
        setError(null);
        
        // Log successful profile load
        await logAuthEvent('profile_loaded', { userId });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (retries > 0) {
        setTimeout(() => fetchUserProfile(userId, retries - 1), 1000);
      } else {
        setError('Failed to load user profile');
      }
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    console.log('Setting up secure auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile');
          await fetchUserProfile(session.user.id);
          
          // Log authentication events
          if (event === 'SIGNED_IN') {
            await logAuthEvent('sign_in', { email: session.user.email });
          }
        } else {
          console.log('User signed out, clearing profile');
          setProfile(null);
          setError(null);
          
          if (event === 'SIGNED_OUT') {
            await logAuthEvent('sign_out');
          }
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, username?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          username,
          role: 'user'
        }
      }
    });

    if (!error) {
      await logAuthEvent('sign_up_attempt', { email, name });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting secure sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      console.log('Sign in successful');
      await logAuthEvent('sign_in_attempt', { email });
    } else {
      console.error('Sign in error:', error);
      await logAuthEvent('sign_in_failed', { email, error: error.message });
    }

    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    
    // Log logout before clearing state
    await logAuthEvent('sign_out_attempt');
    
    // Clear any admin data from localStorage for security
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.includes('admin') || key.includes('company') || key.includes('tactical')) {
        localStorage.removeItem(key);
      }
    });
    
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setError(null);
  };

  const isSuperAdmin = () => {
    return profile?.role === 'admin';
  };

  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'company_admin';
  };

  // Enhanced user object for backwards compatibility
  const enhancedUser = user && profile ? {
    ...user,
    name: profile.name,
    username: profile.username,
    role: profile.role,
    company_id: profile.company_id
  } : user;

  return (
    <SecureAuthContext.Provider value={{ 
      user: enhancedUser as any, 
      profile, 
      session, 
      signUp, 
      signIn, 
      signOut, 
      isLoading,
      error,
      isSuperAdmin, 
      isAdmin,
      refreshProfile
    }}>
      {children}
    </SecureAuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};
