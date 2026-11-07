import React from 'react';
import { User, Briefcase, X, ChevronRight, ShieldCheck } from 'lucide-react';

interface AccountSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClient: () => void;
  onSelectProfessional: () => void;
  onSelectAdmin: () => void;
}

export function AccountSelectorModal({
  isOpen,
  onClose,
  onSelectClient,
  onSelectProfessional,
  onSelectAdmin,
}: AccountSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-gray-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-300/40">
              BM
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Minha Conta</h2>
              <p className="text-xs text-amber-400/90 font-medium">Selecione o seu perfil de acesso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {/* Opção 1: Área da Cliente */}
          <button
            onClick={() => {
              onClose();
              onSelectClient();
            }}
            className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-amber-950/20 border border-amber-500/30 hover:border-amber-400 transition-all duration-200 group shadow-lg active:scale-98 flex items-center justify-between"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors shrink-0">
                <User size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Área da Cliente
                  </h3>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold border border-amber-500/30">
                    VIP
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Acesse seu programa de fidelidade, agendamentos, histórico e sacola de compras.
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-amber-400/70 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Opção 2: Área do Profissional */}
          <button
            onClick={() => {
              onClose();
              onSelectProfessional();
            }}
            className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-amber-950/20 border border-gray-800 hover:border-amber-500/40 transition-all duration-200 group shadow-lg active:scale-98 flex items-center justify-between"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-colors shrink-0">
                <Briefcase size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                    Área do Profissional
                  </h3>
                  <span className="text-[9px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full font-semibold border border-gray-700">
                    Equipe
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Painel exclusivo para especialistas. Gestão de agenda, atendimentos e comissões.
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>

          {/* Opção 3: Área Administrativa */}
          <button
            onClick={() => {
              onClose();
              onSelectAdmin();
            }}
            className="w-full text-left p-4 rounded-2xl bg-gradient-to-r from-gray-900 via-gray-900/90 to-amber-950/20 border border-gray-800 hover:border-rose-500/40 transition-all duration-200 group shadow-lg active:scale-98 flex items-center justify-between"
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:bg-rose-500 group-hover:text-black transition-colors shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                    Painel Administrativo
                  </h3>
                  <span className="text-[9px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-semibold border border-rose-500/30">
                    ADM
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Acesso restrito para gestão de estoque, financeiro e configurações do salão.
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
          </button>
        </div>

        <div className="pt-2 text-center">
          <p className="text-[10px] text-gray-500">
            Ambiente seguro • Bela Mulher Salão & Estética
          </p>
        </div>

      </div>
    </div>
  );
}
