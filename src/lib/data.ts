import {supabase} from './supabase';

// Helper for real-time and auth-safe data fetching
export const dataService = {
  // Profiles
  async getProfile(userId: string) {
    return await supabase.from('profiles').select('*').eq('id', userId).single();
  },

  // Vitrine/Services
  async getServices() {
    return await supabase.from('services').select('*');
  },
  async addService(service: any) {
    return await supabase.from('services').insert([service]);
  },

  // Appointments
  async getAppointments(userId: string, role: string) {
    let query = supabase.from('appointments').select('*, services(name), profiles(name)');
    if (role === 'client') query = query.eq('client_id', userId);
    else if (role === 'professional') query = query.eq('professional_id', userId);
    return await query;
  },

  // Financial
  async verifyDatabaseSchema() {
    const requiredTables = ['profiles', 'services', 'appointments', 'transactions', 'conversations', 'messages'];
    const results: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      const {error} = await supabase.from(table).select('*').limit(1);
      // If error code is not '42P01' (table does not exist), table likely exists or is restricted by RLS
      results[table] = !error || error.code !== '42P01';
    }
    return results;
  }
};
