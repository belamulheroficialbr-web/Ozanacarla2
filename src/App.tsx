import React, {useState, useEffect} from 'react';
import {
  Menu,
  Home,
  LayoutGrid,
  Calendar,
  User,
  MessageCircle,
  X,
  ShieldCheck,
  Briefcase,
  LogIn,
  LogOut,
  ChevronRight,
  Calculator as CalcIcon,
  Sparkles,
  Lock,
  ArrowLeft,
  ShoppingBag,
  Bell,
  Clock,
  MapPin,
  Phone,
  Instagram
} from 'lucide-react';
import {Carousel} from './components/Carousel';
import {VerticalGallery} from './components/VerticalGallery';
import {Vitrine} from './components/Vitrine';
import {AgendamentosView} from './components/client/AgendamentosView';
import {AdminPanel} from './components/admin/AdminPanel';
import {ProfessionalPanel} from './components/professional/ProfessionalPanel';
import {ClientArea} from './components/client/ClientArea';
import {SalonChat} from './components/tools/SalonChat';
import {SacolaModal, CartItem} from './components/SacolaModal';
import {supabase} from './lib/supabase';
import {dataService} from './lib/data';
import {useAuth} from './context/AuthContext';
import {Login} from './components/auth/Login';
import {PWAInstallButton} from './components/tools/PWAInstallButton';
import {BookingModal} from './components/client/BookingModal';
import {NotificationCenter} from './components/tools/NotificationCenter';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  desc: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// Menu Destinado Exclusivamente ao Cliente e ao Público (com Agendamentos e Chat)
const clientNavGroups: NavGroup[] = [
  {
    title: 'Navegação Principal',
    items: [
      {id: 'home', label: 'Início', icon: Home, desc: 'Página inicial e destaques do salão'},
      {id: 'vitrine', label: 'Vitrine de Serviços', icon: LayoutGrid, desc: 'Catálogo de procedimentos e produtos'},
      {id: 'agendamentos', label: 'Agendamentos', icon: Calendar, desc: 'Marque horários e veja seus atendimentos'},
    ]
  },
  {
    title: 'Área Pessoal & Atendimento',
    items: [
      {id: 'cliente', label: 'Área da Cliente', icon: User, desc: 'Programa de fidelidade e histórico'},
      {id: 'chat', label: 'Chat de Atendimento', icon: MessageCircle, desc: 'Atendente virtual e suporte'},
    ]
  }
];

// 5 itens fixos na barra inferior do cliente: Início, Vitrine, Agendamentos, Cliente e Chat
const bottomClientNav = [
  {id: 'home', label: 'Início', icon: Home},
  {id: 'vitrine', label: 'Vitrine', icon: LayoutGrid},
  {id: 'agendamentos', label: 'Agendamentos', icon: Calendar},
  {id: 'cliente', label: 'Cliente', icon: User},
  {id: 'chat', label: 'Chat', icon: MessageCircle},
];

export default function App() {
  // A rota inicial abre SEMPRE na página inicial pública ('home')
  const [activePanel, setActivePanel] = useState<'home' | 'vitrine' | 'agendamentos' | 'cliente' | 'chat' | 'admin' | 'prof'>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'client' | 'staff'>('client');
  const [isSacolaOpen, setIsSacolaOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceToBook, setSelectedServiceToBook] = useState<any>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const {user, role, logoutOwner} = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const channel = supabase
        .channel(`unread_count_${user.id}`)
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchUnreadCount();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;
    const {data} = await dataService.getNotifications(user.id);
    if (data) {
      setUnreadNotifs(data.filter((n: any) => !n.is_read).length);
    }
  };

  const isStaff = user && (role === 'admin' || role === 'professional');
  const isAdmin = user && role === 'admin';
  const isProfessional = user && role === 'professional';

  // Shopping Bag Cart Handlers
  const handleAddToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + item.quantity} : i);
      }
      return [...prev, item];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? {...item, quantity: newQty} : item;
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Fechamento de gaveta e modais via tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navegação Unificada e Confiável: fecha menus, limpa popups e rola suavemente para o topo
  const handleNavigate = (panel: 'home' | 'vitrine' | 'agendamentos' | 'cliente' | 'chat' | 'admin' | 'prof') => {
    setActivePanel(panel);
    setSidebarOpen(false);
    setIsNotifOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutOwner?.();
    supabase.auth.signOut();
    handleNavigate('home');
  };

  const handleOpenStaffPanel = () => {
    if (!user) {
      setLoginMode('staff');
      setShowLogin(true);
      return;
    }
    if (isAdmin) {
      handleNavigate('admin');
    } else if (isProfessional) {
      handleNavigate('prof');
    } else {
      alert('Seu perfil atual é de Cliente. Apenas profissionais e administradores podem acessar a gestão.');
    }
  };

  const handleOpenLogin = (mode: 'client' | 'staff') => {
    setLoginMode(mode);
    setShowLogin(true);
  };

  const handleSelectServiceToBook = (service: any) => {
    if (!user) {
      handleOpenLogin('client');
      return;
    }
    setSelectedServiceToBook(service);
    setIsBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 dark overflow-x-hidden flex flex-col justify-between w-full max-w-full">
      <div className="w-full max-w-full">
        {/* Header Superior Fixo com Identidade Bela Mulher (EXCLUSIVO para páginas públicas e de clientes) */}
        {!(activePanel === 'admin' || activePanel === 'prof') && (
          <header className="sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-4 py-3 bg-black/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/60 w-full">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-amber-400 hover:text-amber-300 rounded-xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/30 transition-all active:scale-90"
                title="Abrir Menu Lateral"
                aria-label="Abrir Menu Lateral"
              >
                <Menu size={22} />
              </button>
              <button
                onClick={() => handleNavigate('home')}
                className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20 tracking-tighter shrink-0 border border-amber-300/40">
                  BM
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors leading-tight">
                    Bela Mulher
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-semibold tracking-widest uppercase -mt-0.5">
                    Salão & Estética
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Notificações Trigger */}
              {user && (
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all active:scale-95"
                  title="Notificações"
                >
                  <Bell size={18} />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black font-bold text-[9px] flex items-center justify-center shadow">
                      {unreadNotifs > 9 ? '9+' : unreadNotifs}
                    </span>
                  )}
                </button>
              )}

              {/* Sacola de Compras Trigger - EXCLUSIVO da aba Vitrine */}
              {activePanel === 'vitrine' && (
                <button
                  onClick={() => setIsSacolaOpen(true)}
                  className="relative p-2 text-amber-400 hover:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-xl transition-all shadow-sm active:scale-95"
                  title="Abrir Sacola de Compras"
                >
                  <ShoppingBag size={18} />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center animate-pulse shadow">
                      {totalCartCount}
                    </span>
                  )}
                </button>
              )}

              <PWAInstallButton />

              {/* User Badge or Login Button */}
              {user ? (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 max-w-[120px] truncate">
                  {isAdmin ? 'Ozana (Admin)' : isProfessional ? 'Profissional' : (user.email?.split('@')[0] || 'Cliente')}
                </span>
              ) : (
                <button
                  onClick={() => handleOpenLogin('client')}
                  className="p-1.5 px-3 text-amber-400 hover:text-amber-300 flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold transition-all active:scale-95"
                >
                  <LogIn size={15} />
                  <span className="hidden xs:inline">Entrar</span>
                </button>
              )}
            </div>
          </header>
        )}

        {/* MENU LATERAL VERTICAL (Exclusivo da navegação pública/cliente, fecha ao clicar fora ou navegar) */}
        {isSidebarOpen && !(activePanel === 'admin' || activePanel === 'prof') && (
          <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
            {/* Backdrop com toque para fechar imediato */}
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
            />

            {/* Gaveta Lateral */}
            <div className="relative w-80 max-w-[85vw] bg-gray-950 border-r border-gray-800 p-5 flex flex-col justify-between overflow-y-auto shadow-2xl z-10">
              <div className="space-y-6">
                {/* Topo do Menu */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base shadow-sm">
                      BM
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight">Bela Mulher</h2>
                      <p className="text-[11px] text-gray-400">Salão & Estética</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
                    aria-label="Fechar menu lateral"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Card de Identificação */}
                <div className="p-3.5 bg-gray-900/90 border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                      {user ? (user.email?.[0]?.toUpperCase() || 'U') : 'V'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {user ? (isAdmin ? 'Ozana (Administradora)' : isProfessional ? 'Especialista Salão' : (user.email || 'Cliente')) : 'Visitante'}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {user ? (isAdmin ? 'Administração Geral' : isProfessional ? 'Painel do Profissional' : 'Espaço do Cliente') : 'Bem-vinda ao salão!'}
                      </p>
                    </div>
                  </div>

                  {!user && (
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        handleOpenLogin('client');
                      }}
                      className="mt-3 w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <LogIn size={14} /> Entrar na Minha Conta
                    </button>
                  )}
                </div>

                {/* Itens Exclusivos da Área do Cliente e Pública */}
                <nav className="space-y-5">
                  {clientNavGroups.map((group, gIdx) => (
                    <div key={gIdx} className="space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-2 block">
                        {group.title}
                      </span>
                      <div className="space-y-1">
                        {group.items.map(item => {
                          const Icon = item.icon;
                          const isActive = activePanel === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleNavigate(item.id as any)}
                              className={`w-full group flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 active:scale-95 ${
                                isActive
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shadow-md shadow-amber-500/10'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-900/70 border border-transparent font-medium'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div
                                  className={`p-2 rounded-lg transition-colors ${
                                    isActive
                                      ? 'bg-amber-500/20 text-amber-400'
                                      : 'bg-gray-900 text-gray-400 group-hover:text-amber-400'
                                  }`}
                                >
                                  <Icon size={18} />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-semibold block truncate">{item.label}</span>
                                  <span className="text-[10px] text-gray-500 block truncate">{item.desc}</span>
                                </div>
                              </div>
                              <ChevronRight
                                size={14}
                                className={`shrink-0 transition-transform ${
                                  isActive ? 'text-amber-400 translate-x-0.5' : 'text-gray-600 group-hover:text-gray-400'
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Seção Exclusiva da Gestão & Profissional (Acesso Único e Protegido) */}
                {isStaff && (
                  <div className="pt-2 border-t border-gray-800/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 px-2 block">
                      Acesso Restrito à Gestão
                    </span>
                    {isAdmin ? (
                      <button
                        onClick={() => handleNavigate('admin')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck size={18} className="text-amber-400" />
                          <span>Painel Administrativo (Ozana)</span>
                        </div>
                        <ChevronRight size={14} className="text-amber-400" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleNavigate('prof')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all active:scale-95 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <Briefcase size={18} className="text-amber-400" />
                          <span>Painel da Especialista</span>
                        </div>
                        <ChevronRight size={14} className="text-amber-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Rodapé da Barra Lateral */}
              <div className="pt-4 mt-6 border-t border-gray-800 space-y-2">
                {!isStaff && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleOpenLogin('staff');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <Lock size={12} />
                    <span>Acesso da Administração</span>
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 text-xs text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-xl transition-all active:scale-95"
                  >
                    <LogOut size={16} />
                    <span>Sair da Conta</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL (Isolamento Rígido de Telas e Compensação de Barra Inferior) */}
        <main className={`pb-28 sm:pb-32 min-h-[calc(100vh-5rem)] w-full max-w-full overflow-x-hidden ${(activePanel === 'admin' || activePanel === 'prof') ? 'p-0 sm:p-4' : 'p-3 sm:p-4'}`}>
          {/* TELA PÚBLICA 1: INÍCIO (Home - Estrutura obrigatória: Cabeçalho, Carrossel, Galeria 9:16, Menu, Faixa Final) */}
          {activePanel === 'home' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              {/* 2. Banner Promocional em Carrossel */}
              <div className="w-full">
                <Carousel />
              </div>

              {/* 3. Galeria de Fotos e Vídeos Verticais 9:16 */}
              <div className="w-full">
                <VerticalGallery />
              </div>

              {/* 4. Menu de Navegação / Acesso Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => handleNavigate('vitrine')}
                  className="p-3.5 bg-gray-950 border border-gray-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center text-center gap-1.5 transition-all group active:scale-95 shadow-md hover:bg-gray-900/60"
                >
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                    <LayoutGrid size={18} />
                  </div>
                  <span className="text-xs font-bold text-white">Vitrine Comercial</span>
                  <span className="text-[10px] text-gray-500">Produtos & Linhas</span>
                </button>

                <button
                  onClick={() => handleNavigate('agendamentos')}
                  className="p-3.5 bg-gray-950 border border-gray-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center text-center gap-1.5 transition-all group active:scale-95 shadow-md hover:bg-gray-900/60"
                >
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                    <Calendar size={18} />
                  </div>
                  <span className="text-xs font-bold text-white">Agendamentos</span>
                  <span className="text-[10px] text-gray-500">Horários Online</span>
                </button>

                <button
                  onClick={() => handleNavigate('cliente')}
                  className="p-3.5 bg-gray-950 border border-gray-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center text-center gap-1.5 transition-all group active:scale-95 shadow-md hover:bg-gray-900/60"
                >
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                    <User size={18} />
                  </div>
                  <span className="text-xs font-bold text-white">Área da Cliente</span>
                  <span className="text-[10px] text-gray-500">Sacola & Fidelidade</span>
                </button>

                <button
                  onClick={() => handleNavigate('chat')}
                  className="p-3.5 bg-gray-950 border border-gray-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center text-center gap-1.5 transition-all group active:scale-95 shadow-md hover:bg-gray-900/60"
                >
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
                    <MessageCircle size={18} />
                  </div>
                  <span className="text-xs font-bold text-white">Atendimento</span>
                  <span className="text-[10px] text-gray-500">Chat & Assistente</span>
                </button>
              </div>

              {/* 5. Faixa Final com Telefone, WhatsApp, Endereço, Horários e Redes Sociais (Rolagem termina exatamente aqui) */}
              <footer className="p-5 sm:p-6 rounded-3xl bg-gray-950 border border-amber-500/25 space-y-4 shadow-2xl mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                      BM
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">Bela Mulher Salão & Estética</h4>
                      <p className="text-[11px] text-amber-400/80">Excelência em beleza, estética e cuidado VIP</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors flex items-center gap-1.5"
                    >
                      <Instagram size={14} className="text-amber-400" />
                      <span>Instagram</span>
                    </a>
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-semibold text-gray-300 hover:text-amber-400 hover:border-amber-500/40 transition-colors flex items-center gap-1.5"
                    >
                      <span>Facebook</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-300">
                  <a
                    href="tel:+5511987654321"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-amber-500/40 transition-colors active:scale-95"
                  >
                    <Phone size={16} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-500 block">Telefone do Salão</span>
                      <strong className="text-white">(11) 98765-4321</strong>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/5511987654321"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-emerald-500/40 transition-colors active:scale-95"
                  >
                    <MessageCircle size={16} className="text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-500 block">WhatsApp Oficial</span>
                      <strong className="text-emerald-400">Conversar no Zap</strong>
                    </div>
                  </a>

                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-900/80 border border-gray-800">
                    <MapPin size={16} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-500 block">Endereço Completo</span>
                      <strong className="text-white">Av. da Beleza, 1250 - Espaço VIP</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-900/80 border border-gray-800">
                    <Clock size={16} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-500 block">Horário de Funcionamento</span>
                      <strong className="text-white">Ter a Sáb: 08h às 19h</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-800/80 text-center text-[11px] text-gray-500">
                  Bela Mulher Salão & Estética © 2026 • Todos os direitos reservados.
                </div>
              </footer>
            </div>
          )}

          {/* TELA PÚBLICA 2: VITRINE DE SERVIÇOS & PRODUTOS */}
          {activePanel === 'vitrine' && (
            <Vitrine 
              onAddToCart={handleAddToCart} 
              onSelectServiceToBook={handleSelectServiceToBook} 
            />
          )}

          {/* TELA PÚBLICA 3: AGENDAMENTOS ONLINE & CONSULTA */}
          {activePanel === 'agendamentos' && (
            <AgendamentosView
              onOpenBookingModal={handleSelectServiceToBook}
              onRequestLogin={() => handleOpenLogin('client')}
              onNavigateToVitrine={() => handleNavigate('vitrine')}
            />
          )}

          {/* TELA 4: ÁREA EXCLUSIVA DO CLIENTE (Sacola Integrada, Fidelidade, Meus Atendimentos) */}
          {activePanel === 'cliente' && (
            <ClientArea
              onNavigateToVitrine={() => handleNavigate('vitrine')}
              onRequestLogin={() => handleOpenLogin('client')}
              cart={cart}
              onUpdateCartQuantity={handleUpdateCartQuantity}
              onRemoveFromCart={handleRemoveFromCart}
              onClearCart={handleClearCart}
              onOpenSacolaCheckout={() => setIsSacolaOpen(true)}
              onOpenBookingModal={handleSelectServiceToBook}
            />
          )}

          {/* TELA 5: CHAT DE ATENDIMENTO & ASSISTENTE VIRTUAL */}
          {activePanel === 'chat' && <SalonChat />}

          {/* TELA 6: PAINEL ADMINISTRATIVO (Apenas para role === 'admin') */}
          {activePanel === 'admin' && (
            isAdmin ? (
              <div className="space-y-4 w-full max-w-full">
                <AdminPanel onExitToPublic={() => handleNavigate('home')} />
              </div>
            ) : isProfessional ? (
              <div className="space-y-4 w-full max-w-full">
                <ProfessionalPanel onExitToPublic={() => handleNavigate('home')} />
              </div>
            ) : (
              <div className="max-w-md mx-auto my-12 bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Lock size={30} />
                </div>
                <h3 className="text-lg font-bold text-white">Acesso Restrito à Gestão</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Este painel é reservado exclusivamente à equipe e administração do Salão Bela Mulher.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleOpenLogin('staff')}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-amber-600/20 active:scale-95"
                  >
                    Fazer Login de Gestão
                  </button>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-xs transition-colors active:scale-95"
                  >
                    Voltar à Tela Inicial Pública
                  </button>
                </div>
              </div>
            )
          )}

          {/* TELA 7: PAINEL DO PROFISSIONAL (Apenas para role === 'professional' ou 'admin') */}
          {activePanel === 'prof' && (
            isStaff ? (
              <div className="space-y-4 w-full max-w-full">
                <ProfessionalPanel onExitToPublic={() => handleNavigate('home')} />
              </div>
            ) : (
              <div className="max-w-md mx-auto my-12 bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Lock size={30} />
                </div>
                <h3 className="text-lg font-bold text-white">Acesso Restrito ao Profissional</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Esta área é exclusiva para a equipe de especialistas do salão Bela Mulher.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleOpenLogin('staff')}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-lg shadow-amber-600/20 active:scale-95"
                  >
                    Fazer Login de Profissional
                  </button>
                  <button
                    onClick={() => handleNavigate('home')}
                    className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-xs transition-colors active:scale-95"
                  >
                    Voltar à Tela Inicial Pública
                  </button>
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {/* MODAL DA SACOLA DE COMPRAS */}
      <SacolaModal
        isOpen={isSacolaOpen}
        onClose={() => setIsSacolaOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onRequestLogin={() => handleOpenLogin('client')}
      />

      {/* FOOTER FIXO DO CLIENTE (5 opções públicas/cliente: Início, Vitrine, Agendamentos, Cliente e Chat) */}
      {!(activePanel === 'admin' || activePanel === 'prof') && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-amber-500/20 px-2 py-2 shadow-2xl">
          <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
            {bottomClientNav.map(item => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as any)}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 group active:scale-90 ${
                    isActive
                      ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30 font-bold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50 border border-transparent font-medium'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-amber-400 scale-105' : 'text-gray-400 group-hover:text-gray-200'} />
                  <span className={`text-[10px] mt-0.5 truncate max-w-full ${isActive ? 'text-amber-400 font-bold' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </footer>
      )}

      {showLogin && <Login onClose={() => setShowLogin(false)} defaultMode={loginMode} />}
      
      {/* NOTIFICAÇÕES (COM OVERLAY BACKDROP E LARGURA RESPONSIVA EM TELAS PEQUENAS) */}
      {isNotifOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
            onClick={() => setIsNotifOpen(false)} 
            aria-hidden="true" 
          />
          <div className="fixed top-16 right-2 sm:right-4 z-50 w-[calc(100vw-1rem)] sm:w-80 max-w-sm h-[500px] max-h-[80vh] shadow-2xl">
            <NotificationCenter onClose={() => setIsNotifOpen(false)} />
          </div>
        </>
      )}

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        preSelectedService={selectedServiceToBook} 
      />
    </div>
  );
}
