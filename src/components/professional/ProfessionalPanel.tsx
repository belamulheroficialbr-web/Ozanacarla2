import React, { useState, useEffect } from 'react';
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
  Check,
  FileText,
  XCircle,
  ShieldCheck,
  Lock,
  Plus,
  Trash2
} from 'lucide-react';
import { dataService } from '../../lib/data';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface ProfessionalPanelProps {
  onExitToPublic?: () => void;
}

export function ProfessionalPanel({ onExitToPublic }: ProfessionalPanelProps = {}) {
  const { user, logoutOwner } = useAuth();
  const [activeTab, setActiveTab] = useState<'proximos' | 'historico' | 'produtividade' | 'escala'>('proximos');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<any>(null);

  // New Block Form state
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blockType, setBlockType] = useState<'folga' | 'almoço' | 'férias' | 'bloqueio'>('almoço');
  const [blockTitle, setBlockTitle] = useState('');
  const [blockDate, setBlockDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('13:00');

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
        const filtered = appRes.data.filter(
          (a: any) =>
            a.professional_id === user.id ||
            a.professional_email === user.email ||
            a.professional?.id === user.id ||
            a.professional?.name?.toLowerCase() === profRes.data?.name?.toLowerCase()
        );
        setAppointments(filtered.length > 0 ? filtered : appRes.data);
      }

      // 3. Load commissions assigned strictly to this professional
      const commRes = await dataService.getCommissions(user.id);
      if (commRes.data) setCommissions(commRes.data);

      // 4. Load schedule blocks for this professional
      const blockRes = await dataService.getScheduleBlocks(user.id);
      if (blockRes.data) setScheduleBlocks(blockRes.data);
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

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const payload = {
      professional_id: user.id,
      professional_name: myProfile?.name || 'Profissional',
      type: blockType,
      title: blockTitle || (blockType === 'almoço' ? 'Horário de Almoço' : blockType === 'folga' ? 'Folga' : 'Férias'),
      date: blockDate,
      start_time: blockType === 'folga' || blockType === 'férias' ? null : startTime,
      end_time: blockType === 'folga' || blockType === 'férias' ? null : endTime
    };

    const res = await dataService.addScheduleBlock(payload);
    if (!res.error) {
      setShowAddBlock(false);
      setBlockTitle('');
      loadProfessionalData();
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (confirm('Deseja remover este bloqueio da sua agenda?')) {
      await dataService.deleteScheduleBlock(id);
      loadProfessionalData();
    }
  };

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'Horário a definir';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? 'Data a definir'
        : d.toLocaleString('pt-BR', {
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
  const upcomingAppointments = appointments.filter(
    a => a.status !== 'concluded' && a.status !== 'cancelled'
  );
  const finishedAppointments = appointments.filter(a => a.status === 'concluded');

  // Cálculos de produtividade e comissão
  const commissionRate = Number(myProfile?.commission_rate || 30);
  const totalRevenueGenerated = finishedAppointments.reduce(
    (sum, a) => sum + Number(a.services?.price || a.price || 0),
    0
  );

  const totalCommissionsPaid = commissions
    .filter(c => c.status === 'paid' || c.status === 'pago')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
  const totalCommissionsPending = commissions
    .filter(c => c.status === 'pending' || c.status === 'pendente')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do Painel Profissional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-amber-500/30 p-5 rounded-3xl shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black font-black text-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            {myProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                Especialista Bela Mulher
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Olá, {myProfile?.name || user?.email?.split('@')[0] || 'Profissional'}!
            </h2>
            <p className="text-xs text-gray-400">
              Taxa de Comissão: <strong className="text-amber-400">{commissionRate}%</strong> • Acesso exclusivo aos seus atendimentos.
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
      <div className="flex border-b border-gray-800 overflow-x-auto no-scrollbar gap-2 pb-1">
        <button
          onClick={() => setActiveTab('proximos')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'proximos'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Calendar size={14} />
          <span>Próximos ({upcomingAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('historico')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'historico'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <CalendarCheck size={14} />
          <span>Histórico Concluído ({finishedAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('produtividade')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'produtividade'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <DollarSign size={14} />
          <span>Produtividade & Comissões</span>
        </button>

        <button
          onClick={() => setActiveTab('escala')}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'escala'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
          }`}
        >
          <Lock size={14} />
          <span>Escala & Bloqueios ({scheduleBlocks.length})</span>
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
            <div className="space-y-3 animate-in fade-in duration-200">
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
                    key={app.id}
                    className="p-5 bg-gray-950 border border-gray-800 hover:border-amber-500/40 rounded-3xl space-y-4 shadow-xl transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {app.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                          </span>
                          <span className="text-xs font-mono text-gray-500">#{app.id.substring(0, 8)}</span>
                        </div>
                        <h3 className="text-sm font-bold text-white">
                          {app.services?.name || app.service_name || 'Procedimento Estético'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/5 px-3 py-1.5 rounded-2xl border border-amber-500/10 shrink-0">
                        <Clock size={14} />
                        <span>{formatDateTime(app.start_time || app.date)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 text-gray-300">
                        <User size={14} className="text-gray-500 shrink-0" />
                        <span>
                          Cliente: <strong className="text-white">{app.client_name || app.client?.name || 'Cliente'}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Scissors size={14} className="text-gray-500 shrink-0" />
                        <span>
                          Valor: <strong className="text-white">R$ {Number(app.services?.price || app.price || 0).toFixed(2)}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-900">
                      {app.status !== 'concluded' && (
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'concluded')}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} />
                          <span>Concluir Atendimento</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: HISTÓRICO CONCLUÍDO */}
          {activeTab === 'historico' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {finishedAppointments.length === 0 ? (
                <div className="p-10 text-center text-xs text-gray-500 bg-gray-950 border border-gray-800 rounded-3xl">
                  Nenhum atendimento concluído registrado no seu histórico.
                </div>
              ) : (
                finishedAppointments.map(app => (
                  <div
                    key={app.id}
                    className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {app.services?.name || app.service_name || 'Procedimento Estético'}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {formatDateTime(app.start_time || app.date)} • Cliente: {app.client_name || app.client?.name || 'Cliente'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-amber-400 block">
                        R$ {Number(app.services?.price || app.price || 0).toFixed(2)}
                      </span>
                      <span className="text-[9px] text-emerald-400 font-bold uppercase">Concluído</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PRODUTIVIDADE E COMISSÕES */}
          {activeTab === 'produtividade' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Concluídos</span>
                  <p className="text-xl font-black text-white">{finishedAppointments.length}</p>
                  <span className="text-[10px] text-emerald-400 block">Atendimentos ok</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-950 border border-gray-800 space-y-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Faturamento Gerado</span>
                  <p className="text-xl font-black text-amber-400 tabular-nums">R$ {totalRevenueGenerated.toFixed(2)}</p>
                  <span className="text-[10px] text-gray-400 block">Serviços prestados</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-950 border border-emerald-500/30 space-y-1">
                  <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Comissões Pagas</span>
                  <p className="text-xl font-black text-emerald-400 tabular-nums">R$ {totalCommissionsPaid.toFixed(2)}</p>
                  <span className="text-[10px] text-emerald-400/80 block">Baixadas pelo ADM</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-950 border border-amber-500/40 space-y-1">
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">Comissões Pendentes</span>
                  <p className="text-xl font-black text-amber-400 tabular-nums">R$ {totalCommissionsPending.toFixed(2)}</p>
                  <span className="text-[10px] text-amber-400/80 block">Aguardando repasse</span>
                </div>
              </div>

              {/* Extrato de Comissões */}
              <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800 space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={16} className="text-amber-400" />
                    <span>Seu Extrato Detalhado de Comissões</span>
                  </h4>
                  <span className="text-xs text-amber-400 font-semibold">Taxa: {commissionRate}%</span>
                </div>

                {commissions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 bg-gray-900/60 rounded-xl">
                    Nenhuma comissão gravada até o momento.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {commissions.map(comm => (
                      <div key={comm.id} className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">Ref. Atend. #{comm.appointment_id?.substring(0, 8)}</span>
                            <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                              comm.status === 'paid' || comm.status === 'pago'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}>
                              {comm.status === 'paid' || comm.status === 'pago' ? 'Paga' : 'Pendente'}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Valor Serviço: R$ {Number(comm.service_amount || 0).toFixed(2)} • Taxa: {comm.commission_rate || commissionRate}%
                          </p>
                        </div>

                        <span className="text-sm font-bold text-amber-400 tabular-nums">
                          R$ {Number(comm.commission_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ESCALA E BLOQUEIOS DA AGENDA */}
          {activeTab === 'escala' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-4 bg-gray-950 border border-gray-800 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-white">Sua Escala & Bloqueios de Horário</h4>
                  <p className="text-[10px] text-gray-400">
                    Cadastre folgas, horário de almoço e férias para bloquear agendamentos indisponíveis.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddBlock(true)}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Novo Bloqueio</span>
                </button>
              </div>

              {scheduleBlocks.length === 0 ? (
                <div className="p-12 text-center bg-gray-950 border border-gray-800 rounded-3xl space-y-2">
                  <Lock size={32} className="mx-auto text-gray-600" />
                  <p className="text-xs text-gray-400 font-medium">Nenhum bloqueio registrado na sua escala.</p>
                  <p className="text-[10px] text-gray-500">Sua agenda está liberada nos horários normais de funcionamento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {scheduleBlocks.map(block => (
                    <div 
                      key={block.id} 
                      className="p-4 bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-between gap-3 group hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                          block.type === 'férias' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          block.type === 'folga' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          <Lock size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white">{block.title}</h5>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-900 text-amber-400 border border-gray-800">
                              {block.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Data: <strong>{new Date(block.date).toLocaleDateString('pt-BR')}</strong>
                            {block.start_time && block.end_time ? ` • ${block.start_time} às ${block.end_time}` : ' • Dia Todo'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-2 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remover bloqueio"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODAL NOVO BLOQUEIO */}
          {showAddBlock && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
              <form onSubmit={handleAddBlock} className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Novo Bloqueio de Agenda</h4>
                  <button type="button" onClick={() => setShowAddBlock(false)} className="text-gray-400 hover:text-white font-bold">FECHAR</button>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Tipo de Bloqueio</label>
                    <select
                      value={blockType}
                      onChange={e => setBlockType(e.target.value as any)}
                      className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                    >
                      <option value="almoço">Horário de Almoço</option>
                      <option value="folga">Folga / Dia Livre</option>
                      <option value="férias">Férias</option>
                      <option value="bloqueio">Outro Bloqueio</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Descrição / Título</label>
                    <input
                      value={blockTitle}
                      onChange={e => setBlockTitle(e.target.value)}
                      placeholder="Ex: Intervalo de Almoço / Consulta Médica"
                      className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Data</label>
                    <input
                      type="date"
                      required
                      value={blockDate}
                      onChange={e => setBlockDate(e.target.value)}
                      className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                    />
                  </div>

                  {(blockType === 'almoço' || blockType === 'bloqueio') && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Horário Início</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={e => setStartTime(e.target.value)}
                          className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Horário Fim</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={e => setEndTime(e.target.value)}
                          className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
                  <button type="button" onClick={() => setShowAddBlock(false)} className="flex-1 py-2.5 bg-gray-900 text-gray-400 font-bold rounded-xl text-xs">Cancelar</button>
                  <button type="submit" className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/20">Salvar Bloqueio</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Discrete Visual Footer */}
      <div className="pt-6 pb-2 text-center border-t border-gray-800/60 text-[11px] text-gray-500 font-medium">
        Ambiente protegido • Painel seguro Bela Mulher
      </div>
    </div>
  );
}
