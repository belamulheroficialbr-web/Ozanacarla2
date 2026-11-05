import {useState, useEffect} from 'react';
import {ArrowLeft} from 'lucide-react';
import {dataService} from '../../lib/data';

export function ClientManager() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);

  useEffect(() => {
    dataService.getProfiles('client').then(({data}) => {
      if (data) setClients(data);
    });
  }, []);

  const filtered = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {!selectedClient ? (
        <>
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full p-3 bg-black border border-gray-800 rounded-xl text-white text-xs outline-none focus:border-amber-500 transition-colors"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(c => (
              <div key={c.id} className="bg-black/40 border border-gray-800 p-4 rounded-2xl flex items-center justify-between group hover:border-amber-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-700">
                    {c.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">{c.name || 'Sem nome'}</span>
                    <span className="text-[10px] text-gray-500 block truncate max-w-[120px]">{c.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedClient(c)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-amber-600 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                >
                  Ver Ficha
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="bg-black/60 border border-gray-800 rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-4 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                {selectedClient.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{selectedClient.name}</h4>
                <p className="text-[10px] text-gray-500">{selectedClient.email}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedClient(null)}
              className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Informações Pessoais</h5>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-gray-500">Telefone</p>
                  <p className="text-white font-medium">{selectedClient.phone || 'Não informado'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500">Última Visita</p>
                  <p className="text-white font-medium">12/10/2026</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] text-gray-500">Bio / Observações</p>
                <p className="p-3 bg-gray-950 border border-gray-800 rounded-xl text-gray-300 text-xs italic">
                  {selectedClient.bio || 'Nenhuma observação interna registrada.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-bold text-red-400 uppercase tracking-widest">Ficha Técnica & Saúde</h5>
              <div className="space-y-3">
                <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl">
                  <p className="text-[10px] font-bold text-red-400 uppercase mb-1">Alergias</p>
                  <p className="text-xs text-gray-200">{selectedClient.allergies || 'Nenhuma alergia relatada'}</p>
                </div>
                <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl">
                  <p className="text-[10px] font-bold text-amber-400 uppercase mb-1">Sensibilidades</p>
                  <p className="text-xs text-gray-200">{selectedClient.sensitivities || 'Couro cabeludo normal'}</p>
                </div>
                <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl">
                  <p className="text-[10px] font-bold text-blue-400 uppercase mb-1">Preferências</p>
                  <p className="text-xs text-gray-200">{selectedClient.care_preferences || 'Prefere tons frios'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
            <button className="flex-1 py-2.5 bg-amber-600 text-white font-bold rounded-xl text-xs">Agendar para Cliente</button>
            <button className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-bold rounded-xl text-xs">Histórico Completo</button>
          </div>
        </div>
      )}
    </div>
  );
}
