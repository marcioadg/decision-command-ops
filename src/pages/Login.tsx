
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Shield, Terminal } from 'lucide-react';
import { soundSystem } from '@/utils/soundSystem';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "AUTHENTICATION ERROR",
        description: "All fields are required for access",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "SECURITY BREACH",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      soundSystem.playCardDrop();
      toast({
        title: "ACCESS GRANTED",
        description: `Welcome to the tactical command center`,
      });
      navigate('/');
    } else {
      toast({
        title: "ACCESS DENIED",
        description: "Invalid credentials detected",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-tactical-accent mr-3" />
            <Terminal className="w-8 h-8 text-tactical-text" />
          </div>
          <h1 className="text-2xl font-bold text-tactical-accent font-mono tracking-wider">
            TACTICAL COMMAND
          </h1>
          <p className="text-tactical-text/70 font-mono text-sm mt-2">
            AUTHENTICATION REQUIRED
          </p>
        </div>

        {/* Login Form */}
        <div className="tactical-card">
          <div className="stage-header">
            {isSignUp ? 'CREATE ACCOUNT' : 'SYSTEM ACCESS'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-tactical-text font-mono text-xs uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="operator@tactical.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-tactical-surface border-tactical-border text-tactical-text font-mono focus:border-tactical-accent"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-tactical-text font-mono text-xs uppercase tracking-wider">
                Access Code
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-tactical-surface border-tactical-border text-tactical-text font-mono focus:border-tactical-accent"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tactical-accent hover:bg-tactical-accent/80 text-tactical-bg font-mono uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-tactical-bg border-t-transparent rounded-full animate-spin mr-2" />
                  AUTHENTICATING...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  {isSignUp ? 'CREATE ACCOUNT' : 'GRANT ACCESS'}
                </div>
              )}
            </Button>
          </form>

          {/* Toggle Sign Up/Login */}
          <div className="mt-6 pt-4 border-t border-tactical-border text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-tactical-accent hover:text-tactical-accent/80 font-mono text-sm uppercase tracking-wider transition-colors"
              disabled={isLoading}
            >
              {isSignUp ? 'EXISTING OPERATOR? SIGN IN' : 'NEW OPERATOR? CREATE ACCOUNT'}
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-tactical-surface/50 border border-tactical-border rounded">
            <p className="text-tactical-text/60 font-mono text-xs uppercase tracking-wider mb-2">
              Demo Access:
            </p>
            <p className="text-tactical-text/80 font-mono text-xs">
              Email: demo@tactical.com<br />
              Password: tactical123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
