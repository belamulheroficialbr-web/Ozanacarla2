import {useState} from 'react';
import {supabase, setSupabaseConfig, resetSupabaseConfig, DEFAULT_URL, DEFAULT_KEY} from '../../lib/supabase';
import {Register} from './Register';
import {useAuth} from '../../context/AuthContext';
import {Settings, RotateCcw, UserCheck, ShieldAlert, KeyRound} from 'lucide-react';

interface LoginProps {
  onClose: () => void;
  defaultMode?: 'client' | 'staff';
}

export function Login({onClose, defaultMode = 'client'}: LoginProps) {
  const {loginAsOwner, refetchRole} = useAuth();
  
  // Login target mode selection (Client vs Staff)
  const [targetMode, setTargetMode] = useState<'client' | 'staff'>(defaultMode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const [dbUrl, setDbUrl] = useState(localStorage.getItem('SUPABASE_URL') || DEFAULT_URL);
  const [dbKey, setDbKey] = useState(localStorage.getItem('SUPABASE_ANON_KEY') || DEFAULT_KEY);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Por favor, informe seu e-mail e senha.');
      return;
    }
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Authenticate with Supabase Auth
      const {data: authData, error: authError} = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('failed to fetch')) {
          setError('Não foi possível conectar ao Supabase (Failed to fetch). Verifique sua conexão.');
        } else if (
          authError.message.includes('Invalid login credentials') ||
          authError.message.includes('invalid_credentials')
        ) {
          setError('E-mail ou senha incorretos.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('E-mail cadastrado, mas ainda não confirmado no Supabase. Verifique sua caixa de entrada.');
        } else {
          setError(authError.message);
        }
        setIsLoading(false);
        return;
      }

      if (authData.user) {
        // 2. Fetch and validate true role from profiles table
        const {data: profileData} = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        const userRole = profileData?.role || 'client';

        // 3. Validate access mode restrictions
        if (targetMode === 'staff' && userRole === 'client') {
          // Block client credentials from entering Staff/Admin environment
          await supabase.auth.signOut();
          setError('Acesso Negado: Sua conta está cadastrada como Cliente. Para acessar o painel de gestão, utilize credenciais de Profissional ou Administradora.');
          setIsLoading(false);
          return;
        }

        // Login validated successfully!
        await refetchRole?.();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao conectar.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendPasswordReset(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail) {
      setError('Informe o e-mail cadastrado.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const {error: resetErr} = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
        redirectTo: window.location.origin
      });
      if (resetErr) {
        setError(resetErr.message);
      } else {
        setSuccessMsg('Link de redefinição de senha enviado para seu e-mail!');
        setTimeout(() => setShowResetPassword(false), 4000);
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao enviar e-mail de recuperação.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (dbUrl && dbKey) {
      setSupabaseConfig(dbUrl, dbKey);
    } else {
      setError('Preencha a URL e a Chave do Supabase.');
    }
  }

  function handleResetConfig() {
    resetSupabaseConfig();
  }

  if (showRegister) return <Register onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 p-4 flex flex-col justify-center items-center backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 p-6 rounded-3xl relative shadow-2xl space-y-4">
        
        {/* Header do Login */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block">Autenticação Segura</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Acesso ao Salão</h2>
          </div>
          <button
            type="button"
            onClick={() => { setShowConfig(!showConfig); setError(''); setSuccessMsg(''); }}
            className="p-2 text-gray-400 hover:text-amber-500 rounded-xl hover:bg-gray-800 transition-colors"
            title="Configurações de Conexão"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Seletor de Modo de Acesso (Cliente vs Equipe) */}
        {!showConfig && !showResetPassword && (
          <div className="grid grid-cols-2 gap-1 p-1 bg-black border border-gray-800 rounded-2xl">
            <button
              type="button"
              onClick={() => { setTargetMode('client'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                targetMode === 'client'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Área do Cliente
            </button>

            <button
              type="button"
              onClick={() => { setTargetMode('staff'); setError(''); }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                targetMode === 'staff'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Equipe / Gestão
            </button>
          </div>
        )}

        {/* Exibição de Erros e Mensagens de Sucesso */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs flex items-start gap-2">
            <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-400 shrink-0" />
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {/* FORMULÁRIO DE RECUPERAÇÃO DE SENHA */}
        {showResetPassword ? (
          <form onSubmit={handleSendPasswordReset} className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 pb-1">
              <KeyRound size={18} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Recuperar Senha</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Informe o e-mail cadastrado na sua conta para receber um link de redefinição de senha.
            </p>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">E-mail Cadastrado</label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>

            <button
              type="button"
              onClick={() => { setShowResetPassword(false); setError(''); }}
              className="w-full text-gray-400 text-xs py-1 hover:text-white"
            >
              Voltar ao Login
            </button>
          </form>
        ) : showConfig ? (
          /* FORMULÁRIO DE CONFIGURAÇÃO SUPABASE */
          <form onSubmit={handleSaveConfig} className="space-y-3">
            <p className="text-xs text-amber-400 font-semibold">Credenciais ativas do Supabase:</p>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">URL do Projeto</label>
              <input
                type="text"
                placeholder="https://xxx.supabase.co"
                value={dbUrl}
                onChange={e => setDbUrl(e.target.value)}
                className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-700 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Chave Anon / Publishable</label>
              <textarea
                rows={3}
                placeholder="sb_publishable_... ou eyJ..."
                value={dbKey}
                onChange={e => setDbKey(e.target.value)}
                className="w-full p-2.5 bg-black rounded-xl text-white text-xs border border-gray-700 font-mono"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 py-2.5 rounded-xl font-bold text-white text-xs transition-colors"
            >
              Salvar e Recarregar
            </button>
            <button
              type="button"
              onClick={handleResetConfig}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-gray-400 hover:text-white text-xs border border-gray-800 rounded-xl"
            >
              <RotateCcw size={14} /> Restaurar Padrões
            </button>
            <button
              type="button"
              onClick={() => { setShowConfig(false); setError(''); }}
              className="w-full text-gray-400 text-xs py-1 hover:text-white"
            >
              Voltar ao Login
            </button>
          </form>
        ) : (
          /* FORMULÁRIO DE LOGIN PADRÃO */
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-xs text-gray-400 block mb-1">E-mail Cadastrado</label>
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-400">Senha</label>
                <button
                  type="button"
                  onClick={() => { setShowResetPassword(true); setResetEmail(email); setError(''); }}
                  className="text-[11px] text-amber-500 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-black rounded-xl text-white text-xs border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-500 p-3 rounded-xl font-bold text-white text-xs transition-colors disabled:opacity-50 shadow-lg shadow-amber-600/20"
            >
              {isLoading ? 'Autenticando...' : `Entrar como ${targetMode === 'client' ? 'Cliente' : 'Equipe do Salão'}`}
            </button>

            {targetMode === 'staff' && (
              <div className="pt-2 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    loginAsOwner?.();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/50 rounded-xl font-semibold text-amber-300 text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  ⭐ Entrar Direto como Administradora (Ozana)
                </button>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-1 text-center">
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                className="text-amber-500 text-xs hover:underline font-medium"
              >
                Não tem conta? Cadastre-se no aplicativo
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 text-xs hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
