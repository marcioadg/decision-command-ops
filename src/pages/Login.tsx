import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [signInForm, setSignInForm] = useState({
    email: '',
    password: ''
  });
  
  const [signUpForm, setSignUpForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, profile, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(signInForm.email, signInForm.password);
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "ACCESS GRANTED",
          description: "Welcome to the Tactical Decision Pipeline",
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signUpForm.password.length < 6) {
      toast({
        title: "Password Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Attempting signup with email:', signUpForm.email);
      
      const { error } = await signUp(
        signUpForm.email, 
        signUpForm.password, 
        signUpForm.name
      );
      
      if (error) {
        console.error('Signup error:', error);
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Signup successful, will redirect to onboarding via ProtectedRoute');
        toast({
          title: "Account Created",
          description: "Welcome aboard! Starting your tactical onboarding...",
        });
        
        // TODO: EMAIL VERIFICATION - Uncomment when ready to enable email verification
        // navigate(`/verify-email?email=${encodeURIComponent(signUpForm.email)}`);
        
        // The ProtectedRoute will automatically detect new users need onboarding and redirect them
      }
    } catch (error) {
      console.error('Signup catch error:', error);
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-tactical-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-tactical-accent font-mono text-sm uppercase tracking-wider">
            INITIALIZING SYSTEM...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Card className="w-full max-w-md bg-tactical-surface border-tactical-border">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-tactical-accent font-mono tracking-wider">
              TACTICAL ACCESS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-tactical-bg border border-tactical-border">
                <TabsTrigger 
                  value="signin" 
                  className="data-[state=active]:bg-tactical-accent data-[state=active]:text-tactical-bg text-tactical-text font-mono"
                >
                  SIGN IN
                </TabsTrigger>
                <TabsTrigger 
                  value="signup" 
                  className="data-[state=active]:bg-tactical-accent data-[state=active]:text-tactical-bg text-tactical-text font-mono"
                >
                  SIGN UP
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signInForm.email}
                      onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                      className="bg-tactical-bg border-tactical-border text-tactical-text placeholder:text-tactical-text/50"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signInForm.password}
                      onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                      className="bg-tactical-bg border-tactical-border text-tactical-text placeholder:text-tactical-text/50"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-mono"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={signUpForm.name}
                      onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                      className="bg-tactical-bg border-tactical-border text-tactical-text placeholder:text-tactical-text/50"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signUpForm.email}
                      onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
                      className="bg-tactical-bg border-tactical-border text-tactical-text placeholder:text-tactical-text/50"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={signUpForm.password}
                      onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                      className="bg-tactical-bg border-tactical-border text-tactical-text placeholder:text-tactical-text/50"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Confirm Password"
                      value={signUpForm.confirmPassword}
                      onChange={(e) => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })}
                      className="bg-tactical-bg border-tactical-border text-tactical-text placeholder:text-tactical-text/50"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-mono"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
