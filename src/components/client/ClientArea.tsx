import {useState, useEffect} from 'react';
import {User, Calendar, Clock, Sparkles, CheckCircle2, AlertCircle, Scissors, ArrowRight, Phone, Heart} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
import {dataService} from '../../lib/data';
import {supabase} from '../../lib/supabase';

interface ClientAreaProps {
  onNavigateToVitrine: () => void;
  onRequestLogin: () => void;
}

export function ClientArea({onNavigateToVitrine, onRequestLogin}: ClientAreaProps) {
  const {user, role} = useAuth();
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'perfil'>('agendamentos');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  
  // Profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadClientData();
    }
  }, [user]);

  async function loadClientData() {
    if (!user) return;
    setLoadingAppointments(true);

    try {
      // 1. Load Profile
      const {data: profileData} = await dataService.getProfile(user.id);
      if (profileData) {
        setName(profileData.name || '');
        setPhone(profileData.phone || '');
        setNotes(profileData.notes || '');
      }

      // 2. Load Appointments for this specific client
      const {data: appData} = await dataService.getAppointments(user.id, 'client');
      if (appData) {
        setAppointments(appData);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do cliente:', err);
    } finally {
      setLoadingAppointments(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await dataService.updateProfile(user.id, {
        name,
        phone,
        notes,
        role: role === 'admin' ? 'admin' : 'client'
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
      alert('Não foi possível salvar os dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'Horário a combinar';
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

  // Se o cliente não estiver logado, exibe tela de boas-vindas com convite para login
  if (!user) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Área Exclusiva do Cliente</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Acesse seus agendamentos, histórico de tratamentos e informações pessoais com total privacidade.
          </p>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">Acompanhe o status e confirmações dos seus horários em tempo real</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">Salve suas preferências de cuidados com cabelo, unhas e estética</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">Receba lembretes e avisos do salão Bela Mulher</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onRequestLogin}
              className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
            >
              <span>Entrar ou Cadastrar-se</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Atalho para ver a vitrine */}
        <div className="text-center">
          <button
            onClick={onNavigateToVitrine}
            className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
          >
            Ainda não tem conta? Conheça os nossos serviços na Vitrine →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header do Cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
            {name ? name[0].toUpperCase() : (user.email?.[0]?.toUpperCase() || 'C')}
          </div>
          <div>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Área do Cliente</span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Olá, {name || user.email?.split('@')[0] || 'Cliente'}!
            </h2>
            <p className="text-xs text-gray-400">Bem-vinda ao seu espaço no Salão Bela Mulher</p>
          </div>
        </div>

        <button
          onClick={onNavigateToVitrine}
          className="self-start sm:self-center px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Scissors size={14} />
          <span>Ver Vitrine / Agendar</span>
        </button>
      </div>

      {/* Tabs Verticais / Segmentadas da Área do Cliente */}
      <div className="flex border-b border-gray-800 gap-2">
        <button
          onClick={() => setActiveTab('agendamentos')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'agendamentos'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Meus Agendamentos ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('perfil')}
          className={`pb-3 px-4 text-xs font-bold transition-all relative ${
            activeTab === 'perfil'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Meus Dados Pessoais
        </button>
      </div>

      {/* Conteúdo: Meus Agendamentos */}
      {activeTab === 'agendamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Horários Marcados</h3>
            <span className="text-xs text-gray-400">Salão Bela Mulher</span>
          </div>

          {loadingAppointments ? (
            <div className="p-8 text-center text-xs text-gray-500 bg-gray-900 border border-gray-800 rounded-2xl">
              Carregando seus agendamentos...
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Calendar size={24} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Nenhum agendamento ativo</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Você ainda não agendou nenhum procedimento no salão. Escolha um serviço na nossa vitrine!
                </p>
              </div>
              <button
                onClick={onNavigateToVitrine}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl text-xs transition-colors"
              >
                <span>Agendar um Horário</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map(app => (
                <div
                  key={app.id || Math.random()}
                  className="bg-gray-900/90 border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">
                        {app.services?.name || app.service_name || 'Serviço Estético'}
                      </h4>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        app.status === 'confirmed'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {app.status === 'confirmed' ? 'Confirmado' : 'Aguardando Confirmação'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-400" />
                      <span>{formatDateTime(app.start_time)}</span>
                      {app.professional?.name && (
                        <span>• Profissional: <strong className="text-gray-300">{app.professional.name}</strong></span>
                      )}
                    </p>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs text-amber-400 font-medium">Bela Mulher</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo: Meus Dados Pessoais */}
      {activeTab === 'perfil' && (
        <form onSubmit={handleSaveProfile} className="bg-gray-900/90 border border-gray-800 p-6 rounded-3xl space-y-4">
          <div className="pb-3 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white">Dados do Cliente</h3>
            <p className="text-xs text-gray-400">Mantenha seus dados atualizados para contato e histórico de atendimento.</p>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Dados atualizados com sucesso!</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">E-mail Cadastrado</label>
              <input
                type="text"
                disabled
                value={user.email || ''}
                className="w-full p-3 bg-black/60 rounded-xl text-gray-400 text-xs border border-gray-800 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">WhatsApp / Telefone</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Preferências de Cuidado & Observações</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Preferência por esmaltes nude, alergia a determinado cosmético, etc."
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? 'Salvando...' : 'Salvar Meus Dados'}
          </button>
        </form>
      )}
    </div>
  );
}
