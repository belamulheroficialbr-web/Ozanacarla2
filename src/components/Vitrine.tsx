import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Plus,
  Info,
  Scissors,
  Sparkles,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  AlertTriangle,
  ArrowUpDown,
  Tag,
  Clock,
  PackageCheck,
  Minus,
  X,
  CheckCircle2,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { dataService } from '../lib/data';
import { CartItem } from './SacolaModal';
import { Carousel } from './Carousel';
import { ImageFallback } from './ImageFallback';

interface VitrineProps {
  onAddToCart?: (item: CartItem) => void;
  onSelectServiceToBook?: (service: any) => void;
}

export function Vitrine({ onAddToCart, onSelectServiceToBook }: VitrineProps) {
  const [showcases, setShowcases] = useState<any[]>([]);
  const [activeShowcaseId, setActiveShowcaseId] = useState<string>('vitrine-principal');
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [mainTab, setMainTab] = useState<'all' | 'products' | 'services'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'name'>('featured');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'in_stock'>('all');

  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [modalQuantity, setModalQuantity] = useState<number>(1);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  // Carregar dados de vitrines, produtos e serviços
  const loadData = async () => {
    setLoading(true);
    try {
      const [scRes, pRes, sRes] = await Promise.all([
        dataService.getShowcases(),
        dataService.getProducts(),
        dataService.getServices()
      ]);

      if (scRes.data && scRes.data.length > 0) {
        setShowcases(scRes.data);
        if (!scRes.data.some((s: any) => s.id === activeShowcaseId)) {
          setActiveShowcaseId(scRes.data[0].id);
        }
      }
      if (pRes.data) setProducts(pRes.data);
      if (sRes.data) setServices(sRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados da vitrine:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeShowcase = useMemo(() => {
    return showcases.find(s => s.id === activeShowcaseId) || showcases[0];
  }, [showcases, activeShowcaseId]);

  // Dynamic Categories list based on available products & services
  const categories = useMemo(() => {
    const prodCats = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
    const servCats = Array.from(new Set(services.map(s => s.category).filter(Boolean)));
    const allCats = Array.from(new Set([...prodCats, ...servCats]));
    return ['Todos', ...allCats];
  }, [products, services]);

  // Filtered Products for the active showcase
  const currentShowcaseProducts = useMemo(() => {
    return products.filter(p => {
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
  }, [products, activeShowcase]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = currentShowcaseProducts.filter(p => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term);

      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;

      const qty = Number(p.quantity || 0);
      const matchesStock = availabilityFilter === 'all' || qty > 0;

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort
    result.sort((a, b) => {
      const priceA = Number(a.sale_price || a.price || 0);
      const priceB = Number(b.sale_price || b.price || 0);

      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0; // featured default
    });

    return result;
  }, [currentShowcaseProducts, searchTerm, selectedCategory, availabilityFilter, sortBy]);

  // Filtered Services
  const filteredServices = useMemo(() => {
    let result = services.filter(s => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        s.name?.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term) ||
        s.category?.toLowerCase().includes(term);

      const matchesCategory = selectedCategory === 'Todos' || s.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      const priceA = Number(a.price || 0);
      const priceB = Number(b.price || 0);

      if (sortBy === 'price_low') return priceA - priceB;
      if (sortBy === 'price_high') return priceB - priceA;
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

    return result;
  }, [services, searchTerm, selectedCategory, sortBy]);

  // Add Product to Cart with animation feedback
  const handleAddProductToCart = (prod: any, quantity: number = 1) => {
    if (onAddToCart) {
      onAddToCart({
        id: prod.id,
        name: prod.name,
        price: Number(prod.sale_price || prod.price || 0),
        quantity: quantity,
        image_url: prod.image_url
      });
      setAddedItemIds(prev => [...prev, prod.id]);
      setTimeout(() => {
        setAddedItemIds(prev => prev.filter(id => id !== prod.id));
      }, 2000);
    }
  };

  const handleOpenProductModal = (prod: any) => {
    setSelectedProduct(prod);
    setModalQuantity(1);
  };

  const formatDuration = (mins: number) => {
    if (!mins) return '60 min';
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remaining = mins % 60;
      return remaining > 0 ? `${hrs}h ${remaining}min` : `${hrs}h`;
    }
    return `${mins} min`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-1 sm:px-0">
      {/* 1. CABEÇALHO DA VITRINE: NOME E SLOGAN CONSISTENTE COM A PÁGINA INICIAL */}
      <div className="flex flex-col items-start gap-1 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-xs flex items-center justify-center shadow-md shadow-amber-500/20 tracking-tighter border border-amber-300/40 shrink-0">
            BM
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Vitrine Bela Mulher
            </h1>
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-widest block -mt-0.5">
              Produtos Profissionais & Procedimentos de Salão
            </span>
          </div>
        </div>
      </div>

      {/* 2. BANNER EM CARROSSEL AUTOMÁTICO */}
      <div className="w-full">
        <Carousel />
      </div>

      {/* 2. NAVEGAÇÃO ENTRE COLEÇÕES & VITRINES DISPONÍVEIS */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-amber-400" />
            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Coleções & Vitrines
            </h3>
          </div>
          <span className="text-[11px] text-amber-400/90 font-medium">
            {showcases.length} coleção(ões) ativa(s)
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {showcases.map(sc => {
            const isSelected = sc.id === activeShowcaseId;
            const scProductCount = products.filter(p => {
              if (sc.id === 'vitrine-principal') return true;
              if (Array.isArray(sc.product_ids) && sc.product_ids.length > 0)
                return sc.product_ids.includes(p.id);
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
                className={`flex-shrink-0 flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all duration-300 active:scale-95 shadow-lg ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/30 shadow-amber-500/10'
                    : 'bg-gray-950 border-gray-800/80 hover:border-gray-700 hover:bg-gray-900'
                }`}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-gray-800">
                  <img
                    src={
                      sc.thumbnail_url ||
                      sc.banner_url ||
                      '/src/assets/images/service_showcase_1_1793799836251.jpg'
                    }
                    alt={sc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-[120px] max-w-[180px] pr-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-amber-400' : 'text-gray-400'
                      }`}
                    >
                      {sc.is_default ? 'Principal' : 'Coleção'}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
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

      {/* 3. BARRA DE CONTROLES: ABAS PRINCIPAIS, BUSCA E FILTROS */}
      <div className="bg-gray-950 border border-gray-800 p-4 rounded-3xl space-y-4 shadow-xl">
        {/* Abas Principais: Todos / Produtos Cosméticos / Procedimentos de Salão */}
        <div className="flex overflow-x-auto gap-1.5 pb-2 sm:pb-0 border-b border-gray-800/80">
          <button
            onClick={() => setMainTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              mainTab === 'all'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white bg-gray-900/60'
            }`}
          >
            <Layers size={14} />
            <span>Ver Todos os Itens</span>
          </button>

          <button
            onClick={() => setMainTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              mainTab === 'products'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white bg-gray-900/60'
            }`}
          >
            <ShoppingBag size={14} />
            <span>Produtos Cosméticos ({filteredProducts.length})</span>
          </button>

          <button
            onClick={() => setMainTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              mainTab === 'services'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white bg-gray-900/60'
            }`}
          >
            <Scissors size={14} />
            <span>Procedimentos de Salão ({filteredServices.length})</span>
          </button>
        </div>

        {/* Input de Pesquisa e Filtro Ordenação */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Pesquisa */}
          <div className="md:col-span-6 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, tratamento, ampolas, esmaltes..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-2xl text-xs text-white placeholder-gray-500 focus:border-amber-500 outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Ordenação */}
          <div className="md:col-span-3 flex items-center bg-gray-900 border border-gray-800 rounded-2xl px-3 py-2">
            <ArrowUpDown size={14} className="text-amber-400 mr-2 shrink-0" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-white outline-none w-full cursor-pointer"
            >
              <option value="featured" className="bg-gray-900 text-white">
                Destaques da Vitrine
              </option>
              <option value="price_low" className="bg-gray-900 text-white">
                Menor Preço
              </option>
              <option value="price_high" className="bg-gray-900 text-white">
                Maior Preço
              </option>
              <option value="name" className="bg-gray-900 text-white">
                Ordem Alfabética (A-Z)
              </option>
            </select>
          </div>

          {/* Disponibilidade de Estoque */}
          <div className="md:col-span-3 flex items-center bg-gray-900 border border-gray-800 rounded-2xl px-3 py-2">
            <PackageCheck size={14} className="text-amber-400 mr-2 shrink-0" />
            <select
              value={availabilityFilter}
              onChange={e => setAvailabilityFilter(e.target.value as any)}
              className="bg-transparent text-xs text-white outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-gray-900 text-white">
                Todos os Produtos
              </option>
              <option value="in_stock" className="bg-gray-900 text-white">
                Apenas em Estoque
              </option>
            </select>
          </div>
        </div>

        {/* Seleção de Categorias em Pills */}
        <div className="flex overflow-x-auto gap-1.5 pt-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'bg-gray-900 text-gray-400 border border-gray-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. SEÇÃO DE PRODUTOS COSMÉTICOS */}
      {(mainTab === 'all' || mainTab === 'products') && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-amber-400" />
              <span>Produtos Cosméticos ({activeShowcase?.name || 'Vitrine'})</span>
            </h3>
            <span className="text-xs text-amber-400 font-semibold">
              {filteredProducts.length} item(ns) encontrado(s)
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500 bg-gray-950 border border-gray-800 rounded-3xl">
              Carregando catálogo de produtos...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center space-y-3 bg-gray-950 border border-gray-800 rounded-3xl">
              <ShoppingBag size={36} className="mx-auto text-gray-700" />
              <h4 className="text-sm font-bold text-white">Nenhum produto encontrado</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Tente ajustar o termo de pesquisa ou selecionar outra categoria.
              </p>
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
                    className={`bg-gray-950 border rounded-3xl overflow-hidden flex flex-col justify-between group transition-all duration-300 shadow-xl ${
                      isOutOfStock
                        ? 'border-rose-950/60 opacity-80'
                        : isLowStock
                        ? 'border-amber-500/50 hover:border-amber-400 shadow-amber-500/5'
                        : 'border-gray-800 hover:border-amber-500/40'
                    }`}
                  >
                    {/* Imagem e Badges */}
                    <div className="relative aspect-video bg-black overflow-hidden cursor-pointer" onClick={() => handleOpenProductModal(prod)}>
                      <ImageFallback
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Status de Estoque */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-600/80 text-rose-300 font-mono text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                            <AlertTriangle size={11} /> Esgotado
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-950/90 border border-amber-500 text-amber-300 font-mono text-[10px] font-bold shadow-lg animate-pulse flex items-center gap-1">
                            Últimas {qty} un.
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-gray-700/60 text-emerald-400 font-mono text-[10px] font-semibold">
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

                    {/* Conteúdo do Card */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4
                          onClick={() => handleOpenProductModal(prod)}
                          className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
                        >
                          {prod.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {prod.description ||
                            'Fórmula exclusiva desenvolvida com tecnologia profissional.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-gray-500 block font-medium">Preço Exclusivo</span>
                          <span className="text-base font-extrabold text-amber-400 tabular-nums">
                            R$ {Number(prod.sale_price || prod.price || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenProductModal(prod)}
                            className="p-2 text-gray-400 hover:text-white bg-gray-900 rounded-xl border border-gray-800 transition-colors"
                            title="Ver Detalhes do Produto"
                          >
                            <Info size={16} />
                          </button>

                          <button
                            disabled={isOutOfStock}
                            onClick={() => handleAddProductToCart(prod, 1)}
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
                                <span>Adicionar</span>
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
      )}

      {/* 5. SEÇÃO DE PROCEDIMENTOS & SERVIÇOS DE SALÃO */}
      {(mainTab === 'all' || mainTab === 'services') && (
        <div className="space-y-4 pt-4 border-t border-gray-800/80 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Scissors size={18} className="text-amber-400" />
              <span>Procedimentos & Atendimentos de Salão</span>
            </h3>
            <span className="text-xs text-amber-400 font-semibold">
              {filteredServices.length} serviço(s)
            </span>
          </div>

          {filteredServices.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-gray-950 border border-gray-800 rounded-3xl">
              <Scissors size={32} className="mx-auto text-gray-700" />
              <p className="text-xs text-gray-400">Nenhum serviço encontrado com esses filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map(serv => (
                <div
                  key={serv.id}
                  className="p-5 bg-gray-950 border border-gray-800 rounded-3xl flex flex-col justify-between space-y-4 group hover:border-amber-500/40 transition-all shadow-xl"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        {serv.category || 'Atendimento'}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                        <Clock size={12} className="text-amber-400" />
                        {formatDuration(serv.duration_minutes)}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors pt-1">
                      {serv.name}
                    </h4>

                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {serv.description ||
                        'Procedimento realizado por especialistas qualificadas usando produtos de padrão internacional.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 block font-medium">Valor do Serviço</span>
                      <span className="text-base font-extrabold text-amber-400 tabular-nums">
                        R$ {Number(serv.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectServiceToBook?.(serv)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5 active:scale-95"
                    >
                      <Scissors size={14} />
                      <span>Agendar Horário</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. MODAL DE DETALHES COMPLETOS DO PRODUTO */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-gray-950 border border-amber-500/30 rounded-3xl overflow-hidden space-y-4 p-6 shadow-2xl">
            {/* Header com Fechar */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Detalhes do Produto
                </span>
              </div>

              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Imagem do Produto */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-gray-800">
              <ImageFallback
                src={selectedProduct.image_url}
                alt={selectedProduct.name}
                className="w-full h-full"
              />
              <div className="absolute bottom-3 left-3">
                <span className="px-2.5 py-1 rounded-lg bg-black/80 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                  {selectedProduct.category || 'Cosmético'}
                </span>
              </div>
            </div>

            {/* Título & Descrição */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {selectedProduct.description ||
                  'Linha de cuidados profundos desenvolvida para enriquecer a saúde e o brilho dos fios.'}
              </p>
            </div>

            {/* Preço e Status do Estoque */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-900/80 border border-gray-800 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">
                  Preço Especial
                </span>
                <span className="text-base font-extrabold text-amber-400 tabular-nums">
                  R$ {Number(selectedProduct.sale_price || selectedProduct.price || 0).toFixed(2)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Disponibilidade</span>
                <span
                  className={`font-bold ${
                    Number(selectedProduct.quantity || 0) <= 0
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {Number(selectedProduct.quantity || 0) <= 0
                    ? 'Esgotado no momento'
                    : `${selectedProduct.quantity} unidade(s) em estoque`}
                </span>
              </div>
            </div>

            {/* Seletor de Quantidade */}
            {Number(selectedProduct.quantity || 0) > 0 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-gray-300">Quantidade:</span>
                <div className="flex items-center border border-gray-800 bg-gray-900 rounded-xl p-1">
                  <button
                    onClick={() => setModalQuantity(prev => Math.max(1, prev - 1))}
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="px-4 text-xs font-bold text-white tabular-nums">
                    {modalQuantity}
                  </span>
                  <button
                    onClick={() =>
                      setModalQuantity(prev =>
                        Math.min(Number(selectedProduct.quantity || 10), prev + 1)
                      )
                    }
                    className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Ações do Modal */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-1/3 py-3 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={Number(selectedProduct.quantity || 0) <= 0}
                onClick={() => {
                  handleAddProductToCart(selectedProduct, modalQuantity);
                  setSelectedProduct(null);
                }}
                className={`w-2/3 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  Number(selectedProduct.quantity || 0) <= 0
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/40'
                    : 'bg-amber-600 text-white hover:bg-amber-500 shadow-lg shadow-amber-600/20'
                }`}
              >
                {Number(selectedProduct.quantity || 0) <= 0 ? (
                  <span>Indisponível</span>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Adicionar à Sacola (R$ {(Number(selectedProduct.sale_price || selectedProduct.price || 0) * modalQuantity).toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
