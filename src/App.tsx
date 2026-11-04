/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect} from 'react';
import {
  Menu,
  Home,
  LayoutGrid,
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
  ArrowLeft
} from 'lucide-react';
import {Carousel} from './components/Carousel';
import {VerticalGallery} from './components/VerticalGallery';
import {Vitrine} from './components/Vitrine';
import {AdminPanel} from './components/admin/AdminPanel';
import {ProfessionalPanel} from './components/professional/ProfessionalPanel';
import {ClientArea} from './components/client/ClientArea';
import {SalonChat} from './components/tools/SalonChat';
import {supabase} from './lib/supabase';
import {dataService} from './lib/data';
import {useAuth} from './context/AuthContext';
import {Login} from './components/auth/Login';
import {PWAInstallButton} from './components/tools/PWAInstallButton';

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
      {id: 'vitrine', label: 'Vitrine de Serviços', icon: LayoutGrid, desc: 'Catálogo de procedimentos e preços'},
    ]
  },
  {
    title: 'Área do Cliente',
    items: [
      {id: 'cliente', label: 'Minha Área de Cliente', icon: User, desc: 'Meus agendamentos e dados pessoais'},
      {id: 'chat', label: 'Chat de Atendimento', icon: MessageCircle, desc: 'Suporte e contato em tempo real'},
    ]
  }
];

// 4 itens fixos na barra inferior do cliente
const bottomClientNav = [
  {id: 'home', label: 'Início', icon: Home},
  {id: 'vitrine', label: 'Vitrine', icon: LayoutGrid},
  {id: 'cliente', label: 'Cliente', icon: User},
  {id: 'chat', label: 'Chat', icon: MessageCircle},
];

export default function App() {
  // A rota inicial abre SEMPRE na página inicial pública ('home')
  const [activePanel, setActivePanel] = useState<'home' | 'vitrine' | 'cliente' | 'chat' | 'admin' | 'prof'>('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const {user, role, logoutOwner} = useAuth();

  const isStaff = user && (role === 'admin' || role === 'professional');
  const isAdmin = user && role === 'admin';

  const handleLogout = () => {
    logoutOwner?.();
    supabase.auth.signOut();
    setActivePanel('home');
  };

  const handleOpenStaffPanel = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (isAdmin) {
      setActivePanel('admin');
    } else if (role === 'professional') {
      setActivePanel('prof');
    } else {
      alert('Seu perfil atual é de Cliente. Apenas profissionais e administradores podem acessar a gestão.');
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 dark overflow-x-hidden flex flex-col justify-between">
      <div>
        {/* Header Superior Fixo */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-amber-500 hover:text-amber-400 rounded-xl hover:bg-gray-900/60 transition-colors"
              title="Abrir Menu Lateral"
              aria-label="Abrir Menu Lateral"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={() => setActivePanel('home')}
              className="text-xl font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-2"
            >
              <span>Bela Mulher</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton />

            {/* User Badge or Login Button (Clean Header) */}
            {user ? (
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {isAdmin ? 'Ozana (Admin)' : (user.email?.split('@')[0] || 'Cliente')}
              </span>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="p-1.5 px-3 text-amber-400 hover:text-amber-300 flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold transition-colors"
              >
                <LogIn size={16} />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </header>



        {/* MENU LATERAL VERTICAL (Exclusivo Público & Cliente, com entrada discreta para Equipe) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
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
                        {user ? (isAdmin ? 'Ozana (Administradora)' : (user.email || 'Cliente')) : 'Visitante'}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {user ? (isStaff ? 'Equipe Profissional Conectada' : 'Espaço do Cliente') : 'Bem-vinda ao salão!'}
                      </p>
                    </div>
                  </div>

                  {!user && (
                    <button
                      onClick={() => {
                        setSidebarOpen(false);
                        setShowLogin(true);
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
                              onClick={() => {
                                setActivePanel(item.id as any);
                                setSidebarOpen(false);
                              }}
                              className={`w-full group flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 ${
                                isActive
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-900/70 border border-transparent'
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

                {/* Seção Exclusiva da Equipe (Apenas visível se autenticado como staff) */}
                {isStaff && (
                  <div className="pt-2 border-t border-gray-800/80 space-y-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 px-2 block">
                      Ambiente Profissional
                    </span>
                    <button
                      onClick={handleOpenStaffPanel}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck size={18} className="text-amber-400" />
                        <span>{isAdmin ? 'Painel Administrativo (Ozana)' : 'Painel do Especialista'}</span>
                      </div>
                      <ChevronRight size={14} className="text-amber-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Rodapé da Barra Lateral */}
              <div className="pt-4 mt-6 border-t border-gray-800 space-y-2">
                {!isStaff && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      setShowLogin(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <Lock size={12} />
                    <span>Área da Equipe Profissional</span>
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 text-xs text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-xl transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sair da Conta</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL (Isolamento Rígido de Telas) */}
        <main className="p-4 pb-24 min-h-[calc(100vh-8rem)]">
          {/* TELA PÚBLICA 1: INÍCIO (Home) */}
          {activePanel === 'home' && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold text-amber-500">Bela Mulher</h2>
                <p className="mt-2 text-gray-400">Excelência em beleza, estética e cuidado.</p>
              </div>
              <Carousel />
              <VerticalGallery />
            </div>
          )}

          {/* TELA PÚBLICA 2: VITRINE DE SERVIÇOS */}
          {activePanel === 'vitrine' && <Vitrine />}

          {/* TELA 3: ÁREA EXCLUSIVA DO CLIENTE (Sem nenhuma ferramenta administrativa) */}
          {activePanel === 'cliente' && (
            <ClientArea
              onNavigateToVitrine={() => setActivePanel('vitrine')}
              onRequestLogin={() => setShowLogin(true)}
            />
          )}

          {/* TELA 4: CHAT DE ATENDIMENTO DO CLIENTE (Assistente Virtual Funcional) */}
          {activePanel === 'chat' && <SalonChat />}

          {/* TELA 5: PAINEL ADMINISTRATIVO (Exclusivo da Administradora Ozana) */}
          {activePanel === 'admin' && (
            isAdmin ? (
              <div className="space-y-4">
                <AdminPanel onExitToPublic={() => setActivePanel('home')} />
              </div>
            ) : (
              <div className="max-w-md mx-auto my-12 bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Lock size={30} />
                </div>
                <h3 className="text-lg font-bold text-white">Acesso Restrito à Administração</h3>
                <p className="text-xs text-gray-400">
                  Este painel é reservado exclusivamente à proprietária Ozana e administradores autorizados.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Entrar como Administradora
                  </button>
                  <button
                    onClick={() => setActivePanel('home')}
                    className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Voltar à Tela Inicial Pública
                  </button>
                </div>
              </div>
            )
          )}

          {/* TELA 6: PAINEL PROFISSIONAL E GESTÃO DO SALÃO */}
          {activePanel === 'prof' && (
            isStaff ? (
              <div className="space-y-4">
                <AdminPanel onExitToPublic={() => setActivePanel('home')} />
              </div>
            ) : (
              <div className="max-w-md mx-auto my-12 bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Lock size={30} />
                </div>
                <h3 className="text-lg font-bold text-white">Acesso Restrito ao Profissional</h3>
                <p className="text-xs text-gray-400">
                  Esta área é exclusiva para a equipe de especialistas do salão Bela Mulher.
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setShowLogin(true)}
                    className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition-colors"
                  >
                    Fazer Login de Profissional
                  </button>
                  <button
                    onClick={() => setActivePanel('home')}
                    className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-xs transition-colors"
                  >
                    Voltar à Tela Inicial Pública
                  </button>
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {/* FOOTER FIXO DO CLIENTE (Apenas 4 opções públicas/cliente) */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex justify-around p-3 bg-black/90 backdrop-blur-md border-t border-gray-800">
        {bottomClientNav.map(item => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(item.id as any)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-amber-500' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </footer>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
}
