import React, {useState, useEffect} from 'react';
import {Star, Plus, Trash2, Settings, Users, Save, ShieldCheck, Ticket} from 'lucide-react';
import {dataService} from '../../lib/data';

export function LoyaltyManager() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({points_per_real: 1.0, min_points_to_redeem: 100});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New Reward State
  const [showAddReward, setShowAddReward] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCost, setNewCost] = useState(100);
  const [newType, setNewType] = useState('discount');
  const [newValue, setNewValue] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [rRes, cRes] = await Promise.all([
      dataService.getLoyaltyRewards(),
      dataService.getLoyaltyConfig()
    ]);
    if (rRes.data) setRewards(rRes.data);
    if (cRes.data) setConfig(cRes.data);
    setLoading(false);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    await dataService.updateLoyaltyConfig(config);
    setIsSaving(false);
    alert('Configurações salvas!');
  };

  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: newName,
      description: newDesc,
      points_cost: newCost,
      benefit_type: newType,
      benefit_value: newValue,
      is_active: true
    };

    const res = await dataService.addLoyaltyReward(payload);
    if (!res.error) {
      setShowAddReward(false);
      setNewName('');
      setNewDesc('');
      loadData();
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (confirm('Deseja desativar esta recompensa?')) {
      await dataService.deleteLoyaltyReward(id);
      loadData();
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-gray-500">Carregando configurações do Clube de Fidelidade...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Configurações Gerais */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 bg-gray-950 border border-gray-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings size={16} className="text-amber-400" />
              <span>Regras de Pontuação</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Pontos por R$ 1,00 gasto</label>
                <input 
                  type="number"
                  step="0.1"
                  value={config.points_per_real}
                  onChange={e => setConfig({...config, points_per_real: Number(e.target.value)})}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Mínimo para resgate</label>
                <input 
                  type="number"
                  value={config.min_points_to_redeem}
                  onChange={e => setConfig({...config, min_points_to_redeem: Number(e.target.value)})}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>

              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
              >
                <Save size={16} />
                <span>{isSaving ? 'Salvando...' : 'Salvar Regras'}</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <ShieldCheck size={16} />
              <span className="text-[11px] font-bold uppercase">Dica de Gestão</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              O sistema concede pontos automaticamente quando um atendimento é marcado como "Concluído" no sistema. 
              O cálculo é: Preço do Serviço x Taxa de Pontos.
            </p>
          </div>
        </div>

        {/* Gestão do Catálogo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Ticket size={16} className="text-amber-400" />
              <span>Catálogo de Benefícios</span>
            </h3>
            <button
              onClick={() => setShowAddReward(true)}
              className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-amber-400 border border-gray-800 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              <span>Nova Recompensa</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rewards.map(reward => (
              <div key={reward.id} className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between gap-4 group hover:border-amber-500/30 transition-all">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">{reward.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="text-amber-400">{reward.points_cost} pts</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400 uppercase">{reward.benefit_type}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDeleteReward(reward.id)}
                  className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Reward Modal */}
      {showAddReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleAddReward} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Configurar Recompensa</h4>
              <button type="button" onClick={() => setShowAddReward(false)} className="text-gray-400 hover:text-white font-bold">FECHAR</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Nome do Benefício</label>
                <input 
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Escova Cortesia"
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Custo em Pontos</label>
                <input 
                  required
                  type="number"
                  value={newCost}
                  onChange={e => setNewCost(Number(e.target.value))}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Tipo</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                  >
                    <option value="discount">Desconto em R$</option>
                    <option value="service">Serviço Grátis</option>
                    <option value="product">Produto Brinde</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Valor (se desconto)</label>
                  <input 
                    type="number"
                    value={newValue}
                    onChange={e => setNewValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Descrição curta</label>
                <textarea 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-950 border-t border-gray-800">
              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20"
              >
                Ativar Recompensa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
