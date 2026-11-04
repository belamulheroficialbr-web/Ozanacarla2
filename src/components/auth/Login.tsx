import {useState} from 'react';
import {supabase} from '../../lib/supabase';
import {Register} from './Register';

export function Login({onClose}: {onClose: () => void}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  async function handleLogin() {
    const {error} = await supabase.auth.signInWithPassword({email, password});
    if (error) setError(error.message);
    else onClose();
  }

  if (showRegister) return <Register onClose={onClose} />;

  return (
    <div className="fixed inset-0 z-50 bg-black p-6 flex flex-col justify-center gap-4">
      <h2 className="text-2xl font-bold text-amber-500">Login</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="p-3 bg-gray-900 rounded-lg text-white" />
      <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="p-3 bg-gray-900 rounded-lg text-white" />
      <button onClick={handleLogin} className="bg-amber-600 p-3 rounded-xl font-bold">Entrar</button>
      <button onClick={() => setShowRegister(true)} className="text-amber-500 text-sm">Não tem conta? Cadastre-se</button>
      <button onClick={onClose} className="text-gray-400">Cancelar</button>
    </div>
  );
}
