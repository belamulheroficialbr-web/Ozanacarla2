import React, {useState, useEffect} from 'react';
import {Star, History, Gift, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, Ticket} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';

export function LoyaltyWallet() {
  const {user} = useAuth();
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);

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

  const loadLoyaltyData = async () => {
    if (!user) return;
    setLoading(true);
    
    const [pRes, rRes, tRes] = await Promise.all([
      dataService.getProfile(user.id),
      dataService.getLoyaltyRewards(),
      dataService.getLoyaltyTransactions(user.id)
    ]);

    if (pRes.data) setPoints(Number(pRes.data.loyalty_points || 0));
    if (rRes.data) setRewards(rRes.data);
    if (tRes.data) setTransactions(tRes.data);
    
    setLoading(false);
  };

  const handleRedeem = async (reward: any) => {
    if (!user) return;
    if (points < reward.points_cost) {
      alert('Você ainda não tem pontos suficientes para esta recompensa.');
      return;
    }

    if (!confirm(`Deseja trocar ${reward.points_cost} pontos por "${reward.name}"?`)) return;

    setRedeemLoading(reward.id);
    const res = await dataService.redeemLoyaltyReward(user.id, reward);
    
    if (res.error) {
      alert(res.error);
    } else {
      loadLoyaltyData();
    }
    setRedeemLoading(null);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-500">Consultando sua carteira de pontos...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Saldo de Pontos Premium Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl p-6 shadow-xl shadow-amber-900/20">
        <div className="absolute -right-6 -top-6 text-white/10 rotate-12">
          <Star size={160} fill="currentColor" />
        </div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-amber-100 uppercase tracking-widest text-[10px] font-bold">
            <Ticket size={14} />
            <span>Clube Bela Mulher</span>
          </div>
          
          <div>
            <span className="text-[11px] text-amber-200 block">Seu Saldo Atual</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tabular-nums">{points}</span>
              <span className="text-sm font-bold text-amber-200">Pontos</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-1000" 
                style={{ width: `${Math.min(100, (points / 500) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-amber-100 font-bold">Meta: 500 pts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catálogo de Recompensas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gift size={16} className="text-amber-400" />
              <span>Trocar Pontos</span>
            </h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">{rewards.length} benefícios</span>
          </div>

          <div className="space-y-3">
            {rewards.map(reward => {
              const canRedeem = points >= reward.points_cost;
              return (
                <div 
                  key={reward.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    canRedeem 
                      ? 'bg-gray-900 border-gray-800 hover:border-amber-500/30' 
                      : 'bg-gray-900/40 border-gray-800/50 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white">{reward.name}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{reward.description}</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                      <Star size={10} fill="currentColor" />
                      <span>{reward.points_cost} pontos</span>
                    </div>
                  </div>

                  <button
                    disabled={!canRedeem || !!redeemLoading}
                    onClick={() => handleRedeem(reward)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${
                      canRedeem 
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {redeemLoading === reward.id ? 'Processando...' : 'Resgatar'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extrato de Pontos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History size={16} className="text-amber-400" />
              <span>Extrato de Pontos</span>
            </h3>
          </div>

          <div className="bg-gray-900/90 border border-gray-800 rounded-2xl overflow-hidden divide-y divide-gray-800/50">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-[11px] text-gray-500 italic">
                Nenhuma movimentação registrada ainda.
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="p-3 flex items-center justify-between gap-3 hover:bg-black/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {tx.amount > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white leading-none mb-1">{tx.description}</p>
                      <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                        <Clock size={10} />
                        <span>{new Date(tx.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`text-xs font-black tabular-nums ${
                    tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-center">
        <p className="text-[10px] text-gray-500 leading-relaxed">
          * Os pontos são válidos por 365 dias a partir da data de ganho. <br />
          Para utilizar um benefício resgatado, informe sua consultora no momento do atendimento.
        </p>
      </div>
    </div>
  );
}
