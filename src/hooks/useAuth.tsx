
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  role: 'user' | 'admin' | 'company_admin';
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  needsOnboarding: () => boolean;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        console.log('User profile loaded:', data);
        const typedProfile: UserProfile = {
          ...data,
          role: data.role as 'user' | 'admin' | 'company_admin',
          onboarding_completed: data.onboarding_completed || false
        };

        setProfile(typedProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const needsOnboarding = () => {
    return profile && !profile.onboarding_completed;
  };

  const completeOnboarding = async () => {
    if (!user?.id) return;

    try {
      console.log('Marking onboarding as completed for user:', user.id);
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        return;
      }

      // Update local profile state
      if (profile) {
        setProfile({ ...profile, onboarding_completed: true });
      }
      
      console.log('Onboarding marked as completed');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User authenticated, fetching profile');
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          console.log('User signed out, clearing profile');
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    console.log('Starting signup process for:', email);
    
    // Set redirect URL to verify-email page
    const redirectUrl = `${window.location.origin}/verify-email`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role: 'user'
        }
      }
    });

    console.log('Signup completed, error:', error);
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!error) {
      console.log('Sign in successful');
    } else {
      console.error('Sign in error:', error);
    }

    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const isSuperAdmin = () => {
    return profile?.role === 'admin';
  };

  const isAdmin = () => {
    return profile?.role === 'admin' || profile?.role === 'company_admin';
  };

  // Backwards compatibility - map profile data to user object for existing components
  const enhancedUser = user && profile ? {
    ...user,
    name: profile.name,
    role: profile.role
  } : user;

  return (
    <AuthContext.Provider value={{ 
      user: enhancedUser as any, 
      profile, 
      session, 
      signUp, 
      signIn, 
      signOut, 
      isLoading, 
      isSuperAdmin, 
      isAdmin,
      needsOnboarding,
      completeOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
