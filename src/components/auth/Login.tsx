import {useState} from 'react';
import {supabase, setSupabaseConfig, resetSupabaseConfig, DEFAULT_URL, DEFAULT_KEY} from '../../lib/supabase';
import {Register} from './Register';
import {useAuth} from '../../context/AuthContext';
import {Settings, RotateCcw} from 'lucide-react';

export function Login({onClose}: {onClose: () => void}) {
  const {loginAsOwner} = useAuth();
  const [email, setEmail] = useState('belamulheroficial.br@gmail.com');
  const [password, setPassword] = useState('Bela308294De');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('SUPABASE_URL') || DEFAULT_URL);
  const [dbKey, setDbKey] = useState(localStorage.getItem('SUPABASE_ANON_KEY') || DEFAULT_KEY);

  async function handleLogin(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Por favor, informe seu e-mail e senha.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const {error: authError} = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) {
        if (authError.message.toLowerCase().includes('failed to fetch')) {
          setError('Não foi possível conectar ao Supabase (Failed to fetch). Verifique a chave ou sua conexão de internet.');
        } else if (
          authError.message.includes('Invalid login credentials') ||
          authError.message.includes('invalid_credentials')
        ) {
          // If the user hasn't created the user in this specific Supabase project yet, try to auto-create
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
          });

          if (!signUpError && signUpData.user) {
            // Signed up successfully! Try signing in again or notify
            if (signUpData.session) {
              onClose();
              return;
            } else {
              setError('Conta criada com sucesso! Se necessário, confirme o link enviado para seu e-mail ou tente entrar novamente.');
            }
          } else if (signUpError) {
            setError('E-mail ou senha incorretos.');
          }
        } else if (authError.message.includes('Email not confirmed')) {
          setError('E-mail cadastrado, mas ainda não confirmado no Supabase. Verifique sua caixa de entrada.');
        } else {
          setError(authError.message);
        }
      } else {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Erro inesperado ao conectar.');
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
    <div className="fixed inset-0 z-50 bg-black/90 p-4 flex flex-col justify-center items-center backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 p-6 rounded-2xl relative shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-500">Login</h2>
          <button
            type="button"
            onClick={() => { setShowConfig(!showConfig); setError(''); }}
            className="p-1 text-gray-400 hover:text-amber-500 transition-colors"
            title="Configurações de Conexão"
          >
            <Settings size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-950/70 border border-red-800/80 p-3 rounded-xl text-red-200 text-xs">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {showConfig ? (
          <form onSubmit={handleSaveConfig} className="space-y-3">
            <p className="text-xs text-amber-400">Credenciais ativas do projeto Supabase:</p>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">URL do Projeto</label>
              <input
                type="text"
                placeholder="https://xxx.supabase.co"
                value={dbUrl}
                onChange={e => setDbUrl(e.target.value)}
                className="w-full p-2.5 bg-black rounded-lg text-white text-xs border border-gray-700 font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Chave Anon / Publishable</label>
              <textarea
                rows={3}
                placeholder="sb_publishable_... ou eyJ..."
                value={dbKey}
                onChange={e => setDbKey(e.target.value)}
                className="w-full p-2.5 bg-black rounded-lg text-white text-xs border border-gray-700 font-mono"
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
              className="w-full text-gray-400 text-xs py-1"
            >
              Voltar ao Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">E-mail</label>
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 bg-black rounded-lg text-white border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Senha</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-black rounded-lg text-white border border-gray-700 focus:border-amber-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-500 p-3 rounded-xl font-bold text-white transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Conectando...' : 'Entrar'}
            </button>

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

            <button
              type="button"
              onClick={() => setShowRegister(true)}
              className="w-full text-amber-500 text-sm text-center block hover:underline"
            >
              Não tem conta? Cadastre-se
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-gray-400 text-sm text-center block"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
