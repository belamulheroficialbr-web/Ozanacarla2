import React, {useState, useEffect} from 'react';
import {
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Scissors,
  ArrowRight,
  Phone,
  Heart,
  ShoppingBag,
  ShieldAlert,
  MessageSquare,
  Plus,
  Minus,
  Trash2,
  Upload,
  CalendarCheck,
  CreditCard,
  Sparkles,
  XCircle
} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
import {dataService} from '../../lib/data';
import {supabase} from '../../lib/supabase';
import {uploadMedia} from '../../lib/storage';
import {DirectChat} from './DirectChat';
import {NotificationCenter} from '../tools/NotificationCenter';
import {LoyaltyWallet} from './LoyaltyWallet';
import {CartItem} from '../SacolaModal';

interface ClientAreaProps {
  onNavigateToVitrine: () => void;
  onRequestLogin: () => void;
  cart?: CartItem[];
  onUpdateCartQuantity?: (id: string, delta: number) => void;
  onRemoveFromCart?: (id: string) => void;
  onClearCart?: () => void;
  onOpenSacolaCheckout?: () => void;
  onOpenBookingModal?: (service?: any) => void;
}

export function ClientArea({
  onNavigateToVitrine,
  onRequestLogin,
  cart = [],
  onUpdateCartQuantity,
  onRemoveFromCart,
  onClearCart,
  onOpenSacolaCheckout,
  onOpenBookingModal
}: ClientAreaProps) {
  const {user, role} = useAuth();
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'sacola' | 'fidelidade' | 'saude' | 'perfil' | 'chat' | 'notificacoes'>('agendamentos');
  
  // Data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Medical / Allergies state
  const [allergies, setAllergies] = useState('');
  const [sensitivities, setSensitivities] = useState('');
  const [reactiveProducts, setReactiveProducts] = useState('');
  const [carePreferences, setCarePreferences] = useState('');
  const [favoriteProfs, setFavoriteProfs] = useState<string[]>([]);
  const [availableProfs, setAvailableProfs] = useState<any[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadClientData();

      // Configurar Realtime para Agendamentos e Pedidos do Cliente
      const appointmentsChannel = supabase
        .channel(`client_appointments_${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'appointments',
          filter: `client_id=eq.${user.id}`
        }, () => {
          loadClientData();
        })
        .subscribe();

      const ordersChannel = supabase
        .channel(`client_orders_${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'orders',
          filter: `client_id=eq.${user.id}`
        }, () => {
          loadClientData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(appointmentsChannel);
        supabase.removeChannel(ordersChannel);
      };
    }
  }, [user]);

  async function loadClientData() {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Profile
      const {data: profileData} = await dataService.getProfile(user.id);
      if (profileData) {
        setName(profileData.name || '');
        setPhone(profileData.phone || '');
        setBio(profileData.bio || '');
        setAvatarUrl(profileData.avatar_url || '');
      }

      // 2. Appointments
      const {data: appData} = await dataService.getAppointments(user.id, 'client');
      if (appData) setAppointments(appData);

      // 3. Orders / Purchases
      const {data: ordData} = await dataService.getOrders(user.id);
      if (ordData) setOrders(ordData);

      // 4. Medical Profile
      const medData = await dataService.getClientMedicalProfile(user.id);
      if (medData) {
        setAllergies(medData.allergies || '');
        setSensitivities(medData.sensitivities || '');
        setReactiveProducts(medData.reactive_products || '');
        setCarePreferences(medData.care_preferences || '');
        setFavoriteProfs(medData.favorite_professionals || []);
      }

      // 5. Available Professionals
      const profRes = await dataService.getProfiles('professional');
      if (profRes.data) setAvailableProfs(profRes.data);

    } catch (err) {
      console.error('Erro ao carregar dados do cliente:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelAppointment = async (id: string) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      await dataService.updateAppointmentStatus(id, 'cancelled');
      await loadClientData();
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const url = await uploadMedia('avatars', `${user.id}_${Date.now()}.jpg`, file);
      setAvatarUrl(url);
      await dataService.updateProfile(user.id, {avatar_url: url});
    } catch (err) {
      console.error('Erro ao enviar avatar:', err);
    }
  };

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Update profile
      await dataService.updateProfile(user.id, {
        name,
        phone,
        bio,
        avatar_url: avatarUrl
      });

      // Update Medical info
      await dataService.updateClientMedicalProfile(user.id, {
        allergies,
        sensitivities,
        reactive_products: reactiveProducts,
        care_preferences: carePreferences,
        favorite_professionals: favoriteProfs
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar dados do perfil:', err);
    } finally {
      setIsSaving(false);
    }
  }

  const handleToggleFavoriteProf = (profName: string) => {
    if (favoriteProfs.includes(profName)) {
      setFavoriteProfs(favoriteProfs.filter(p => p !== profName));
    } else {
      setFavoriteProfs([...favoriteProfs, profName]);
    }
  };

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'Horário a combinar';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Data a definir' : d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data a definir';
    }
  };

  // Separação de atendimentos do cliente
  const upcomingAppointments = appointments.filter(a => a.status !== 'concluded' && a.status !== 'cancelled');
  const pastAppointments = appointments.filter(a => a.status === 'concluded' || a.status === 'cancelled');

  // Cálculo da Sacola
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Área Exclusiva da Cliente</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Acesse seus agendamentos, sacola de compras, pontos de fidelidade e histórico com total privacidade.
          </p>
        </div>

        <div className="bg-gradient-to-b from-gray-950 to-gray-900 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">Acompanhe confirmações de horários e agende novos procedimentos online</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">Consulte sua sacola, histórico de compras e status de entrega</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">Acumule pontos em cada atendimento e resgate recompensas exclusivas</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onRequestLogin}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
            >
              <span>Entrar na Minha Conta</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onNavigateToVitrine}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            Ainda não tem conta? Conheça os nossos produtos e serviços na Vitrine →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header da Cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-amber-500/25 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3.5">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border border-amber-500/40" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
              {name ? name[0].toUpperCase() : (user.email?.[0]?.toUpperCase() || 'C')}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Espaço Cliente VIP</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Olá, {name || user.email?.split('@')[0] || 'Cliente'}!
            </h2>
            <p className="text-xs text-gray-400">{bio || 'Bem-vinda ao seu espaço exclusivo no Salão Bela Mulher'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onNavigateToVitrine}
            className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Scissors size={14} />
            <span>Explorar Vitrine</span>
          </button>
        </div>
      </div>

      {/* Navegação de Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-800 gap-1 pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('agendamentos')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'agendamentos'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Calendar size={14} />
          <span>Agendamentos ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sacola')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'sacola'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShoppingBag size={14} />
          <span>Sacola & Compras {cartItemCount > 0 ? `(${cartItemCount})` : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('fidelidade')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'fidelidade'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Sparkles size={14} />
          <span>Fidelidade & Pontos</span>
        </button>

        <button
          onClick={() => setActiveTab('saude')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'saude'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <ShieldAlert size={14} />
          <span>Ficha de Saúde</span>
        </button>

        <button
          onClick={() => setActiveTab('perfil')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'perfil'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User size={14} />
          <span>Meu Perfil</span>
        </button>

        <button
          onClick={() => setActiveTab('notificacoes')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'notificacoes'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Clock size={14} />
          <span>Notificações</span>
        </button>
      </div>

      {/* TAB 1: MEUS AGENDAMENTOS */}
      {activeTab === 'agendamentos' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Próximos Atendimentos</h3>
              <p className="text-xs text-gray-400">Horários marcados e confirmados para você</p>
            </div>

            <button
              onClick={() => onOpenBookingModal ? onOpenBookingModal() : onNavigateToVitrine()}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <Plus size={15} />
              <span>Novo Agendamento</span>
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-gray-950 border border-gray-800 rounded-2xl">
              Carregando seus agendamentos...
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="bg-gray-950 border border-gray-800 p-8 rounded-3xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Calendar size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Nenhum agendamento futuro ativo</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Que tal agendar um momento especial de cuidado no salão?
                </p>
              </div>
              <button
                onClick={() => onOpenBookingModal ? onOpenBookingModal() : onNavigateToVitrine()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                <span>Agendar Atendimento Online</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map(app => (
                <div
                  key={app.id || Math.random()}
                  className="bg-gray-950 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-amber-500/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">
                        {app.services?.name || app.service_name || 'Procedimento Estético'}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        app.status === 'confirmed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {app.status === 'confirmed' ? 'Confirmado' : 'Aguardando Confirmação'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-400" />
                      <span>{formatDateTime(app.start_time)}</span>
                      {app.professional?.name && (
                        <span>• Especialista: <strong className="text-gray-300">{app.professional.name}</strong></span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <button
                      onClick={() => handleCancelAppointment(app.id)}
                      className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <XCircle size={14} />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Histórico Passado de Atendimentos */}
          {pastAppointments.length > 0 && (
            <div className="pt-4 border-t border-gray-800/80 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Atendimentos Anteriores ({pastAppointments.length})
              </h4>
              <div className="space-y-2">
                {pastAppointments.map(app => (
                  <div key={app.id} className="p-3 bg-gray-950/80 border border-gray-800/60 rounded-xl flex items-center justify-between text-xs text-gray-400">
                    <div>
                      <span className="font-semibold text-white block">{app.services?.name || app.service_name || 'Serviço'}</span>
                      <span>{formatDateTime(app.start_time)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'concluded' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {app.status === 'concluded' ? 'Concluído' : 'Cancelado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SACOLA & COMPRAS INTEGRADAS */}
      {activeTab === 'sacola' && (
        <div className="space-y-6">
          {/* 1. Sacola Atual com Produtos Selecionados */}
          <div className="p-5 rounded-3xl bg-gray-950 border border-amber-500/25 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-white">Minha Sacola Atual</h3>
              </div>
              <span className="text-xs text-amber-400 font-semibold">{cartItemCount} itens</span>
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <ShoppingBag size={36} className="mx-auto text-gray-600" />
                <h4 className="text-sm font-bold text-white">Sua sacola está vazia no momento</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Explore os cosméticos e linhas profissionais disponíveis na nossa vitrine!
                </p>
                <button
                  onClick={onNavigateToVitrine}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-md shadow-amber-600/20"
                >
                  <Scissors size={14} />
                  <span>Ir para a Vitrine</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  {cart.map(item => (
                    <div
                      key={item.id}
                      className="p-3 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-800 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                          <span className="text-xs text-amber-400 font-semibold tabular-nums">
                            R$ {Number(item.price).toFixed(2)} un.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {onUpdateCartQuantity && (
                          <div className="flex items-center border border-gray-700 bg-black rounded-lg">
                            <button
                              onClick={() => onUpdateCartQuantity(item.id, -1)}
                              className="p-1 text-gray-400 hover:text-white"
                              title="Diminuir"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="px-2 text-xs font-bold text-white tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateCartQuantity(item.id, 1)}
                              className="p-1 text-gray-400 hover:text-white"
                              title="Aumentar"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        )}

                        {onRemoveFromCart && (
                          <button
                            onClick={() => onRemoveFromCart(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800"
                            title="Remover"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs text-gray-400">Total da Sacola:</span>
                    <span className="text-lg font-black text-amber-400 ml-2 tabular-nums">
                      R$ {cartSubtotal.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onClearCart && (
                      <button
                        onClick={onClearCart}
                        className="px-3 py-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-semibold"
                      >
                        Limpar
                      </button>
                    )}
                    <button
                      onClick={onOpenSacolaCheckout}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5"
                    >
                      <CreditCard size={15} />
                      <span>Iniciar Pagamento / Finalizar</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Histórico de Pedidos e Compras Anteriores */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarCheck size={16} className="text-amber-400" />
                <span>Histórico de Pedidos & Compras Anteriores</span>
              </h3>
              <span className="text-xs text-gray-400">{orders.length} pedidos</span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-gray-950 border border-gray-800 p-8 rounded-3xl text-center space-y-2">
                <ShoppingBag size={30} className="mx-auto text-gray-600" />
                <p className="text-xs text-gray-400">Nenhum pedido anterior registrado.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(ord => (
                  <div key={ord.id} className="p-4 bg-gray-950 border border-gray-800 rounded-2xl space-y-2.5 shadow-md">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-amber-400">Pedido #{ord.id}</span>
                      <span className="text-gray-400">{new Date(ord.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>

                    <div className="space-y-1">
                      {ord.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-300">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-semibold tabular-nums">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{ord.payment_method}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          ord.payment_status === 'pago' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {ord.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      <span className="font-bold text-amber-400 text-sm">Total: R$ {Number(ord.total_amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLUBE FIDELIDADE & PONTOS */}
      {activeTab === 'fidelidade' && (
        <div className="space-y-4">
          <LoyaltyWallet />
        </div>
      )}

      {/* TAB 4: FICHA DE SAÚDE & ALERGIAS */}
      {activeTab === 'saude' && (
        <form onSubmit={handleSaveProfile} className="bg-gray-950 border border-gray-800 p-6 rounded-3xl space-y-5 shadow-xl">
          <div className="pb-3 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert size={16} className="text-amber-400" />
              <span>Saúde, Alergias e Cuidados Pessoais</span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Informações confidenciais compartilhadas com as especialistas para garantir sua segurança em cada procedimento.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Alergias Conhecidas (química, tintura, látex, etc.)
              </label>
              <textarea
                rows={2}
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="Ex: Alergia a amônia, esmaltes com formaldeído..."
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Sensibilidade no Couro Cabeludo ou Pele
              </label>
              <textarea
                rows={2}
                value={sensitivities}
                onChange={e => setSensitivities(e.target.value)}
                placeholder="Ex: Queimação com descolorante, pele reativa..."
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Preferências de Cuidado & Finalização
              </label>
              <input
                type="text"
                value={carePreferences}
                onChange={e => setCarePreferences(e.target.value)}
                placeholder="Ex: Prefiro escova lisa sem muito óleo, café sem açúcar..."
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            {/* Profissionais Favoritos */}
            {availableProfs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <label className="text-xs font-semibold text-amber-400 block">
                  Profissionais Favoritos
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableProfs.map(prof => {
                    const isFav = favoriteProfs.includes(prof.name);
                    return (
                      <button
                        type="button"
                        key={prof.id}
                        onClick={() => handleToggleFavoriteProf(prof.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                          isFav
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                            : 'bg-gray-900 text-gray-400 border border-gray-800'
                        }`}
                      >
                        <Heart size={12} className={isFav ? 'fill-amber-400 text-amber-400' : ''} />
                        <span>{prof.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-600/20"
            >
              {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo com Sucesso!' : 'Salvar Preferências'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: MEU PERFIL */}
      {activeTab === 'perfil' && (
        <form onSubmit={handleSaveProfile} className="bg-gray-950 border border-gray-800 p-6 rounded-3xl space-y-5 shadow-xl">
          <div className="pb-3 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <User size={16} className="text-amber-400" />
              <span>Dados Pessoais & Contato</span>
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border border-amber-500/30" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-2xl">
                  {name ? name[0].toUpperCase() : 'C'}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg cursor-pointer shadow-md">
                <Upload size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div>
              <p className="text-xs font-bold text-white">Foto de Perfil</p>
              <p className="text-[11px] text-gray-400">Toque no ícone para enviar uma foto.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">E-mail Cadastrado</label>
            <input
              type="text"
              disabled
              value={user.email || ''}
              className="w-full p-2.5 bg-gray-900/50 border border-gray-800/60 rounded-xl text-xs text-gray-500 outline-none cursor-not-allowed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-600/20"
            >
              {isSaving ? 'Salvando...' : saveSuccess ? 'Perfil Atualizado!' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 6: NOTIFICAÇÕES */}
      {activeTab === 'notificacoes' && (
        <div className="space-y-4">
          <NotificationCenter onClose={() => setActiveTab('agendamentos')} />
        </div>
      )}
    </div>
  );
}
