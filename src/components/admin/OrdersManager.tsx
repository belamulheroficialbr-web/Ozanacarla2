import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  RefreshCw,
  AlertCircle,
  Eye,
  X,
  Filter,
  Search,
  Tag,
  Phone,
  User,
  Package,
  ChevronRight,
  Database,
  HardDrive,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Check,
  PackageCheck,
  XCircle
} from 'lucide-react';
import { dataService } from '../../lib/data';
import { useAuth } from '../../context/AuthContext';

export function OrdersManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'em_separacao' | 'pronto_retirada' | 'entregue' | 'cancelado'>('all');
  const [storageFilter, setStorageFilter] = useState<'all' | 'remote' | 'local'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const { role } = useAuth();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await dataService.getOrders();
      if (res.data) {
        setOrders(res.data);
        checkOrderStock(res.data);
      }
    } catch (err) {
      console.error('Erro ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (
    id: string,
    payment_status?: string,
    delivery_status?: string
  ) => {
    setIsUpdating(id);
    try {
      await dataService.updateOrderStatus(
        id,
        {
          ...(payment_status ? { payment_status } : {}),
          ...(delivery_status ? { delivery_status } : {})
        },
        role || 'admin'
      );
      await loadOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev: any) => ({
          ...prev,
          ...(payment_status ? { payment_status } : {}),
          ...(delivery_status ? { delivery_status } : {})
        }));
      }
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err);
    } finally {
      setIsUpdating(null);
    }
  };
  const [stockStatusMap, setStockStatusMap] = useState<Record<string, any>>({});
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);

  const checkOrderStock = async (orderList: any[]) => {
    const statuses: Record<string, any> = {};
    for (const ord of orderList) {
      if (ord.items && ord.items.length > 0) {
        const status = await dataService.getOrderStockStatus(ord);
        statuses[ord.id] = status;
      }
    }
    setStockStatusMap(statuses);
  };

  const handleReprocessStock = async (order: any) => {
    setReprocessingId(order.id);
    try {
      const result = await dataService.processOrderStockDeduction(order);
      await loadOrders();
      if (result.failed.length > 0) {
        alert(`Recuperação parcial: ${result.failed.length} item(ns) falharam por falta de estoque.`);
      } else {
        alert('Baixa de estoque regularizada com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao reprocessar estoque:', err);
    } finally {
      setReprocessingId(null);
    }
  };
  const checkIsLocalOnly = (order: any) => {
    if (!order) return false;
    const stored = localStorage.getItem('BELA_ORDERS');
    if (!stored) return false;
    try {
      const list = JSON.parse(stored);
      return list.some((o: any) => o.id === order.id);
    } catch {
      return false;
    }
  };

  // Métricas em Tempo Real
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const pendingPaymentCount = orders.filter(
      o => o.payment_status === 'pendente' || !o.payment_status
    ).length;
    const paidCount = orders.filter(o => o.payment_status === 'pago').length;
    const cancelledCount = orders.filter(
      o => o.payment_status === 'cancelado' || o.delivery_status === 'cancelado'
    ).length;
    const awaitingPickupCount = orders.filter(
      o => o.delivery_status === 'pronto_retirada' || o.delivery_status === 'em_separacao'
    ).length;

    const totalRevenue = orders
      .filter(o => o.payment_status === 'pago')
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const localCount = orders.filter(o => checkIsLocalOnly(o)).length;

    return {
      totalCount,
      pendingPaymentCount,
      paidCount,
      cancelledCount,
      awaitingPickupCount,
      totalRevenue,
      localCount
    };
  }, [orders]);

  // Pedidos Filtrados
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        order.id?.toLowerCase().includes(term) ||
        order.client_name?.toLowerCase().includes(term) ||
        order.client_phone?.toLowerCase().includes(term) ||
        order.payment_method?.toLowerCase().includes(term);

      const matchesPayment =
        paymentFilter === 'all' ||
        (paymentFilter === 'pending' && (order.payment_status === 'pendente' || !order.payment_status)) ||
        (paymentFilter === 'paid' && order.payment_status === 'pago') ||
        (paymentFilter === 'cancelled' && order.payment_status === 'cancelado');

      const matchesDelivery =
        deliveryFilter === 'all' || order.delivery_status === deliveryFilter;

      const isLocal = checkIsLocalOnly(order);
      const matchesStorage =
        storageFilter === 'all' ||
        (storageFilter === 'local' && isLocal) ||
        (storageFilter === 'remote' && !isLocal);

      return matchesSearch && matchesPayment && matchesDelivery && matchesStorage;
    });
  }, [orders, searchTerm, paymentFilter, deliveryFilter, storageFilter]);

  const renderPaymentBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 size={12} /> Pagamento Confirmado
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
            <XCircle size={12} /> Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 animate-pulse">
            <Clock size={12} /> Aguardando Validação
          </span>
        );
    }
  };

  const renderDeliveryBadge = (status: string) => {
    switch (status) {
      case 'entregue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <PackageCheck size={12} /> Entregue / Concluído
          </span>
        );
      case 'pronto_retirada':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <ShoppingBag size={12} /> Pronto p/ Retirada
          </span>
        );
      case 'cancelado':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 border border-gray-700 flex items-center gap-1">
            <Truck size={12} /> Em Separação
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-amber-400" />
            <span>Gestão de Sacola & Pedidos</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              Painel ADM
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Gerencie pedidos, valide pagamentos PIX/Presencial e acompanhe retiradas.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-gray-800 transition-colors shadow-md self-start sm:self-center"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Sincronizar Pedidos</span>
        </button>
      </div>

      {/* 2. Cards Indicadores (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total de Pedidos */}
        <div className="p-3.5 bg-gray-950 border border-gray-800 rounded-2xl space-y-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
            Total de Pedidos
          </span>
          <p className="text-xl font-extrabold text-white tabular-nums">{metrics.totalCount}</p>
          <span className="text-[10px] text-gray-500 block">Registrados no sistema</span>
        </div>

        {/* Aguardando Confirmação */}
        <div
          onClick={() => setPaymentFilter('pending')}
          className="p-3.5 bg-gray-950 border border-amber-500/40 hover:border-amber-400 rounded-2xl space-y-1 cursor-pointer transition-colors shadow-lg shadow-amber-500/5"
        >
          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block flex items-center gap-1">
            <Clock size={10} /> Pendente Pagamento
          </span>
          <p className="text-xl font-extrabold text-amber-400 tabular-nums">
            {metrics.pendingPaymentCount}
          </p>
          <span className="text-[10px] text-amber-400/80 block">Aguardando validação</span>
        </div>

        {/* Pagamentos Confirmados */}
        <div
          onClick={() => setPaymentFilter('paid')}
          className="p-3.5 bg-gray-950 border border-emerald-500/30 hover:border-emerald-400 rounded-2xl space-y-1 cursor-pointer transition-colors"
        >
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 size={10} /> Pagos / Confirmados
          </span>
          <p className="text-xl font-extrabold text-emerald-400 tabular-nums">
            {metrics.paidCount}
          </p>
          <span className="text-[10px] text-emerald-400/80 block">Receita financeira gerada</span>
        </div>

        {/* Aguardando Retirada */}
        <div
          onClick={() => setDeliveryFilter('em_separacao')}
          className="p-3.5 bg-gray-950 border border-blue-500/30 hover:border-blue-400 rounded-2xl space-y-1 cursor-pointer transition-colors"
        >
          <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider block flex items-center gap-1">
            <Truck size={10} /> Em Separação
          </span>
          <p className="text-xl font-extrabold text-blue-400 tabular-nums">
            {metrics.awaitingPickupCount}
          </p>
          <span className="text-[10px] text-blue-400/80 block">Aguardando entrega</span>
        </div>

        {/* Cancelados */}
        <div
          onClick={() => setPaymentFilter('cancelled')}
          className="p-3.5 bg-gray-950 border border-red-500/30 hover:border-red-400 rounded-2xl space-y-1 cursor-pointer transition-colors"
        >
          <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider block flex items-center gap-1">
            <XCircle size={10} /> Cancelados
          </span>
          <p className="text-xl font-extrabold text-red-400 tabular-nums">
            {metrics.cancelledCount}
          </p>
          <span className="text-[10px] text-red-400/80 block">Com estorno/reversão</span>
        </div>

        {/* Total de Vendas (R$) */}
        <div className="p-3.5 bg-gray-950 border border-amber-500/30 rounded-2xl space-y-1">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
            Receita Confirmada
          </span>
          <p className="text-lg font-black text-amber-400 tabular-nums">
            R$ {metrics.totalRevenue.toFixed(2)}
          </p>
          <span className="text-[10px] text-gray-500 block">Pedidos pagos</span>
        </div>
      </div>

      {/* 3. Filtros e Pesquisa de Pedidos */}
      <div className="p-4 bg-gray-950 border border-gray-800 rounded-3xl space-y-3 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Busca por código ou cliente */}
          <div className="md:col-span-5 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por ID (#ord-1001), cliente, telefone ou PIX..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-2xl text-xs text-white placeholder-gray-500 focus:border-amber-500 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filtro Status Pagamento */}
          <div className="md:col-span-3 flex items-center bg-gray-900 border border-gray-800 rounded-2xl px-3 py-2">
            <Filter size={14} className="text-amber-400 mr-2 shrink-0" />
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value as any)}
              className="bg-transparent text-xs text-white outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-gray-900 text-white">
                Todos os Status de Pagamento
              </option>
              <option value="pending" className="bg-gray-900 text-white">
                Aguardando Pagamento (Pendente)
              </option>
              <option value="paid" className="bg-gray-900 text-white">
                Pagamento Confirmado (Pago)
              </option>
              <option value="cancelled" className="bg-gray-900 text-white">
                Cancelado
              </option>
            </select>
          </div>

          {/* Filtro Status Entrega */}
          <div className="md:col-span-4 flex items-center bg-gray-900 border border-gray-800 rounded-2xl px-3 py-2">
            <Truck size={14} className="text-amber-400 mr-2 shrink-0" />
            <select
              value={deliveryFilter}
              onChange={e => setDeliveryFilter(e.target.value as any)}
              className="bg-transparent text-xs text-white outline-none w-full cursor-pointer"
            >
              <option value="all" className="bg-gray-900 text-white">
                Todos os Status de Entrega
              </option>
              <option value="em_separacao" className="bg-gray-900 text-white">
                Em Separação
              </option>
              <option value="pronto_retirada" className="bg-gray-900 text-white">
                Pronto para Retirada
              </option>
              <option value="entregue" className="bg-gray-900 text-white">
                Entregue / Concluído
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Lista Principal de Pedidos */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-gray-950 border border-gray-800 rounded-3xl flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-amber-500" />
          <span>Carregando pedidos e conferindo estoques...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-gray-950 border border-gray-800 rounded-3xl space-y-2">
          <ShoppingBag size={32} className="mx-auto text-gray-700" />
          <h4 className="text-sm font-bold text-white">Nenhum pedido encontrado</h4>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Não existem pedidos correspondentes aos filtros e busca selecionados.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isPending = order.payment_status === 'pendente' || !order.payment_status;
            const isPaid = order.payment_status === 'pago';
            const isCancelled =
              order.payment_status === 'cancelado' || order.delivery_status === 'cancelado';
            const isLocalOnly = checkIsLocalOnly(order);

            return (
              <div
                key={order.id}
                className={`p-5 bg-gray-950 border rounded-3xl space-y-4 transition-all duration-200 shadow-xl ${
                  isPending
                    ? 'border-amber-500/50 shadow-amber-500/5 bg-amber-950/10'
                    : isCancelled
                    ? 'border-red-950/60 opacity-80'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                {/* Cabeçalho do Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gray-900 border border-gray-800 font-mono font-bold text-amber-400 text-sm shrink-0">
                      #{order.id}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">{order.client_name}</h4>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded-md font-mono">
                          {isLocalOnly ? (
                            <>
                              <HardDrive size={11} className="text-amber-400" /> Local Offline
                            </>
                          ) : (
                            <>
                              <Database size={11} className="text-emerald-400" /> Cloud Database
                            </>
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-amber-500/80" />
                          {order.client_phone || 'Sem fone'}
                        </span>
                        <span>•</span>
                        <span className="text-gray-400">
                          {new Date(order.created_at || Date.now()).toLocaleString('pt-BR')}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {renderPaymentBadge(order.payment_status)}
                    {renderDeliveryBadge(order.delivery_status)}
                    {stockStatusMap[order.id] && !stockStatusMap[order.id].isFullyProcessed && !isCancelled && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <AlertTriangle size={12} className="text-amber-400" />
                        Estoque Incompleto ({stockStatusMap[order.id].pendingItems.length} pendente)
                      </span>
                    )}
                  </div>
                </div>

                {/* Resumo de Produtos do Pedido */}
                <div className="space-y-1.5 bg-black/40 p-3 rounded-2xl border border-gray-900">
                  <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                    Itens Comprados ({order.items?.length || 0})
                  </span>
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs text-gray-300">
                      <span className="truncate max-w-[280px]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold tabular-nums text-gray-200">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Rodapé do Card com Ações */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-400">
                    <span>
                      Pagamento: <strong className="text-white">{order.payment_method || 'PIX'}</strong>
                    </span>
                    <span>
                      Total:{' '}
                      <strong className="text-amber-400 text-sm font-extrabold tabular-nums">
                        R$ {Number(order.total_amount || 0).toFixed(2)}
                      </strong>
                    </span>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 hover:border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Eye size={13} className="text-amber-400" />
                      <span>Ver Detalhes</span>
                    </button>

                    {/* CONFIRMAR PAGAMENTO (Impedir confirmação duplicada) */}
                    {!isPaid && !isCancelled && (
                      <button
                        disabled={isUpdating === order.id}
                        onClick={() => handleUpdateStatus(order.id, 'pago')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        <Check size={14} />
                        <span>Confirmar Pagamento</span>
                      </button>
                    )}

                    {/* SEPARAÇÃO & ENTREGA */}
                    {!isCancelled && order.delivery_status !== 'entregue' && (
                      <button
                        disabled={isUpdating === order.id}
                        onClick={() =>
                          handleUpdateStatus(
                            order.id,
                            undefined,
                            order.delivery_status === 'em_separacao'
                              ? 'pronto_retirada'
                              : 'entregue'
                          )
                        }
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <Truck size={13} />
                        <span>
                          {order.delivery_status === 'em_separacao'
                            ? 'Pronto p/ Retirada'
                            : 'Marcar Entregue'}
                        </span>
                      </button>
                    )}

                    {/* RECUPERAR / REGULARIZAR ESTOQUE INCOMPLETO */}
                    {stockStatusMap[order.id] && !stockStatusMap[order.id].isFullyProcessed && !isCancelled && (
                      <button
                        disabled={reprocessingId === order.id}
                        onClick={() => handleReprocessStock(order)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                        title="Reprocessar e baixar somente os itens pendentes deste pedido"
                      >
                        <RefreshCw size={13} className={reprocessingId === order.id ? 'animate-spin' : ''} />
                        <span>Regularizar Estoque</span>
                      </button>
                    )}

                    {/* CANCELAR PEDIDO */}
                    {!isCancelled && (
                      <button
                        disabled={isUpdating === order.id}
                        onClick={() => {
                          if (
                            confirm(
                              `Deseja realmente cancelar o pedido #${order.id}? O estoque e o financeiro serão estornados automaticamente.`
                            )
                          ) {
                            handleUpdateStatus(order.id, 'cancelado', 'cancelado');
                          }
                        }}
                        className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        title="Cancelar pedido e estornar estoque/financeiro"
                      >
                        <XCircle size={13} />
                        <span>Cancelar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL DE DETALHES COMPLETOS DO PEDIDO */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-950 to-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                    Consulta Detalhada do Pedido
                  </span>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Pedido #{selectedOrder.id}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Badges de Status */}
              <div className="flex items-center justify-between p-3 bg-black/50 rounded-2xl border border-gray-800">
                <span className="text-xs text-gray-400 font-semibold">Situação no Sistema:</span>
                <div className="flex items-center gap-2">
                  {renderPaymentBadge(selectedOrder.payment_status)}
                  {renderDeliveryBadge(selectedOrder.delivery_status)}
                </div>
              </div>

              {/* Dados da Cliente */}
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl space-y-2 text-xs">
                <h5 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Dados da Cliente & Entrega
                </h5>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>
                    <span className="text-gray-500 block text-[10px]">Nome do Destinatário:</span>
                    <strong className="text-white">{selectedOrder.client_name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">WhatsApp / Contato:</span>
                    <strong className="text-gray-200">{selectedOrder.client_phone || 'Não informado'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">E-mail:</span>
                    <span className="text-gray-300">{selectedOrder.client_email || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px]">Data do Registro:</span>
                    <span className="text-gray-300">
                      {new Date(selectedOrder.created_at || Date.now()).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-gray-800/80">
                    <span className="text-gray-500 block text-[10px]">Observações de Envio/Retirada:</span>
                    <p className="text-gray-200 font-medium mt-0.5">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Tabela de Produtos */}
              <div className="space-y-2">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Produtos Selecionados ({selectedOrder.items?.length || 0})
                </h5>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-800 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                            PROD
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{item.name}</p>
                          <span className="text-[11px] text-gray-400">
                            {item.quantity}x R$ {Number(item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-amber-400 tabular-nums shrink-0">
                        R$ {(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo Financeiro do Pedido */}
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Modalidade de Pagamento:</span>
                  <strong className="text-white">{selectedOrder.payment_method || 'PIX'}</strong>
                </div>
                {selectedOrder.subtotal > 0 && (
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal dos Produtos:</span>
                    <span>R$ {Number(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Desconto ({selectedOrder.coupon_applied || 'Cupom'}):</span>
                    <span>- R$ {Number(selectedOrder.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-extrabold text-white">
                  <span>Valor Total do Pedido:</span>
                  <span className="text-amber-400 tabular-nums">
                    R$ {Number(selectedOrder.total_amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-950 border-t border-gray-800 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">ID: {selectedOrder.id}</span>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold rounded-xl text-xs transition-colors"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
