import {useState} from 'react';
import {supabase, setSupabaseConfig} from '../../lib/supabase';
import {Register} from './Register';
import {Settings} from 'lucide-react';

export function Login({onClose}: {onClose: () => void}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  const [dbUrl, setDbUrl] = useState(localStorage.getItem('SUPABASE_URL') || '');
  const [dbKey, setDbKey] = useState(localStorage.getItem('SUPABASE_ANON_KEY') || '');

  async function handleLogin() {
    setError('');
    const {error} = await supabase.auth.signInWithPassword({email, password});
    if (error) {
      if (error.message.includes('Failed to fetch')) {
        setError('Erro de conexão com o Supabase. Configure sua URL e Chave abaixo.');
        setShowConfig(true);
      } else {
        setError(error.message);
      }
    } else {
      onClose();
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

  if (showRegister) return <Register onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 p-6 flex flex-col justify-center items-center gap-4">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 p-6 rounded-2xl relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-amber-500">Login</h2>
          <button onClick={() => setShowConfig(!showConfig)} className="text-gray-400 hover:text-amber-500" title="Configurar Supabase">
            <Settings size={20} />
          </button>
        </div>

        {error && <p className="text-red-400 text-sm mb-4 bg-red-950/50 p-2 rounded">{error}</p>}

        {showConfig ? (
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <p className="text-xs text-amber-400">Insira as credenciais do seu projeto Supabase (Project URL e anon public key):</p>
            <input type="text" placeholder="Supabase URL (https://xxx.supabase.co)" value={dbUrl} onChange={e => setDbUrl(e.target.value)} className="w-full p-3 bg-black rounded-lg text-white text-xs border border-gray-700" />
            <input type="text" placeholder="Supabase Anon Key" value={dbKey} onChange={e => setDbKey(e.target.value)} className="w-full p-3 bg-black rounded-lg text-white text-xs border border-gray-700" />
            <button type="submit" className="w-full bg-amber-600 p-3 rounded-xl font-bold text-white text-sm">Salvar e Conectar</button>
            <button type="button" onClick={() => setShowConfig(false)} className="w-full text-gray-400 text-xs mt-2">Voltar ao Login</button>
          </form>
        ) : (
          <div className="space-y-4">
            <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-black rounded-lg text-white border border-gray-700" />
            <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-black rounded-lg text-white border border-gray-700" />
            <button onClick={handleLogin} className="w-full bg-amber-600 p-3 rounded-xl font-bold text-white">Entrar</button>
            <button onClick={() => setShowRegister(true)} className="w-full text-amber-500 text-sm text-center block">Não tem conta? Cadastre-se</button>
            <button onClick={onClose} className="w-full text-gray-400 text-sm text-center block mt-2">Cancelar</button>
          </div>
        )}
      </div>
    </div>
  );
}
