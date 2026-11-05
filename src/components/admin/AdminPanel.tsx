import {useState, useEffect} from 'react';
import {
  LayoutDashboard,
  LayoutGrid,
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
import {FinancialDashboard} from './FinancialDashboard';
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
      {id: 'servicos', label: 'Vitrines & Procedimentos', icon: LayoutGrid, desc: 'Vitrines comerciais, coleções e serviços'},
    ]
  },
  {
    category: 'Comercial & Vendas',
    modules: [
      {id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, desc: 'Vendas realizadas na sacola'},
      {id: 'cupons', label: 'Cupons', icon: Tag, desc: 'Cupons de desconto e promoções'},
      {id: 'estoque', label: 'Estoque', icon: Package, desc: 'Produtos e controle de materiais'},
      {id: 'caixa', label: 'Gestão Financeira', icon: Briefcase, desc: 'DRE, comissões e fluxo de caixa'},
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

  // Fechamento da gaveta do ADM ao pressionar ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

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
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] bg-black text-gray-100 rounded-3xl border border-gray-800/80 overflow-hidden shadow-2xl relative w-full max-w-full">
      
      {/* BARRA SUPERIOR EXCLUSIVA DO ADM (Celular e Tablet) */}
      <div className="lg:hidden sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-gray-800 px-3 py-2.5 flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-gray-900 border border-gray-800 rounded-xl text-amber-400 hover:text-amber-300 active:scale-95 transition-all"
            title="Abrir Menu de Gestão"
            aria-label="Abrir Menu de Gestão"
          >
            <Menu size={19} />
          </button>

          {/* Seta curta de voltar rápida para o dashboard inicial */}
          {activeModule !== 'dashboard' && (
            <button
              onClick={() => handleSelectModule('dashboard')}
              className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 active:scale-90 transition-all flex items-center gap-1"
              title="Voltar para Visão Geral"
              aria-label="Voltar para Visão Geral"
            >
              <ArrowLeft size={16} />
              <span className="text-[10px] font-bold hidden xs:inline">Início</span>
            </button>
          )}
        </div>

        <div className="flex flex-col items-center text-center px-1">
          <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest leading-none">Bela Mulher ADM</span>
          <span className="text-xs font-bold text-white truncate max-w-[140px] xs:max-w-[180px] leading-tight mt-0.5">{currentModule.label}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onExitToPublic && (
            <button
              onClick={onExitToPublic}
              className="px-2.5 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-amber-400 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all"
              title="Voltar ao Salão Público"
            >
              <ArrowLeft size={14} />
              <span className="hidden xs:inline">Salão</span>
            </button>
          )}
        </div>
      </div>

      {/* MOBILE OVERLAY (Toque para fechar a gaveta do ADM com animação suave) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR GAVETA (Responsiva para Celular, Tablet e Desktop) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-gray-950 border-r border-gray-800 p-4 sm:p-5 flex flex-col justify-between
        transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 shadow-2xl lg:shadow-none
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
            <div>
              <span className="text-[9px] text-amber-500 uppercase tracking-widest font-bold block">Salão Bela Mulher</span>
              <h3 className="text-sm font-bold text-white tracking-tight">Painel de Gestão</h3>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-900 transition-colors active:scale-90"
              aria-label="Fechar menu"
            >
              <ArrowLeft size={18} />
            </button>
          </div>

          <nav className="space-y-5 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1 custom-scrollbar">
            {adminModuleGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-widest text-gray-600 px-3 block">
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
                        className={`
                          w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs text-left transition-all duration-200
                          active:scale-[0.98]
                          ${isActive
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold shadow-lg shadow-amber-500/5'
                            : 'text-gray-400 hover:text-gray-100 hover:bg-white/5 border border-transparent font-medium'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-amber-400' : 'text-gray-500 group-hover:text-amber-400'} />
                          <span>{mod.label}</span>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="pt-5 border-t border-gray-800 space-y-3">
          {onExitToPublic && (
            <button
              onClick={onExitToPublic}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-900 hover:bg-amber-500/10 text-xs text-gray-400 hover:text-amber-400 font-bold border border-gray-800 hover:border-amber-500/30 transition-all active:scale-95"
            >
              <ArrowLeft size={16} />
              <span>Sair do ADM</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-xs text-rose-500/80 hover:text-rose-400 font-bold border border-rose-900/20 hover:border-rose-900/40 transition-all active:scale-95"
          >
            <LogOut size={16} />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL DO MÓDULO SELECIONADO */}
      <section className="flex-1 min-w-0 p-4 md:p-8 space-y-6 overflow-y-auto relative custom-scrollbar">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            {/* Seta curta de voltar interna (visível se não for o dashboard) */}
            <button 
              onClick={() => handleSelectModule('dashboard')}
              className={`p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-500 hover:text-amber-400 hover:border-amber-500/30 transition-all active:scale-90 ${activeModule === 'dashboard' ? 'hidden' : 'flex'}`}
              title="Voltar para Visão Geral"
            >
              <ArrowLeft size={18} />
            </button>
            
            <div className="flex flex-col">
              <span className="hidden md:block text-[11px] text-amber-500 font-bold tracking-wider uppercase">Gestão Bela Mulher</span>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                <CurrentIcon size={24} className="text-amber-400 md:hidden lg:block" />
                {currentModule.label}
              </h2>
              <p className="hidden md:block text-xs text-gray-400 mt-0.5">{currentModule.desc}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onExitToPublic && (
              <button
                onClick={onExitToPublic}
                className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-amber-400 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Início Público</span>
              </button>
            )}
          </div>
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

        {/* MÓDULO 4: GESTÃO FINANCEIRA AVANÇADA */}
        {activeModule === 'caixa' && (
          <FinancialDashboard />
        )}

        {/* MÓDULO 5: FLUXO DE CAIXA DETALHADO (Opcional, pode ser integrado no dashboard) */}
        {activeModule === 'caixa_detalhado' && (
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
            onAddTransaction={handleAddTransaction}
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
