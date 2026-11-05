import React, {useState, useEffect} from 'react';
import {Search, ShoppingBag, Plus, Info, Scissors, Sparkles, Filter, Check, ChevronLeft, ChevronRight, Layers, AlertTriangle} from 'lucide-react';
import {dataService} from '../lib/data';
import {CartItem} from './SacolaModal';

interface VitrineProps {
  onAddToCart?: (item: CartItem) => void;
  onSelectServiceToBook?: (service: any) => void;
}

export function Vitrine({onAddToCart, onSelectServiceToBook}: VitrineProps) {
  const [showcases, setShowcases] = useState<any[]>([]);
  const [activeShowcaseId, setActiveShowcaseId] = useState<string>('vitrine-principal');
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);
  const [bannerIndex, setBannerIndex] = useState(0);

  // Carregar vitrines, produtos e serviços
  const loadData = async () => {
    const [scRes, pRes, sRes] = await Promise.all([
      dataService.getShowcases(),
      dataService.getProducts(),
      dataService.getServices()
    ]);

    if (scRes.data && scRes.data.length > 0) {
      setShowcases(scRes.data);
      // Garantir que a primeira vitrine ou a ativa seja mantida
      if (!scRes.data.some((s: any) => s.id === activeShowcaseId)) {
        setActiveShowcaseId(scRes.data[0].id);
      }
    }
    if (pRes.data) setProducts(pRes.data);
    if (sRes.data) setServices(sRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Rotação suave do banner de produtos no topo da vitrine
  const activeShowcase = showcases.find(s => s.id === activeShowcaseId) || showcases[0];

  useEffect(() => {
    if (showcases.length <= 1) return;
    const interval = setInterval(() => {
      setBannerIndex(prev => (prev + 1) % showcases.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [showcases]);

  const categories = ['Todos', 'Capilar', 'Unhas & Esmaltes', 'Tratamentos', 'Estética'];

  // Produtos pertencentes à vitrine ativa
  const currentShowcaseProducts = products.filter(p => {
    if (!activeShowcase) return true;
    if (activeShowcase.id === 'vitrine-principal') return true;
    if (Array.isArray(activeShowcase.product_ids) && activeShowcase.product_ids.length > 0) {
      return activeShowcase.product_ids.includes(p.id);
    }
    if (activeShowcase.category && activeShowcase.category !== 'Geral') {
      return p.category === activeShowcase.category;
    }
    return true;
  });

  const filteredProducts = currentShowcaseProducts.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProductToCart = (prod: any) => {
    if (onAddToCart) {
      onAddToCart({
        id: prod.id,
        name: prod.name,
        price: Number(prod.sale_price || prod.price || 0),
        quantity: 1,
        image_url: prod.image_url
      });
      setAddedItemIds(prev => [...prev, prod.id]);
      setTimeout(() => {
        setAddedItemIds(prev => prev.filter(id => id !== prod.id));
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* 1. BANNER DE PRODUTOS EM CARROSSEL NO TOPO */}
      {showcases.length > 0 && (
        <div className="relative w-full h-52 sm:h-64 md:h-72 rounded-3xl overflow-hidden border border-amber-500/25 shadow-2xl group">
          <img
            src={activeShowcase?.banner_url || '/src/assets/images/carousel_salon_1_1793799835801.jpg'}
            alt={activeShowcase?.name || 'Vitrine Bela Mulher'}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20 p-5 sm:p-7 flex flex-col justify-end">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold tracking-widest uppercase mb-2 self-start">
              <Sparkles size={12} className="text-amber-400" />
              Vitrine Oficial Bela Mulher
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {activeShowcase?.name || 'Vitrine de Produtos Exclusivos'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl mt-1 line-clamp-2">
              {activeShowcase?.description || 'Linhas profissionais de alta tecnologia para manter o tratamento do salão na sua rotina.'}
            </p>
          </div>
        </div>
      )}

      {/* 2. MINIATURAS HORIZONTAIS EM CARROSSEL PARA SELECIONAR AS VITRINES DISPONÍVEIS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-amber-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Vitrines Disponíveis
            </h3>
          </div>
          <span className="text-[11px] text-amber-400/80 font-medium">
            {showcases.length} coleções ativas
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/30">
          {showcases.map(sc => {
            const isSelected = sc.id === activeShowcaseId;
            const scProductCount = products.filter(p => {
              if (sc.id === 'vitrine-principal') return true;
              if (Array.isArray(sc.product_ids) && sc.product_ids.length > 0) return sc.product_ids.includes(p.id);
              if (sc.category && sc.category !== 'Geral') return p.category === sc.category;
              return true;
            }).length;

            return (
              <button
                key={sc.id}
                onClick={() => {
                  setActiveShowcaseId(sc.id);
                  setSelectedCategory('Todos');
                }}
                className={`flex-shrink-0 flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all duration-300 active:scale-95 shadow-md ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/10'
                    : 'bg-gray-950/80 border-gray-800 hover:border-gray-700 hover:bg-gray-900'
                }`}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-gray-800">
                  <img
                    src={sc.thumbnail_url || sc.banner_url || '/src/assets/images/service_showcase_1_1793799836251.jpg'}
                    alt={sc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-[120px] max-w-[180px] pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-gray-400'}`}>
                      {sc.is_default ? 'Principal' : 'Coleção'}
                    </span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white truncate">{sc.name}</h4>
                  <p className="text-[10px] text-gray-400 truncate">
                    {scProductCount} {scProductCount === 1 ? 'produto' : 'produtos'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BARRA DE PESQUISA ABAIXO DAS MINIATURAS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar cosméticos, ampolas, esmaltes ou procedimentos..."
              className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-2xl text-xs text-white placeholder-gray-500 focus:border-amber-500 outline-none transition-colors shadow-inner"
            />
          </div>

          {/* 4. CATEGORIAS E FILTROS DE PRODUTOS */}
          <div className="flex overflow-x-auto gap-1.5 pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. CARDS PROFISSIONAIS COM FOTOS, DESCRIÇÃO, PREÇOS E ESTOQUE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag size={16} className="text-amber-400" />
            <span>Produtos em Destaque na {activeShowcase?.name || 'Vitrine'}</span>
          </h3>
          <span className="text-xs text-amber-400 font-semibold">{filteredProducts.length} itens encontrados</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-10 text-center space-y-3 bg-gray-950 border border-gray-800/80 rounded-3xl">
            <ShoppingBag size={32} className="mx-auto text-gray-600" />
            <p className="text-xs text-gray-400">Nenhum produto encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map(prod => {
              const isAdded = addedItemIds.includes(prod.id);
              const qty = Number(prod.quantity || 0);
              const minQty = Number(prod.min_quantity || 3);
              const isOutOfStock = qty <= 0;
              const isLowStock = !isOutOfStock && qty <= minQty;

              return (
                <div
                  key={prod.id}
                  className={`bg-gray-950 border rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-xl ${
                    isOutOfStock
                      ? 'border-rose-900/40 opacity-85'
                      : isLowStock
                      ? 'border-amber-500/50 hover:border-amber-400 shadow-amber-500/5'
                      : 'border-gray-800 hover:border-amber-500/40'
                  }`}
                >
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={prod.image_url || '/src/assets/images/service_showcase_1_1793799836251.jpg'}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* BADGES DE ESTOQUE EXCLUSIVAS */}
                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-950/95 border border-rose-600/80 text-rose-300 font-mono text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                          <AlertTriangle size={11} /> Esgotado
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-950/95 border border-amber-500 text-amber-300 font-mono text-[10px] font-bold shadow-lg animate-pulse flex items-center gap-1">
                          Últimas {qty} un.
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-sm border border-gray-700/60 text-emerald-400 font-mono text-[10px] font-semibold">
                          Em estoque ({qty})
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-gray-300 text-[10px] font-semibold uppercase tracking-wider border border-gray-800">
                        {prod.category || 'Beleza'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors line-clamp-1">
                        {prod.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {prod.description || 'Produto de alta tecnologia com fórmula exclusiva Bela Mulher.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Preço Especial</span>
                        <span className="text-base font-extrabold text-amber-400 tabular-nums">
                          R$ {Number(prod.sale_price || prod.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-xl border border-gray-800 transition-colors"
                          title="Ver Detalhes do Produto"
                        >
                          <Info size={16} />
                        </button>

                        <button
                          disabled={isOutOfStock}
                          onClick={() => handleAddProductToCart(prod)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                            isOutOfStock
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/40'
                              : isAdded
                              ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                              : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                          }`}
                        >
                          {isOutOfStock ? (
                            <span>Esgotado</span>
                          ) : isAdded ? (
                            <>
                              <Check size={14} />
                              <span>Adicionado!</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              <span>Adicionar à Sacola</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. PROCEDIMENTOS & SERVIÇOS DO SALÃO */}
      <div className="space-y-4 pt-4 border-t border-gray-800/80">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Scissors size={16} className="text-amber-400" />
            <span>Procedimentos & Serviços de Salão</span>
          </h3>
          <span className="text-xs text-amber-400 font-semibold">{filteredServices.length} serviços</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredServices.map(serv => (
            <div
              key={serv.id}
              className="p-4 bg-gradient-to-b from-gray-950 to-gray-900 border border-gray-800 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-amber-500/40 transition-all shadow-lg"
            >
              <div>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mb-1">
                  {serv.category || 'Atendimento'}
                </span>
                <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                  {serv.name}
                </h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {serv.description || 'Procedimento realizado por especialistas capacitadas com produtos profissionais.'}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 block">Duração: {serv.duration_minutes || 60}m</span>
                  <span className="text-sm font-bold text-amber-400 tabular-nums">
                    R$ {Number(serv.price || 0).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectServiceToBook?.(serv)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-600/20"
                >
                  Agendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DETALHES DO PRODUTO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-950 border border-amber-500/30 rounded-3xl overflow-hidden space-y-4 p-6 shadow-2xl">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-gray-800">
              <img
                src={selectedProduct.image_url || '/src/assets/images/service_showcase_1_1793799836251.jpg'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                {selectedProduct.category}
              </span>
              <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">{selectedProduct.description}</p>
            </div>

            <div className="p-3 bg-gray-900 rounded-xl border border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400">Preço Especial Bela Mulher:</span>
              <span className="text-base font-bold text-amber-400 tabular-nums">
                R$ {Number(selectedProduct.sale_price || selectedProduct.price || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-1/2 py-2.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                Fechar
              </button>
              <button
                disabled={Number(selectedProduct.quantity || 0) <= 0}
                onClick={() => {
                  handleAddProductToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  Number(selectedProduct.quantity || 0) <= 0
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-500 shadow-md shadow-amber-600/20'
                }`}
              >
                {Number(selectedProduct.quantity || 0) <= 0 ? 'Indisponível' : 'Adicionar à Sacola'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
