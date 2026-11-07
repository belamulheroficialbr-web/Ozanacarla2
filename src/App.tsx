import React, {useState, useEffect, useRef} from 'react';
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
  Instagram,
  Info,
  Globe,
  Share2,
  Image,
  Camera
} from 'lucide-react';
import {Carousel} from './components/Carousel';
import {VerticalGallery} from './components/VerticalGallery';
import {HomeContactFooter} from './components/HomeContactFooter';
import {Vitrine} from './components/Vitrine';
import {AgendamentosView} from './components/client/AgendamentosView';
import {AdminPanel} from './components/admin/AdminPanel';
import {ProfessionalPanel} from './components/professional/ProfessionalPanel';
import {ClientArea} from './components/client/ClientArea';
import {SalonChat} from './components/tools/SalonChat';
import {SacolaModal, CartItem} from './components/SacolaModal';
import {supabase} from './lib/supabase';
import {dataService, getLayoutConfig, DEFAULT_LAYOUT_CONFIG, AppLayoutConfig} from './lib/data';
import {useAuth, OWNER_ADMIN_ID} from './context/AuthContext';
import {Login} from './components/auth/Login';
import {ClientAuthPortal} from './components/auth/ClientAuthPortal';
import {ProfessionalAuthPortal} from './components/auth/ProfessionalAuthPortal';
import {PWAInstallButton} from './components/tools/PWAInstallButton';
import {BookingModal} from './components/client/BookingModal';
import {NotificationCenter} from './components/tools/NotificationCenter';
import {AccountSelectorModal} from './components/auth/AccountSelectorModal';
import {AdminLoginModal} from './components/auth/AdminLoginModal';

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

// Menu Destinado Exclusivamente ao Cliente e ao Público
const clientNavGroups: NavGroup[] = [
  {
    title: 'Navegação Principal',
    items: [
      {id: 'home', label: 'Início', icon: Home, desc: 'Página inicial e destaques do salão'},
      {id: 'vitrine', label: 'Vitrine de Serviços', icon: LayoutGrid, desc: 'Catálogo de procedimentos e produtos'},
      {id: 'galeria', label: 'Galeria Mídia', icon: Image, desc: 'Fotos e vídeos de procedimentos'},
    ]
  },
  {
    title: 'Áreas & Atendimento',
    items: [
      {id: 'prof', label: 'Área do Profissional', icon: Briefcase, desc: 'Painel da equipe e especialistas'},
      {id: 'cliente', label: 'Área da Cliente', icon: User, desc: 'Programa de fidelidade e histórico'},
    ]
  }
];

// 4 itens fixos na barra inferior: Início, Cliente, Profissional e Vitrine
const bottomClientNav = [
  {id: 'home', label: 'Início', icon: Home},
  {id: 'cliente', label: 'Cliente', icon: User},
  {id: 'prof', label: 'Profissional', icon: Briefcase},
  {id: 'vitrine', label: 'Vitrine', icon: LayoutGrid},
];

export default function App() {
  // A rota inicial abre SEMPRE na página inicial pública ('home')
  const [activePanel, setActivePanel] = useState<'home' | 'vitrine' | 'agendamentos' | 'cliente' | 'galeria' | 'admin' | 'prof'>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMode, setLoginMode] = useState<'client' | 'staff'>('client');
  const [isSacolaOpen, setIsSacolaOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedServiceToBook, setSelectedServiceToBook] = useState<any>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [isSalonInfoOpen, setIsSalonInfoOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const [isAccountSelectorOpen, setIsAccountSelectorOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const [salonConfig, setSalonConfig] = useState({
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    address: 'Av. da Beleza, 1250 - Espaço VIP',
    hours: 'Ter a Sáb: 08h às 19h',
    instagram: 'https://instagram.com/belamulher',
    facebook: 'https://facebook.com/belamulher',
    tiktok: 'https://tiktok.com/@belamulher'
  });

  const [layoutConfig, setLayoutConfig] = useState<AppLayoutConfig>(DEFAULT_LAYOUT_CONFIG);

  useEffect(() => {
    async function fetchLayout() {
      const cfg = await getLayoutConfig('published');
      setLayoutConfig(cfg);
    }
    fetchLayout();

    const handleLayoutPublished = (e: any) => {
      if (e.detail) {
        setLayoutConfig(e.detail);
      }
    };
    window.addEventListener('bela_layout_published', handleLayoutPublished);
    return () => window.removeEventListener('bela_layout_published', handleLayoutPublished);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('bela_mulher_custom_config');
    if (saved) {
      try {
        setSalonConfig(prev => ({...prev, ...JSON.parse(saved)}));
      } catch(e) {}
    }
  }, [isSidebarOpen, isSalonInfoOpen, isSocialOpen]);

  const {user, role, logoutOwner} = useAuth();

  // Estado do perfil do usuário para foto editável no topo do menu lateral
  const [userProfile, setUserProfile] = useState<{
    name?: string;
    avatar_url?: string;
    role?: string;
  } | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`BELA_PROFILE_${user.id}`);
      if (stored) {
        try {
          setUserProfile(JSON.parse(stored));
        } catch {}
      }
      dataService.getProfile(user.id).then(res => {
        if (res.data) {
          const profileData = {
            ...res.data,
            name: res.data.name || user.user_metadata?.name || user.email?.split('@')[0],
            avatar_url: res.data.avatar_url || (stored ? JSON.parse(stored).avatar_url : undefined)
          };
          setUserProfile(profileData);
          localStorage.setItem(`BELA_PROFILE_${user.id}`, JSON.stringify(profileData));
        } else {
          setUserProfile(prev => ({
            ...prev,
            name: user.user_metadata?.name || user.email?.split('@')[0],
          }));
        }
      });
    } else {
      const guestAvatar = localStorage.getItem('BELA_GUEST_AVATAR');
      if (guestAvatar) {
        setUserProfile({ name: 'Visitante Bela Mulher', avatar_url: guestAvatar });
      } else {
        setUserProfile(null);
      }
    }
  }, [user]);

  const handleUpdateAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Por favor, selecione uma imagem com até 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        setUserProfile(prev => ({ ...(prev || {}), avatar_url: base64 }));
        if (user) {
          const updated = {
            ...(userProfile || {}),
            avatar_url: base64
          };
          localStorage.setItem(`BELA_PROFILE_${user.id}`, JSON.stringify(updated));
          await dataService.updateProfile(user.id, { avatar_url: base64 });
        } else {
          localStorage.setItem('BELA_GUEST_AVATAR', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  const userEmail = user?.email?.trim().toLowerCase();
  const isOwnerEmail = userEmail === 'belamulheroficial.br@gmail.com' || userEmail === 'oficial.belamulher@gmail.com' || user?.id === OWNER_ADMIN_ID;
  const isAdmin = (user && role === 'admin') || isOwnerEmail;
  const isProfessional = (user && role === 'professional') && !isOwnerEmail;
  const isStaff = isAdmin || isProfessional;

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

  const closeAllOverlays = () => {
    setSidebarOpen(false);
    setIsNotifOpen(false);
    setIsSalonInfoOpen(false);
    setIsSocialOpen(false);
    setIsAccountSelectorOpen(false);
    setIsAdminLoginOpen(false);
    setIsBookingOpen(false);
    setIsSacolaOpen(false);
  };

  // Fechamento automático via tecla ESC e botão Voltar do celular (popstate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllOverlays();
      }
    };

    const handlePopState = () => {
      closeAllOverlays();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Navegação Unificada e Confiável: fecha menus, limpa popups e rola suavemente para o topo
  const handleNavigate = (panel: 'home' | 'vitrine' | 'agendamentos' | 'cliente' | 'galeria' | 'admin' | 'prof') => {
    setActivePanel(panel);
    closeAllOverlays();
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
    if (mode === 'staff') {
      handleNavigate('prof');
    } else {
      handleNavigate('cliente');
    }
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
        {/* 1. TOPO FIXO INSTITUCIONAL: Banner amplo estático parado, fixo no topo da janela e independente do carrossel */}
        {!(activePanel === 'admin' || activePanel === 'prof') && (
          <header className="fixed top-0 left-0 right-0 z-30 bg-gray-950/95 backdrop-blur-md border-b border-amber-500/30 shadow-xl shadow-black/80 w-full transition-all">
            <div className="max-w-4xl mx-auto px-3.5 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-3">
              {/* Esquerda: Botão Menu + Bloco Institucional Principal (BM + Bela Mulher + Salão & Estética + Slogan) */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2.5 text-amber-400 hover:text-amber-300 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all active:scale-90 shrink-0 cursor-pointer shadow-sm"
                  title="Abrir Menu Lateral"
                  aria-label="Abrir Menu Lateral"
                >
                  <Menu size={22} />
                </button>

                {/* Identidade Institucional Ficha Ampla e Destacada */}
                <button
                  onClick={() => handleNavigate('home')}
                  className="flex items-center gap-3 text-left group transition-transform active:scale-98 min-w-0"
                >
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-base sm:text-lg flex items-center justify-center shadow-lg shadow-amber-500/25 tracking-tighter shrink-0 border border-amber-300/50">
                    BM
                  </div>
                  <div className="flex flex-col justify-center min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap leading-tight">
                      <span className="text-base sm:text-lg font-black text-white tracking-wide group-hover:text-amber-400 transition-colors truncate">
                        Bela Mulher
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                        Salão & Estética
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-300 font-medium tracking-tight truncate max-w-xs sm:max-w-md">
                      Excelência em beleza, estética e cuidado VIP
                    </p>
                  </div>
                </button>
              </div>

              {/* Direita: Notificações, Sacola e Conta (LIMPO, sem texto "Bela Mulher" ou rótulos redundantes) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Notificações Trigger */}
                {user && (
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2.5 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl transition-all active:scale-95 cursor-pointer shadow-sm"
                    title="Notificações"
                  >
                    <Bell size={19} />
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 text-black font-extrabold text-[9px] flex items-center justify-center shadow-md">
                        {unreadNotifs > 9 ? '9+' : unreadNotifs}
                      </span>
                    )}
                  </button>
                )}

                {/* Sacola de Compras Trigger - EXCLUSIVO da aba Vitrine */}
                {activePanel === 'vitrine' && (
                  <button
                    onClick={() => setIsSacolaOpen(true)}
                    className="relative p-2.5 text-amber-400 hover:text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded-2xl transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Abrir Sacola de Compras"
                  >
                    <ShoppingBag size={19} />
                    {totalCartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-black font-bold text-[10px] flex items-center justify-center animate-pulse shadow">
                        {totalCartCount}
                      </span>
                    )}
                  </button>
                )}

                <PWAInstallButton />

                {/* Botão de Conta (Discreto e sem rotular o cabeçalho) */}
                {!user ? (
                  <button
                    onClick={() => setIsAccountSelectorOpen(true)}
                    className="p-2.5 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
                    title="Minha Conta"
                  >
                    <User size={19} />
                    <span className="hidden sm:inline text-xs font-semibold">Entrar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate(isAdmin ? 'admin' : isProfessional ? 'prof' : 'cliente')}
                    className="p-2.5 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
                    title="Minha Conta"
                  >
                    <User size={19} />
                    <span className="hidden sm:inline text-xs font-semibold max-w-[100px] truncate">
                      {userProfile?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Perfil'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </header>
        )}

        {/* 4. MENU LATERAL VERTICAL FIXO NA JANELA (position: fixed top-0 left-0 h-[100dvh] preso à janela) */}
        {isSidebarOpen && !(activePanel === 'admin' || activePanel === 'prof') && (
          <div 
            className="fixed top-0 left-0 right-0 bottom-0 z-50 h-[100dvh] h-dvh w-full animate-in fade-in duration-200 pointer-events-auto"
            onClick={() => setSidebarOpen(false)}
          >
            {/* Backdrop com toque para fechar imediato */}
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              aria-hidden="true"
            />

            {/* Gaveta Lateral Presa na Janela: top-0 left-0 h-[100dvh] */}
            <div 
              onClick={e => e.stopPropagation()}
              className="fixed top-0 left-0 z-50 w-76 max-w-[85vw] h-[100dvh] h-dvh bg-gray-950 border-r border-amber-500/25 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar shadow-2xl space-y-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-in slide-in-from-left duration-200"
            >
              <div className="space-y-3">
                {/* 1. Área de Perfil no Topo do Menu Compacta */}
                <div className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900/90 to-amber-950/20 border border-amber-500/25 shadow-md">
                  <div className="flex items-center gap-2.5">
                    {/* Foto de Perfil com Botão Discreto de Edição */}
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-black border border-amber-500/40 shadow-md flex items-center justify-center">
                        {userProfile?.avatar_url ? (
                          <img
                            src={userProfile.avatar_url}
                            alt={userProfile?.name || 'Foto de Perfil'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-sm flex items-center justify-center tracking-tighter">
                            {user ? (userProfile?.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U') : 'BM'}
                          </div>
                        )}
                      </div>

                      {/* Botão discreto para alterar a foto */}
                      <button
                        type="button"
                        onClick={() => profilePhotoInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-1 rounded-full bg-black/90 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/50 transition-all shadow-md active:scale-90 cursor-pointer"
                        title="Alterar foto de perfil"
                        aria-label="Alterar foto de perfil"
                      >
                        <Camera size={10} />
                      </button>
                      <input
                        ref={profilePhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleUpdateAvatar}
                        className="hidden"
                      />
                    </div>

                    {/* Nome da Pessoa e Identificação do Perfil */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
                        {userProfile?.name || (user ? user.email?.split('@')[0] : 'Visitante Bela Mulher')}
                      </h3>
                      <span className="inline-block px-1.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 mt-0.5">
                        {user ? (isAdmin ? 'Administradora' : isProfessional ? 'Especialista' : 'Cliente VIP') : 'Acesso Geral'}
                      </span>
                      {!user && (
                        <button
                          onClick={() => {
                            setSidebarOpen(false);
                            setIsAccountSelectorOpen(true);
                          }}
                          className="text-[10px] text-amber-400 font-semibold hover:underline block mt-0.5 cursor-pointer"
                        >
                          Entrar ou Cadastrar →
                        </button>
                      )}
                    </div>

                    {/* Botão Fechar Menu */}
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors self-start shrink-0 cursor-pointer"
                      aria-label="Fechar menu lateral"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* 2. Lista de Itens do Menu Compacta e Aproximada */}
                <nav className="space-y-1.5">
                  {[
                    {
                      id: 'home',
                      label: 'Início',
                      icon: Home,
                      desc: 'Página inicial e destaques',
                      action: () => handleNavigate('home')
                    },
                    {
                      id: 'vitrine',
                      label: 'Vitrine',
                      icon: LayoutGrid,
                      desc: 'Catálogo de procedimentos e produtos',
                      action: () => handleNavigate('vitrine')
                    },
                    {
                      id: 'galeria',
                      label: 'Galeria',
                      icon: Image,
                      desc: 'Vídeos e fotos verticais 9:16',
                      action: () => handleNavigate('galeria')
                    },
                    {
                      id: 'cliente',
                      label: 'Área do Cliente',
                      icon: User,
                      desc: 'Programa de fidelidade e histórico',
                      action: () => handleNavigate('cliente')
                    },
                    {
                      id: 'prof',
                      label: 'Área Profissional',
                      icon: Briefcase,
                      desc: 'Painel da equipe e especialistas',
                      action: () => handleNavigate('prof')
                    },

                    {
                      id: 'info',
                      label: 'Informações',
                      icon: Info,
                      desc: 'Endereço, contatos e funcionamento',
                      action: () => {
                        setSidebarOpen(false);
                        setIsSalonInfoOpen(true);
                      }
                    },
                    {
                      id: 'social',
                      label: 'Redes Sociais',
                      icon: Globe,
                      desc: 'Instagram, WhatsApp, Facebook e TikTok',
                      action: () => {
                        setSidebarOpen(false);
                        setIsSocialOpen(true);
                      }
                    },
                    ...(isAdmin ? [{
                      id: 'admin',
                      label: 'Painel de Controle',
                      icon: ShieldCheck,
                      desc: 'Gestão geral e relatórios administrativos',
                      action: () => handleNavigate('admin')
                    }] : [])
                  ].map(item => {
                    const Icon = item.icon;
                    const isActive = activePanel === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className={`w-full group flex items-center justify-between p-2 rounded-xl text-left transition-all duration-150 active:scale-98 cursor-pointer ${
                          isActive
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/35 font-bold shadow-sm'
                            : 'text-gray-300 hover:text-white hover:bg-gray-900 border border-gray-800/40 hover:border-amber-500/25 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? 'bg-amber-500 text-black shadow-sm'
                                : 'bg-gray-900 text-gray-400 group-hover:text-amber-400 group-hover:bg-amber-500/10'
                            }`}
                          >
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold block truncate leading-tight">{item.label}</span>
                            <span className="text-[9px] text-gray-500 block truncate mt-0.5">{item.desc}</span>
                          </div>
                        </div>
                        <ChevronRight
                          size={14}
                          className={`shrink-0 transition-transform ${
                            isActive ? 'text-amber-400 translate-x-0.5' : 'text-gray-600 group-hover:text-amber-400'
                          }`}
                        />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* 3. Rodapé do Menu Lateral Compacto com Botão PWA e Marca */}
              <div className="pt-2 border-t border-gray-800/80 space-y-1.5">
                <PWAInstallButton />
                <p className="text-[9.5px] text-gray-500 text-center font-medium">
                  Bela Mulher · Salão & Estética
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. CONTEÚDO PRINCIPAL (Espaçamento pt-28 sm:pt-32 para descer o carrossel após o cabeçalho) */}
        <main className={`pt-28 sm:pt-32 pb-24 sm:pb-28 min-h-[calc(100vh-4.5rem)] w-full max-w-full overflow-x-hidden ${(activePanel === 'admin' || activePanel === 'prof') ? 'p-0 pt-28 sm:p-4 sm:pt-32' : 'p-3 pt-28 sm:p-4 sm:pt-32'}`}>
          {/* TELA PÚBLICA 1: INÍCIO (Home) */}
          {activePanel === 'home' && (
            <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full animate-in fade-in duration-200 pt-2 sm:pt-4">
              {/* 2. Banner Principal em Carrossel Automático de banners promocionais, produtos, cortes e serviços */}
              {layoutConfig.carousel.visible && (
                <div className="w-full">
                  <Carousel />
                </div>
              )}

              {/* Custom Admin Elements Published via Visual Editor */}
              {layoutConfig.elements
                .filter(e => !e.is_protected && e.visible)
                .sort((a, b) => a.order - b.order)
                .map(elem => (
                  <div
                    key={elem.id}
                    style={{
                      transform: `translate(${elem.styles?.x || 0}px, ${elem.styles?.y || 0}px)`,
                      width: `${elem.styles?.width || 100}%`,
                      backgroundColor: elem.styles?.bgColor || '#111827',
                      color: elem.styles?.textColor || '#ffffff',
                      padding: `${elem.styles?.padding || 12}px`,
                      borderRadius: `${elem.styles?.borderRadius || 16}px`,
                      textAlign: elem.styles?.textAlign || 'center'
                    }}
                    className="w-full border border-amber-500/20 shadow-xl"
                  >
                    {elem.type === 'button' && (
                      <button 
                        onClick={() => elem.link_target && handleNavigate(elem.link_target as any)}
                        className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold rounded-xl text-xs shadow-md active:scale-98 transition-all cursor-pointer"
                      >
                        {elem.title}
                      </button>
                    )}

                    {elem.type === 'banner' && (
                      <div className="space-y-2">
                        {elem.image_url && (
                          <img
                            src={elem.image_url}
                            alt={elem.title}
                            className="w-full h-44 object-cover rounded-xl"
                          />
                        )}
                        <h4 className="text-sm font-bold text-white">{elem.title}</h4>
                        {elem.content && <p className="text-xs text-gray-300">{elem.content}</p>}
                      </div>
                    )}

                    {elem.type === 'text_block' && (
                      <div>
                        <h4 className="text-sm font-black text-white">{elem.title}</h4>
                        {elem.content && <p className="text-xs text-gray-300 mt-1">{elem.content}</p>}
                      </div>
                    )}

                    {elem.type === 'section' && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">{elem.title}</h4>
                        {elem.content && <p className="text-xs text-gray-300">{elem.content}</p>}
                      </div>
                    )}
                  </div>
                ))}

              {/* 3. Mídia 9:16: Vídeos e Fotos Verticais logo abaixo do carrossel */}
              {layoutConfig.gallery.visible && (
                <div className="w-full">
                  <VerticalGallery />
                </div>
              )}
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

          {/* TELA 4: ÁREA EXCLUSIVA DO CLIENTE (Com Portal de Entrada/Pré-Cadastro quando deslogado) */}
          {activePanel === 'cliente' && (
            user ? (
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
            ) : (
              <ClientAuthPortal 
                onSuccess={() => setActivePanel('cliente')} 
                onBackToHome={() => handleNavigate('home')} 
              />
            )
          )}

          {/* TELA 4.5: GALERIA DE MÍDIAS (Fotos e Vídeos Verticais) */}
          {activePanel === 'galeria' && (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              <div className="bg-gradient-to-r from-gray-950 via-amber-950/30 to-gray-950 border border-amber-500/30 rounded-3xl p-5 text-center shadow-xl">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center justify-center gap-2.5">
                  <Sparkles className="text-amber-400" size={22} />
                  Galeria Bela Mulher
                </h2>
                <p className="text-xs text-gray-300 mt-1 max-w-md mx-auto">
                  Assista aos vídeos verticais e confira fotos dos últimos procedimentos e produções VIP do salão.
                </p>
              </div>
              <VerticalGallery />
            </div>
          )}

          {/* TELA 6: PAINEL ADMINISTRATIVO (Apenas para role === 'admin') */}
          {activePanel === 'admin' && (
            isAdmin ? (
              <div className="space-y-4 w-full max-w-full">
                <AdminPanel onExitToPublic={() => handleNavigate('home')} />
              </div>
            ) : (
              <div className="max-w-md mx-auto my-12 bg-gray-900 border border-amber-500/30 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck size={30} />
                </div>
                <h3 className="text-lg font-bold text-white">Identificação Administrativa</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Para acessar o Painel Administrativo, insira suas credenciais de administrador autorizadas no Supabase Auth.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setIsAdminLoginOpen(true)}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs transition-colors shadow-lg shadow-amber-600/20 active:scale-95"
                  >
                    Fazer Login de Administradora
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

          {/* TELA 7: PAINEL DO PROFISSIONAL (Com Portal de Solicitação & Acesso para não autorizados) */}
          {activePanel === 'prof' && (
            (user && (isProfessional || isAdmin)) ? (
              <div className="space-y-4 w-full max-w-full">
                <ProfessionalPanel onExitToPublic={() => handleNavigate('home')} />
              </div>
            ) : (
              <ProfessionalAuthPortal 
                onSuccess={() => setActivePanel('prof')} 
                onBackToHome={() => handleNavigate('home')} 
              />
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

      {/* FOOTER FIXO DE NAVEGAÇÃO (4 opções fixas: Início, Cliente, Profissional e Vitrine) */}
      {!(activePanel === 'admin' || activePanel === 'prof') && (
        <footer className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-gray-950/95 to-black/90 backdrop-blur-xl border-t border-amber-500/30 px-2 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl shadow-black">
          <div className="max-w-md mx-auto grid grid-cols-4 gap-1.5 items-center">
            {bottomClientNav.map(item => {
              const Icon = item.icon;
              const isActive = activePanel === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id as any)}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-200 group active:scale-90 cursor-pointer ${
                    isActive
                      ? 'text-amber-300 bg-gradient-to-br from-amber-500/25 via-amber-500/15 to-amber-950/50 border border-amber-500/40 font-black shadow-lg shadow-amber-500/15 ring-1 ring-amber-500/20'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50 border border-transparent font-medium'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'text-gray-400 group-hover:text-gray-200 transition-transform'} />
                  <span className={`text-[10.5px] mt-1 truncate max-w-full tracking-tight ${isActive ? 'text-amber-300 font-bold' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </footer>
      )}

      {/* FLOATING ATENDENTE VIP CHAT ANCHORED AT BOTTOM RIGHT */}
      {activePanel !== 'admin' && activePanel !== 'prof' && (
        <SalonChat
          onAddToCart={handleAddToCart}
          onOpenSacola={() => setIsSacolaOpen(true)}
          cart={cart}
        />
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

      {/* MODAL 1: INFORMAÇÕES DO SALÃO */}
      {isSalonInfoOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsSalonInfoOpen(false)}
        >
          <div 
            className="bg-gray-950 border border-amber-500/30 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Info size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Informações do Salão</h3>
                  <p className="text-[11px] text-gray-400">Contatos e localização oficial</p>
                </div>
              </div>
              <button
                onClick={() => setIsSalonInfoOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <a
                href={`tel:${salonConfig.phone.replace(/\D/g, '')}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900 border border-gray-800 hover:border-amber-500/40 text-gray-200 transition-all active:scale-98"
              >
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Telefone</span>
                  <strong className="text-sm font-semibold text-white">{salonConfig.phone}</strong>
                </div>
              </a>

              <a
                href={`https://wa.me/${salonConfig.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/40 text-gray-200 transition-all active:scale-98"
              >
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">WhatsApp Atendimento</span>
                  <strong className="text-sm font-semibold text-emerald-400">Conversar no WhatsApp</strong>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900 border border-gray-800 text-gray-200">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Endereço</span>
                  <strong className="text-xs font-semibold text-white">{salonConfig.address}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-900 border border-gray-800 text-gray-200">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
                  <Clock size={18} />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Funcionamento</span>
                  <strong className="text-xs font-semibold text-white">{salonConfig.hours}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsSalonInfoOpen(false)}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-amber-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: REDES SOCIAIS UNIFICADAS (Instagram, Facebook, TikTok, WhatsApp) */}
      {isSocialOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsSocialOpen(false)}
        >
          <div 
            className="bg-gray-950 border border-amber-500/30 w-full max-w-md rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Globe size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Redes Sociais Oficiais</h3>
                  <p className="text-[11px] text-gray-400">Siga o Bela Mulher nas mídias digitais</p>
                </div>
              </div>
              <button
                onClick={() => setIsSocialOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={salonConfig.instagram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-purple-950/40 via-pink-950/40 to-gray-900 border border-pink-500/30 hover:border-pink-500 text-gray-100 transition-all active:scale-95"
              >
                <Instagram size={20} className="text-pink-400" />
                <div className="min-w-0">
                  <span className="text-xs font-bold block">Instagram</span>
                  <span className="text-[10px] text-gray-400 block truncate">@belamulher</span>
                </div>
              </a>

              <a
                href={salonConfig.facebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 to-gray-900 border border-blue-500/30 hover:border-blue-500 text-gray-100 transition-all active:scale-95"
              >
                <Globe size={20} className="text-blue-400" />
                <div className="min-w-0">
                  <span className="text-xs font-bold block">Facebook</span>
                  <span className="text-[10px] text-gray-400 block truncate">Bela Mulher Salão</span>
                </div>
              </a>

              <a
                href={salonConfig.tiktok}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-950 to-gray-900 border border-cyan-500/30 hover:border-cyan-400 text-gray-100 transition-all active:scale-95"
              >
                <Share2 size={20} className="text-cyan-400" />
                <div className="min-w-0">
                  <span className="text-xs font-bold block">TikTok</span>
                  <span className="text-[10px] text-gray-400 block truncate">Vídeos & Dicas</span>
                </div>
              </a>

              <a
                href={`https://wa.me/${salonConfig.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-gray-900 border border-emerald-500/30 hover:border-emerald-500 text-gray-100 transition-all active:scale-95"
              >
                <MessageCircle size={20} className="text-emerald-400" />
                <div className="min-w-0">
                  <span className="text-xs font-bold block">WhatsApp</span>
                  <span className="text-[10px] text-emerald-400 block truncate">Atendimento Direto</span>
                </div>
              </a>
            </div>

            <button
              onClick={() => setIsSocialOpen(false)}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-amber-400 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        preSelectedService={selectedServiceToBook} 
      />

      <AccountSelectorModal
        isOpen={isAccountSelectorOpen}
        onClose={() => setIsAccountSelectorOpen(false)}
        onSelectClient={() => handleNavigate('cliente')}
        onSelectProfessional={() => handleNavigate('prof')}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => handleNavigate('admin')}
      />
    </div>
  );
}
