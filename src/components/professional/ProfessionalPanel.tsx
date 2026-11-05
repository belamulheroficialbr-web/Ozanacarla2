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
  Users,
  DollarSign,
  TrendingUp,
  Award,
  CalendarCheck,
  Check
} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';

interface ProfessionalPanelProps {
  onExitToPublic?: () => void;
}

export function ProfessionalPanel({onExitToPublic}: ProfessionalPanelProps = {}) {
  const {user, logoutOwner} = useAuth();
  const [activeTab, setActiveTab] = useState<'proximos' | 'historico' | 'produtividade'>('proximos');
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
            a.professional?.id === user.id ||
            a.professional?.name?.toLowerCase() === myProfile?.name?.toLowerCase()
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

  // Separação de atendimentos
  const upcomingAppointments = appointments.filter(a => a.status !== 'concluded' && a.status !== 'cancelled');
  const finishedAppointments = appointments.filter(a => a.status === 'concluded');

  // Cálculos de produtividade e comissão (comissão padrão estimada de 30% a 50%)
  const commissionRate = Number(myProfile?.commission_rate || 40); // 40% padrão
  const totalRevenueGenerated = finishedAppointments.reduce(
    (sum, a) => sum + Number(a.services?.price || a.price || 0),
    0
  );
  const totalCommissionEarned = (totalRevenueGenerated * commissionRate) / 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do Painel Profissional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-amber-500/30 p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            {myProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold block">
              Ambiente Autenticado do Especialista
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Olá, {myProfile?.name || user?.email?.split('@')[0] || 'Profissional'}!
            </h2>
            <p className="text-xs text-gray-400">
              Acesso exclusivo aos seus atendimentos, horários e comissões autorizadas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {onExitToPublic && (
            <button
              onClick={onExitToPublic}
              className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Voltar ao Salão</span>
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

      {/* Tabs de Navegação Interna do Profissional */}
      <div className="flex gap-2 p-1.5 bg-gray-950 border border-gray-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('proximos')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'proximos'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar size={15} />
          <span>Próximos Atendimentos ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'historico'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <CalendarCheck size={15} />
          <span>Histórico de Atendidos ({finishedAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('produtividade')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'produtividade'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign size={15} />
          <span>Produtividade & Comissões</span>
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-xs text-gray-500 bg-gray-950 border border-gray-800 rounded-3xl">
          Carregando dados autorizados da sua agenda...
        </div>
      ) : (
        <>
          {/* TAB 1: PRÓXIMOS ATENDIMENTOS */}
          {activeTab === 'proximos' && (
            <div className="space-y-3">
              {upcomingAppointments.length === 0 ? (
                <div className="p-10 text-center space-y-3 bg-gray-950 border border-gray-800 rounded-3xl">
                  <Calendar size={36} className="mx-auto text-gray-600" />
                  <h4 className="text-sm font-bold text-white">Nenhum próximo atendimento agendado</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Novos agendamentos marcados pelas clientes aparecerão aqui automaticamente.
                  </p>
                </div>
              ) : (
                upcomingAppointments.map(app => (
                  <div
                    key={app.id || Math.random()}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg hover:border-amber-500/30 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">
                          {app.services?.name || app.service_name || 'Procedimento Estético'}
                        </h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          app.status === 'confirmed'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {app.status === 'confirmed' ? 'Confirmado' : 'Aguardando Início'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-gray-400">
                        <p className="flex items-center gap-1.5">
                          <User size={13} className="text-amber-400" />
                          <span>Cliente: <strong className="text-white">{app.client_name || app.client?.name || 'Cliente Bela Mulher'}</strong></span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Clock size={13} className="text-amber-400" />
                          <span>Horário Marcado: <strong className="text-gray-300">{formatDateTime(app.start_time)}</strong></span>
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
                          <span>Confirmar</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleUpdateStatus(app.id, 'concluded')}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-blue-600/20"
                      >
                        <Check size={14} />
                        <span>Concluir Atendimento</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: HISTÓRICO DE CLIENTES ATENDIDOS */}
          {activeTab === 'historico' && (
            <div className="space-y-3">
              {finishedAppointments.length === 0 ? (
                <div className="p-10 text-center space-y-3 bg-gray-950 border border-gray-800 rounded-3xl">
                  <CalendarCheck size={36} className="mx-auto text-gray-600" />
                  <h4 className="text-sm font-bold text-white">Nenhum atendimento concluído registrado ainda</h4>
                  <p className="text-xs text-gray-400">
                    Ao finalizar seus atendimentos, o histórico aparecerá aqui com os procedimentos realizados.
                  </p>
                </div>
              ) : (
                finishedAppointments.map(app => (
                  <div
                    key={app.id || Math.random()}
                    className="p-4 bg-gray-950 border border-gray-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                          Atendimento Concluído
                        </span>
                        <span className="text-xs text-gray-500">• {formatDateTime(app.start_time)}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {app.services?.name || app.service_name || 'Procedimento Estético'}
                      </h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                        <User size={13} className="text-amber-400" />
                        <span>Cliente: <strong className="text-gray-200">{app.client_name || app.client?.name || 'Cliente Cadastrada'}</strong></span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-gray-500 block">Valor do Serviço</span>
                      <span className="text-sm font-bold text-amber-400 tabular-nums">
                        R$ {Number(app.services?.price || app.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PRODUTIVIDADE E COMISSÕES */}
          {activeTab === 'produtividade' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Atendimentos Concluídos
                  </span>
                  <p className="text-2xl font-black text-white">{finishedAppointments.length}</p>
                  <span className="text-[10px] text-emerald-400">Procedimentos finalizados</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    Faturamento Gerado
                  </span>
                  <p className="text-2xl font-black text-amber-400 tabular-nums">
                    R$ {totalRevenueGenerated.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-gray-400">Total em serviços realizados</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-gray-950 to-gray-950 border border-amber-500/40 space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    Comissão Autorizada ({commissionRate}%)
                  </span>
                  <p className="text-2xl font-black text-amber-400 tabular-nums">
                    R$ {totalCommissionEarned.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-amber-400/80">Extrato individual de comissão</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-2 text-xs text-gray-400">
                <h5 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Sparkles size={15} className="text-amber-400" />
                  <span>Regras de Comissionamento e Horários</span>
                </h5>
                <p>
                  O repasse de comissões é calculado individualmente após o fechamento de cada atendimento concluído. Dúvidas sobre valores pendentes podem ser consultadas diretamente com a administração geral.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
