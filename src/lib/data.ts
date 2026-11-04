import {supabase} from './supabase';

// Helper for real-time and auth-safe data fetching
export const dataService = {
  // Profiles
  async getProfiles(roleFilter?: string) {
    let query = supabase.from('profiles').select('*');
    if (roleFilter) query = query.eq('role', roleFilter);
    return await query;
  },
  async getProfile(userId: string) {
    try {
      const res = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      return res;
    } catch (err: any) {
      return { data: null, error: err };
    }
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
    try {
      let query = supabase.from('appointments').select('*');
      if (role === 'client') query = query.eq('client_id', userId);
      else if (role === 'professional') query = query.eq('professional_id', userId);
      const res = await query;
      return res;
    } catch (err: any) {
      return { data: [], error: err };
    }
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
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        return { success: false, message: `Erro Auth: ${sessionError.message}` };
      }
      
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.message?.includes('Failed to fetch')) {
          return { success: false, message: 'Falha de conexão com a URL do Supabase (Failed to fetch).' };
        }
        if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('apikey')) {
          return { success: false, message: 'Chave do Supabase inválida ou rejeitada.' };
        }
        return { success: true, message: `Conectado ao Supabase (Tabela: ${error.message})` };
      }
      return { success: true, message: 'Conectado ao Supabase com sucesso!' };
    } catch (err: any) {
      return { success: false, message: `Erro: ${err?.message || 'Falha de rede'}` };
    }
  }
};
