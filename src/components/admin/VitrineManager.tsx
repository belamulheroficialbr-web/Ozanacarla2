import {useState, useEffect} from 'react';
import {dataService} from '../../lib/data';

export function VitrineManager() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    async function fetchServices() {
      const {data} = await dataService.getServices();
      if (data) setServices(data);
    }
    fetchServices();
  }, []);

  async function handleAdd() {
    // Basic implementation for demonstration
    const newService = { name: 'Novo Serviço', price: 0, duration: '60min', desc: 'Descrição' };
    const {data} = await dataService.addService(newService);
    if (data) setServices([...services, ...data]);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-amber-500">Gerenciar Serviços</h3>
      {services.map(s => (
        <div key={s.id} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <h4 className="font-bold">{s.name}</h4>
            <p className="text-sm text-gray-400">{s.desc} • R$ {s.price} • {s.duration}</p>
          </div>
          <button className="text-amber-500 text-sm">Editar</button>
        </div>
      ))}
      <button onClick={handleAdd} className="w-full bg-amber-600 p-3 rounded-xl font-bold">Adicionar Serviço</button>
    </div>
  );
}
