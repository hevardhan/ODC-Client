import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Check, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function EmailVerification() {
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the email from session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email);
        
        // If already verified, redirect to onboarding
        if (session.user.email_confirmed_at) {
          navigate('/onboarding');
        }
      } else {
        // No session, redirect to login
        navigate('/login');
      }
    };
    
    checkSession();

    // Listen for email verification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        // Email verified! Redirect to onboarding
        navigate('/onboarding');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch (error) {
      console.error('Error resending email:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <motion.div
              className="flex justify-center"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary" />
              </div>
            </motion.div>
            
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent a verification link to
              <div className="font-semibold text-foreground mt-2">{email}</div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                What's next?
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>1. Open your email inbox</li>
                <li>2. Click the verification link</li>
                <li>3. You'll be automatically redirected</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                Didn't receive the email?
              </p>
              
              <Button
                onClick={handleResendEmail}
                disabled={resending || resent}
                variant="outline"
                className="w-full"
              >
                {resending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resent ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Email Sent!
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Check your spam folder if you don't see it</p>
              <p>The link will expire in 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
