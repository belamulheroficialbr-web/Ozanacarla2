import {createContext, useContext, useEffect, useState} from 'react';
import {supabase} from '../lib/supabase';
import {Session, User} from '@supabase/supabase-js';

const AuthContext = createContext<{session: Session | null; user: User | null; role: string | null; loading: boolean}>({
  session: null,
  user: null,
  role: null,
  loading: true,
});

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {data: {subscription}} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchRole(userId: string) {
    try {
      const {data, error} = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (error) {
        console.error('Error fetching role:', error.message);
        setRole('client'); // Default to client if profile missing
      } else {
        setRole(data?.role ?? 'client');
      }
    } catch (e) {
      console.error('Role fetch exception:', e);
      setRole('client');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{session, user, role, loading}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
