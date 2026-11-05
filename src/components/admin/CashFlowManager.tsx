import {useState} from 'react';
import {DollarSign, ArrowUpRight, ArrowDownRight, Plus, Edit2, Trash2, Filter, FileText, Check, X, Save, Clock} from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  category: string;
  type: 'entrada' | 'saida';
  amount: number;
  date: string;
  payment_method?: string;
  status?: 'pago' | 'pendente';
  vendor?: string | null;
  due_date?: string | null;
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
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pago' | 'pendente'>('todos');
  
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
  const [status, setStatus] = useState<'pago' | 'pendente'>('pago');
  const [vendor, setVendor] = useState('');
  const [dueDate, setDueDate] = useState('');

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
    const matchesStatus = statusFilter === 'todos' || t.status === statusFilter;
    return matchesPeriod && matchesType && matchesStatus;
  });

  const totalEntradas = filtered.filter(t => t.type === 'entrada' && t.status !== 'pendente').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalSaidas = filtered.filter(t => t.type === 'saida' && t.status !== 'pendente').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPendente = filtered.filter(t => t.status === 'pendente').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const saldoCaixa = totalEntradas - totalSaidas;

  const handleOpenNew = (type: 'entrada' | 'saida' = 'entrada') => {
    setSelectedTx(null);
    setTxType(type);
    setDesc('');
    setCategory(type === 'entrada' ? 'Serviços' : 'Fornecedores & Produtos');
    setAmount('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('PIX');
    setStatus('pago');
    setVendor('');
    setDueDate('');
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
    setStatus(t.status || 'pago');
    setVendor(t.vendor || '');
    setDueDate(t.due_date ? new Date(t.due_date).toISOString().split('T')[0] : '');
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

    const payload = {
      description: desc,
      category,
      type: txType,
      amount: amountVal,
      date: new Date(txDate).toISOString(),
      payment_method: paymentMethod,
      status,
      vendor: vendor || null,
      due_date: dueDate ? new Date(dueDate).toISOString() : null
    };

    if (selectedTx) {
      await onUpdateTransaction(selectedTx.id, payload);
    } else {
      await onAddTransaction(payload);
    }
    setShowModal(false);
  };

  const handleDelete = async (t: Transaction) => {
    if (confirm(`Tem certeza que deseja excluir o lançamento "${t.description}"?`)) {
      await onDeleteTransaction(t.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Recebido</span>
            <span className="text-lg font-black text-emerald-400 block mt-0.5">
              R$ {totalEntradas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ArrowUpRight size={20} />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Pago</span>
            <span className="text-lg font-black text-rose-400 block mt-0.5">
              R$ {totalSaidas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="p-2.5 bg-rose-500/15 text-rose-400 rounded-xl border border-rose-500/20">
            <ArrowDownRight size={20} />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">A Receber/Pagar</span>
            <span className="text-lg font-black text-amber-400 block mt-0.5">
              R$ {totalPendente.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock size={20} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">Saldo Líquido</span>
            <span className={`text-lg font-black block mt-0.5 ${saldoCaixa >= 0 ? 'text-white' : 'text-red-400'}`}>
              R$ {saldoCaixa.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
          </div>
          <div className="p-2.5 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/30">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={periodFilter} 
            onChange={(e) => setPeriodFilter(e.target.value as any)}
            className="bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-amber-500"
          >
            <option value="hoje">Hoje</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mês</option>
            <option value="todos">Todo o Período</option>
          </select>

          <div className="flex bg-black p-1 rounded-xl border border-gray-800">
            <button onClick={() => setTypeFilter('todos')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${typeFilter === 'todos' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>Todos</button>
            <button onClick={() => setTypeFilter('entrada')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${typeFilter === 'entrada' ? 'bg-emerald-600 text-white' : 'text-gray-500'}`}>Entradas</button>
            <button onClick={() => setTypeFilter('saida')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${typeFilter === 'saida' ? 'bg-rose-600 text-white' : 'text-gray-500'}`}>Saídas</button>
          </div>

          <div className="flex bg-black p-1 rounded-xl border border-gray-800">
            <button onClick={() => setStatusFilter('todos')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${statusFilter === 'todos' ? 'bg-amber-600 text-white' : 'text-gray-500'}`}>Status: Tudo</button>
            <button onClick={() => setStatusFilter('pendente')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${statusFilter === 'pendente' ? 'bg-amber-600 text-white' : 'text-gray-500'}`}>Pendente</button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => handleOpenNew('entrada')} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20">
            <Plus size={16} /> <span>Lançar Entrada</span>
          </button>
          <button onClick={() => handleOpenNew('saida')} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20">
            <Plus size={16} /> <span>Lançar Despesa</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-black/40 border border-dashed border-gray-800 rounded-3xl space-y-3">
          <FileText size={32} className="mx-auto text-gray-700" />
          <p className="text-xs text-gray-500">Nenhum lançamento financeiro para este filtro.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(t => (
            <div key={t.id} className="bg-black/60 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl border ${t.type === 'entrada' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {t.type === 'entrada' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-white text-sm">{t.description}</h5>
                    {t.status === 'pendente' && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">Pendente</span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(t.date).toLocaleDateString('pt-BR')} • {t.category} {t.vendor ? `• ${t.vendor}` : ''} {t.due_date ? `• Vence: ${new Date(t.due_date).toLocaleDateString('pt-BR')}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-5">
                <span className={`text-base font-black tabular-nums ${t.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === 'entrada' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEdit(t)} className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(t)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSave} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{selectedTx ? 'Editar Lançamento' : 'Novo Lançamento'}</h4>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Descrição</label>
                <input required value={desc} onChange={e => setDesc(e.target.value)} type="text" className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none" />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Categoria</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none">
                  {(txType === 'entrada' ? categoriesEntrada : categoriesSaida).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Valor (R$)</label>
                  <input required value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-bold" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Data Lançamento</label>
                  <input required value={txDate} onChange={e => setTxDate(e.target.value)} type="date" className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Fornecedor / Origem (Opcional)</label>
                <input value={vendor} onChange={e => setVendor(e.target.value)} type="text" placeholder="Ex: L'Oréal, Aluguel Imóvel..." className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Vencimento (Opcional)</label>
                  <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none">
                    <option value="pago">{txType === 'entrada' ? 'Recebido' : 'Pago'}</option>
                    <option value="pendente">Pendente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Método de Pagamento</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none">
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-gray-900 text-gray-400 font-bold rounded-xl text-xs">Cancelar</button>
              <button type="submit" className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/20">
                <Save size={16} className="inline mr-1" /> Salvar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
