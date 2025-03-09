
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  session: Session;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session>({
    user: null,
    isLoading: true,
    error: null,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setSession({
            user: null,
            isLoading: false,
            error,
          });
          return;
        }

        if (data.session) {
          setSession({
            user: data.session.user,
            isLoading: false,
            error: null,
          });
        } else {
          setSession({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setSession({
          user: null,
          isLoading: false,
          error: error as Error,
        });
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setSession({
            user: session.user,
            isLoading: false,
            error: null,
          });
        } else {
          setSession({
            user: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true, error: null }));
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        setSession(prev => ({ ...prev, isLoading: false, error }));
        return;
      }

      setSession({
        user: data.user,
        isLoading: false,
        error: null,
      });
      
      toast({
        title: "Signed in successfully",
        description: "Welcome back!",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setSession(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setSession(prev => ({ ...prev, isLoading: true, error: null }));
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        setSession(prev => ({ ...prev, isLoading: false, error }));
        return;
      }

      setSession({
        user: data.user,
        isLoading: false,
        error: null,
      });
      
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setSession(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
    }
  };

  const signOut = async () => {
    try {
      setSession(prev => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        setSession(prev => ({ ...prev, isLoading: false, error }));
        return;
      }

      setSession({
        user: null,
        isLoading: false,
        error: null,
      });
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Sign out failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      setSession(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error as Error 
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>
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
