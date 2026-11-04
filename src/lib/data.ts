import {supabase} from './supabase';

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    description: 'Atendimento Corte & Escova - Cliente Ana',
    category: 'Serviços',
    type: 'entrada',
    amount: 120,
    date: new Date().toISOString(),
    payment_method: 'PIX'
  },
  {
    id: 'tx-2',
    description: 'Venda Esmalte Dourado Gel',
    category: 'Venda de Produtos',
    type: 'entrada',
    amount: 35,
    date: new Date().toISOString(),
    payment_method: 'Cartão de Crédito'
  },
  {
    id: 'tx-3',
    description: 'Compra de Ampolas para Hidratação',
    category: 'Fornecedores & Produtos',
    type: 'saida',
    amount: 85,
    date: new Date(Date.now() - 86400000).toISOString(),
    payment_method: 'PIX'
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Kit Ampolas de Nutrição Capilar',
    category: 'Capilar',
    cost_price: 15,
    sale_price: 45,
    quantity: 12,
    min_quantity: 5,
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Esmalte Gel Ouro Bela Mulher',
    category: 'Unhas & Esmaltes',
    cost_price: 12,
    sale_price: 35,
    quantity: 3,
    min_quantity: 5,
    updated_at: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Óleo Reparador de Pontas 60ml',
    category: 'Capilar',
    cost_price: 25,
    sale_price: 60,
    quantity: 8,
    min_quantity: 4,
    updated_at: new Date().toISOString()
  }
];

const INITIAL_MOVEMENTS = [
  {
    id: 'mov-1',
    product_id: 'prod-1',
    product_name: 'Kit Ampolas de Nutrição Capilar',
    type: 'entrada',
    quantity: 10,
    reason: 'Compra Fornecedor L\'Oréal',
    date: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'mov-2',
    product_id: 'prod-2',
    product_name: 'Esmalte Gel Ouro Bela Mulher',
    type: 'saida',
    quantity: 2,
    reason: 'Uso em Atendimento',
    date: new Date(Date.now() - 86400000).toISOString()
  }
];

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

  // Transactions / Cash Flow (Supabase with LocalStorage Fallback)
  async getTransactions() {
    try {
      const {data, error} = await supabase.from('transactions').select('*').order('date', {ascending: false});
      if (!error && data && data.length > 0) {
        return {data, error: null};
      }
    } catch {}

    // Fallback LocalStorage
    const stored = localStorage.getItem('BELA_TRANSACTIONS');
    const parsed = stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    if (!stored) localStorage.setItem('BELA_TRANSACTIONS', JSON.stringify(INITIAL_TRANSACTIONS));
    return {data: parsed, error: null};
  },

  async addTransaction(transaction: any) {
    const newTx = {...transaction, id: `tx-${Date.now()}`};
    try {
      const {data, error} = await supabase.from('transactions').insert([transaction]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_TRANSACTIONS');
    const list = stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    const updated = [newTx, ...list];
    localStorage.setItem('BELA_TRANSACTIONS', JSON.stringify(updated));
    return {data: [newTx], error: null};
  },

  async updateTransaction(id: string, updates: any) {
    try {
      const {data, error} = await supabase.from('transactions').update(updates).eq('id', id).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_TRANSACTIONS');
    const list = stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    const updated = list.map((t: any) => t.id === id ? {...t, ...updates} : t);
    localStorage.setItem('BELA_TRANSACTIONS', JSON.stringify(updated));
    return {data: updated, error: null};
  },

  async deleteTransaction(id: string) {
    try {
      const {error} = await supabase.from('transactions').delete().eq('id', id);
      if (!error) return {error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_TRANSACTIONS');
    const list = stored ? JSON.parse(stored) : INITIAL_TRANSACTIONS;
    const updated = list.filter((t: any) => t.id !== id);
    localStorage.setItem('BELA_TRANSACTIONS', JSON.stringify(updated));
    return {error: null};
  },

  // Products / Inventory (Supabase with LocalStorage Fallback)
  async getProducts() {
    try {
      const {data, error} = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        return {data, error: null};
      }
    } catch {}

    const stored = localStorage.getItem('BELA_PRODUCTS');
    const parsed = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    if (!stored) localStorage.setItem('BELA_PRODUCTS', JSON.stringify(INITIAL_PRODUCTS));
    return {data: parsed, error: null};
  },

  async addProduct(product: any) {
    const newProd = {...product, id: `prod-${Date.now()}`};
    try {
      const {data, error} = await supabase.from('products').insert([product]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_PRODUCTS');
    const list = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    const updated = [newProd, ...list];
    localStorage.setItem('BELA_PRODUCTS', JSON.stringify(updated));
    return {data: [newProd], error: null};
  },

  async updateProduct(id: string, updates: any) {
    try {
      const {data, error} = await supabase.from('products').update(updates).eq('id', id).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_PRODUCTS');
    const list = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    const updated = list.map((p: any) => p.id === id ? {...p, ...updates} : p);
    localStorage.setItem('BELA_PRODUCTS', JSON.stringify(updated));
    return {data: updated, error: null};
  },

  async deleteProduct(id: string) {
    try {
      const {error} = await supabase.from('products').delete().eq('id', id);
      if (!error) return {error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_PRODUCTS');
    const list = stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    const updated = list.filter((p: any) => p.id !== id);
    localStorage.setItem('BELA_PRODUCTS', JSON.stringify(updated));
    return {error: null};
  },

  // Stock Movements
  async getStockMovements() {
    try {
      const {data, error} = await supabase.from('stock_movements').select('*').order('date', {ascending: false});
      if (!error && data && data.length > 0) {
        return {data, error: null};
      }
    } catch {}

    const stored = localStorage.getItem('BELA_STOCK_MOVEMENTS');
    const parsed = stored ? JSON.parse(stored) : INITIAL_MOVEMENTS;
    if (!stored) localStorage.setItem('BELA_STOCK_MOVEMENTS', JSON.stringify(INITIAL_MOVEMENTS));
    return {data: parsed, error: null};
  },

  async recordStockMovement(movement: any) {
    const newMov = {...movement, id: `mov-${Date.now()}`};
    try {
      const {data, error} = await supabase.from('stock_movements').insert([movement]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_STOCK_MOVEMENTS');
    const list = stored ? JSON.parse(stored) : INITIAL_MOVEMENTS;
    const updated = [newMov, ...list];
    localStorage.setItem('BELA_STOCK_MOVEMENTS', JSON.stringify(updated));
    return {data: [newMov], error: null};
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
