import React, { useState, useEffect } from 'react';
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
  XCircle,
  History,
  Eye,
  FileText,
  Tag,
  Receipt,
  X,
  ChevronRight,
  Mail,
  Edit3,
  Award,
  Check,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../lib/data';
import { supabase } from '../../lib/supabase';
import { uploadMedia } from '../../lib/storage';
import { DirectChat } from './DirectChat';
import { NotificationCenter } from '../tools/NotificationCenter';
import { LoyaltyWallet } from './LoyaltyWallet';
import { CartItem } from '../SacolaModal';

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
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'agendamentos' | 'historico' | 'sacola' | 'fidelidade' | 'saude' | 'perfil' | 'chat' | 'notificacoes'
  >('agendamentos');

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

  // History Filter & Detail Modal States
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'all' | 'orders' | 'appointments'>('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<
    'all' | 'completed' | 'pending' | 'cancelled'
  >('all');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<{
    type: 'order' | 'appointment';
    data: any;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadClientData();

      // Configurar Realtime para Agendamentos e Pedidos do Cliente
      const appointmentsChannel = supabase
        .channel(`client_appointments_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `client_id=eq.${user.id}`
          },
          () => {
            loadClientData();
          }
        )
        .subscribe();

      const ordersChannel = supabase
        .channel(`client_orders_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `client_id=eq.${user.id}`
          },
          () => {
            loadClientData();
          }
        )
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
      const { data: profileData } = await dataService.getProfile(user.id);
      if (profileData) {
        setName(profileData.name || '');
        setPhone(profileData.phone || '');
        setBio(profileData.bio || '');
        setAvatarUrl(profileData.avatar_url || '');
      }

      // 2. Appointments
      const { data: appData } = await dataService.getAppointments(user.id, 'client');
      if (appData) setAppointments(appData);

      // 3. Orders / Purchases
      const { data: ordData } = await dataService.getOrders(user.id);
      if (ordData) setOrders(ordData);

      // 4. Medical Profile / Preferences
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
      await dataService.updateProfile(user.id, { avatar_url: url });
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
      // Update basic profile
      await dataService.updateProfile(user.id, {
        name,
        phone,
        bio,
        avatar_url: avatarUrl
      });

      // Update Medical info & Care Preferences
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
      return isNaN(d.getTime())
        ? 'Data a definir'
        : d.toLocaleString('pt-BR', {
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

  // Separação de atendimentos
  const upcomingAppointments = appointments.filter(
    a => a.status !== 'concluded' && a.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(
    a => a.status === 'concluded' || a.status === 'cancelled'
  );

  // Cálculo da Sacola
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Financial Metrics
  const totalSpentOrders = orders
    .filter(o => o.payment_status === 'pago')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalSpentAppointments = appointments
    .filter(a => a.status === 'concluded')
    .reduce((sum, a) => sum + Number(a.services?.price || a.price || 0), 0);
  const totalInvested = totalSpentOrders + totalSpentAppointments;

  // VIP Category Tier Calculation
  const getVipTier = (total: number) => {
    if (total >= 1000) return { name: 'VIP Ouro', color: 'text-amber-400 bg-amber-500/20 border-amber-500/40' };
    if (total >= 400) return { name: 'VIP Prata', color: 'text-slate-300 bg-slate-500/20 border-slate-400/40' };
    return { name: 'VIP Bronze', color: 'text-amber-600 bg-amber-900/20 border-amber-800/40' };
  };
  const vipTier = getVipTier(totalInvested);

  // Timeline Unificada do Histórico (Pedidos + Atendimentos)
  const historyTimeline = [
    ...orders.map(o => ({
      id: o.id,
      type: 'order' as const,
      date: new Date(o.created_at || Date.now()),
      dateStr: o.created_at,
      title: `Pedido #${o.id}`,
      subtitle: `${o.items?.length || 0} produto(s) • ${o.payment_method || 'A definir'}`,
      amount: Number(o.total_amount || 0),
      status:
        o.payment_status === 'pago'
          ? 'Pago'
          : o.delivery_status === 'cancelado' || o.payment_status === 'cancelado'
          ? 'Cancelado'
          : 'Pendente',
      rawStatus: o.payment_status || o.delivery_status,
      data: o
    })),
    ...appointments.map(a => ({
      id: a.id,
      type: 'appointment' as const,
      date: new Date(a.start_time || Date.now()),
      dateStr: a.start_time,
      title: a.services?.name || a.service_name || 'Procedimento Estético',
      subtitle: `Especialista: ${a.professional?.name || 'Profissional'}`,
      amount: Number(a.services?.price || a.price || 0),
      status:
        a.status === 'concluded'
          ? 'Concluído'
          : a.status === 'cancelled'
          ? 'Cancelado'
          : a.status === 'confirmed'
          ? 'Confirmado'
          : 'Pendente',
      rawStatus: a.status,
      data: a
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Filtragem da Timeline
  const filteredTimeline = historyTimeline.filter(item => {
    if (historyTypeFilter === 'orders' && item.type !== 'order') return false;
    if (historyTypeFilter === 'appointments' && item.type !== 'appointment') return false;

    if (historyStatusFilter === 'completed') {
      if (item.type === 'order' && item.data.payment_status !== 'pago') return false;
      if (item.type === 'appointment' && item.data.status !== 'concluded') return false;
    }
    if (historyStatusFilter === 'pending') {
      if (item.type === 'order' && item.data.payment_status === 'pago') return false;
      if (
        item.type === 'appointment' &&
        (item.data.status === 'concluded' || item.data.status === 'cancelled')
      )
        return false;
    }
    if (historyStatusFilter === 'cancelled') {
      if (
        item.type === 'order' &&
        item.data.payment_status !== 'cancelado' &&
        item.data.delivery_status !== 'cancelado'
      )
        return false;
      if (item.type === 'appointment' && item.data.status !== 'cancelled') return false;
    }

    return true;
  });

  const navigateToHistoryFilter = (filterType: 'all' | 'orders' | 'appointments') => {
    setHistoryTypeFilter(filterType);
    setActiveTab('historico');
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Área Exclusiva da Cliente</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Acesse seu perfil, agendamentos, sacola de compras, pontos de fidelidade e histórico com total privacidade.
          </p>
        </div>

        <div className="bg-gradient-to-b from-gray-950 to-gray-900 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">
                Acompanhe confirmações de horários e agende novos procedimentos online
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">
                Consulte sua sacola, histórico de compras e status de entrega
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">
                Cadastre preferências de atendimento, alergias e profissionais favoritos
              </span>
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
      {/* Visual Header do Perfil da Cliente */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-amber-500/25 p-5 sm:p-6 rounded-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            {/* Foto de Perfil / Upload */}
            <div className="relative group shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-2xl shadow-lg">
                  {name ? name[0].toUpperCase() : user.email?.[0]?.toUpperCase() || 'C'}
                </div>
              )}
              <label
                className="absolute -bottom-1 -right-1 p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg cursor-pointer shadow-md transition-all hover:scale-105"
                title="Alterar Foto"
              >
                <Upload size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            {/* Informações da Cliente */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${vipTier.color}`}>
                  {vipTier.name}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conta Verificada
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {name || user.email?.split('@')[0] || 'Cliente VIP'}
              </h2>

              <p className="text-xs text-gray-300 max-w-md line-clamp-2">
                {bio || 'Bem-vinda ao seu espaço exclusivo no Salão Bela Mulher'}
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-amber-500/80" />
                  {user.email}
                </span>
                {phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-amber-500/80" />
                    {phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Atalhos do Cabeçalho */}
          <div className="flex flex-wrap md:flex-col items-stretch sm:items-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-800">
            <button
              onClick={() => setActiveTab('perfil')}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5"
            >
              <Edit3 size={14} />
              <span>Meu Perfil & Fotos</span>
            </button>

            <button
              onClick={() => navigateToHistoryFilter('all')}
              className="flex-1 sm:flex-none px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <History size={14} className="text-amber-400" />
              <span>Ver Histórico</span>
            </button>
          </div>
        </div>

        {/* Resumo Rápido de Métricas no Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-gray-800/80">
          <div className="bg-black/40 border border-gray-800/80 p-2.5 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Total Investido</span>
            <span className="text-sm font-extrabold text-amber-400 tabular-nums">
              R$ {totalInvested.toFixed(2)}
            </span>
          </div>

          <div className="bg-black/40 border border-gray-800/80 p-2.5 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Atendimentos</span>
            <span className="text-sm font-extrabold text-white tabular-nums">
              {appointments.length} <span className="text-[10px] text-gray-400 font-normal">serviço(s)</span>
            </span>
          </div>

          <div className="bg-black/40 border border-gray-800/80 p-2.5 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Compras</span>
            <span className="text-sm font-extrabold text-white tabular-nums">
              {orders.length} <span className="text-[10px] text-gray-400 font-normal">pedido(s)</span>
            </span>
          </div>

          <div className="bg-black/40 border border-gray-800/80 p-2.5 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-gray-500 block">Status de Saúde</span>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              {allergies || sensitivities ? (
                <>
                  <ShieldAlert size={12} className="text-amber-400 shrink-0" /> Alertas Registrados
                </>
              ) : (
                <>
                  <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> Ficha Atualizada
                </>
              )}
            </span>
          </div>
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
          onClick={() => setActiveTab('perfil')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'perfil'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <User size={14} />
          <span>Meu Perfil & Dados</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`pb-3 px-3.5 text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'historico'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <History size={14} />
          <span>Histórico ({historyTimeline.length})</span>
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

      {/* TAB 1: MEU PERFIL & DADOS (EVOLUÍDO) */}
      {activeTab === 'perfil' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Card Resumo de Atividades & Atalhos ao Histórico */}
          <div className="bg-gray-950 border border-gray-800 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Award size={18} className="text-amber-400" />
                  <span>Resumo de Atividades & Compras</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Consolidado das suas experiências no Salão Bela Mulher
                </p>
              </div>

              <button
                onClick={() => navigateToHistoryFilter('all')}
                className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 self-start sm:self-center"
              >
                <span>Acessar Histórico Completo</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Total Investido */}
              <div
                onClick={() => navigateToHistoryFilter('all')}
                className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl hover:border-amber-500/40 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span>Total Investido</span>
                  <DollarSign size={14} className="text-amber-400" />
                </div>
                <p className="text-xl font-extrabold text-amber-400 tabular-nums">
                  R$ {totalInvested.toFixed(2)}
                </p>
                <span className="text-[10px] text-gray-500 block">Cuidados e cosméticos</span>
              </div>

              {/* Serviços & Atendimentos */}
              <div
                onClick={() => navigateToHistoryFilter('appointments')}
                className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl hover:border-amber-500/40 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span>Atendimentos</span>
                  <Scissors size={14} className="text-amber-400" />
                </div>
                <p className="text-xl font-extrabold text-white tabular-nums">
                  {appointments.length}
                </p>
                <span className="text-[10px] text-amber-400 block">
                  R$ {totalSpentAppointments.toFixed(2)} em procedimentos
                </span>
              </div>

              {/* Pedidos de Produtos */}
              <div
                onClick={() => navigateToHistoryFilter('orders')}
                className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl hover:border-amber-500/40 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex justify-between items-center text-xs text-gray-400 font-medium">
                  <span>Compras de Produtos</span>
                  <ShoppingBag size={14} className="text-amber-400" />
                </div>
                <p className="text-xl font-extrabold text-white tabular-nums">{orders.length}</p>
                <span className="text-[10px] text-emerald-400 block">
                  R$ {totalSpentOrders.toFixed(2)} em cosméticos
                </span>
              </div>
            </div>
          </div>

          {/* Ficha de Alergias & Observações (Exibição Dinâmica) */}
          {(allergies || sensitivities || reactiveProducts || carePreferences) && (
            <div className="bg-gray-950 border border-amber-500/30 p-5 sm:p-6 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>Observações de Saúde & Preferências Cadastradas</span>
                </h3>
                <button
                  onClick={() => setActiveTab('saude')}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Editar Ficha
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {allergies && (
                  <div className="p-3 bg-red-950/20 border border-red-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-red-400 block">
                      Alergias Conhecidas
                    </span>
                    <p className="text-gray-200 font-medium">{allergies}</p>
                  </div>
                )}

                {sensitivities && (
                  <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block">
                      Sensibilidade em Pele / Couro
                    </span>
                    <p className="text-gray-200 font-medium">{sensitivities}</p>
                  </div>
                )}

                {reactiveProducts && (
                  <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block">
                      Produtos Reativos
                    </span>
                    <p className="text-gray-200 font-medium">{reactiveProducts}</p>
                  </div>
                )}

                {carePreferences && (
                  <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-400 block">
                      Preferências de Atendimento
                    </span>
                    <p className="text-gray-200 font-medium">{carePreferences}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Formulário de Atualização do Perfil */}
          <form
            onSubmit={handleSaveProfile}
            className="bg-gray-950 border border-gray-800 p-6 rounded-3xl space-y-5 shadow-xl"
          >
            <div className="pb-3 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User size={16} className="text-amber-400" />
                  <span>Editar Dados Pessoais & Preferências</span>
                </h3>
                <p className="text-xs text-gray-400">Mantenha suas informações sempre atualizadas.</p>
              </div>

              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1 animate-in fade-in">
                  <Check size={14} /> Salvo com sucesso!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">E-mail Cadastrado</label>
              <input
                type="text"
                disabled
                value={user.email || ''}
                className="w-full p-3 bg-gray-900/50 border border-gray-800/60 rounded-xl text-xs text-gray-500 outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">
                Biografia / Sobre Mim
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Conte um pouco sobre seu estilo ou preferências..."
                className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
              />
            </div>

            {/* Preferências de Atendimento e Profissionais Favoritos */}
            <div className="pt-3 border-t border-gray-800 space-y-4">
              <div>
                <label className="text-xs font-semibold text-amber-400 block mb-1">
                  Preferências de Atendimento & Finalização
                </label>
                <input
                  type="text"
                  value={carePreferences}
                  onChange={e => setCarePreferences(e.target.value)}
                  placeholder="Ex: Prefiro escova modelada, café sem açúcar, ambiente silencioso..."
                  className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              {availableProfs.length > 0 && (
                <div className="space-y-2">
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
                              : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700'
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

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center gap-2"
              >
                {isSaving ? (
                  <span>Salvando dados...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Salvar Alterações do Perfil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MEUS AGENDAMENTOS */}
      {activeTab === 'agendamentos' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Próximos Atendimentos</h3>
              <p className="text-xs text-gray-400">Horários marcados e confirmados para você</p>
            </div>

            <button
              onClick={() => (onOpenBookingModal ? onOpenBookingModal() : onNavigateToVitrine())}
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
                onClick={() => (onOpenBookingModal ? onOpenBookingModal() : onNavigateToVitrine())}
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
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          app.status === 'confirmed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {app.status === 'confirmed' ? 'Confirmado' : 'Aguardando Confirmação'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-400" />
                      <span>{formatDateTime(app.start_time)}</span>
                      {app.professional?.name && (
                        <span>
                          • Especialista:{' '}
                          <strong className="text-gray-300">{app.professional.name}</strong>
                        </span>
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
                  <div
                    key={app.id}
                    className="p-3 bg-gray-950/80 border border-gray-800/60 rounded-xl flex items-center justify-between text-xs text-gray-400"
                  >
                    <div>
                      <span className="font-semibold text-white block">
                        {app.services?.name || app.service_name || 'Serviço'}
                      </span>
                      <span>{formatDateTime(app.start_time)}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'concluded'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {app.status === 'concluded' ? 'Concluído' : 'Cancelado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HISTÓRICO COMPLETO */}
      {activeTab === 'historico' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Cards de Resumo do Histórico */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Total Investido
              </span>
              <p className="text-2xl font-black text-amber-400 tabular-nums">
                R$ {totalInvested.toFixed(2)}
              </p>
              <span className="text-[10px] text-gray-500 block">Cuidados e compras no salão</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Pedidos / Compras
              </span>
              <p className="text-2xl font-black text-white tabular-nums">{orders.length}</p>
              <span className="text-[10px] text-emerald-400 block">
                Cosméticos e produtos adquiridos
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Atendimentos
              </span>
              <p className="text-2xl font-black text-white tabular-nums">{appointments.length}</p>
              <span className="text-[10px] text-amber-400 block">Serviços e agendamentos</span>
            </div>
          </div>

          {/* Filtros da Timeline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gray-950 border border-gray-800 rounded-2xl">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-gray-400 font-bold mr-1">Exibir:</span>
              <button
                onClick={() => setHistoryTypeFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  historyTypeFilter === 'all'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Todos ({historyTimeline.length})
              </button>
              <button
                onClick={() => setHistoryTypeFilter('orders')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  historyTypeFilter === 'orders'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Pedidos ({orders.length})
              </button>
              <button
                onClick={() => setHistoryTypeFilter('appointments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  historyTypeFilter === 'appointments'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'bg-gray-900 text-gray-400 hover:text-white'
                }`}
              >
                Serviços ({appointments.length})
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-bold mr-1">Status:</span>
              <select
                value={historyStatusFilter}
                onChange={e => setHistoryStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-black border border-gray-800 rounded-xl text-xs text-amber-400 outline-none"
              >
                <option value="all">Todos os Status</option>
                <option value="completed">Concluídos / Pagos</option>
                <option value="pending">Pendentes</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>
          </div>

          {/* Timeline de Registros */}
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 bg-gray-950 border border-gray-800 rounded-3xl">
              Carregando histórico completo de compras e atendimentos...
            </div>
          ) : filteredTimeline.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-gray-950 border border-gray-800 rounded-3xl">
              <History size={36} className="mx-auto text-gray-700" />
              <h4 className="text-sm font-bold text-white">Nenhum registro encontrado</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Não há pedidos ou agendamentos que correspondam aos filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTimeline.map(item => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-amber-500/40 transition-colors shadow-lg"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`p-3 rounded-2xl shrink-0 mt-0.5 ${
                        item.type === 'order'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {item.type === 'order' ? <ShoppingBag size={18} /> : <Scissors size={18} />}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-900 text-gray-400 border border-gray-800">
                          {item.type === 'order' ? 'Pedido / Compra' : 'Atendimento / Serviço'}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.status === 'Pago' || item.status === 'Concluído'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : item.status === 'Cancelado'
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                      <p className="text-xs text-gray-400">{item.subtitle}</p>

                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-0.5">
                        <Clock size={12} className="text-amber-400" />
                        <span>Data: {formatDateTime(item.dateStr)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800/60 shrink-0">
                    <span className="text-base font-black text-amber-400 tabular-nums">
                      R$ {item.amount.toFixed(2)}
                    </span>

                    <button
                      onClick={() => setSelectedHistoryItem({ type: item.type, data: item.data })}
                      className="px-3.5 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-amber-500/40 text-gray-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <Eye size={13} className="text-amber-400" />
                      <span>Ver Detalhes</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SACOLA & COMPRAS */}
      {activeTab === 'sacola' && (
        <div className="space-y-6 animate-in fade-in duration-200">
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
                  <div
                    key={ord.id}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-2xl space-y-2.5 shadow-md"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold text-amber-400">Pedido #{ord.id}</span>
                      <span className="text-gray-400">
                        {new Date(ord.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {ord.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs text-gray-300">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="font-semibold tabular-nums">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{ord.payment_method}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.payment_status === 'pago'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {ord.payment_status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      <span className="font-bold text-amber-400 text-sm">
                        Total: R$ {Number(ord.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CLUBE FIDELIDADE */}
      {activeTab === 'fidelidade' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <LoyaltyWallet 
            onNavigateToTab={(tab) => setActiveTab(tab as any)}
            onOpenSacolaCheckout={onOpenSacolaCheckout}
          />
        </div>
      )}

      {/* TAB 6: FICHA DE SAÚDE */}
      {activeTab === 'saude' && (
        <form
          onSubmit={handleSaveProfile}
          className="bg-gray-950 border border-gray-800 p-6 rounded-3xl space-y-5 shadow-xl animate-in fade-in duration-200"
        >
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
                Produtos Reativos / Restrições
              </label>
              <input
                type="text"
                value={reactiveProducts}
                onChange={e => setReactiveProducts(e.target.value)}
                placeholder="Ex: Não tolera perfumes fortes..."
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
              {isSaving ? 'Salvando...' : saveSuccess ? 'Salvo com Sucesso!' : 'Salvar Ficha de Saúde'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 7: NOTIFICAÇÕES */}
      {activeTab === 'notificacoes' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <NotificationCenter onClose={() => setActiveTab('agendamentos')} />
        </div>
      )}

      {/* Modal de Detalhes do Registro do Histórico */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
            {/* Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-950 to-gray-900">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${
                    selectedHistoryItem.type === 'order'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {selectedHistoryItem.type === 'order' ? <ShoppingBag size={20} /> : <Scissors size={20} />}
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                    {selectedHistoryItem.type === 'order'
                      ? 'Detalhes da Compra'
                      : 'Detalhes do Atendimento'}
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {selectedHistoryItem.type === 'order'
                      ? `Pedido #${selectedHistoryItem.data.id}`
                      : selectedHistoryItem.data.services?.name ||
                        selectedHistoryItem.data.service_name ||
                        'Procedimento Estético'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {selectedHistoryItem.type === 'order' ? (
                <>
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900/60 border border-gray-800 rounded-2xl text-xs">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">
                        Data da Compra
                      </span>
                      <span className="text-gray-200 font-medium">
                        {new Date(selectedHistoryItem.data.created_at || Date.now()).toLocaleString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">
                        Forma de Pagamento
                      </span>
                      <span className="text-gray-200 font-medium">
                        {selectedHistoryItem.data.payment_method || 'A definir'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">
                        Situação do Pagamento
                      </span>
                      <span
                        className={`font-bold capitalize ${
                          selectedHistoryItem.data.payment_status === 'pago'
                            ? 'text-emerald-400'
                            : selectedHistoryItem.data.payment_status === 'cancelado'
                            ? 'text-red-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {selectedHistoryItem.data.payment_status || 'pendente'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold block">
                        Status da Entrega
                      </span>
                      <span className="text-amber-400 font-bold capitalize">
                        {selectedHistoryItem.data.delivery_status || 'em separação'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                      Produtos Comprados
                    </h4>
                    <div className="space-y-2">
                      {selectedHistoryItem.data.items?.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-800 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                                PROD
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{item.name}</p>
                              <span className="text-[11px] text-gray-400">
                                {item.quantity}x R$ {Number(item.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-amber-400 tabular-nums">
                            R$ {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedHistoryItem.data.notes && (
                    <div className="p-3 bg-gray-900/40 border border-gray-800 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] text-gray-500 font-bold uppercase block">
                        Observações de Envio/Retirada
                      </span>
                      <p className="text-gray-300">{selectedHistoryItem.data.notes}</p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl space-y-2 text-xs">
                    {selectedHistoryItem.data.subtotal > 0 && (
                      <div className="flex justify-between text-gray-400">
                        <span>Subtotal:</span>
                        <span>R$ {Number(selectedHistoryItem.data.subtotal).toFixed(2)}</span>
                      </div>
                    )}
                    {selectedHistoryItem.data.discount_amount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Desconto ({selectedHistoryItem.data.coupon_applied || 'Cupom'}):</span>
                        <span>- R$ {Number(selectedHistoryItem.data.discount_amount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
                      <span>Valor Total Pago:</span>
                      <span className="text-amber-400 tabular-nums">
                        R$ {Number(selectedHistoryItem.data.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl space-y-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Situação do Agendamento:</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            selectedHistoryItem.data.status === 'concluded'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : selectedHistoryItem.data.status === 'confirmed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : selectedHistoryItem.data.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {selectedHistoryItem.data.status === 'concluded'
                            ? 'Atendimento Concluído'
                            : selectedHistoryItem.data.status === 'confirmed'
                            ? 'Confirmado'
                            : selectedHistoryItem.data.status === 'cancelled'
                            ? 'Cancelado'
                            : 'Aguardando Confirmação'}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-2 border-t border-gray-800">
                        <p className="flex justify-between text-gray-300">
                          <span>Data e Horário:</span>
                          <strong className="text-white">
                            {formatDateTime(selectedHistoryItem.data.start_time)}
                          </strong>
                        </p>
                        <p className="flex justify-between text-gray-300">
                          <span>Especialista Responsável:</span>
                          <strong className="text-amber-400">
                            {selectedHistoryItem.data.professional?.name ||
                              selectedHistoryItem.data.professional_name ||
                              'Equipe Bela Mulher'}
                          </strong>
                        </p>
                        <p className="flex justify-between text-gray-300">
                          <span>Duração Estimada:</span>
                          <span className="text-gray-200">
                            {selectedHistoryItem.data.duration_minutes || 60} minutos
                          </span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-sm font-bold">
                        <span className="text-white">Valor do Serviço:</span>
                        <span className="text-amber-400 tabular-nums">
                          R${' '}
                          {Number(
                            selectedHistoryItem.data.services?.price ||
                              selectedHistoryItem.data.price ||
                              0
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-950 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold rounded-xl text-xs transition-colors"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discrete Visual Footer */}
      <div className="pt-6 pb-2 text-center border-t border-gray-800/60 text-[11px] text-gray-500 font-medium">
        Ambiente protegido • Painel seguro Bela Mulher
      </div>
    </div>
  );
}
