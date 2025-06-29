
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { signIn, signUp, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { error } = await signIn(signInForm.email, signInForm.password);
      
      if (error) {
        toast({
          title: "AUTHENTICATION FAILED",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "ACCESS GRANTED",
          description: "Welcome to the Tactical Decision Pipeline",
        });
        onClose();
        
        // Navigate to dashboard or admin based on user role
        if (profile?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      toast({
        title: "AUTHENTICATION FAILED",
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
        title: "VALIDATION ERROR",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (signUpForm.password.length < 6) {
      toast({
        title: "VALIDATION ERROR",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await signUp(
        signUpForm.email, 
        signUpForm.password, 
        signUpForm.name
      );
      
      if (error) {
        toast({
          title: "REGISTRATION FAILED",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "ACCOUNT CREATED",
          description: "Please check your email to verify your account",
        });
        setSignUpForm({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "REGISTRATION FAILED",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md bg-tactical-surface border-tactical-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-tactical-accent font-mono tracking-wider">
            TACTICAL ACCESS
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-tactical-bg border border-tactical-border">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-tactical-accent data-[state=active]:text-tactical-bg text-tactical-text font-mono text-xs"
            >
              SIGN IN
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="data-[state=active]:bg-tactical-accent data-[state=active]:text-tactical-bg text-tactical-text font-mono text-xs"
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
                className="w-full bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-mono text-xs"
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
                className="w-full bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-mono text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'CREATING ACCOUNT...' : 'SIGN UP'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
