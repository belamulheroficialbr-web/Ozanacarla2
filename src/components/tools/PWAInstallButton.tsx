import React, {useState} from 'react';
import {usePWAInstall} from '../../hooks/usePWAInstall';
import {Download} from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const {isInstallable, isInstalled, isIOS, install} = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button onClick={install} className="p-2 text-amber-500">
        <Download size={20} />
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button onClick={() => setShowIOSGuide(true)} className="p-2 text-amber-500">
          <Download size={20} />
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-sm rounded-xl bg-gray-900 p-6 border border-gray-700 shadow-xl">
              <h3 className="text-lg font-semibold text-white">Instalar no iPhone / iPad</h3>
              <p className="mt-2 text-sm text-gray-300">
                1. Toque no botão <strong>Compartilhar</strong> no Safari.<br />
                2. Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.
              </p>
              <button onClick={() => setShowIOSGuide(false)} className="mt-4 w-full rounded-lg bg-amber-600 py-2 text-white font-bold">Fechar</button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
