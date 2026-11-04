import {useState} from 'react';
import {Palette, Image, Type, Moon, Sun} from 'lucide-react';

export function CustomizationPanel() {
  const [config, setConfig] = useState({
    name: 'Bela Mulher',
    accentColor: '#d97706', // amber-600
    darkMode: true
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-amber-500">Personalização Visual</h3>
      
      {/* Real-time Preview Area */}
      <div className="p-4 bg-black border border-gray-700 rounded-xl">
        <p className="text-sm text-gray-400 mb-2">Prévia:</p>
        <div style={{borderColor: config.accentColor}} className="p-4 border-2 rounded-lg">
          <h1 style={{color: config.accentColor}} className="text-2xl font-bold">{config.name}</h1>
          <button style={{backgroundColor: config.accentColor}} className="mt-2 px-4 py-2 text-white rounded-lg">Botão de Exemplo</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nome do Salão</label>
          <input type="text" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="w-full p-2 bg-gray-800 rounded-lg text-white" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Cor de Destaque</label>
          <input type="color" value={config.accentColor} onChange={e => setConfig({...config, accentColor: e.target.value})} className="w-full h-10 bg-gray-800 rounded-lg" />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => setConfig({...config, darkMode: !config.darkMode})} className="flex items-center gap-2 p-3 bg-gray-800 rounded-xl">
          {config.darkMode ? <Moon size={18} /> : <Sun size={18} />}
          {config.darkMode ? 'Modo Escuro' : 'Modo Claro'}
        </button>
      </div>

      <button className="w-full bg-amber-600 p-3 rounded-xl font-bold">Salvar Configurações</button>
    </div>
  );
}
