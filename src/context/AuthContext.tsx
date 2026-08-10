import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabase, checkHasRole, isSupabaseConfigured, ensureAdminRoleForUser } from '../lib/supabase';

interface AuthContextType {
  user: User | { id: string; email: string } | null;
  isAdmin: boolean;
  loading: boolean;
  isDemoAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; message?: string }>;
  logout: () => Promise<void>;
  loginAsDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ADMIN_KEY = 'ofertas_demo_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | { id: string; email: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // Check demo admin session first
      const hasDemoSession = localStorage.getItem(DEMO_ADMIN_KEY) === 'true';
      if (hasDemoSession) {
        if (mounted) {
          setUser({ id: 'demo-admin-id', email: 'admin@ofertasdahora.com' });
          setIsAdmin(true);
          setIsDemoAdmin(true);
          setLoading(false);
        }
        return;
      }

      const client = getSupabase();
      if (!client) {
        if (mounted) {
          setUser(null);
          setIsAdmin(false);
          setIsDemoAdmin(false);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          const u = session.user;
          const isAdminEmail = u.email?.toLowerCase() === 'welington.ceolin@gmail.com';
          if (isAdminEmail) {
            await ensureAdminRoleForUser(u.id, u.email);
          }
          const adminCheck = await checkHasRole(u.id, 'admin', u.email);
          if (mounted) {
            setUser(u);
            setIsAdmin(adminCheck || isAdminEmail);
            setIsDemoAdmin(false);
          }
        } else {
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
            setIsDemoAdmin(false);
          }
        }
      } catch (e) {
        console.error('Error initializing auth session:', e);
      } finally {
        if (mounted) setLoading(false);
      }

      // Listen to Auth state changes
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const u = session.user;
          const isAdminEmail = u.email?.toLowerCase() === 'welington.ceolin@gmail.com';
          if (isAdminEmail) {
            await ensureAdminRoleForUser(u.id, u.email);
          }
          const adminCheck = await checkHasRole(u.id, 'admin', u.email);
          setUser(u);
          setIsAdmin(adminCheck || isAdminEmail);
          setIsDemoAdmin(false);
        } else {
          if (localStorage.getItem(DEMO_ADMIN_KEY) !== 'true') {
            setUser(null);
            setIsAdmin(false);
            setIsDemoAdmin(false);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      // If Supabase credentials are not connected yet, offer demo login automatically!
      if (cleanEmail && cleanPassword) {
        loginAsDemoAdmin();
        return { error: null };
      }
      return { error: 'Supabase não está configurado. Configure nas configurações de conexão.' };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid path specified in request URL')) {
          msg = 'URL do Supabase inválida ou malformada. Por favor, reconfigure em "Conexão DB".';
        }
        return { error: msg };
      }

      if (data.user) {
        const isAdminEmail = cleanEmail === 'welington.ceolin@gmail.com';
        if (isAdminEmail) {
          await ensureAdminRoleForUser(data.user.id, cleanEmail);
        }

        const adminCheck = await checkHasRole(data.user.id, 'admin', cleanEmail);
        const finalIsAdmin = adminCheck || isAdminEmail;
        setUser(data.user);
        setIsAdmin(finalIsAdmin);
        setIsDemoAdmin(false);
        localStorage.removeItem(DEMO_ADMIN_KEY);

        if (!finalIsAdmin) {
          return { error: 'Acesso negado: Seu usuário não tem permissão de administrador (role "admin").' };
        }
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao realizar login.' };
    }
  };

  const signUp = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const client = getSupabase();
    if (!client || !isSupabaseConfigured()) {
      if (cleanEmail && cleanPassword) {
        loginAsDemoAdmin();
        return { error: null, message: 'Usuário cadastrado com sucesso em modo demonstração!' };
      }
      return { error: 'Supabase não está configurado. Configure nas configurações de conexão.' };
    }

    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : undefined;

      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: redirectOrigin ? { emailRedirectTo: redirectOrigin } : undefined
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid path specified in request URL')) {
          msg = 'A URL do Supabase configurada está malformada ou inválida. Por favor, acesse "Conexão DB" e insira uma URL válida (ex: https://xxx.supabase.co).';
        }
        return { error: msg };
      }

      if (data.user) {
        const isAdminEmail = cleanEmail === 'welington.ceolin@gmail.com';
        if (isAdminEmail) {
          await ensureAdminRoleForUser(data.user.id, cleanEmail);
        }

        const adminCheck = await checkHasRole(data.user.id, 'admin', cleanEmail);
        const finalIsAdmin = adminCheck || isAdminEmail;
        setUser(data.user);
        setIsAdmin(finalIsAdmin);
        setIsDemoAdmin(false);
        localStorage.removeItem(DEMO_ADMIN_KEY);

        if (!data.session) {
          return {
            error: null,
            message: 'Usuário criado com sucesso no Supabase! Se a confirmação por e-mail estiver ativada, verifique sua caixa de entrada.'
          };
        }
      }
      return { error: null, message: 'Usuário cadastrado e autenticado como administrador!' };
    } catch (err: any) {
      return { error: err.message || 'Erro inesperado ao cadastrar usuário.' };
    }
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_ADMIN_KEY);
    setUser(null);
    setIsAdmin(false);
    setIsDemoAdmin(false);

    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.error('Sign out error:', e);
      }
    }
  };

  const loginAsDemoAdmin = () => {
    localStorage.setItem(DEMO_ADMIN_KEY, 'true');
    setUser({ id: 'demo-admin-id', email: 'admin@ofertasdahora.com' });
    setIsAdmin(true);
    setIsDemoAdmin(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        isDemoAdmin,
        login,
        signUp,
        logout,
        loginAsDemoAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
