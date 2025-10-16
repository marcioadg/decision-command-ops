import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string;
  role: 'user' | 'admin' | 'company_admin';
  onboarding_completed: boolean;
  mission?: string | null;
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

// Password strength validation - relaxed for easier testing
const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string, retries = 3) => {
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
      if (retries > 0) {
        setTimeout(() => fetchUserProfile(userId, retries - 1), 1000);
      }
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
          
          // Track login event for analytics
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              try {
                await supabase
                  .from('audit_logs')
                  .insert({
                    user_id: session.user.id,
                    action: 'user_login',
                    resource_type: 'auth',
                    details: { 
                      email: session.user.email,
                      timestamp: new Date().toISOString()
                    }
                  });
              } catch (error) {
                console.error('Error logging login event:', error);
              }
            }, 100);
          }
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
    
    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      return { error: { message: passwordError } };
    }
    
    // Enable email verification in production
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
    
    // Basic rate limiting check (client-side only, server-side would be better)
    const lastAttempt = localStorage.getItem('lastSignInAttempt');
    const attemptCount = parseInt(localStorage.getItem('signInAttempts') || '0');
    const now = Date.now();
    
    if (lastAttempt && attemptCount >= 5 && now - parseInt(lastAttempt) < 300000) { // 5 minutes
      return { error: { message: 'Too many sign-in attempts. Please try again in 5 minutes.' } };
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      // Track failed attempts
      localStorage.setItem('signInAttempts', (attemptCount + 1).toString());
      localStorage.setItem('lastSignInAttempt', now.toString());
    } else {
      console.log('Sign in successful');
      // Clear failed attempts on success
      localStorage.removeItem('signInAttempts');
      localStorage.removeItem('lastSignInAttempt');
    }

    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    
    // Clear all potentially sensitive data from localStorage
    const sensitiveKeys = Object.keys(localStorage).filter(key => 
      key.includes('decision') || 
      key.includes('user') || 
      key.includes('auth') ||
      key.includes('tactical') ||
      key.includes('admin') ||
      key.includes('company')
    );
    
    sensitiveKeys.forEach(key => {
      console.log('Clearing localStorage key:', key);
      localStorage.removeItem(key);
    });
    
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
