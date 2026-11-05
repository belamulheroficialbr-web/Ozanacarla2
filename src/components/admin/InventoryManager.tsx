import React, {useState, useMemo} from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Search,
  Check,
  RefreshCw,
  Layers,
  History,
  Save,
  X,
  DollarSign,
  TrendingUp,
  BarChart3,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Filter
} from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
  min_quantity: number;
  updated_at?: string;
  image_url?: string;
  description?: string;
}

export interface Movement {
  id: string;
  product_id: string;
  product_name: string;
  type: 'entrada' | 'saida' | 'perda' | 'ajuste';
  quantity: number;
  reason: string;
  date: string;
  unit_cost?: number;
  total_cost?: number;
  related_id?: string;
}

export interface InventoryManagerProps {
  products: Product[];
  movements: Movement[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onRecordMovement: (movement: Omit<Movement, 'id'>) => Promise<void>;
  onAddTransaction?: (transaction: any) => Promise<void>;
}

export function InventoryManager({
  products = [],
  movements = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRecordMovement,
  onAddTransaction
}: InventoryManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'produtos' | 'movimentacoes' | 'relatorios'>('produtos');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'baixo' | 'esgotado' | 'normal'>('todos');
  
  // Movement filter
  const [movementTypeFilter, setMovementTypeFilter] = useState<'todos' | 'entrada' | 'saida' | 'perda' | 'ajuste'>('todos');
  const [movementSearch, setMovementSearch] = useState('');
  const [reportPeriod, setReportPeriod] = useState<'7dias' | '30dias' | 'mes' | 'todos'>('mes');

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Product Form State
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Capilar');
  const [prodCost, setProdCost] = useState('');
  const [prodSale, setProdSale] = useState('');
  const [prodQty, setProdQty] = useState('');
  const [prodMinQty, setProdMinQty] = useState('5');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');

  // Movement Form State
  const [movProductId, setMovProductId] = useState('');
  const [movType, setMovType] = useState<'entrada' | 'saida' | 'perda' | 'ajuste'>('entrada');
  const [movQty, setMovQty] = useState('1');
  const [movReason, setMovReason] = useState('Reposição de estoque');
  const [movUnitCost, setMovUnitCost] = useState('');
  const [launchCashFlowExpense, setLaunchCashFlowExpense] = useState(true);
  const [adjustmentTargetQty, setAdjustmentTargetQty] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState<'delta' | 'target'>('target');

  const categories = [
    'Capilar',
    'Unhas & Esmaltes',
    'Estética',
    'Maquiagem',
    'Tratamentos',
    'Descartáveis & Materiais',
    'Geral'
  ];

  // Key Calculations
  const totalItemsCount = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  }, [products]);

  const totalCostValue = useMemo(() => {
    return products.reduce((sum, p) => sum + ((Number(p.cost_price) || 0) * (Number(p.quantity) || 0)), 0);
  }, [products]);

  const totalSaleValue = useMemo(() => {
    return products.reduce((sum, p) => sum + ((Number(p.sale_price) || 0) * (Number(p.quantity) || 0)), 0);
  }, [products]);

  const estimatedProfit = totalSaleValue - totalCostValue;
  const markupPercentage = totalCostValue > 0 ? ((totalSaleValue - totalCostValue) / totalCostValue) * 100 : 0;

  const lowStockProducts = useMemo(() => {
    return products.filter(p => Number(p.quantity) <= Number(p.min_quantity || 5) && Number(p.quantity) > 0);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter(p => Number(p.quantity) <= 0);
  }, [products]);

  const normalStockProducts = useMemo(() => {
    return products.filter(p => Number(p.quantity) > Number(p.min_quantity || 5));
  }, [products]);

  // Product Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'todas' || p.category === categoryFilter;
      
      let matchesStatus = true;
      if (statusFilter === 'baixo') {
        matchesStatus = Number(p.quantity) <= Number(p.min_quantity || 5) && Number(p.quantity) > 0;
      } else if (statusFilter === 'esgotado') {
        matchesStatus = Number(p.quantity) <= 0;
      } else if (statusFilter === 'normal') {
        matchesStatus = Number(p.quantity) > Number(p.min_quantity || 5);
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // Movement Filter Logic
  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const matchesType = movementTypeFilter === 'todos' || m.type === movementTypeFilter;
      const matchesSearch = m.product_name.toLowerCase().includes(movementSearch.toLowerCase()) ||
                            m.reason?.toLowerCase().includes(movementSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [movements, movementTypeFilter, movementSearch]);

  // Handlers for modals
  const handleOpenNewProduct = () => {
    setSelectedProduct(null);
    setProdName('');
    setProdCategory('Capilar');
    setProdCost('');
    setProdSale('');
    setProdQty('10');
    setProdMinQty('5');
    setProdDescription('');
    setProdImageUrl('');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setSelectedProduct(p);
    setProdName(p.name);
    setProdCategory(p.category || 'Capilar');
    setProdCost(p.cost_price?.toString() || '0');
    setProdSale(p.sale_price?.toString() || '0');
    setProdQty(p.quantity?.toString() || '0');
    setProdMinQty(p.min_quantity?.toString() || '5');
    setProdDescription(p.description || '');
    setProdImageUrl(p.image_url || '');
    setShowProductModal(true);
  };

  const handleOpenMovementModal = (p?: Product, defaultType: 'entrada' | 'saida' | 'perda' | 'ajuste' = 'entrada') => {
    const targetProduct = p || products[0] || null;
    setSelectedProduct(targetProduct);
    setMovProductId(targetProduct?.id || '');
    setMovType(defaultType);
    setMovQty('1');
    setMovUnitCost(targetProduct?.cost_price ? targetProduct.cost_price.toString() : '');
    setAdjustmentTargetQty(targetProduct ? targetProduct.quantity.toString() : '0');
    setAdjustmentMode('target');
    setLaunchCashFlowExpense(defaultType === 'entrada');

    if (defaultType === 'entrada') {
      setMovReason('Compra de Reposição - Fornecedor');
    } else if (defaultType === 'saida') {
      setMovReason('Uso em Procedimento no Salão');
    } else if (defaultType === 'perda') {
      setMovReason('Avaria / Produto Danificado');
    } else {
      setMovReason('Ajuste de Balanço / Inventário Físico');
    }
    setShowMovementModal(true);
  };

  const handleSelectProductInMovementModal = (productId: string) => {
    setMovProductId(productId);
    const prod = products.find(p => p.id === productId);
    if (prod) {
      setSelectedProduct(prod);
      setMovUnitCost(prod.cost_price?.toString() || '');
      setAdjustmentTargetQty(prod.quantity.toString());
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) {
      alert('Informe o nome do produto');
      return;
    }

    const costVal = parseFloat(prodCost) || 0;
    const saleVal = parseFloat(prodSale) || 0;
    const qtyVal = parseInt(prodQty) || 0;
    const minQtyVal = parseInt(prodMinQty) || 5;

    const payload = {
      name: prodName.trim(),
      category: prodCategory,
      cost_price: costVal,
      sale_price: saleVal,
      quantity: Math.max(0, qtyVal),
      min_quantity: Math.max(1, minQtyVal),
      description: prodDescription.trim(),
      image_url: prodImageUrl.trim() || undefined,
      updated_at: new Date().toISOString()
    };

    if (selectedProduct) {
      await onUpdateProduct(selectedProduct.id, payload);
    } else {
      await onAddProduct(payload);
    }
    setShowProductModal(false);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = selectedProduct || products.find(p => p.id === movProductId);
    if (!prod) {
      alert('Selecione um produto para a movimentação');
      return;
    }

    let calculatedQuantity = 0;
    let newStockQuantity = prod.quantity;

    if (movType === 'ajuste') {
      if (adjustmentMode === 'target') {
        const target = parseInt(adjustmentTargetQty);
        if (isNaN(target) || target < 0) {
          alert('Informe uma contagem física válida (0 ou superior)');
          return;
        }
        calculatedQuantity = Math.abs(target - prod.quantity);
        newStockQuantity = target;
      } else {
        const delta = parseInt(movQty) || 0;
        if (delta === 0) {
          alert('Informe uma quantidade de ajuste diferente de 0');
          return;
        }
        calculatedQuantity = Math.abs(delta);
        newStockQuantity = Math.max(0, prod.quantity + delta);
      }
    } else {
      const qtyNum = parseInt(movQty) || 0;
      if (qtyNum <= 0) {
        alert('Informe uma quantidade válida superior a 0');
        return;
      }
      calculatedQuantity = qtyNum;

      if ((movType === 'saida' || movType === 'perda') && qtyNum > prod.quantity) {
        if (!confirm(`Atenção: A quantidade informada (${qtyNum}) é superior ao estoque atual (${prod.quantity}). Deseja zerar o estoque deste item?`)) {
          return;
        }
        newStockQuantity = 0;
      } else if (movType === 'entrada') {
        newStockQuantity = prod.quantity + qtyNum;
      } else {
        newStockQuantity = Math.max(0, prod.quantity - qtyNum);
      }
    }

    const unitCostNum = parseFloat(movUnitCost) || prod.cost_price || 0;
    const totalCostNum = unitCostNum * calculatedQuantity;
    const movementDate = new Date().toISOString();
    const movementId = `mov-${Date.now()}`;

    // 1. Record the movement in history
    await onRecordMovement({
      product_id: prod.id,
      product_name: prod.name,
      type: movType,
      quantity: calculatedQuantity,
      reason: movReason.trim() || 'Movimentação manual de estoque',
      unit_cost: unitCostNum,
      total_cost: totalCostNum,
      date: movementDate
    });

    // 2. Update Product Quantity
    await onUpdateProduct(prod.id, {
      quantity: newStockQuantity,
      cost_price: movType === 'entrada' && unitCostNum > 0 ? unitCostNum : prod.cost_price,
      updated_at: movementDate
    });

    // 3. Optional integration with Caixa (Transactions) for 'entrada'
    if (movType === 'entrada' && launchCashFlowExpense && totalCostNum > 0 && onAddTransaction) {
      await onAddTransaction({
        description: `Compra Estoque: ${calculatedQuantity}x ${prod.name}`,
        category: 'Fornecedores & Produtos',
        type: 'saida',
        amount: totalCostNum,
        date: movementDate,
        payment_method: 'PIX',
        status: 'pago',
        related_id: movementId,
        related_type: 'stock_purchase',
        vendor: movReason.includes('Fornecedor') ? movReason : undefined
      });
    }

    setShowMovementModal(false);
  };

  const handleDeleteProduct = async (p: Product) => {
    if (confirm(`Tem certeza que deseja remover o produto "${p.name}"? O histórico de movimentações anteriores será mantido.`)) {
      await onDeleteProduct(p.id);
    }
  };

  // Helper for type styling
  const getTypeBadge = (type: Movement['type']) => {
    switch (type) {
      case 'entrada':
        return {
          label: 'Entrada',
          icon: ArrowUpRight,
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      case 'saida':
        return {
          label: 'Saída',
          icon: ArrowDownRight,
          classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        };
      case 'perda':
        return {
          label: 'Perda',
          icon: Flame,
          classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
        };
      case 'ajuste':
        return {
          label: 'Ajuste',
          icon: SlidersHorizontal,
          classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Produtos</span>
            <Package size={15} className="text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">{products.length}</span>
            <span className="text-[10px] text-gray-500 block">Cadastrados</span>
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Físico Total</span>
            <Layers size={15} className="text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-black text-white">{totalItemsCount}</span>
            <span className="text-[10px] text-gray-500 block">Unidades em estoque</span>
          </div>
        </div>

        <div 
          onClick={() => { setActiveSubTab('produtos'); setStatusFilter('baixo'); }}
          className={`bg-gray-950 border p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all hover:border-amber-500/50 ${
            lowStockProducts.length > 0 ? 'border-amber-500/40 bg-amber-950/10' : 'border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Estoque Baixo</span>
            <AlertTriangle size={15} />
          </div>
          <div className="mt-2">
            <span className={`text-xl font-black ${lowStockProducts.length > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
              {lowStockProducts.length}
            </span>
            <span className="text-[10px] text-gray-500 block">Abaixo do mínimo</span>
          </div>
        </div>

        <div 
          onClick={() => { setActiveSubTab('produtos'); setStatusFilter('esgotado'); }}
          className={`bg-gray-950 border p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all hover:border-rose-500/50 ${
            outOfStockProducts.length > 0 ? 'border-rose-500/40 bg-rose-950/10' : 'border-gray-800'
          }`}
        >
          <div className="flex items-center justify-between text-rose-400 text-[10px] font-bold uppercase tracking-wider">
            <span>Esgotados</span>
            <XCircle size={15} />
          </div>
          <div className="mt-2">
            <span className={`text-xl font-black ${outOfStockProducts.length > 0 ? 'text-rose-400' : 'text-gray-400'}`}>
              {outOfStockProducts.length}
            </span>
            <span className="text-[10px] text-gray-500 block">0 unidades</span>
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Valor Custo</span>
            <DollarSign size={15} className="text-gray-400" />
          </div>
          <div className="mt-2">
            <span className="text-base font-black text-gray-200 tabular-nums">
              R$ {totalCostValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
            <span className="text-[10px] text-gray-500 block">Patrimônio investido</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-950 to-black border border-amber-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-amber-500 text-[10px] font-bold uppercase tracking-wider">
            <span>Potencial Venda</span>
            <TrendingUp size={15} />
          </div>
          <div className="mt-2">
            <span className="text-base font-black text-amber-400 tabular-nums">
              R$ {totalSaleValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
            <span className="text-[10px] text-emerald-400 block font-semibold">
              +R$ {estimatedProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})} margem
            </span>
          </div>
        </div>
      </div>

      {/* 2. Critical Alert Banner */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="bg-gradient-to-r from-amber-950/40 via-gray-900 to-gray-950 border border-amber-500/40 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300 flex items-center gap-2">
                <span>Atenção: Itens com Estoque Crítico ou Esgotado</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-400">
                  {lowStockProducts.length + outOfStockProducts.length} itens
                </span>
              </h4>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {outOfStockProducts.length > 0 && (
                  <strong className="text-rose-400 mr-2">
                    {outOfStockProducts.length} esgotado(s): {outOfStockProducts.map(p => p.name).join(', ')}.
                  </strong>
                )}
                {lowStockProducts.length > 0 && (
                  <span className="text-amber-300">
                    {lowStockProducts.length} abaixo do mínimo: {lowStockProducts.map(p => `${p.name} (${p.quantity} un.)`).join(', ')}.
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveSubTab('produtos');
                setStatusFilter('baixo');
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs rounded-xl transition-colors"
            >
              Filtrar Críticos
            </button>
            <button
              onClick={() => handleOpenMovementModal(outOfStockProducts[0] || lowStockProducts[0], 'entrada')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Registrar Reposição</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs and Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setActiveSubTab('produtos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'produtos'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <Package size={15} />
            <span>Produtos & Estoque ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('movimentacoes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'movimentacoes'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <History size={15} />
            <span>Histórico de Movimentações ({movements.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('relatorios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeSubTab === 'relatorios'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            <BarChart3 size={15} />
            <span>Relatórios & Valor</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenMovementModal(undefined, 'entrada')}
            className="px-3.5 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <ArrowUpRight size={15} />
            <span>Nova Movimentação</span>
          </button>

          <button
            onClick={handleOpenNewProduct}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-600/20 active:scale-95"
          >
            <Plus size={16} />
            <span>Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* 4. TAB 1: PRODUTOS & ESTOQUE */}
      {activeSubTab === 'produtos' && (
        <div className="space-y-4">
          {/* Search & Multi-Filters */}
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar produto por nome, marca ou categoria..."
                className="w-full pl-10 pr-4 py-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-gray-800 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setStatusFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === 'todos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Todos ({products.length})
              </button>
              <button
                onClick={() => setStatusFilter('baixo')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === 'baixo' ? 'bg-amber-500 text-black font-extrabold' : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                Estoque Baixo ({lowStockProducts.length})
              </button>
              <button
                onClick={() => setStatusFilter('esgotado')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === 'esgotado' ? 'bg-rose-500 text-white font-extrabold' : 'text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                Esgotados ({outOfStockProducts.length})
              </button>
              <button
                onClick={() => setStatusFilter('normal')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  statusFilter === 'normal' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Em Dia ({normalStockProducts.length})
              </button>
            </div>

            {/* Category Selector */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-black border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-amber-500 shrink-0"
            >
              <option value="todas">Todas as Categorias</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-black/40 border border-dashed border-gray-800 p-12 rounded-3xl text-center space-y-3">
              <Package size={36} className="mx-auto text-gray-700" />
              <h4 className="text-sm font-bold text-white">Nenhum produto encontrado</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Não foram encontrados produtos para os filtros aplicados. Tente limpar a busca ou adicione um novo produto.
              </p>
              <button
                onClick={handleOpenNewProduct}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Plus size={15} /> Cadastrar Produto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(p => {
                const isOutOfStock = Number(p.quantity) <= 0;
                const isLow = !isOutOfStock && Number(p.quantity) <= Number(p.min_quantity || 5);
                const markup = p.cost_price > 0 ? ((p.sale_price - p.cost_price) / p.cost_price) * 100 : 0;
                const totalItemCost = Number(p.quantity || 0) * Number(p.cost_price || 0);

                return (
                  <div
                    key={p.id}
                    className={`bg-gray-900/90 border rounded-2xl p-4.5 space-y-3.5 relative transition-all hover:border-gray-700 shadow-xl ${
                      isOutOfStock
                        ? 'border-rose-900/60 bg-gradient-to-b from-rose-950/20 to-gray-900'
                        : isLow
                        ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-gray-900'
                        : 'border-gray-800/90'
                    }`}
                  >
                    {/* Header: Category & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {p.category || 'Geral'}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                              Esgotado
                            </span>
                          ) : isLow ? (
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                              Estoque Baixo
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Em Dia
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{p.name}</h4>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Editar cadastro do produto"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Stock Quantity Gauge & Alerta */}
                    <div className="p-3 bg-black/60 rounded-xl border border-gray-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Quantidade Atual</span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className={`text-xl font-black tabular-nums ${
                            isOutOfStock ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-white'
                          }`}>
                            {p.quantity}
                          </span>
                          <span className="text-xs text-gray-500 font-normal">unidades</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block font-medium">Estoque Mínimo</span>
                        <span className="text-xs font-bold text-gray-300 block mt-0.5">
                          {p.min_quantity || 5} un.
                        </span>
                        {isLow && (
                          <span className="text-[9px] text-amber-400 font-bold block mt-0.5">
                            Faltam {(p.min_quantity || 5) - p.quantity} un.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financial Values Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-1">
                      <div className="p-2.5 bg-black/40 rounded-xl border border-gray-800/60">
                        <span className="text-[10px] text-gray-500 block">Preço de Venda</span>
                        <span className="font-extrabold text-emerald-400 text-sm tabular-nums">
                          R$ {p.sale_price?.toFixed(2) || '0.00'}
                        </span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">
                          Markup: {markup.toFixed(0)}%
                        </span>
                      </div>
                      <div className="p-2.5 bg-black/40 rounded-xl border border-gray-800/60">
                        <span className="text-[10px] text-gray-500 block">Custo Unitário</span>
                        <span className="font-semibold text-gray-300 text-sm tabular-nums">
                          R$ {p.cost_price?.toFixed(2) || '0.00'}
                        </span>
                        <span className="text-[9px] text-gray-500 block mt-0.5">
                          Total: R$ {totalItemCost.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Movement Action Buttons */}
                    <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-1.5">
                      <button
                        onClick={() => handleOpenMovementModal(p, 'entrada')}
                        className="flex-1 py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                        title="Adicionar entrada"
                      >
                        <ArrowUpRight size={14} />
                        <span>Entrada</span>
                      </button>

                      <button
                        onClick={() => handleOpenMovementModal(p, 'saida')}
                        className="flex-1 py-1.5 px-2 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/50 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all active:scale-95"
                        title="Registrar saída / baixa"
                      >
                        <ArrowDownRight size={14} />
                        <span>Saída</span>
                      </button>

                      <button
                        onClick={() => handleOpenMovementModal(p, 'perda')}
                        className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50 rounded-xl transition-all active:scale-95"
                        title="Registrar perda / avaria"
                      >
                        <Flame size={14} />
                      </button>

                      <button
                        onClick={() => handleOpenMovementModal(p, 'ajuste')}
                        className="p-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/50 rounded-xl transition-all active:scale-95"
                        title="Ajuste de inventário"
                      >
                        <SlidersHorizontal size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 2: HISTÓRICO DE MOVIMENTAÇÕES */}
      {activeSubTab === 'movimentacoes' && (
        <div className="space-y-4">
          {/* Movement Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={movementSearch}
                onChange={e => setMovementSearch(e.target.value)}
                placeholder="Buscar movimentação por produto ou motivo..."
                className="w-full pl-10 pr-4 py-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-black p-1 rounded-xl border border-gray-800 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setMovementTypeFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  movementTypeFilter === 'todos' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setMovementTypeFilter('entrada')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  movementTypeFilter === 'entrada' ? 'bg-emerald-600 text-white' : 'text-emerald-400 hover:bg-emerald-500/10'
                }`}
              >
                Entradas
              </button>
              <button
                onClick={() => setMovementTypeFilter('saida')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  movementTypeFilter === 'saida' ? 'bg-blue-600 text-white' : 'text-blue-400 hover:bg-blue-500/10'
                }`}
              >
                Saídas
              </button>
              <button
                onClick={() => setMovementTypeFilter('perda')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  movementTypeFilter === 'perda' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:bg-rose-500/10'
                }`}
              >
                Perdas
              </button>
              <button
                onClick={() => setMovementTypeFilter('ajuste')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                  movementTypeFilter === 'ajuste' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                Ajustes
              </button>
            </div>
          </div>

          {/* Movements Timeline Table */}
          {filteredMovements.length === 0 ? (
            <div className="bg-black/40 border border-dashed border-gray-800 p-12 rounded-3xl text-center space-y-3">
              <History size={36} className="mx-auto text-gray-700" />
              <h4 className="text-sm font-bold text-white">Nenhuma movimentação registrada</h4>
              <p className="text-xs text-gray-500">
                O histórico registrará automaticamente todas as entradas, saídas, perdas e vendas da sacola.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredMovements.map(m => {
                const badge = getTypeBadge(m.type);
                const BadgeIcon = badge.icon;
                return (
                  <div
                    key={m.id || Math.random()}
                    className="bg-gray-900/90 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gray-700 transition-colors shadow-lg"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`p-2.5 rounded-xl border shrink-0 ${badge.classes}`}>
                        <BadgeIcon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-white text-xs sm:text-sm">{m.product_name || 'Produto'}</h5>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${badge.classes}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {m.reason} • {new Date(m.date).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 pl-12 sm:pl-0 border-t sm:border-t-0 border-gray-800/60 pt-2 sm:pt-0">
                      {m.unit_cost !== undefined && m.unit_cost > 0 && (
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-gray-500 block">Custo Unitário</span>
                          <span className="text-xs font-semibold text-gray-400 tabular-nums">
                            R$ {Number(m.unit_cost).toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="text-right font-black">
                        <span className={`text-base tabular-nums ${
                          m.type === 'entrada'
                            ? 'text-emerald-400'
                            : m.type === 'perda'
                            ? 'text-rose-400'
                            : m.type === 'ajuste'
                            ? 'text-amber-400'
                            : 'text-blue-400'
                        }`}>
                          {m.type === 'entrada' ? '+' : m.type === 'perda' ? '-' : m.type === 'saida' ? '-' : '±'}
                          {m.quantity} <span className="text-xs font-normal text-gray-400">unid.</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 3: RELATÓRIOS & VALOR DO ESTOQUE */}
      {activeSubTab === 'relatorios' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-gray-950 border border-gray-800 rounded-3xl space-y-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Capital Imobilizado</span>
              <div className="text-2xl font-black text-white tabular-nums">
                R$ {totalCostValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <p className="text-[10px] text-gray-400">Valor total a preço de custo</p>
            </div>

            <div className="p-5 bg-gray-950 border border-gray-800 rounded-3xl space-y-2 border-amber-500/20">
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">Receita Projetada</span>
              <div className="text-2xl font-black text-amber-400 tabular-nums">
                R$ {totalSaleValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <p className="text-[10px] text-gray-400">Potencial bruto de venda da loja</p>
            </div>

            <div className="p-5 bg-gray-950 border border-gray-800 rounded-3xl space-y-2 border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Lucro Bruto Estimado</span>
              <div className="text-2xl font-black text-emerald-400 tabular-nums">
                R$ {estimatedProfit.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <p className="text-[10px] text-emerald-500/80 font-bold">
                Markup Médio Geral: {markupPercentage.toFixed(1)}%
              </p>
            </div>

            <div className="p-5 bg-gray-950 border border-gray-800 rounded-3xl space-y-2 border-rose-500/20">
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block">Prejuízo por Perdas</span>
              <div className="text-2xl font-black text-rose-400 tabular-nums">
                R$ {movements
                  .filter(m => m.type === 'perda')
                  .reduce((sum, m) => sum + (Number(m.total_cost || (m.unit_cost ? m.unit_cost * m.quantity : 0))), 0)
                  .toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <p className="text-[10px] text-gray-400">
                {movements.filter(m => m.type === 'perda').reduce((sum, m) => sum + m.quantity, 0)} unidades registradas
              </p>
            </div>
          </div>

          {/* Category Breakdown Table */}
          <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 size={16} className="text-amber-400" />
              <span>Distribuição de Estoque por Categoria</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-900 border-b border-gray-800 text-gray-400 uppercase text-[9px] font-black tracking-widest">
                  <tr>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Produtos</th>
                    <th className="px-4 py-3">Unidades</th>
                    <th className="px-4 py-3">Custo Total</th>
                    <th className="px-4 py-3">Venda Total</th>
                    <th className="px-4 py-3">Lucro Estimado</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900">
                  {categories.map(cat => {
                    const catProducts = products.filter(p => p.category === cat);
                    if (catProducts.length === 0) return null;
                    const catUnits = catProducts.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
                    const catCost = catProducts.reduce((sum, p) => sum + ((Number(p.cost_price) || 0) * (Number(p.quantity) || 0)), 0);
                    const catSale = catProducts.reduce((sum, p) => sum + ((Number(p.sale_price) || 0) * (Number(p.quantity) || 0)), 0);
                    const catProfit = catSale - catCost;
                    const hasLow = catProducts.some(p => Number(p.quantity) <= Number(p.min_quantity || 5));

                    return (
                      <tr key={cat} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 font-bold text-white">{cat}</td>
                        <td className="px-4 py-3 text-gray-400">{catProducts.length} itens</td>
                        <td className="px-4 py-3 text-gray-300 font-semibold">{catUnits} un.</td>
                        <td className="px-4 py-3 text-gray-300">R$ {catCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-amber-400 font-bold">R$ {catSale.toFixed(2)}</td>
                        <td className="px-4 py-3 text-emerald-400 font-semibold">R$ {catProfit.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          {hasLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Repor
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. PRODUCT CREATE/EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-3 border-b border-gray-800">
              <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                <Package size={18} />
                <span>{selectedProduct ? 'Editar Produto do Estoque' : 'Cadastrar Novo Produto'}</span>
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="Ex: Esmalte Gel Ouro Bela Mulher, Máscara Capilar..."
                  className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={prodCategory}
                    onChange={e => setProdCategory(e.target.value)}
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prodMinQty}
                    onChange={e => setProdMinQty(e.target.value)}
                    placeholder="5"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodCost}
                    onChange={e => setProdCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodSale}
                    onChange={e => setProdSale(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Estoque Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={prodQty}
                    onChange={e => setProdQty(e.target.value)}
                    placeholder="10"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-bold"
                  />
                </div>
              </div>

              {/* Profit preview */}
              {parseFloat(prodCost) > 0 && parseFloat(prodSale) > 0 && (
                <div className="p-3 bg-black/60 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Lucro Bruto Unitário:</span>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 mr-2">
                      + R$ {(parseFloat(prodSale) - parseFloat(prodCost)).toFixed(2)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      ({(((parseFloat(prodSale) - parseFloat(prodCost)) / parseFloat(prodCost)) * 100).toFixed(0)}% markup)
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={prodDescription}
                  onChange={e => setProdDescription(e.target.value)}
                  placeholder="Informações técnicas ou modo de uso..."
                  className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
                >
                  <Save size={15} />
                  <span>{selectedProduct ? 'Salvar Alterações' : 'Concluir Cadastro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MOVEMENT MODAL (Entrada, Saída, Perda, Ajuste) */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {movType === 'entrada' && <ArrowUpRight className="text-emerald-400" size={18} />}
                {movType === 'saida' && <ArrowDownRight className="text-blue-400" size={18} />}
                {movType === 'perda' && <Flame className="text-rose-400" size={18} />}
                {movType === 'ajuste' && <SlidersHorizontal className="text-amber-400" size={18} />}
                <span>
                  {movType === 'entrada' && 'Registrar Entrada / Compra'}
                  {movType === 'saida' && 'Registrar Baixa / Saída'}
                  {movType === 'perda' && 'Registrar Perda / Avaria'}
                  {movType === 'ajuste' && 'Ajuste de Inventário Físico'}
                </span>
              </h3>
              <button onClick={() => setShowMovementModal(false)} className="text-gray-400 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>

            {/* Movement Type Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-black rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setMovType('entrada');
                  setMovReason('Compra de Reposição - Fornecedor');
                  setLaunchCashFlowExpense(true);
                }}
                className={`py-1.5 text-[10px] font-bold rounded-lg uppercase transition-all ${
                  movType === 'entrada' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Entrada
              </button>
              <button
                type="button"
                onClick={() => {
                  setMovType('saida');
                  setMovReason('Uso em Procedimento no Salão');
                  setLaunchCashFlowExpense(false);
                }}
                className={`py-1.5 text-[10px] font-bold rounded-lg uppercase transition-all ${
                  movType === 'saida' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Saída
              </button>
              <button
                type="button"
                onClick={() => {
                  setMovType('perda');
                  setMovReason('Avaria / Validade Expirada');
                  setLaunchCashFlowExpense(false);
                }}
                className={`py-1.5 text-[10px] font-bold rounded-lg uppercase transition-all ${
                  movType === 'perda' ? 'bg-rose-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Perda
              </button>
              <button
                type="button"
                onClick={() => {
                  setMovType('ajuste');
                  setMovReason('Contagem de Inventário Físico');
                  setLaunchCashFlowExpense(false);
                }}
                className={`py-1.5 text-[10px] font-bold rounded-lg uppercase transition-all ${
                  movType === 'ajuste' ? 'bg-amber-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Ajuste
              </button>
            </div>

            {/* Product Selector / Indicator */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Produto
              </label>
              <select
                value={selectedProduct?.id || movProductId}
                onChange={e => handleSelectProductInMovementModal(e.target.value)}
                className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-bold"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Atual: {p.quantity} un.)
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="p-3 bg-black/60 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-gray-500 block">Estoque Atual</span>
                  <span className="font-black text-white text-sm">{selectedProduct.quantity} unidades</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block">Custo Cadastrado</span>
                  <span className="font-bold text-gray-300">R$ {selectedProduct.cost_price?.toFixed(2)}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveMovement} className="space-y-3.5">
              {/* Form fields for Ajuste */}
              {movType === 'ajuste' ? (
                <div className="space-y-3">
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setAdjustmentMode('target')}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] uppercase ${
                        adjustmentMode === 'target'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-black text-gray-400 border-gray-800'
                      }`}
                    >
                      Nova Contagem Real
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentMode('delta')}
                      className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] uppercase ${
                        adjustmentMode === 'delta'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-black text-gray-400 border-gray-800'
                      }`}
                    >
                      Ajuste Diferença (+ / -)
                    </button>
                  </div>

                  {adjustmentMode === 'target' ? (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Contagem Física Real (Total verificado) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={adjustmentTargetQty}
                        onChange={e => setAdjustmentTargetQty(e.target.value)}
                        className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-bold"
                      />
                      {selectedProduct && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          Divergência: {parseInt(adjustmentTargetQty || '0') - selectedProduct.quantity > 0 ? '+' : ''}
                          {parseInt(adjustmentTargetQty || '0') - selectedProduct.quantity} unidades
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Diferença a Ajustar (+ ou -)
                      </label>
                      <input
                        type="number"
                        required
                        value={movQty}
                        onChange={e => setMovQty(e.target.value)}
                        placeholder="Ex: -2 ou 3"
                        className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-bold"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Quantidade *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={movQty}
                      onChange={e => setMovQty(e.target.value)}
                      className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      Custo Unitário (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={movUnitCost}
                      onChange={e => setMovUnitCost(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* Total Financial Impact calculation */}
              {movType !== 'ajuste' && parseFloat(movUnitCost) > 0 && parseInt(movQty) > 0 && (
                <div className="p-2.5 bg-black/60 rounded-xl border border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {movType === 'entrada' ? 'Valor da Compra:' : movType === 'perda' ? 'Prejuízo Total:' : 'Custo do Material:'}
                  </span>
                  <span className={`font-black ${movType === 'perda' ? 'text-rose-400' : 'text-white'}`}>
                    R$ {(parseFloat(movUnitCost) * parseInt(movQty)).toFixed(2)}
                  </span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Motivo / Observação *
                </label>
                <input
                  type="text"
                  required
                  value={movReason}
                  onChange={e => setMovReason(e.target.value)}
                  placeholder="Ex: Nota Fiscal 1234, Uso no Atendimento, Validade Vencida..."
                  className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Cash flow integration checkbox for Entrada */}
              {movType === 'entrada' && onAddTransaction && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="launchCashFlow"
                      checked={launchCashFlowExpense}
                      onChange={e => setLaunchCashFlowExpense(e.target.checked)}
                      className="accent-emerald-500 w-4 h-4 rounded"
                    />
                    <label htmlFor="launchCashFlow" className="text-xs text-gray-300 font-semibold cursor-pointer">
                      Lançar despesa no Fluxo de Caixa
                    </label>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Automático
                  </span>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 font-black rounded-xl text-xs text-white flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 ${
                    movType === 'entrada'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : movType === 'perda'
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                      : movType === 'ajuste'
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  }`}
                >
                  <Save size={15} />
                  <span>Confirmar Movimentação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
