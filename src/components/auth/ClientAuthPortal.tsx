import React, {useState, useEffect} from 'react';
import {supabase} from '../../lib/supabase';
import {useAuth} from '../../context/AuthContext';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  ShieldAlert,
  ChevronLeft,
  CheckCircle2,
  Heart
} from 'lucide-react';

interface ClientAuthPortalProps {
  onSuccess?: () => void;
  onBackToHome?: () => void;
}

export function ClientAuthPortal({onSuccess, onBackToHome}: ClientAuthPortalProps) {
  const {refetchRole} = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Portal Customization Settings
  const [portalConfig, setPortalConfig] = useState({
    title: 'Espaço VIP da Cliente',
    subtitle: 'Acesse seu programa de fidelidade, agendamentos, histórico e sacola de compras com total privacidade.',
    bgImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200'
  });

  useEffect(() => {
    const saved = localStorage.getItem('bela_mulher_custom_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.clientPortalTitle) {
          setPortalConfig({
            title: parsed.clientPortalTitle || 'Espaço VIP da Cliente',
            subtitle: parsed.clientPortalSubtitle || 'Acesse seu programa de fidelidade e agendamentos.',
            bgImage: parsed.clientPortalBg || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200'
          });
        }
      } catch (e) {}
    }
  }, []);

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  // 1. LOGIN HANDLER
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
      const {data, error: authError} = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('E-mail ou senha incorretos. Verifique suas credenciais.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        // Ensure profile exists in profiles table
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
          role: 'client'
        });

        await refetchRole?.();
        setSuccessMsg('Autenticação realizada com sucesso! Redirecionando...');
        setTimeout(() => {
          onSuccess?.();
        }, 800);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao realizar login.');
    } finally {
      setLoading(false);
    }
  }

  // 2. REGISTER HANDLER
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Digite a mesma senha nos dois campos.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
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
            phone
          }
        }
      });

      if (authError) throw authError;

      if (data.user) {
        // Create profile in DB with role 'client'
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          email: cleanEmail,
          phone,
          role: 'client'
        });

        // Refetch role and log in
        await refetchRole?.();
        setSuccessMsg('Seu cadastro de cliente foi criado com sucesso! Seja bem-vinda!');
        setTimeout(() => {
          onSuccess?.();
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar cadastro de cliente.');
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
        setSuccessMsg('Enviamos um e-mail com instruções para você redefinir sua senha.');
        setTimeout(() => setTab('login'), 3500);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar e-mail de recuperação.');
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
              <span>Voltar ao Início</span>
            </button>
          )}

          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/30 tracking-tighter border border-amber-300/50">
            BM
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
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
            Cadastrar
          </button>
        </div>

        {/* Alert Notifications */}
        {error && (
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

        {/* 1. LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">E-mail Cadastrado</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
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
                  <span>Acessar Minha Conta</span>
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
                Ainda não tem conta? Criar cadastro VIP em 1 minuto
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTER FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
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

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">E-mail Principal</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">WhatsApp / Celular</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? 'Cadastrando...' : (
                <>
                  <Sparkles size={16} />
                  <span>Criar Meu Cadastro VIP</span>
                </>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => { setTab('login'); resetMessages(); }}
                className="text-xs text-gray-400 hover:text-white"
              >
                Já tem conta? Clique para fazer login
              </button>
            </div>
          </form>
        )}

        {/* 3. RESET PASSWORD FORM */}
        {tab === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <KeyRound size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Recuperar Acesso</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Informe seu e-mail de cadastro. Enviaremos um link direto para a criação de uma nova senha.
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
                  placeholder="seuemail@exemplo.com"
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
