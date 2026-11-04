import React, {useState, useEffect} from 'react';
import {X, ShoppingBag, Trash2, Plus, Minus, Tag, Check, ArrowRight, QrCode, Copy, CheckCircle2} from 'lucide-react';
import {dataService} from '../lib/data';
import {useAuth} from '../context/AuthContext';

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
}

export function SacolaModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}: SacolaModalProps) {
  const {user} = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  
  // Checkout flow state
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'PIX_LOCAL' | 'PIX_COPIA_COLA' | 'PRESENCIAL'>('PIX');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [copiedPix, setCopiedPix] = useState(false);

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

    const {data: coupons} = await dataService.getCoupons();
    const found = coupons?.find(
      (c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.is_active
    );

    if (!found) {
      setCouponError('Cupom inválido ou expirado.');
      setAppliedCoupon(null);
      return;
    }

    if (subtotal < (found.min_purchase || 0)) {
      setCouponError(`Cupom válido para compras acima de R$ ${found.min_purchase}`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(found);
    setCouponError('');
  };

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, informe seu nome e telefone para contato.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        client_id: user?.id || 'guest',
        client_name: clientName,
        client_phone: clientPhone,
        client_email: user?.email || '',
        items: cart,
        subtotal,
        discount_amount: discount,
        coupon_applied: appliedCoupon?.code || null,
        total_amount: total,
        payment_method: paymentMethod,
        payment_status: paymentMethod === 'PIX' ? 'pago' : 'pendente',
        delivery_status: 'em_separacao',
        notes: deliveryNotes
      };

      const res = await dataService.addOrder(orderPayload);
      if (res.data && res.data[0]) {
        setCreatedOrder(res.data[0]);
        onClearCart();
        setStep('success');
      }
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      alert('Não foi possível finalizar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dummyPixCode = `00020126580014br.gov.bcb.pix0136bela-mulher-pix@salaobelamulher.com.br5204000053039865405${total.toFixed(2)}5802BR5917SALAO BELA MULHER6009SAO PAULO62070503***6304E8A2`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(dummyPixCode);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-gray-950 border-l border-gray-800 h-full flex flex-col justify-between shadow-2xl">
        
        {/* Header da Sacola */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-950 to-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Sacola de Compras</h3>
              <span className="text-[11px] text-gray-400">{cart.length} itens selecionados</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo da Sacola (Passos) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* PASSO 1: Lista de Itens no Carrinho */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ShoppingBag size={32} />
                  </div>
                  <h4 className="text-base font-bold text-white">Sua sacola está vazia</h4>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto">
                    Navegue pela nossa vitrine e adicione produtos e cosméticos exclusivos do Salão Bela Mulher.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-900/90 border border-gray-800 rounded-2xl flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-800 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                              PROD
                            </div>
                          )}
                          <div className="min-w-0">
                            <h5 className="font-bold text-white text-xs truncate">{item.name}</h5>
                            <span className="text-xs text-amber-400 font-semibold tabular-nums">
                              R$ {item.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1.5 bg-black border border-gray-800 rounded-xl p-1">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="text-xs font-bold text-white px-1.5 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1 text-gray-400 hover:text-white"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cupom de Desconto */}
                  <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-2xl space-y-2">
                    <label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                      <Tag size={14} className="text-amber-400" />
                      <span>Possui Cupom de Desconto?</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Ex: BELA10"
                        className="flex-1 px-3 py-2 bg-black border border-gray-700 rounded-xl text-xs text-white uppercase focus:border-amber-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>

                    {appliedCoupon && (
                      <div className="p-2 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center justify-between">
                        <span>Cupom <strong>{appliedCoupon.code}</strong> aplicado!</span>
                        <span className="font-bold">
                          -{appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}%` : `R$ ${appliedCoupon.discount_value}`}
                        </span>
                      </div>
                    )}

                    {couponError && (
                      <span className="text-[11px] text-red-400 block font-medium">{couponError}</span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* PASSO 2: Dados de Envio & Forma de Pagamento */}
          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleFinishOrder} className="space-y-4">
              <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">1. Dados do Destinatário</h4>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Seu Nome</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">WhatsApp / Telefone</label>
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
                  <label className="text-[11px] text-gray-400 block mb-1">Observações de Entrega / Retirada</label>
                  <input
                    type="text"
                    value={deliveryNotes}
                    onChange={e => setDeliveryNotes(e.target.value)}
                    placeholder="Ex: Retirar na recepção do salão no sábado"
                    className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">2. Modalidade de Pagamento</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentMethod === 'PIX'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-black text-gray-300 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <QrCode size={16} className="text-amber-400" />
                      <span>PIX Online</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">QR Code & Copia e Cola</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX_LOCAL')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentMethod === 'PIX_LOCAL'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-black text-gray-300 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <QrCode size={16} className="text-amber-400" />
                      <span>PIX no Local</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">Pague ao retirar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX_COPIA_COLA')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentMethod === 'PIX_COPIA_COLA'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-black text-gray-300 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Copy size={16} className="text-amber-400" />
                      <span>Copia e Cola</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">Chave direta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PRESENCIAL')}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      paymentMethod === 'PRESENCIAL'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-black text-gray-300 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShoppingBag size={16} className="text-amber-400" />
                      <span>Presencial</span>
                    </div>
                    <span className="text-[10px] text-gray-400 block">Cartão / Dinheiro</span>
                  </button>
                </div>

                {(paymentMethod === 'PIX' || paymentMethod === 'PIX_COPIA_COLA') && (
                  <div className="p-3 bg-black border border-gray-800 rounded-xl space-y-2">
                    <span className="text-[11px] text-gray-300 block">Chave PIX Oficial do Salão:</span>
                    <div className="flex items-center justify-between p-2 bg-gray-900 rounded-lg text-xs font-mono text-amber-400 overflow-x-auto">
                      <span className="truncate">{dummyPixCode}</span>
                      <button
                        type="button"
                        onClick={handleCopyPix}
                        className="ml-2 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded font-sans text-[10px] shrink-0"
                      >
                        {copiedPix ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* PASSO 3: Confirmação e Acompanhamento do Pedido */}
          {step === 'success' && createdOrder && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Pedido Confirmado</span>
                <h4 className="text-xl font-bold text-white tracking-tight">#{createdOrder.id}</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Obrigado, {createdOrder.client_name}! Seu pedido foi registrado no sistema do Salão Bela Mulher.
                </p>
              </div>

              <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl text-left space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Forma de Pagamento:</span>
                  <strong className="text-white">{createdOrder.payment_method}</strong>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Status do Pagamento:</span>
                  <strong className="text-emerald-400 capitalize">{createdOrder.payment_status}</strong>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Status da Entrega:</span>
                  <strong className="text-amber-400 capitalize">Em separação</strong>
                </div>
                <div className="pt-2 border-t border-gray-800 flex justify-between font-bold text-white">
                  <span>Total Pago:</span>
                  <span className="text-amber-400">R$ {createdOrder.total_amount.toFixed(2)}</span>
                </div>
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
                    <span>Subtotal:</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Desconto:</span>
                      <span>- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-white pt-1 border-t border-gray-800">
                    <span>Total:</span>
                    <span className="text-amber-400 tabular-nums">R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
                >
                  <span>Avançar para Pagamento</span>
                  <ArrowRight size={16} />
                </button>
              </>
            )}

            {step === 'checkout' && (
              <div className="space-y-2">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {isSubmitting ? 'Processando Pedido...' : `Confirmar & Pagar R$ ${total.toFixed(2)}`}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="w-full py-2 text-xs text-gray-400 hover:text-white"
                >
                  Voltar à Sacola
                </button>
              </div>
            )}

            {step === 'success' && (
              <button
                onClick={() => {
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Concluir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
