import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  Check,
  ArrowRight,
  QrCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  ChevronLeft,
  MapPin,
  Database,
  HardDrive
} from 'lucide-react';
import { dataService } from '../lib/data';
import { useAuth } from '../context/AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface SacolaModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onRequestLogin?: () => void;
}

export function SacolaModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onRequestLogin
}: SacolaModalProps) {
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Checkout flow state
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<
    'PIX' | 'PIX_LOCAL' | 'PIX_COPIA_COLA' | 'PRESENCIAL'
  >('PIX');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [checkoutOrderId, setCheckoutOrderId] = useState<string>(() => `ord-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isLocalStorageFallback, setIsLocalStorageFallback] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  useEffect(() => {
    if (isOpen && step === 'cart') {
      // Gera um novo ID de pedido idempotente a cada nova sessão de sacola
      setCheckoutOrderId(`ord-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (user) {
      dataService.getProfile(user.id).then(res => {
        if (res.data) {
          setClientName(res.data.name || '');
          setClientPhone(res.data.phone || '');
        }
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percent') {
      discount = (subtotal * appliedCoupon.discount_value) / 100;
    } else if (appliedCoupon.discount_type === 'fixed') {
      discount = appliedCoupon.discount_value;
    }
  }
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    try {
      const { data: coupons } = await dataService.getCoupons();
      const found = coupons?.find(
        (c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.is_active
      );

      if (!found) {
        setCouponError('Cupom inválido ou expirado.');
        setAppliedCoupon(null);
        return;
      }

      if (subtotal < (found.min_purchase || 0)) {
        setCouponError(`Cupom válido para compras acima de R$ ${found.min_purchase.toFixed(2)}`);
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(found);
      setCouponError('');
    } catch (err) {
      setCouponError('Erro ao consultar cupom.');
    }
  };

  const dummyPixCode = `00020126580014br.gov.bcb.pix0136bela-mulher-pix@salaobelamulher.com.br5204000053039865405${total.toFixed(
    2
  )}5802BR5917SALAO BELA MULHER6009SAO PAULO62070503***6304E8A2`;

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, informe seu nome e telefone para contato.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. RE-VALIDAÇÃO EM TEMPO REAL DE ESTOQUE E PREÇOS
      const val = await dataService.validateOrderStockAndPrices(cart);
      if (!val.valid) {
        alert(`Atenção! Não foi possível concluir a compra por divergência de estoque ou valor:\n\n${val.errors.join('\n')}`);
        setIsSubmitting(false);
        return;
      }

      // Recalcular subtotal e total com preços oficiais revalidados do Supabase
      const realSubtotal = val.updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      let realDiscount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.discount_type === 'percent') {
          realDiscount = (realSubtotal * appliedCoupon.discount_value) / 100;
        } else if (appliedCoupon.discount_type === 'fixed') {
          realDiscount = appliedCoupon.discount_value;
        }
      }
      const realTotal = Math.max(0, realSubtotal - realDiscount);

      // 2. SEGURANÇA: Todo pedido gerado inicia com payment_status: 'pendente'
      const orderPayload = {
        id: checkoutOrderId,
        client_id: user?.id || 'guest',
        client_name: clientName,
        client_phone: clientPhone,
        client_email: user?.email || '',
        items: val.updatedItems,
        subtotal: realSubtotal,
        discount_amount: realDiscount,
        coupon_applied: appliedCoupon?.code || null,
        total_amount: realTotal,
        payment_method: paymentMethod,
        payment_status: 'pendente', // Mantém estritamente PENDENTE
        payment_gateway_status: 'awaiting_payment_confirmation',
        pix_code: paymentMethod === 'PIX' || paymentMethod === 'PIX_COPIA_COLA' ? dummyPixCode : null,
        delivery_status: 'em_separacao',
        notes: deliveryNotes
      };

      const res = await dataService.addOrder(orderPayload);
      if (res.error) {
        alert(res.error);
        setIsSubmitting(false);
        return;
      }

      if (res.data && res.data[0]) {
        const orderData = res.data[0];
        setCreatedOrder(orderData);
        setIsLocalStorageFallback(!orderData.created_at || typeof window === 'undefined');
        onClearCart();
        setStep('success');
      }
    } catch (err: any) {
      console.error('Erro ao finalizar pedido:', err);
      alert(err.message || 'Não foi possível finalizar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(dummyPixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => { if (!isSubmitting) onClose(); }}
    >
      <div 
        className="w-full max-w-md bg-gray-950 border-l border-gray-800 h-full flex flex-col justify-between shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header da Sacola */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                onClick={() => setStep('cart')}
                className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors mr-1"
                title="Voltar à Sacola"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                {step === 'cart' && 'Sacola de Compras'}
                {step === 'checkout' && 'Finalizar Pedido'}
                {step === 'success' && 'Pedido Gerado (Pendente)'}
              </h3>
              <span className="text-[11px] text-gray-400">
                {step === 'cart' && `${cart.length} produto(s) no carrinho`}
                {step === 'checkout' && 'Revisão e escolha de pagamento'}
                {step === 'success' && 'Aguardando confirmação do pagamento'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo Principal (Passos) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* PASSO 1: REVISÃO DA SACOLA */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ShoppingBag size={32} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-white">Sua sacola está vazia</h4>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      Explore nossa vitrine e adicione os cosméticos e produtos do Salão Bela Mulher.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Lista de Produtos com Imagem e Subtotal por Item */}
                  <div className="space-y-3">
                    {cart.map(item => {
                      const itemSubtotal = item.price * item.quantity;
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 bg-gray-900/90 border border-gray-800 rounded-2xl flex items-center justify-between gap-3 shadow-md hover:border-amber-500/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-14 h-14 rounded-xl object-cover border border-gray-800 shrink-0"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                                PROD
                              </div>
                            )}

                            <div className="min-w-0 space-y-0.5">
                              <h5 className="font-bold text-white text-xs truncate">{item.name}</h5>
                              <p className="text-[11px] text-gray-400">
                                R$ {item.price.toFixed(2)} un.
                              </p>
                              <span className="text-xs text-amber-400 font-extrabold block tabular-nums">
                                Subtotal: R$ {itemSubtotal.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                              title="Remover produto"
                            >
                              <Trash2 size={15} />
                            </button>

                            <div className="flex items-center gap-1 bg-black border border-gray-800 rounded-xl p-1">
                              <button
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                                title="Diminuir"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="text-xs font-bold text-white px-2 tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
                                title="Aumentar"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cupom de Desconto */}
                  <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl space-y-2.5">
                    <label className="text-xs text-gray-300 font-semibold flex items-center gap-1.5">
                      <Tag size={14} className="text-amber-400" />
                      <span>Possui Cupom de Desconto?</span>
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Ex: BELA10"
                        className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded-xl text-xs text-white uppercase focus:border-amber-500 outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 rounded-xl text-xs font-bold transition-all"
                      >
                        Aplicar
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                        <span>
                          Cupom <strong>{appliedCoupon.code}</strong> aplicado!
                        </span>
                        <span className="font-extrabold text-emerald-400">
                          -
                          {appliedCoupon.discount_type === 'percent'
                            ? `${appliedCoupon.discount_value}%`
                            : `R$ ${appliedCoupon.discount_value.toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    {couponError && (
                      <span className="text-[11px] text-red-400 block font-semibold">
                        {couponError}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* PASSO 2: CHECKOUT & OPÇÃO DE PAGAMENTO */}
          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleFinishOrder} className="space-y-4 animate-in fade-in duration-200">
              {/* Resumo Rápido dos Itens */}
              <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-gray-400 block">
                  Itens do Pedido ({cart.length})
                </span>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-300">
                      <span className="truncate max-w-[200px]">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-medium tabular-nums">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1. Dados do Destinatário */}
              <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-3 shadow-md">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} />
                  <span>1. Identificação & Entrega / Retirada</span>
                </h4>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1 font-medium">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1 font-medium">
                    WhatsApp / Telefone de Contato *
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)}
                    placeholder="(11) 90000-0000"
                    className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-gray-400 block mb-1 font-medium">
                    Observações de Envio ou Retirada no Salão
                  </label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="Ex: Retirar na recepção com a equipe do salão"
                    className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* 2. Formas de Pagamento Organizadas */}
              <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} />
                    <span>2. Opções de Pagamento</span>
                  </h4>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Status Inicial: Pendente
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* PIX Online */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentMethod === 'PIX'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-black text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <QrCode size={16} className="text-amber-400" />
                      <span>PIX Online</span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-normal block">
                      Aguardando PIX
                    </span>
                  </button>

                  {/* PIX no Local */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX_LOCAL')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentMethod === 'PIX_LOCAL'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-black text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <QrCode size={16} className="text-amber-400" />
                      <span>PIX no Local</span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-normal block">
                      Pague ao retirar
                    </span>
                  </button>

                  {/* PIX Copia e Cola */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX_COPIA_COLA')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentMethod === 'PIX_COPIA_COLA'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-black text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Copy size={16} className="text-amber-400" />
                      <span>Copia e Cola</span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-normal block">
                      Chave Direta PIX
                    </span>
                  </button>

                  {/* Pagamento Presencial */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PRESENCIAL')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentMethod === 'PRESENCIAL'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-black text-gray-400 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShoppingBag size={16} className="text-amber-400" />
                      <span>Presencial</span>
                    </div>
                    <span className="text-[10px] text-amber-400/90 font-normal block">
                      Cartão ou Dinheiro
                    </span>
                  </button>
                </div>

                {/* Exibição da Chave PIX Oficial */}
                {(paymentMethod === 'PIX' || paymentMethod === 'PIX_COPIA_COLA') && (
                  <div className="p-3 bg-black border border-gray-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-300">
                      <span className="font-semibold">Chave PIX Oficial Salão Bela Mulher:</span>
                      <span className="text-amber-400 font-bold">Pendente de Transferência</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-900 rounded-lg text-xs font-mono text-amber-400 overflow-x-auto border border-gray-800">
                      <span className="truncate">{dummyPixCode}</span>
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="ml-2 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-sans text-[10px] font-bold shrink-0 transition-colors"
                      >
                        {copiedPix ? 'Copiado!' : 'Copiar Chave'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* PASSO 3: CONFIRMAÇÃO & RESUMO DO PEDIDO */}
          {step === 'success' && createdOrder && (
            <div className="py-6 text-center space-y-5 animate-in fade-in duration-200">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
                <Clock size={36} />
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
                  Pedido Gerado • Aguardando Confirmação
                </span>
                <h4 className="text-2xl font-black text-white tracking-tight">
                  #{createdOrder.id}
                </h4>
                <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto">
                  Obrigado, <strong className="text-white">{createdOrder.client_name}</strong>! Seu pedido foi registrado e está aguardando confirmação do pagamento.
                </p>
              </div>

              {/* Resumo Detalhado do Pedido */}
              <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl text-left space-y-3 text-xs shadow-lg">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                  <span className="text-gray-400 font-semibold">Situação do Pagamento:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Pendente de Validação
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-gray-300">
                    <span>Modalidade Escolhida:</span>
                    <strong className="text-white">{createdOrder.payment_method}</strong>
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span>Contato do Destinatário:</span>
                    <strong className="text-gray-200">{createdOrder.client_phone}</strong>
                  </div>

                  <div className="flex justify-between text-gray-300">
                    <span>Origem do Registro:</span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                      {isLocalStorageFallback ? (
                        <>
                          <HardDrive size={12} className="text-amber-400" /> Armazenado Localmente (Offline)
                        </>
                      ) : (
                        <>
                          <Database size={12} className="text-emerald-400" /> Registrado no Banco de Dados
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Lista de Itens do Pedido Criado */}
                <div className="pt-2 border-t border-gray-800 space-y-1.5">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">
                    Itens Reservados no Estoque
                  </span>
                  {createdOrder.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-gray-300 text-xs">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-semibold tabular-nums">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totais do Pedido */}
                <div className="pt-2 border-t border-gray-800 space-y-1">
                  {createdOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Desconto Aplicado:</span>
                      <span>- R$ {Number(createdOrder.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-white">
                    <span>Valor a Ser Confirmado:</span>
                    <span className="text-amber-400 tabular-nums">
                      R$ {Number(createdOrder.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300/90 text-center space-y-1">
                <p>
                  O status mudará para <strong>Pago</strong> assim que o pagamento for validado pelo sistema/recepção.
                </p>
                <p className="text-[10px] text-gray-400">
                  Consulte e acompanhe na sua <strong>Área da Cliente</strong> em Histórico.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer com Resumo Financeiro & Botões de Ação */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-gray-800 bg-gray-950 space-y-3">
            {step === 'cart' && (
              <>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal dos Produtos:</span>
                    <span className="tabular-nums">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Desconto Cupom:</span>
                      <span className="tabular-nums">- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-1.5 border-t border-gray-800">
                    <span>Total a Pagar:</span>
                    <span className="text-amber-400 tabular-nums">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!user && onRequestLogin) {
                      onRequestLogin();
                    } else {
                      setStep('checkout');
                    }
                  }}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-95"
                >
                  <span>Avançar para Pagamento</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}

            {step === 'checkout' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-white pb-1 border-b border-gray-800/80">
                  <span>Total do Pedido:</span>
                  <span className="text-amber-400 tabular-nums">R$ {total.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 active:scale-95"
                >
                  {isSubmitting ? (
                    <span>Registrando Pedido...</span>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Gerar Pedido Pendente (R$ {total.toFixed(2)})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="w-full py-2 text-xs text-gray-400 hover:text-white font-medium"
                >
                  Voltar e alterar sacola
                </button>
              </div>
            )}

            {step === 'success' && (
              <button
                onClick={() => {
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-600/20"
              >
                Concluir & Acompanhar Pedido
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
