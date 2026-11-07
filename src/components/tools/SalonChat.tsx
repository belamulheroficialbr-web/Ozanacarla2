import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  Send,
  X,
  Minus,
  Sparkles,
  ShoppingBag,
  Plus,
  CheckCircle,
  Image as ImageIcon,
  Camera,
  Mic,
  Trash2,
  DollarSign,
  QrCode,
  Calendar,
  Clock,
  ChevronRight,
  Scissors,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { dataService, generatePixBrCode } from '../../lib/data';
import { useAuth } from '../../context/AuthContext';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  image_url?: string;
  options?: { label: string; action: () => void }[];
  productCard?: any;
  productCards?: any[];
  serviceCard?: any;
  latencyMs?: number;
  isError?: boolean;
}

export interface SalonChatProps {
  onAddToCart?: (item: { id: string; name: string; price: number; quantity: number; image_url?: string }) => void;
  onOpenSacola?: () => void;
  cart?: any[];
}

export function SalonChat({ onAddToCart, onOpenSacola, cart: appCart = [] }: SalonChatProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // In-Memory Catalog State (Synchronized with Supabase)
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [pixConfig, setPixConfig] = useState<any>(null);
  const [isCatalogLoaded, setIsCatalogLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch Fresh Database Data from Supabase
  const loadCatalogData = async () => {
    try {
      const [sRes, pRes, vRes, pixRes] = await Promise.all([
        dataService.getServices(),
        dataService.getProducts(),
        dataService.getVideos916(),
        dataService.getPixConfig()
      ]);
      const sData = sRes?.data || [];
      const pData = pRes?.data || [];
      const vData = vRes?.data || [];
      const pixData = pixRes?.data || null;

      setServices(sData);
      setProducts(pData);
      setGallery(vData);
      setPixConfig(pixData);
      setIsCatalogLoaded(true);

      return { services: sData, products: pData, gallery: vData, pixConfig: pixData };
    } catch (err) {
      console.error('Erro ao carregar catálogo:', err);
      return { services, products, gallery, pixConfig };
    }
  };

  useEffect(() => {
    loadCatalogData();
  }, []);

  // Initialize Welcome Greeting (Only on fresh load if no messages exist)
  useEffect(() => {
    if (messages.length === 0) {
      const hour = new Date().getHours();
      const saudacao = hour >= 18 ? 'Boa noite' : hour >= 12 ? 'Boa tarde' : 'Bom dia';
      const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Cliente VIP';

      const initialMessage: ChatMessage = {
        id: 'welcome-1',
        sender: 'assistant',
        content: `${saudacao}, ${userName}! Sou a Bela, sua atendente VIP do Salão & Estética Bela Mulher. ✨\n\nComo posso cuidar da sua beleza hoje? Posso responder suas dúvidas sobre procedimentos, recomendar cosméticos ou te orientar sobre o Pix!`,
        timestamp: new Date().toISOString(),
        options: [
          { label: 'Como funciona o atendimento?', action: () => processSendMessage('Como funciona o atendimento do salão?') },
          { label: 'Opções de Hidratação e Preços', action: () => processSendMessage('Quais opções de hidratação vocês oferecem, quanto custam e quanto duram?') },
          { label: 'Recomendação para Cabelos Ressecados', action: () => processSendMessage('Tenho cabelos ressecados e sem brilho. Qual produto você recomenda e por quê?') },
          { label: 'Ver Todos os Produtos', action: () => processSendMessage('Ver todos os produtos em estoque') },
        ]
      };
      setMessages([initialMessage]);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, typing]);

  // Client-Side Canvas Image Compression to Max 1024px
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1024;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Photo Selection
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file);
      setSelectedImageBase64(compressedBase64);
    } catch (err) {
      const reader = new FileReader();
      reader.onload = ev => {
        setSelectedImageBase64(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simulate Speech Recording Input
  const handleMicClick = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInputText('Quais opções de hidratação vocês oferecem, quanto custam e quanto duram?');
    }, 1200);
  };

  // Process and Send Message (Measured Real Latency)
  const processSendMessage = async (textOverride?: string) => {
    if (isProcessing) return; // Block duplicate clicks

    const textToSend = textOverride !== undefined ? textOverride : inputText;
    const currentImage = selectedImageBase64;

    if (!textToSend.trim() && !currentImage) return;

    const startTime = performance.now();
    setIsProcessing(true);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend.trim() || 'Fotografia enviada para análise',
      timestamp: new Date().toISOString(),
      image_url: currentImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImageBase64(null);
    setTyping(true);

    const lower = textToSend.toLowerCase();

    // Ensure fresh catalog data is fetched directly from Supabase
    const catData = await loadCatalogData();
    const liveProducts = catData.products.length > 0 ? catData.products : products;
    const liveServices = catData.services.length > 0 ? catData.services : services;

    // Filter available products (Stock > 0)
    const inStockProducts = liveProducts.filter((p: any) => Number(p.quantity) > 0);

    // Build Recent Chat History (Last 6 Turns) for Multi-Turn Context
    const historyPayload = messages.slice(-6).map(m => ({
      sender: m.sender,
      content: m.content
    }));

    // AI Query Path
    const catalogContext = `
PRODUTOS DISPONÍVEIS NO ESTOQUE REAL:
${liveProducts.map((p: any) => `• ID ${p.id}: "${p.name}" - R$ ${Number(p.sale_price).toFixed(2)} (${p.quantity} unidades em estoque). Categoria: ${p.category || 'Geral'}. Status Estoque: ${Number(p.quantity) > 0 ? 'DISPONÍVEL' : 'ESGOTADO'}. Descrição: ${p.description || 'Linha profissional'}`).join('\n')}

SERVIÇOS DISPONÍVEIS:
${liveServices.map((s: any) => `• "${s.name}" - R$ ${Number(s.price).toFixed(2)} (${s.duration_minutes || 60} min)`).join('\n')}

DADOS PIX:
Chave: ${pixConfig?.pix_key || '12.345.678/0001-90'} (${pixConfig?.key_type || 'CNPJ'}), Favorecido: ${pixConfig?.receiver_name || 'Sra Bela Mulher Salão & Estética'}, Cidade: ${pixConfig?.city || 'SÃO PAULO'}.
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: textToSend.trim(),
          image_base64: currentImage,
          catalogContext,
          history: historyPayload
        })
      });

      clearTimeout(timeoutId);

      const elapsedMs = Math.round(performance.now() - startTime);

      let replyText = '';
      if (response.ok) {
        const data = await response.json();
        replyText = data.reply || 'Como posso te orientar referente à sua solicitação?';
      } else {
        replyText = `Com relação a "${textToSend}", nossos especialistas do Salão Bela Mulher indicam os procedimentos e cosméticos correspondentes do nosso catálogo!`;
      }

      let replyProductCards: any[] | undefined = undefined;
      let replyService: any = null;
      let replyOptions: { label: string; action: () => void }[] | undefined = undefined;

      const isAskingAllProducts = lower.includes('todos os produtos') || lower.includes('ver o catálogo') || lower.includes('lista de produtos');
      const isAskingRecommendation = lower.includes('ressecad') || lower.includes('recomenda') || lower.includes('sem brilho') || lower.includes('indique');
      const isAskingComparison = lower.includes('diferença') || lower.includes('diferenca') || lower.includes('entre os dois');
      const isAskingTotal = lower.includes('dois produtos') || lower.includes('quanto vou pagar') || lower.includes('total');
      const isAskingHydration = lower.includes('hidratação') || lower.includes('hidratacao');

      if (isAskingAllProducts) {
        replyProductCards = liveProducts;
      } else if (isAskingRecommendation || isAskingComparison || isAskingTotal || currentImage) {
        // Only recommend products with stock > 0
        replyProductCards = inStockProducts.filter((p: any) => 
          p.name.toLowerCase().includes('ampola') || 
          p.name.toLowerCase().includes('óleo') ||
          p.category === 'Capilar'
        );
        if (!replyProductCards || replyProductCards.length === 0) {
          replyProductCards = inStockProducts.slice(0, 2);
        }
      } else if (isAskingHydration) {
        replyService = liveServices.find((s: any) => s.name.toLowerCase().includes('hidratação')) || liveServices[0];
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString(),
        productCards: replyProductCards,
        serviceCard: replyService,
        options: replyOptions,
        latencyMs: elapsedMs
      };

      setMessages(prev => [...prev, assistantMsg]);

    } catch (err: any) {
      clearTimeout(timeoutId);
      const elapsedMs = Math.round(performance.now() - startTime);

      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        content: `Não foi possível completar a consulta referente a "${textToSend}" devido a uma oscilação de conexão. Deseja tentar novamente?`,
        timestamp: new Date().toISOString(),
        isError: true,
        latencyMs: elapsedMs,
        options: [
          { label: 'Tentar Novamente', action: () => processSendMessage(textToSend) }
        ]
      };

      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setTyping(false);
      setIsProcessing(false);
    }
  };

  const handleAddToCart = (product: any) => {
    const stockQty = Number(product.quantity || 0);
    const existingInCart = (appCart || []).find((c: any) => c.id === product.id);
    const currentQtyInCart = existingInCart ? existingInCart.quantity : 0;

    if (stockQty <= 0) {
      alert(`Desculpe, o produto "${product.name}" está indisponível no estoque (0 unidades).`);
      return;
    }

    if (currentQtyInCart + 1 > stockQty) {
      alert(`Ops! Você já possui ${currentQtyInCart} unidade(s) na sua sacola. O estoque total disponível no salão é de ${stockQty} unidade(s).`);
      return;
    }

    const price = Number(product.sale_price || product.price || 0);

    // Call main application cart callback
    if (onAddToCart) {
      onAddToCart({
        id: product.id,
        name: product.name,
        price,
        quantity: 1,
        image_url: product.image_url
      });
    }

    const confirmationMsg: ChatMessage = {
      id: `confirm-${Date.now()}`,
      sender: 'assistant',
      content: `Excelente escolha! Adicionei 1x "${product.name}" (R$ ${price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}) à sua Sacola de Compras! 🛍️\n\nSubtotal atualizado no carrinho e pronto para checkout.`,
      timestamp: new Date().toISOString(),
      options: [
        { label: '🛍️ Abrir Sacola de Compras', action: () => onOpenSacola?.() },
        { label: '💳 Orientação Pagamento Pix', action: () => processSendMessage('Como funciona a confirmação de pagamento Pix?') }
      ]
    };
    setMessages(prev => [...prev, confirmationMsg]);
  };

  return (
    <>
      {/* 1. Floating Button (Fixed at Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-40 p-3.5 sm:p-4 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black shadow-2xl shadow-amber-500/40 border border-amber-300/50 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 group"
          title="Atendente VIP Bela Mulher"
          aria-label="Abrir Chat Atendente VIP"
        >
          <div className="relative">
            <MessageCircle size={24} className="stroke-[2.5]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
          </div>
          <span className="text-xs font-black tracking-tight hidden sm:inline pr-1">
            Atendente VIP
          </span>
        </button>
      )}

      {/* 2. Anchored Floating Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 transition-all duration-300 shadow-2xl ${
          isMinimized
            ? 'bottom-20 right-4 sm:bottom-24 sm:right-6 w-72 h-14 bg-gray-950 border border-amber-500/40 rounded-2xl overflow-hidden'
            : 'bottom-20 right-2 sm:right-6 w-[calc(100vw-1rem)] sm:w-96 max-w-md h-[580px] max-h-[82vh] bg-black border border-amber-500/40 rounded-3xl overflow-hidden flex flex-col justify-between'
        }`}>
          {/* Top Header Bar */}
          <div className="p-3.5 bg-gradient-to-r from-gray-950 via-amber-950/40 to-gray-950 border-b border-amber-500/30 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-xs flex items-center justify-center shrink-0 border border-amber-300/50 shadow">
                BM
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-white truncate flex items-center gap-1.5">
                  <span>Bela · Atendente VIP</span>
                  <Sparkles size={12} className="text-amber-400 shrink-0" />
                </h4>
                {/* CLEAN STATUS INDICATOR (STRICTLY ONLINE) */}
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-400 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                title={isMinimized ? 'Expandir' : 'Minimizar'}
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Body (Only when not minimized) */}
          {!isMinimized && (
            <>
              {/* Message Feed */}
              <div className="p-3.5 space-y-3.5 overflow-y-auto custom-scrollbar flex-1 text-left bg-gradient-to-b from-black via-gray-950 to-black">
                {messages.map(msg => {
                  const isAssistant = msg.sender === 'assistant';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'} space-y-1.5 animate-in fade-in duration-200`}
                    >
                      {/* User Sent Image Display */}
                      {msg.image_url && (
                        <div className="rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg max-w-[80%]">
                          <img
                            src={msg.image_url}
                            alt="Fotografia anexada"
                            className="w-full max-h-48 object-cover"
                          />
                        </div>
                      )}

                      {/* Message Content Bubble */}
                      <div className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.isError
                          ? 'bg-red-950/80 border border-red-500/50 text-red-200 rounded-tl-xs shadow-md'
                          : isAssistant
                          ? 'bg-gray-900 border border-amber-500/25 text-gray-100 rounded-tl-xs shadow-md'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-tr-xs shadow-md'
                      }`}>
                        {msg.content}

                        {/* Latency Meter Footer */}
                        {msg.latencyMs !== undefined && (
                          <div className="text-[8.5px] opacity-60 font-mono mt-1 text-right">
                            {msg.latencyMs}ms
                          </div>
                        )}
                      </div>

                      {/* SERVICE CARD DISPLAY */}
                      {isAssistant && msg.serviceCard && (
                        <div className="p-3 bg-gray-950 border border-amber-500/40 rounded-2xl max-w-[90%] space-y-2 shadow-xl text-left">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                              <Scissors size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-xs font-bold text-white truncate">{msg.serviceCard.name}</h5>
                              <div className="flex items-center gap-2 pt-0.5">
                                <strong className="text-xs text-amber-400 font-mono font-black">
                                  R$ {Number(msg.serviceCard.price).toFixed(2)}
                                </strong>
                                <span className="text-[9.5px] text-gray-400">
                                  {msg.serviceCard.duration_minutes || 60} minutos
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* MULTIPLE RICH VISUAL PRODUCT CARDS LIST */}
                      {isAssistant && msg.productCards && msg.productCards.length > 0 && (
                        <div className="w-full space-y-2.5 my-1 max-w-[95%]">
                          <div className="text-[10.5px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                            <ShoppingBag size={13} />
                            <span>Produtos ({msg.productCards.length})</span>
                          </div>
                          
                          <div className="space-y-2.5">
                            {msg.productCards.map((prod, pIdx) => (
                              <div
                                key={prod.id || pIdx}
                                className="p-3 bg-gray-950 border border-amber-500/35 rounded-2xl space-y-2 shadow-xl hover:border-amber-400/60 transition-all text-left"
                              >
                                <div className="flex gap-3 items-start">
                                  {prod.image_url ? (
                                    <img
                                      src={prod.image_url}
                                      alt={prod.name}
                                      className="w-16 h-16 object-cover rounded-xl border border-amber-500/30 shrink-0 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-center text-amber-400 shrink-0">
                                      <ShoppingBag size={20} />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <h5 className="text-xs font-bold text-white leading-snug">{prod.name}</h5>
                                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                                      <strong className="text-xs text-amber-400 font-mono font-black">
                                        R$ {Number(prod.sale_price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </strong>
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                        Number(prod.quantity) > 0 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                                      }`}>
                                        {Number(prod.quantity) > 0 ? `${prod.quantity} em estoque` : 'Esgotado'}
                                      </span>
                                    </div>
                                    {prod.description && (
                                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed pt-0.5">
                                        {prod.description}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={() => handleAddToCart(prod)}
                                  disabled={Number(prod.quantity) <= 0}
                                  className="w-full py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-40"
                                >
                                  <ShoppingBag size={13} />
                                  <span>Adicionar à Sacola</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Interactive Option Chips */}
                      {isAssistant && msg.options && (
                        <div className="flex flex-wrap gap-1.5 pt-1 max-w-[95%]">
                          {msg.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={opt.action}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 hover:text-amber-200 text-[10.5px] font-bold transition-all active:scale-95 cursor-pointer text-left flex items-center gap-1"
                            >
                              <span>{opt.label}</span>
                              <ChevronRight size={12} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {typing && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-amber-400 text-xs font-bold animate-pulse w-fit">
                    <Sparkles size={14} />
                    <span>Bela está analisando...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Image Preview Badge */}
              {selectedImageBase64 && (
                <div className="px-3 py-2 bg-gray-900 border-t border-amber-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={selectedImageBase64}
                      alt="Prévia"
                      className="w-8 h-8 object-cover rounded-lg border border-amber-400"
                    />
                    <span className="text-[10.5px] font-bold text-amber-300 truncate">
                      Fotografia pronta para análise
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedImageBase64(null)}
                    className="p-1 text-gray-400 hover:text-red-400 rounded-lg"
                    title="Remover fotografia"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}

              {/* Chat Input Bar */}
              <div className="p-2 sm:p-2.5 bg-gray-950 border-t border-amber-500/20 flex items-center gap-1.5 shrink-0">
                {/* Photo Attachment Trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition-all cursor-pointer shrink-0"
                  title="Anexar Fotografia"
                >
                  <Camera size={18} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {/* Microphone Trigger */}
                <button
                  type="button"
                  onClick={handleMicClick}
                  className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
                    isRecording ? 'text-red-400 bg-red-500/20 animate-pulse' : 'text-gray-400 hover:text-amber-400 hover:bg-gray-900'
                  }`}
                  title="Falar por Voz"
                >
                  <Mic size={18} />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') processSendMessage(); }}
                  placeholder="Digite sua dúvida ou anexe uma foto..."
                  disabled={isProcessing}
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl p-2 px-3 text-xs text-white placeholder-gray-500 focus:border-amber-500 focus:outline-none min-w-0 disabled:opacity-50"
                />

                <button
                  onClick={() => processSendMessage()}
                  disabled={isProcessing || (!inputText.trim() && !selectedImageBase64)}
                  className="p-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold transition-all active:scale-90 cursor-pointer shadow-md disabled:opacity-40 shrink-0"
                  title="Enviar mensagem"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
