import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Upload,
  Save,
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Info,
  Building2,
  UserCheck,
  MapPin,
  Lock
} from 'lucide-react';
import { dataService, generatePixBrCode, validatePixBrCode } from '../../lib/data';
import { uploadMedia } from '../../lib/storage';

export function PixConfigManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState(true);
  const [keyType, setKeyType] = useState<'CPF' | 'CNPJ' | 'telefone' | 'email' | 'aleatoria'>('CNPJ');
  const [pixKey, setPixKey] = useState('12.345.678/0001-90');
  const [receiverName, setReceiverName] = useState('Sra Bela Mulher Salão & Estética');
  const [city, setCity] = useState('SÃO PAULO');
  const [qrcodeUrl, setQrcodeUrl] = useState('/src/assets/images/service_showcase_1_1793799836251.jpg');
  const [customPayload, setCustomPayload] = useState('');
  const [uploadingQr, setUploadingQr] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Load Config
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await dataService.getPixConfig();
      if (res.data) {
        setActive(res.data.active ?? true);
        setKeyType(res.data.key_type || 'CNPJ');
        setPixKey(res.data.pix_key || '');
        setReceiverName(res.data.receiver_name || '');
        setCity(res.data.city || 'SÃO PAULO');
        setQrcodeUrl(res.data.qrcode_url || '');
        if (res.data.custom_payload) {
          setCustomPayload(res.data.custom_payload);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  // Compute generated payload dynamically
  const generatedPayload = customPayload.trim() || generatePixBrCode({
    key: pixKey,
    name: receiverName,
    city: city
  });

  // Perform EMV BR Code Validation
  const validation = validatePixBrCode(generatedPayload, pixKey);

  // Upload QR Code Image
  const handleQrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const url = await uploadMedia('media-banners', 'pix/qrcode', file);
      setQrcodeUrl(url);
    } catch {
      // Base64 fallback if storage bucket not provisioned
      const reader = new FileReader();
      reader.onload = ev => {
        setQrcodeUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingQr(false);
    }
  };

  // Save Configuration
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccessMsg('');

    const configData = {
      active,
      key_type: keyType,
      pix_key: pixKey,
      receiver_name: receiverName,
      city,
      qrcode_url: qrcodeUrl,
      custom_payload: customPayload,
      updated_at: new Date().toISOString()
    };

    await dataService.savePixConfig(configData);
    setSaving(false);
    setSaveSuccessMsg('Configurações do Pix salvas e atualizadas com sucesso no Supabase!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(generatedPayload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2500);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 animate-pulse">
        Carregando configurações do Pix...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-gray-950 via-amber-950/25 to-gray-950 border border-amber-500/30 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black shadow-lg shadow-amber-500/20 shrink-0">
            <DollarSign size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Configurações de Pagamento e Pix
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Gerencie a chave Pix do salão, QR Code oficial, validação BR Code e regras de recebimento.
            </p>
          </div>
        </div>

        {/* Toggle Status */}
        <div className="flex items-center gap-3 bg-black/60 p-2.5 px-4 rounded-2xl border border-gray-800 self-start sm:self-auto shrink-0">
          <span className="text-xs font-bold text-gray-300">Status do Pix:</span>
          <button
            type="button"
            onClick={() => setActive(!active)}
            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              active 
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            {active ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Form Grid */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Key & Merchant Details */}
        <div className="lg:col-span-7 bg-gray-950 border border-amber-500/25 p-5 sm:p-6 rounded-3xl space-y-5 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-gray-800">
            <Building2 size={16} className="text-amber-400" />
            <span>Dados da Chave Pix e Recebedor</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Key Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 block">Tipo de Chave Pix</label>
              <select
                value={keyType}
                onChange={e => setKeyType(e.target.value as any)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="CNPJ">CNPJ</option>
                <option value="CPF">CPF</option>
                <option value="telefone">Telefone / Celular</option>
                <option value="email">E-mail</option>
                <option value="aleatoria">Chave Aleatória (EVP)</option>
              </select>
            </div>

            {/* Pix Key Value */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 block">Chave Pix</label>
              <input
                type="text"
                value={pixKey}
                onChange={e => setPixKey(e.target.value)}
                placeholder="Informe a chave Pix"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Receiver Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 block flex items-center gap-1.5">
                <UserCheck size={14} className="text-amber-400" />
                <span>Nome do Recebedor (Titular)</span>
              </label>
              <input
                type="text"
                value={receiverName}
                onChange={e => setReceiverName(e.target.value)}
                placeholder="Ex: Sra Bela Mulher Ltda"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-300 block flex items-center gap-1.5">
                <MapPin size={14} className="text-amber-400" />
                <span>Cidade da Conta</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Ex: SAO PAULO"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* BR Code Payload Box */}
          <div className="space-y-2 pt-2 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 block">Payload BR Code (Pix Copia e Cola)</label>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copiedPayload ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedPayload ? 'Copiado!' : 'Copiar BR Code'}</span>
              </button>
            </div>
            <textarea
              readOnly
              value={generatedPayload}
              rows={3}
              className="w-full bg-black/90 border border-gray-800 rounded-xl p-2.5 text-[11px] text-amber-300 font-mono focus:outline-none break-all resize-none"
            />
          </div>

          {/* Optional Override Payload */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400 block">
              Payload Personalizado (Opcional - sobrescreve a geração automática):
            </label>
            <input
              type="text"
              value={customPayload}
              onChange={e => setCustomPayload(e.target.value)}
              placeholder="Cole um código BR Code EMV caso queira ignorar o gerador automático"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-gray-300 font-mono focus:border-amber-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
            <span>Salvar Configurações no Supabase</span>
          </button>
        </div>

        {/* Right Column: QR Code & BR Code Structural Validation Indicator */}
        <div className="lg:col-span-5 space-y-5">
          {/* QR Code Card */}
          <div className="bg-gray-950 border border-amber-500/25 p-5 rounded-3xl space-y-4 text-center shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
              <QrCode size={16} className="text-amber-400" />
              <span>Imagem do QR Code Pix</span>
            </h3>

            <div className="relative w-48 h-48 mx-auto rounded-2xl bg-white p-3 border-2 border-amber-500/40 shadow-xl flex items-center justify-center overflow-hidden group">
              {qrcodeUrl ? (
                <img
                  src={qrcodeUrl}
                  alt="QR Code Pix"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-xs text-gray-500 text-center">Nenhum QR Code enviado</div>
              )}
            </div>

            <div className="space-y-2">
              <label className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2">
                <Upload size={14} />
                <span>{uploadingQr ? 'Enviando Imagem...' : 'Enviar Nova Imagem do QR Code'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrFileUpload}
                  className="hidden"
                  disabled={uploadingQr}
                />
              </label>

              <input
                type="text"
                value={qrcodeUrl}
                onChange={e => setQrcodeUrl(e.target.value)}
                placeholder="Ou informe a URL da imagem do QR Code"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-[11px] text-gray-300 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* BR Code Structural Validation Indicator Badge (Green / Red) */}
          <div className={`p-4 rounded-3xl border shadow-xl space-y-2.5 transition-all ${
            validation.isValid 
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' 
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl text-black ${validation.isValid ? 'bg-emerald-400' : 'bg-red-400'}`}>
                {validation.isValid ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest block opacity-80">
                  Validação Estrutural BR Code / EMV
                </span>
                <strong className="text-xs font-black">
                  {validation.isValid ? 'INDICADOR VERDE: QR CODE VÁLIDO' : 'INDICADOR VERMELHO: ESTRUTURA INVÁLIDA'}
                </strong>
              </div>
            </div>

            <p className="text-xs leading-relaxed font-medium">
              {validation.message}
            </p>

            {/* Critical Administrative Warning */}
            <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-[10.5px] opacity-90 leading-normal">
              <Lock size={14} className="shrink-0 mt-0.5" />
              <span>
                <strong>Aviso de Segurança:</strong> A validação do QR Code atesta apenas a estrutura do código. O pedido só deve ser marcado como <strong>PAGO</strong> mediante confirmação bancária real da transação ou aprovação autorizada.
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
