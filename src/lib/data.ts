import {supabase} from './supabase';

// Helper for real-time and auth-safe data fetching
export const dataService = {
  // Profiles
  async getProfiles(roleFilter?: string) {
    let query = supabase.from('profiles').select('*');
    if (roleFilter) query = query.eq('role', roleFilter);
    return await query;
  },
  async updateProfile(userId: string, profileData: any) {
    return await supabase.from('profiles').update(profileData).eq('id', userId);
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
    let query = supabase.from('appointments').select('*, services(name), client:profiles!client_id(name), professional:profiles!professional_id(name)');
    if (role === 'client') query = query.eq('client_id', userId);
    else if (role === 'professional') query = query.eq('professional_id', userId);
    return await query;
  },
  async createAppointment(appointment: any) {
    return await supabase.from('appointments').insert([appointment]);
  },
  async updateAppointmentStatus(id: string, status: string) {
    return await supabase.from('appointments').update({status}).eq('id', id);
  },

  // Financial
  async verifyDatabaseSchema() {
    const requiredTables = ['profiles', 'services', 'appointments', 'transactions', 'conversations', 'messages'];
    const results: Record<string, boolean> = {};
    
    for (const table of requiredTables) {
      const {error} = await supabase.from(table).select('*').limit(1);
      results[table] = !error || error.code !== '42P01';
    }
    return results;
  },

  async testConnection() {
    try {
      const { error } = await supabase.auth.getSession();
      if (error) {
        return { success: false, message: error.message };
      }
      const { error: queryError } = await supabase.from('profiles').select('id').limit(1);
      if (queryError && queryError.message.includes('Failed to fetch')) {
        return { success: false, message: 'URL ou Chave do Supabase incorretas (Failed to fetch).' };
      }
      return { success: true, message: 'Conexão com o Supabase validada com sucesso!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Erro ao testar conexão.' };
    }
  }
};
