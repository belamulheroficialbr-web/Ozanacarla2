import React, { useState, useEffect } from 'react';
import { 
  Star, History, Gift, ArrowUpRight, ArrowDownRight, Clock, 
  CheckCircle2, Ticket, Sparkles, ShieldCheck, Copy, Check, 
  ShoppingBag, Award, Crown, Percent, ChevronRight, Calendar, 
  Zap, TrendingUp, Info, Lock, Scissors, RefreshCw
} from 'lucide-react';
import { dataService } from '../../lib/data';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface LoyaltyWalletProps {
  onNavigateToTab?: (tab: string) => void;
  onOpenSacolaCheckout?: () => void;
}

export function LoyaltyWallet({ onNavigateToTab, onOpenSacolaCheckout }: LoyaltyWalletProps) {
  const { user } = useAuth();
  
  // Data states
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({ points_per_real: 1.0, min_points_to_redeem: 100 });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'coupons' | 'history' | 'real_history'>('rewards');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyRedeemable, setOnlyRedeemable] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'earn' | 'redeem'>('all');
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);
  
  // Modal / Feedback state
  const [claimedVoucher, setClaimedVoucher] = useState<{ reward: any; code: string } | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadLoyaltyData();

      const channel = supabase
        .channel(`loyalty_sync_${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'loyalty_transactions',
          filter: `user_id=eq.${user.id}`
        }, () => {
          loadLoyaltyData();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const loadLoyaltyData = async (isManualSync = false) => {
    if (!user) return;
    if (isManualSync) setSyncing(true);
    else setLoading(true);

    try {
      // 1. Sync real history points automatically (services & orders)
      await dataService.syncLoyaltyPointsFromRealHistory(user.id);

      // 2. Fetch all data in parallel
      const [pRes, rRes, cRes, tRes, aRes, oRes, cfgRes] = await Promise.all([
        dataService.getProfile(user.id),
        dataService.getLoyaltyRewards(),
        dataService.getCoupons(),
        dataService.getLoyaltyTransactions(user.id),
        dataService.getAppointments(user.id, 'client'),
        dataService.getOrders(user.id),
        dataService.getLoyaltyConfig()
      ]);

      if (pRes.data) setPoints(Number(pRes.data.loyalty_points || 0));
      if (rRes.data) setRewards(rRes.data);
      if (cRes.data) {
        // Active coupons only
        const active = (cRes.data || []).filter((coup: any) => coup.is_active !== false);
        setCoupons(active);
      }
      if (tRes.data) setTransactions(tRes.data);
      if (aRes.data) setAppointments(aRes.data);
      if (oRes.data) setOrders(oRes.data);
      if (cfgRes.data) setConfig(cfgRes.data);

    } catch (err) {
      console.error('Erro ao carregar carteira de fidelidade:', err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Calculations for VIP Tier & History
  const totalEarned = transactions
    .filter(t => t.amount > 0)
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const totalRedeemed = Math.abs(transactions
    .filter(t => t.amount < 0)
    .reduce((acc, t) => acc + Number(t.amount || 0), 0));

  const concludedApps = appointments.filter(a => a.status === 'concluded' || a.status === 'concluido');
  const paidOrders = orders.filter(o => o.payment_status === 'pago');

  const totalSpentApps = concludedApps.reduce((acc, a) => acc + Number(a.services?.price || a.price || 0), 0);
  const totalSpentOrders = paidOrders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const totalSpentCombined = totalSpentApps + totalSpentOrders;

  // Dynamic Tier Levels (Bronze, Prata, Ouro) based on lifetime points or total spent
  const getTier = () => {
    // Level thresholds: Bronze: 0-399 | Prata: 400-999 | Ouro: 1000+
    if (totalEarned >= 1000 || totalSpentCombined >= 1000) {
      return {
        key: 'ouro',
        name: 'VIP Ouro',
        badge: '🥇 VIP OURO',
        icon: Crown,
        color: 'text-amber-300',
        bg: 'from-amber-600 via-yellow-600 to-amber-800',
        borderColor: 'border-amber-400/50',
        multiplier: '1.5x Multiplicador',
        currentPts: totalEarned,
        nextTierPts: 1000,
        nextTierName: 'Nível Máximo Atingido!',
        progress: 100,
        perks: [
          'Multiplicador 1.5x de Pontos por R$ 1 gasto',
          '10% OFF Permanente em tratamentos selecionados',
          'Taça de Espumante & Café Gourmet Cortesia no salão',
          'Agendamento VIP com prioridade máxima na agenda',
          'Brinde exclusivo da linha Ouro no mês de aniversário'
        ]
      };
    } else if (totalEarned >= 400 || totalSpentCombined >= 400) {
      const missing = 1000 - Math.max(totalEarned, Math.floor(totalSpentCombined));
      const prog = Math.min(100, Math.max(0, ((totalEarned - 400) / 600) * 100));
      return {
        key: 'prata',
        name: 'VIP Prata',
        badge: '🥈 VIP PRATA',
        icon: Award,
        color: 'text-slate-200',
        bg: 'from-slate-700 via-slate-800 to-zinc-900',
        borderColor: 'border-slate-400/50',
        multiplier: '1.2x Multiplicador',
        currentPts: totalEarned,
        nextTierPts: 1000,
        nextTierName: 'VIP Ouro',
        missingPts: missing,
        progress: prog,
        perks: [
          'Multiplicador 1.2x de Pontos por R$ 1 gasto',
          'Agendamento Prioritário na agenda dos profissionais',
          'Cupons e ofertas exclusivas para nível Prata',
          'Atendimento preferencial e mimo de aniversário'
        ]
      };
    } else {
      const missing = 400 - Math.max(totalEarned, Math.floor(totalSpentCombined));
      const prog = Math.min(100, Math.max(0, (totalEarned / 400) * 100));
      return {
        key: 'bronze',
        name: 'VIP Bronze',
        badge: '🥉 VIP BRONZE',
        icon: Star,
        color: 'text-amber-500',
        bg: 'from-amber-900/90 via-amber-950 to-gray-950',
        borderColor: 'border-amber-800/60',
        multiplier: '1.0x Padrão',
        currentPts: totalEarned,
        nextTierPts: 400,
        nextTierName: 'VIP Prata',
        missingPts: missing,
        progress: prog,
        perks: [
          '1.0 Ponto a cada R$ 1,00 gasto em serviços e produtos',
          'Acesso completo ao Catálogo de Troca de Pontos',
          'Mimo especial no mês de aniversário',
          'Notificações de promoções relâmpago em primeira mão'
        ]
      };
    }
  };

  const currentTier = getTier();

  // Redemption Action
  const handleRedeem = async (reward: any) => {
    if (!user) return;
    if (points < reward.points_cost) {
      alert(`Você precisa de mais ${reward.points_cost - points} pontos para resgatar este benefício.`);
      return;
    }

    if (!confirm(`Deseja trocar ${reward.points_cost} pontos pela recompensa "${reward.name}"?`)) return;

    setRedeemLoading(reward.id);
    const res = await dataService.redeemLoyaltyReward(user.id, reward);
    
    if (res.error) {
      alert(res.error);
    } else {
      // Generate voucher code
      const voucherCode = `BEL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      setClaimedVoucher({ reward, code: voucherCode });
      loadLoyaltyData();
    }
    setRedeemLoading(null);
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 3000);
  };

  // Filter rewards by category and point availability
  const filteredRewards = rewards.filter(r => {
    if (onlyRedeemable && points < r.points_cost) return false;
    if (selectedCategory !== 'all' && r.benefit_type !== selectedCategory) return false;
    return true;
  });

  // Filter transaction list
  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'earn') return t.amount > 0;
    if (filterType === 'redeem') return t.amount < 0;
    return true;
  });

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400 font-medium">Carregando seu Clube de Fidelidade...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* 1. CARTÃO HERO - CLUBE BELA MULHER VIP */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${currentTier.bg} rounded-3xl p-6 sm:p-8 shadow-2xl border ${currentTier.borderColor} transition-all`}>
        {/* Background Decorative Shimmer */}
        <div className="absolute -right-8 -top-8 text-white/5 rotate-12 pointer-events-none">
          <Crown size={220} fill="currentColor" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Top Bar: Title & Member ID */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-amber-200 uppercase tracking-widest text-[10px] font-black">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>Clube Bela Mulher • Fidelidade VIP</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md ${currentTier.color} bg-black/40 border-current`}>
                {currentTier.badge}
              </span>
              <button 
                onClick={() => loadLoyaltyData(true)}
                disabled={syncing}
                title="Sincronizar histórico e pontos"
                className="p-1.5 bg-black/30 hover:bg-black/60 text-amber-200 rounded-xl transition-all border border-white/10"
              >
                <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Main Balance */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
            <div className="sm:col-span-2 space-y-1">
              <span className="text-xs font-semibold text-amber-100/80 block">Seu Saldo Disponível</span>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-white tabular-nums tracking-tight">
                  {points.toLocaleString('pt-BR')}
                </span>
                <span className="text-base font-bold text-amber-200">Pontos</span>
              </div>
              <p className="text-[11px] text-amber-100/70 pt-1">
                Gaste em serviços ou produtos e troque por recompensas exclusivas.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-amber-100/80">
                <span>Total Acumulado:</span>
                <span className="font-bold text-white">+{totalEarned} pts</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-amber-100/80">
                <span>Total Resgatado:</span>
                <span className="font-bold text-amber-300">-{totalRedeemed} pts</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-amber-100/80 border-t border-white/10 pt-1.5">
                <span>Investimento Total:</span>
                <span className="font-black text-amber-300">R$ {totalSpentCombined.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Stepper Level Progression Bar */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center text-[11px] font-bold text-amber-100">
              <span className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-amber-300" />
                <span>Evolução do Nível: {currentTier.name}</span>
              </span>
              <span>{currentTier.nextTierName}</span>
            </div>

            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 rounded-full transition-all duration-1000 shadow-lg shadow-amber-500/50" 
                style={{ width: `${currentTier.progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-amber-200/90 italic">
              {currentTier.key === 'ouro' ? (
                <span>🎉 Você é cliente VIP Ouro! Aproveite todas as regalias exclusivas.</span>
              ) : (
                <span>Faltam <strong>{currentTier.missingPts} pontos</strong> para alcançar o próximo nível ({currentTier.nextTierName}).</span>
              )}
              <span>Regra: R$ 1 = {config.points_per_real || 1} Ponto</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CARD DE VANTAGENS DO NÍVEL (BENEFÍCIOS BRONZE, PRATA E OURO) */}
      <div className="bg-gray-950 border border-gray-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={18} />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Níveis e Benefícios do Clube
            </h3>
          </div>
          <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            Seu Nível: {currentTier.name} ({currentTier.multiplier})
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Bronze Tier Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentTier.key === 'bronze' 
              ? 'bg-amber-950/40 border-amber-500/50 ring-1 ring-amber-500/30' 
              : 'bg-gray-900/60 border-gray-800/80 opacity-70'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-500 flex items-center gap-1">
                🥉 VIP BRONZE
              </span>
              <span className="text-[9px] text-gray-400 font-mono">0 - 399 pts</span>
            </div>
            <p className="text-[10px] text-gray-300 font-medium mb-3">Nível inicial para todas as clientes cadastradas.</p>
            <ul className="space-y-1.5 text-[10px] text-gray-400">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-amber-500 shrink-0 mt-0.5" />
                <span>1.0 Ponto por R$ 1 gasto</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Resgate de vouchers e cupons</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-amber-500 shrink-0 mt-0.5" />
                <span>Mimo no mês de aniversário</span>
              </li>
            </ul>
          </div>

          {/* Prata Tier Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentTier.key === 'prata' 
              ? 'bg-slate-900/90 border-slate-400/60 ring-1 ring-slate-400/40' 
              : 'bg-gray-900/60 border-gray-800/80 opacity-80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-300 flex items-center gap-1">
                🥈 VIP PRATA
              </span>
              <span className="text-[9px] text-gray-400 font-mono">400 - 999 pts</span>
            </div>
            <p className="text-[10px] text-gray-300 font-medium mb-3">Bônus de pontuação e agendamento prioritário.</p>
            <ul className="space-y-1.5 text-[10px] text-gray-300">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-slate-300 shrink-0 mt-0.5" />
                <span><strong>1.2x Multiplicador</strong> (+20% bônus)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-slate-300 shrink-0 mt-0.5" />
                <span>Prioridade na fila de agendamento</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-slate-300 shrink-0 mt-0.5" />
                <span>Cupons Prata exclusivos</span>
              </li>
            </ul>
          </div>

          {/* Ouro Tier Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentTier.key === 'ouro' 
              ? 'bg-gradient-to-b from-amber-950/60 to-yellow-950/40 border-amber-400 ring-1 ring-amber-400/40' 
              : 'bg-gray-900/60 border-gray-800/80 opacity-80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1">
                🥇 VIP OURO
              </span>
              <span className="text-[9px] text-amber-400/80 font-mono">1.000+ pts</span>
            </div>
            <p className="text-[10px] text-gray-300 font-medium mb-3">Máximo nível de luxo e regalias no salão.</p>
            <ul className="space-y-1.5 text-[10px] text-amber-200">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-amber-400 shrink-0 mt-0.5" />
                <span><strong>1.5x Multiplicador</strong> (+50% bônus)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-amber-400 shrink-0 mt-0.5" />
                <span><strong>10% OFF permanente</strong> em serviços</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 size={12} className="text-amber-400 shrink-0 mt-0.5" />
                <span>Espumante & Café Gourmet cortesia</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. NAVEGAÇÃO POR ABAS DO CLUBE */}
      <div className="flex border-b border-gray-800 overflow-x-auto no-scrollbar gap-2 pb-1">
        <button
          onClick={() => setActiveTab('rewards')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'rewards'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Gift size={14} />
          <span>Trocar Pontos ({rewards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'coupons'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Ticket size={14} />
          <span>Cupons do Clube ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <History size={14} />
          <span>Extrato ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('real_history')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'real_history'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <TrendingUp size={14} />
          <span>Histórico de Consumo</span>
        </button>
      </div>

      {/* ABA 1: CATÁLOGO DE RECOMPENSAS */}
      {activeTab === 'rewards' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-950 p-3.5 border border-gray-800 rounded-2xl">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-gray-400 uppercase font-bold shrink-0">Tipo:</span>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'discount', label: 'Descontos' },
                { id: 'service', label: 'Serviços Cortesia' },
                { id: 'product', label: 'Produtos Brinde' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-gray-900 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-[10px] text-gray-300 font-bold cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={onlyRedeemable}
                onChange={e => setOnlyRedeemable(e.target.checked)}
                className="accent-amber-500 rounded"
              />
              <span>Somente resgatáveis ({rewards.filter(r => points >= r.points_cost).length})</span>
            </label>
          </div>

          {/* Grid of Rewards */}
          {filteredRewards.length === 0 ? (
            <div className="p-12 text-center bg-gray-900/40 border border-gray-800 rounded-3xl space-y-2">
              <Gift size={32} className="text-gray-600 mx-auto" />
              <p className="text-xs text-gray-400 italic">Nenhum benefício encontrado com os filtros selecionados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRewards.map(reward => {
                const canRedeem = points >= reward.points_cost;
                const progressPct = Math.min(100, Math.floor((points / reward.points_cost) * 100));

                return (
                  <div 
                    key={reward.id}
                    className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 ${
                      canRedeem 
                        ? 'bg-gray-900 border-gray-800 hover:border-amber-500/40 shadow-xl' 
                        : 'bg-gray-950/70 border-gray-900 opacity-75'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-2.5 rounded-2xl ${
                            reward.benefit_type === 'discount' ? 'bg-emerald-500/10 text-emerald-400' :
                            reward.benefit_type === 'service' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-purple-500/10 text-purple-400'
                          }`}>
                            {reward.benefit_type === 'discount' ? <Percent size={18} /> :
                             reward.benefit_type === 'service' ? <Scissors size={18} /> :
                             <Gift size={18} />}
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">{reward.name}</h4>
                            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                              {reward.benefit_type === 'discount' ? 'Desconto em R$' :
                               reward.benefit_type === 'service' ? 'Serviço Cortesia' : 'Produto Brinde'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-amber-400 flex items-center justify-end gap-1">
                            <Star size={12} fill="currentColor" />
                            <span>{reward.points_cost} pts</span>
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {reward.description || 'Apresente seu código de resgate no salão para usufruir desta vantagem.'}
                      </p>

                      {/* Points requirement progress */}
                      {!canRedeem && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                            <span>Progresso do resgate</span>
                            <span>{points} / {reward.points_cost} pts ({progressPct}%)</span>
                          </div>
                          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      disabled={!canRedeem || !!redeemLoading}
                      onClick={() => handleRedeem(reward)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        canRedeem 
                          ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20' 
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {redeemLoading === reward.id ? (
                        <span>Processando Resgate...</span>
                      ) : canRedeem ? (
                        <>
                          <Gift size={14} />
                          <span>Resgatar Recompensa</span>
                        </>
                      ) : (
                        <>
                          <Lock size={12} />
                          <span>Faltam {reward.points_cost - points} pontos</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: CUPONS DO CLUBE */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3">
            <Ticket size={20} className="text-amber-400 shrink-0" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Cupons Ativos da Comunidade Bela Mulher</h4>
              <p className="text-[10px] text-gray-400">
                Copie o código do cupom e insira na Sacola de Compras para obter descontos imediatos.
              </p>
            </div>
          </div>

          {coupons.length === 0 ? (
            <div className="p-12 text-center bg-gray-900/40 border border-gray-800 rounded-3xl text-xs text-gray-500 italic">
              Nenhum cupom ativo no momento. Volte em breve para novidades!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map(coupon => (
                <div 
                  key={coupon.id} 
                  className="bg-gray-900 border border-gray-800 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between gap-4 group hover:border-amber-500/40 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}% OFF` 
                          : `R$ ${coupon.discount_value} OFF`}
                      </span>

                      {coupon.valid_until && (
                        <span className="text-[9px] text-gray-500 flex items-center gap-1">
                          <Calendar size={10} />
                          <span>Válido até {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</span>
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Código do Cupom</span>
                      <span className="text-xl font-mono font-black text-white tracking-widest uppercase">
                        {coupon.code}
                      </span>
                    </div>

                    {coupon.min_order_amount > 0 && (
                      <p className="text-[10px] text-gray-400">
                        * Mínimo de compra: <strong className="text-gray-200">R$ {coupon.min_order_amount}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80">
                    <button
                      onClick={() => copyCouponCode(coupon.code)}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedCoupon === coupon.code ? (
                        <>
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copiar Código</span>
                        </>
                      )}
                    </button>

                    {onOpenSacolaCheckout && (
                      <button
                        onClick={onOpenSacolaCheckout}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[11px] font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1"
                      >
                        <ShoppingBag size={13} />
                        <span>Usar na Sacola</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: EXTRATO DE PONTOS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <History size={16} className="text-amber-400" />
              <span>Extrato Detalhado de Pontos</span>
            </h3>

            <div className="flex items-center gap-1 bg-gray-900 p-1 border border-gray-800 rounded-xl text-[10px] font-bold">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'all' ? 'bg-amber-600 text-white' : 'text-gray-400'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('earn')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'earn' ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
              >
                Ganhos (+)
              </button>
              <button
                onClick={() => setFilterType('redeem')}
                className={`px-2.5 py-1 rounded-lg transition-all ${filterType === 'redeem' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
              >
                Resgates (-)
              </button>
            </div>
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-3xl overflow-hidden divide-y divide-gray-800/50 shadow-xl">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500 italic">
                Nenhuma movimentação encontrada com o filtro selecionado.
              </div>
            ) : (
              filteredTransactions.map(tx => {
                const isEarn = tx.amount > 0;
                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between gap-4 hover:bg-black/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-2xl ${
                        isEarn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {isEarn ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight mb-1">{tx.description}</p>
                        <div className="flex items-center gap-2 text-[9px] text-gray-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(tx.created_at).toLocaleDateString('pt-BR')} às {new Date(tx.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span className="uppercase">{tx.type || (isEarn ? 'Bônus' : 'Resgate')}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`text-sm font-black tabular-nums shrink-0 ${
                      isEarn ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {isEarn ? '+' : ''}{tx.amount} pts
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA 4: HISTÓRICO INTEGRADO (ATENDIMENTOS E COMPRAS REAIS) */}
      {activeTab === 'real_history' && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Consumos Que Geraram Pontos</h4>
              <p className="text-[10px] text-gray-400">
                Resumo dos seus atendimentos concluídos e pedidos pagos no salão.
              </p>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('historico')}
                className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-amber-400 border border-gray-800 rounded-xl text-[11px] font-bold flex items-center gap-1"
              >
                <span>Ver Histórico Completo</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Atendimentos Concluídos */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Scissors size={14} className="text-amber-400" />
                  <span>Atendimentos Concluídos ({concludedApps.length})</span>
                </span>
                <span className="text-[10px] font-bold text-amber-400">R$ {totalSpentApps.toFixed(2)}</span>
              </div>

              {concludedApps.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic text-center py-6">Nenhum atendimento concluído ainda.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {concludedApps.slice(0, 5).map(app => (
                    <div key={app.id} className="p-2.5 bg-gray-950/70 border border-gray-800/80 rounded-xl flex items-center justify-between text-[11px]">
                      <div>
                        <p className="font-bold text-white">{app.services?.name || 'Serviço Estético'}</p>
                        <p className="text-[9px] text-gray-500">{new Date(app.date).toLocaleDateString('pt-BR')} com {app.professionals?.name || 'Profissional'}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white block">R$ {app.services?.price || app.price || 0}</span>
                        <span className="text-[9px] font-bold text-emerald-400">+{Math.floor(Number(app.services?.price || app.price || 0) * (config.points_per_real || 1))} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pedidos Pagos */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ShoppingBag size={14} className="text-amber-400" />
                  <span>Compras Pagas ({paidOrders.length})</span>
                </span>
                <span className="text-[10px] font-bold text-amber-400">R$ {totalSpentOrders.toFixed(2)}</span>
              </div>

              {paidOrders.length === 0 ? (
                <p className="text-[10px] text-gray-500 italic text-center py-6">Nenhuma compra paga registrada ainda.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {paidOrders.slice(0, 5).map(ord => (
                    <div key={ord.id} className="p-2.5 bg-gray-950/70 border border-gray-800/80 rounded-xl flex items-center justify-between text-[11px]">
                      <div>
                        <p className="font-bold text-white">Pedido #{ord.id.slice(0, 8)}</p>
                        <p className="text-[9px] text-gray-500">{ord.items?.length || 1} itens • {new Date(ord.created_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white block">R$ {ord.total_amount}</span>
                        <span className="text-[9px] font-bold text-emerald-400">+{Math.floor(Number(ord.total_amount || 0) * (config.points_per_real || 1))} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER INFORMATIVO */}
      <div className="p-4 bg-gray-950/70 border border-gray-800/80 rounded-2xl text-center">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          * Os pontos do Clube Bela Mulher são pessoais e intransferíveis, válidos por 365 dias.<br />
          Para resgatar recompensas presenciais, informe o código do voucher à recepção do salão antes do atendimento.
        </p>
      </div>

      {/* VOUCHER CONFIRMATION MODAL */}
      {claimedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-gray-900 border border-amber-500/40 rounded-3xl p-6 space-y-5 shadow-2xl text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto text-amber-400">
              <Sparkles size={32} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Parabéns! Recompensa Resgatada</span>
              <h3 className="text-lg font-bold text-white">{claimedVoucher.reward.name}</h3>
              <p className="text-xs text-gray-400">{claimedVoucher.reward.description}</p>
            </div>

            <div className="p-4 bg-black border border-gray-800 rounded-2xl space-y-1">
              <span className="text-[9px] uppercase font-bold text-gray-500 block">Código do Seu Voucher</span>
              <span className="text-2xl font-mono font-black text-amber-400 tracking-widest block">
                {claimedVoucher.code}
              </span>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed">
              Apresente este voucher na recepção do salão para utilizar seu benefício. Uma notificação com os dados também foi enviada.
            </p>

            <button
              onClick={() => setClaimedVoucher(null)}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-amber-600/20"
            >
              Concluído
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
