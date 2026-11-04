import {useState} from 'react';
import {User, Calendar, Clock, MessageCircle, Calculator, LogOut, ChevronRight} from 'lucide-react';

export function ProfessionalPanel() {
  const [activeModule, setActiveModule] = useState('agenda');

  const modules = [
    {id: 'perfil', label: 'Meu Perfil', icon: User},
    {id: 'agenda', label: 'Agenda', icon: Calendar},
    {id: 'historico', label: 'Histórico', icon: Clock},
    {id: 'chat', label: 'Chat', icon: MessageCircle},
  ];

  return (
    <div className="flex flex-col h-full text-gray-100">
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {modules.map(mod => {
          const Icon = mod.icon;
          return (
            <button key={mod.id} onClick={() => setActiveModule(mod.id)} className={`flex items-center gap-2 p-4 ${activeModule === mod.id ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-400'}`}>
              <Icon size={18} />
              <span className="text-sm font-medium">{mod.label}</span>
            </button>
          );
        })}
      </div>
      <div className="p-4 flex-1">
        <h2 className="text-xl font-bold text-amber-500 mb-4">{modules.find(m => m.id === activeModule)?.label}</h2>
        <div className="bg-gray-900 p-4 rounded-2xl">
          <p className="text-gray-400 text-sm">Painel profissional para {activeModule}. Conecte ao banco de dados para ativar agendamentos, chat e histórico.</p>
        </div>
      </div>
      <div className="p-4 border-t border-gray-800">
        <button className="flex items-center gap-2 text-red-400 w-full p-2">
          <LogOut size={18} />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}
