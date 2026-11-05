import React, {useState, useEffect} from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  BarChart3,
  FileText,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Scissors
} from 'lucide-react';
import {dataService} from '../../lib/data';
import {supabase} from '../../lib/supabase';

export function FinancialDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    loadFinanceData();

    const channel = supabase
      .channel('finance_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => loadFinanceData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commissions' }, () => loadFinanceData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadFinanceData = async () => {
    setLoading(true);
    const [mRes, cRes, tRes] = await Promise.all([
      dataService.getFinancialMetrics(),
      dataService.getCommissions(),
      dataService.getTransactions()
    ]);
    if (mRes.data) setMetrics(mRes.data);
    if (cRes.data) setCommissions(cRes.data);
    if (tRes.data) setTransactions(tRes.data);
    setLoading(false);
  };

  const handlePayCommission = async (id: string) => {
    if (!confirm('Confirmar pagamento desta comissão?')) return;
    const res = await dataService.payCommission(id);
    if (res.success) {
      loadFinanceData();
    }
  };

  // Filter transactions for DRE
  const filteredTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  // DRE Simplificada
  const revenueByPeriod = filteredTransactions.filter(t => t.type === 'entrada').reduce((sum, t) => sum + Number(t.amount), 0);
  const expensesByPeriod = filteredTransactions.filter(t => t.type === 'saida').reduce((sum, t) => sum + Number(t.amount), 0);
  const netProfit = revenueByPeriod - expensesByPeriod;

  if (loading) return <div className="p-8 text-center text-xs text-gray-500">Calculando fluxos financeiros...</div>;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Saldo em Caixa</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            R$ {(metrics?.total_revenue - metrics?.total_expenses || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </div>
          <p className="text-[10px] text-gray-500">Total acumulado (Pago)</p>
        </div>

        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2 border-emerald-500/10">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Receitas Totais</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tabular-nums">
            R$ {(metrics?.total_revenue || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </div>
          <p className="text-[10px] text-emerald-500/60 flex items-center gap-1">
            <ArrowUpRight size={10} /> + R$ {metrics?.daily_revenue} hoje
          </p>
        </div>

        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2 border-red-500/10">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Despesas Totais</span>
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 tabular-nums">
            R$ {(metrics?.total_expenses || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </div>
          <p className="text-[10px] text-red-500/60">Contas fixas e variáveis</p>
        </div>

        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2 border-amber-500/10">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Pendente Geral</span>
            <Clock size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 tabular-nums">
            R$ {(metrics?.pending_receivables + metrics?.pending_payables || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </div>
          <p className="text-[10px] text-amber-500/60">A pagar e a receber</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Extrato de Comissões */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users size={16} className="text-amber-400" />
              <span>Controle de Comissões</span>
            </h3>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Aguardando Pagamento</span>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900 border-b border-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-widest">
                <tr>
                  <th className="px-4 py-3">Profissional</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Comissão</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {commissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-600">Sem comissões pendentes no momento.</td>
                  </tr>
                ) : (
                  commissions.map(comm => (
                    <tr key={comm.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{comm.professional?.name}</p>
                        <p className="text-[10px] text-gray-500">Ref: {comm.created_at.split('T')[0]}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-400 italic">
                        {comm.appointment?.services?.name || 'Serviço'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-amber-400 font-bold">R$ {Number(comm.commission_amount).toFixed(2)}</span>
                        <span className="text-[10px] text-gray-600 ml-1">({comm.commission_rate}%)</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          comm.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {comm.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {comm.status === 'pending' && (
                          <button
                            onClick={() => handlePayCommission(comm.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition-all"
                          >
                            PAGAR
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DRE Simplificada */}
        <div className="space-y-4">
          <div className="p-5 bg-gray-950 border border-gray-800 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText size={16} className="text-amber-400" />
                <span>DRE Simplificada</span>
              </h3>
              <div className="flex gap-1">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-800 text-[10px] text-gray-400 p-1 rounded outline-none focus:border-amber-500"
                >
                  {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-800 text-[10px] text-gray-400 p-1 rounded outline-none focus:border-amber-500"
                >
                  {[2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 uppercase font-bold tracking-widest text-[10px]">(+) Faturamento Bruto</span>
                <span className="text-emerald-400 font-black tabular-nums">R$ {revenueByPeriod.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 uppercase font-bold tracking-widest text-[10px]">(-) Custos & Despesas</span>
                <span className="text-red-400 font-black tabular-nums">R$ {expensesByPeriod.toFixed(2)}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                <span className="text-sm font-bold text-white uppercase tracking-tighter">(=) Lucro Líquido</span>
                <div className="text-right">
                   <p className={`text-xl font-black tabular-nums ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    R$ {netProfit.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-gray-500 italic">Margem: {((netProfit / (revenueByPeriod || 1)) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <BarChart3 size={18} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Saúde Financeira</p>
                <p className="text-xs font-bold text-white">
                  {netProfit > 0 ? 'Operação no Azul' : 'Atenção ao Fluxo'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <h5 className="text-[10px] font-bold text-amber-500 uppercase mb-2">Resumo da Operação</h5>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Média Ticket (Período)</span>
                <span className="text-gray-300 font-bold">R$ {(revenueByPeriod / (filteredTransactions.filter(t => t.type === 'entrada').length || 1)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Comprometimento com Comissões</span>
                <span className="text-gray-300 font-bold">R$ {commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
