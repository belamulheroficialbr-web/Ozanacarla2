import React, {useState, useEffect} from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  CalendarCheck,
  Phone
} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';

interface AgendamentosViewProps {
  onOpenBookingModal: (service?: any) => void;
  onRequestLogin: () => void;
  onNavigateToVitrine: () => void;
}

export function AgendamentosView({
  onOpenBookingModal,
  onRequestLogin,
  onNavigateToVitrine
}: AgendamentosViewProps) {
  const {user} = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [pRes, sRes] = await Promise.all([
      dataService.getProfiles('professional'),
      dataService.getServices()
    ]);

    if (pRes.data) setProfessionals(pRes.data);
    if (sRes.data) setServices(sRes.data);

    if (user) {
      const aRes = await dataService.getAppointments(user.id, 'client');
      if (aRes.data) setAppointments(aRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    if (user) {
      const channel = supabase
        .channel(`client_appointments_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `client_id=eq.${user.id}`
        }, () => {
          loadData();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user]);

  const handleCancelAppointment = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
      await dataService.updateAppointmentStatus(id, 'cancelled');
      await loadData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          label: 'Confirmado',
          classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
      case 'concluded':
        return {
          label: 'Concluído',
          classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
        };
      case 'cancelled':
        return {
          label: 'Cancelado',
          classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
        };
      default:
        return {
          label: 'Pendente',
          classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
        };
    }
  };

  const activeAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const pastAppointments = appointments.filter(a => a.status === 'concluded' || a.status === 'cancelled');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header & Call to Action */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-amber-500/30 p-6 rounded-3xl space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block mb-1">
              Horários & Atendimentos
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <CalendarCheck size={26} className="text-amber-400" />
              <span>Agendamento Online</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-md">
              Escolha seu procedimento preferido, selecione a especialista do salão e reserve seu horário com total comodidade.
            </p>
          </div>

          <button
            onClick={() => onOpenBookingModal()}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 shrink-0"
          >
            <Plus size={16} />
            <span>Agendar Horário Agora</span>
          </button>
        </div>

        {/* Quick features banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-800/80 text-xs text-gray-300">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="font-bold text-white text-[11px]">Seg a Sáb: 09h às 19h</p>
              <p className="text-[10px] text-gray-500">Horário de funcionamento</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="font-bold text-white text-[11px]">Confirmação Rápida</p>
              <p className="text-[10px] text-gray-500">Notificação no app e celular</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="font-bold text-white text-[11px]">Ganhe Pontos Clube</p>
              <p className="text-[10px] text-gray-500">Pontos a cada atendimento</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Meus Agendamentos (Se o usuário estiver autenticado) */}
      {user ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarIcon size={16} className="text-amber-400" />
              <span>Meus Atendimentos Agendados</span>
            </h3>
            <span className="text-xs text-amber-400 font-semibold">{appointments.length} registros</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-gray-950 rounded-2xl border border-gray-800">
              Carregando seus horários...
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-gray-950/80 border border-gray-800 p-8 rounded-3xl text-center space-y-3">
              <CalendarIcon size={32} className="mx-auto text-gray-700" />
              <h4 className="text-sm font-bold text-white">Nenhum atendimento agendado no momento</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Você ainda não possui horários reservados. Escolha um serviço e agende com sua especialista favorita!
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => onOpenBookingModal()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Fazer Meu Primeiro Agendamento
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Agendamentos Ativos */}
              {activeAppointments.length > 0 && (
                <div className="space-y-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 block">
                    Próximos Atendimentos ({activeAppointments.length})
                  </span>
                  {activeAppointments.map(app => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <div
                        key={app.id}
                        className="p-4 bg-gray-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            <Scissors size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{app.services?.name || 'Atendimento Personalizado'}</h4>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${badge.classes}`}>
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-3">
                              <span className="flex items-center gap-1 text-white font-semibold">
                                <Clock size={13} className="text-amber-400" />
                                {new Date(app.start_time).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})} às {new Date(app.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                              </span>
                              {app.professional?.name && (
                                <span className="flex items-center gap-1 text-gray-400">
                                  <User size={13} /> Especialista: <strong className="text-gray-300">{app.professional.name}</strong>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 shrink-0">
                          {app.status === 'pending' || app.status === 'confirmed' ? (
                            <button
                              onClick={() => handleCancelAppointment(app.id)}
                              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-bold transition-colors"
                            >
                              Cancelar Horário
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Histórico Anterior */}
              {pastAppointments.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
                    Histórico Anterior ({pastAppointments.length})
                  </span>
                  {pastAppointments.map(app => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <div
                        key={app.id}
                        className="p-3.5 bg-black/60 border border-gray-800/80 rounded-2xl flex items-center justify-between gap-3 text-xs opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-200">{app.services?.name || 'Serviço'}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${badge.classes}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {new Date(app.start_time).toLocaleDateString('pt-BR')} às {new Date(app.start_time).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})} • Especialista: {app.professional?.name || 'Salão'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Convite para entrar */
        <div className="p-6 bg-gray-950 border border-gray-800 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shrink-0">
              <User size={22} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Acompanhe seus agendamentos no salão</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Faça login para visualizar seus horários confirmados, histórico e acumular pontos de fidelidade.
              </p>
            </div>
          </div>
          <button
            onClick={onRequestLogin}
            className="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-bold whitespace-nowrap transition-colors"
          >
            Entrar na Minha Conta
          </button>
        </div>
      )}

      {/* 3. Equipe de Profissionais em Destaque */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span>Nossas Especialistas</span>
          </h3>
          <span className="text-xs text-gray-400">Equipe Bela Mulher</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {professionals.map(prof => (
            <div
              key={prof.id}
              className="p-4 bg-gray-950 border border-gray-800/90 rounded-2xl flex items-center justify-between gap-3 shadow-lg hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black border border-gray-800 shrink-0">
                  <img
                    src={prof.avatar_url || '/src/assets/images/carousel_salon_1_1793799835801.jpg'}
                    alt={prof.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{prof.name}</h4>
                  <p className="text-[11px] text-amber-400 font-medium">{prof.specialties || 'Especialista em Beleza'}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{prof.bio || 'Atendimento com produtos premium.'}</p>
                </div>
              </div>

              <button
                onClick={() => onOpenBookingModal()}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold whitespace-nowrap transition-colors"
              >
                Agendar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Link para catálogo de procedimentos */}
      <div className="p-4 bg-black/60 border border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-gray-400">
          Deseja conhecer todos os preços, durações e fotos dos procedimentos antes de agendar?
        </span>
        <button
          onClick={onNavigateToVitrine}
          className="text-amber-400 font-bold hover:text-amber-300 flex items-center gap-1 underline underline-offset-4 shrink-0"
        >
          <span>Abrir Vitrine de Serviços</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
