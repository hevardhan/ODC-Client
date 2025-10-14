import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      // Try to get existing profile
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('Profile not found, creating new profile...');
        
        const { data: authUser } = await supabase.auth.getUser();
        
        const { data: newProfile, error: createError } = await supabase
          .from('sellers')
          .insert([
            {
              id: userId,
              email: authUser.user.email,
              full_name: authUser.user.user_metadata?.full_name || 'Seller',
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        setUser(newProfile);
        return;
      }

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Still set a minimal user object so app doesn't break
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || 'Seller',
        });
      } else {
        setUser(null);
      }
    }
  };

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await loadUserProfile(data.user.id);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password, fullName) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      // Wait a bit for auth to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create seller profile (with upsert to handle duplicates)
      const { error: profileError } = await supabase
        .from('sellers')
        .upsert([
          {
            id: authData.user.id,
            email: email,
            full_name: fullName,
          },
        ], {
          onConflict: 'id',
        });

      if (profileError) {
        console.warn('Profile creation warning:', profileError);
        // Don't fail signup if profile creation fails - loadUserProfile will handle it
      }

      await loadUserProfile(authData.user.id);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
