import React, {useState} from 'react';
import {supabase} from '../../lib/supabase';
import {useAuth, OWNER_ADMIN_ID} from '../../context/AuthContext';
import {ShieldCheck, Lock, Mail, KeyRound, ShieldAlert, CheckCircle2, ArrowRight, ChevronLeft} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({isOpen, onClose, onSuccess}: AdminLoginModalProps) {
  const {refetchRole} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  if (!isOpen) return null;

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, informe o e-mail e a senha administrativa.');
      return;
    }
    resetMessages();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Authenticate with Supabase Auth
      const {data, error: authError} = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('failed to fetch')) {
          setError('Erro de conexão (Failed to fetch): Não foi possível conectar ao Supabase. Verifique sua conexão com a internet ou as credenciais de rede.');
        } else if (authError.message.includes('Invalid login credentials') || authError.message.includes('invalid_credentials')) {
          setError('E-mail ou senha administrativa incorretos.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        const userId = data.user.id;
        const isOwner = cleanEmail === 'belamulheroficial.br@gmail.com' || cleanEmail === 'oficial.belamulher@gmail.com' || userId === OWNER_ADMIN_ID;

        // 2. Fetch or ensure admin role in profiles table
        const {data: profileData} = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle();

        const userRole = profileData?.role || (isOwner ? 'admin' : 'client');

        if (userRole !== 'admin' && !isOwner) {
          await supabase.auth.signOut();
          setError('Acesso Negado: Esta conta não possui privilégios administrativos.');
          setLoading(false);
          return;
        }

        // Ensure role is admin in DB if owner
        if (isOwner && userRole !== 'admin') {
          await supabase.from('profiles').upsert({
            id: userId,
            email: cleanEmail,
            role: 'admin',
            name: 'Ozana - Bela Mulher'
          });
        }

        await refetchRole?.();
        setSuccessMsg('Autenticação administrativa bem-sucedida! Entrando no painel...');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('failed to fetch')) {
        setError('Erro de conexão (Failed to fetch): Verifique sua conexão de rede.');
      } else {
        setError(err?.message || 'Erro ao conectar com o servidor de autenticação.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail) {
      setError('Informe o e-mail administrativo.');
      return;
    }
    resetMessages();
    setLoading(true);

    try {
      const {error: resetErr} = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: window.location.origin
      });

      if (resetErr) {
        if (resetErr.message.toLowerCase().includes('failed to fetch')) {
          setError('Erro de conexão (Failed to fetch): Não foi possível conectar ao Supabase.');
        } else {
          setError(resetErr.message);
        }
      } else {
        setSuccessMsg('Link de redefinição enviado para o e-mail administrativo!');
        setTimeout(() => setShowReset(false), 3500);
      }
    } catch (err: any) {
      if (err?.message?.toLowerCase().includes('failed to fetch')) {
        setError('Erro de conexão (Failed to fetch): Verifique sua conexão de rede.');
      } else {
        setError(err?.message || 'Erro ao enviar e-mail de recuperação.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={() => { if (!loading) onClose(); }}
    >
      <div 
        className="relative w-full max-w-md bg-gray-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Painel Administrativo</h2>
              <p className="text-xs text-amber-400 font-medium">Acesso Restrito & Seguro</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Notifications */}
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

        {/* Reset Password Form vs Login Form */}
        {showReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 pb-1">
              <KeyRound size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Recuperar Senha ADM</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Informe o e-mail administrativo para receber as instruções de redefinição de senha.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">E-mail Administrativo</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="belamulheroficial.br@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
            </button>

            <button
              type="button"
              onClick={() => { setShowReset(false); resetMessages(); }}
              className="w-full py-2 text-xs text-gray-400 hover:text-white flex items-center justify-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Voltar ao Login ADM</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">E-mail Administrativo</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="belamulheroficial.br@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-medium text-gray-300">Senha</label>
                <button
                  type="button"
                  onClick={() => { setShowReset(true); setResetEmail(email); resetMessages(); }}
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
                  className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {loading ? 'Autenticando ADM...' : error.includes('Failed to fetch') ? 'Tentar Conexão Novamente' : (
                <>
                  <span>Entrar no Painel Administrativo</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-gray-800">
          <p className="text-[10px] text-gray-500">
            Ambiente exclusivo para gestão • Bela Mulher
          </p>
        </div>

      </div>
    </div>
  );
}
