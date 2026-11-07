import React, { useState, useEffect, useMemo } from 'react';
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
  Scissors,
  ShoppingBag,
  Package,
  Award,
  Sparkles,
  PieChart,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Save,
  Check,
  Download,
  Printer
} from 'lucide-react';
import { dataService } from '../../lib/data';
import { supabase } from '../../lib/supabase';
import { exportToCSV, printFormattedReport } from '../../lib/exportUtils';

export function FinancialDashboard() {
  // Real Data states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Time Filter states
  const [periodFilter, setPeriodFilter] = useState<'hoje' | 'semana' | 'mes' | 'ultimos_30' | 'ano' | 'custom'>('mes');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Tab & View State
  const [activeTab, setActiveTab] = useState<'overview' | 'breakdown' | 'rankings' | 'commissions' | 'transactions'>('overview');

  // Quick Modal Lançamento
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Serviços');
  const [txType, setTxType] = useState<'entrada' | 'saida'>('entrada');
  const [amount, setAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');

  useEffect(() => {
    loadAllFinanceData();

    const channel = supabase
      .channel('finance_dashboard_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => loadAllFinanceData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commissions' }, () => loadAllFinanceData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadAllFinanceData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => loadAllFinanceData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadAllFinanceData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, oRes, aRes, pRes, sRes] = await Promise.all([
        dataService.getTransactions(),
        dataService.getCommissions(),
        dataService.getOrders(),
        dataService.getAppointments('admin', 'admin'),
        dataService.getProducts(),
        dataService.getServices()
      ]);

      if (tRes.data) setTransactions(tRes.data);
      if (cRes.data) setCommissions(cRes.data);
      if (oRes.data) setOrders(oRes.data);
      if (aRes.data) setAppointments(aRes.data);
      if (pRes.data) setProducts(pRes.data);
      if (sRes.data) setServices(sRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err);
    } finally {
      setLoading(false);
    }
  };

  // Date Filtering Logic
  const isDateInFilter = (dateStr: string) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const now = new Date();

    if (periodFilter === 'hoje') {
      return date.toDateString() === now.toDateString();
    }
    if (periodFilter === 'semana') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= sevenDaysAgo;
    }
    if (periodFilter === 'mes') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    if (periodFilter === 'ultimos_30') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return date >= thirtyDaysAgo;
    }
    if (periodFilter === 'ano') {
      return date.getFullYear() === now.getFullYear();
    }
    if (periodFilter === 'custom') {
      const start = new Date(`${customStartDate}T00:00:00`);
      const end = new Date(`${customEndDate}T23:59:59`);
      return date >= start && date <= end;
    }
    return true;
  };

  // Filtered Arrays
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => isDateInFilter(t.date));
  }, [transactions, periodFilter, customStartDate, customEndDate]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => isDateInFilter(o.created_at));
  }, [orders, periodFilter, customStartDate, customEndDate]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => isDateInFilter(a.created_at || a.date));
  }, [appointments, periodFilter, customStartDate, customEndDate]);

  const filteredCommissions = useMemo(() => {
    return commissions.filter(c => isDateInFilter(c.created_at));
  }, [commissions, periodFilter, customStartDate, customEndDate]);

  // Consolidated Financial Metrics Calculation
  const metrics = useMemo(() => {
    // 1. Transactions breakdown
    const paidEntradas = filteredTransactions.filter(t => t.type === 'entrada' && t.status !== 'pendente');
    const paidSaidas = filteredTransactions.filter(t => t.type === 'saida' && t.status !== 'pendente');

    const totalEntradas = paidEntradas.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalSaidas = paidSaidas.reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const pendingEntradas = filteredTransactions.filter(t => t.type === 'entrada' && t.status === 'pendente').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const pendingSaidas = filteredTransactions.filter(t => t.type === 'saida' && t.status === 'pendente').reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // 2. Revenue breakdown by category
    const reversalCats = ['Estorno de Venda', 'Estorno de Atendimento'];
    const totalReversals = filteredTransactions
      .filter(t => t.type === 'saida' && reversalCats.includes(t.category))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    // Faturamento por Serviços
    const serviceTxRevenue = paidEntradas
      .filter(t => t.category === 'Serviços')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const concludedApps = filteredAppointments.filter(a => a.status === 'concluded' || a.status === 'concluido');
    const appServicesRevenue = concludedApps.reduce((sum, a) => sum + Number(a.services?.price || a.price || 0), 0);
    const totalServiceRevenue = Math.max(serviceTxRevenue, appServicesRevenue);

    // Faturamento por Produtos
    const productTxRevenue = paidEntradas
      .filter(t => t.category === 'Venda de Produtos')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const paidOrdersList = filteredOrders.filter(o => o.payment_status === 'pago');
    const orderProductsRevenue = paidOrdersList.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const totalProductRevenue = Math.max(productTxRevenue, orderProductsRevenue);

    const totalGrossRevenue = totalServiceRevenue + totalProductRevenue;
    const netRevenue = Math.max(0, totalGrossRevenue - totalReversals);

    // 3. Commissions breakdown
    const totalCommissionsGenerated = filteredCommissions.reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
    const totalCommissionsPaid = filteredCommissions
      .filter(c => c.status === 'paid' || c.status === 'pago')
      .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
    const totalCommissionsPending = filteredCommissions
      .filter(c => c.status === 'pending' || c.status === 'pendente')
      .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

    // 4. Net Profit / Result
    const netProfit = netRevenue - totalSaidas;

    return {
      totalEntradas,
      totalSaidas,
      pendingEntradas,
      pendingSaidas,
      totalReversals,
      totalServiceRevenue,
      totalProductRevenue,
      totalGrossRevenue,
      netRevenue,
      totalCommissionsGenerated,
      totalCommissionsPaid,
      totalCommissionsPending,
      netProfit,
      marginPercent: totalGrossRevenue > 0 ? ((netProfit / totalGrossRevenue) * 100).toFixed(1) : '0.0'
    };
  }, [filteredTransactions, filteredOrders, filteredAppointments, filteredCommissions]);

  // Top Products Sold Ranking
  const topProducts = useMemo(() => {
    const productMap: Record<string, { name: string; quantity: number; revenue: number }> = {};

    filteredOrders
      .filter(o => o.payment_status === 'pago' && o.items)
      .forEach(o => {
        (o.items || []).forEach((item: any) => {
          const key = item.id || item.name;
          if (!productMap[key]) {
            productMap[key] = {
              name: item.name || 'Produto',
              quantity: 0,
              revenue: 0
            };
          }
          const qty = Number(item.quantity || 1);
          const unitPrice = Number(item.price || 0);
          productMap[key].quantity += qty;
          productMap[key].revenue += qty * unitPrice;
        });
      });

    return Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  // Top Services Performed Ranking
  const topServices = useMemo(() => {
    const serviceMap: Record<string, { name: string; count: number; revenue: number }> = {};

    filteredAppointments
      .filter(a => a.status === 'concluded' || a.status === 'concluido')
      .forEach(a => {
        const sName = a.services?.name || 'Procedimento Estético';
        const key = a.service_id || sName;
        if (!serviceMap[key]) {
          serviceMap[key] = {
            name: sName,
            count: 0,
            revenue: 0
          };
        }
        const sPrice = Number(a.services?.price || a.price || 0);
        serviceMap[key].count += 1;
        serviceMap[key].revenue += sPrice;
      });

    return Object.values(serviceMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredAppointments]);

  // Chart Data Preparation (Grouped by Date or Month)
  const chartPoints = useMemo(() => {
    const datesMap: Record<string, { dateLabel: string; entradas: number; saidas: number }> = {};

    // Generate last 7 days or date groups depending on filter
    const now = new Date();
    const daysCount = periodFilter === 'hoje' ? 1 : periodFilter === 'semana' ? 7 : periodFilter === 'mes' ? 15 : 30;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const dateLabel = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      datesMap[key] = { dateLabel, entradas: 0, saidas: 0 };
    }

    filteredTransactions.forEach(t => {
      const key = (t.date || '').split('T')[0];
      if (datesMap[key] && t.status !== 'pendente') {
        if (t.type === 'entrada') datesMap[key].entradas += Number(t.amount || 0);
        if (t.type === 'saida') datesMap[key].saidas += Number(t.amount || 0);
      }
    });

    return Object.values(datesMap);
  }, [filteredTransactions, periodFilter]);

  const maxChartVal = useMemo(() => {
    const maxVal = Math.max(
      100,
      ...chartPoints.map(p => Math.max(p.entradas, p.saidas))
    );
    return maxVal;
  }, [chartPoints]);

  // Handle Commission Payout Action
  const handlePayCommission = async (id: string) => {
    if (!confirm('Confirmar pagamento desta comissão para o profissional?')) return;
    const res = await dataService.payCommission(id);
    if (res.success) {
      loadAllFinanceData();
    } else {
      alert('Falha ao processar pagamento de comissão.');
    }
  };

  // Quick Transaction Modal Handlers
  const handleOpenNewTx = (type: 'entrada' | 'saida' = 'entrada') => {
    setSelectedTx(null);
    setTxType(type);
    setDesc('');
    setCategory(type === 'entrada' ? 'Serviços' : 'Fornecedores & Produtos');
    setAmount('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('PIX');
    setStatus('pago');
    setShowModal(true);
  };

  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount) || 0;
    if (val <= 0) {
      alert('Informe um valor válido maior que R$ 0,00');
      return;
    }

    const payload = {
      description: desc,
      category,
      type: txType,
      amount: val,
      date: new Date(txDate).toISOString(),
      payment_method: paymentMethod,
      status
    };

    await dataService.addTransaction(payload);
    setShowModal(false);
    loadAllFinanceData();
  };

  const handleDeleteTx = async (id: string) => {
    if (confirm('Deseja excluir este lançamento financeiro?')) {
      await dataService.deleteTransaction(id);
      loadAllFinanceData();
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)', 'Status', 'Método Pagamento'];
    const rows = filteredTransactions.map(t => [
      t.id,
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description,
      t.category,
      t.type,
      Number(t.amount || 0).toFixed(2),
      t.status || 'pago',
      t.payment_method || 'PIX'
    ]);

    exportToCSV(`relatorio_financeiro_${periodFilter}_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handlePrintPDF = () => {
    const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)', 'Status'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description,
      t.category,
      t.type === 'entrada' ? 'ENTRADA' : 'SAÍDA',
      `R$ ${Number(t.amount || 0).toFixed(2)}`,
      (t.status || 'pago').toUpperCase()
    ]);

    const summaryCards = [
      { label: 'Receitas Recebidas', value: `R$ ${metrics.totalEntradas.toFixed(2)}` },
      { label: 'Despesas Pagas', value: `R$ ${metrics.totalSaidas.toFixed(2)}` },
      { label: 'Comissões Pagas', value: `R$ ${metrics.totalCommissionsPaid.toFixed(2)}` },
      { label: 'Lucro Líquido Real', value: `R$ ${metrics.netProfit.toFixed(2)}` }
    ];

    printFormattedReport(
      'Demonstrativo do Resultado do Exercício (DRE)',
      `Relatório Financeiro Período: ${periodFilter.toUpperCase()}`,
      headers,
      rows,
      summaryCards
    );
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400 font-medium">Carregando métricas e lançamentos reais do caixa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* 1. SELETOR DE PERÍODO & AÇÕES RÁPIDAS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-gray-950 border border-gray-800 rounded-3xl shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider flex items-center gap-1.5 mr-1">
            <Filter size={14} className="text-amber-400" />
            <span>Período:</span>
          </span>

          {[
            { id: 'hoje', label: 'Hoje' },
            { id: 'semana', label: 'Esta Semana' },
            { id: 'mes', label: 'Este Mês' },
            { id: 'ultimos_30', label: 'Últimos 30 dias' },
            { id: 'ano', label: 'Este Ano' },
            { id: 'custom', label: 'Personalizado' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                periodFilter === p.id
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs if selected */}
        {periodFilter === 'custom' && (
          <div className="flex items-center gap-2 bg-black p-1.5 rounded-2xl border border-gray-800 text-xs">
            <input 
              type="date"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="bg-transparent text-white border-none outline-none text-[11px]"
            />
            <span className="text-gray-500">até</span>
            <input 
              type="date"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="bg-transparent text-white border-none outline-none text-[11px]"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenNewTx('entrada')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Entrada</span>
          </button>
          <button
            onClick={() => handleOpenNewTx('saida')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-600/20 flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Despesa</span>
          </button>
          <button
            onClick={handleExportCSV}
            title="Exportar para Excel (CSV)"
            className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-amber-400 text-xs font-bold rounded-xl transition-all border border-gray-800 flex items-center gap-1.5"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            onClick={handlePrintPDF}
            title="Imprimir Relatório (PDF)"
            className="px-3 py-2 bg-gray-900 hover:bg-gray-800 text-amber-400 text-xs font-bold rounded-xl transition-all border border-gray-800 flex items-center gap-1.5"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={loadAllFinanceData}
            title="Atualizar dados"
            className="p-2 bg-gray-900 hover:bg-gray-800 text-gray-300 rounded-xl border border-gray-800 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 2. KPIS CONSOLIDADOS DO PERÍODO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita Bruta Recebida */}
        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2 border-emerald-500/20 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Receitas Recebidas</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 tabular-nums">
            R$ {metrics.totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-900">
            <span>Serviços + Produtos</span>
            <span className="text-emerald-400/80 font-bold">Lançamentos reais</span>
          </div>
        </div>

        {/* Despesas Pagas */}
        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2 border-rose-500/20 shadow-xl">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Despesas Pagas</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <TrendingDown size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 tabular-nums">
            R$ {metrics.totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-900">
            <span>Contas + Comissões + Estoque</span>
            <span className="text-rose-400/80 font-bold">Saídas efetuadas</span>
          </div>
        </div>

        {/* Comissões da Equipe */}
        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2 border-amber-500/20 shadow-xl">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Comissões (Total)</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Users size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 tabular-nums">
            R$ {metrics.totalCommissionsGenerated.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-900">
            <span>Pagas: R$ {metrics.totalCommissionsPaid.toFixed(2)}</span>
            <span className="text-amber-400 font-bold">Pendente: R$ {metrics.totalCommissionsPending.toFixed(2)}</span>
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className={`bg-gray-950 border p-5 rounded-3xl space-y-2 shadow-xl ${
          metrics.netProfit >= 0 ? 'border-amber-500/40 bg-gradient-to-br from-amber-950/20 to-gray-950' : 'border-red-500/40 bg-red-950/20'
        }`}>
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Lucro Líquido Real</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <DollarSign size={16} />
            </div>
          </div>
          <div className={`text-2xl font-black tabular-nums ${metrics.netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
            R$ {metrics.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center justify-between text-[10px] text-amber-200/80 pt-1 border-t border-amber-500/20">
            <span>Margem de Lucro:</span>
            <span className="font-bold">{metrics.marginPercent}%</span>
          </div>
        </div>
      </div>

      {/* 3. SUB-NAVEGAÇÃO DO PAINEL */}
      <div className="flex border-b border-gray-800 overflow-x-auto no-scrollbar gap-2 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <BarChart3 size={14} />
          <span>Visão Geral & DRE</span>
        </button>

        <button
          onClick={() => setActiveTab('breakdown')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'breakdown'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <PieChart size={14} />
          <span>Serviços vs Produtos</span>
        </button>

        <button
          onClick={() => setActiveTab('rankings')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'rankings'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Award size={14} />
          <span>Top Mais Vendidos</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'commissions'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Users size={14} />
          <span>Comissões ({filteredCommissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <FileText size={14} />
          <span>Extrato de Lançamentos ({filteredTransactions.length})</span>
        </button>
      </div>

      {/* ABA 1: VISÃO GERAL & DRE & GRÁFICO */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Gráfico de Evolução (2 Colunas) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 size={18} className="text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Evolução de Receitas x Despesas no Período
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Receitas
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" /> Despesas
                  </span>
                </div>
              </div>

              {/* Bar Chart Visual Render */}
              <div className="h-56 pt-6 flex items-end justify-between gap-2 border-b border-gray-800 pb-2 overflow-x-auto no-scrollbar">
                {chartPoints.map((pt, idx) => {
                  const entHeightPct = Math.min(100, Math.max(4, Math.floor((pt.entradas / maxChartVal) * 100)));
                  const saiHeightPct = Math.min(100, Math.max(4, Math.floor((pt.saidas / maxChartVal) * 100)));

                  return (
                    <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-12 bg-black border border-gray-700 p-1.5 rounded-xl text-[9px] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap shadow-2xl">
                        <p className="font-bold text-amber-400">{pt.dateLabel}</p>
                        <p className="text-emerald-400">+ R$ {pt.entradas.toFixed(2)}</p>
                        <p className="text-rose-400">- R$ {pt.saidas.toFixed(2)}</p>
                      </div>

                      <div className="w-full flex items-end justify-center gap-1 h-40">
                        {/* Receitas Bar */}
                        <div 
                          className="w-1/2 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                          style={{ height: `${entHeightPct}%` }}
                        />
                        {/* Despesas Bar */}
                        <div 
                          className="w-1/2 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                          style={{ height: `${saiHeightPct}%` }}
                        />
                      </div>

                      <span className="text-[9px] text-gray-500 font-mono truncate w-full text-center">
                        {pt.dateLabel}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-400">
                <span>* Barras calculadas com base nos lançamentos liquidados no período</span>
                <span>Pico Máximo: <strong>R$ {maxChartVal.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Pendências Gerais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">A Receber (Pendente)</span>
                  <span className="text-lg font-black text-amber-400 block">
                    R$ {metrics.pendingEntradas.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl">
                  <Clock size={18} />
                </div>
              </div>

              <div className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-bold block">A Pagar (Contas Pendentes)</span>
                  <span className="text-lg font-black text-rose-400 block">
                    R$ {metrics.pendingSaidas.toFixed(2)}
                  </span>
                </div>
                <div className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl">
                  <Clock size={18} />
                </div>
              </div>
            </div>
          </div>

          {/* DRE Simplificada (1 Coluna) */}
          <div className="space-y-4">
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText size={16} className="text-amber-400" />
                  <span>DRE do Período</span>
                </h3>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold uppercase">
                  {periodFilter}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">(+) Receita de Serviços</span>
                  <span className="text-white font-bold font-mono">R$ {metrics.totalServiceRevenue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">(+) Receita de Produtos</span>
                  <span className="text-white font-bold font-mono">R$ {metrics.totalProductRevenue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-900 font-bold">
                  <span className="text-gray-300 uppercase text-[10px] tracking-wider">(=) Receita Bruta Total</span>
                  <span className="text-amber-400 font-mono">R$ {metrics.totalGrossRevenue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">(-) Estornos e Cancelamentos</span>
                  <span className="text-rose-400 font-bold font-mono">R$ {metrics.totalReversals.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-900 font-bold">
                  <span className="text-gray-300 uppercase text-[10px] tracking-wider">(=) Receita Líquida</span>
                  <span className="text-white font-mono">R$ {metrics.netRevenue.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">(-) Despesas & Fornecedores</span>
                  <span className="text-rose-400 font-bold font-mono">R$ {metrics.totalSaidas.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">(-) Comissões da Equipe</span>
                  <span className="text-amber-400 font-bold font-mono">R$ {metrics.totalCommissionsPaid.toFixed(2)}</span>
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-xs font-black uppercase text-amber-300">(=) Lucro Líquido Real</span>
                  <div className="text-right">
                    <span className={`text-lg font-black font-mono block ${metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      R$ {metrics.netProfit.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-gray-500 font-bold">Margem: {metrics.marginPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: DETALHAMENTO DE SERVIÇOS VS PRODUTOS */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Faturamento por Serviços */}
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scissors size={18} className="text-amber-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Faturamento com Serviços
                  </h3>
                </div>
                <span className="text-xs font-black text-amber-400">
                  R$ {metrics.totalServiceRevenue.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Total arrecadado com procedimentos estéticos e atendimentos concluídos na agenda.
              </p>

              <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Atendimentos Concluídos no Período:</span>
                  <span className="text-white font-bold">
                    {filteredAppointments.filter(a => a.status === 'concluded' || a.status === 'concluido').length} procedimentos
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Participação no Faturamento Total:</span>
                  <span className="text-amber-400 font-bold">
                    {metrics.totalGrossRevenue > 0 
                      ? ((metrics.totalServiceRevenue / metrics.totalGrossRevenue) * 100).toFixed(1) 
                      : '0.0'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Faturamento por Produtos */}
            <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Faturamento com Produtos
                  </h3>
                </div>
                <span className="text-xs font-black text-emerald-400">
                  R$ {metrics.totalProductRevenue.toFixed(2)}
                </span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Total arrecadado com vendas de cosméticos, produtos de manutenção e itens de loja.
              </p>

              <div className="p-4 bg-gray-900 rounded-2xl border border-gray-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Pedidos Pagos na Sacola:</span>
                  <span className="text-white font-bold">
                    {filteredOrders.filter(o => o.payment_status === 'pago').length} pedidos
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Participação no Faturamento Total:</span>
                  <span className="text-emerald-400 font-bold">
                    {metrics.totalGrossRevenue > 0 
                      ? ((metrics.totalProductRevenue / metrics.totalGrossRevenue) * 100).toFixed(1) 
                      : '0.0'}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Bar Comparison */}
          <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Distribuição Proporcional da Receita</h4>
            <div className="h-4 bg-gray-900 rounded-full overflow-hidden flex p-0.5 border border-gray-800">
              <div 
                className="h-full bg-amber-500 rounded-l-full transition-all duration-500"
                style={{ 
                  width: `${metrics.totalGrossRevenue > 0 ? (metrics.totalServiceRevenue / metrics.totalGrossRevenue) * 100 : 50}%` 
                }}
              />
              <div 
                className="h-full bg-emerald-500 rounded-r-full transition-all duration-500"
                style={{ 
                  width: `${metrics.totalGrossRevenue > 0 ? (metrics.totalProductRevenue / metrics.totalGrossRevenue) * 100 : 50}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full" /> Servicios ({metrics.totalGrossRevenue > 0 ? ((metrics.totalServiceRevenue / metrics.totalGrossRevenue) * 100).toFixed(1) : 0}%)
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Produtos ({metrics.totalGrossRevenue > 0 ? ((metrics.totalProductRevenue / metrics.totalGrossRevenue) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: RANKINGS - TOP PRODUTOS E SERVIÇOS */}
      {activeTab === 'rankings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Top Serviços Mais Realizados */}
          <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Scissors size={18} className="text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Serviços Mais Realizados
                </h3>
              </div>
              <span className="text-[10px] text-gray-500">Com base nos atendimentos</span>
            </div>

            {topServices.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-8">Nenhum atendimento registrado no período.</p>
            ) : (
              <div className="space-y-3">
                {topServices.map((s, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0 ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {idx + 1}º
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-white">{s.name}</h5>
                        <p className="text-[10px] text-gray-400">{s.count} realizações</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono">
                      R$ {s.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Produtos Mais Vendidos */}
          <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Package size={18} className="text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Produtos Mais Vendidos
                </h3>
              </div>
              <span className="text-[10px] text-gray-500">Com base nas vendas da sacola</span>
            </div>

            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-8">Nenhuma venda de produto registrada no período.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, idx) => (
                  <div key={idx} className="p-3.5 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        idx === 0 ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {idx + 1}º
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-white">{p.name}</h5>
                        <p className="text-[10px] text-gray-400">{p.quantity} unidades vendidas</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      R$ {p.revenue.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: COMISSÕES DA EQUIPE */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users size={16} className="text-amber-400" />
              <span>Controle de Comissões por Profissional</span>
            </h3>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
              Pendente Total: R$ {metrics.totalCommissionsPending.toFixed(2)}
            </span>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900 border-b border-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-widest">
                <tr>
                  <th className="px-4 py-3">Profissional</th>
                  <th className="px-4 py-3">Ref. Atendimento</th>
                  <th className="px-4 py-3">Valor Comissão</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {filteredCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-600 italic">
                      Nenhuma comissão registrada para este período.
                    </td>
                  </tr>
                ) : (
                  filteredCommissions.map(comm => (
                    <tr key={comm.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-bold text-white">
                        {comm.professional?.name || comm.professional_id || 'Especialista'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-[11px]">
                        {comm.appointment?.services?.name || 'Serviço'} • {new Date(comm.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-amber-400 font-bold font-mono">
                          R$ {Number(comm.commission_amount || 0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-1">({comm.commission_rate || 0}%)</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                          comm.status === 'paid' || comm.status === 'pago' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {comm.status === 'paid' || comm.status === 'pago' ? 'PAGO' : 'PENDENTE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(comm.status === 'pending' || comm.status === 'pendente') && (
                          <button
                            onClick={() => handlePayCommission(comm.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-xl transition-all shadow-md shadow-emerald-600/20"
                          >
                            PAGAR COMISSÃO
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
      )}

      {/* ABA 5: EXTRATO COMPLETO DE LANÇAMENTOS */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-amber-400" />
              <span>Extrato Real de Lançamentos ({filteredTransactions.length})</span>
            </h3>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-xl divide-y divide-gray-900">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-500 italic">
                Nenhum lançamento financeiro encontrado no período.
              </div>
            ) : (
              filteredTransactions.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-2xl ${
                      tx.type === 'entrada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {tx.type === 'entrada' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-white">{tx.description}</h5>
                        {tx.status === 'pendente' && (
                          <span className="px-1.5 py-0.5 text-[8px] font-black uppercase bg-amber-500/10 text-amber-400 rounded">
                            Pendente
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {new Date(tx.date).toLocaleDateString('pt-BR')} • {tx.category} • {tx.payment_method || 'PIX'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-black font-mono ${
                      tx.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {tx.type === 'entrada' ? '+' : '-'} R$ {Number(tx.amount || 0).toFixed(2)}
                    </span>

                    <button
                      onClick={() => handleDeleteTx(tx.id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* QUICK TRANSACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleSaveTx} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {txType === 'entrada' ? 'Novo Lançamento de Entrada' : 'Novo Lançamento de Despesa'}
              </h4>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white font-bold">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Descrição / Origem</label>
                <input 
                  required
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ex: Pagamento Fornecedor L'Oréal / Atendimento Presencial"
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Categoria</label>
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                >
                  {txType === 'entrada' ? (
                    <>
                      <option value="Serviços">Serviços</option>
                      <option value="Venda de Produtos">Venda de Produtos</option>
                      <option value="Outras Entradas">Outras Entradas</option>
                    </>
                  ) : (
                    <>
                      <option value="Fornecedores & Produtos">Fornecedores & Produtos</option>
                      <option value="Aluguel & Contas">Aluguel & Contas</option>
                      <option value="Comissões da Equipe">Comissões da Equipe</option>
                      <option value="Manutenção & Equipamentos">Manutenção & Equipamentos</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Outras Saídas">Outras Saídas</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Valor (R$)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Data</label>
                  <input 
                    required
                    type="date"
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Método de Pagamento</label>
                  <select 
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Status</label>
                  <select 
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                  >
                    <option value="pago">{txType === 'entrada' ? 'Recebido' : 'Pago'}</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-900 text-gray-400 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/20"
              >
                Salvar Lançamento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
