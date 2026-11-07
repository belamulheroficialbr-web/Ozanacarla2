import {useState, useEffect} from 'react';
import {Palette, Type, Phone, MessageCircle, MapPin, Clock, Check, Globe, Shield, UserCheck, Image as ImageIcon} from 'lucide-react';

export function CustomizationPanel() {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [config, setConfig] = useState({
    name: 'Bela Mulher',
    accentColor: '#d97706', // amber-600
    darkMode: true,
    phone: '(11) 98765-4321',
    whatsapp: '5511987654321',
    address: 'Av. da Beleza, 1250 - Espaço VIP',
    hours: 'Ter a Sáb: 08h às 19h',
    instagram: 'https://instagram.com/belamulher',
    facebook: 'https://facebook.com/belamulher',
    tiktok: 'https://tiktok.com/@belamulher',
    // Client Portal Customization
    clientPortalTitle: 'Espaço VIP da Cliente',
    clientPortalSubtitle: 'Acesse seu programa de fidelidade, agendamentos, histórico e sacola de compras com total privacidade.',
    clientPortalBg: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
    // Professional Portal Customization
    profPortalTitle: 'Portal da Especialista & Profissional',
    profPortalSubtitle: 'Ambiente exclusivo para gestão de agenda, atendimentos e comissões da equipe Bela Mulher.',
    profPortalBg: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200'
  });

  useEffect(() => {
    const saved = localStorage.getItem('bela_mulher_custom_config');
    if (saved) {
      try {
        setConfig(prev => ({...prev, ...JSON.parse(saved)}));
      } catch (e) {
        console.error('Erro ao carregar configurações personalizadas:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('bela_mulher_custom_config', JSON.stringify(config));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-gray-100">
      <div className="pb-4 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-amber-500 flex items-center gap-2">
            <Palette size={20} /> Personalização, Marca & Portais de Entrada
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Gerencie a identidade visual, telas de pré-cadastro/login e contatos oficiais exibidos no aplicativo.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <Check size={16} /> Configurações salvas e aplicadas em todas as telas com sucesso!
        </div>
      )}

      {/* Prévia da Identidade Visual */}
      <div className="p-4 bg-black/80 border border-gray-800 rounded-2xl space-y-2">
        <p className="text-xs font-bold text-gray-400">Prévia do Cabeçalho e Marca:</p>
        <div style={{borderColor: config.accentColor}} className="p-4 border rounded-xl bg-gray-950 flex items-center justify-between">
          <div>
            <h1 style={{color: config.accentColor}} className="text-xl font-extrabold">{config.name}</h1>
            <p className="text-[11px] text-gray-400">Salão & Estética</p>
          </div>
          <button style={{backgroundColor: config.accentColor}} className="px-3 py-1.5 text-xs font-bold text-black rounded-lg shadow">
            Botão Demo
          </button>
        </div>
      </div>

      {/* Bloco 1: Identidade Visual e Marca */}
      <div className="p-5 bg-gray-950/80 border border-gray-800 rounded-2xl space-y-4">
        <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
          <Type size={15} /> Identidade Visual
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Nome do Salão</label>
            <input
              type="text"
              value={config.name}
              onChange={e => setConfig({...config, name: e.target.value})}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Cor de Destaque</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.accentColor}
                onChange={e => setConfig({...config, accentColor: e.target.value})}
                className="w-12 h-10 bg-gray-900 border border-gray-700 rounded-xl cursor-pointer"
              />
              <span className="text-xs text-gray-400 font-mono">{config.accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 2: Personalização das Telas de Entrada e Pré-Cadastro (Portais) */}
      <div className="p-5 bg-gray-950/80 border border-gray-800 rounded-2xl space-y-5">
        <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
          <Shield size={15} /> Personalização dos Portais de Entrada & Pré-Cadastro
        </h4>

        {/* Portal da Cliente */}
        <div className="p-4 bg-black/60 border border-gray-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-amber-400 block border-b border-gray-800 pb-2">
            1. Tela de Entrada da Cliente (Pré-Cadastro & Login)
          </span>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">Título de Boas-Vindas</label>
              <input
                type="text"
                value={config.clientPortalTitle}
                onChange={e => setConfig({...config, clientPortalTitle: e.target.value})}
                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">Subtítulo / Descrição</label>
              <textarea
                rows={2}
                value={config.clientPortalSubtitle}
                onChange={e => setConfig({...config, clientPortalSubtitle: e.target.value})}
                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1 flex items-center gap-1">
                <ImageIcon size={13} className="text-amber-400" /> URL da Imagem de Fundo (Salão)
              </label>
              <input
                type="text"
                value={config.clientPortalBg}
                onChange={e => setConfig({...config, clientPortalBg: e.target.value})}
                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Portal do Profissional */}
        <div className="p-4 bg-black/60 border border-gray-800 rounded-xl space-y-3">
          <span className="text-xs font-bold text-amber-400 block border-b border-gray-800 pb-2">
            2. Tela de Entrada do Profissional (Solicitação & Acesso)
          </span>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">Título do Portal Profissional</label>
              <input
                type="text"
                value={config.profPortalTitle}
                onChange={e => setConfig({...config, profPortalTitle: e.target.value})}
                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1">Subtítulo / Apresentação</label>
              <textarea
                rows={2}
                value={config.profPortalSubtitle}
                onChange={e => setConfig({...config, profPortalSubtitle: e.target.value})}
                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-300 mb-1 flex items-center gap-1">
                <ImageIcon size={13} className="text-amber-400" /> URL da Imagem de Fundo (Equipe/Ambiente)
              </label>
              <input
                type="text"
                value={config.profPortalBg}
                onChange={e => setConfig({...config, profPortalBg: e.target.value})}
                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 3: Informações de Contato e Endereço */}
      <div className="p-5 bg-gray-950/80 border border-gray-800 rounded-2xl space-y-4">
        <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
          <MapPin size={15} /> Contato e Localização
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
              <Phone size={13} className="text-amber-400" /> Telefone de Atendimento
            </label>
            <input
              type="text"
              value={config.phone}
              onChange={e => setConfig({...config, phone: e.target.value})}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              placeholder="(11) 98765-4321"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
              <MessageCircle size={13} className="text-emerald-400" /> Número do WhatsApp
            </label>
            <input
              type="text"
              value={config.whatsapp}
              onChange={e => setConfig({...config, whatsapp: e.target.value})}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              placeholder="5511987654321"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
              <MapPin size={13} className="text-amber-400" /> Endereço Completo
            </label>
            <input
              type="text"
              value={config.address}
              onChange={e => setConfig({...config, address: e.target.value})}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              placeholder="Av. da Beleza, 1250 - Espaço VIP"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
              <Clock size={13} className="text-amber-400" /> Horário de Funcionamento
            </label>
            <input
              type="text"
              value={config.hours}
              onChange={e => setConfig({...config, hours: e.target.value})}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              placeholder="Ter a Sáb: 08h às 19h"
            />
          </div>
        </div>
      </div>

      {/* Bloco 4: Edição de Redes Sociais */}
      <div className="p-5 bg-gray-950/80 border border-gray-800 rounded-2xl space-y-4">
        <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
          <Globe size={15} /> Gestão de Redes Sociais
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Instagram URL</label>
            <input
              type="text"
              value={config.instagram}
              onChange={e => setConfig({...config, instagram: e.target.value})}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              placeholder="https://instagram.com/suaconta"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Facebook URL</label>
            <input
              type="text"
              value={config.facebook}
              onChange={e => setConfig({...config, facebook: e.target.value})}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              placeholder="https://facebook.com/suapagina"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">TikTok URL</label>
            <input
              type="text"
              value={config.tiktok}
              onChange={e => setConfig({...config, tiktok: e.target.value})}
              className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
              placeholder="https://tiktok.com/@suaconta"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-black font-extrabold rounded-xl text-xs transition-all active:scale-98 shadow-lg shadow-amber-600/20"
      >
        Salvar Todas as Personalizações, Portais & Redes Sociais
      </button>
    </div>
  );
}
