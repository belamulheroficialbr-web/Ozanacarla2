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
    date: new Date(Date.now() - 172800000).toISOString(),
    unit_cost: 15
  },
  {
    id: 'mov-2',
    product_id: 'prod-2',
    product_name: 'Esmalte Gel Ouro Bela Mulher',
    type: 'saida',
    quantity: 2,
    reason: 'Uso em Procedimento no Salão',
    date: new Date(Date.now() - 86400000).toISOString(),
    unit_cost: 12
  },
  {
    id: 'mov-3',
    product_id: 'prod-2',
    product_name: 'Esmalte Gel Ouro Bela Mulher',
    type: 'perda',
    quantity: 1,
    reason: 'Frasco quebrado durante transporte interno',
    date: new Date(Date.now() - 43200000).toISOString(),
    unit_cost: 12
  },
  {
    id: 'mov-4',
    product_id: 'prod-3',
    product_name: 'Óleo Reparador de Pontas 60ml',
    type: 'ajuste',
    quantity: 1,
    reason: 'Ajuste de inventário físico (+1 unidade encontrada)',
    date: new Date(Date.now() - 21600000).toISOString(),
    unit_cost: 25
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

const INITIAL_NOTIFICATIONS: any[] = [
  {
    id: 'notif-1',
    user_id: 'system',
    title: 'Bem-vinda ao Bela Mulher!',
    message: 'Estamos felizes em ter você aqui. Explore nossos serviços e produtos exclusivos.',
    type: 'system',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

export const dataService = {
  // 1. Profiles & Cadastro
  async getProfiles(roleFilter?: string) {
    try {
      let query = supabase.from('profiles').select('*');
      if (roleFilter) query = query.eq('role', roleFilter);
      const res = await query;
      if (!res.error && res.data && res.data.length > 0) return res;
    } catch {}

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
      if (!res.error && res.data) return res;
    } catch (err: any) {}

    const stored = localStorage.getItem(`BELA_PROFILE_${userId}`);
    if (stored) return {data: JSON.parse(stored), error: null};
    return {data: null, error: null};
  },

  async updateProfile(userId: string, profileData: any) {
    // Strip role field to prevent self role-escalation
    const safeData = {...profileData};
    delete safeData.role;

    try {
      // O banco de dados agora possui um gatilho que impede a alteração de role por usuários comuns.
      // Removemos explicitamente para evitar erros de validação no cliente.
      const res = await supabase.from('profiles').update(safeData).eq('id', userId).select('*');
      if (!res.error && res.data && res.data.length > 0) return res;
    } catch {}

    const stored = localStorage.getItem(`BELA_PROFILE_${userId}`);
    const existing = stored ? JSON.parse(stored) : {};
    const updated = {...existing, ...safeData, id: userId};
    localStorage.setItem(`BELA_PROFILE_${userId}`, JSON.stringify(updated));
    return {data: [updated], error: null};
  },

  // 2. Ficha de Saúde, Alergias & Preferências (Proteção de Acesso Vinculado)
  async getClientMedicalProfile(userId: string, requester?: { id: string; role: string }) {
    // Check authorization if requester info provided
    if (requester) {
      const isSelf = requester.id === userId;
      const isAdmin = requester.role === 'admin';
      
      if (!isSelf && !isAdmin && requester.role === 'professional') {
        // Professional can access ONLY if an appointment exists linking this client to this professional
        const appRes = await this.getAppointments(requester.id, 'professional');
        const hasLinkedAppointment = appRes.data?.some(
          (a: any) => a.client_id === userId || a.client_name?.toLowerCase().includes(userId.toLowerCase())
        );

        if (!hasLinkedAppointment) {
          return {
            allergies: 'Acesso Restrito: Ficha de saúde visível somente para profissionais com atendimento agendado para esta cliente.',
            sensitivities: 'Acesso Restrito',
            reactive_products: 'Acesso Restrito',
            care_preferences: 'Acesso Restrito',
            favorite_professionals: []
          };
        }
      } else if (!isSelf && !isAdmin) {
        return {
          allergies: 'Acesso Negado: Apenas a própria cliente ou profissionais com atendimento podem visualizar estes dados.',
          sensitivities: 'Bloqueado',
          reactive_products: 'Bloqueado',
          care_preferences: 'Bloqueado',
          favorite_professionals: []
        };
      }
    }

    try {
      // A política RLS agora protege automaticamente estas colunas.
      // Se o usuário não tiver permissão, os campos retornarão nulos.
      const {data, error} = await supabase
        .from('profiles')
        .select('allergies, sensitivities, reactive_products, care_preferences, favorite_professionals')
        .eq('id', userId)
        .maybeSingle();
      
      if (!error && data) {
        // Verifica se os dados são válidos (não nulos pela política RLS)
        if (data.allergies !== null || data.care_preferences !== null) {
           return data;
        }
      }
    } catch {}

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
    try {
      const {error} = await supabase.from('profiles').update({
        allergies: data.allergies,
        sensitivities: data.sensitivities,
        reactive_products: data.reactive_products,
        care_preferences: data.care_preferences,
        favorite_professionals: data.favorite_professionals
      }).eq('id', userId);
      if (!error) return {success: true};
    } catch {}

    localStorage.setItem(`BELA_MEDICAL_${userId}`, JSON.stringify(data));
    return {success: true};
  },

  // 3. Pedidos & Sacola de Compras
  async getOrders(userId?: string) {
    try {
      let query = supabase.from('orders').select('*').order('created_at', {ascending: false});
      if (userId) query = query.or(`client_id.eq.${userId},client_email.eq.${userId}`);
      const {data, error} = await query;
      if (!error && data && data.length > 0) return {data, error: null};
    } catch {}

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
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    const newOrd = {
      ...order,
      client_id: userId, // Enforce authenticated user ID
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      created_at: new Date().toISOString()
    };

    try {
      const {data, error} = await supabase.from('orders').insert([newOrd]).select('*');
      if (!error && data) {
        if (newOrd.payment_status === 'pago') {
          await this.processOrderFinancials(newOrd);
        }

        // Automatic Stock Deduction (prevents duplicates via order.id)
        await this.processOrderStockDeduction(newOrd);

        // Trigger Notification
        await this.addNotification({
          user_id: userId,
          title: 'Pedido Recebido!',
          message: `Seu pedido #${newOrd.id} foi recebido e está em processamento.`,
          type: 'order',
          metadata: { order_id: newOrd.id }
        });

        // Notify Admins
        const {data: admins} = await this.getProfiles('admin');
        if (admins) {
          for (const admin of admins) {
            await this.addNotification({
              user_id: admin.id,
              title: 'Novo Pedido na Sacola',
              message: `A cliente ${newOrd.client_name} realizou o pedido #${newOrd.id}.`,
              type: 'order',
              metadata: { order_id: newOrd.id }
            });
          }
        }

        return {data, error: null};
      }
    } catch {}

    const stored = localStorage.getItem('BELA_ORDERS');
    const list = stored ? JSON.parse(stored) : INITIAL_ORDERS;
    const updated = [newOrd, ...list];
    localStorage.setItem('BELA_ORDERS', JSON.stringify(updated));

    if (newOrd.payment_status === 'pago') {
      await this.processOrderFinancials(newOrd);
    }

    // Automatic Stock Deduction (fallback)
    await this.processOrderStockDeduction(newOrd);

    // Trigger Notification (Local Fallback)
    this.addNotification({
      user_id: userId || 'guest',
      title: 'Pedido Recebido!',
      message: `Seu pedido #${newOrd.id} foi recebido e está em processamento.`,
      type: 'order',
      metadata: { order_id: newOrd.id }
    });

    return {data: [newOrd], error: null};
  },

  async updateOrderStatus(id: string, statusUpdates: {payment_status?: string; delivery_status?: string}, requesterRole?: string) {
    // Only allow payment_status/delivery_status updates. 
    // Stripping total_amount or other sensitive fields if they were passed.
    const safeUpdates: any = {};
    if (statusUpdates.payment_status) safeUpdates.payment_status = statusUpdates.payment_status;
    if (statusUpdates.delivery_status) safeUpdates.delivery_status = statusUpdates.delivery_status;

    try {
      const {data, error} = await supabase.from('orders').update(safeUpdates).eq('id', id).select('*');
      if (!error && data) {
        // Notify Client about status change
        const order = data[0];
        
        // Record transaction if paid
        if (safeUpdates.payment_status === 'pago') {
          await this.processOrderFinancials(order);
          await this.processOrderStockDeduction(order);
        }

        await this.addNotification({
          user_id: order.client_id,
          title: 'Status do Pedido Atualizado',
          message: `Seu pedido #${id} mudou para: ${safeUpdates.delivery_status || safeUpdates.payment_status}.`,
          type: 'order',
          metadata: { order_id: id }
        });
        return {data, error: null};
      }
    } catch {}

    const stored = localStorage.getItem('BELA_ORDERS');
    const list = stored ? JSON.parse(stored) : INITIAL_ORDERS;
    const updated = list.map((o: any) => o.id === id ? {...o, ...safeUpdates} : o);
    localStorage.setItem('BELA_ORDERS', JSON.stringify(updated));
    return {data: updated, error: null};
  },

  // 4. Cupons de Desconto
  async getCoupons() {
    try {
      const {data, error} = await supabase.from('coupons').select('*');
      if (!error && data && data.length > 0) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_COUPONS');
    const parsed = stored ? JSON.parse(stored) : INITIAL_COUPONS;
    if (!stored) localStorage.setItem('BELA_COUPONS', JSON.stringify(INITIAL_COUPONS));
    return {data: parsed, error: null};
  },

  async addCoupon(coupon: any) {
    const newCoup = {...coupon, id: `coup-${Date.now()}`};
    try {
      const {data, error} = await supabase.from('coupons').insert([newCoup]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_COUPONS');
    const list = stored ? JSON.parse(stored) : INITIAL_COUPONS;
    const updated = [newCoup, ...list];
    localStorage.setItem('BELA_COUPONS', JSON.stringify(updated));
    return {data: [newCoup], error: null};
  },

  async updateCoupon(id: string, updates: any) {
    try {
      const {data, error} = await supabase.from('coupons').update(updates).eq('id', id).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_COUPONS');
    const list = stored ? JSON.parse(stored) : INITIAL_COUPONS;
    const updated = list.map((c: any) => c.id === id ? {...c, ...updates} : c);
    localStorage.setItem('BELA_COUPONS', JSON.stringify(updated));
    return {data: updated, error: null};
  },

  async deleteCoupon(id: string) {
    try {
      const {error} = await supabase.from('coupons').delete().eq('id', id);
      if (!error) return {error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_COUPONS');
    const list = stored ? JSON.parse(stored) : INITIAL_COUPONS;
    const updated = list.filter((c: any) => c.id !== id);
    localStorage.setItem('BELA_COUPONS', JSON.stringify(updated));
    return {error: null};
  },

  // 5. Banners & Vídeos 9:16
  async getBanners() {
    try {
      const {data, error} = await supabase.from('banners').select('*').eq('is_active', true);
      if (!error && data && data.length > 0) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_BANNERS');
    const list = stored ? JSON.parse(stored) : INITIAL_BANNERS;
    if (!stored) localStorage.setItem('BELA_BANNERS', JSON.stringify(INITIAL_BANNERS));
    return {data: list, error: null};
  },

  async addBanner(banner: any) {
    const newBan = {...banner, id: `ban-${Date.now()}`};
    try {
      const {data, error} = await supabase.from('banners').insert([newBan]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_BANNERS');
    const list = stored ? JSON.parse(stored) : INITIAL_BANNERS;
    const updated = [newBan, ...list];
    localStorage.setItem('BELA_BANNERS', JSON.stringify(updated));
    return {data: [newBan], error: null};
  },

  async deleteBanner(id: string) {
    try {
      const {error} = await supabase.from('banners').delete().eq('id', id);
      if (!error) return {error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_BANNERS');
    const list = stored ? JSON.parse(stored) : INITIAL_BANNERS;
    const updated = list.filter((b: any) => b.id !== id);
    localStorage.setItem('BELA_BANNERS', JSON.stringify(updated));
    return {error: null};
  },

  async getVideos916() {
    try {
      const {data, error} = await supabase.from('videos_916').select('*');
      if (!error && data && data.length > 0) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_VIDEOS');
    const list = stored ? JSON.parse(stored) : INITIAL_VIDEOS;
    if (!stored) localStorage.setItem('BELA_VIDEOS', JSON.stringify(INITIAL_VIDEOS));
    return {data: list, error: null};
  },

  async addVideo916(video: any) {
    const newVid = {...video, id: `vid-${Date.now()}`};
    try {
      const {data, error} = await supabase.from('videos_916').insert([newVid]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_VIDEOS');
    const list = stored ? JSON.parse(stored) : INITIAL_VIDEOS;
    const updated = [newVid, ...list];
    localStorage.setItem('BELA_VIDEOS', JSON.stringify(updated));
    return {data: [newVid], error: null};
  },

  async deleteVideo916(id: string) {
    try {
      const {error} = await supabase.from('videos_916').delete().eq('id', id);
      if (!error) return {error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_VIDEOS');
    const list = stored ? JSON.parse(stored) : INITIAL_VIDEOS;
    const updated = list.filter((v: any) => v.id !== id);
    localStorage.setItem('BELA_VIDEOS', JSON.stringify(updated));
    return {error: null};
  },

  // 6. Mensagens Cliente <-> Profissional (Tabelas 'messages' e 'conversations')
  async getDirectMessages(senderId: string, receiverId: string) {
    try {
      const {data, error} = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${senderId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${senderId})`)
        .order('timestamp', {ascending: true});
      if (!error && data && data.length > 0) return {data, error: null};
    } catch {}

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
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    const newMsg = {
      ...msg,
      sender_id: userId || msg.sender_id, // Enforce session ID if present
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    try {
      const {data, error} = await supabase.from('messages').insert([newMsg]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const key = `BELA_CHAT_MSGS`;
    const stored = localStorage.getItem(key);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [...list, newMsg];
    localStorage.setItem(key, JSON.stringify(updated));
    return {data: [newMsg], error: null};
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
      if (!res.error && res.data) return res;
    } catch {}
    return {data: [{...service, id: `serv-${Date.now()}`}], error: null};
  },

  async updateService(id: string, updates: any) {
    try {
      const res = await supabase.from('services').update(updates).eq('id', id).select('*');
      if (!res.error && res.data) return res;
    } catch {}
    return {data: [{...updates, id}], error: null};
  },

  async deleteService(id: string) {
    try {
      const res = await supabase.from('services').delete().eq('id', id);
      if (!res.error) return res;
    } catch {}
    return {error: null};
  },

  // Appointments
  async getAppointments(userId: string, role: string) {
    try {
      let query = supabase.from('appointments').select('*');
      if (role === 'client') query = query.eq('client_id', userId);
      else if (role === 'professional') query = query.eq('professional_id', userId);
      const res = await query;
      if (!res.error && res.data && res.data.length > 0) return res;
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
      const res = await supabase.from('appointments').insert([appointment]).select('*, services(name), professional:profiles!professional_id(name)').single();
      if (!res.error && res.data) {
        // Notify Client
        await this.addNotification({
          user_id: appointment.client_id,
          title: 'Solicitação de Agendamento',
          message: `Sua solicitação para ${res.data.services?.name || 'Serviço'} foi enviada. Aguarde confirmação.`,
          type: 'appointment',
          metadata: { appointment_id: res.data.id }
        });

        // Notify Admin
        const {data: admins} = await this.getProfiles('admin');
        if (admins) {
          for (const admin of admins) {
            await this.addNotification({
              user_id: admin.id,
              title: 'Novo Agendamento Pendente',
              message: `Uma cliente solicitou ${res.data.services?.name || 'Serviço'} para ${new Date(appointment.start_time).toLocaleString()}.`,
              type: 'appointment',
              metadata: { appointment_id: res.data.id }
            });
          }
        }
        return res;
      }
    } catch {}

    const stored = localStorage.getItem('BELA_APPOINTMENTS');
    const list = stored ? JSON.parse(stored) : [];
    const updated = [newApp, ...list];
    localStorage.setItem('BELA_APPOINTMENTS', JSON.stringify(updated));
    return {data: [newApp], error: null};
  },

  async updateAppointment(id: string, updates: any) {
    try {
      const res = await supabase.from('appointments').update(updates).eq('id', id).select('*');
      if (!res.error && res.data) return res;
    } catch {}
    return {data: [{...updates, id}], error: null};
  },

  async deleteAppointment(id: string) {
    try {
      const res = await supabase.from('appointments').delete().eq('id', id);
      if (!res.error) return res;
    } catch {}
    return {error: null};
  },

  async updateAppointmentStatus(id: string, status: string, requesterRole?: string) {
    try {
      const res = await supabase.from('appointments').update({status}).eq('id', id).select('*, services(name)').single();
      if (!res.error && res.data) {
        // Notify Client
        const statusMap: any = {
          'confirmed': 'Confirmado!',
          'cancelled': 'Cancelado',
          'concluded': 'Concluído'
        };
        await this.addNotification({
          user_id: res.data.client_id,
          title: `Agendamento ${statusMap[status] || status}`,
          message: `Seu horário para ${res.data.services?.name || 'Serviço'} foi ${statusMap[status]?.toLowerCase() || status}.`,
          type: 'appointment',
          metadata: { appointment_id: id }
        });

        // LOYALTY INTEGRATION: Grant points if concluded
        if (status === 'concluded') {
          await this.grantLoyaltyPointsFromAppointment(res.data);
          
          // FINANCE INTEGRATION: Record revenue and calculate commission
          await this.processConclusionFinancials(res.data);
        }

        return res;
      }
    } catch {}

    const stored = localStorage.getItem('BELA_APPOINTMENTS');
    const list = stored ? JSON.parse(stored) : [];
    const updated = list.map((a: any) => a.id === id ? {...a, status} : a);
    localStorage.setItem('BELA_APPOINTMENTS', JSON.stringify(updated));
    return {error: null};
  },

  // Reatribuição de Profissional (Permitida estritamente para Administradora)
  async reassignAppointmentProfessional(appointmentId: string, newProfessionalId: string, requesterRole: string) {
    if (requesterRole !== 'admin') {
      return { error: 'Acesso Negado: Apenas a administração pode alterar o profissional responsável por um atendimento.' };
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ professional_id: newProfessionalId })
        .eq('id', appointmentId)
        .select('*');
      if (!error && data) return { data, error: null };
    } catch {}

    const stored = localStorage.getItem('BELA_APPOINTMENTS');
    const list = stored ? JSON.parse(stored) : [];
    const updated = list.map((a: any) => a.id === appointmentId ? { ...a, professional_id: newProfessionalId } : a);
    localStorage.setItem('BELA_APPOINTMENTS', JSON.stringify(updated));
    return { data: updated, error: null };
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
    const newTx = {
      ...transaction,
      id: `tx-${Date.now()}`,
      status: transaction.status || 'pago' // Default to paid
    };
    try {
      const {data, error} = await supabase.from('transactions').insert([newTx]).select('*');
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
    const newMov = {
      ...movement,
      id: movement.id || `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: movement.date || new Date().toISOString()
    };
    try {
      const {data, error} = await supabase.from('stock_movements').insert([newMov]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_STOCK_MOVEMENTS');
    const list = stored ? JSON.parse(stored) : INITIAL_MOVEMENTS;
    const updated = [newMov, ...list];
    localStorage.setItem('BELA_STOCK_MOVEMENTS', JSON.stringify(updated));
    return {data: [newMov], error: null};
  },

  // 7. Notificações
  async getNotifications(userId?: string) {
    try {
      let query = supabase.from('notifications').select('*').order('created_at', {ascending: false});
      if (userId) query = query.eq('user_id', userId);
      const {data, error} = await query;
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_NOTIFICATIONS');
    const list = stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    if (userId) {
      const filtered = list.filter((n: any) => n.user_id === userId || n.user_id === 'system' || n.user_id === 'all');
      return {data: filtered, error: null};
    }
    return {data: list, error: null};
  },

  async addNotification(notification: any) {
    const newNotif = {
      ...notification,
      id: `notif-${Date.now()}`,
      is_read: false,
      created_at: new Date().toISOString()
    };

    try {
      const {data, error} = await supabase.from('notifications').insert([newNotif]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_NOTIFICATIONS');
    const list = stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    const updated = [newNotif, ...list];
    localStorage.setItem('BELA_NOTIFICATIONS', JSON.stringify(updated));
    return {data: [newNotif], error: null};
  },

  async markNotificationAsRead(id: string) {
    try {
      const {error} = await supabase.from('notifications').update({is_read: true}).eq('id', id);
      if (!error) return {error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_NOTIFICATIONS');
    const list = stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    const updated = list.map((n: any) => n.id === id ? {...n, is_read: true} : n);
    localStorage.setItem('BELA_NOTIFICATIONS', JSON.stringify(updated));
    return {error: null};
  },

  async markAllNotificationsAsRead(userId: string) {
    try {
      const {error} = await supabase.from('notifications').update({is_read: true}).eq('user_id', userId).eq('is_read', false);
      if (!error) return {error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_NOTIFICATIONS');
    const list = stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    const updated = list.map((n: any) => (n.user_id === userId || n.user_id === 'all') ? {...n, is_read: true} : n);
    localStorage.setItem('BELA_NOTIFICATIONS', JSON.stringify(updated));
    return {error: null};
  },

  async checkAndSendReminders() {
    try {
      // 1. Get appointments in the next 24h-26h (to avoid missing window)
      const now = new Date();
      const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tomorrowEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000);

      const { data: upcoming } = await supabase
        .from('appointments')
        .select('*, services(name), profiles:client_id(email)')
        .gte('start_time', tomorrowStart.toISOString())
        .lte('start_time', tomorrowEnd.toISOString())
        .eq('status', 'confirmed');

      if (!upcoming) return;

      for (const app of upcoming) {
        // Check if reminder already sent (metadata.reminder_sent = true)
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', app.client_id)
          .eq('type', 'reminder')
          .contains('metadata', { appointment_id: app.id });

        if (!existing || existing.length === 0) {
          await this.addNotification({
            user_id: app.client_id,
            title: 'Lembrete de Agendamento',
            message: `Olá! Seu horário para ${app.services?.name || 'Serviço'} é amanhã às ${new Date(app.start_time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}.`,
            type: 'reminder',
            metadata: { 
              appointment_id: app.id,
              reminder_sent: true,
              email_to: app.profiles?.email 
            }
          });
          
          console.log(`Lembrete enviado para cliente ${app.client_id}`);
        }
      }
    } catch (err) {
      console.error('Erro ao processar lembretes:', err);
    }
  },

  // 8. Programa de Fidelidade
  async getLoyaltyRewards() {
    try {
      const {data, error} = await supabase.from('loyalty_rewards').select('*').eq('is_active', true).order('points_cost', {ascending: true});
      if (!error && data) return {data, error: null};
    } catch {}
    return {data: [], error: null};
  },

  async getLoyaltyTransactions(userId?: string) {
    try {
      let query = supabase.from('loyalty_transactions').select('*').order('created_at', {ascending: false});
      if (userId) query = query.eq('user_id', userId);
      const {data, error} = await query;
      if (!error && data) return {data, error: null};
    } catch {}
    return {data: [], error: null};
  },

  async getLoyaltyConfig() {
    try {
      const {data, error} = await supabase.from('loyalty_config').select('*').eq('id', 'current').single();
      if (!error && data) return {data, error: null};
    } catch {}
    return {data: {points_per_real: 1.0, min_points_to_redeem: 100}, error: null};
  },

  async updateLoyaltyConfig(updates: any) {
    try {
      const {data, error} = await supabase.from('loyalty_config').update(updates).eq('id', 'current').select('*');
      if (!error && data) return {data, error: null};
    } catch {}
    return {error: 'Erro ao atualizar config'};
  },

  async grantLoyaltyPointsFromAppointment(appointment: any) {
    try {
      // 1. Check if already granted
      const {data: existing} = await supabase
        .from('loyalty_transactions')
        .select('id')
        .eq('related_id', appointment.id)
        .eq('type', 'earn')
        .maybeSingle();

      if (existing) return; // Prevent double points

      // 2. Get config to calculate amount
      const {data: config} = await this.getLoyaltyConfig();
      const ratio = Number(config?.points_per_real || 1.0);
      
      // 3. Get service price to calculate points
      const {data: service} = await supabase.from('services').select('price').eq('id', appointment.service_id).single();
      const price = Number(service?.price || 0);
      const points = Math.floor(price * ratio);

      if (points <= 0) return;

      // 4. Record transaction
      await this.addLoyaltyTransaction({
        user_id: appointment.client_id,
        amount: points,
        type: 'earn',
        description: `Pontos ganhos: ${appointment.services?.name || 'Atendimento'}`,
        related_id: appointment.id
      });

      // 5. Notify client
      await this.addNotification({
        user_id: appointment.client_id,
        title: 'Você ganhou pontos!',
        message: `Parabéns! Você recebeu ${points} pontos pelo seu atendimento de hoje.`,
        type: 'system'
      });

    } catch (err) {
      console.error('Erro ao conceder pontos:', err);
    }
  },

  async addLoyaltyTransaction(tx: any) {
    try {
      const {data, error} = await supabase.from('loyalty_transactions').insert([tx]).select('*');
      if (!error && data) return {data, error: null};
    } catch (err) {}
    return {error: 'Falha ao registrar pontos'};
  },

  async redeemLoyaltyReward(userId: string, reward: any) {
    try {
      // 1. Verify balance
      const {data: profile} = await this.getProfile(userId);
      const balance = Number(profile?.loyalty_points || 0);
      
      if (balance < reward.points_cost) {
        return {error: 'Saldo de pontos insuficiente.'};
      }

      // 2. Register redemption transaction (Negative amount)
      const {data, error} = await supabase.from('loyalty_transactions').insert([{
        user_id: userId,
        amount: -reward.points_cost,
        type: 'redeem',
        description: `Resgate: ${reward.name}`,
        related_id: reward.id
      }]).select('*');

      if (!error && data) {
        // 3. Notify
        await this.addNotification({
          user_id: userId,
          title: 'Recompensa Resgatada!',
          message: `Você trocou ${reward.points_cost} pontos por "${reward.name}". Apresente seu código no salão.`,
          type: 'system'
        });

        return {data, error: null};
      }
      return {error: error?.message || 'Falha no resgate'};
    } catch (err: any) {
      return {error: err.message};
    }
  },

  async addLoyaltyReward(reward: any) {
    try {
      const {data, error} = await supabase.from('loyalty_rewards').insert([reward]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}
    return {error: 'Erro ao criar recompensa'};
  },

  async deleteLoyaltyReward(id: string) {
    try {
      const {error} = await supabase.from('loyalty_rewards').update({is_active: false}).eq('id', id);
      if (!error) return {error: null};
    } catch {}
    return {error: 'Erro ao desativar recompensa'};
  },


  // 9. CRM Inteligente
  async getCRMClientMetrics() {
    try {
      // 1. Get all clients
      const {data: clients} = await this.getProfiles('client');
      if (!clients) return {data: [], error: 'Nenhum cliente encontrado'};

      // 2. Get all appointments and orders to calculate metrics
      const {data: allAppointments} = await supabase.from('appointments').select('*').eq('status', 'concluded');
      const {data: allOrders} = await supabase.from('orders').select('*');

      const now = new Date();

      const metrics = clients.map(client => {
        const clientApps = allAppointments?.filter(a => a.client_id === client.id) || [];
        const clientOrders = allOrders?.filter(o => o.client_id === client.id) || [];

        // Faturamento total (Serviços + Produtos)
        const serviceRev = clientApps.reduce((sum, a) => sum + (a.price || 0), 0);
        const orderRev = clientOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const totalRevenue = serviceRev + orderRev;

        // Datas
        const lastApp = clientApps.length > 0 
          ? new Date(Math.max(...clientApps.map(a => new Date(a.start_time).getTime())))
          : null;
        
        const daysSinceLastReturn = lastApp 
          ? Math.floor((now.getTime() - lastApp.getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        // Segmentação
        let segment = 'new';
        if (clientApps.length > 5 || totalRevenue > 1000) segment = 'frequent';
        if (daysSinceLastReturn > 90) segment = 'inactive_90';
        else if (daysSinceLastReturn > 60) segment = 'inactive_60';
        else if (daysSinceLastReturn > 30) segment = 'inactive_30';
        else if (client.birth_date && new Date(client.birth_date).getMonth() === now.getMonth()) segment = 'birthday';
        else if (clientApps.length === 1) segment = 'new';

        return {
          ...client,
          total_revenue: totalRevenue,
          appointments_count: clientApps.length,
          orders_count: clientOrders.length,
          last_return: lastApp?.toISOString(),
          days_inactive: daysSinceLastReturn,
          segment,
          average_ticket: (clientApps.length + clientOrders.length) > 0 
            ? totalRevenue / (clientApps.length + clientOrders.length) 
            : 0
        };
      });

      return {data: metrics, error: null};
    } catch (err) {
      console.error('Erro CRM:', err);
      return {data: [], error: 'Falha ao processar métricas CRM'};
    }
  },

  async getCRMCampaigns() {
    try {
      const {data, error} = await supabase.from('crm_campaigns').select('*').order('created_at', {ascending: false});
      if (!error && data) return {data, error: null};
    } catch {}
    return {data: [], error: null};
  },

  async createCRMCampaign(campaign: any) {
    try {
      const {data, error} = await supabase.from('crm_campaigns').insert([campaign]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}
    return {error: 'Erro ao criar campanha'};
  },

  async sendCRMCampaign(campaignId: string, userIds: string[]) {
    try {
      const {data: campaign} = await supabase.from('crm_campaigns').select('*').eq('id', campaignId).single();
      if (!campaign) return {error: 'Campanha não encontrada'};

      const logs = userIds.map(uid => ({
        campaign_id: campaignId,
        user_id: uid,
        status: 'delivered'
      }));

      // 1. Record Logs
      await supabase.from('crm_campaign_logs').insert(logs);

      // 2. Trigger Notifications for each user
      for (const uid of userIds) {
        await this.addNotification({
          user_id: uid,
          title: campaign.name,
          message: campaign.message_template,
          type: 'promo',
          metadata: { campaign_id: campaignId }
        });
      }

      // 3. Update Campaign status
      await supabase.from('crm_campaigns').update({status: 'sent', sent_at: new Date().toISOString()}).eq('id', campaignId);

      return {success: true};
    } catch (err) {
      return {error: 'Falha ao disparar campanha'};
    }
  },

  // 10. Gestão Financeira Avançada
  async processConclusionFinancials(appointment: any) {
    try {
      // 1. Record Revenue Transaction (if not already recorded)
      const {data: existingTx} = await supabase
        .from('transactions')
        .select('id')
        .eq('related_id', appointment.id)
        .eq('related_type', 'appointment')
        .maybeSingle();

      if (!existingTx) {
        // Get service price
        const {data: service} = await supabase.from('services').select('price').eq('id', appointment.service_id).single();
        const amount = Number(service?.price || 0);

        await this.addTransaction({
          description: `Atendimento: ${appointment.services?.name || 'Serviço'} - Cliente #${appointment.client_id}`,
          category: 'Serviços',
          type: 'entrada',
          amount,
          date: new Date().toISOString(),
          payment_method: 'A definir',
          status: 'pago',
          related_id: appointment.id,
          related_type: 'appointment'
        });

        // 2. Calculate and Record Commission
        const {data: prof} = await this.getProfile(appointment.professional_id);
        const rate = Number(prof?.commission_rate || 0);
        
        if (rate > 0) {
          const commissionAmount = (amount * rate) / 100;
          await supabase.from('commissions').insert([{
            professional_id: appointment.professional_id,
            appointment_id: appointment.id,
            service_amount: amount,
            commission_rate: rate,
            commission_amount: commissionAmount,
            status: 'pending'
          }]);
        }
      }
    } catch (err) {
      console.error('Erro ao processar financeiro:', err);
    }
  },

  async processOrderFinancials(order: any) {
    try {
      const {data: existing} = await supabase
        .from('transactions')
        .select('id')
        .eq('related_id', order.id)
        .eq('related_type', 'order')
        .maybeSingle();

      if (!existing) {
        await this.addTransaction({
          description: `Venda Sacola #${order.id} - ${order.client_name}`,
          category: 'Venda de Produtos',
          type: 'entrada',
          amount: order.total_amount,
          date: new Date().toISOString(),
          payment_method: order.payment_method || 'A definir',
          status: 'pago',
          related_id: order.id,
          related_type: 'order'
        });
      }
    } catch (err) {
      console.error('Erro ao processar financeiro do pedido:', err);
    }
  },

  async processOrderStockDeduction(order: any) {
    try {
      if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) return;

      // Prevent duplicate deduction: check if movement already recorded for this order
      const {data: existingMovs} = await supabase
        .from('stock_movements')
        .select('id')
        .eq('related_id', order.id);

      if (existingMovs && existingMovs.length > 0) {
        return; // Already processed in Supabase
      }

      const stored = localStorage.getItem('BELA_STOCK_MOVEMENTS');
      if (stored) {
        const list = JSON.parse(stored);
        if (list.some((m: any) => m.related_id === order.id)) {
          return; // Already processed in local storage
        }
      }

      // Fetch products
      const {data: prods} = await this.getProducts();
      const currentProducts = prods || [];

      for (const item of order.items) {
        const prod = currentProducts.find((p: any) => p.id === item.id || p.name?.toLowerCase() === item.name?.toLowerCase());
        const qtyToDeduct = Number(item.quantity) || 1;
        const currentQty = prod ? Number(prod.quantity) : 0;
        const newQty = Math.max(0, currentQty - qtyToDeduct);

        // Record stock movement (type: 'saida')
        await this.recordStockMovement({
          product_id: prod?.id || item.id,
          product_name: prod?.name || item.name,
          type: 'saida',
          quantity: qtyToDeduct,
          reason: `Venda Pedido #${order.id} - ${order.client_name || 'Cliente'}`,
          related_id: order.id,
          unit_cost: prod?.cost_price || 0,
          total_cost: (prod?.cost_price || 0) * qtyToDeduct,
          date: new Date().toISOString()
        });

        // Update product quantity
        if (prod?.id) {
          await this.updateProduct(prod.id, {
            quantity: newQty,
            updated_at: new Date().toISOString()
          });

          // Check if low or depleted stock and notify admins
          const minQty = Number(prod.min_quantity) || 5;
          if (newQty <= minQty) {
            const {data: admins} = await this.getProfiles('admin');
            if (admins) {
              for (const admin of admins) {
                await this.addNotification({
                  user_id: admin.id,
                  title: newQty === 0 ? 'Produto Esgotado!' : 'Alerta de Estoque Baixo',
                  message: newQty === 0
                    ? `O produto "${prod.name}" esgotou no estoque após o pedido #${order.id}.`
                    : `O produto "${prod.name}" atingiu o nível crítico de alerta (${newQty} un. restantes).`,
                  type: 'system',
                  metadata: { product_id: prod.id, current_quantity: newQty }
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro ao processar baixa de estoque do pedido:', err);
    }
  },

  async getFinancialMetrics() {
    try {
      const {data: txs} = await this.getTransactions();
      if (!txs) return {data: null, error: 'Sem transações'};

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const metrics = {
        total_revenue: txs.filter((t: any) => t.type === 'entrada').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        total_expenses: txs.filter((t: any) => t.type === 'saida').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        pending_receivables: txs.filter((t: any) => t.type === 'entrada' && t.status === 'pendente').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        pending_payables: txs.filter((t: any) => t.type === 'saida' && t.status === 'pendente').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        daily_revenue: txs.filter((t: any) => t.type === 'entrada' && t.date.startsWith(todayStr)).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0)
      };

      return {data: metrics, error: null};
    } catch (err) {
      return {error: 'Erro ao processar métricas'};
    }
  },

  async getCommissions(professionalId?: string) {
    try {
      let query = supabase.from('commissions').select('*, professional:profiles!professional_id(name), appointment:appointments!appointment_id(start_time, services(name))');
      if (professionalId) query = query.eq('professional_id', professionalId);
      const {data, error} = await query.order('created_at', {ascending: false});
      if (!error && data) return {data, error: null};
    } catch {}
    return {data: [], error: null};
  },

  async payCommission(id: string) {
    try {
      const {data: comm} = await supabase.from('commissions').select('*').eq('id', id).single();
      if (!comm) return {error: 'Não encontrado'};

      // 1. Mark as paid
      const {error} = await supabase.from('commissions').update({
        status: 'paid',
        paid_at: new Date().toISOString()
      }).eq('id', id);

      if (!error) {
        // 2. Record as Expense in Transactions
        await this.addTransaction({
          description: `Pagamento Comissão - Ref: ${comm.appointment_id}`,
          category: 'Comissões',
          type: 'saida',
          amount: comm.commission_amount,
          date: new Date().toISOString(),
          status: 'pago',
          related_id: id,
          related_type: 'commission'
        });
        return {success: true};
      }
    } catch (err) {}
    return {error: 'Falha ao pagar comissão'};
  },

  // Connection Check
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
