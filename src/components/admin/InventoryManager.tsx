import {useState} from 'react';
import {Package, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, Edit2, Trash2, Search, Check, RefreshCw, Layers, History, Save, X} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  cost_price: number;
  sale_price: number;
  quantity: number;
  min_quantity: number;
  updated_at?: string;
}

interface Movement {
  id: string;
  product_id: string;
  product_name: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  date: string;
}

interface InventoryManagerProps {
  products: Product[];
  movements: Movement[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onRecordMovement: (movement: Omit<Movement, 'id'>) => Promise<void>;
}

export function InventoryManager({
  products = [],
  movements = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRecordMovement
}: InventoryManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<'produtos' | 'movimentacoes'>('produtos');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  
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

  // Movement Form State
  const [movType, setMovType] = useState<'entrada' | 'saida'>('entrada');
  const [movQty, setMovQty] = useState('');
  const [movReason, setMovReason] = useState('Reposição de estoque');

  const categories = ['Capilar', 'Unhas & Esmaltes', 'Estética', 'Maquiagem', 'Geral'];

  const handleOpenNewProduct = () => {
    setSelectedProduct(null);
    setProdName('');
    setProdCategory('Capilar');
    setProdCost('');
    setProdSale('');
    setProdQty('10');
    setProdMinQty('5');
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
    setShowProductModal(true);
  };

  const handleOpenMovementModal = (p: Product, type: 'entrada' | 'saida') => {
    setSelectedProduct(p);
    setMovType(type);
    setMovQty('1');
    setMovReason(type === 'entrada' ? 'Compra de Reposição' : 'Uso em Atendimento / Venda');
    setShowMovementModal(true);
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

    if (selectedProduct) {
      await onUpdateProduct(selectedProduct.id, {
        name: prodName,
        category: prodCategory,
        cost_price: costVal,
        sale_price: saleVal,
        quantity: qtyVal,
        min_quantity: minQtyVal,
        updated_at: new Date().toISOString()
      });
    } else {
      await onAddProduct({
        name: prodName,
        category: prodCategory,
        cost_price: costVal,
        sale_price: saleVal,
        quantity: qtyVal,
        min_quantity: minQtyVal,
        updated_at: new Date().toISOString()
      });
    }
    setShowProductModal(false);
  };

  const handleSaveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const qtyNum = parseInt(movQty) || 0;
    if (qtyNum <= 0) {
      alert('Informe uma quantidade válida superior a 0');
      return;
    }

    if (movType === 'saida' && qtyNum > selectedProduct.quantity) {
      alert(`Quantidade em estoque insuficiente! Estoque atual: ${selectedProduct.quantity}`);
      return;
    }

    const newQty = movType === 'entrada' 
      ? selectedProduct.quantity + qtyNum 
      : selectedProduct.quantity - qtyNum;

    // Record movement
    await onRecordMovement({
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      type: movType,
      quantity: qtyNum,
      reason: movReason,
      date: new Date().toISOString()
    });

    // Update product stock quantity
    await onUpdateProduct(selectedProduct.id, {
      quantity: newQty,
      updated_at: new Date().toISOString()
    });

    setShowMovementModal(false);
  };

  const handleDelete = async (p: Product) => {
    if (confirm(`Tem certeza que deseja remover o produto "${p.name}"?`)) {
      await onDeleteProduct(p.id);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'todas' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.quantity <= (p.min_quantity || 5));

  return (
    <div className="space-y-6">
      {/* Alert Header for Low Stock */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300">Alerta de Estoque Baixo ({lowStockProducts.length} itens)</h4>
              <p className="text-[11px] text-gray-300 mt-0.5">
                Os seguintes produtos estão abaixo da quantidade mínima: {lowStockProducts.map(p => p.name).join(', ')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setCategoryFilter('todas');
              setSearch('');
            }}
            className="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded-xl shrink-0 hover:bg-amber-400 transition-colors"
          >
            Ver Alertas
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('produtos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'produtos'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Produtos em Estoque ({products.length})
          </button>
          <button
            onClick={() => setActiveSubTab('movimentacoes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'movimentacoes'
                ? 'bg-amber-500 text-black shadow-md'
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            Histórico de Entradas e Saídas ({movements.length})
          </button>
        </div>

        {activeSubTab === 'produtos' && (
          <button
            onClick={handleOpenNewProduct}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
          >
            <Plus size={16} />
            <span>Novo Produto</span>
          </button>
        )}
      </div>

      {/* PRODUTOS TAB */}
      {activeSubTab === 'produtos' && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar produto por nome ou marca..."
                className="w-full pl-9 pr-3 py-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setCategoryFilter('todas')}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap border ${
                  categoryFilter === 'todas'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-black text-gray-400 border-gray-800 hover:text-white'
                }`}
              >
                Todas
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap border ${
                    categoryFilter === cat
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-black text-gray-400 border-gray-800 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Products List Table / Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-black/60 border border-gray-800 p-8 rounded-3xl text-center space-y-3">
              <Package size={32} className="mx-auto text-gray-600" />
              <p className="text-xs text-gray-400">Nenhum produto cadastrado nesta categoria.</p>
              <button
                onClick={handleOpenNewProduct}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> Cadastrar Primeiro Produto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredProducts.map(p => {
                const isLow = p.quantity <= (p.min_quantity || 5);
                return (
                  <div
                    key={p.id}
                    className={`bg-gray-900/90 border rounded-2xl p-4 space-y-3 relative transition-all hover:border-gray-700 ${
                      isLow ? 'border-amber-500/50 bg-gradient-to-b from-amber-950/20 to-gray-900' : 'border-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          {p.category || 'Geral'}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{p.name}</h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Editar produto"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                          title="Excluir produto"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 bg-black/60 p-2.5 rounded-xl border border-gray-800/80">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Preço de Venda</span>
                        <span className="font-extrabold text-emerald-400">R$ {p.sale_price?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Custo Unitário</span>
                        <span className="font-semibold text-gray-300">R$ {p.cost_price?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] text-gray-400 block">Estoque Atual</span>
                        <span className={`text-base font-black ${isLow ? 'text-amber-400' : 'text-white'}`}>
                          {p.quantity} <span className="text-xs font-normal text-gray-400">unid.</span>
                        </span>
                      </div>

                      {/* Movement Quick Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenMovementModal(p, 'entrada')}
                          className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Adicionar entrada de estoque"
                        >
                          <ArrowUpRight size={14} />
                          <span>+ Entrada</span>
                        </button>
                        <button
                          onClick={() => handleOpenMovementModal(p, 'saida')}
                          className="px-2.5 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                          title="Dar baixa em estoque"
                        >
                          <ArrowDownRight size={14} />
                          <span>- Saída</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MOVIMENTAÇÕES TAB */}
      {activeSubTab === 'movimentacoes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Histórico Recente de Entradas e Saídas</h4>
            <span className="text-[10px] text-gray-500">{movements.length} registros</span>
          </div>

          {movements.length === 0 ? (
            <div className="bg-black/60 border border-gray-800 p-8 rounded-3xl text-center text-xs text-gray-500">
              Nenhuma movimentação de estoque registrada recentemente.
            </div>
          ) : (
            <div className="space-y-2.5">
              {movements.map(m => (
                <div
                  key={m.id || Math.random()}
                  className="bg-gray-900/90 border border-gray-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      m.type === 'entrada' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}>
                      {m.type === 'entrada' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <h5 className="font-bold text-white">{m.product_name || 'Produto'}</h5>
                      <p className="text-[11px] text-gray-400">{m.reason} • {new Date(m.date).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>

                  <div className="text-right font-extrabold">
                    <span className={m.type === 'entrada' ? 'text-emerald-400' : 'text-rose-400'}>
                      {m.type === 'entrada' ? `+${m.quantity}` : `-${m.quantity}`} un.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                <Package size={18} />
                {selectedProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={e => setProdName(e.target.value)}
                  placeholder="Ex: Esmalte Gel Dourado, Shampoo Nutritivo"
                  className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Categoria</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodSale}
                    onChange={e => setProdSale(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Custo de Compra (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodCost}
                    onChange={e => setProdCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Quantidade em Estoque</label>
                  <input
                    type="number"
                    value={prodQty}
                    onChange={e => setProdQty(e.target.value)}
                    placeholder="10"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Estoque Mínimo (Alerta)</label>
                  <input
                    type="number"
                    value={prodMinQty}
                    onChange={e => setProdMinQty(e.target.value)}
                    placeholder="5"
                    className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                >
                  <Save size={14} />
                  <span>{selectedProduct ? 'Atualizar' : 'Cadastrar'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOVEMENT MODAL */}
      {showMovementModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {movType === 'entrada' ? <ArrowUpRight className="text-emerald-400" size={18} /> : <ArrowDownRight className="text-rose-400" size={18} />}
                <span>{movType === 'entrada' ? 'Registrar Entrada' : 'Registrar Baixa / Saída'}</span>
              </h3>
              <button onClick={() => setShowMovementModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-black rounded-2xl border border-gray-800">
              <p className="text-xs font-bold text-white">{selectedProduct.name}</p>
              <p className="text-[11px] text-gray-400">Estoque atual: {selectedProduct.quantity} unidades</p>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Quantidade a {movType === 'entrada' ? 'adicionar' : 'retirar'}</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movQty}
                  onChange={e => setMovQty(e.target.value)}
                  className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Motivo / Observação</label>
                <input
                  type="text"
                  required
                  value={movReason}
                  onChange={e => setMovReason(e.target.value)}
                  placeholder="Ex: Compra do fornecedor, uso no atendimento X"
                  className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-800 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 font-bold rounded-xl text-xs text-white flex items-center justify-center gap-1.5 ${
                    movType === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  <span>Confirmar {movType === 'entrada' ? 'Entrada' : 'Baixa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
