import React, {useState, useEffect} from 'react';
import {User, Calendar, Clock, CheckCircle2, AlertCircle, Scissors, ArrowRight, Phone, Heart, ShoppingBag, ShieldAlert, MessageSquare, Plus} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
import {dataService} from '../../lib/data';
import {DirectChat} from './DirectChat';

interface ClientAreaProps {
  onNavigateToVitrine: () => void;
  onRequestLogin: () => void;
}

export function ClientArea({onNavigateToVitrine, onRequestLogin}: ClientAreaProps) {
  const {user, role} = useAuth();
  const [activeTab, setActiveTab] = useState<'agendamentos' | 'perfil' | 'saude' | 'historico' | 'chat'>('agendamentos');
  
  // Data states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Profile state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Medical / Allergies state
  const [allergies, setAllergies] = useState('');
  const [sensitivities, setSensitivities] = useState('');
  const [reactiveProducts, setReactiveProducts] = useState('');
  const [carePreferences, setCarePreferences] = useState('');
  const [favoriteProfs, setFavoriteProfs] = useState<string[]>([]);
  const [availableProfs, setAvailableProfs] = useState<any[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadClientData();
    }
  }, [user]);

  async function loadClientData() {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Profile
      const {data: profileData} = await dataService.getProfile(user.id);
      if (profileData) {
        setName(profileData.name || '');
        setPhone(profileData.phone || '');
        setBio(profileData.bio || '');
        setAvatarUrl(profileData.avatar_url || '');
      }

      // 2. Appointments
      const {data: appData} = await dataService.getAppointments(user.id, 'client');
      if (appData) setAppointments(appData);

      // 3. Orders / Purchases
      const {data: ordData} = await dataService.getOrders(user.id);
      if (ordData) setOrders(ordData);

      // 4. Medical Profile
      const medData = await dataService.getClientMedicalProfile(user.id);
      if (medData) {
        setAllergies(medData.allergies || '');
        setSensitivities(medData.sensitivities || '');
        setReactiveProducts(medData.reactive_products || '');
        setCarePreferences(medData.care_preferences || '');
        setFavoriteProfs(medData.favorite_professionals || []);
      }

      // 5. Available Professionals
      const profRes = await dataService.getProfiles('professional');
      if (profRes.data) setAvailableProfs(profRes.data);

    } catch (err) {
      console.error('Erro ao carregar dados do cliente:', err);
    } finally {
      setLoading(false);
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
        bio,
        avatar_url: avatarUrl,
        role: role === 'admin' ? 'admin' : 'client'
      });

      await dataService.updateClientMedicalProfile(user.id, {
        allergies,
        sensitivities,
        reactive_products: reactiveProducts,
        care_preferences: carePreferences,
        favorite_professionals: favoriteProfs
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

  const handleToggleFavoriteProf = (profName: string) => {
    if (favoriteProfs.includes(profName)) {
      setFavoriteProfs(favoriteProfs.filter(p => p !== profName));
    } else {
      setFavoriteProfs([...favoriteProfs, profName]);
    }
  };

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

  if (!user) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Área Exclusiva do Cliente</h2>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Acesse seus agendamentos, histórico de tratamentos e informações de saúde com total privacidade.
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
              <span className="text-xs text-gray-300">Cadastre suas alergias, sensibilidades e produtos reagentes para sua segurança</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <span className="text-xs text-gray-300">Converse diretamente com seus profissionais favoritos</span>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do Cliente */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-800 p-5 rounded-3xl">
        <div className="flex items-center gap-3.5">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border border-amber-500/30" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
              {name ? name[0].toUpperCase() : (user.email?.[0]?.toUpperCase() || 'C')}
            </div>
          )}
          <div>
            <span className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Área do Cliente</span>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Olá, {name || user.email?.split('@')[0] || 'Cliente'}!
            </h2>
            <p className="text-xs text-gray-400">{bio || 'Bem-vinda ao seu espaço no Salão Bela Mulher'}</p>
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

      {/* Navegação de Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-800 gap-2 pb-1">
        <button
          onClick={() => setActiveTab('agendamentos')}
          className={`pb-3 px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'agendamentos'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Meus Agendamentos ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`pb-3 px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'historico'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Histórico de Compras ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('saude')}
          className={`pb-3 px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'saude'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Ficha de Saúde & Alergias
        </button>
        <button
          onClick={() => setActiveTab('perfil')}
          className={`pb-3 px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'perfil'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Meu Perfil
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-4 text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'chat'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Chat com Profissional
        </button>
      </div>

      {/* TAB 1: MEUS AGENDAMENTOS */}
      {activeTab === 'agendamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Horários Agendados</h3>
            <span className="text-xs text-gray-400">Salão Bela Mulher</span>
          </div>

          {loading ? (
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
                  Você ainda não possui horários marcados. Escolha um serviço na nossa vitrine!
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTÓRICO DE COMPRAS */}
      {activeTab === 'historico' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Histórico de Compras na Sacola</h3>
            <span className="text-xs text-gray-400">{orders.length} pedidos</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl text-center space-y-3">
              <ShoppingBag size={32} className="mx-auto text-amber-400" />
              <p className="text-xs text-gray-400">Você ainda não realizou compras de cosméticos na sacola.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(ord => (
                <div key={ord.id} className="p-4 bg-gray-900/90 border border-gray-800 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-bold text-amber-400">#{ord.id}</span>
                    <span className="text-gray-400">{new Date(ord.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="space-y-1">
                    {ord.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-300">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="font-semibold tabular-nums">R$ {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-gray-800 flex justify-between items-center text-xs">
                    <span className="text-gray-400">Pagamento: <strong className="text-white">{ord.payment_method}</strong></span>
                    <span className="font-bold text-amber-400 text-sm">Total: R$ {ord.total_amount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FICHA DE SAÚDE & ALERGIAS */}
      {activeTab === 'saude' && (
        <form onSubmit={handleSaveProfile} className="bg-gray-900/90 border border-gray-800 p-6 rounded-3xl space-y-5">
          <div className="pb-3 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-400" />
                <span>Saúde, Alergias e Preferências de Cuidado</span>
              </h3>
              <p className="text-xs text-gray-400">Informações confidenciais visíveis apenas para os profissionais que atendem você.</p>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>Ficha médica atualizada com sucesso!</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Alergias Conhecidas</label>
              <textarea
                rows={2}
                value={allergies}
                onChange={e => setAllergies(e.target.value)}
                placeholder="Ex: Alergia a amônia, formol, esmaltes sintéticos ou fragrâncias fortes."
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Sensibilidades de Pele / Couro Cabeludo</label>
              <textarea
                rows={2}
                value={sensitivities}
                onChange={e => setSensitivities(e.target.value)}
                placeholder="Ex: Couro cabeludo sensível, vermelhidão pós-depilação, etc."
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Produtos Reagentes / Evitar</label>
              <input
                type="text"
                value={reactiveProducts}
                onChange={e => setReactiveProducts(e.target.value)}
                placeholder="Ex: Produtos com sulfato, parabenos ou corante vermelho"
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-gray-300 block mb-1 font-semibold">Preferências de Atendimento</label>
              <textarea
                rows={2}
                value={carePreferences}
                onChange={e => setCarePreferences(e.target.value)}
                placeholder="Ex: Prefiro atendimento silencioso, água em temperatura morna, café expresso sem açúcar."
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            {/* Profissionais Favoritos */}
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <label className="text-xs text-gray-300 block font-semibold">Profissionais Favoritos</label>
              <div className="grid grid-cols-2 gap-2">
                {availableProfs.map(p => {
                  const isFav = favoriteProfs.includes(p.name);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleToggleFavoriteProf(p.name)}
                      className={`p-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-colors ${
                        isFav
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-black text-gray-400 border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <span>{p.name}</span>
                      <Heart size={14} className={isFav ? 'text-amber-400 fill-amber-400' : 'text-gray-600'} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Salvando Ficha...' : 'Salvar Informações de Saúde'}
          </button>
        </form>
      )}

      {/* TAB 4: MEU PERFIL */}
      {activeTab === 'perfil' && (
        <form onSubmit={handleSaveProfile} className="bg-gray-900/90 border border-gray-800 p-6 rounded-3xl space-y-4">
          <div className="pb-3 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white">Dados Cadastrais do Cliente</h3>
          </div>

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
              <label className="text-xs text-gray-400 block mb-1">Biografia / Apresentação</label>
              <textarea
                rows={2}
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Uma breve descrição sobre você..."
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </form>
      )}

      {/* TAB 5: CHAT COM PROFISSIONAL */}
      {activeTab === 'chat' && (
        <DirectChat />
      )}
    </div>
  );
}
