import {useState, useEffect} from 'react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';

export function ProfileEditor() {
  const {user} = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (user) {
      dataService.getProfile(user.id).then(({data}) => {
        if (data) {
          setProfile(data);
          setName(data.name || '');
        }
      });
    }
  }, [user]);

  async function handleSave() {
    if (user) {
      await dataService.updateProfile(user.id, {name});
      alert('Perfil atualizado!');
    }
  }

  return (
    <div className="space-y-4 bg-gray-900 p-6 rounded-2xl">
      <h3 className="text-lg font-bold text-amber-500">Meu Perfil</h3>
      <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-gray-800 rounded-lg text-white" placeholder="Nome" />
      <button onClick={handleSave} className="w-full bg-amber-600 p-3 rounded-xl font-bold">Salvar</button>
    </div>
  );
}
