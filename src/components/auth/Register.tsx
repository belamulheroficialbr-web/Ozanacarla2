import {useState} from 'react';
import {supabase} from '../../lib/supabase';

export function Register({onClose}: {onClose: () => void}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleRegister() {
    const {error} = await supabase.auth.signUp({email, password});
    if (error) setError(error.message);
    else onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black p-6 flex flex-col justify-center gap-4">
      <h2 className="text-2xl font-bold text-amber-500">Cadastro</h2>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="p-3 bg-gray-900 rounded-lg text-white" />
      <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="p-3 bg-gray-900 rounded-lg text-white" />
      <button onClick={handleRegister} className="bg-amber-600 p-3 rounded-xl font-bold">Cadastrar</button>
      <button onClick={onClose} className="text-gray-400">Cancelar</button>
    </div>
  );
}
