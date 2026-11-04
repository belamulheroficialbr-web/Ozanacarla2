import React, {useState, useEffect} from 'react';
import {Search, ShoppingBag, Plus, Info, Scissors, Sparkles, Filter, Check} from 'lucide-react';
import {dataService} from '../lib/data';
import {Carousel} from './Carousel';
import {VerticalGallery} from './VerticalGallery';
import {CartItem} from './SacolaModal';

interface VitrineProps {
  onAddToCart?: (item: CartItem) => void;
  onSelectServiceToBook?: (service: any) => void;
}

export function Vitrine({onAddToCart, onSelectServiceToBook}: VitrineProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      dataService.getProducts(),
      dataService.getServices()
    ]).then(([pRes, sRes]) => {
      if (pRes.data) setProducts(pRes.data);
      if (sRes.data) setServices(sRes.data);
    });
  }, []);

  const categories = ['Todos', 'Capilar', 'Unhas & Esmaltes', 'Tratamentos', 'Estética'];

  const filteredProducts = products.filter(p => {
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
    <div className="space-y-8">
      {/* Top Banner Carousel */}
      <Carousel />

      {/* Pesquisa & Filtros de Categoria */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Catálogo Oficial</span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Produtos & Procedimentos Bela Mulher
            </h2>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar produtos ou serviços..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Categorias Interactive Tab Buttons */}
        <div className="flex overflow-x-auto gap-2 pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
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

      {/* SEÇÃO 1: SERVIÇOS & PROCEDIMENTOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Scissors size={16} className="text-amber-400" />
            <span>Serviços de Salão & Estética</span>
          </h3>
          <span className="text-xs text-amber-400 font-semibold">{filteredServices.length} procedimentos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredServices.map(serv => (
            <div
              key={serv.id}
              className="p-4 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-amber-500/40 transition-all shadow-lg"
            >
              <div>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mb-1">
                  {serv.category || 'Atendimento'}
                </span>
                <h4 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                  {serv.name}
                </h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {serv.description || 'Atendimento com produtos premium e equipe altamente qualificada.'}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 block">A partir de</span>
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

      {/* SEÇÃO 2: VITRINE DE PRODUTOS & COSMÉTICOS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag size={16} className="text-amber-400" />
            <span>Cosméticos & Vitrine de Produtos</span>
          </h3>
          <span className="text-xs text-amber-400 font-semibold">{filteredProducts.length} produtos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(prod => {
            const isAdded = addedItemIds.includes(prod.id);
            return (
              <div
                key={prod.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-all shadow-xl"
              >
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={prod.image_url || '/src/assets/images/service_showcase_1_1793799836251.jpg'}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-amber-400 font-mono text-[10px] font-bold">
                      Estoque: {prod.quantity}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block mb-1">
                      {prod.category}
                    </span>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{prod.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {prod.description || 'Produto profissional para uso contínuo em casa.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Preço</span>
                      <span className="text-base font-bold text-amber-400 tabular-nums">
                        R$ {Number(prod.sale_price || prod.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="p-2 text-gray-400 hover:text-white bg-black/60 rounded-xl border border-gray-800"
                        title="Detalhes"
                      >
                        <Info size={16} />
                      </button>

                      <button
                        onClick={() => handleAddProductToCart(prod)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20'
                        }`}
                      >
                        {isAdded ? (
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
      </div>

      {/* SEÇÃO 3: HISTÓRIAS EM VÍDEO VERTICAL 9:16 */}
      <VerticalGallery />

      {/* Modal Detalhes do Produto */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden space-y-4 p-6 shadow-2xl">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
              <img
                src={selectedProduct.image_url || '/src/assets/images/service_showcase_1_1793799836251.jpg'}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">
                {selectedProduct.category}
              </span>
              <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
              <p className="text-xs text-gray-300 mt-2">{selectedProduct.description}</p>
            </div>

            <div className="p-3 bg-black rounded-xl border border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400">Preço Promocional:</span>
              <span className="text-base font-bold text-amber-400 tabular-nums">
                R$ {Number(selectedProduct.sale_price || selectedProduct.price || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-1/2 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-700"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  handleAddProductToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-1/2 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-500"
              >
                Adicionar à Sacola
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
