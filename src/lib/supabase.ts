import {createClient} from '@supabase/supabase-js';

export const DEFAULT_URL = 'https://ovpvjghokiyxptvpmumw.supabase.co';
export const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92cHZqZ2hva2l5eHB0dnBtdW13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3OTU1MzcsImV4cCI6MjEwOTM3MTUzN30.xjMgE4XnR8BrbgjDqLUr_1uf8FnzrdULQcWW5QkHnLQ';

const getEnvOrStorage = (key: string, envKey: string, defaultVal: string) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    // 1. Inspect localStorage content related to Supabase safely
    if (stored) {
      console.log(`[Supabase Auth] Inspecting localStorage key "${key}": present (length: ${stored.length})`);
    } else {
      console.log(`[Supabase Auth] Inspecting localStorage key "${key}": not found`);
    }

    if (stored && stored.trim() !== '') {
      const trimmed = stored.trim();
      // 2 & 3 & 4. Validate SUPABASE_URL and SUPABASE_ANON_KEY without clearing entire localStorage
      if (key === 'SUPABASE_URL') {
        // Must point to the correct project ovpvjghokiyxptvpmumw or valid supabase domain
        if (
          trimmed.startsWith('https://') &&
          trimmed.includes('ovpvjghokiyxptvpmumw') &&
          !trimmed.includes('placeholder') &&
          !trimmed.includes('YOUR_')
        ) {
          console.log(`[Supabase Auth] Using valid stored SUPABASE_URL`);
          return trimmed;
        } else {
          console.warn(`[Supabase Auth] Removing invalid/incompatible stored SUPABASE_URL from localStorage`);
          localStorage.removeItem(key);
        }
      } else if (key === 'SUPABASE_ANON_KEY') {
        // Must be a valid public anon JWT key (> 20 chars, has JWT structure)
        if (
          trimmed.length > 20 &&
          trimmed.split('.').length >= 3 &&
          !trimmed.includes('placeholder') &&
          !trimmed.includes('YOUR_') &&
          !trimmed.startsWith('sb_publishable_')
        ) {
          console.log(`[Supabase Auth] Using valid stored SUPABASE_ANON_KEY`);
          return trimmed;
        } else {
          console.warn(`[Supabase Auth] Removing invalid/incompatible stored SUPABASE_ANON_KEY from localStorage`);
          localStorage.removeItem(key);
        }
      }
    }
  }

  // Priority: 1. Environment variable, 2. Default correct project values
  const envVal = import.meta.env[envKey];
  if (envVal && envVal.trim() !== '' && !envVal.includes('placeholder')) {
    return envVal;
  }
  return defaultVal;
};

const supabaseUrl = DEFAULT_URL;
const supabaseAnonKey = DEFAULT_KEY;

console.log(`[Supabase Auth] Initializing client with FORCED URL: ${supabaseUrl}`);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: { 'x-client-info': 'bela-mulher-app' },
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
