import React, {useState, useEffect} from 'react';
import {Scissors, Plus, Trash2, Edit2, Clock, DollarSign, X, Check, Layers, Image, ShoppingBag, Sparkles, AlertCircle} from 'lucide-react';
import {dataService} from '../../lib/data';

export function VitrineManager() {
  const [activeTab, setActiveTab] = useState<'vitrines' | 'servicos'>('vitrines');
  
  // Vitrines State
  const [showcases, setShowcases] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingShowcases, setLoadingShowcases] = useState(true);
  const [showShowcaseModal, setShowShowcaseModal] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<any>(null);

  // Form Vitrine
  const [showcaseName, setShowcaseName] = useState('');
  const [showcaseSubtitle, setShowcaseSubtitle] = useState('');
  const [showcaseDesc, setShowcaseDesc] = useState('');
  const [showcaseBanner, setShowcaseBanner] = useState('');
  const [showcaseThumb, setShowcaseThumb] = useState('');
  const [showcaseCategory, setShowcaseCategory] = useState('Geral');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Services State
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Form Service
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Cabelos');
  const [serviceDescription, setServiceDescription] = useState('');

  const loadAll = async () => {
    setLoadingShowcases(true);
    setLoadingServices(true);
    const [scRes, pRes, sRes] = await Promise.all([
      dataService.getShowcases(),
      dataService.getProducts(),
      dataService.getServices()
    ]);
    if (scRes.data) setShowcases(scRes.data);
    if (pRes.data) setProducts(pRes.data);
    if (sRes.data) setServices(sRes.data);
    setLoadingShowcases(false);
    setLoadingServices(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // --- HANDLERS VITRINES ---
  const handleOpenAddShowcase = () => {
    setEditingShowcase(null);
    setShowcaseName('');
    setShowcaseSubtitle('');
    setShowcaseDesc('');
    setShowcaseBanner('/src/assets/images/carousel_salon_1_1793799835801.jpg');
    setShowcaseThumb('/src/assets/images/service_showcase_1_1793799836251.jpg');
    setShowcaseCategory('Geral');
    setSelectedProductIds([]);
    setShowShowcaseModal(true);
  };

  const handleOpenEditShowcase = (sc: any) => {
    setEditingShowcase(sc);
    setShowcaseName(sc.name || '');
    setShowcaseSubtitle(sc.subtitle || '');
    setShowcaseDesc(sc.description || '');
    setShowcaseBanner(sc.banner_url || '/src/assets/images/carousel_salon_1_1793799835801.jpg');
    setShowcaseThumb(sc.thumbnail_url || sc.banner_url || '/src/assets/images/service_showcase_1_1793799836251.jpg');
    setShowcaseCategory(sc.category || 'Geral');
    setSelectedProductIds(Array.isArray(sc.product_ids) ? sc.product_ids : []);
    setShowShowcaseModal(true);
  };

  const handleToggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSaveShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseName.trim()) {
      alert('Por favor, informe o nome da vitrine.');
      return;
    }

    const payload = {
      name: showcaseName.trim(),
      subtitle: showcaseSubtitle.trim(),
      description: showcaseDesc.trim(),
      banner_url: showcaseBanner.trim() || '/src/assets/images/carousel_salon_1_1793799835801.jpg',
      thumbnail_url: showcaseThumb.trim() || '/src/assets/images/service_showcase_1_1793799836251.jpg',
      category: showcaseCategory,
      product_ids: selectedProductIds,
      is_active: true
    };

    if (editingShowcase) {
      await dataService.updateShowcase(editingShowcase.id, payload);
    } else {
      await dataService.addShowcase(payload);
    }

    setShowShowcaseModal(false);
    loadAll();
  };

  const handleDeleteShowcase = async (id: string) => {
    if (id === 'vitrine-principal') {
      alert('A Vitrine Principal não pode ser removida pois é a vitrine padrão do salão.');
      return;
    }
    if (confirm('Deseja realmente excluir esta vitrine? Os produtos não serão apagados.')) {
      const res = await dataService.deleteShowcase(id);
      if (res.error) {
        alert(res.error);
      } else {
        loadAll();
      }
    }
  };

  // --- HANDLERS SERVIÇOS ---
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceName('');
    setServicePrice('');
    setServiceDuration('60');
    setServiceCategory('Cabelos');
    setServiceDescription('');
    setShowServiceModal(true);
  };

  const handleOpenEditService = (s: any) => {
    setEditingService(s);
    setServiceName(s.name || '');
    setServicePrice(s.price?.toString() || '');
    setServiceDuration(s.duration_minutes?.toString() || '60');
    setServiceCategory(s.category || 'Cabelos');
    setServiceDescription(s.description || '');
    setShowServiceModal(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: serviceName,
      price: parseFloat(servicePrice) || 0,
      duration_minutes: parseInt(serviceDuration) || 60,
      category: serviceCategory,
      description: serviceDescription
    };

    if (editingService) {
      await dataService.updateService(editingService.id, payload);
    } else {
      await dataService.addService(payload);
    }
    
    setShowServiceModal(false);
    loadAll();
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Deseja realmente remover este procedimento?')) {
      await dataService.deleteService(id);
      loadAll();
    }
  };

  return (
    <div className="space-y-6">
      {/* Switch de Abas: Vitrines Comerciais vs Procedimentos */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers size={20} className="text-amber-400" />
            <span>Gestão Comercial de Vitrines & Procedimentos</span>
          </h3>
          <p className="text-xs text-gray-400">
            Crie novas vitrines temáticas para os produtos e administre o catálogo de serviços.
          </p>
        </div>

        <div className="flex bg-black p-1 rounded-xl border border-gray-800">
          <button
            onClick={() => setActiveTab('vitrines')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'vitrines'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>Vitrines ({showcases.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('servicos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'servicos'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Scissors size={14} />
            <span>Serviços ({services.length})</span>
          </button>
        </div>
      </div>

      {/* ABA 1: GESTÃO DE VITRINES */}
      {activeTab === 'vitrines' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Cada vitrine aparece no carrossel de miniaturas da loja e pode agrupar produtos específicos.
            </span>
            <button
              onClick={handleOpenAddShowcase}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-600/20"
            >
              <Plus size={15} />
              <span>Criar Nova Vitrine</span>
            </button>
          </div>

          {loadingShowcases ? (
            <div className="p-8 text-center text-xs text-gray-500">Carregando vitrines...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showcases.map(sc => {
                const scProducts = products.filter(p => {
                  if (sc.id === 'vitrine-principal') return true;
                  if (Array.isArray(sc.product_ids) && sc.product_ids.length > 0) return sc.product_ids.includes(p.id);
                  return true;
                });

                return (
                  <div
                    key={sc.id}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg hover:border-amber-500/30 transition-colors"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-gray-800">
                        <img
                          src={sc.thumbnail_url || sc.banner_url || '/src/assets/images/service_showcase_1_1793799836251.jpg'}
                          alt={sc.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                            {sc.is_default ? 'Vitrine Padrão' : 'Coleção'}
                          </span>
                          {sc.category && (
                            <span className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded bg-gray-900 border border-gray-800">
                              {sc.category}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white truncate mt-0.5">{sc.name}</h4>
                        {sc.subtitle && (
                          <p className="text-[11px] text-amber-300/80 font-medium truncate">{sc.subtitle}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{sc.description}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                      <span className="text-gray-400 flex items-center gap-1">
                        <ShoppingBag size={13} className="text-amber-400" />
                        <strong>{scProducts.length}</strong> produtos vinculados
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditShowcase(sc)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-900 transition-colors"
                          title="Editar Vitrine"
                        >
                          <Edit2 size={15} />
                        </button>
                        {!sc.is_default && sc.id !== 'vitrine-principal' && (
                          <button
                            onClick={() => handleDeleteShowcase(sc.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-900 transition-colors"
                            title="Excluir Vitrine"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: GESTÃO DE SERVIÇOS & PROCEDIMENTOS */}
      {activeTab === 'servicos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              Procedimentos executados pelas profissionais no salão, com valores e tempo de atendimento.
            </span>
            <button
              onClick={handleOpenAddService}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-amber-600/20"
            >
              <Plus size={15} />
              <span>Novo Procedimento</span>
            </button>
          </div>

          {loadingServices ? (
            <div className="p-8 text-center text-xs text-gray-500">Carregando serviços...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {services.map(s => (
                <div
                  key={s.id}
                  className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex flex-col justify-between space-y-3 shadow-lg"
                >
                  <div>
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block mb-1">
                      {s.category || 'Atendimento'}
                    </span>
                    <h4 className="font-bold text-white text-sm">{s.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.description || 'Procedimento do salão.'}</p>
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Duração: {s.duration_minutes || 60}m</span>
                      <span className="text-sm font-bold text-amber-400 tabular-nums">
                        R$ {Number(s.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditService(s)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-900"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-900"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL CRIAR/EDITAR VITRINE */}
      {showShowcaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-gray-950 border border-amber-500/30 rounded-3xl overflow-hidden p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-amber-400" />
                <span>{editingShowcase ? 'Editar Vitrine Comercial' : 'Criar Nova Vitrine'}</span>
              </h4>
              <button
                onClick={() => setShowShowcaseModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveShowcase} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Nome da Vitrine *</label>
                <input
                  type="text"
                  required
                  value={showcaseName}
                  onChange={e => setShowcaseName(e.target.value)}
                  placeholder="Ex: Cuidados de Verão, Linha Home Care..."
                  className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Subtítulo Promocional</label>
                <input
                  type="text"
                  value={showcaseSubtitle}
                  onChange={e => setShowcaseSubtitle(e.target.value)}
                  placeholder="Ex: Nutrição profunda e durabilidade"
                  className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={showcaseDesc}
                  onChange={e => setShowcaseDesc(e.target.value)}
                  placeholder="Explique o foco desta vitrine para as clientes..."
                  className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">URL Imagem Banner</label>
                  <input
                    type="text"
                    value={showcaseBanner}
                    onChange={e => setShowcaseBanner(e.target.value)}
                    placeholder="/src/assets/images/..."
                    className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">URL Miniatura (Ícone)</label>
                  <input
                    type="text"
                    value={showcaseThumb}
                    onChange={e => setShowcaseThumb(e.target.value)}
                    placeholder="/src/assets/images/..."
                    className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* SELEÇÃO DE PRODUTOS VINCULADOS */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-amber-400 block">
                    Vincular Produtos a Esta Vitrine ({selectedProductIds.length} selecionados)
                  </label>
                  <span className="text-[10px] text-gray-400">Marque os produtos correspondentes</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-gray-900/90 border border-gray-800 rounded-xl">
                  {products.map(p => {
                    const isChecked = selectedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-500/20 text-white' : 'hover:bg-gray-800 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProductSelection(p.id)}
                            className="rounded accent-amber-500"
                          />
                          <span className="text-xs font-medium truncate">{p.name}</span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-400 tabular-nums shrink-0 ml-2">
                          R$ {Number(p.sale_price || p.price || 0).toFixed(2)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowShowcaseModal(false)}
                  className="w-1/2 py-2.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20"
                >
                  {editingShowcase ? 'Salvar Alterações' : 'Criar Vitrine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAR/EDITAR SERVIÇO */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-950 border border-amber-500/30 rounded-3xl overflow-hidden p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Scissors size={18} className="text-amber-400" />
                <span>{editingService ? 'Editar Procedimento' : 'Novo Procedimento'}</span>
              </h4>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Nome do Procedimento *</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={e => setServiceName(e.target.value)}
                  placeholder="Ex: Escova Modelada, Mechas Iluminadas..."
                  className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={servicePrice}
                    onChange={e => setServicePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Duração (Minutos) *</label>
                  <input
                    type="number"
                    required
                    value={serviceDuration}
                    onChange={e => setServiceDuration(e.target.value)}
                    placeholder="60"
                    className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Categoria</label>
                <select
                  value={serviceCategory}
                  onChange={e => setServiceCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                >
                  <option value="Cabelos">Cabelos</option>
                  <option value="Unhas">Unhas</option>
                  <option value="Tratamentos">Tratamentos</option>
                  <option value="Estética">Estética</option>
                  <option value="Sobrancelhas">Sobrancelhas</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={serviceDescription}
                  onChange={e => setServiceDescription(e.target.value)}
                  placeholder="Detalhes sobre o procedimento e benefícios..."
                  className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="w-1/2 py-2.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20"
                >
                  {editingService ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
