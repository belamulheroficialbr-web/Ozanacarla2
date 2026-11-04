import {useState, useEffect} from 'react';
import {dataService} from '../../lib/data';

export function ClientManager() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dataService.getProfiles('client').then(({data}) => {
      if (data) setClients(data);
    });
  }, []);

  const filtered = clients.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <input type="text" placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="w-full p-2 bg-gray-800 rounded-lg text-white" />
      {filtered.map(c => (
        <div key={c.id} className="bg-gray-800 p-4 rounded-xl flex items-center justify-between">
          <span className="font-bold">{c.name}</span>
          <button className="text-amber-500 text-sm">Detalhes</button>
        </div>
      ))}
    </div>
  );
}
