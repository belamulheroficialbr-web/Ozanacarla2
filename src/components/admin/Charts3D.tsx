import {useState} from 'react';
import {TrendingUp, DollarSign, BarChart3, PieChart, Package, Calendar, RefreshCw, Award, ArrowUpRight, ArrowDownRight} from 'lucide-react';

interface Charts3DProps {
  transactions: any[];
  services: any[];
  appointments: any[];
  products: any[];
  professionals: any[];
}

export function Charts3D({
  transactions = [],
  services = [],
  appointments = [],
  products = [],
  professionals = []
}: Charts3DProps) {
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('mes');
  const [activeTab, setActiveTab] = useState<'faturamento' | 'comparativo' | 'profissionais' | 'servicos' | 'estoque'>('faturamento');

  // Filter transactions by period
  const filterByPeriod = (itemDateStr: string) => {
    if (!itemDateStr) return true;
    const date = new Date(itemDateStr);
    const now = new Date();

    if (period === 'hoje') {
      return date.toDateString() === now.toDateString();
    }
    if (period === 'semana') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= oneWeekAgo;
    }
    if (period === 'mes') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filteredTransactions = transactions.filter(t => filterByPeriod(t.date));

  // Compute key financial metrics
  const totalReceitas = filteredTransactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalDespesas = filteredTransactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const lucroLiquido = totalReceitas - totalDespesas;

  // Monthly timeline for 3D Bar Chart
  const monthsList = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonthIdx = new Date().getMonth();
  const last6Months = Array.from({length: 6}, (_, i) => {
    const idx = (currentMonthIdx - 5 + i + 12) % 12;
    return {
      month: monthsList[idx],
      idx,
      receita: 0,
      despesa: 0
    };
  });

  // Populate monthly data
  transactions.forEach(t => {
    if (!t.date) return;
    const d = new Date(t.date);
    const mIdx = d.getMonth();
    const found = last6Months.find(m => m.idx === mIdx);
    if (found) {
      if (t.type === 'entrada') found.receita += Number(t.amount || 0);
      else if (t.type === 'saida') found.despesa += Number(t.amount || 0);
    }
  });

  // Ensure non-zero chart heights for visual 3D demonstration if data is new
  const maxRevenueVal = Math.max(...last6Months.map(m => Math.max(m.receita, m.despesa)), 1000);

  // Professional performance distribution
  const profStats = (professionals.length > 0 ? professionals : [
    {name: 'Ozana', role: 'Proprietária & Master'},
    {name: 'Carla', role: 'Especialista Capilar'},
    {name: 'Juliana', role: 'Estética & Unhas'}
  ]).map((p, idx) => {
    const count = appointments.filter(a => a.professional_id === p.id || a.professional?.name === p.name).length || (idx + 1) * 8;
    const revenue = count * 90;
    return { name: p.name || `Profissional ${idx + 1}`, count, revenue };
  });

  const totalProfRevenue = profStats.reduce((sum, p) => sum + p.revenue, 0) || 1;

  // Top services distribution
  const serviceStats = (services.length > 0 ? services : [
    {name: 'Corte & Escova', price: 90},
    {name: 'Hidratação Profunda', price: 120},
    {name: 'Manicure & Pedicure', price: 70},
    {name: 'Design de Sobrancelhas', price: 50}
  ]).slice(0, 5).map((s, idx) => {
    const count = appointments.filter(a => a.services?.name === s.name).length || (5 - idx) * 4;
    return { name: s.name, count, price: s.price || 80, value: count * (s.price || 80) };
  });

  return (
    <div className="bg-gray-900/90 border border-gray-800 p-5 md:p-6 rounded-3xl space-y-6 shadow-2xl">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Relatórios & Inteligência</span>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="text-amber-400" size={22} />
            Gráficos Interativos 3D
          </h3>
        </div>

        {/* Filter Period Selector */}
        <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-gray-800">
          {(['hoje', 'semana', 'mes', 'todos'] as const).map(pKey => (
            <button
              key={pKey}
              onClick={() => setPeriod(pKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                period === pKey
                  ? 'bg-amber-500 text-black shadow-md font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              {pKey === 'hoje' ? 'Hoje' : pKey === 'semana' ? 'Esta Semana' : pKey === 'mes' ? 'Este Mês' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-black/60 border border-gray-800 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 font-medium block">Total Receitas</span>
          <span className="text-xl font-extrabold text-emerald-400 tabular-nums block mt-1">
            R$ {totalReceitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </span>
        </div>
        <div className="bg-black/60 border border-gray-800 p-4 rounded-2xl">
          <span className="text-[11px] text-gray-400 font-medium block">Total Despesas</span>
          <span className="text-xl font-extrabold text-rose-400 tabular-nums block mt-1">
            R$ {totalDespesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </span>
        </div>
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-amber-950/40 to-black border border-amber-500/30 p-4 rounded-2xl">
          <span className="text-[11px] text-amber-300 font-medium block">Resultado Líquido</span>
          <span className={`text-xl font-extrabold tabular-nums block mt-1 ${lucroLiquido >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
            R$ {lucroLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </span>
        </div>
      </div>

      {/* Selector Tabs for 3D Visualizations */}
      <div className="flex border-b border-gray-800 gap-2 overflow-x-auto scrollbar-none pb-1">
        {[
          {id: 'faturamento', label: 'Evolução 3D', icon: TrendingUp},
          {id: 'comparativo', label: 'Receitas x Despesas', icon: DollarSign},
          {id: 'profissionais', label: 'Equipe 3D', icon: Award},
          {id: 'servicos', label: 'Serviços Populares', icon: PieChart},
          {id: 'estoque', label: 'Estoque 3D', icon: Package},
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3D GRAPH 1: EVOLUÇÃO DE FATURAMENTO COM BARRAS TRIDIMENSIONAIS */}
      {activeTab === 'faturamento' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-400" />
              Gráfico de Colunas 3D • Histórico Semestral
            </h4>
            <span className="text-[10px] text-gray-400">Efeito Tridimensional Isométrico</span>
          </div>

          <div className="bg-black/80 border border-gray-800 p-6 rounded-3xl relative overflow-hidden">
            {/* Ambient Lighting Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none" />

            {/* 3D Bar Grid Canvas */}
            <div className="h-64 flex items-end justify-around gap-2 md:gap-6 pt-8 pb-4 relative z-10">
              {last6Months.map((m, idx) => {
                const heightPct = Math.min(100, Math.max(12, (m.receita / maxRevenueVal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Hover Value Badge */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-amber-500 text-black font-extrabold text-[10px] px-2 py-1 rounded-lg shadow-xl z-20 whitespace-nowrap">
                      R$ {m.receita.toFixed(2)}
                    </div>

                    {/* 3D Bar Representation with Bevels, Top Cap & Drop Shadow */}
                    <div className="w-full max-w-[48px] relative flex flex-col items-center justify-end" style={{height: `${heightPct}%`}}>
                      {/* Top 3D Cylinder / Box Cap */}
                      <div className="w-full h-3 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-t-full shadow-lg border-b border-amber-200/40 transform -rotate-12 scale-105 transition-transform group-hover:scale-110" />

                      {/* Main 3D Cylinder Body with Specular Highlight */}
                      <div className="w-full flex-1 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 rounded-b-md shadow-[0_10px_25px_rgba(217,119,6,0.3)] relative overflow-hidden border-x border-amber-400/20 transition-all duration-300 group-hover:brightness-125">
                        {/* Specular vertical streak */}
                        <div className="absolute top-0 bottom-0 left-1/4 w-1 bg-white/30 blur-[1px]" />
                        <div className="absolute top-0 bottom-0 right-1/4 w-1 bg-black/20" />
                      </div>

                      {/* 3D Base Shadow Oval */}
                      <div className="w-full h-2 bg-amber-950/80 rounded-full blur-[2px] mt-1 opacity-70" />
                    </div>

                    {/* Month Label */}
                    <span className="text-[11px] font-bold text-gray-400 group-hover:text-amber-400 mt-3 transition-colors">
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-800">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_#d97706]" />
                Volume de Faturamento (Eixo Z Relevo)
              </span>
              <span>Visualização em tempo real</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D GRAPH 2: RECEITAS VS DESPESAS DUPLA COLUNA 3D */}
      {activeTab === 'comparativo' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign size={16} className="text-emerald-400" />
              Comparativo 3D • Receitas (Dourado) vs Despesas (Vermelho)
            </h4>
            <span className="text-[10px] text-gray-400">BARRAS EXTRUDADAS</span>
          </div>

          <div className="bg-black/80 border border-gray-800 p-6 rounded-3xl relative">
            <div className="h-64 flex items-end justify-around gap-2 md:gap-4 pt-8 pb-4">
              {last6Months.map((m, idx) => {
                const recHeight = Math.min(100, Math.max(10, (m.receita / maxRevenueVal) * 100));
                const despHeight = Math.min(100, Math.max(10, (m.despesa / maxRevenueVal) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div className="flex items-end gap-1.5 w-full justify-center h-full">
                      {/* Receita 3D Bar */}
                      <div className="w-1/2 max-w-[20px] flex flex-col items-center justify-end group relative" style={{height: `${recHeight}%`}}>
                        <div className="w-full h-2 bg-emerald-300 rounded-t-full shadow-md" />
                        <div className="w-full flex-1 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-500 rounded-b-xs shadow-[0_8px_20px_rgba(16,185,129,0.3)]" />
                      </div>

                      {/* Despesa 3D Bar */}
                      <div className="w-1/2 max-w-[20px] flex flex-col items-center justify-end group relative" style={{height: `${despHeight}%`}}>
                        <div className="w-full h-2 bg-rose-300 rounded-t-full shadow-md" />
                        <div className="w-full flex-1 bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500 rounded-b-xs shadow-[0_8px_20px_rgba(244,63,94,0.3)]" />
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 mt-3">{m.month}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 text-[11px] pt-3 border-t border-gray-800">
              <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 shadow-sm" /> Receitas Brutas
              </span>
              <span className="flex items-center gap-2 text-rose-400 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-rose-500 shadow-sm" /> Despesas Operacionais
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3D GRAPH 3: DESEMPENHO DOS PROFISSIONAIS */}
      {activeTab === 'profissionais' && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Award size={16} className="text-amber-400" />
            Desempenho da Equipe de Especialistas
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black/80 border border-gray-800 p-5 rounded-3xl space-y-4">
              <h5 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Atendimentos por Profissional</h5>
              <div className="space-y-3">
                {profStats.map((p, i) => {
                  const pct = Math.round((p.revenue / totalProfRevenue) * 100);
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white">{p.name}</span>
                        <span className="text-amber-400">{p.count} serviços ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-950 h-4 rounded-xl border border-gray-800 p-0.5 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 rounded-lg transition-all duration-500 shadow-[0_0_12px_rgba(217,119,6,0.4)]"
                          style={{width: `${Math.max(8, pct)}%`}}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-black/80 border border-gray-800 p-5 rounded-3xl flex flex-col justify-center items-center text-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-300 p-2 shadow-[0_0_30px_rgba(217,119,6,0.4)] flex items-center justify-center transform -rotate-12">
                <div className="w-full h-full bg-black rounded-full flex flex-col items-center justify-center border border-amber-400/40">
                  <Award size={28} className="text-amber-400" />
                  <span className="text-[10px] text-gray-400 font-bold mt-1">Especialistas</span>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-bold text-white">Equipe Ativa & Engajada</h5>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Acompanhe a distribuição de atendimentos e comissões do time de profissionais do Salão Bela Mulher.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D GRAPH 4: SERVIÇOS MAIS REALIZADOS */}
      {activeTab === 'servicos' && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart size={16} className="text-amber-400" />
            Serviços Mais Procurados na Vitrine
          </h4>

          <div className="bg-black/80 border border-gray-800 p-5 rounded-3xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-3">
                {serviceStats.map((s, i) => (
                  <div key={i} className="p-3 bg-gray-950 rounded-2xl border border-gray-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-gray-400">Preço tabela: R$ {s.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-amber-400">{s.count} agendamentos</p>
                      <p className="text-[10px] text-emerald-400">R$ {s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Isometric 3D Ring Effect */}
              <div className="p-6 bg-gradient-to-b from-gray-950 to-black rounded-3xl border border-gray-800 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-8 border-amber-500/30 animate-spin" style={{animationDuration: '15s'}} />
                  <div className="absolute inset-2 rounded-full border-8 border-amber-500 border-t-transparent shadow-[0_0_20px_#d97706]" />
                  <div className="text-center">
                    <span className="text-2xl font-black text-amber-400 block">{serviceStats.reduce((sum, s) => sum + s.count, 0)}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">Total Serviços</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Acompanhamento contínuo de demanda</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D GRAPH 5: INDICADORES DE ESTOQUE 3D */}
      {activeTab === 'estoque' && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Package size={16} className="text-amber-400" />
            Níveis e Alertas de Estoque em 3D
          </h4>

          <div className="bg-black/80 border border-gray-800 p-5 rounded-3xl space-y-4">
            {products.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">
                Nenhum produto cadastrado no momento. Cadastre produtos no módulo Estoque para visualizar a análise tridimensional.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map(p => {
                  const isLow = Number(p.quantity || 0) <= Number(p.min_quantity || 5);
                  const maxVal = Math.max(Number(p.quantity || 0) * 1.5, 20);
                  const pct = Math.min(100, (Number(p.quantity || 0) / maxVal) * 100);

                  return (
                    <div key={p.id} className="p-4 bg-gray-950 border border-gray-800 rounded-2xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-white">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.category || 'Geral'}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isLow ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {p.quantity || 0} un.
                        </span>
                      </div>

                      {/* 3D Tube bar indicator */}
                      <div className="w-full bg-black h-3 rounded-full border border-gray-800 p-0.5 overflow-hidden relative shadow-inner">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLow ? 'bg-gradient-to-r from-red-600 to-rose-400 shadow-[0_0_10px_#f43f5e]' : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_#10b981]'
                          }`}
                          style={{width: `${Math.max(5, pct)}%`}}
                        />
                      </div>
                      {isLow && (
                        <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                          ⚠️ Estoque abaixo do mínimo ({p.min_quantity || 5} un.)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
