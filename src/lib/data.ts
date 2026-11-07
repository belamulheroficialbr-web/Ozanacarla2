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

export const INITIAL_SHOWCASES = [
  {
    id: 'vitrine-principal',
    name: 'Vitrine Principal',
    subtitle: 'Os Mais Queridos Bela Mulher',
    description: 'Nossa seleção exclusiva de produtos profissionais e tratamentos para realçar sua beleza natural.',
    banner_url: '/src/assets/images/carousel_salon_1_1793799835801.jpg',
    thumbnail_url: '/src/assets/images/service_showcase_1_1793799836251.jpg',
    category: 'Geral',
    product_ids: ['prod-1', 'prod-2', 'prod-3'],
    is_active: true,
    is_default: true
  },
  {
    id: 'vitrine-loiras',
    name: 'Loiras & Mechas',
    subtitle: 'Nutrição & Brilho Ouro 24k',
    description: 'Tratamentos profundos e fórmulas avançadas para manter cabelos descoloridos e mechas saudáveis e iluminados.',
    banner_url: '/src/assets/images/service_showcase_2_1793799836229.jpg',
    thumbnail_url: '/src/assets/images/vertical_salon_style_1_1793799836206.jpg',
    category: 'Capilar',
    product_ids: ['prod-1', 'prod-3'],
    is_active: true,
    is_default: false
  },
  {
    id: 'vitrine-unhas',
    name: 'Unhas & Spa Nail Art',
    subtitle: 'Durabilidade & Brilho Acetinado',
    description: 'Esmaltes em gel e cuidados intensivos para unhas elegantes, fortes e de acabamento impecável.',
    banner_url: '/src/assets/images/service_showcase_1_1793799836251.jpg',
    thumbnail_url: '/src/assets/images/service_showcase_1_1793799836251.jpg',
    category: 'Unhas & Esmaltes',
    product_ids: ['prod-2'],
    is_active: true,
    is_default: false
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
      if (userId) {
        if (userId.includes('@')) {
          query = query.eq('client_email', userId);
        } else {
          query = query.eq('client_id', userId);
        }
      }
      const {data, error} = await query;
      if (!error) return {data: data || [], error: null};
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

  async validateOrderStockAndPrices(items: any[]) {
    const errors: string[] = [];
    const updatedItems: any[] = [];

    if (!items || !Array.isArray(items) || items.length === 0) {
      return { valid: false, errors: ['A sacola está vazia.'], updatedItems: [] };
    }

    try {
      const { data: dbProducts } = await this.getProducts();
      const productMap = new Map((dbProducts || []).map((p: any) => [p.id, p]));

      for (const item of items) {
        const prod: any = productMap.get(item.id);
        if (!prod) {
          errors.push(`O produto "${item.name}" não está cadastrado no catálogo.`);
          continue;
        }

        const availableQty = Number(prod.quantity || 0);
        const requestedQty = Number(item.quantity || 1);
        const currentPrice = Number(prod.sale_price || prod.price || item.price || 0);

        if (availableQty < requestedQty) {
          errors.push(
            `Estoque insuficiente para "${item.name}" (disponível: ${availableQty} un., solicitado: ${requestedQty} un.).`
          );
        }

        updatedItems.push({
          ...item,
          price: currentPrice,
          quantity: requestedQty,
          available_quantity: availableQty
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        updatedItems
      };
    } catch (err: any) {
      return {
        valid: false,
        errors: [`Erro ao validar estoque e preços: ${err.message || err}`],
        updatedItems: items
      };
    }
  },

  async addOrder(order: any) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // 1. Revalidação estrita de estoque e preços em tempo real
    const valResult = await this.validateOrderStockAndPrices(order.items || []);
    if (!valResult.valid) {
      return { data: null, error: valResult.errors.join(' ') };
    }
    
    const orderId = order.id || `ord-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrd = {
      ...order,
      items: valResult.updatedItems,
      client_id: userId || order.client_id || 'guest',
      id: orderId,
      payment_status: 'pendente', // REGRA DE SEGURANÇA: Todo novo pedido inicia obrigatoriamente como 'pendente'
      payment_gateway_status: order.payment_gateway_status || 'awaiting_payment_confirmation',
      created_at: order.created_at || new Date().toISOString()
    };

    // 2. Registro no Supabase (Estoque PERMANECE intacto até confirmação legítima de pagamento)
    try {
      const {data, error} = await supabase.from('orders').insert([newOrd]).select('*');
      if (!error && data) {
        // REGRA DE SEGURANÇA: Baixa de estoque NÃO ocorre na criação pendente.
        // O débito é acionado idempotentemente quando payment_status transita para 'pago'.

        // Notificar Cliente
        await this.addNotification({
          user_id: userId || 'guest',
          title: 'Pedido Recebido!',
          message: `Seu pedido #${newOrd.id} foi registrado com sucesso e aguarda confirmação de pagamento Pix.`,
          type: 'order',
          metadata: { order_id: newOrd.id }
        });

        // Notificar Administradoras
        const {data: admins} = await this.getProfiles('admin');
        if (admins) {
          for (const admin of admins) {
            await this.addNotification({
              user_id: admin.id,
              title: 'Novo Pedido Pendente (Pix)',
              message: `A cliente ${newOrd.client_name} realizou o pedido #${newOrd.id} (R$ ${Number(newOrd.total_amount).toFixed(2)}).`,
              type: 'order',
              metadata: { order_id: newOrd.id }
            });
          }
        }

        return {data, error: null};
      }
    } catch {}

    // Contingência Local Storage (para execuções offline ou pré-conexão Supabase)
    const stored = localStorage.getItem('BELA_ORDERS');
    const list = stored ? JSON.parse(stored) : INITIAL_ORDERS;
    const updated = [newOrd, ...list];
    localStorage.setItem('BELA_ORDERS', JSON.stringify(updated));

    // Notificação Local
    this.addNotification({
      user_id: userId || 'guest',
      title: 'Pedido Recebido!',
      message: `Seu pedido #${newOrd.id} foi registrado e aguarda validação do pagamento.`,
      type: 'order',
      metadata: { order_id: newOrd.id }
    });

    return {data: [newOrd], error: null};
  },

  async updateOrderStatus(id: string, statusUpdates: {payment_status?: string; delivery_status?: string}, requesterRole?: string) {
    // 3. Prevent unauthorized users from confirming payments (verified against authoritative profiles table)
    if (statusUpdates.payment_status === 'pago') {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      let userRole = requesterRole;
      if (userId) {
        try {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
          if (profile?.role) userRole = profile.role;
        } catch {}
      }
      if (!userRole) userRole = session?.user?.user_metadata?.role;
      if (userRole !== 'admin') {
        return { data: null, error: 'Acesso Negado: Apenas administradoras autorizadas podem confirmar pagamentos.' };
      }
    }

    const safeUpdates: any = {};
    if (statusUpdates.payment_status) safeUpdates.payment_status = statusUpdates.payment_status;
    if (statusUpdates.delivery_status) safeUpdates.delivery_status = statusUpdates.delivery_status;

    try {
      // Fetch current order state to verify cancel status and idempotency
      const { data: currentOrderData } = await supabase.from('orders').select('*').eq('id', id).single();
      if (currentOrderData) {
        // 4. Prevent cancelled order from being confirmed later
        if (currentOrderData.payment_status === 'cancelado' || currentOrderData.delivery_status === 'cancelado') {
          if (statusUpdates.payment_status === 'pago') {
            return { data: null, error: 'Erro de Segurança: Pedidos cancelados não podem ser confirmados ou pagos.' };
          }
        }

        // 1. Real Idempotency check: If already paid and trying to pay again, return existing data
        if (currentOrderData.payment_status === 'pago' && statusUpdates.payment_status === 'pago') {
          return { data: [currentOrderData], error: null };
        }
      }

      // 5. Record who confirmed and when
      if (statusUpdates.payment_status === 'pago') {
        const { data: { session } } = await supabase.auth.getSession();
        safeUpdates.confirmed_at = new Date().toISOString();
        safeUpdates.confirmed_by = session?.user?.email || session?.user?.id || requesterRole || 'admin';
      }

      const {data, error} = await supabase.from('orders').update(safeUpdates).eq('id', id).select('*');
      if (!error && data) {
        const order = data[0];
        
        // Use new RPCs for atomic operations & preserve financial consistency
        if (safeUpdates.payment_status === 'pago') {
          await supabase.rpc('confirm_order_payment_and_deduct_stock', { p_order_id: id });
          await this.processOrderFinancials(order);
          await this.grantLoyaltyPointsFromOrder(order);
        }

        if (safeUpdates.payment_status === 'cancelado' || safeUpdates.delivery_status === 'cancelado') {
          await supabase.rpc('cancel_order_and_revert_stock_atomic', { p_order_id: id, p_cancel_field: safeUpdates.payment_status === 'cancelado' ? 'payment_status' : 'delivery_status' });
          await this.revertOrderFinancials(order);
          await this.revertLoyaltyPointsFromOrder(order);
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
    } catch (err) {
      console.error('Erro em updateOrderStatus:', err);
    }

    const stored = localStorage.getItem('BELA_ORDERS');
    const list = stored ? JSON.parse(stored) : INITIAL_ORDERS;
    const target = list.find((o: any) => o.id === id);
    if (target && (target.payment_status === 'cancelado' || target.delivery_status === 'cancelado') && statusUpdates.payment_status === 'pago') {
      return { data: null, error: 'Pedidos cancelados não podem ser pagos.' };
    }
    const updated = list.map((o: any) => o.id === id ? {
      ...o, 
      ...safeUpdates,
      ...(statusUpdates.payment_status === 'pago' ? { confirmed_at: new Date().toISOString(), confirmed_by: requesterRole || 'admin' } : {})
    } : o);
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

  // 5.1 Vitrines Comerciais
  async getShowcases() {
    try {
      const {data, error} = await supabase.from('showcases').select('*').order('created_at', {ascending: true});
      if (!error && data && data.length > 0) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_SHOWCASES');
    const list = stored ? JSON.parse(stored) : INITIAL_SHOWCASES;
    if (!stored) localStorage.setItem('BELA_SHOWCASES', JSON.stringify(INITIAL_SHOWCASES));
    return {data: list, error: null};
  },

  async addShowcase(showcase: any) {
    const newShowcase = {
      ...showcase,
      id: showcase.id || `showcase-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    try {
      const {data, error} = await supabase.from('showcases').insert([newShowcase]).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_SHOWCASES');
    const list = stored ? JSON.parse(stored) : INITIAL_SHOWCASES;
    const updated = [...list, newShowcase];
    localStorage.setItem('BELA_SHOWCASES', JSON.stringify(updated));
    return {data: [newShowcase], error: null};
  },

  async updateShowcase(id: string, updates: any) {
    try {
      const {data, error} = await supabase.from('showcases').update(updates).eq('id', id).select('*');
      if (!error && data) return {data, error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_SHOWCASES');
    const list = stored ? JSON.parse(stored) : INITIAL_SHOWCASES;
    const updated = list.map((s: any) => s.id === id ? {...s, ...updates} : s);
    localStorage.setItem('BELA_SHOWCASES', JSON.stringify(updated));
    return {data: updated, error: null};
  },

  async deleteShowcase(id: string) {
    if (id === 'vitrine-principal') {
      return {error: 'A Vitrine Principal não pode ser removida.'};
    }
    try {
      const {error} = await supabase.from('showcases').delete().eq('id', id);
      if (!error) return {error: null};
    } catch {}

    const stored = localStorage.getItem('BELA_SHOWCASES');
    const list = stored ? JSON.parse(stored) : INITIAL_SHOWCASES;
    const updated = list.filter((s: any) => s.id !== id);
    localStorage.setItem('BELA_SHOWCASES', JSON.stringify(updated));
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
      timestamp: new Date().toISOString(),
      is_read: false
    };

    try {
      const {data, error} = await supabase.from('messages').insert([newMsg]).select('*');
      if (!error && data) {
        if (newMsg.receiver_id) {
          await this.addNotification({
            user_id: newMsg.receiver_id,
            title: `Nova Mensagem (${newMsg.sender_name || 'Bela Mulher'})`,
            message: newMsg.content || 'Mensagem de áudio no chat',
            type: 'chat',
            metadata: { sender_id: newMsg.sender_id }
          });
        }
        return {data, error: null};
      }
    } catch {}

    const key = `BELA_CHAT_MSGS`;
    const stored = localStorage.getItem(key);
    const list = stored ? JSON.parse(stored) : [];
    const updated = [...list, newMsg];
    localStorage.setItem(key, JSON.stringify(updated));

    if (newMsg.receiver_id) {
      await this.addNotification({
        user_id: newMsg.receiver_id,
        title: `Nova Mensagem (${newMsg.sender_name || 'Bela Mulher'})`,
        message: newMsg.content || 'Mensagem de áudio no chat',
        type: 'chat',
        metadata: { sender_id: newMsg.sender_id }
      });
    }

    return {data: [newMsg], error: null};
  },

  async markChatMessagesAsRead(userId: string, senderId: string) {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', userId)
        .eq('sender_id', senderId);
    } catch {}

    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('type', 'chat');
    } catch {}

    const key = `BELA_CHAT_READ_${userId}_${senderId}`;
    localStorage.setItem(key, new Date().toISOString());
    return { success: true };
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
    // Check schedule block conflict
    const appDate = (appointment.date || appointment.start_time || '').split('T')[0];
    const appTime = appointment.time || (appointment.start_time ? appointment.start_time.split('T')[1]?.slice(0, 5) : undefined);
    
    if (appointment.professional_id) {
      const isAvailable = await this.isProfessionalAvailable(appointment.professional_id, appDate, appTime);
      if (!isAvailable) {
        return { data: null, error: 'O profissional possui um bloqueio de agenda (folga, almoço ou férias) neste horário.' };
      }
    }

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

        // FINANCE REVERSION
        if (status === 'cancelled') {
          await this.revertStockDeduction(res.data);
          await this.revertAppointmentFinancials(res.data);
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
      const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      if (!error) {
        // Supabase connected successfully: return real data (even if empty []), distinguishing absence of records from connection failure
        return { data: data || [], error: null };
      }
      // Connection or query error
      console.error('Erro ao carregar transações do Supabase:', error);
      return { data: [], error: error.message || 'Falha de conexão ao carregar transações do servidor.' };
    } catch (err: any) {
      console.error('Exceção ao carregar transações:', err);
      return { data: [], error: err?.message || 'Erro de conexão ao servidor.' };
    }
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

  async grantLoyaltyPointsFromOrder(order: any) {
    try {
      if (!order || !order.client_id || order.client_id === 'guest') return;
      
      // 1. Check if already granted
      const {data: existing} = await supabase
        .from('loyalty_transactions')
        .select('id')
        .eq('related_id', order.id)
        .eq('type', 'earn')
        .maybeSingle();

      if (existing) return; // Prevent double points

      // 2. Get config
      const {data: config} = await this.getLoyaltyConfig();
      const ratio = Number(config?.points_per_real || 1.0);
      
      const totalAmount = Number(order.total_amount || 0);
      const points = Math.floor(totalAmount * ratio);

      if (points <= 0) return;

      // 3. Record transaction
      await this.addLoyaltyTransaction({
        user_id: order.client_id,
        amount: points,
        type: 'earn',
        description: `Pontos ganhos: Pedido #${order.id.slice(0, 8)}`,
        related_id: order.id
      });

      // 4. Notify client
      await this.addNotification({
        user_id: order.client_id,
        title: 'Você ganhou pontos!',
        message: `Parabéns! Você recebeu ${points} pontos pelo seu pedido.`,
        type: 'system'
      });
    } catch (err) {
      console.error('Erro ao conceder pontos de pedido:', err);
    }
  },

  async revertLoyaltyPointsFromOrder(order: any) {
    try {
      if (!order || !order.client_id || order.client_id === 'guest') return;

      // 1. Localizar o ganho de pontos original
      const { data: originalEarn } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('related_id', order.id)
        .eq('type', 'earn')
        .maybeSingle();

      if (!originalEarn) return; // Se nunca ganhou pontos, não há o que estornar

      // 2. Verificar se já existe estorno registrado (Idempotência contra duplo estorno)
      const { data: existingReversal } = await supabase
        .from('loyalty_transactions')
        .select('id')
        .eq('related_id', order.id)
        .eq('type', 'reversal')
        .maybeSingle();

      if (existingReversal) return; // Impede duplicidade de estorno de pontos

      // 3. Registrar transação de estorno de pontos
      const pointsToDeduct = Math.abs(Number(originalEarn.amount || 0));
      if (pointsToDeduct <= 0) return;

      await this.addLoyaltyTransaction({
        user_id: order.client_id,
        amount: -pointsToDeduct,
        type: 'reversal',
        description: `Estorno de pontos: Pedido #${order.id.slice(0, 8)} cancelado`,
        related_id: order.id
      });
    } catch (err) {
      console.error('Erro ao estornar pontos de pedido cancelado:', err);
    }
  },

  async syncLoyaltyPointsFromRealHistory(userId: string) {
    try {
      if (!userId || userId === 'guest') return;
      
      const [appsRes, ordsRes, txsRes] = await Promise.all([
        this.getAppointments(userId, 'client'),
        this.getOrders(userId),
        this.getLoyaltyTransactions(userId)
      ]);

      const apps = appsRes.data || [];
      const ords = ordsRes.data || [];
      const txs = txsRes.data || [];

      const existingRelatedIds = new Set(txs.map((t: any) => t.related_id).filter(Boolean));

      // Sync concluded appointments
      const concludedApps = apps.filter((a: any) => (a.status === 'concluded' || a.status === 'concluido') && !existingRelatedIds.has(a.id));
      for (const app of concludedApps) {
        await this.grantLoyaltyPointsFromAppointment(app);
      }

      // Sync paid orders
      const paidOrders = ords.filter((o: any) => o.payment_status === 'pago' && !existingRelatedIds.has(o.id));
      for (const ord of paidOrders) {
        await this.grantLoyaltyPointsFromOrder(ord);
      }
    } catch (err) {
      console.error('Erro ao sincronizar histórico de pontos:', err);
    }
  },

  async addLoyaltyTransaction(tx: any) {
    try {
      const {data, error} = await supabase.from('loyalty_transactions').insert([tx]).select('*');
      if (!error && data) {
        // Also update profiles loyalty_points balance
        try {
          const { data: prof } = await this.getProfile(tx.user_id);
          if (prof) {
            const currentPoints = Number(prof.loyalty_points || 0);
            const newBalance = Math.max(0, currentPoints + Number(tx.amount || 0));
            await supabase.from('profiles').update({ loyalty_points: newBalance }).eq('id', tx.user_id);
          }
        } catch (e) {
          console.error('Erro ao atualizar saldo no perfil:', e);
        }
        return {data, error: null};
      }
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
    const results: { success: boolean; processed: string[]; skipped: string[]; failed: { id: string; name: string; error: string }[] } = {
      success: true,
      processed: [],
      skipped: [],
      failed: []
    };

    try {
      if (!order || !order.items) return { ...results, success: false };

      for (const item of order.items) {
        try {
          // 1. Verificar se já processado (Idempotência estrita por produto e pedido)
          const { data: existingMovs } = await supabase
            .from('stock_movements')
            .select('id')
            .eq('related_id', order.id)
            .eq('product_id', item.id)
            .eq('type', 'saida')
            .maybeSingle();

          if (existingMovs) {
            results.skipped.push(item.id);
            continue; // Já baixado anteriormente, preserva histórico e não debita novamente
          }

          // 2. Revalidar produto e estoque disponível antes da baixa
          const { data: prod } = await supabase
            .from('products')
            .select('id, quantity')
            .eq('id', item.id)
            .single();

          if (!prod) {
            throw new Error(`Produto não encontrado no cadastro`);
          }

          if (prod.quantity < item.quantity) {
            throw new Error(`Estoque insuficiente (disponível: ${prod.quantity}, solicitado: ${item.quantity})`);
          }

          // 3. Update atômico com Trava Otimista (impede saldo negativo)
          const newQty = prod.quantity - item.quantity;
          const { error: updateErr } = await supabase
            .from('products')
            .update({ quantity: newQty })
            .eq('id', item.id)
            .eq('quantity', prod.quantity);

          if (updateErr) {
            throw new Error('Falha de concorrência ao atualizar estoque. Tente novamente.');
          }

          // 4. Registro de movimentação detalhado
          await this.recordStockMovement({
            product_id: item.id,
            product_name: item.name,
            type: 'saida',
            quantity: item.quantity,
            reason: `Venda Pedido #${order.id}`,
            related_id: order.id
          });

          results.processed.push(item.id);
        } catch (itemErr: any) {
          results.success = false;
          results.failed.push({
            id: item.id,
            name: item.name || 'Produto',
            error: itemErr.message || 'Erro ao processar item'
          });
          console.error(`Erro na baixa de estoque do item ${item.name || item.id} (Pedido #${order.id}):`, itemErr);
        }
      }
    } catch (err) {
      results.success = false;
      console.error('Erro geral no processador de estoque:', err);
    }

    return results;
  },

  async getOrderStockStatus(order: any) {
    if (!order || !order.items || !Array.isArray(order.items)) {
      return { isFullyProcessed: true, totalItems: 0, processedCount: 0, pendingItems: [] };
    }

    try {
      const { data: movs } = await supabase
        .from('stock_movements')
        .select('product_id, type')
        .eq('related_id', order.id);

      const saidaSet = new Set((movs || []).filter(m => m.type === 'saida').map(m => m.product_id));
      const estornoSet = new Set((movs || []).filter(m => m.type === 'estorno').map(m => m.product_id));

      const pendingItems = order.items.filter((item: any) => !saidaSet.has(item.id));
      const refundedItems = order.items.filter((item: any) => saidaSet.has(item.id) && estornoSet.has(item.id));
      const deductedItems = order.items.filter((item: any) => saidaSet.has(item.id) && !estornoSet.has(item.id));

      return {
        isFullyProcessed: pendingItems.length === 0,
        totalItems: order.items.length,
        processedCount: saidaSet.size,
        pendingItems,
        refundedItems,
        deductedItems
      };
    } catch (err) {
      return { isFullyProcessed: true, totalItems: order.items.length, processedCount: 0, pendingItems: [] };
    }
  },

  async revertStockDeduction(order: any) {
    try {
      if (!order || !order.items) return;

      for (const item of order.items) {
        // 1. Verifica se existe movimentação para estornar
        const { data: movs } = await supabase
          .from('stock_movements')
          .select('id, type')
          .eq('related_id', order.id)
          .eq('product_id', item.id);
        
        const hasSaida = movs?.some(m => m.type === 'saida');
        const hasEstorno = movs?.some(m => m.type === 'estorno');
        
        if (!hasSaida || hasEstorno) continue;

        // 2. Fetch produto atual
        const { data: prod } = await supabase
          .from('products')
          .select('id, quantity')
          .eq('id', item.id)
          .single();

        if (!prod) continue;

        // 3. Incrementa estoque com trava otimista
        const { error: updateErr } = await supabase
          .from('products')
          .update({ quantity: prod.quantity + item.quantity })
          .eq('id', item.id)
          .eq('quantity', prod.quantity);

        if (updateErr) throw new Error('Falha de concorrência no estorno: tente novamente.');

        // 4. Registra estorno
        await this.recordStockMovement({
          product_id: item.id,
          product_name: item.name,
          type: 'estorno',
          quantity: item.quantity,
          reason: `Cancelamento Pedido #${order.id}`,
          related_id: order.id
        });
      }
    } catch (err) {
      console.error('Erro no estorno de estoque:', err);
    }
  },

  async getFinancialMetrics() {
    try {
      const {data: txs} = await this.getTransactions();
      if (!txs) return {data: null, error: 'Sem transações'};

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      const revenueCats = ['Serviços', 'Venda de Produtos'];
      const reversalCats = ['Estorno de Venda', 'Estorno de Atendimento'];
      
      const total_gross_revenue = txs.filter((t: any) => t.type === 'entrada' && revenueCats.includes(t.category)).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      const total_reversals = txs.filter((t: any) => t.type === 'saida' && reversalCats.includes(t.category)).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      const commission_reversals = txs.filter((t: any) => t.type === 'entrada' && t.category === 'Estorno de Comissão').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
      
      const metrics = {
        total_revenue: txs.filter((t: any) => t.type === 'entrada').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        total_expenses: txs.filter((t: any) => t.type === 'saida').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        pending_receivables: txs.filter((t: any) => t.type === 'entrada' && t.status === 'pendente').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        pending_payables: txs.filter((t: any) => t.type === 'saida' && t.status === 'pendente').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        daily_revenue: txs.filter((t: any) => t.type === 'entrada' && t.date.startsWith(todayStr)).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0),
        
        total_gross_revenue,
        total_reversals,
        net_revenue: total_gross_revenue - total_reversals,
        commission_reversals,
        net_profit: (total_gross_revenue - total_reversals + commission_reversals) - (txs.filter((t: any) => t.type === 'saida' && !reversalCats.includes(t.category)).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0))
      };

      return {data: metrics, error: null};
    } catch (err) {
      return {error: 'Erro ao processar métricas'};
    }
  },

  async revertOrderFinancials(order: any) {
    const { data: originalTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('related_id', order.id)
      .eq('related_type', 'order')
      .maybeSingle();

    if (!originalTx) return;

    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('related_id', order.id)
      .eq('related_type', 'order_reversal')
      .maybeSingle();
    
    if (existing) return;

    await this.addTransaction({
      description: `Estorno Pedido #${order.id}`,
      category: 'Estorno de Venda',
      type: 'saida',
      amount: originalTx.amount,
      date: new Date().toISOString(),
      status: 'pago',
      related_id: order.id,
      related_type: 'order_reversal'
    });
  },

  async revertAppointmentFinancials(appointment: any) {
    const { data: originalTx } = await supabase
      .from('transactions')
      .select('amount')
      .eq('related_id', appointment.id)
      .eq('related_type', 'appointment')
      .maybeSingle();

    if (!originalTx) return;

    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('related_id', appointment.id)
      .eq('related_type', 'appointment_reversal')
      .maybeSingle();
    
    if (existing) return;

    await this.addTransaction({
      description: `Estorno Atendimento #${appointment.id}`,
      category: 'Estorno de Atendimento',
      type: 'saida',
      amount: originalTx.amount,
      date: new Date().toISOString(),
      status: 'pago',
      related_id: appointment.id,
      related_type: 'appointment_reversal'
    });

    const { data: comm } = await supabase
      .from('commissions')
      .select('*')
      .eq('appointment_id', appointment.id)
      .eq('status', 'paid')
      .maybeSingle();

    if (comm) {
      await this.addTransaction({
        description: `Reversão Comissão Atend. #${appointment.id}`,
        category: 'Estorno de Comissão',
        type: 'entrada',
        amount: Math.abs(comm.commission_amount),
        date: new Date().toISOString(),
        status: 'pago',
        related_id: appointment.id,
        related_type: 'commission_reversal'
      });
      await supabase.from('commissions').update({ status: 'reversed' }).eq('id', comm.id);
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

  // 10. Escala e Bloqueios de Profissionais
  async getScheduleBlocks(professionalId?: string) {
    try {
      const stored = localStorage.getItem('BELA_SCHEDULE_BLOCKS');
      const blocks: any[] = stored ? JSON.parse(stored) : [];
      if (professionalId) {
        return { data: blocks.filter(b => b.professional_id === professionalId || b.professional_id === 'all'), error: null };
      }
      return { data: blocks, error: null };
    } catch {
      return { data: [], error: null };
    }
  },

  async addScheduleBlock(block: any) {
    try {
      const stored = localStorage.getItem('BELA_SCHEDULE_BLOCKS');
      const blocks: any[] = stored ? JSON.parse(stored) : [];
      const newBlock = {
        ...block,
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        created_at: new Date().toISOString()
      };
      blocks.push(newBlock);
      localStorage.setItem('BELA_SCHEDULE_BLOCKS', JSON.stringify(blocks));
      return { data: newBlock, error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro ao adicionar bloqueio' };
    }
  },

  async deleteScheduleBlock(id: string) {
    try {
      const stored = localStorage.getItem('BELA_SCHEDULE_BLOCKS');
      const blocks: any[] = stored ? JSON.parse(stored) : [];
      const filtered = blocks.filter(b => b.id !== id);
      localStorage.setItem('BELA_SCHEDULE_BLOCKS', JSON.stringify(filtered));
      return { error: null };
    } catch (err: any) {
      return { error: 'Erro ao remover bloqueio' };
    }
  },

  async isProfessionalAvailable(professionalId: string, dateStr: string, timeStr?: string) {
    try {
      const { data: blocks } = await this.getScheduleBlocks(professionalId);
      if (!blocks || blocks.length === 0) return true;

      const targetDate = dateStr.split('T')[0];

      for (const block of blocks) {
        const bDate = (block.date || '').split('T')[0];
        if (bDate === targetDate) {
          // Full day block (férias, folga)
          if (block.type === 'férias' || block.type === 'folga' || !block.start_time) {
            return false;
          }
          // Time range block (almoço, bloqueio)
          if (timeStr && block.start_time && block.end_time) {
            if (timeStr >= block.start_time && timeStr <= block.end_time) {
              return false;
            }
          }
        }
      }
      return true;
    } catch {
      return true;
    }
  },

  // Pix Config Management
  async getPixConfig() {
    try {
      const stored = localStorage.getItem('BELA_PIX_CONFIG');
      if (stored) return { data: JSON.parse(stored), error: null };
      const { data } = await supabase.from('salon_config').select('value').eq('key', 'pix_config').maybeSingle();
      if (data?.value) {
        localStorage.setItem('BELA_PIX_CONFIG', JSON.stringify(data.value));
        return { data: data.value, error: null };
      }
    } catch {}
    
    // Default fallback config
    const defaultConfig = {
      active: true,
      key_type: 'CNPJ',
      pix_key: '12.345.678/0001-90',
      receiver_name: 'Sra Bela Mulher Salão & Estética',
      city: 'SÃO PAULO',
      qrcode_url: '/src/assets/images/service_showcase_1_1793799836251.jpg',
      merchant_category_code: '0000'
    };
    return { data: defaultConfig, error: null };
  },

  async savePixConfig(config: any) {
    try {
      localStorage.setItem('BELA_PIX_CONFIG', JSON.stringify(config));
      await supabase.from('salon_config').upsert({ key: 'pix_config', value: config, updated_at: new Date().toISOString() }, { onConflict: 'key' });
      return { success: true, data: config, error: null };
    } catch (err: any) {
      localStorage.setItem('BELA_PIX_CONFIG', JSON.stringify(config));
      return { success: true, data: config, error: null };
    }
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

export function generatePixBrCode(params: {
  key: string;
  name: string;
  city: string;
  amount?: number;
  txid?: string;
}): string {
  const cleanKey = (params.key || '').trim();
  const cleanName = (params.name || 'BELA MULHER').normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25).toUpperCase();
  const cleanCity = (params.city || 'SAO PAULO').normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15).toUpperCase();
  const txid = ((params.txid || '***').replace(/[^a-zA-Z0-9]/g, '') || 'BELA').slice(0, 25);

  const gui = '0014br.gov.bcb.pix';
  const keyField = `01${String(cleanKey.length).padStart(2, '0')}${cleanKey}`;
  const merchantAccount = `26${String(gui.length + keyField.length).padStart(2, '0')}${gui}${keyField}`;
  const mcc = '52040000';
  const currency = '5303986';
  
  let amountStr = '';
  if (params.amount && params.amount > 0) {
    const formattedAmt = params.amount.toFixed(2);
    amountStr = `54${String(formattedAmt.length).padStart(2, '0')}${formattedAmt}`;
  }
  
  const country = '5802BR';
  const nameField = `59${String(cleanName.length).padStart(2, '0')}${cleanName}`;
  const cityField = `60${String(cleanCity.length).padStart(2, '0')}${cleanCity}`;
  
  const txidField = `05${String(txid.length).padStart(2, '0')}${txid}`;
  const addDataField = `62${String(txidField.length).padStart(2, '0')}${txidField}`;

  const payloadNoCrc = `000201${merchantAccount}${mcc}${currency}${amountStr}${country}${nameField}${cityField}${addDataField}6304`;
  
  let crc = 0xFFFF;
  for (let i = 0; i < payloadNoCrc.length; i++) {
    crc ^= payloadNoCrc.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');
  return payloadNoCrc + crcHex;
}

export function validatePixBrCode(payload: string, expectedKey?: string): {
  isValid: boolean;
  message: string;
  extractedKey?: string;
} {
  if (!payload || typeof payload !== 'string') {
    return { isValid: false, message: 'Payload do QR Code Pix em branco ou ausente.' };
  }
  const trimmed = payload.trim();
  if (!trimmed.startsWith('000201')) {
    return { isValid: false, message: 'Formato inválido: QR Code não segue o padrão BR Code/EMV (deve iniciar com 000201).' };
  }
  if (!trimmed.includes('br.gov.bcb.pix')) {
    return { isValid: false, message: 'Estrutura Pix inválida: domínio br.gov.bcb.pix não localizado no payload.' };
  }
  if (!trimmed.includes('6304')) {
    return { isValid: false, message: 'Incompleto: campo CRC16 (6304) ausente no payload.' };
  }

  let extractedKey = '';
  const pixIdx = trimmed.indexOf('br.gov.bcb.pix');
  if (pixIdx !== -1) {
    const after = trimmed.slice(pixIdx + 'br.gov.bcb.pix'.length);
    if (after.startsWith('01')) {
      const len = parseInt(after.slice(2, 4), 10);
      if (!isNaN(len)) {
        extractedKey = after.slice(4, 4 + len);
      }
    }
  }

  if (expectedKey && extractedKey) {
    const cleanExpected = expectedKey.replace(/[^a-zA-Z0-9@.-]/g, '').toLowerCase();
    const cleanExtracted = extractedKey.replace(/[^a-zA-Z0-9@.-]/g, '').toLowerCase();
    if (cleanExpected && cleanExtracted && !cleanExtracted.includes(cleanExpected) && !cleanExpected.includes(cleanExtracted)) {
      return {
        isValid: false,
        message: `Atenção: A chave no QR Code ("${extractedKey}") diverge da chave cadastrada ("${expectedKey}").`,
        extractedKey
      };
    }
  }

  return {
    isValid: true,
    message: `QR Code BR Code/EMV válido e compatível! Chave identificada: ${extractedKey || 'Padrão BACEN OK'}.`,
    extractedKey
  };
}

// ==========================================
// VISUAL EDITOR LAYOUT DATA MODELS & HELPERS
// ==========================================

export interface LayoutElement {
  id: string;
  type: 'header' | 'carousel' | 'gallery' | 'footer' | 'sidemenu' | 'banner' | 'button' | 'text_block' | 'image_block' | 'section';
  title: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  icon_name?: string;
  link_target?: string;
  order: number;
  visible: boolean;
  is_protected?: boolean;
  styles: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fontSize?: number;
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    borderRadius?: number;
    padding?: number;
    margin?: number;
    textAlign?: 'left' | 'center' | 'right';
  };
  deviceOverrides?: {
    mobile?: Partial<LayoutElement['styles']>;
    tablet?: Partial<LayoutElement['styles']>;
    desktop?: Partial<LayoutElement['styles']>;
  };
}

export interface AppLayoutConfig {
  id: string;
  version: number;
  status: 'draft' | 'published';
  updated_at: string;
  updated_by?: string;
  header: {
    visible: boolean;
    title: string;
    subtitle: string;
    logoText: string;
    slogan: string;
    bgColor: string;
    textColor: string;
    accentColor: string;
    height: number;
    showNotificationBell: boolean;
  };
  carousel: {
    visible: boolean;
    autoPlay: boolean;
    intervalSeconds: number;
    height: number;
  };
  gallery: {
    visible: boolean;
    columnsMobile: number;
    columnsDesktop: number;
    aspectRatio: string;
  };
  footer: {
    visible: boolean;
    bgColor: string;
    activeTabColor: string;
    items: Array<{
      id: string;
      label: string;
      iconName: string;
      visible: boolean;
      order: number;
    }>;
  };
  sideMenu: {
    visible: boolean;
    bgColor: string;
    items: Array<{
      id: string;
      label: string;
      iconName: string;
      visible: boolean;
      order: number;
    }>;
  };
  elements: LayoutElement[];
}

export const DEFAULT_LAYOUT_CONFIG: AppLayoutConfig = {
  id: 'default-layout',
  version: 1,
  status: 'published',
  updated_at: new Date().toISOString(),
  header: {
    visible: true,
    title: 'Bela Mulher',
    subtitle: 'Salão & Estética',
    logoText: 'BM',
    slogan: 'Excelência em beleza, estética e cuidado VIP',
    bgColor: '#030712',
    textColor: '#ffffff',
    accentColor: '#f59e0b',
    height: 72,
    showNotificationBell: true
  },
  carousel: {
    visible: true,
    autoPlay: true,
    intervalSeconds: 4,
    height: 260
  },
  gallery: {
    visible: true,
    columnsMobile: 1,
    columnsDesktop: 3,
    aspectRatio: '9/16'
  },
  footer: {
    visible: true,
    bgColor: '#030712',
    activeTabColor: '#f59e0b',
    items: [
      { id: 'home', label: 'Início', iconName: 'Home', visible: true, order: 1 },
      { id: 'cliente', label: 'Cliente', iconName: 'User', visible: true, order: 2 },
      { id: 'prof', label: 'Profissional', iconName: 'Briefcase', visible: true, order: 3 },
      { id: 'vitrine', label: 'Vitrine', iconName: 'LayoutGrid', visible: true, order: 4 },
      { id: 'chat', label: 'Chat', iconName: 'MessageCircle', visible: true, order: 5 },
    ]
  },
  sideMenu: {
    visible: true,
    bgColor: '#030712',
    items: [
      { id: 'home', label: 'Início', iconName: 'Home', visible: true, order: 1 },
      { id: 'vitrine', label: 'Vitrine', iconName: 'LayoutGrid', visible: true, order: 2 },
      { id: 'galeria', label: 'Galeria', iconName: 'Image', visible: true, order: 3 },
      { id: 'cliente', label: 'Área do Cliente', iconName: 'User', visible: true, order: 4 },
      { id: 'prof', label: 'Área Profissional', iconName: 'Briefcase', visible: true, order: 5 },
      { id: 'chat', label: 'Chat', iconName: 'MessageCircle', visible: true, order: 6 },
      { id: 'info', label: 'Informações', iconName: 'Info', visible: true, order: 7 },
      { id: 'social', label: 'Redes Sociais', iconName: 'Globe', visible: true, order: 8 },
    ]
  },
  elements: [
    {
      id: 'elem-header',
      type: 'header',
      title: 'Cabeçalho Institucional',
      order: 1,
      visible: true,
      is_protected: true,
      styles: { padding: 12, borderRadius: 16 }
    },
    {
      id: 'elem-carousel',
      type: 'carousel',
      title: 'Carrossel Promocional',
      order: 2,
      visible: true,
      is_protected: true,
      styles: { margin: 8 }
    },
    {
      id: 'elem-gallery',
      type: 'gallery',
      title: 'Galeria 9:16 Verticais',
      order: 3,
      visible: true,
      is_protected: true,
      styles: { margin: 8 }
    }
  ]
};

// Add Layout methods to dataService
export async function getLayoutConfig(status: 'published' | 'draft' = 'published'): Promise<AppLayoutConfig> {
  const localKey = status === 'published' ? 'bela_mulher_layout_published' : 'bela_mulher_layout_draft';
  const localData = localStorage.getItem(localKey);
  
  try {
    const { data, error } = await supabase
      .from('app_layout_configs')
      .select('*')
      .eq('status', status)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data && data.config_json) {
      const parsed = typeof data.config_json === 'string' ? JSON.parse(data.config_json) : data.config_json;
      localStorage.setItem(localKey, JSON.stringify(parsed));
      return parsed;
    }
  } catch (err) {
    console.warn('Supabase layout fetch fallback to localStorage:', err);
  }

  if (localData) {
    try {
      return JSON.parse(localData);
    } catch {}
  }

  return DEFAULT_LAYOUT_CONFIG;
}

export async function saveLayoutDraft(config: AppLayoutConfig): Promise<{ success: boolean; config: AppLayoutConfig }> {
  const updatedConfig: AppLayoutConfig = {
    ...config,
    status: 'draft',
    updated_at: new Date().toISOString()
  };

  localStorage.setItem('bela_mulher_layout_draft', JSON.stringify(updatedConfig));

  try {
    await supabase.from('app_layout_configs').upsert({
      id: `draft-${Date.now()}`,
      version: updatedConfig.version,
      status: 'draft',
      config_json: JSON.stringify(updatedConfig),
      updated_at: updatedConfig.updated_at
    });
  } catch (err) {
    console.warn('Supabase save draft error, fallback saved locally:', err);
  }

  return { success: true, config: updatedConfig };
}

export async function publishLayoutConfig(config: AppLayoutConfig): Promise<{ success: boolean; config: AppLayoutConfig }> {
  const newVersion = (config.version || 1) + 1;
  const publishedConfig: AppLayoutConfig = {
    ...config,
    version: newVersion,
    status: 'published',
    updated_at: new Date().toISOString()
  };

  // Save to both published and draft slots in localStorage
  localStorage.setItem('bela_mulher_layout_published', JSON.stringify(publishedConfig));
  localStorage.setItem('bela_mulher_layout_draft', JSON.stringify(publishedConfig));

  try {
    await supabase.from('app_layout_configs').insert({
      id: `v${newVersion}-${Date.now()}`,
      version: newVersion,
      status: 'published',
      config_json: JSON.stringify(publishedConfig),
      updated_at: publishedConfig.updated_at
    });
  } catch (err) {
    console.warn('Supabase publish layout error, published locally:', err);
  }

  // Dispatch event for instant real-time sync across open tabs/views
  window.dispatchEvent(new CustomEvent('bela_layout_published', { detail: publishedConfig }));

  return { success: true, config: publishedConfig };
}

export async function getLayoutHistory(): Promise<Array<{ id: string; version: number; status: string; updated_at: string; config: AppLayoutConfig }>> {
  try {
    const { data, error } = await supabase
      .from('app_layout_configs')
      .select('*')
      .order('version', { ascending: false })
      .limit(20);

    if (!error && data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        version: item.version,
        status: item.status,
        updated_at: item.updated_at,
        config: typeof item.config_json === 'string' ? JSON.parse(item.config_json) : item.config_json
      }));
    }
  } catch (err) {
    console.warn('History fetch fallback:', err);
  }

  // Fallback history list from local storage
  const pub = localStorage.getItem('bela_mulher_layout_published');
  if (pub) {
    try {
      const cfg = JSON.parse(pub);
      return [{
        id: 'local-published',
        version: cfg.version || 1,
        status: 'published',
        updated_at: cfg.updated_at || new Date().toISOString(),
        config: cfg
      }];
    } catch {}
  }

  return [{
    id: 'default-v1',
    version: 1,
    status: 'published',
    updated_at: DEFAULT_LAYOUT_CONFIG.updated_at,
    config: DEFAULT_LAYOUT_CONFIG
  }];
}

