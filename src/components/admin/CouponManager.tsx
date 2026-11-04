import React, {useState, useEffect} from 'react';
import {Tag, Plus, Trash2, Edit2, CheckCircle, Power} from 'lucide-react';
import {dataService} from '../../lib/data';

export function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchase, setMinPurchase] = useState<number>(50);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  const loadCoupons = async () => {
    setLoading(true);
    const res = await dataService.getCoupons();
    if (res.data) setCoupons(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    await dataService.addCoupon({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_purchase: Number(minPurchase),
      is_active: true,
      expires_at: expiresAt
    });

    setCode('');
    setShowAddModal(false);
    await loadCoupons();
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await dataService.updateCoupon(id, {is_active: !currentStatus});
    await loadCoupons();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cupom?')) {
      await dataService.deleteCoupon(id);
      await loadCoupons();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Tag size={18} className="text-amber-400" />
            <span>Gestão de Cupons de Desconto</span>
          </h3>
          <p className="text-xs text-gray-400">Crie promocodes exclusivos para incentivar compras e agendamentos.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-amber-600/20"
        >
          <Plus size={15} />
          <span>Novo Cupom</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-gray-900 rounded-2xl">
          Carregando cupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-8 text-center space-y-2 bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="text-xs text-gray-400">Nenhum cupom cadastrado no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {coupons.map(c => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition-all ${
                c.is_active
                  ? 'bg-gradient-to-b from-gray-900 to-gray-950 border-gray-800'
                  : 'bg-gray-950/60 border-gray-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono font-bold text-xs rounded-lg uppercase tracking-wider">
                  {c.code}
                </span>
                <button
                  onClick={() => handleToggleStatus(c.id, c.is_active)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    c.is_active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  <Power size={11} />
                  <span>{c.is_active ? 'Ativo' : 'Inativo'}</span>
                </button>
              </div>

              <div className="space-y-1 text-xs">
                <p className="text-white font-bold text-sm">
                  {c.discount_type === 'percent' ? `${c.discount_value}% de Desconto` : `R$ ${c.discount_value.toFixed(2)} de Desconto`}
                </p>
                <p className="text-gray-400 text-[11px]">
                  Mínimo em compras: <strong className="text-gray-300">R$ {c.min_purchase}</strong>
                </p>
                <p className="text-gray-500 text-[10px]">
                  Validade: {c.expires_at || 'Indeterminada'}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-800/80 flex justify-end gap-2">
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={14} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar Cupom */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCoupon}
            className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-2xl"
          >
            <h4 className="text-base font-bold text-white pb-2 border-b border-gray-800">Criar Novo Cupom</h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-300 block mb-1">Código do Promocode</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="Ex: BELA30"
                  className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white text-xs font-mono uppercase focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Tipo de Desconto</label>
                  <select
                    value={discountType}
                    onChange={e => setDiscountType(e.target.value as any)}
                    className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  >
                    <option value="percent">Porcentagem (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Valor do Desconto</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={e => setDiscountValue(Number(e.target.value))}
                    className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-300 block mb-1">Mínimo Compra (R$)</label>
                  <input
                    type="number"
                    min={0}
                    value={minPurchase}
                    onChange={e => setMinPurchase(Number(e.target.value))}
                    className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 block mb-1">Data de Validade</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    className="w-full p-3 bg-black border border-gray-700 rounded-xl text-white text-xs focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-1/2 py-2.5 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-500"
              >
                Salvar Cupom
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
