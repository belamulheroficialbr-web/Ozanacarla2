/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState, useEffect} from 'react';
import {Menu, Home, LayoutGrid, User, MessageCircle, X, ShieldCheck, Briefcase, LogIn, Calculator as CalcIcon} from 'lucide-react';
import {Carousel} from './components/Carousel';
import {VerticalGallery} from './components/VerticalGallery';
import {Vitrine} from './components/Vitrine';
import {AdminPanel} from './components/admin/AdminPanel';
import {ProfessionalPanel} from './components/professional/ProfessionalPanel';
import {supabase} from './lib/supabase';
import {dataService} from './lib/data';
import {useAuth} from './context/AuthContext';
import {Login} from './components/auth/Login';
import {CalculatorModal} from './components/tools/Calculator';
import {PWAInstallButton} from './components/tools/PWAInstallButton';
import {ProfileEditor} from './components/client/ProfileEditor';
import {AppointmentManager} from './components/tools/AppointmentManager';


export default function App() {
  const [activePanel, setActivePanel] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const {user, role, loading, logoutOwner} = useAuth();

  useEffect(() => {
    if (!loading && user) {
        if (role === 'admin' && activePanel === 'home') setActivePanel('admin');
        else if (role === 'professional' && activePanel === 'home') setActivePanel('prof');
    }
  }, [loading, user, role]);
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');

  useEffect(() => {
    async function checkSchema() {
      try {
        const result = await dataService.testConnection();
        setConnectionStatus(result.message);
      } catch (e) {
        setConnectionStatus('Erro ao testar conexão com Supabase');
      }
    }
    checkSchema();
  }, []);

  const navItems = [
    {id: 'home', label: 'Início', icon: Home},
    {id: 'vitrine', label: 'Vitrine', icon: LayoutGrid},
    {id: 'cliente', label: 'Cliente', icon: User, protected: true, roles: ['client', 'admin']},
    {id: 'chat', label: 'Chat', icon: MessageCircle, protected: true},
    {id: 'admin', label: 'Admin', icon: ShieldCheck, protected: true, roles: ['admin']},
    {id: 'prof', label: 'Profissional', icon: Briefcase, protected: true, roles: ['professional', 'admin']},
  ];

  return (
    <div className="min-h-screen bg-black text-gray-100 dark overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-amber-500 hover:text-amber-400">
            <Menu size={24} />
          </button>
          <button onClick={() => setActivePanel('home')} className="text-xl font-bold text-amber-500 hover:text-amber-400 transition-colors">
            Bela Mulher
          </button>
        </div>
        <div className="flex items-center gap-2">
          <PWAInstallButton />
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {role === 'admin' ? 'Ozana (Admin)' : (user.email?.split('@')[0] || 'Cliente')}
              </span>
              <button
                onClick={() => {
                  logoutOwner?.();
                  supabase.auth.signOut();
                  setActivePanel('home');
                }}
                className="text-xs text-red-400 hover:text-red-300 px-2.5 py-1 rounded-lg bg-red-950/50 border border-red-800/60 font-medium"
              >
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="p-1.5 px-3 text-amber-400 hover:text-amber-300 flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold"
            >
              <LogIn size={16} />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </header>

      {/* Floating Calculator Button */}
      <button onClick={() => setShowCalculator(true)} className="fixed bottom-20 right-4 z-40 bg-amber-600 hover:bg-amber-500 p-3 rounded-full text-white shadow-lg shadow-amber-600/30 transition-transform active:scale-95">
        <CalcIcon size={24} />
      </button>

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 p-4">
          <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-white">
            <X size={24} />
          </button>
          <nav className="mt-12 flex flex-col gap-4 text-xl">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { 
                if (item.protected && !user) setShowLogin(true);
                else if (item.roles && role && !item.roles.includes(role)) alert('Acesso negado');
                else { setActivePanel(item.id); setSidebarOpen(false); }
              }} className="text-left text-white">
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

        {/* Content */}
        <main className="p-4 pb-24 min-h-[calc(100vh-8rem)]">
          {activePanel === 'home' && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <h2 className="text-3xl font-bold text-amber-500">Bela Mulher</h2>
                <p className="mt-2 text-gray-400">Excelência em beleza e cuidado.</p>
              </div>
              <Carousel />
              <VerticalGallery />
            </div>
          )}

          {activePanel === 'vitrine' && <Vitrine />}

          {activePanel === 'cliente' && (
            <div className="space-y-6">
              <ProfileEditor />
              <AppointmentManager />
            </div>
          )}

          {activePanel === 'chat' && (
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl text-center space-y-3">
              <MessageCircle size={36} className="mx-auto text-amber-400" />
              <h3 className="text-lg font-bold text-white">Chat de Atendimento</h3>
              <p className="text-xs text-gray-400">Converse em tempo real com a equipe do salão Bela Mulher.</p>
            </div>
          )}

          {activePanel === 'admin' && (
            <div className="space-y-6">
              <AdminPanel />
              <AppointmentManager />
            </div>
          )}

          {activePanel === 'prof' && (
            <div className="space-y-6">
              <ProfessionalPanel />
              <AppointmentManager />
            </div>
          )}
        </main>

      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex justify-around p-3 bg-black/90 backdrop-blur-md border-t border-gray-800">
        {navItems
          .filter(item => {
            if (item.id === 'prof') return role === 'professional';
            if (item.id === 'admin') return role === 'admin';
            return true;
          })
          .map(item => {
            const Icon = item.icon;
            const isActive = activePanel === item.id;
            return (
              <button key={item.id} onClick={() => {
                if (item.protected && !user) setShowLogin(true);
                else setActivePanel(item.id);
              }} className={`flex flex-col items-center gap-1 ${isActive ? 'text-amber-500' : 'text-gray-500'}`}>
                <Icon size={24} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
      </footer>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showCalculator && <CalculatorModal onClose={() => setShowCalculator(false)} />}
    </div>
  );
}
