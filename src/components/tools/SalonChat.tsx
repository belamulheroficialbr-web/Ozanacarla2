import React, {useState, useEffect, useRef} from 'react';
import {Bot, Send, Sparkles, User, Mic, Square, Trash2, CheckCircle2, AlertTriangle, Play, Pause, Volume2} from 'lucide-react';
import {dataService} from '../../lib/data';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  audioUrl?: string;
  options?: string[];
  timestamp: Date;
}

export function SalonChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [services, setServices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Voice recording & Web Speech state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTextToSend, setPendingTextToSend] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load real DB services & products
  useEffect(() => {
    Promise.all([
      dataService.getServices(),
      dataService.getProducts()
    ]).then(([sRes, pRes]) => {
      if (sRes.data) setServices(sRes.data);
      if (pRes.data) setProducts(pRes.data);
    });

    // Initial greeting based on current time
    const hour = new Date().getHours();
    let greeting = 'Bom dia';
    if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else if (hour >= 18 || hour < 5) greeting = 'Boa noite';

    setMessages([
      {
        id: '1',
        sender: 'bot',
        text: `${greeting}! ✨ Eu sou a assistente virtual do Salão Bela Mulher. Como posso ajudar você hoje com nossos tratamentos, produtos ou agendamentos?`,
        options: [
          'Quais são os serviços e preços?',
          'Quero agendar um horário',
          'Consultar estoque de produtos',
          'Quais produtos vocês vendem?'
        ],
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  // Audio Recording Handlers
  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {type: 'audio/webm'});
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Web Speech API Voice Recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'pt-BR';
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput(transcript);
          }
        };

        recognitionRef.current.start();
      }
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      alert('Não foi possível acessar o microfone para gravação de voz.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    }
  };

  const handleDiscardAudio = () => {
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handlePrepareSend = (textToSend: string) => {
    if (!textToSend.trim() && !audioUrl) return;
    setPendingTextToSend(textToSend);
    setShowConfirmModal(true);
  };

  const handleConfirmSend = () => {
    setShowConfirmModal(false);
    processUserMessage(pendingTextToSend, audioUrl);
    setInput('');
    setAudioUrl(null);
    setPendingTextToSend('');
  };

  const processUserMessage = (userText: string, userAudio: string | null) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      audioUrl: userAudio || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);

    // Bot Response Logic using real DB lookup
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let botResponse = '';
      let options: string[] = [];

      if (lower.includes('preço') || lower.includes('serviço') || lower.includes('tabela')) {
        const list = services.map(s => `• ${s.name}: R$ ${Number(s.price).toFixed(2)}`).join('\n');
        botResponse = `Estes são os nossos serviços e preços atuais cadastrados no sistema:\n\n${list}\n\nVocê gostaria de agendar algum deles?`;
        options = ['Quero agendar agora', 'Falar com profissional'];
      } else if (lower.includes('estoque') || lower.includes('produto') || lower.includes('vende')) {
        const prodList = products.map(p => `• ${p.name}: R$ ${Number(p.sale_price || p.price || 0).toFixed(2)} (${p.quantity} em estoque)`).join('\n');
        const lowStock = products.filter(p => Number(p.quantity) <= Number(p.min_quantity || 5));
        
        let warning = '';
        if (lowStock.length > 0) {
          warning = `\n\n⚠️ Alerta de Estoque Baixo para a Administração: (${lowStock.map(p => p.name).join(', ')})`;
        }

        botResponse = `Nossos produtos disponíveis na vitrine virtual:\n\n${prodList}${warning}`;
        options = ['Ver vitrine de produtos', 'Quais são as ofertas?'];
      } else if (lower.includes('agendar') || lower.includes('horário')) {
        botResponse = 'Para agendar, você pode escolher o serviço desejado na nossa Vitrine Virtual ou clicar em "Ver Vitrine / Agendar" no topo da página. Deseja ver a vitrine agora?';
        options = ['Sim, ir para a vitrine', 'Falar com atendente'];
      } else {
        botResponse = `Entendi seu pedido sobre "${userText}". Nosso salão oferece serviços de cabelos, esmaltação em gel e estética com produtos de alta performance. Como posso ajudar melhor você?`;
        options = ['Ver serviços e preços', 'Consultar estoque', 'Falar com profissional'];
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        options,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    }, 600);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-950 border border-amber-500/25 rounded-3xl overflow-hidden flex flex-col h-[540px] max-h-[75vh] shadow-2xl">
      
      {/* Header do Bot Virtual */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Bot size={20} />
          </div>
          <div>
            <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest block leading-none">Inteligência Bela Mulher</span>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight mt-0.5">Assistente Virtual do Salão</h4>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Online
        </span>
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 custom-scrollbar">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] sm:max-w-[80%] p-3 sm:p-3.5 rounded-2xl text-xs space-y-2 break-words ${
                msg.sender === 'user'
                  ? 'bg-amber-600 text-white rounded-br-none shadow-md'
                  : 'bg-gray-900 text-gray-200 rounded-bl-none border border-gray-800'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] opacity-70 mb-1">
                {msg.sender === 'bot' ? (
                  <>
                    <Sparkles size={12} className="text-amber-400" />
                    <span className="font-bold text-amber-400">Assistente Virtual</span>
                  </>
                ) : (
                  <>
                    <User size={12} />
                    <span>Você</span>
                  </>
                )}
              </div>

              <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

              {msg.audioUrl && (
                <div className="pt-1 w-full max-w-full">
                  <audio src={msg.audioUrl} controls className="w-full max-w-[200px] h-8 rounded-lg" />
                </div>
              )}
            </div>

            {/* Sugestões Rápidas de Opções */}
            {msg.options && msg.options.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%] sm:max-w-[80%]">
                {msg.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handlePrepareSend(opt)}
                    className="px-2.5 py-1.5 bg-gray-900 hover:bg-amber-500/20 border border-gray-800 hover:border-amber-500/40 text-amber-300 rounded-xl text-[10px] sm:text-[11px] font-medium transition-all text-left active:scale-95"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview de Gravador de Voz */}
      {audioUrl && (
        <div className="p-2.5 sm:p-3 bg-gray-950 border-t border-gray-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Volume2 size={16} className="text-amber-400 shrink-0" />
            <span className="text-[11px] text-gray-300 font-medium truncate">Áudio gravado ({recordingTime}s)</span>
            <audio src={audioUrl} controls className="h-8 w-36 xs:w-44" />
          </div>
          <button
            onClick={handleDiscardAudio}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg active:scale-90"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Form Input e Gravação de Voz */}
      <div className="p-2 sm:p-3 bg-gray-950 border-t border-gray-800 flex items-center gap-1.5 sm:gap-2 w-full max-w-full">
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-3 py-2 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs font-bold animate-pulse">
            <span className="truncate">Gravando: {recordingTime}s</span>
            <button
              type="button"
              onClick={handleStopRecording}
              className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-1 text-[11px] shrink-0"
            >
              <Square size={13} fill="currentColor" />
              <span>Parar</span>
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handlePrepareSend(input);
              }}
              placeholder="Digite sua dúvida ou use o microfone..."
              className="flex-1 min-w-0 p-2.5 sm:p-3 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
            />

            <button
              type="button"
              onClick={handleStartRecording}
              className="p-2.5 sm:p-3 bg-gray-900 hover:bg-gray-800 text-amber-400 border border-gray-800 rounded-xl transition-colors shrink-0 active:scale-95"
              title="Gravar Mensagem de Voz"
            >
              <Mic size={18} />
            </button>

            <button
              type="button"
              onClick={() => handlePrepareSend(input)}
              disabled={!input.trim() && !audioUrl}
              className="p-2.5 sm:p-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl transition-colors shadow-lg shadow-amber-600/20 shrink-0 active:scale-95"
            >
              <Send size={18} />
            </button>
          </>
        )}
      </div>

      {/* Modal de Confirmação antes do envio */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-gray-900 border border-gray-800 p-5 rounded-3xl space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white border-b border-gray-800 pb-2">Confirmar Envio de Mensagem</h4>
            <div className="p-3 bg-black rounded-xl border border-gray-800 text-xs text-gray-200">
              {pendingTextToSend || 'Mensagem em áudio pronta para envio.'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-700"
              >
                Editar
              </button>
              <button
                onClick={handleConfirmSend}
                className="w-1/2 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-500"
              >
                Enviar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
