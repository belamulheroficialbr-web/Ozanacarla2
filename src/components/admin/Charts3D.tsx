import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Calendar,
  Award,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  PieChart,
  ShoppingBag,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';

interface Charts3DProps {
  transactions?: any[];
  services?: any[];
  appointments?: any[];
  products?: any[];
  movements?: any[];
  clients?: any[];
  professionals?: any[];
}

export function Charts3D({
  transactions = [],
  services = [],
  appointments = [],
  products = [],
  movements = [],
  clients = [],
  professionals = []
}: Charts3DProps) {
  const [periodFilter, setPeriodFilter] = useState<'hoje' | '7dias' | 'mes' | '90dias' | 'todos'>('mes');
  const [activeTab, setActiveTab] = useState<'faturamento' | 'produtos_servicos' | 'equipe' | 'estoque' | 'clientes'>('faturamento');

  // Date Filtering Helper
  const filterByPeriod = (itemDateStr?: string) => {
    if (!itemDateStr) return true;
    const date = new Date(itemDateStr);
    const now = new Date();

    if (periodFilter === 'hoje') {
      return date.toDateString() === now.toDateString();
    }
    if (periodFilter === '7dias') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= past;
    }
    if (periodFilter === 'mes') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (periodFilter === '90dias') {
      const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return date >= past;
    }
    return true;
  };

  const filteredTransactions = transactions.filter(t => filterByPeriod(t.date || t.created_at));
  const filteredAppointments = appointments.filter(a => filterByPeriod(a.start_time || a.created_at));

  // Key Real Metrics
  const totalEntradas = filteredTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalSaidas = filteredTransactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const lucroLiquido = totalEntradas - totalSaidas;

  // Real Service Revenue vs Product Revenue
  const vendasProdutos = filteredTransactions
    .filter(t => t.type === 'entrada' && (t.category?.toLowerCase().includes('produto') || t.description?.toLowerCase().includes('venda')))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const vendasServicos = filteredTransactions
    .filter(t => t.type === 'entrada' && (t.category?.toLowerCase().includes('serviço') || t.description?.toLowerCase().includes('atendimento')))
    .reduce((sum, t) => sum + Number(t.amount || 0), 0) || (totalEntradas - vendasProdutos);

  // Real Monthly Bar Data (Last 6 months)
  const monthsList = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonthIdx = new Date().getMonth();
  const monthly3DData = Array.from({ length: 6 }, (_, i) => {
    const idx = (currentMonthIdx - 5 + i + 12) % 12;
    return {
      monthLabel: monthsList[idx],
      monthIdx: idx,
      receita: 0,
      despesa: 0
    };
  });

  transactions.forEach(t => {
    const dStr = t.date || t.created_at;
    if (!dStr) return;
    const mIdx = new Date(dStr).getMonth();
    const found = monthly3DData.find(m => m.monthIdx === mIdx);
    if (found) {
      if (t.type === 'entrada') found.receita += Number(t.amount || 0);
      else if (t.type === 'saida') found.despesa += Number(t.amount || 0);
    }
  });

  const maxChartVal = Math.max(...monthly3DData.flatMap(m => [m.receita, m.despesa]), 100);

  // Professional Performance
  const profStats = professionals.map(prof => {
    const pAppts = filteredAppointments.filter(a => a.professional_id === prof.id || a.professional?.name === prof.name);
    const count = pAppts.length;
    const revenue = pAppts.reduce((sum, a) => sum + Number(a.services?.price || a.price || 80), 0);
    return {
      id: prof.id,
      name: prof.name || 'Especialista',
      count,
      revenue
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Top Products from Stock
  const topProducts = [...products]
    .sort((a, b) => Number(b.quantity || 0) - Number(a.quantity || 0))
    .slice(0, 5);

  // Client Recurrence
  const recurringClientsCount = clients.filter(c => {
    const clientAppts = appointments.filter(a => a.client_id === c.id);
    return clientAppts.length > 1;
  }).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-gray-950 via-amber-950/30 to-gray-950 border border-amber-500/30 p-5 sm:p-6 rounded-3xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black shadow-lg shadow-amber-500/20 shrink-0">
            <BarChart3 size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Relatórios & Gráficos 3D Reais</span>
              <Sparkles size={18} className="text-amber-400" />
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Análise financeira e operacional alimentada por registros reais do Supabase.
            </p>
          </div>
        </div>

        {/* Period Filter Pills */}
        <div className="flex items-center gap-1.5 bg-black p-1.5 rounded-2xl border border-gray-800 self-start sm:self-center shrink-0">
          <Filter size={14} className="text-amber-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setPeriodFilter('hoje')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodFilter === 'hoje' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriodFilter('7dias')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodFilter === '7dias' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            7 Dias
          </button>
          <button
            onClick={() => setPeriodFilter('mes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodFilter === 'mes' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => setPeriodFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              periodFilter === 'todos' ? 'bg-amber-500 text-black font-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* 3D Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-gray-950 to-gray-950 border border-emerald-500/30 shadow-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest">
              Faturamento (Entradas)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-gray-400">
            {filteredTransactions.filter(t => t.type === 'entrada').length} lançamentos de receita
          </p>
        </div>

        {/* Saídas */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-red-950/40 via-gray-950 to-gray-950 border border-red-500/30 shadow-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-red-400 uppercase tracking-widest">
              Despesas (Saídas)
            </span>
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-gray-400">
            {filteredTransactions.filter(t => t.type === 'saida').length} custos e pagamentos
          </p>
        </div>

        {/* Lucro */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-950/50 via-gray-950 to-gray-950 border border-amber-500/40 shadow-xl space-y-1 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest">
              Resultado Líquido
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
          <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${lucroLiquido >= 0 ? 'text-amber-300' : 'text-red-400'}`}>
            R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-gray-400">
            Margem operacional no período
          </p>
        </div>
      </div>

      {/* Tabs for Detailed Charts */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto custom-scrollbar">
        {[
          { id: 'faturamento', label: 'Evolução do Faturamento 3D', icon: TrendingUp },
          { id: 'produtos_servicos', label: 'Produtos vs Serviços', icon: PieChart },
          { id: 'equipe', label: 'Desempenho da Equipe', icon: Award },
          { id: 'estoque', label: 'Estoque & Produtos', icon: Package },
          { id: 'clientes', label: 'Clientes & Recorrência', icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-extrabold' 
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: 3D Isometric Bar Chart */}
      {activeTab === 'faturamento' && (
        <div className="bg-gray-950 border border-amber-500/30 p-6 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-amber-400" />
                <span>Histórico Tridimensional dos Últimos 6 Meses</span>
              </h3>
              <p className="text-xs text-gray-400">
                Colunas em perspectiva 3D comparando receitas (dourado) e despesas (vermelho).
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400 shadow-sm" />
                <span className="text-gray-300">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-red-500 shadow-sm" />
                <span className="text-gray-300">Despesas</span>
              </div>
            </div>
          </div>

          {/* 3D Bar Grid */}
          <div className="pt-8 pb-4 px-2 min-h-[260px] flex items-end justify-between gap-2 sm:gap-6 border-b border-gray-800">
            {monthly3DData.map((m, idx) => {
              const recPct = maxChartVal > 0 ? Math.min(100, (m.receita / maxChartVal) * 100) : 0;
              const despPct = maxChartVal > 0 ? Math.min(100, (m.despesa / maxChartVal) * 100) : 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="w-full flex justify-center items-end gap-1 sm:gap-2 h-48">
                    {/* Receita Bar */}
                    <div className="relative w-1/2 max-w-[28px] h-full flex items-end">
                      <div
                        style={{ height: `${Math.max(8, recPct)}%` }}
                        className="w-full bg-gradient-to-t from-amber-700 via-amber-500 to-amber-300 rounded-t-lg shadow-lg shadow-amber-500/20 transition-all duration-500 transform group-hover:scale-105 border-t border-amber-200"
                        title={`Receita: R$ ${m.receita.toFixed(2)}`}
                      />
                    </div>

                    {/* Despesa Bar */}
                    <div className="relative w-1/2 max-w-[28px] h-full flex items-end">
                      <div
                        style={{ height: `${Math.max(8, despPct)}%` }}
                        className="w-full bg-gradient-to-t from-red-900 via-red-600 to-red-400 rounded-t-lg shadow-lg shadow-red-500/20 transition-all duration-500 transform group-hover:scale-105 border-t border-red-300"
                        title={`Despesa: R$ ${m.despesa.toFixed(2)}`}
                      />
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-300 group-hover:text-amber-400 transition-colors">
                    {m.monthLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Products vs Services Distribution */}
      {activeTab === 'produtos_servicos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-950 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart size={18} className="text-amber-400" />
              <span>Composição da Receita no Período</span>
            </h3>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-400">Serviços e Procedimentos</span>
                  <span className="text-white">R$ {vendasServicos.toFixed(2)}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-black overflow-hidden p-0.5 border border-gray-800">
                  <div
                    style={{ width: `${totalEntradas > 0 ? (vendasServicos / totalEntradas) * 100 : 50}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-emerald-400">Venda de Produtos Cosméticos</span>
                  <span className="text-white">R$ {vendasProdutos.toFixed(2)}</span>
                </div>
                <div className="w-full h-3 rounded-full bg-black overflow-hidden p-0.5 border border-gray-800">
                  <div
                    style={{ width: `${totalEntradas > 0 ? (vendasProdutos / totalEntradas) * 100 : 50}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DRE Summary */}
          <div className="bg-gray-950 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={18} className="text-amber-400" />
              <span>Resumo do Demonstrativo Financeiro (DRE)</span>
            </h3>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between p-3 rounded-xl bg-gray-900 text-gray-300">
                <span>Receita Bruta Total:</span>
                <strong className="text-emerald-400">R$ {totalEntradas.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-gray-900 text-gray-300">
                <span>(-) Despesas Operacionais:</span>
                <strong className="text-red-400">R$ {totalSaidas.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black">
                <span>(=) Lucro Líquido do Período:</span>
                <strong className="text-sm">R$ {lucroLiquido.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Staff Performance */}
      {activeTab === 'equipe' && (
        <div className="bg-gray-950 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award size={18} className="text-amber-400" />
            <span>Desempenho dos Profissionais (Atendimentos & Faturamento)</span>
          </h3>

          <div className="space-y-3">
            {profStats.map((prof, idx) => (
              <div key={prof.id || idx} className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 font-black flex items-center justify-center">
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{prof.name}</h4>
                    <p className="text-[11px] text-gray-400">{prof.count} procedimentos realizados</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-amber-300 block">
                    R$ {prof.revenue.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-400">faturamento gerado</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Stock & Products */}
      {activeTab === 'estoque' && (
        <div className="bg-gray-950 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Package size={18} className="text-amber-400" />
            <span>Produtos com Maior Volume em Estoque</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topProducts.map(prod => (
              <div key={prod.id} className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {prod.category}
                </span>
                <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                <div className="flex justify-between items-baseline pt-1 border-t border-gray-800 text-xs">
                  <span className="text-gray-400">Qtd: <strong className="text-white">{prod.quantity} un</strong></span>
                  <span className="text-amber-300 font-bold">R$ {Number(prod.sale_price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Clients & Recurrence */}
      {activeTab === 'clientes' && (
        <div className="bg-gray-950 border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users size={18} className="text-amber-400" />
            <span>Engajamento & Fidelização de Clientes</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
              <span className="text-xs text-gray-400 font-bold block">Total de Clientes Cadastrados</span>
              <strong className="text-2xl font-black text-white">{clients.length} clientes</strong>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-1">
              <span className="text-xs text-amber-400 font-bold block">Clientes Recorrentes (&gt;1 Atendimento)</span>
              <strong className="text-2xl font-black text-amber-300">{recurringClientsCount} clientesVIP</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
