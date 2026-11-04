import React, {useState, useEffect} from 'react';
import {ShoppingBag, CheckCircle2, Clock, Truck, DollarSign, RefreshCw} from 'lucide-react';
import {dataService} from '../../lib/data';

export function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    const res = await dataService.getOrders();
    if (res.data) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (id: string, payment_status?: string, delivery_status?: string) => {
    await dataService.updateOrderStatus(id, {
      ...(payment_status ? {payment_status} : {}),
      ...(delivery_status ? {delivery_status} : {})
    });
    await loadOrders();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-amber-400" />
            <span>Gestão de Sacola & Pedidos</span>
          </h3>
          <p className="text-xs text-gray-400">Acompanhe e gerencie as compras realizadas pelos clientes na vitrine.</p>
        </div>
        <button
          onClick={loadOrders}
          className="p-2 bg-gray-900 hover:bg-gray-800 text-amber-400 rounded-xl text-xs flex items-center gap-1 border border-gray-800"
        >
          <RefreshCw size={14} />
          <span>Atualizar</span>
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-gray-900 rounded-2xl">
          Carregando pedidos...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-8 text-center bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="text-xs text-gray-400">Nenhum pedido realizado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div
              key={order.id}
              className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-400 text-sm">#{order.id}</span>
                  <div>
                    <h5 className="font-bold text-white text-xs">{order.client_name}</h5>
                    <span className="text-[11px] text-gray-400">{order.client_phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    order.payment_status === 'pago'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {order.payment_status === 'pago' ? 'Pagamento Confirmado' : 'Aguardando Pagamento'}
                  </span>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-300 border border-gray-700 capitalize">
                    {order.delivery_status || 'Em Separação'}
                  </span>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="space-y-1">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs text-gray-300">
                    <span>{item.quantity}x {item.name}</span>
                    <span className="font-semibold tabular-nums">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-x-3 text-gray-400">
                  <span>Modalidade: <strong className="text-white">{order.payment_method}</strong></span>
                  <span>Total: <strong className="text-amber-400">R$ {order.total_amount?.toFixed(2)}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {order.payment_status !== 'pago' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'pago')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Confirmar Pagamento
                    </button>
                  )}

                  {order.delivery_status !== 'entregue' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, undefined, 'entregue')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Marcar Entregue
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
