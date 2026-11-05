import {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../lib/supabase';
import {Session, User} from '@supabase/supabase-js';

const AuthContext = createContext<{
  session: Session | null;
  user: User | null;
  role: string | null;
  loading: boolean;
  loginAsOwner?: () => void;
  logoutOwner?: () => void;
  refetchRole?: () => Promise<string | null>;
}>({
  session: null,
  user: null,
  role: null,
  loading: true,
});

export const OWNER_ADMIN_ID = '3b04173d-fb3a-4492-8501-e109b423ef88';

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedOwner = localStorage.getItem('BELA_ADMIN_SESSION');
      if (storedOwner === 'true') {
        return {
          id: OWNER_ADMIN_ID,
          email: 'belamulheroficial.br@gmail.com',
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: { name: 'Ozana - Bela Mulher' },
          created_at: new Date().toISOString(),
        } as unknown as User;
      }
    }
    return null;
  });
  const [role, setRole] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('BELA_ADMIN_SESSION') === 'true') {
      return 'admin';
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('BELA_ADMIN_SESSION') === 'true') {
      setRole('admin');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      if (localStorage.getItem('BELA_ADMIN_SESSION') === 'true') {
        setRole('admin');
        setLoading(false);
        return;
      }
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id, session.user.email);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string, email?: string): Promise<string | null> {
    try {
      if (userId === OWNER_ADMIN_ID) {
        setRole('admin');
        return 'admin';
      }

      const normalizedEmail = (email || '').trim().toLowerCase();
      const isAdminEmail = 
        normalizedEmail === 'belamulheroficial.br@gmail.com' || 
        normalizedEmail === 'oficial.belamulher@gmail.com' ||
        userId === OWNER_ADMIN_ID;

      // Query true role from Supabase profiles table
      const {data, error} = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      
      let trueRole = 'client';
      if (!error && data?.role) {
        trueRole = data.role;
      } else {
        trueRole = isAdminEmail ? 'admin' : 'client';
        // Insert profile with true role if missing
        await supabase.from('profiles').upsert({
          id: userId,
          role: trueRole,
          name: email?.split('@')[0] || 'Usuário'
        });
      }

      if (isAdminEmail && trueRole !== 'admin') {
        trueRole = 'admin';
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
      }

      setRole(trueRole);
      return trueRole;
    } catch (e) {
      console.error('Erro ao verificar permissão do usuário:', e);
      const fallbackRole = userId === OWNER_ADMIN_ID ? 'admin' : 'client';
      setRole(fallbackRole);
      return fallbackRole;
    } finally {
      setLoading(false);
    }
  }

  function loginAsOwner() {
    localStorage.setItem('BELA_ADMIN_SESSION', 'true');
    setUser({
      id: OWNER_ADMIN_ID,
      email: 'belamulheroficial.br@gmail.com',
      aud: 'authenticated',
      role: 'authenticated',
      app_metadata: {},
      user_metadata: { name: 'Ozana - Bela Mulher' },
      created_at: new Date().toISOString(),
    } as unknown as User);
    setRole('admin');
    setLoading(false);
  }

  function logoutOwner() {
    localStorage.removeItem('BELA_ADMIN_SESSION');
    setUser(null);
    setRole(null);
    setSession(null);
    supabase.auth.signOut();
    setLoading(false);
  }

  const refetchRole = async () => {
    if (user) {
      return await fetchRole(user.id, user.email);
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{session, user, role, loading, loginAsOwner, logoutOwner, refetchRole}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
