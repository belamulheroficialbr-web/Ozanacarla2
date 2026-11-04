import {createClient} from '@supabase/supabase-js';

const getEnvOrStorage = (key: string, envKey: string) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  }
  return import.meta.env[envKey] || '';
};

const supabaseUrl = getEnvOrStorage('SUPABASE_URL', 'VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvOrStorage('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(
  supabaseUrl && !supabaseUrl.includes('YOUR_') ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseAnonKey && !supabaseAnonKey.includes('YOUR_') ? supabaseAnonKey : 'placeholder-key'
);

export function setSupabaseConfig(url: string, key: string) {
  localStorage.setItem('SUPABASE_URL', url);
  localStorage.setItem('SUPABASE_ANON_KEY', key);
  window.location.reload();
}
