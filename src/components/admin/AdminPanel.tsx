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
  ArrowDownRight,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Menu,
  ArrowLeft,
  LogOut,
  BarChart3,
  Package,
  Award,
  AlertTriangle,
  Tag,
  Image,
  MessageCircle,
  Bell,
  Star,
  Target,
  Calculator as CalcIcon
} from 'lucide-react';
import {VitrineManager} from './VitrineManager';
import {CustomizationPanel} from './CustomizationPanel';
import {ClientManager} from './ClientManager';
import {CashFlowManager} from './CashFlowManager';
import {InventoryManager} from './InventoryManager';
import {Charts3D} from './Charts3D';
import {CouponManager} from './CouponManager';
import {OrdersManager} from './OrdersManager';
import {MediaManager} from './MediaManager';
import {AdminChatManager} from './AdminChatManager';
import {ProfessionalManager} from './ProfessionalManager';
import {LoyaltyManager} from './LoyaltyManager';
import {CRMManager} from './CRMManager';
import {Calculator} from '../tools/Calculator';
import {dataService} from '../../lib/data';
import {AppointmentManager} from '../tools/AppointmentManager';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';
import {NotificationCenter} from '../tools/NotificationCenter';

const adminModuleGroups = [
  {
    category: 'Estratégico',
    modules: [
      {id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, desc: 'Indicadores e resumo geral'},
      {id: 'crm', label: 'CRM Inteligente', icon: Target, desc: 'Gestão de relacionamento e fidelização'},
      {id: 'graficos', label: 'Relatórios & Gráficos 3D', icon: BarChart3, desc: 'Análises visuais tridimensionais'},
    ]
  },
  {
    category: 'Operacional',
    modules: [
      {id: 'agenda', label: 'Agenda & Atendimentos', icon: Calendar, desc: 'Gestão de horários e serviços'},
      {id: 'clientes', label: 'Clientes', icon: Users, desc: 'Gestão de clientes e fichas médicas'},
      {id: 'equipe', label: 'Profissionais', icon: Award, desc: 'Equipe de especialistas do salão'},
      {id: 'servicos', label: 'Serviços', icon: Scissors, desc: 'Catálogo e precificação de serviços'},
    ]
  },
  {
    category: 'Comercial & Vendas',
    modules: [
      {id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, desc: 'Vendas realizadas na sacola'},
      {id: 'cupons', label: 'Cupons', icon: Tag, desc: 'Cupons de desconto e promoções'},
      {id: 'estoque', label: 'Estoque', icon: Package, desc: 'Produtos e controle de materiais'},
      {id: 'caixa', label: 'Fluxo de Caixa', icon: Briefcase, desc: 'Movimentações financeiras'},
      {id: 'fidelidade', label: 'Clube Fidelidade', icon: Star, desc: 'Regras de pontos e recompensas'},
    ]
  },
  {
    category: 'Comunicação & Mídia',
    modules: [
      {id: 'midias', label: 'Banners & Mídias', icon: Image, desc: 'Destaques e vídeos verticais'},
      {id: 'chat', label: 'Chat', icon: MessageCircle, desc: 'Central de mensagens com clientes'},
      {id: 'notificacoes', label: 'Notificações', icon: Bell, desc: 'Alertas automáticos e avisos'},
    ]
  },
  {
    category: 'Ferramentas & Ajustes',
    modules: [
      {id: 'calculadora', label: 'Calculadora', icon: CalcIcon, desc: 'Cálculos rápidos e comissões'},
      {id: 'personalizacao', label: 'Personalização', icon: Palette, desc: 'Visual e marca do salão'},
      {id: 'config', label: 'Configurações', icon: Settings, desc: 'Parâmetros técnicos do sistema'},
    ]
  }
];

const allModules = adminModuleGroups.flatMap(group => group.modules);

interface AdminPanelProps {
  onExitToPublic?: () => void;
}

export function AdminPanel({onExitToPublic}: AdminPanelProps = {}) {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {logoutOwner, user} = useAuth();

  // Real Database Data State
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);

  // Load all operational data
  const loadData = async () => {
    try {
      // Check reminders first
      dataService.checkAndSendReminders();

      const [cRes, sRes, aRes, tRes, pRes, mRes, profRes] = await Promise.all([
        dataService.getProfiles('client'),
        dataService.getServices(),
        dataService.getAppointments(user?.id || '', 'admin'),
        dataService.getTransactions(),
        dataService.getProducts(),
        dataService.getStockMovements(),
        dataService.getProfiles('professional')
      ]);

      if (cRes?.data) setClients(cRes.data);
      if (sRes?.data) setServices(sRes.data);
      if (aRes?.data) setAppointments(aRes.data);
      if (tRes?.data) setTransactions(tRes.data);
      if (pRes?.data) setProducts(pRes.data);
      if (mRes?.data) setMovements(mRes.data);
      if (profRes?.data) setProfessionals(profRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados da gestão:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Cash Flow Handlers
  const handleAddTransaction = async (tx: any) => {
    await dataService.addTransaction(tx);
    await loadData();
  };

  const handleUpdateTransaction = async (id: string, tx: any) => {
    await dataService.updateTransaction(id, tx);
    await loadData();
  };

  const handleDeleteTransaction = async (id: string) => {
    await dataService.deleteTransaction(id);
    await loadData();
  };

  // Inventory Handlers
  const handleAddProduct = async (p: any) => {
    await dataService.addProduct(p);
    await loadData();
  };

  const handleUpdateProduct = async (id: string, p: any) => {
    await dataService.updateProduct(id, p);
    await loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    await dataService.deleteProduct(id);
    await loadData();
  };

  const handleRecordMovement = async (m: any) => {
    await dataService.recordStockMovement(m);
    await loadData();
  };

  // Calculate live KPI metrics
  const totalReceitas = transactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const saldoLiquido = totalReceitas - totalDespesas;
  const lowStockCount = products.filter(p => Number(p.quantity || 0) <= Number(p.min_quantity || 5)).length;

  const currentModule = allModules.find(m => m.id === activeModule) || allModules[0];
  const CurrentIcon = currentModule.icon;

  const handleSelectModule = (id: string) => {
    setActiveModule(id);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutOwner?.();
    supabase.auth.signOut();
    onExitToPublic?.();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8rem)] bg-black text-gray-100 rounded-3xl border border-gray-800/80 overflow-hidden shadow-2xl">
      
      {/* MOBILE TRIGGER: Menu dropdown vertical no celular */}
      <div className="md:hidden border-b border-gray-800 bg-gray-950 p-3">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-2xl text-left shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <CurrentIcon size={20} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Módulo Atual</span>
              <span className="text-sm font-bold text-white">{currentModule.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span>{isMobileMenuOpen ? 'Fechar' : 'Módulos'}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {isMobileMenuOpen && (
          <div className="mt-3 p-3 bg-gray-900/95 border border-gray-800 rounded-2xl space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Navegação Vertical da Gestão</span>
              <span className="text-[11px] text-gray-400">{allModules.length} módulos</span>
            </div>
            {adminModuleGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-2 block">
                  {group.category}
                </span>
                <div className="space-y-1">
                  {group.modules.map(mod => {
                    const Icon = mod.icon;
                    const isActive = activeModule === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleSelectModule(mod.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 ${
                          isActive
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                            : 'text-gray-300 hover:text-white hover:bg-gray-800/70 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={16} className={isActive ? 'text-amber-400' : 'text-gray-400'} />
                          <span className="text-xs">{mod.label}</span>
                        </div>
                        {isActive && <ChevronRight size={14} className="text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-gray-800 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 justify-center py-2.5 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-bold rounded-xl"
              >
                <LogOut size={16} />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP & TABLET: Menu Lateral VERTICAL (Todas as opções empilhadas verticalmente) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 bg-gray-950 border-r border-gray-800 p-4 space-y-5 justify-between">
        <div className="space-y-4">
          <div className="px-2 py-1 flex items-center justify-between border-b border-gray-800/80 pb-3">
            <div>
              <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold block">Salão Bela Mulher</span>
              <h3 className="text-sm font-bold text-white tracking-tight">Painel de Gestão</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Ativo
            </span>
          </div>

          {/* Lista Vertical Organizada de Módulos */}
          <nav className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
            {adminModuleGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 px-3 block">
                  {group.category}
                </span>
                <div className="space-y-1">
                  {group.modules.map(mod => {
                    const Icon = mod.icon;
                    const isActive = activeModule === mod.id;
                    return (
                      <button
                        key={mod.id}
                        onClick={() => handleSelectModule(mod.id)}
                        className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold shadow-sm'
                            : 'text-gray-400 hover:text-gray-100 hover:bg-gray-900/80 border border-transparent font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={17} className={isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-amber-400'} />
                          <span>{mod.label}</span>
                        </div>
                        <ChevronRight
                          size={14}
                          className={`transition-transform duration-200 ${
                            isActive ? 'text-amber-400 translate-x-0.5' : 'text-transparent group-hover:text-gray-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Rodapé da Barra Lateral com Sair e Voltar ao Início */}
        <div className="pt-3 border-t border-gray-800 space-y-2">
          {onExitToPublic && (
            <button
              onClick={onExitToPublic}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-xs text-amber-400 font-semibold border border-gray-800 transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Voltar ao Início Público</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-xs text-red-400 hover:text-red-300 font-semibold border border-red-900/40 transition-colors"
          >
            <LogOut size={15} />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL DO MÓDULO SELECIONADO */}
      <section className="flex-1 min-w-0 p-4 md:p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
          <div>
            <span className="text-[11px] text-amber-500 font-bold tracking-wider uppercase">Painel de Gestão do Salão</span>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <CurrentIcon size={24} className="text-amber-400" />
              {currentModule.label}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{currentModule.desc}</p>
          </div>

          {onExitToPublic && (
            <button
              onClick={onExitToPublic}
              className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-amber-400 rounded-xl text-xs font-semibold transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Início Público</span>
            </button>
          )}
        </div>

        {/* MÓDULO 1: DASHBOARD & KPIS */}
        {activeModule === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">Clientes Ativos</span>
                  <Users size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{clients.length}</div>
                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight size={13} className="text-emerald-400" /> Cadastrados no sistema
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">Serviços Tabela</span>
                  <Scissors size={16} className="text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{services.length}</div>
                <div className="text-[11px] text-gray-400 mt-1">Disponíveis na vitrine</div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">Receita Bruta</span>
                  <TrendingUp size={16} className="text-emerald-400" />
                </div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">
                  R$ {totalReceitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Lançamentos em caixa</div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 p-4 rounded-2xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-medium">Alertas Estoque</span>
                  <Package size={16} className={lowStockCount > 0 ? 'text-amber-400' : 'text-gray-400'} />
                </div>
                <div className={`text-2xl font-bold tabular-nums ${lowStockCount > 0 ? 'text-amber-400' : 'text-white'}`}>
                  {lowStockCount}
                </div>
                <div className="text-[11px] text-gray-400 mt-1">Produtos abaixo do mínimo</div>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl space-y-4">
              <h3 className="text-sm font-semibold text-white">Ações de Gestão Rápida</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveModule('caixa')}
                  className="p-3.5 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-2xl text-left transition-colors"
                >
                  <Briefcase size={20} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Fluxo de Caixa</p>
                  <p className="text-[10px] text-gray-400">Entradas e despesas</p>
                </button>
                <button
                  onClick={() => setActiveModule('estoque')}
                  className="p-3.5 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-2xl text-left transition-colors"
                >
                  <Package size={20} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Controle de Estoque</p>
                  <p className="text-[10px] text-gray-400">Produtos e baixas</p>
                </button>
                <button
                  onClick={() => setActiveModule('pedidos')}
                  className="p-3.5 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-2xl text-left transition-colors"
                >
                  <ShoppingBag size={20} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Sacola & Pedidos</p>
                  <p className="text-[10px] text-gray-400">Vendas da loja</p>
                </button>
                <button
                  onClick={() => setActiveModule('cupons')}
                  className="p-3.5 bg-gray-950 hover:bg-gray-800 border border-gray-800 rounded-2xl text-left transition-colors"
                >
                  <Tag size={20} className="text-amber-400 mb-2" />
                  <p className="text-xs font-bold text-white">Cupons</p>
                  <p className="text-[10px] text-gray-400">Promocodes e ofertas</p>
                </button>
              </div>
            </div>

            {/* Embedded 3D Charts Overview */}
            <Charts3D
              transactions={transactions}
              services={services}
              appointments={appointments}
              products={products}
              professionals={professionals}
            />
          </div>
        )}

        {/* MÓDULO 2: GRÁFICOS 3D DEDICADOS */}
        {activeModule === 'graficos' && (
          <Charts3D
            transactions={transactions}
            services={services}
            appointments={appointments}
            products={products}
            professionals={professionals}
          />
        )}

        {/* MÓDULO 3: CRM INTELIGENTE */}
        {activeModule === 'crm' && (
          <CRMManager />
        )}

        {/* MÓDULO 3: FLUXO DE CAIXA OPERACIONAL */}
        {activeModule === 'caixa' && (
          <CashFlowManager
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* MÓDULO 4: ESTOQUE DE PRODUTOS */}
        {activeModule === 'estoque' && (
          <InventoryManager
            products={products}
            movements={movements}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onRecordMovement={handleRecordMovement}
          />
        )}

        {/* MÓDULO 5: SACOLA & PEDIDOS */}
        {activeModule === 'pedidos' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <OrdersManager />
          </div>
        )}

        {/* MÓDULO 6: CUPONS DE DESCONTO */}
        {activeModule === 'cupons' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <CouponManager />
          </div>
        )}

        {/* MÓDULO 7: CALCULADORA UNIFICADA */}
        {activeModule === 'calculadora' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <Calculator />
          </div>
        )}

        {/* MÓDULO 8: AGENDA GERAL */}
        {activeModule === 'agenda' && (
          <div className="space-y-4">
            <AppointmentManager />
          </div>
        )}

        {/* MÓDULO 9: GESTÃO DE CLIENTES & FICHAS MÉDICAS */}
        {activeModule === 'clientes' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <ClientManager />
          </div>
        )}

        {/* MÓDULO 10: GESTÃO DE PROFISSIONAIS DA EQUIPE */}
        {activeModule === 'equipe' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <ProfessionalManager />
          </div>
        )}

        {/* MÓDULO 11: SERVIÇOS & PREÇOS */}
        {activeModule === 'servicos' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <VitrineManager />
          </div>
        )}

        {/* MÓDULO 12: BANNERS & MÍDIAS 9:16 */}
        {activeModule === 'midias' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <MediaManager />
          </div>
        )}



        {/* MÓDULO 13: CENTRAL DE CHAT COM CLIENTES */}
        {activeModule === 'chat' && (
          <div className="space-y-4">
            <AdminChatManager />
          </div>
        )}

        {/* MÓDULO 14: PERSONALIZAÇÃO VISUAL */}
        {activeModule === 'personalizacao' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <CustomizationPanel />
          </div>
        )}

        {/* MÓDULO 16: CENTRAL DE NOTIFICAÇÕES GESTÃO */}
        {activeModule === 'notificacoes' && (
          <div className="h-[600px] max-w-2xl mx-auto">
            <NotificationCenter isAdmin={true} />
          </div>
        )}

        {/* MÓDULO 17: GESTÃO DO PROGRAMA DE FIDELIDADE */}
        {activeModule === 'fidelidade' && (
          <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-3xl">
            <LoyaltyManager />
          </div>
        )}

        {/* MÓDULO 15: CONFIGURAÇÕES GERAIS */}
        {activeModule === 'config' && (
          <div className="bg-gray-900/90 border border-gray-800 p-6 rounded-3xl space-y-6">
            <div className="pb-3 border-b border-gray-800">
              <h4 className="text-sm font-bold text-white">Parâmetros Técnicos do Sistema</h4>
              <p className="text-[11px] text-gray-400">Configure o comportamento base do aplicativo e integrações.</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-black/60 border border-gray-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Notificações WhatsApp</span>
                    <div className="w-10 h-5 bg-amber-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">Enviar lembretes automáticos de agendamento via API.</p>
                </div>

                <div className="p-4 bg-black/60 border border-gray-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Pagamento Online (PIX)</span>
                    <div className="w-10 h-5 bg-amber-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">Habilitar checkout direto na sacola de compras.</p>
                </div>
              </div>

              <div className="p-4 bg-black/60 border border-gray-800 rounded-2xl space-y-4">
                <h5 className="text-xs font-bold text-amber-500">Regras de Atendimento</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
                    <span className="text-xs text-gray-300">Tempo de tolerância para atraso</span>
                    <select className="bg-gray-900 border border-gray-700 rounded-lg text-[11px] p-1 text-white">
                      <option>10 minutos</option>
                      <option>15 minutos</option>
                      <option>20 minutos</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
                    <span className="text-xs text-gray-300">Intervalo entre procedimentos</span>
                    <select className="bg-gray-900 border border-gray-700 rounded-lg text-[11px] p-1 text-white">
                      <option>0 minutos</option>
                      <option>15 minutos</option>
                      <option>30 minutos</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-amber-600/20">
                  Salvar Alterações
                </button>
                <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl text-xs transition-colors">
                  Resetar
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
