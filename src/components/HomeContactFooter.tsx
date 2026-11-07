import React from 'react';
import { Phone, MessageCircle, MapPin, Clock, Instagram, Globe, Share2 } from 'lucide-react';

interface HomeContactFooterProps {
  salonConfig: {
    phone: string;
    whatsapp: string;
    address: string;
    hours: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}

export function HomeContactFooter({ salonConfig }: HomeContactFooterProps) {
  const cleanPhone = salonConfig.phone.replace(/\D/g, '');
  const cleanWhatsapp = salonConfig.whatsapp.replace(/\D/g, '');

  return (
    <footer className="w-full mt-10 pt-8 pb-4 border-t border-amber-500/20 space-y-6">
      {/* Brand Monogram & Slogan */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-base flex items-center justify-center shadow-lg shadow-amber-500/20 tracking-tighter border border-amber-300/40">
          BM
        </div>
        <div>
          <h3 className="text-base font-extrabold text-white tracking-wide">
            Bela Mulher · Salão & Estética
          </h3>
          <p className="text-xs text-amber-400/90 font-medium">
            Excelência em beleza, estética e cuidado VIP
          </p>
        </div>
      </div>

      {/* Cards de Contato & Localização */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {/* Telefone */}
        <a
          href={`tel:${cleanPhone}`}
          className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-950 border border-gray-800 hover:border-amber-500/40 transition-all duration-200 group active:scale-98"
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-colors shrink-0">
            <Phone size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
              Telefone Fixo / Recepção
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 transition-colors block truncate">
              {salonConfig.phone}
            </span>
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${cleanWhatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-950 border border-gray-800 hover:border-emerald-500/40 transition-all duration-200 group active:scale-98"
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black transition-colors shrink-0">
            <MessageCircle size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
              WhatsApp Agendamentos
            </span>
            <span className="text-xs sm:text-sm font-semibold text-emerald-400 group-hover:underline block truncate">
              Conversar no WhatsApp
            </span>
          </div>
        </a>

        {/* Endereço */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <MapPin size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
              Localização
            </span>
            <span className="text-xs font-semibold text-gray-200 block truncate">
              {salonConfig.address}
            </span>
          </div>
        </div>

        {/* Horários */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-gray-950 border border-gray-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
              Funcionamento
            </span>
            <span className="text-xs font-semibold text-gray-200 block truncate">
              {salonConfig.hours}
            </span>
          </div>
        </div>
      </div>

      {/* Redes Sociais */}
      <div className="max-w-2xl mx-auto space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 text-center block">
          Redes Sociais Oficiais
        </span>
        <div className="flex items-center justify-center gap-2.5 flex-wrap">
          <a
            href={salonConfig.instagram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 hover:border-pink-500/40 text-gray-300 hover:text-pink-400 text-xs font-medium transition-all active:scale-95 shadow-sm"
          >
            <Instagram size={15} className="text-pink-400" />
            <span>Instagram</span>
          </a>

          <a
            href={salonConfig.facebook}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 hover:border-blue-500/40 text-gray-300 hover:text-blue-400 text-xs font-medium transition-all active:scale-95 shadow-sm"
          >
            <Globe size={15} className="text-blue-400" />
            <span>Facebook</span>
          </a>

          <a
            href={salonConfig.tiktok}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 hover:border-cyan-500/40 text-gray-300 hover:text-cyan-400 text-xs font-medium transition-all active:scale-95 shadow-sm"
          >
            <Share2 size={15} className="text-cyan-400" />
            <span>TikTok</span>
          </a>

          <a
            href={`https://wa.me/${cleanWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-950 border border-gray-800 hover:border-emerald-500/40 text-gray-300 hover:text-emerald-400 text-xs font-medium transition-all active:scale-95 shadow-sm"
          >
            <MessageCircle size={15} className="text-emerald-400" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      <div className="text-center pt-2 text-[11px] text-gray-600">
        © {new Date().getFullYear()} Bela Mulher Salão & Estética. Todos os direitos reservados.
      </div>
    </footer>
  );
}
