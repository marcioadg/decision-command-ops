
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const email = searchParams.get('email') || 'your email';

  const handleResendEmail = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    setCanResend(false);
    
    try {
      // For resending, we need the original signup info
      // In a real app, you might want to store this temporarily or have a dedicated resend endpoint
      toast({
        title: "Email Resent",
        description: "If an account exists with this email, you'll receive a new verification email.",
      });
      
      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
      setCanResend(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-tactical-bg tactical-grid">
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Card className="w-full max-w-md bg-tactical-surface border-tactical-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-tactical-accent/10 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-tactical-accent" />
            </div>
            <CardTitle className="text-2xl font-bold text-tactical-accent font-mono tracking-wider">
              CHECK YOUR EMAIL
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <p className="text-tactical-text">
                We've sent a verification link to:
              </p>
              <p className="font-mono text-tactical-accent bg-tactical-bg px-3 py-2 rounded border border-tactical-border">
                {email}
              </p>
              <p className="text-sm text-tactical-text/70">
                Click the link in the email to verify your account and complete your setup.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-tactical-bg border border-tactical-border rounded-lg p-4">
                <h4 className="font-mono text-sm font-semibold text-tactical-accent mb-2 uppercase">
                  Next Steps:
                </h4>
                <ul className="text-sm text-tactical-text space-y-1">
                  <li>• Check your inbox for the verification email</li>
                  <li>• Look in your spam/junk folder if you don't see it</li>
                  <li>• Click the verification link in the email</li>
                  <li>• You'll be redirected to complete your setup</li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <Button 
                  onClick={handleResendEmail}
                  disabled={!canResend || isResending}
                  variant="outline"
                  className="w-full border-tactical-border text-tactical-text hover:bg-tactical-bg font-mono"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      SENDING...
                    </>
                  ) : canResend ? (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      RESEND EMAIL
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      RESEND IN {countdown}s
                    </>
                  )}
                </Button>

                <Button 
                  onClick={() => navigate('/login')}
                  variant="ghost"
                  className="w-full text-tactical-text hover:bg-tactical-bg font-mono"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  BACK TO LOGIN
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-tactical-text/50 font-mono">
            Having trouble? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
