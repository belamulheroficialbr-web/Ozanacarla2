import {useState} from 'react';
import {DollarSign, ArrowUpRight, ArrowDownRight, Plus, Edit2, Trash2, Calendar, Filter, FileText, Check, X, Save, AlertCircle} from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  category: string;
  type: 'entrada' | 'saida';
  amount: number;
  date: string;
  payment_method?: string;
}

interface CashFlowManagerProps {
  transactions: Transaction[];
  onAddTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  onUpdateTransaction: (id: string, t: Partial<Transaction>) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export function CashFlowManager({
  transactions = [],
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}: CashFlowManagerProps) {
  const [periodFilter, setPeriodFilter] = useState<'hoje' | 'semana' | 'mes' | 'todos'>('mes');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'entrada' | 'saida'>('todos');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Form State
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Serviços');
  const [txType, setTxType] = useState<'entrada' | 'saida'>('entrada');
  const [amount, setAmount] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');

  const categoriesEntrada = ['Serviços', 'Venda de Produtos', 'Pacotes & Combos', 'Outras Entradas'];
  const categoriesSaida = ['Fornecedores & Produtos', 'Aluguel & Contas', 'Comissões da Equipe', 'Manutenção & Equipamentos', 'Marketing', 'Outras Saídas'];
  const paymentMethods = ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Transferência'];

  const filterByPeriod = (itemDateStr: string) => {
    if (!itemDateStr) return true;
    const date = new Date(itemDateStr);
    const now = new Date();

    if (periodFilter === 'hoje') {
      return date.toDateString() === now.toDateString();
    }
    if (periodFilter === 'semana') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= oneWeekAgo;
    }
    if (periodFilter === 'mes') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
  };

  const filtered = transactions.filter(t => {
    const matchesPeriod = filterByPeriod(t.date);
    const matchesType = typeFilter === 'todos' || t.type === typeFilter;
    return matchesPeriod && matchesType;
  });

  const totalEntradas = filtered.filter(t => t.type === 'entrada').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalSaidas = filtered.filter(t => t.type === 'saida').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const saldoCaixa = totalEntradas - totalSaidas;

  const handleOpenNew = (type: 'entrada' | 'saida' = 'entrada') => {
    setSelectedTx(null);
    setTxType(type);
    setDesc('');
    setCategory(type === 'entrada' ? 'Serviços' : 'Fornecedores & Produtos');
    setAmount('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('PIX');
    setShowModal(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setSelectedTx(t);
    setTxType(t.type);
    setDesc(t.description);
    setCategory(t.category);
    setAmount(t.amount.toString());
    setTxDate(t.date ? new Date(t.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setPaymentMethod(t.payment_method || 'PIX');
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) {
      alert('Informe a descrição ou origem do lançamento');
      return;
    }
    const amountVal = parseFloat(amount) || 0;
    if (amountVal <= 0) {
      alert('Informe um valor válido maior que 0');
      return;
    }

    if (selectedTx) {
      await onUpdateTransaction(selectedTx.id, {
        description: desc,
        category,
        type: txType,
        amount: amountVal,
        date: new Date(txDate).toISOString(),
        payment_method: paymentMethod
      });
    } else {
      await onAddTransaction({
        description: desc,
        category,
        type: txType,
        amount: amountVal,
        date: new Date(txDate).toISOString(),
        payment_method: paymentMethod
      });
    }
    setShowModal(false);
  };

  const handleDelete = async (t: Transaction) => {
    if (confirm(`Tem certeza que deseja excluir o lançamento "${t.description}" no valor de R$ ${t.amount.toFixed(2)}?`)) {
      await onDeleteTransaction(t.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gray-900/90 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total de Entradas</span>
            <span className="text-xl font-extrabold text-emerald-400 tabular-nums block mt-1">
              R$ {totalEntradas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ArrowUpRight size={22} />
          </div>
        </div>

        <div className="bg-gray-900/90 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400 font-medium block">Total de Saídas</span>
            <span className="text-xl font-extrabold text-rose-400 tabular-nums block mt-1">
              R$ {totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="p-3 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/20">
            <ArrowDownRight size={22} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-400 font-medium block">Saldo do Período</span>
            <span className={`text-xl font-extrabold tabular-nums block mt-1 ${saldoCaixa >= 0 ? 'text-amber-400' : 'text-red-400'}`}>
              R$ {saldoCaixa.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          {/* Period filter */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-gray-800">
            {(['hoje', 'semana', 'mes', 'todos'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriodFilter(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  periodFilter === p
                    ? 'bg-amber-500 text-black shadow-sm font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === 'hoje' ? 'Hoje' : p === 'semana' ? 'Esta Semana' : p === 'mes' ? 'Este Mês' : 'Todos'}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-gray-800">
            {(['todos', 'entrada', 'saida'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-gray-800 text-white font-bold'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'todos' ? 'Todos' : t === 'entrada' ? 'Entradas' : 'Saídas'}
              </button>
            ))}
          </div>
        </div>

        {/* New Transaction Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenNew('entrada')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Plus size={16} />
            <span>+ Nova Entrada</span>
          </button>
          <button
            onClick={() => handleOpenNew('saida')}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Plus size={16} />
            <span>+ Nova Saída</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="bg-black/60 border border-gray-800 p-8 rounded-3xl text-center space-y-3">
          <FileText size={32} className="mx-auto text-gray-600" />
          <p className="text-xs text-gray-400">Nenhum lançamento financeiro registrado neste período.</p>
          <button
            onClick={() => handleOpenNew('entrada')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Plus size={14} /> Cadastrar Lançamento
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(t => (
            <div
              key={t.id || Math.random()}
              className="bg-gray-900/90 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className={`p-2.5 rounded-2xl shrink-0 ${
                  t.type === 'entrada'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}>
                  {t.type === 'entrada' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white text-xs">{t.description}</h5>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black text-gray-400 border border-gray-800">
                      {t.category || 'Geral'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(t.date).toLocaleDateString('pt-BR')} • {t.payment_method || 'PIX'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className={`text-base font-black tabular-nums ${
                  t.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {t.type === 'entrada' ? '+' : '-'} R$ {Number(t.amount || 0).toFixed(2)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Editar lançamento"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(t)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Excluir lançamento"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TRANSACTION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {txType === 'entrada' ? <ArrowUpRight className="text-emerald-400" size={18} /> : <ArrowDownRight className="text-rose-400" size={18} />}
                <span>{selectedTx ? 'Editar Lançamento' : (txType === 'entrada' ? 'Nova Entrada (Receita)' : 'Nova Saída (Despesa)')}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Tipo de Operação</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('entrada');
                      setCategory('Serviços');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txType === 'entrada'
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-black text-gray-400 border-gray-800'
                    }`}
                  >
                    + Entrada (Receita)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('saida');
                      setCategory('Fornecedores & Produtos');
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      txType === 'saida'
                        ? 'bg-rose-600 text-white border-rose-500'
                        : 'bg-black text-gray-400 border-gray-800'
                    }`}
                  >
                    - Saída (Despesa)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Descrição / Origem *</label>
                <input
                  type="text"
                  required
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder={txType === 'entrada' ? 'Ex: Atendimento Cabelo + Hidratação Maria' : 'Ex: Compra de Esmaltes Fornecedor X'}
                  className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  >
                    {(txType === 'entrada' ? categoriesEntrada : categoriesSaida).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  >
                    {paymentMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Save size={14} />
                  <span>Salvar Lançamento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
