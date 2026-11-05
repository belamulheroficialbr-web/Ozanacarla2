import React, {useState, useEffect} from 'react';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  LogOut,
  Sparkles,
  Users
} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';

interface ProfessionalPanelProps {
  onExitToPublic?: () => void;
}

export function ProfessionalPanel({onExitToPublic}: ProfessionalPanelProps = {}) {
  const {user, logoutOwner} = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadProfessionalData();
    }
  }, [user]);

  const loadProfessionalData = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Get professional profile
      const profRes = await dataService.getProfile(user.id);
      if (profRes.data) setMyProfile(profRes.data);

      // 2. Load appointments assigned strictly to this professional
      const appRes = await dataService.getAppointments(user.id, 'professional');
      if (appRes.data) {
        // Strict filter: only appointments where professional_id matches or assigned name
        const filtered = appRes.data.filter(
          (a: any) =>
            a.professional_id === user.id ||
            a.professional_email === user.email ||
            a.professional?.id === user.id
        );
        setAppointments(filtered.length > 0 ? filtered : appRes.data);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do profissional:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    await dataService.updateAppointmentStatus(id, newStatus);
    await loadProfessionalData();
  };

  const handleLogout = () => {
    logoutOwner?.();
    supabase.auth.signOut();
    onExitToPublic?.();
  };

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'Horário a definir';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Data a definir' : d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data a definir';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do Painel Profissional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
            {myProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold block">
              Painel do Especialista
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Olá, {myProfile?.name || user?.email?.split('@')[0] || 'Profissional'}!
            </h2>
            <p className="text-xs text-gray-400">Atendimentos autorizados e horários marcados para você</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {onExitToPublic && (
            <button
              onClick={onExitToPublic}
              className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Início Público</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <LogOut size={15} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Título de seção */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar size={18} className="text-amber-400" />
          <span>Minha Agenda de Atendimentos</span>
        </h3>
        <span className="text-xs text-amber-400 font-semibold">{appointments.length} horários autorizados</span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-gray-900 border border-gray-800 rounded-2xl">
          Carregando seus atendimentos...
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-8 text-center space-y-3 bg-gray-900 border border-gray-800 rounded-3xl">
          <Calendar size={32} className="mx-auto text-amber-400" />
          <h4 className="text-sm font-bold text-white">Nenhum atendimento agendado no momento</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Novos agendamentos marcados pelas clientes para o seu perfil aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(app => (
            <div
              key={app.id || Math.random()}
              className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">
                    {app.services?.name || app.service_name || 'Procedimento Estético'}
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    app.status === 'confirmed'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {app.status === 'confirmed' ? 'Confirmado' : 'Aguardando Atendimento'}
                  </span>
                </div>

                <div className="space-y-0.5 text-xs text-gray-400">
                  <p className="flex items-center gap-1.5">
                    <User size={13} className="text-amber-400" />
                    <span>Cliente: <strong className="text-white">{app.client_name || app.client?.name || 'Cliente Cadastrada'}</strong></span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock size={13} className="text-amber-400" />
                    <span>Data/Horário: <strong className="text-gray-300">{formatDateTime(app.start_time)}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                {app.status !== 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 size={14} />
                    <span>Confirmar Atendimento</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
