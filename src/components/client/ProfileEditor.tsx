import React, { useState, useEffect } from 'react';
import { dataService } from '../../lib/data';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, Upload, Check, ShieldAlert, Heart } from 'lucide-react';
import { uploadMedia } from '../../lib/storage';

export function ProfileEditor() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Medical / Care Preferences
  const [allergies, setAllergies] = useState('');
  const [sensitivities, setSensitivities] = useState('');
  const [carePreferences, setCarePreferences] = useState('');
  const [favoriteProfs, setFavoriteProfs] = useState<string[]>([]);
  const [availableProfs, setAvailableProfs] = useState<any[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  async function loadProfileData() {
    if (!user) return;
    const { data: profileData } = await dataService.getProfile(user.id);
    if (profileData) {
      setName(profileData.name || '');
      setPhone(profileData.phone || '');
      setBio(profileData.bio || '');
      setAvatarUrl(profileData.avatar_url || '');
    }

    const medData = await dataService.getClientMedicalProfile(user.id);
    if (medData) {
      setAllergies(medData.allergies || '');
      setSensitivities(medData.sensitivities || '');
      setCarePreferences(medData.care_preferences || '');
      setFavoriteProfs(medData.favorite_professionals || []);
    }

    const profRes = await dataService.getProfiles('professional');
    if (profRes.data) setAvailableProfs(profRes.data);
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const url = await uploadMedia('avatars', `${user.id}_${Date.now()}.jpg`, file);
      setAvatarUrl(url);
      await dataService.updateProfile(user.id, { avatar_url: url });
    } catch (err) {
      console.error('Erro ao enviar avatar:', err);
    }
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await dataService.updateProfile(user.id, {
        name,
        phone,
        bio,
        avatar_url: avatarUrl
      });

      await dataService.updateClientMedicalProfile(user.id, {
        allergies,
        sensitivities,
        care_preferences: carePreferences,
        favorite_professionals: favoriteProfs
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    } finally {
      setIsSaving(false);
    }
  }

  const handleToggleFavoriteProf = (profName: string) => {
    if (favoriteProfs.includes(profName)) {
      setFavoriteProfs(favoriteProfs.filter(p => p !== profName));
    } else {
      setFavoriteProfs([...favoriteProfs, profName]);
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSave} className="space-y-5 bg-gray-950 border border-gray-800 p-6 rounded-3xl shadow-xl">
      <div className="pb-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-bold text-amber-500 flex items-center gap-2">
          <User size={18} />
          <span>Meu Perfil & Preferências</span>
        </h3>
        {saveSuccess && (
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
            <Check size={14} /> Salvo com sucesso!
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-2xl">
              {name ? name[0].toUpperCase() : 'C'}
            </div>
          )}
          <label className="absolute -bottom-1 -right-1 p-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg cursor-pointer shadow-md">
            <Upload size={12} />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
        </div>
        <div>
          <p className="text-xs font-bold text-white">Foto de Perfil</p>
          <p className="text-[11px] text-gray-400">Clique para atualizar sua foto de perfil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">Nome Completo</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">Telefone / WhatsApp</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
            className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-300 block mb-1">Biografia / Apresentação</label>
        <textarea
          rows={2}
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Escreva algo sobre você..."
          className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
        />
      </div>

      <div className="pt-3 border-t border-gray-800 space-y-3">
        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert size={14} /> Preferências de Atendimento & Saúde
        </h4>

        <div>
          <label className="text-xs font-semibold text-gray-300 block mb-1">Preferências de Cuidado</label>
          <input
            type="text"
            value={carePreferences}
            onChange={e => setCarePreferences(e.target.value)}
            placeholder="Ex: Prefiro escova lisa, café sem açúcar..."
            className="w-full p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
          />
        </div>

        {availableProfs.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Profissionais Favoritos</label>
            <div className="flex flex-wrap gap-2">
              {availableProfs.map(prof => {
                const isFav = favoriteProfs.includes(prof.name);
                return (
                  <button
                    type="button"
                    key={prof.id}
                    onClick={() => handleToggleFavoriteProf(prof.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isFav
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                        : 'bg-gray-900 text-gray-400 border border-gray-800'
                    }`}
                  >
                    <Heart size={12} className={isFav ? 'fill-amber-400 text-amber-400' : ''} />
                    <span>{prof.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="w-full bg-amber-600 hover:bg-amber-500 text-white p-3 rounded-xl font-bold text-xs transition-colors shadow-lg shadow-amber-600/20"
      >
        {isSaving ? 'Salvando...' : 'Salvar Perfil'}
      </button>
    </form>
  );
}
