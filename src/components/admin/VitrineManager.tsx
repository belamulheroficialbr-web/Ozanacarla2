import React, {useState, useEffect} from 'react';
import {Scissors, Plus, Trash2, Edit2, Clock, DollarSign, X, Check} from 'lucide-react';
import {dataService} from '../../lib/data';

export function VitrineManager() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowLogin] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('Cabelos');
  const [description, setDescription] = useState('');

  const fetchServices = async () => {
    setLoading(true);
    const {data} = await dataService.getServices();
    if (data) setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setName('');
    setPrice('');
    setDuration('');
    setCategory('Cabelos');
    setDescription('');
    setEditingService(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowLogin(true);
  };

  const handleOpenEdit = (s: any) => {
    setEditingService(s);
    setName(s.name || '');
    setPrice(s.price?.toString() || '');
    setDuration(s.duration_minutes?.toString() || '');
    setCategory(s.category || 'Cabelos');
    setDescription(s.description || '');
    setShowLogin(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      price: parseFloat(price),
      duration_minutes: parseInt(duration),
      category,
      description
    };

    if (editingService) {
      await dataService.updateService(editingService.id, payload);
    } else {
      await dataService.addService(payload);
    }
    
    setShowLogin(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente remover este serviço?')) {
      await dataService.deleteService(id);
      fetchServices();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Scissors size={18} className="text-amber-400" />
            <span>Gestão de Serviços & Preços</span>
          </h3>
          <p className="text-xs text-gray-400">Configure o catálogo de procedimentos oferecidos pelo salão.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors"
        >
          <Plus size={15} />
          <span>Novo Serviço</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500">Carregando serviços...</div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center bg-black/40 border border-dashed border-gray-800 rounded-3xl">
          <p className="text-xs text-gray-500">Nenhum serviço cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {services.map(s => (
            <div key={s.id} className="bg-black/60 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between group hover:border-amber-500/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-amber-500 mb-0.5 block">{s.category}</span>
                  <h4 className="font-bold text-white text-sm">{s.name}</h4>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenEdit(s)} className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <p className="text-[11px] text-gray-400 line-clamp-2 mb-3 h-8">{s.description || 'Nenhuma descrição informada.'}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-800/50">
                <div className="flex items-center gap-3 text-[10px] text-gray-300 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-amber-500" />
                    {s.duration_minutes || s.duration}min
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign size={12} className="text-emerald-500" />
                    R$ {s.price?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSave} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h4>
              <button type="button" onClick={() => setShowLogin(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Nome do Serviço</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Corte Feminino & Escova"
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Preço (R$)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="0,00"
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Duração (minutos)</label>
                  <input
                    required
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    placeholder="60"
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Categoria</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                >
                  <option>Cabelos</option>
                  <option>Unhas</option>
                  <option>Estética</option>
                  <option>Tratamentos</option>
                  <option>Sobrancelhas</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Descrição</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Descreva o procedimento e o que está incluso..."
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="flex-1 py-2.5 bg-gray-900 text-gray-400 hover:text-white font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-600/20"
              >
                <Check size={16} />
                <span>Salvar Serviço</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
