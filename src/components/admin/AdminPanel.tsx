import {useState} from 'react';
import {LayoutDashboard, Briefcase, FileText, Calendar, Users, Scissors, DollarSign, Settings, ShoppingBag, Palette} from 'lucide-react';
import {VitrineManager} from './VitrineManager';
import {CustomizationPanel} from './CustomizationPanel';

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

  return (
    <div className="flex flex-col h-full text-gray-100">
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {adminModules.map(mod => {
          const Icon = mod.icon;
          return (
            <button key={mod.id} onClick={() => setActiveModule(mod.id)} className={`flex items-center gap-2 p-4 whitespace-nowrap ${activeModule === mod.id ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400'}`}>
              <Icon size={18} />
              <span className="text-sm font-medium">{mod.label}</span>
            </button>
          );
        })}
      </div>
      <div className="p-4 flex-1">
        <h2 className="text-xl font-bold text-amber-500 mb-4">{adminModules.find(m => m.id === activeModule)?.label}</h2>
        <div className="bg-gray-900 p-4 rounded-2xl">
          {activeModule === 'vitrine' ? (
            <VitrineManager />
          ) : activeModule === 'personalizacao' ? (
            <CustomizationPanel />
          ) : (
            <p className="text-gray-400 text-sm">O módulo de {activeModule} ainda não possui dados conectados. Por favor, configure um banco de dados para visualizar informações reais.</p>
          )}
        </div>
      </div>
    </div>
  );
}
