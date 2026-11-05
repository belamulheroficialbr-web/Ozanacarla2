import React, {useState, useEffect} from 'react';
import {Calendar as CalIcon, Clock, User, Scissors, Plus, X, Check, ChevronLeft, ChevronRight, AlertCircle, Trash2} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';

export function AppointmentManager() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Selection States
  const [clients, setClients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const {user, role} = useAuth();

  // Form State
  const [clientId, setClientId] = useState('');
  const [profId, setProfId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [status, setStatus] = useState('pending');

  const fetchAppointments = async () => {
    if (!user || !role) return;
    setLoading(true);
    const {data} = await dataService.getAppointments(user.id, role === 'admin' ? 'admin' : role);
    if (data) setAppointments(data);
    setLoading(false);
  };

  const loadResources = async () => {
    const [cRes, pRes, sRes] = await Promise.all([
      dataService.getProfiles('client'),
      dataService.getProfiles('professional'),
      dataService.getServices()
    ]);
    if (cRes.data) setClients(cRes.data);
    if (pRes.data) setProfessionals(pRes.data);
    if (sRes.data) setServices(sRes.data);
  };

  useEffect(() => {
    fetchAppointments();
    loadResources();

    const channel = supabase
      .channel('appointments_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, role]);

  const resetForm = () => {
    setClientId('');
    setProfId('');
    setServiceId('');
    setStartTime('');
    setStatus('pending');
    setEditingApp(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (app: any) => {
    setEditingApp(app);
    setClientId(app.client_id || '');
    setProfId(app.professional_id || '');
    setServiceId(app.service_id || '');
    setStartTime(app.start_time ? app.start_time.substring(0, 16) : '');
    setStatus(app.status || 'pending');
    setShowModal(true);
  };

  const checkConflict = (pId: string, start: string, dur: number, excludeId?: string) => {
    const newStart = new Date(start).getTime();
    const newEnd = new Date(start).getTime() + dur * 60000;

    return appointments.some(app => {
      if (app.id === excludeId) return false;
      if (app.professional_id !== pId) return false;
      if (app.status === 'cancelled') return false;

      const appStart = new Date(app.start_time).getTime();
      const appDur = app.duration_minutes || 60;
      const appEnd = appStart + appDur * 60000;

      return (newStart < appEnd && newEnd > appStart);
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = services.find(s => s.id === serviceId);
    const duration = selectedService?.duration_minutes || 60;

    if (checkConflict(profId, startTime, duration, editingApp?.id)) {
      alert('Conflito de Horário! Este profissional já possui um agendamento neste período.');
      return;
    }

    const payload = {
      client_id: clientId,
      professional_id: profId,
      service_id: serviceId,
      start_time: new Date(startTime).toISOString(),
      duration_minutes: duration,
      status
    };

    if (editingApp) {
      await dataService.updateAppointment(editingApp.id, payload);
    } else {
      await dataService.createAppointment(payload);
    }

    setShowModal(false);
    fetchAppointments();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja cancelar este agendamento?')) {
      await dataService.updateAppointmentStatus(id, 'cancelled');
      fetchAppointments();
    }
  };

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'A definir';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'A definir' : d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredApps = appointments.filter(app => {
    if (app.status === 'cancelled') return false;
    const appDate = new Date(app.start_time);
    return appDate.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <CalIcon size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Agenda & Atendimentos</h3>
            <p className="text-xs text-gray-400">Gerencie os horários e serviços do salão.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1">
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-1.5 text-xs font-bold text-amber-400 min-w-[100px] text-center">
              {selectedDate.toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
            </span>
            <button
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
              className="p-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/20"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo Agendamento</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500">Sincronizando agenda...</div>
      ) : filteredApps.length === 0 ? (
        <div className="p-16 text-center bg-black/40 border border-dashed border-gray-800 rounded-3xl space-y-3">
          <CalIcon size={32} className="mx-auto text-gray-700" />
          <p className="text-xs text-gray-500">Nenhum atendimento para este dia.</p>
          <button onClick={handleOpenAdd} className="text-xs text-amber-500 font-bold hover:underline">Agendar Agora</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredApps.map(app => (
            <div key={app.id} className="bg-black/60 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-amber-500/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800 flex flex-col items-center justify-center text-amber-500 font-bold">
                  <span className="text-xs uppercase opacity-60 font-medium">H</span>
                  <span className="text-sm">{new Date(app.start_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-sm">{app.services?.name || app.service_name || 'Procedimento'}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      app.status === 'confirmed' ? 'bg-emerald-500/15 text-emerald-400' : 
                      app.status === 'concluded' ? 'bg-blue-500/15 text-blue-400' : 'bg-amber-500/15 text-amber-400'
                    }`}>
                      {app.status === 'confirmed' ? 'Confirmado' : app.status === 'concluded' ? 'Concluído' : 'Pendente'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-gray-400">
                    <p className="flex items-center gap-1.5">
                      <User size={12} className="text-amber-500/70" />
                      Cliente: <span className="text-gray-200 font-medium">{app.client?.name || app.client_name || 'Visitante'}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Scissors size={12} className="text-amber-500/70" />
                      Prof: <span className="text-gray-200 font-medium">{app.professional?.name || 'Não atribuído'}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-gray-800">
                <button onClick={() => handleOpenEdit(app)} className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Clock size={16} />
                </button>
                <button onClick={() => handleDelete(app.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
                {app.status !== 'concluded' && (
                  <button
                    onClick={() => dataService.updateAppointmentStatus(app.id, 'concluded').then(fetchAppointments)}
                    className="ml-1 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg text-[10px] font-bold transition-all"
                  >
                    Concluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSave} className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">{editingApp ? 'Editar Agendamento' : 'Novo Agendamento'}</h4>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={18} /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Cliente</label>
                <select
                  required
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none"
                >
                  <option value="">Selecione a cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Profissional</label>
                <select
                  required
                  value={profId}
                  onChange={e => setProfId(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none"
                >
                  <option value="">Selecione o profissional...</option>
                  {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Serviço</label>
                <select
                  required
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none"
                >
                  <option value="">Selecione o serviço...</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Data & Horário</label>
                <input
                  required
                  type="datetime-local"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none"
                >
                  <option value="pending">Pendente de Confirmação</option>
                  <option value="confirmed">Confirmado / Reservado</option>
                  <option value="concluded">Concluído</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 bg-gray-900 text-gray-400 hover:text-white font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
              >
                <Check size={18} />
                <span>{editingApp ? 'Atualizar Agendamento' : 'Criar Agendamento'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
