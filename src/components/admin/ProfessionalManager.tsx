import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Clock,
  X,
  Check,
  Save,
  DollarSign,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
  TrendingUp,
  Scissors,
  User,
  Filter,
  CreditCard,
  ChevronRight,
  Eye,
  AlertCircle,
  FileText
} from 'lucide-react';
import { dataService } from '../../lib/data';
import { supabase } from '../../lib/supabase';

export function ProfessionalManager() {
  const [activeTab, setActiveTab] = useState<'ativos' | 'desempenho' | 'pendentes'>('ativos');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Professional for Individual Performance View
  const [selectedProfId, setSelectedProfId] = useState<string>('');

  // Modal State for Add/Edit Professional
  const [showModal, setShowModal] = useState(false);
  const [editingProf, setEditingProf] = useState<any>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [bio, setBio] = useState('');
  const [commissionRate, setCommissionRate] = useState(30);

  const [isProcessingPay, setIsProcessingPay] = useState<string | null>(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch active professionals
      const { data: profData } = await dataService.getProfiles('professional');
      if (profData) {
        setProfessionals(profData);
        if (profData.length > 0 && !selectedProfId) {
          setSelectedProfId(profData[0].id);
        }
      }

      // 2. Fetch pending professional requests
      const { data: pendingData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'pending_professional');
      if (pendingData) setPendingRequests(pendingData);

      // 3. Fetch all appointments
      const { data: appData } = await dataService.getAppointments('admin', 'admin');
      if (appData) setAppointments(appData);

      // 4. Fetch all commissions
      const { data: commData } = await dataService.getCommissions();
      if (commData) setCommissions(commData);
    } catch (err) {
      console.error('Erro ao buscar dados do gerenciador de profissionais:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setSpecialties('');
    setBio('');
    setCommissionRate(30);
    setEditingProf(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProf(p);
    setName(p.name || '');
    setEmail(p.email || '');
    setPhone(p.phone || '');
    setSpecialties(p.specialties || '');
    setBio(p.bio || '');
    setCommissionRate(p.commission_rate || 30);
    setShowModal(true);
  };

  const handleApprovePending = async (pendingUser: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'professional',
          commission_rate: 30
        })
        .eq('id', pendingUser.id);

      if (error) throw error;

      alert(
        `Solicitação aprovada com sucesso! ${
          pendingUser.name || pendingUser.email
        } agora é Especialista no Salão.`
      );
      fetchAllData();
    } catch (err: any) {
      alert('Erro ao aprovar profissional: ' + err.message);
    }
  };

  const handleRejectPending = async (id: string) => {
    if (
      !confirm(
        'Deseja recusar esta solicitação profissional? O usuário será mantido como cliente.'
      )
    )
      return;
    try {
      await supabase.from('profiles').update({ role: 'client' }).eq('id', id);
      fetchAllData();
    } catch (err: any) {
      alert('Erro ao processar recusa: ' + err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      phone,
      specialties,
      bio,
      commission_rate: Number(commissionRate),
      role: 'professional'
    };

    if (editingProf) {
      await dataService.updateProfile(editingProf.id, payload);
    } else {
      await dataService.updateProfile(`prof-${Date.now()}`, payload);
      alert('Perfil profissional salvo.');
    }

    setShowModal(false);
    fetchAllData();
  };

  const handlePayCommission = async (commId: string) => {
    if (!confirm('Deseja confirmar a baixa e o pagamento desta comissão?')) return;
    setIsProcessingPay(commId);
    try {
      const res = await dataService.payCommission(commId);
      if (res.success) {
        alert('Comissão paga com sucesso e lançada no Fluxo de Caixa!');
        await fetchAllData();
      } else {
        alert('Não foi possível registrar o pagamento da comissão.');
      }
    } catch (err) {
      console.error('Erro ao pagar comissão:', err);
    } finally {
      setIsProcessingPay(null);
    }
  };

  // Objeto do profissional atualmente selecionado no painel de desempenho
  const currentProf = useMemo(() => {
    return (
      professionals.find(p => p.id === selectedProfId) ||
      professionals[0] ||
      null
    );
  }, [professionals, selectedProfId]);

  // Atendimentos do Profissional Selecionado
  const profAppointments = useMemo(() => {
    if (!currentProf) return [];
    return appointments.filter(
      a =>
        a.professional_id === currentProf.id ||
        a.professional?.id === currentProf.id ||
        a.professional_name?.toLowerCase() === currentProf.name?.toLowerCase()
    );
  }, [appointments, currentProf]);

  // Atendimentos Concluídos, Pendentes e Cancelados
  const concludedApps = profAppointments.filter(a => a.status === 'concluded');
  const pendingApps = profAppointments.filter(
    a => a.status === 'pending' || a.status === 'confirmed'
  );
  const cancelledApps = profAppointments.filter(a => a.status === 'cancelled');

  // Faturamento Produzido
  const totalProduced = concludedApps.reduce(
    (sum, a) => sum + Number(a.services?.price || a.price || 0),
    0
  );

  // Comissões do Profissional Selecionado
  const profCommissions = useMemo(() => {
    if (!currentProf) return [];
    return commissions.filter(c => c.professional_id === currentProf.id);
  }, [commissions, currentProf]);

  const totalCommissionsGenerated = profCommissions.reduce(
    (sum, c) => sum + Number(c.commission_amount || 0),
    0
  );
  const totalCommissionsPaid = profCommissions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);
  const totalCommissionsPending = profCommissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + Number(c.commission_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award size={20} className="text-amber-400" />
            <span>Gestão da Equipe & Comissões</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
              Painel ADM
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Desempenho individual, histórico de atendimentos e extrato de comissões.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 self-start sm:self-center"
        >
          <Plus size={15} />
          <span>Novo Profissional</span>
        </button>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-gray-950 border border-gray-800 rounded-2xl scrollbar-none">
        <button
          onClick={() => setActiveTab('ativos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ativos'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Scissors size={14} />
          <span>Equipe Ativa ({professionals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('desempenho')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'desempenho'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <TrendingUp size={14} />
          <span>Painel de Desempenho & Comissões</span>
        </button>

        <button
          onClick={() => setActiveTab('pendentes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 relative ${
            activeTab === 'pendentes'
              ? 'bg-amber-500 text-black shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <UserCheck size={14} />
          <span>Aprovações Pendentes ({pendingRequests.length})</span>
          {pendingRequests.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black animate-pulse">
              !
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 bg-gray-950 border border-gray-800 rounded-3xl">
          Sincronizando estatísticas da equipe e comissões...
        </div>
      ) : (
        <>
          {/* TAB 1: PAINEL INDIVIDUAL DE DESEMPENHO & COMISSÕES */}
          {activeTab === 'desempenho' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Seletor de Profissional */}
              <div className="p-4 bg-gray-950 border border-gray-800 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Selecione o Profissional:
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-xs">
                  <select
                    value={selectedProfId}
                    onChange={e => setSelectedProfId(e.target.value)}
                    className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-amber-400 font-bold outline-none focus:border-amber-500"
                  >
                    {professionals.map(p => (
                      <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                        {p.name} ({p.specialties || 'Especialista'}) - {p.commission_rate || 30}% Com.
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {currentProf ? (
                <>
                  {/* Resumo do Profissional Selecionado */}
                  <div className="p-5 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-amber-500/30 rounded-3xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
                          {currentProf.name?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold block">
                            Relatório de Produção & Repasses
                          </span>
                          <h3 className="text-lg font-extrabold text-white">
                            {currentProf.name}
                          </h3>
                          <p className="text-xs text-gray-400">
                            Especialidade: <span className="text-gray-200 font-medium">{currentProf.specialties || 'Geral'}</span> • Taxa de Comissão: <strong className="text-amber-400">{currentProf.commission_rate || 30}%</strong>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenEdit(currentProf)}
                        className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-xs font-bold text-gray-200 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Edit2 size={13} />
                        <span>Editar Taxa</span>
                      </button>
                    </div>

                    {/* KPIs Individuais de Produção & Comissões */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-3.5 bg-black/50 border border-gray-800 rounded-2xl space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                          Total Produzido
                        </span>
                        <p className="text-lg font-black text-amber-400 tabular-nums">
                          R$ {totalProduced.toFixed(2)}
                        </p>
                        <span className="text-[10px] text-gray-500 block">
                          {concludedApps.length} atendimento(s) concluído(s)
                        </span>
                      </div>

                      <div className="p-3.5 bg-black/50 border border-gray-800 rounded-2xl space-y-1">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                          Comissões Geradas
                        </span>
                        <p className="text-lg font-black text-white tabular-nums">
                          R$ {totalCommissionsGenerated.toFixed(2)}
                        </p>
                        <span className="text-[10px] text-amber-400 block">
                          Taxa aplicada: {currentProf.commission_rate || 30}%
                        </span>
                      </div>

                      <div className="p-3.5 bg-black/50 border border-emerald-500/30 rounded-2xl space-y-1">
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                          Comissões Pagas
                        </span>
                        <p className="text-lg font-black text-emerald-400 tabular-nums">
                          R$ {totalCommissionsPaid.toFixed(2)}
                        </p>
                        <span className="text-[10px] text-emerald-400/80 block">
                          Lançadas no Fluxo de Caixa
                        </span>
                      </div>

                      <div className="p-3.5 bg-black/50 border border-amber-500/40 rounded-2xl space-y-1">
                        <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">
                          Pendente de Repasse
                        </span>
                        <p className="text-lg font-black text-amber-400 tabular-nums">
                          R$ {totalCommissionsPending.toFixed(2)}
                        </p>
                        <span className="text-[10px] text-amber-400/80 block">
                          Aguardando pagamento ADM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Histórico Detalhado de Comissões do Profissional */}
                  <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <DollarSign size={16} className="text-amber-400" />
                        <span>Histórico Detalhado de Comissões de {currentProf.name}</span>
                      </h4>
                      <span className="text-xs text-amber-400 font-semibold">
                        {profCommissions.length} registro(s)
                      </span>
                    </div>

                    {profCommissions.length === 0 ? (
                      <div className="p-8 text-center space-y-2 bg-gray-900/60 border border-gray-800 rounded-2xl">
                        <DollarSign size={28} className="mx-auto text-gray-600" />
                        <p className="text-xs text-gray-400">
                          Nenhuma comissão registrada para este profissional até o momento.
                        </p>
                        <p className="text-[10px] text-gray-500">
                          As comissões são geradas automaticamente ao marcar um atendimento como concluído.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {profCommissions.map(comm => {
                          const isPaid = comm.status === 'paid';
                          const isReversed = comm.status === 'reversed';

                          return (
                            <div
                              key={comm.id}
                              className="p-3.5 bg-gray-900/80 border border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white">
                                    Ref. Atend. #{comm.appointment_id?.substring(0, 8)}
                                  </span>
                                  <span
                                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                      isPaid
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                        : isReversed
                                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                    }`}
                                  >
                                    {isPaid
                                      ? 'Comissão Paga'
                                      : isReversed
                                      ? 'Revertida / Cancelada'
                                      : 'Pendente de Repasse'}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-gray-400 text-[11px]">
                                  <span>
                                    Serviço: <strong className="text-gray-200">{comm.appointment?.services?.name || 'Procedimento'}</strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Valor Serviço: <strong className="text-white">R$ {Number(comm.service_amount || 0).toFixed(2)}</strong>
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Taxa Aplicada: <strong className="text-amber-400">{comm.commission_rate || 30}%</strong>
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800">
                                <div className="text-right">
                                  <span className="text-[10px] text-gray-500 block">Comissão</span>
                                  <span className="text-sm font-extrabold text-amber-400 tabular-nums">
                                    R$ {Number(comm.commission_amount || 0).toFixed(2)}
                                  </span>
                                </div>

                                {!isPaid && !isReversed && (
                                  <button
                                    disabled={isProcessingPay === comm.id}
                                    onClick={() => handlePayCommission(comm.id)}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 shrink-0"
                                  >
                                    Pagar Comissão
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Visualização Detalhada dos Atendimentos do Profissional */}
                  <div className="bg-gray-950 border border-gray-800 p-5 rounded-3xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Scissors size={16} className="text-amber-400" />
                        <span>Atendimentos Atribuídos a {currentProf.name}</span>
                      </h4>
                      <span className="text-xs text-amber-400 font-semibold">
                        {profAppointments.length} agendamento(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                      <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800">
                        <span className="text-gray-400 block text-[10px]">Concluídos:</span>
                        <strong className="text-emerald-400 text-sm">{concludedApps.length}</strong>
                      </div>
                      <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800">
                        <span className="text-gray-400 block text-[10px]">Em Aberto / Confirmados:</span>
                        <strong className="text-amber-400 text-sm">{pendingApps.length}</strong>
                      </div>
                      <div className="p-3 bg-gray-900 rounded-2xl border border-gray-800">
                        <span className="text-gray-400 block text-[10px]">Cancelados:</span>
                        <strong className="text-red-400 text-sm">{cancelledApps.length}</strong>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {profAppointments.length === 0 ? (
                        <p className="text-xs text-gray-500 italic text-center py-4">
                          Nenhum atendimento atribuído a este profissional.
                        </p>
                      ) : (
                        profAppointments.map(app => (
                          <div
                            key={app.id}
                            className="p-3.5 bg-gray-900/80 border border-gray-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-white truncate">
                                  {app.services?.name || app.service_name || 'Procedimento Estético'}
                                </h5>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    app.status === 'concluded'
                                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                      : app.status === 'confirmed'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : app.status === 'cancelled'
                                      ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                  }`}
                                >
                                  {app.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400">
                                Cliente: <strong className="text-gray-200">{app.client?.name || app.client_name || 'Visitante'}</strong> • Data: {new Date(app.start_time).toLocaleString('pt-BR')}
                              </p>
                            </div>

                            <span className="font-extrabold text-amber-400 tabular-nums shrink-0">
                              R$ {Number(app.services?.price || app.price || 0).toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 text-center bg-gray-950 border border-gray-800 rounded-3xl">
                  <p className="text-xs text-gray-400">Nenhum profissional selecionado.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SOLICITAÇÕES PENDENTES DE APROVAÇÃO */}
          {activeTab === 'pendentes' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {pendingRequests.length === 0 ? (
                <div className="p-10 text-center bg-gray-950 border border-dashed border-gray-800 rounded-3xl space-y-1">
                  <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-white">Nenhuma solicitação pendente no momento.</p>
                  <p className="text-[11px] text-gray-500">
                    Quando um novo especialista solicitar cadastro pelo aplicativo, ele aparecerá aqui para aprovação.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingRequests.map(req => (
                    <div
                      key={req.id}
                      className="bg-amber-950/20 border border-amber-500/40 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-md"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 rounded-full border border-amber-500/30">
                            Aguardando Aprovação
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {req.created_at
                              ? new Date(req.created_at).toLocaleDateString('pt-BR')
                              : 'Hoje'}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-white text-sm">
                          {req.name || 'Especialista'}
                        </h4>
                        <p className="text-xs text-amber-300/90 font-medium">
                          {req.specialties || 'Especialidade a definir'}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1.5">
                          <Mail size={12} /> {req.email}
                        </p>
                        {req.phone && (
                          <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <Phone size={12} /> {req.phone}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-amber-500/20">
                        <button
                          onClick={() => handleApprovePending(req)}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow"
                        >
                          <UserCheck size={14} /> Aprovar Profissional
                        </button>
                        <button
                          onClick={() => handleRejectPending(req.id)}
                          className="px-3 py-2 bg-gray-900 hover:bg-rose-950 text-gray-400 hover:text-rose-300 font-bold rounded-xl text-xs transition-colors border border-gray-800"
                        >
                          Recusar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFISSIONAIS ATIVOS DA EQUIPE */}
          {activeTab === 'ativos' && (
            <div className="animate-in fade-in duration-200">
              {professionals.length === 0 ? (
                <div className="p-12 text-center bg-gray-950 border border-dashed border-gray-800 rounded-3xl">
                  <p className="text-xs text-gray-500">Nenhum profissional ativo cadastrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {professionals.map(p => (
                    <div
                      key={p.id}
                      className="bg-gray-950 border border-gray-800 p-5 rounded-3xl flex flex-col justify-between group hover:border-amber-500/50 transition-colors shadow-xl"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-base">
                            {p.name?.[0]?.toUpperCase() || 'P'}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">{p.name}</h4>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                              {p.specialties || 'Especialista'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-2 text-gray-400 hover:text-amber-400 hover:bg-gray-900 rounded-xl transition-colors"
                            title="Editar Perfil / Comissão"
                          >
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 mb-4">
                        <p className="text-[11px] text-gray-400 flex items-center gap-2">
                          <Mail size={12} className="text-amber-500/80" /> {p.email}
                        </p>
                        <p className="text-[11px] text-gray-400 flex items-center gap-2">
                          <Phone size={12} className="text-amber-500/80" /> {p.phone || 'Não informado'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-800/80">
                        <span className="text-[10px] text-amber-400 font-bold px-2.5 py-1 bg-amber-500/10 rounded-xl border border-amber-500/20">
                          Comissão: {p.commission_rate || 30}%
                        </span>

                        <button
                          onClick={() => {
                            setSelectedProfId(p.id);
                            setActiveTab('desempenho');
                          }}
                          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-amber-400 border border-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <TrendingUp size={13} />
                          <span>Ver Desempenho</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL DE EDIÇÃO DE PROFISSIONAL & TAXA */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-200"
          >
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">
                {editingProf ? 'Editar Profissional & Comissão' : 'Novo Profissional'}
              </h4>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                  Nome Completo *
                </label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  type="text"
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                    E-mail de Acesso *
                  </label>
                  <input
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                    WhatsApp
                  </label>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    type="tel"
                    className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                  Especialidades (separadas por vírgula)
                </label>
                <input
                  value={specialties}
                  onChange={e => setSpecialties(e.target.value)}
                  type="text"
                  placeholder="Ex: Mechas, Corte, Escova"
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                  Biografia / Perfil Público
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-amber-400 ml-1 mb-1 block">
                  Taxa de Comissão Padrão (%)
                </label>
                <div className="relative">
                  <DollarSign
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500"
                  />
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={e => setCommissionRate(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-bold"
                    placeholder="Ex: 30"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-gray-950 text-gray-400 hover:text-white font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs shadow-lg shadow-amber-600/20"
              >
                <Check size={16} className="inline mr-1" /> Salvar Profissional
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
