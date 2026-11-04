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
    image_url: '/src/assets/images/service_showcase_2_1793799836229.jpg',
    description: 'Kit de nutrição profunda para restauração dos fios danificados.',
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
    image_url: '/src/assets/images/service_showcase_1_1793799836251.jpg',
    description: 'Esmalte de altíssima durabilidade com brilho dourado acetinado.',
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
    image_url: '/src/assets/images/carousel_salon_1_1793799835801.jpg',
    description: 'Sérum finalizador nutritivo com óleos essenciais e aroma de baunilha.',
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

const INITIAL_COUPONS = [
  {
    id: 'coup-1',
    code: 'BELA10',
    discount_type: 'percent',
    discount_value: 10,
    min_purchase: 50,
    is_active: true,
    expires_at: '2026-12-31'
  },
  {
    id: 'coup-2',
    code: 'BELA20',
    discount_type: 'fixed',
    discount_value: 20,
    min_purchase: 100,
    is_active: true,
    expires_at: '2026-12-31'
  },
  {
    id: 'coup-3',
    code: 'PRIMEIRACOMPRA',
    discount_type: 'percent',
    discount_value: 15,
    min_purchase: 40,
    is_active: true,
    expires_at: '2026-12-31'
  }
];

const INITIAL_BANNERS = [
  {
    id: 'ban-1',
    title: 'Transformação Capilar Premium',
    subtitle: 'Agende com nossos especialistas e ganhe hidratação de brinde',
    image_url: '/src/assets/images/carousel_salon_1_1793799835801.jpg',
    link_type: 'service',
    is_active: true
  },
  {
    id: 'ban-2',
    title: 'Esmaltação em Gel Duradoura',
    subtitle: 'Cores exclusivas Bela Mulher para arrasar em qualquer ocasião',
    image_url: '/src/assets/images/carousel_salon_2_1793799837071.jpg',
    link_type: 'product',
    is_active: true
  }
];

const INITIAL_VIDEOS = [
  {
    id: 'vid-1',
    title: 'Bastidores: Tratamento Ouro 24k',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-stylist-washing-a-clients-hair-in-a-salon-43407-large.mp4',
    thumbnail: '/src/assets/images/vertical_salon_style_1_1793799836206.jpg',
    author: 'Equipe Bela Mulher'
  },
  {
    id: 'vid-2',
    title: 'Resultado Iluminação de Mechas',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-brushing-a-client-s-hair-43410-large.mp4',
    thumbnail: '/src/assets/images/carousel_salon_1_1793799835801.jpg',
    author: 'Carla Silva - Master Hair'
  }
];

const INITIAL_ORDERS: any[] = [
  {
    id: 'ord-1001',
    client_name: 'Ana Maria',
    client_phone: '(11) 98888-7777',
    items: [
      {id: 'prod-1', name: 'Kit Ampolas de Nutrição Capilar', quantity: 1, price: 45}
    ],
    total_amount: 45,
    payment_method: 'PIX',
    payment_status: 'pago',
    delivery_status: 'entregue',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const dataService = {
  // Profiles
  async getProfiles(roleFilter?: string) {
    try {
      let query = supabase.from('profiles').select('*');
      if (roleFilter) query = query.eq('role', roleFilter);
      const res = await query;
      if (res.data && res.data.length > 0) return res;
    } catch {}

    // Fallback default profiles if DB empty
    if (roleFilter === 'professional') {
      return {
        data: [
          {
            id: 'prof-1',
            name: 'Carla Silva',
            email: 'carla@belamulher.com',
            role: 'professional',
            phone: '(11) 97777-1111',
            bio: 'Especialista em Mechas, Balayage e Nutrição Capilar Avançada.',
            specialties: 'Cabelos, Colorimetria',
            avatar_url: '/src/assets/images/carousel_salon_1_1793799835801.jpg'
          },
          {
            id: 'prof-2',
            name: 'Juliana Mendes',
            email: 'juliana@belamulher.com',
            role: 'professional',
            phone: '(11) 97777-2222',
            bio: 'Master Nail Designer em Esmaltação Gel e Spa de Mãos.',
            specialties: 'Unhas, Nail Art',
            avatar_url: '/src/assets/images/service_showcase_1_1793799836251.jpg'
          }
        ],
        error: null
      };
    }
    return {data: [], error: null};
  },

  async getProfile(userId: string) {
    try {
      const res = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (res.data) return res;
    } catch (err: any) {}

    // LocalStorage fallback for Profile
    const stored = localStorage.getItem(`BELA_PROFILE_${userId}`);
    if (stored) return {data: JSON.parse(stored), error: null};
    return {data: null, error: null};
  },

  async updateProfile(userId: string, profileData: any) {
    try {
      const res = await supabase.from('profiles').update(profileData).eq('id', userId).select('*');
      if (res.data && res.data.length > 0) return res;
    } catch {}

    const stored = localStorage.getItem(`BELA_PROFILE_${userId}`);
    const existing = stored ? JSON.parse(stored) : {};
    const updated = {...existing, ...profileData, id: userId};
    localStorage.setItem(`BELA_PROFILE_${userId}`, JSON.stringify(updated));
    return {data: [updated], error: null};
  },

  // Client Medical & Allergies Profile
  async getClientMedicalProfile(userId: string) {
    const stored = localStorage.getItem(`BELA_MEDICAL_${userId}`);
    if (stored) return JSON.parse(stored);
    return {
      allergies: '',
      sensitivities: '',
      reactive_products: '',
      care_preferences: '',
      favorite_professionals: []
    };
  },

  async updateClientMedicalProfile(userId: string, data: any) {
    localStorage.setItem(`BELA_MEDICAL_${userId}`, JSON.stringify(data));
    return {success: true};
  },

  // Services
  async getServices() {
    try {
      const {data, error} = await supabase.from('services').select('*');
      if (!error && data && data.length > 0) return {data, error: null};
    } catch {}

    const defaultServices = [
      {
        id: 'serv-1',
        name: 'Corte Feminino & Escova Modeladora',
        price: 120,
        category: 'Cabelos',
        duration_minutes: 60,
        description: 'Corte personalizado conforme seu formato de rosto com finalização em escova.'
      },
      {
        id: 'serv-2',
        name: 'Hidratação & Reconstrução Ouro 24k',
        price: 180,
        category: 'Tratamentos',
        duration_minutes: 90,
        description: 'Tratamento intensivo para cabelos ressecados ou quimicamente tratados.'
      },
      {
        id: 'serv-3',
        name: 'Manicure & Esmaltação em Gel',
        price: 75,
        category: 'Unhas',
        duration_minutes: 45,
        description: 'Cutilagem delicada e esmaltação gel de longa duração.'
      },
      {
        id: 'serv-4',
        name: 'Design de Sobrancelhas + Henna',
        price: 65,
        category: 'Estética',
        duration_minutes: 40,
        description: 'Mapeamento facial e pigmentação com henna natural.'
      }
    ];
    return {data: defaultServices, error: null};
  },

  async addService(service: any) {
    try {
      const res = await supabase.from('services').insert([service]).select('*');
      if (res.data) return res;
    } catch {}
    return {data: [{...service, id: `serv-${Date.now()}`}], error: null};
  },

  // Appointments
  async getAppointments(userId: string, role: string) {
    try {
      let query = supabase.from('appointments').select('*');
      if (role === 'client') query = query.eq('client_id', userId);
      else if (role === 'professional') query = query.eq('professional_id', userId);
      const res = await query;
      if (res.data && res.data.length > 0) return res;
    } catch (err: any) {}

    const stored = localStorage.getItem('BELA_APPOINTMENTS');
    const list = stored ? JSON.parse(stored) : [];
    if (role === 'client') {
      const filtered = list.filter((a: any) => a.client_id === userId);
      return {data: filtered, error: null};
    }
    return {data: list, error: null};
  },

  async createAppointment(appointment: any) {
    const newApp = {...appointment, id: `app-${Date.now()}`};
    try {
      const res = await supabase.from('appointments').insert([appointment]).select('*');
      if (res.data) return res;
    } catch {}

    const stored = localStorage.getItem('BELA_APPOINTMENTS');
    const list = stored ? JSON.parse(stored) : [];
    const updated = [newApp, ...list];
    localStorage.setItem('BELA_APPOINTMENTS', JSON.stringify(updated));
    return {data: [newApp], error: null};
  },

  async updateAppointmentStatus(id: string, status: string) {
    try {
      const res = await supabase.from('appointments').update({status}).eq('id', id);
      if (!res.error) return res;
    } catch {}

    const stored = localStorage.getItem('BELA_APPOINTMENTS');
    const list = stored ? JSON.parse(stored) : [];
    const updated = list.map((a: any) => a.id === id ? {...a, status} : a);
    localStorage.setItem('BELA_APPOINTMENTS', JSON.stringify(updated));
    return {error: null};
  },

  // Transactions / Cash Flow
  async getTransactions() {
    try {
      const {data, error} = await supabase.from('transactions').select('*').order('date', {ascending: false});
      if (!error && data && data.length > 0) return {data, error: null};
    } catch {}

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

  // Products / Inventory
  async getProducts() {
    try {
      const {data, error} = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) return {data, error: null};
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
      if (!error && data && data.length > 0) return {data, error: null};
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

  // Coupons
  async getCoupons() {
    const stored = localStorage.getItem('BELA_COUPONS');
    const parsed = stored ? JSON.parse(stored) : INITIAL_COUPONS;
    if (!stored) localStorage.setItem('BELA_COUPONS', JSON.stringify(INITIAL_COUPONS));
    return {data: parsed, error: null};
  },

  async addCoupon(coupon: any) {
    const newCoup = {...coupon, id: `coup-${Date.now()}`};
    const stored = localStorage.getItem('BELA_COUPONS');
    const list = stored ? JSON.parse(stored) : INITIAL_COUPONS;
    const updated = [newCoup, ...list];
    localStorage.setItem('BELA_COUPONS', JSON.stringify(updated));
    return {data: [newCoup], error: null};
  },

  async updateCoupon(id: string, updates: any) {
    const stored = localStorage.getItem('BELA_COUPONS');
    const list = stored ? JSON.parse(stored) : INITIAL_COUPONS;
    const updated = list.map((c: any) => c.id === id ? {...c, ...updates} : c);
    localStorage.setItem('BELA_COUPONS', JSON.stringify(updated));
    return {data: updated, error: null};
  },

  async deleteCoupon(id: string) {
    const stored = localStorage.getItem('BELA_COUPONS');
    const list = stored ? JSON.parse(stored) : INITIAL_COUPONS;
    const updated = list.filter((c: any) => c.id !== id);
    localStorage.setItem('BELA_COUPONS', JSON.stringify(updated));
    return {error: null};
  },

  // Orders
  async getOrders(userId?: string) {
    const stored = localStorage.getItem('BELA_ORDERS');
    const list: any[] = stored ? JSON.parse(stored) : INITIAL_ORDERS;
    if (!stored) localStorage.setItem('BELA_ORDERS', JSON.stringify(INITIAL_ORDERS));
    if (userId) {
      const filtered = list.filter(o => o.client_id === userId || o.client_email === userId);
      return {data: filtered, error: null};
    }
    return {data: list, error: null};
  },

  async addOrder(order: any) {
    const newOrd = {
      ...order,
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString()
    };
    const stored = localStorage.getItem('BELA_ORDERS');
    const list = stored ? JSON.parse(stored) : INITIAL_ORDERS;
    const updated = [newOrd, ...list];
    localStorage.setItem('BELA_ORDERS', JSON.stringify(updated));

    // Automated cash flow transaction entry if payment confirmed
    if (newOrd.payment_status === 'pago') {
      await this.addTransaction({
        description: `Venda Sacola #${newOrd.id} - ${newOrd.client_name}`,
        category: 'Venda de Produtos',
        type: 'entrada',
        amount: newOrd.total_amount,
        date: new Date().toISOString(),
        payment_method: newOrd.payment_method
      });
    }

    return {data: [newOrd], error: null};
  },

  async updateOrderStatus(id: string, statusUpdates: {payment_status?: string; delivery_status?: string}) {
    const stored = localStorage.getItem('BELA_ORDERS');
    const list = stored ? JSON.parse(stored) : INITIAL_ORDERS;
    const updated = list.map((o: any) => o.id === id ? {...o, ...statusUpdates} : o);
    localStorage.setItem('BELA_ORDERS', JSON.stringify(updated));
    return {data: updated, error: null};
  },

  // Banners & 9:16 Video Stories
  async getBanners() {
    const stored = localStorage.getItem('BELA_BANNERS');
    const list = stored ? JSON.parse(stored) : INITIAL_BANNERS;
    if (!stored) localStorage.setItem('BELA_BANNERS', JSON.stringify(INITIAL_BANNERS));
    return {data: list, error: null};
  },

  async addBanner(banner: any) {
    const newBan = {...banner, id: `ban-${Date.now()}`};
    const stored = localStorage.getItem('BELA_BANNERS');
    const list = stored ? JSON.parse(stored) : INITIAL_BANNERS;
    const updated = [newBan, ...list];
    localStorage.setItem('BELA_BANNERS', JSON.stringify(updated));
    return {data: [newBan], error: null};
  },

  async deleteBanner(id: string) {
    const stored = localStorage.getItem('BELA_BANNERS');
    const list = stored ? JSON.parse(stored) : INITIAL_BANNERS;
    const updated = list.filter((b: any) => b.id !== id);
    localStorage.setItem('BELA_BANNERS', JSON.stringify(updated));
    return {error: null};
  },

  async getVideos916() {
    const stored = localStorage.getItem('BELA_VIDEOS');
    const list = stored ? JSON.parse(stored) : INITIAL_VIDEOS;
    if (!stored) localStorage.setItem('BELA_VIDEOS', JSON.stringify(INITIAL_VIDEOS));
    return {data: list, error: null};
  },

  async addVideo916(video: any) {
    const newVid = {...video, id: `vid-${Date.now()}`};
    const stored = localStorage.getItem('BELA_VIDEOS');
    const list = stored ? JSON.parse(stored) : INITIAL_VIDEOS;
    const updated = [newVid, ...list];
    localStorage.setItem('BELA_VIDEOS', JSON.stringify(updated));
    return {data: [newVid], error: null};
  },

  async deleteVideo916(id: string) {
    const stored = localStorage.getItem('BELA_VIDEOS');
    const list = stored ? JSON.parse(stored) : INITIAL_VIDEOS;
    const updated = list.filter((v: any) => v.id !== id);
    localStorage.setItem('BELA_VIDEOS', JSON.stringify(updated));
    return {error: null};
  },

  // Direct Messages between Client & Professional
  async getDirectMessages(senderId: string, receiverId: string) {
    const key = `BELA_CHAT_MSGS`;
    const stored = localStorage.getItem(key);
    const allMsgs = stored ? JSON.parse(stored) : [
      {
        id: 'msg-1',
        sender_id: 'prof-1',
        sender_name: 'Carla Silva',
        receiver_id: senderId,
        content: 'Olá! Sou a Carla, sua cabeleireira no Salão Bela Mulher. Como posso ajudar você hoje?',
        timestamp: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    return {data: allMsgs, error: null};
  },

  async sendDirectMessage(msg: any) {
    const key = `BELA_CHAT_MSGS`;
    const newMsg = {
      ...msg,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    const stored = localStorage.getItem(key);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [...list, newMsg];
    localStorage.setItem(key, JSON.stringify(updated));
    return {data: [newMsg], error: null};
  },

  // Connection Check
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
