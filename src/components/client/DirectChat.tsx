import React, {useState, useEffect, useRef} from 'react';
import {MessageSquare, Send, Mic, Square, Trash2, Image, User, CheckCheck} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';

export function DirectChat() {
  const {user} = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [selectedProf, setSelectedProf] = useState<any>(null);
  
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dataService.getProfiles('professional').then(res => {
      if (res.data && res.data.length > 0) {
        setProfessionals(res.data);
        setSelectedProf(res.data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (user && selectedProf) {
      loadMessages();
    }
  }, [user, selectedProf]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const loadMessages = async () => {
    if (!user || !selectedProf) return;
    const res = await dataService.getDirectMessages(user.id, selectedProf.id);
    if (res.data) setMessages(res.data);
  };

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
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      alert('Não foi possível acessar o microfone.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handleDiscardAudio = () => {
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !audioUrl) return;

    const payload = {
      sender_id: user?.id || 'client-anon',
      sender_name: user?.email?.split('@')[0] || 'Cliente',
      receiver_id: selectedProf?.id || 'prof-1',
      content: inputText.trim(),
      audio_url: audioUrl,
      timestamp: new Date().toISOString()
    };

    await dataService.sendDirectMessage(payload);
    setInputText('');
    setAudioUrl(null);
    setRecordingTime(0);
    await loadMessages();
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden flex flex-col h-[500px]">
      
      {/* Header do Chat Direto */}
      <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
            {selectedProf?.name?.[0]?.toUpperCase() || 'P'}
          </div>
          <div>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">Atendimento Direto</span>
            <h4 className="text-xs font-bold text-white">{selectedProf?.name || 'Profissional'}</h4>
          </div>
        </div>

        {professionals.length > 1 && (
          <select
            value={selectedProf?.id}
            onChange={e => {
              const p = professionals.find(item => item.id === e.target.value);
              if (p) setSelectedProf(p);
            }}
            className="p-1.5 bg-black border border-gray-800 rounded-xl text-xs text-amber-400 focus:outline-none"
          >
            {professionals.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Lista de Mensagens */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map(msg => {
          const isMine = msg.sender_id === (user?.id || 'client-anon');
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                  isMine
                    ? 'bg-amber-600 text-white rounded-br-none shadow-md'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}
              >
                {!isMine && (
                  <span className="text-[10px] font-bold text-amber-400 block mb-0.5">
                    {msg.sender_name || 'Profissional'}
                  </span>
                )}
                
                {msg.content && <p>{msg.content}</p>}

                {msg.audio_url && (
                  <div className="pt-1">
                    <audio src={msg.audio_url} controls className="w-48 h-8 rounded-lg" />
                  </div>
                )}

                <div className="text-[9px] text-right opacity-70 pt-0.5 flex items-center justify-end gap-1">
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                  {isMine && <CheckCheck size={12} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Preview de Áudio gravado antes de enviar */}
      {audioUrl && (
        <div className="p-3 bg-gray-950 border-t border-gray-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-400 font-bold">Áudio Gravado:</span>
            <audio src={audioUrl} controls className="h-8 w-48" />
          </div>
          <button
            onClick={handleDiscardAudio}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Input e Controles de Envio */}
      <form onSubmit={handleSendMessage} className="p-3 bg-gray-950 border-t border-gray-800 flex items-center gap-2">
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-4 py-2 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs font-bold animate-pulse">
            <span>Gravando áudio: {recordingTime}s</span>
            <button
              type="button"
              onClick={handleStopRecording}
              className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg flex items-center gap-1 text-[11px]"
            >
              <Square size={13} fill="currentColor" />
              <span>Parar</span>
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Digite sua mensagem ao profissional..."
              className="flex-1 p-3 bg-black border border-gray-800 rounded-xl text-xs text-white focus:border-amber-500 outline-none"
            />

            <button
              type="button"
              onClick={handleStartRecording}
              className="p-3 bg-gray-900 hover:bg-gray-800 text-amber-400 border border-gray-800 rounded-xl transition-colors"
              title="Gravar Áudio"
            >
              <Mic size={18} />
            </button>

            <button
              type="submit"
              disabled={!inputText.trim() && !audioUrl}
              className="p-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl transition-colors shadow-lg shadow-amber-600/20"
            >
              <Send size={18} />
            </button>
          </>
        )}
      </form>
    </div>
  );
}
