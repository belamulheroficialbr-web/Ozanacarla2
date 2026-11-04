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
import {useAuth} from './context/AuthContext';
import {Login} from './components/auth/Login';
import {CalculatorModal} from './components/tools/Calculator';
import {PWAInstallButton} from './components/tools/PWAInstallButton';

export default function App() {
  const [activePanel, setActivePanel] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const {user, role, loading} = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<string>('Checking...');

  useEffect(() => {
    async function checkSchema() {
      try {
        const schema = await dataService.verifyDatabaseSchema();
        const missing = Object.entries(schema).filter(([_, exists]) => !exists).map(([table]) => table);
        setConnectionStatus(missing.length > 0 ? `Missing: ${missing.join(', ')}` : 'Connected & Tables OK');
      } catch (e) {
        setConnectionStatus('Connection Failed');
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

  if (loading) return <div className="text-center p-10">Carregando...</div>;

  return (
    <div className="min-h-screen bg-black text-gray-100 dark overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-md border-b border-gray-800">
        <button onClick={() => setSidebarOpen(true)} className="p-2 text-amber-500">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-bold text-amber-500">Bela Mulher</h1>
        <div className="flex items-center gap-2">
            <PWAInstallButton />
            {user ? (
                <button onClick={() => supabase.auth.signOut()} className="text-xs text-red-400">Sair</button>
            ) : (
                <button onClick={() => setShowLogin(true)} className="p-2 text-amber-500"><LogIn size={20}/></button>
            )}
        </div>
      </header>

      {/* Floating Calculator Button */}
      <button onClick={() => setShowCalculator(true)} className="fixed bottom-20 right-4 z-40 bg-amber-600 p-3 rounded-full text-white shadow-lg">
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
      <main className="p-4 pb-20">
        {activePanel === 'home' && (
          <>
            <div className="text-center py-6">
              <h2 className="text-3xl font-bold text-amber-500">Bela Mulher</h2>
              <p className="mt-2 text-gray-400">Excelência em beleza e cuidado.</p>
            </div>
            <Carousel />
            <VerticalGallery />
          </>
        )}
        {activePanel === 'vitrine' && <Vitrine />}
        {activePanel === 'cliente' && user && <div className="text-center py-10">Painel do Cliente</div>}
        {activePanel === 'chat' && user && <div className="text-center py-10">Chat de Atendimento</div>}
        {activePanel === 'admin' && role === 'admin' && <AdminPanel />}
        {activePanel === 'prof' && (role === 'professional' || role === 'admin') && <ProfessionalPanel />}
      </main>

      {/* Footer Nav */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 flex justify-around p-3 bg-black/90 backdrop-blur-md border-t border-gray-800">
        {navItems.filter(item => !['admin', 'prof'].includes(item.id)).map(item => {
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
