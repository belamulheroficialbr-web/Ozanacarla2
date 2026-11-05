import React, {useState, useEffect} from 'react';
import {MessageSquare, User, Search, Send, Clock} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';

export function AdminChatManager() {
  const {user} = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      // In a real app, we'd query a 'conversations' table
      // Here we'll get unique clients from profiles to simulate chat threads
      const res = await dataService.getProfiles('client');
      if (res.data) {
        setConversations(res.data);
        if (res.data.length > 0) setSelectedConv(res.data[0]);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedConv && user) {
      loadMessages();
    }
  }, [selectedConv, user]);

  const loadMessages = async () => {
    if (!user || !selectedConv) return;
    const res = await dataService.getDirectMessages(user.id, selectedConv.id);
    if (res.data) setMessages(res.data);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedConv || !user) return;

    const payload = {
      sender_id: user.id,
      sender_name: 'Administração',
      receiver_id: selectedConv.id,
      content: inputText.trim(),
      timestamp: new Date().toISOString()
    };

    await dataService.sendDirectMessage(payload);
    setInputText('');
    await loadMessages();
  };

  return (
    <div className="flex h-[600px] bg-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Sidebar: Lista de Conversas */}
      <div className="w-80 border-r border-gray-800 flex flex-col bg-gray-950">
        <div className="p-4 border-b border-gray-800">
          <h3 className="font-bold text-white flex items-center gap-2">
            <MessageSquare size={18} className="text-amber-500" />
            <span>Conversas</span>
          </h3>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              placeholder="Buscar cliente..."
              className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-xs text-gray-500">Carregando...</div>
          ) : conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`w-full p-4 flex items-center gap-3 transition-colors border-b border-gray-900/50 ${
                selectedConv?.id === conv.id ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : 'hover:bg-gray-900/50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold text-sm shrink-0 border border-gray-700">
                {conv.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-white truncate">{conv.name || 'Cliente'}</p>
                <p className="text-[10px] text-gray-500 truncate">{conv.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Área de Chat Principal */}
      <div className="flex-1 flex flex-col bg-gray-900/40">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                  {selectedConv.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedConv.name}</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online agora
                  </span>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <MessageSquare size={32} className="text-gray-700" />
                  <p className="text-xs text-gray-500">Inicie uma conversa com {selectedConv.name}</p>
                </div>
              ) : messages.map((msg, idx) => {
                const isMine = msg.sender_id === user?.id;
                return (
                  <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl text-xs ${
                      isMine ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                    }`}>
                      <p>{msg.content}</p>
                      <div className="mt-1 flex items-center justify-end gap-1 opacity-60 text-[9px]">
                        <Clock size={10} />
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="flex-1 px-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl transition-all"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gray-800 flex items-center justify-center text-gray-600">
              <MessageSquare size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Central de Mensagens</h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Selecione um cliente ao lado para visualizar o histórico e responder em tempo real.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
