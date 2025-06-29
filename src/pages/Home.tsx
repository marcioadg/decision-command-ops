import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, CheckCircle, Users, Clock, Target, Shield, ArrowRight, Star, LogIn, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginModal } from '@/components/LoginModal';

const Home = () => {
  const navigate = useNavigate();
  const { user, profile, isLoading } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalDefaultTab, setLoginModalDefaultTab] = useState<'signin' | 'signup'>('signin');

  const handleGetStarted = () => {
    if (user) {
      navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setLoginModalDefaultTab('signup');
      setIsLoginModalOpen(true);
    }
  };

  const handleSignIn = () => {
    setLoginModalDefaultTab('signin');
    setIsLoginModalOpen(true);
  };

  const handleSignUp = () => {
    setLoginModalDefaultTab('signup');
    setIsLoginModalOpen(true);
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
    <div className="min-h-screen bg-tactical-bg">
      {/* Header with Login/Dashboard Access */}
      <header className="border-b border-tactical-border bg-tactical-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-tactical-accent font-mono tracking-wider">
            DECISION COMMAND
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <Button
                onClick={() => navigate(profile?.role === 'admin' ? '/admin' : '/dashboard')}
                className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-mono text-xs"
                size="sm"
              >
                <User className="w-4 h-4 mr-2" />
                GO TO DASHBOARD
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSignIn}
                  variant="outline"
                  className="border-tactical-accent/50 text-tactical-accent hover:bg-tactical-accent/10 font-mono text-xs"
                  size="sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  SIGN IN
                </Button>
                <Button
                  onClick={handleSignUp}
                  className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-mono text-xs"
                  size="sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  SIGN UP
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center tactical-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-tactical-accent/5 via-transparent to-info/5" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-tactical-accent/10 border border-tactical-accent/20 rounded-full text-tactical-accent font-mono text-sm mb-4">
              🎯 NO CREDIT CARD REQUIRED
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-tactical-text via-tactical-accent to-tactical-text bg-clip-text text-transparent">
            Stop Second-Guessing.<br />
            <span className="text-tactical-accent">Start Winning.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-tactical-text/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            The tactical decision pipeline used by elite teams to make confident, 
            data-driven decisions <span className="text-tactical-accent font-bold">3x faster</span>
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-bold px-8 py-4 text-lg"
            >
              {user ? 'GO TO DASHBOARD' : 'GET STARTED'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <div className="text-tactical-text/70 text-sm mb-8">
            <div className="mb-2">
              <strong className="text-tactical-accent">Start Free</strong> • No Credit Card Required
            </div>
            {!user && (
              <div>
                Already have an account?{' '}
                <button 
                  onClick={handleSignIn}
                  className="text-tactical-accent hover:text-tactical-accent/80 underline font-bold"
                >
                  Sign in here
                </button>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-tactical-surface/50 border-tactical-border backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-tactical-accent mx-auto mb-3" />
                <h3 className="font-bold text-tactical-text mb-2">3x Faster Decisions</h3>
                <p className="text-tactical-text/70 text-sm">Streamlined pipeline eliminates analysis paralysis</p>
              </CardContent>
            </Card>
            
            <Card className="bg-tactical-surface/50 border-tactical-border backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Target className="w-8 h-8 text-tactical-accent mx-auto mb-3" />
                <h3 className="font-bold text-tactical-text mb-2">Data-Driven Confidence</h3>
                <p className="text-tactical-text/70 text-sm">Structured criteria and impact scoring</p>
              </CardContent>
            </Card>
            
            <Card className="bg-tactical-surface/50 border-tactical-border backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-tactical-accent mx-auto mb-3" />
                <h3 className="font-bold text-tactical-text mb-2">Clear Accountability</h3>
                <p className="text-tactical-text/70 text-sm">Track ownership and outcomes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-tactical-surface/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tactical-text mb-6">
              The Hidden Cost of <span className="text-red-400">Bad Decisions</span>
            </h2>
            <p className="text-xl text-tactical-text/80 max-w-3xl mx-auto">
              Every day, critical decisions get stuck in endless loops of analysis, missed deadlines, and second-guessing.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-red-400 mb-4">73%</div>
              <h3 className="text-xl font-bold text-tactical-text mb-2">Analysis Paralysis</h3>
              <p className="text-tactical-text/70">of decisions get delayed due to overthinking</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-bold text-red-400 mb-4">2.5x</div>
              <h3 className="text-xl font-bold text-tactical-text mb-2">Longer Process</h3>
              <p className="text-tactical-text/70">time spent on decisions without clear framework</p>
            </div>
            
            <div className="text-center">
              <div className="text-6xl font-bold text-red-400 mb-4">$2M</div>
              <h3 className="text-xl font-bold text-tactical-text mb-2">Average Cost</h3>
              <p className="text-tactical-text/70">of poor decisions per company annually</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-tactical-text mb-6">
              Make Decisions Like a <span className="text-tactical-accent">Tactical Commander</span>
            </h2>
            <p className="text-xl text-tactical-text/80 max-w-3xl mx-auto">
              From backlog to execution in 4 strategic stages. Every decision flows through a proven military-grade process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { stage: "BACKLOG", desc: "Capture & Prioritize", icon: "📝" },
              { stage: "ANALYSIS", desc: "Gather Intelligence", icon: "🔍" },
              { stage: "DECISION", desc: "Strategic Choice", icon: "⚡" },
              { stage: "EXECUTION", desc: "Tactical Action", icon: "🚀" }
            ].map((item, index) => (
              <Card key={index} className="bg-tactical-surface border-tactical-border hover:border-tactical-accent/50 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-bold text-tactical-accent mb-2 font-mono">{item.stage}</h3>
                  <p className="text-tactical-text/70 text-sm">{item.desc}</p>
                  {index < 3 && <ArrowRight className="w-4 h-4 text-tactical-accent/50 mx-auto mt-4" />}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-tactical-surface/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-tactical-text mb-6">
              Trusted by Elite Decision Makers
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Cut our decision time from weeks to days. The tactical approach keeps everyone aligned and moving fast.",
                author: "Sarah Chen",
                title: "VP of Strategy, TechCorp",
                rating: 5
              },
              {
                quote: "Finally, a system that matches how we actually think about important decisions. The reflection stage is game-changing.",
                author: "Marcus Rodriguez",
                title: "CEO, StartupX",
                rating: 5
              },
              {
                quote: "Our team went from decision chaos to tactical precision. Easy to get started and incredibly powerful.",
                author: "Jennifer Walsh",
                title: "Director of Operations",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-tactical-surface border-tactical-border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-tactical-accent fill-current" />
                    ))}
                  </div>
                  <p className="text-tactical-text/90 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="text-tactical-accent font-bold">{testimonial.author}</p>
                    <p className="text-tactical-text/70 text-sm">{testimonial.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-tactical-accent/10 to-info/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-tactical-text mb-6">
            Ready to <span className="text-tactical-accent">Upgrade Your Decision-Making?</span>
          </h2>
          
          <p className="text-xl text-tactical-text/80 mb-8">
            Join thousands of leaders who transformed their decision process
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-tactical-accent hover:bg-tactical-accent/90 text-tactical-bg font-bold px-8 py-4 text-lg"
            >
              {user ? 'GO TO DASHBOARD' : 'GET STARTED NOW'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-tactical-text/70 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-tactical-accent" />
              Start free today
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-tactical-accent" />
              Setup in under 5 minutes
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-tactical-accent" />
              No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        defaultTab={loginModalDefaultTab}
      />
    </div>
  );
};

export default Home;
