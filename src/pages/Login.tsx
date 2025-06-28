import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'super-admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Super-admin login
    if (credentials.username === 'superadmin' && credentials.password === 'super-tactical-2024') {
      login({ 
        name: 'Super Administrator', 
        username: 'superadmin', 
        role: 'super-admin' 
      });
      toast({
        title: "SUPER-ADMIN ACCESS GRANTED",
        description: "Welcome to the Super-Admin Console",
      });
      navigate('/admin');
      return;
    }
    
    // Regular admin login
    if (credentials.username === 'admin' && credentials.password === 'tactical123') {
      login({ name: 'Commander', username: 'admin' });
      toast({
        title: "ACCESS GRANTED",
        description: "Welcome to the Tactical Decision Pipeline",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "ACCESS DENIED",
        description: "Invalid credentials. Try admin/tactical123 or superadmin/super-tactical-2024",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
      <div className="flex flex-col items-center justify-center h-full">
        <Card className="w-full max-w-md bg-tactical-surface border-tactical-border">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-tactical-accent font-mono tracking-wider">
              TACTICAL LOGIN
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={handleChange}
                  className="bg-tactical-bg border-tactical-border text-tactical-text placeholder:text-tactical-text/50"
                />
              </div>
              <div>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="bg-tactical-bg border-tactical-border text-tactical-text placeholder:text-tactical-text/50"
                />
              </div>
              <Button type="submit" className="w-full bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-mono">
                LOGIN
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
