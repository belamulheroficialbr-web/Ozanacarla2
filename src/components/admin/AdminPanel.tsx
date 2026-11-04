import {useState, useEffect} from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  Settings,
  ShoppingBag,
  Palette,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {VitrineManager} from './VitrineManager';
import {CustomizationPanel} from './CustomizationPanel';
import {ClientManager} from './ClientManager';
import {dataService} from '../../lib/data';

const adminModules = [
  {id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard},
  {id: 'caixa', label: 'Caixa', icon: Briefcase},
  {id: 'financeiro', label: 'Financeiro', icon: FileText},
  {id: 'agenda', label: 'Agenda', icon: Calendar},
  {id: 'clientes', label: 'Clientes', icon: Users},
  {id: 'servicos', label: 'Serviços', icon: Scissors},
  {id: 'vitrine', label: 'Vitrine', icon: ShoppingBag},
  {id: 'pagamentos', label: 'Pagamentos', icon: DollarSign},
  {id: 'personalizacao', label: 'Personalização', icon: Palette},
  {id: 'config', label: 'Configurações', icon: Settings},
];

export function AdminPanel() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [stats, setStats] = useState({
    totalClients: 0,
    totalServices: 0,
    todayAppointments: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    async function loadData() {
      try {
        const { data: clients } = await dataService.getProfiles('client');
        const { data: services } = await dataService.getServices();
        setStats(prev => ({
          ...prev,
          totalClients: clients?.length || 0,
          totalServices: services?.length || 0
        }));
      } catch (e) {
        console.error('Error loading admin stats', e);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-gray-100">
      {/* Horizontal Modules Tab Bar */}
      <div className="flex border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md overflow-x-auto scrollbar-none px-2 py-1 sticky top-14 z-20">
        {adminModules.map(mod => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
              }`}
            >
              <Icon size={16} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Module Content */}
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-500 font-semibold tracking-wider uppercase">Painel de Controle</span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {adminModules.find(m => m.id === activeModule)?.label}
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>

        {/* Dashboard View */}
        {activeModule === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">Clientes</span>
                  <Users size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{stats.totalClients}</div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight size={13} className="text-emerald-400" /> Ativos no sistema
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">Serviços</span>
                  <Scissors size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{stats.totalServices}</div>
                <div className="text-[11px] text-gray-400 mt-1">Disponíveis na vitrine</div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">Hoje</span>
                  <Calendar size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">0</div>
                <div className="text-[11px] text-gray-400 mt-1">Agendamentos hoje</div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">Faturamento</span>
                  <TrendingUp size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-amber-400 tabular-nums">R$ 0,00</div>
                <div className="text-[11px] text-gray-400 mt-1">Neste mês</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-semibold text-white">Ações Rápidas de Gestão</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <button
                  onClick={() => setActiveModule('agenda')}
                  className="p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors"
                >
                  <Calendar size={18} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Ver Agenda</p>
                  <p className="text-[10px] text-gray-400">Horários marcados</p>
                </button>
                <button
                  onClick={() => setActiveModule('vitrine')}
                  className="p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors"
                >
                  <Scissors size={18} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Cadastrar Serviço</p>
                  <p className="text-[10px] text-gray-400">Preços e detalhes</p>
                </button>
                <button
                  onClick={() => setActiveModule('clientes')}
                  className="p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors"
                >
                  <Users size={18} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Ver Clientes</p>
                  <p className="text-[10px] text-gray-400">Lista e contatos</p>
                </button>
                <button
                  onClick={() => setActiveModule('personalizacao')}
                  className="p-3 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-xl text-left transition-colors"
                >
                  <Palette size={18} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Cores e Logo</p>
                  <p className="text-[10px] text-gray-400">Identidade visual</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vitrine Module */}
        {activeModule === 'vitrine' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl">
            <VitrineManager />
          </div>
        )}

        {/* Personalização Module */}
        {activeModule === 'personalizacao' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl">
            <CustomizationPanel />
          </div>
        )}

        {/* Clientes Module */}
        {activeModule === 'clientes' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl">
            <ClientManager />
          </div>
        )}

        {/* Caixa / Financeiro / Pagamentos */}
        {(activeModule === 'caixa' || activeModule === 'financeiro' || activeModule === 'pagamentos') && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                <span className="text-xs text-gray-400">Saldo Atual em Caixa</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">R$ 0,00</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
                <span className="text-xs text-gray-400">Status do Caixa</span>
                <p className="text-base font-bold text-amber-400 mt-1">Aberto</p>
              </div>
            </div>

            <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Movimentações Recentes</h4>
                <button className="text-xs text-amber-400 font-medium hover:underline">+ Nova Entrada / Saída</button>
              </div>
              <p className="text-xs text-gray-400 py-6 text-center border border-dashed border-gray-800 rounded-xl">
                Nenhuma movimentação registrada hoje.
              </p>
            </div>
          </div>
        )}

        {/* Agenda / Outros Módulos */}
        {activeModule === 'agenda' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Controle Geral de Agendamentos</h4>
              <span className="text-xs text-amber-400">Tempo real ativo</span>
            </div>
            <p className="text-xs text-gray-400">
              Abaixo você visualiza todos os agendamentos registrados no salão com seus respectivos clientes e status.
            </p>
          </div>
        )}

        {activeModule === 'servicos' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl">
            <VitrineManager />
          </div>
        )}

        {activeModule === 'config' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white">Configurações Gerais do Salão</h4>
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span>Notificações por WhatsApp</span>
                <span className="text-amber-400 font-semibold">Ativo</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span>Tempo Padrão entre Serviços</span>
                <span className="text-amber-400 font-semibold">15 minutos</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-950 rounded-xl border border-gray-800">
                <span>Chave PIX Cadastrada</span>
                <span className="text-amber-400 font-semibold">Configurar</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
