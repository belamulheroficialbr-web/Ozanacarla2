import {createClient} from '@supabase/supabase-js';

export const DEFAULT_URL = 'https://ovpvjghokiyxptvpmumw.supabase.co';
export const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cHZqZ2hva2l5eHB0dnBtdW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTU1MzcsImV4cCI6MjEwOTM3MTUzN30.xjMgE4XnR8BrbgjDqLUr_1uf8FnzrdULQcWW5QkHnLQ';

const getEnvOrStorage = (key: string, envKey: string, defaultVal: string) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    // Ignore legacy placeholders or wrong values in storage
    if (
      stored &&
      stored.trim() !== '' &&
      !stored.includes('placeholder') &&
      !stored.includes('YOUR_') &&
      !stored.startsWith('sb_publishable_') &&
      !stored.includes('mgxcguiqjncopdvowoae')
    ) {
      return stored;
    }
  }
  return import.meta.env[envKey] || defaultVal;
};

const supabaseUrl = getEnvOrStorage('SUPABASE_URL', 'VITE_SUPABASE_URL', DEFAULT_URL);
const supabaseAnonKey = getEnvOrStorage('SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY', DEFAULT_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function setSupabaseConfig(url: string, key: string) {
  localStorage.setItem('SUPABASE_URL', url.trim());
  localStorage.setItem('SUPABASE_ANON_KEY', key.trim());
  window.location.reload();
}

export function resetSupabaseConfig() {
  localStorage.removeItem('SUPABASE_URL');
  localStorage.removeItem('SUPABASE_ANON_KEY');
  window.location.reload();
}

