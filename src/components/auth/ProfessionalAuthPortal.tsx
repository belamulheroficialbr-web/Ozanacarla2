import React, {useState, useEffect} from 'react';
import {supabase} from '../../lib/supabase';
import {useAuth} from '../../context/AuthContext';
import {
  Briefcase,
  Lock,
  Mail,
  User,
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  CheckCircle2,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';

interface ProfessionalAuthPortalProps {
  onSuccess?: () => void;
  onBackToHome?: () => void;
}

export function ProfessionalAuthPortal({onSuccess, onBackToHome}: ProfessionalAuthPortalProps) {
  const {refetchRole} = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPendingNotice, setIsPendingNotice] = useState(false);
  const [loading, setLoading] = useState(false);

  // Portal Customization Settings
  const [portalConfig, setPortalConfig] = useState({
    title: 'Portal da Especialista & Profissional',
    subtitle: 'Ambiente exclusivo para gestão de agenda, atendimentos e comissões da equipe Bela Mulher.',
    bgImage: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200'
  });

  useEffect(() => {
    const saved = localStorage.getItem('bela_mulher_custom_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.profPortalTitle) {
          setPortalConfig({
            title: parsed.profPortalTitle || 'Portal da Especialista & Profissional',
            subtitle: parsed.profPortalSubtitle || 'Ambiente exclusivo da equipe.',
            bgImage: parsed.profPortalBg || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200'
          });
        }
      } catch (e) {}
    }
  }, []);

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
    setIsPendingNotice(false);
  };

  // 1. PROFESSIONAL LOGIN HANDLER
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, informe seu e-mail e senha.');
      return;
    }
    resetMessages();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Authenticate with Supabase Auth
      const {data, error: authError} = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha de profissional incorretos.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Query user's role from profiles table
        const {data: profileData} = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();

        const role = profileData?.role || 'client';

        if (role === 'pending_professional') {
          // Block login with pending notice
          await supabase.auth.signOut();
          setIsPendingNotice(true);
          setError('Sua solicitação de cadastro profissional ainda está em análise pela administração do Salão Bela Mulher. Aguarde a aprovação para liberar o acesso.');
          setLoading(false);
          return;
        }

        if (role !== 'professional' && role !== 'admin') {
          // User is registered as client only
          await supabase.auth.signOut();
          setError('Acesso Negado: Esta conta está cadastrada como Cliente. Para acessar a Área do Profissional, faça uma solicitação de cadastro profissional abaixo.');
          setLoading(false);
          return;
        }

        // Professional or Admin access granted!
        await refetchRole?.();
        setSuccessMsg('Acesso autorizado! Carregando painel do especialista...');
        setTimeout(() => {
          onSuccess?.();
        }, 800);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao realizar autenticação de profissional.');
    } finally {
      setLoading(false);
    }
  }

  // 2. PROFESSIONAL REGISTRATION HANDLER (PENDING ADMIN APPROVAL)
  async function handleRegisterRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve possuir no mínimo 6 caracteres.');
      return;
    }

    resetMessages();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // Sign up with Supabase Auth
      const {data, error: authError} = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name,
            phone,
            specialty,
            bio
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // Create profile in DB with role 'pending_professional'
        // STRICT RULE: DOES NOT AUTO-GRANT PROFESSIONAL ROLE!
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          email: cleanEmail,
          phone,
          specialties: specialty,
          bio,
          role: 'pending_professional'
        });

        // Sign out to prevent unapproved access
        await supabase.auth.signOut();

        setIsPendingNotice(true);
        setSuccessMsg('Solicitação enviada com sucesso! Seu perfil aguarda aprovação da administração do salão.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar solicitação de cadastro profissional.');
    } finally {
      setLoading(false);
    }
  }

  // 3. RESET PASSWORD HANDLER
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Informe seu e-mail cadastrado.');
      return;
    }
    resetMessages();
    setLoading(true);

    try {
      const {error: resetErr} = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: window.location.origin
      });

      if (resetErr) {
        setError(resetErr.message);
      } else {
        setSuccessMsg('Link de redefinição de senha enviado ao seu e-mail!');
        setTimeout(() => setTab('login'), 3500);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao solicitar redefinição.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-black text-gray-100 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Background Image Hero Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-xs scale-105 transition-all duration-700 pointer-events-none"
        style={{backgroundImage: `url(${portalConfig.bgImage})`}}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60 pointer-events-none" />

      {/* Main Glassmorphism Portal Card */}
      <div className="relative z-10 w-full max-w-md bg-gray-950/90 border border-amber-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 backdrop-blur-md">
        
        {/* Top Branding Header */}
        <div className="text-center space-y-2">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900/80 hover:bg-gray-800 border border-gray-800 rounded-full text-[11px] text-gray-400 hover:text-amber-400 transition-colors mb-2"
            >
              <ChevronLeft size={14} />
              <span>Voltar ao Salão Público</span>
            </button>
          )}

          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Award size={28} />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {portalConfig.title}
          </h1>

          <p className="text-xs text-gray-300 max-w-xs mx-auto leading-relaxed">
            {portalConfig.subtitle}
          </p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-black/80 border border-gray-800 rounded-2xl">
          <button
            type="button"
            onClick={() => { setTab('login'); resetMessages(); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'login' || tab === 'reset'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); resetMessages(); }}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'register'
                ? 'bg-amber-500 text-black shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Solicitar Cadastro
          </button>
        </div>

        {/* Pending Notice Card */}
        {isPendingNotice && (
          <div className="p-4 bg-amber-950/60 border border-amber-500/50 rounded-2xl space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Clock size={18} />
              <span>Aguardando Liberação do ADM</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed">
              As contas profissionais no Bela Mulher exigem autorização da equipe administrativa para assegurar a qualidade dos atendimentos.
            </p>
          </div>
        )}

        {/* Alert Notifications */}
        {error && !isPendingNotice && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-2xl text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <ShieldAlert size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <p className="font-medium leading-relaxed">{successMsg}</p>
          </div>
        )}

        {/* 1. PROFESSIONAL LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">E-mail de Acesso Profissional</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="profissional@belamulher.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-gray-300">Senha</label>
                <button
                  type="button"
                  onClick={() => { setTab('reset'); resetMessages(); }}
                  className="text-[11px] text-amber-400 hover:underline font-medium"
                >
                  Esqueceu minha senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? 'Acessando...' : (
                <>
                  <span>Entrar no Painel do Profissional</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setTab('register'); resetMessages(); }}
                className="text-xs text-amber-400 hover:underline font-medium"
              >
                É especialista e quer trabalhar no salão? Solicite seu cadastro
              </button>
            </div>
          </form>
        )}

        {/* 2. PROFESSIONAL REGISTRATION REQUEST FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterRequest} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Seu Nome Completo"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">E-mail Profissional</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full p-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full p-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Especialidade Principal</label>
              <input
                type="text"
                value={specialty}
                onChange={e => setSpecialty(e.target.value)}
                placeholder="Ex: Cabeleireira, Esteticista, Manicure, Colorista"
                className="w-full p-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">Crie uma Senha</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full p-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-300 mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full p-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="p-2.5 bg-amber-950/30 border border-amber-500/20 rounded-xl">
              <p className="text-[10px] text-amber-300/90 leading-relaxed font-medium">
                ⚠️ <strong>Atenção:</strong> O cadastro profissional requer aprovação da administração. Você receberá o acesso ao painel após a liberação.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? 'Enviando Solicitação...' : (
                <>
                  <Award size={16} />
                  <span>Enviar Solicitação de Profissional</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setTab('login'); resetMessages(); }}
                className="text-xs text-gray-400 hover:text-white"
              >
                Já possui cadastro aprovado? Clique para entrar
              </button>
            </div>
          </form>
        )}

        {/* 3. RESET PASSWORD FORM */}
        {tab === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <KeyRound size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Recuperar Senha Profissional</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Informe seu e-mail de acesso. Enviaremos as instruções de redefinição de senha para sua caixa de entrada.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">E-mail Cadastrado</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="profissional@belamulher.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50 active:scale-98"
            >
              {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setTab('login'); resetMessages(); }}
                className="text-xs text-gray-400 hover:text-white"
              >
                Voltar à tela de Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
