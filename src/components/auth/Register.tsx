import {useState} from 'react';
import {supabase} from '../../lib/supabase';
import {X, User, Mail, Phone, Lock, Sparkles} from 'lucide-react';

export function Register({onClose}: {onClose: () => void}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Por favor, preencha os campos obrigatórios.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const {data, error: authError} = await supabase.auth.signUp({
        email,
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
        // Create initial profile in the database
        const {error: profileError} = await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          email,
          phone,
          role: 'client'
        });
        
        if (profileError) console.error('Erro ao criar perfil:', profileError);
      }

      alert('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar a conta.');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 p-4 flex flex-col justify-center items-center backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-800 p-6 rounded-3xl relative shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-gray-800">
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest block">Novo Cadastro</span>
            <h2 className="text-xl font-bold text-white tracking-tight">Criar Minha Conta</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-red-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-500" size={16} />
            <input
              required
              type="text"
              placeholder="Nome Completo"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" size={16} />
            <input
              required
              type="email"
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-500" size={16} />
            <input
              type="tel"
              placeholder="WhatsApp / Telefone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" size={16} />
            <input
              required
              type="password"
              placeholder="Crie uma senha forte"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          <p className="text-[10px] text-gray-500 px-1 italic">
            * Ao se cadastrar, você concorda com nossas políticas de privacidade e agendamento.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Cadastrando...' : (
              <>
                <Sparkles size={16} />
                <span>Criar Minha Conta</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-gray-500 hover:text-gray-300 font-medium transition-colors"
          >
            Já tenho conta, quero entrar
          </button>
        </form>
      </div>
    </div>
  );
}
