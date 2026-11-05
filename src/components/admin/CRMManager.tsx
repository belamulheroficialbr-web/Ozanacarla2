import React, {useState, useEffect} from 'react';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  UserPlus,
  UserCheck,
  UserMinus,
  MessageSquare,
  Gift,
  Calendar,
  DollarSign,
  ArrowRight,
  Target,
  Send,
  Plus,
  Clock,
  ChevronRight,
  Info,
  Star
} from 'lucide-react';
import {dataService} from '../../lib/data';

export function CRMManager() {
  const [clients, setClients] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // New Campaign Form
  const [campName, setCampName] = useState('');
  const [campSegment, setCampSegment] = useState('inactive_30');
  const [campMessage, setCampMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadCRMData();
  }, []);

  const loadCRMData = async () => {
    setLoading(true);
    const [cRes, campRes] = await Promise.all([
      dataService.getCRMClientMetrics(),
      dataService.getCRMCampaigns()
    ]);
    if (cRes.data) setClients(cRes.data);
    if (campRes.data) setCampaigns(campRes.data);
    setLoading(false);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSegment = selectedSegment === 'all' || c.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  const segments = [
    {id: 'all', label: 'Todos', icon: Users, color: 'text-gray-400'},
    {id: 'new', label: 'Novos', icon: UserPlus, color: 'text-blue-400'},
    {id: 'frequent', label: 'Frequentes', icon: UserCheck, color: 'text-emerald-400'},
    {id: 'inactive_30', label: 'Inativos 30d', icon: Clock, color: 'text-amber-400'},
    {id: 'inactive_60', label: 'Inativos 60d', icon: UserMinus, color: 'text-orange-400'},
    {id: 'inactive_90', label: 'Inativos 90d+', icon: Target, color: 'text-red-400'},
    {id: 'birthday', label: 'Aniversariantes', icon: Gift, color: 'text-pink-400'},
  ];

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const targetUsers = clients.filter(c => c.segment === campSegment).map(c => c.id);
    
    if (targetUsers.length === 0) {
      alert('Nenhum cliente encontrado para este segmento.');
      setIsSending(false);
      return;
    }

    const payload = {
      name: campName,
      target_segment: campSegment,
      message_template: campMessage,
      status: 'sent'
    };

    const cRes = await dataService.createCRMCampaign(payload);
    if (cRes.data) {
      await dataService.sendCRMCampaign(cRes.data[0].id, targetUsers);
      alert(`Campanha disparada para ${targetUsers.length} clientes!`);
      setShowCampaignModal(false);
      loadCRMData();
    }
    setIsSending(false);
  };

  // KPIs
  const totalRevenue = clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0);
  const avgTicket = clients.length > 0 ? totalRevenue / clients.length : 0;
  const retentionRate = clients.length > 0 ? (clients.filter(c => c.segment === 'frequent').length / clients.length) * 100 : 0;

  if (loading) return <div className="p-8 text-center text-xs text-gray-500">Processando inteligência de dados...</div>;

  return (
    <div className="space-y-6">
      {/* CRM Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Ticket Médio</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            R$ {avgTicket.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </div>
          <p className="text-[10px] text-gray-500">Média de gasto por cliente cadastrada</p>
        </div>

        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Taxa de Retenção</span>
            <Target size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            {retentionRate.toFixed(1)}%
          </div>
          <p className="text-[10px] text-gray-500">Clientes classificadas como frequentes</p>
        </div>

        <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-widest">Faturamento CRM</span>
            <DollarSign size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white tabular-nums">
            R$ {totalRevenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </div>
          <p className="text-[10px] text-gray-500">Total histórico processado pelo módulo</p>
        </div>
      </div>

      {/* Segment Selector */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {segments.map(seg => (
          <button
            key={seg.id}
            onClick={() => setSelectedSegment(seg.id)}
            className={`px-4 py-2 rounded-2xl text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
              selectedSegment === seg.id
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg'
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            <seg.icon size={14} className={selectedSegment === seg.id ? 'text-white' : seg.color} />
            <span>{seg.label}</span>
            <span className="ml-1 opacity-60">({clients.filter(c => seg.id === 'all' || c.segment === seg.id).length})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden divide-y divide-gray-900">
            {filteredClients.map(client => (
              <div key={client.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-amber-500 font-bold border border-gray-800">
                    {client.name?.[0] || 'C'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      {client.name}
                      {client.segment === 'frequent' && <Star size={10} className="fill-amber-500 text-amber-500" />}
                    </h4>
                    <p className="text-[10px] text-gray-500">{client.phone || client.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-900 text-gray-400 border border-gray-800">
                        {client.appointments_count} visitas
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        R$ {Number(client.total_revenue).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    client.segment === 'frequent' ? 'bg-emerald-500/20 text-emerald-400' :
                    client.segment === 'inactive_90' ? 'bg-red-500/20 text-red-400' :
                    client.segment === 'new' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {client.segment.replace('_', ' ')}
                  </span>
                  <p className="text-[9px] text-gray-500">Última: {client.last_return ? new Date(client.last_return).toLocaleDateString('pt-BR') : 'Nunca'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaigns & Actions */}
        <div className="space-y-4">
          <div className="p-5 bg-gray-950 border border-gray-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-amber-400" />
              <span>Campanhas Inteligentes</span>
            </h3>
            
            <button
              onClick={() => setShowCampaignModal(true)}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20"
            >
              <Plus size={16} />
              <span>Criar Nova Campanha</span>
            </button>

            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block px-1">Histórico de Envios</span>
              {campaigns.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-gray-800 rounded-2xl text-[10px] text-gray-600">
                  Nenhuma campanha disparada.
                </div>
              ) : (
                campaigns.map(camp => (
                  <div key={camp.id} className="p-3 bg-gray-900 border border-gray-800 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center">
                      <h5 className="text-[11px] font-bold text-white truncate">{camp.name}</h5>
                      <span className="text-[9px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-400/10 rounded uppercase">ENVIADA</span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{camp.message_template}</p>
                    <div className="flex items-center gap-2 pt-1 text-[9px] text-gray-600">
                      <Clock size={10} />
                      <span>{new Date(camp.sent_at || camp.created_at).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <Users size={10} />
                      <span>Segmento: {camp.target_segment}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Info size={16} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Dica CRM</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed italic">
              "Clientes inativos há 60 dias possuem 40% de chance de churn. Envie uma oferta personalizada hoje!"
            </p>
          </div>
        </div>
      </div>

      {/* New Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateCampaign} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Configurar Campanha</h4>
              <button type="button" onClick={() => setShowCampaignModal(false)} className="text-gray-400 hover:text-white font-bold text-xs">FECHAR</button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Nome da Campanha</label>
                <input 
                  required
                  value={campName}
                  onChange={e => setCampName(e.target.value)}
                  placeholder="Ex: Recuperação de Clientes 30d"
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Segmento Destino</label>
                <select 
                  value={campSegment}
                  onChange={e => setCampSegment(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                >
                  <option value="inactive_30">Inativos há 30 dias</option>
                  <option value="inactive_60">Inativos há 60 dias</option>
                  <option value="inactive_90">Inativos há 90 dias+</option>
                  <option value="new">Clientes Novos (Boas-vindas)</option>
                  <option value="frequent">Clientes Frequentes (Oferta VIP)</option>
                  <option value="birthday">Aniversariantes do Mês</option>
                </select>
                <p className="text-[9px] text-amber-500 mt-1 mt-1 font-medium">
                  {clients.filter(c => c.segment === campSegment).length} clientes atingidos
                </p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Mensagem da Notificação</label>
                <textarea 
                  required
                  value={campMessage}
                  onChange={e => setCampMessage(e.target.value)}
                  rows={4}
                  placeholder="Olá! Sentimos sua falta. Ganhe 10% de desconto agendando hoje..."
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="p-4 bg-gray-950 border-t border-gray-800">
              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                <Send size={16} />
                <span>{isSending ? 'Disparando...' : 'Confirmar e Enviar'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
