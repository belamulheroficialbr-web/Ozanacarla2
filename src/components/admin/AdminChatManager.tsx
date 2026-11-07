import React, {useState, useEffect, useRef} from 'react';
import {MessageSquare, User, Search, Send, Clock, CheckCheck, Bell, Sparkles, Image, Trash2} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';

export function AdminChatManager() {
  const {user} = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await dataService.getProfiles('client');
      if (res.data) {
        setConversations(res.data);
        if (res.data.length > 0) {
          setSelectedConv(res.data[0]);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedConv && user) {
      loadMessages();
      markAsRead(selectedConv.id);
    }
  }, [selectedConv, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const loadMessages = async () => {
    if (!user || !selectedConv) return;
    const res = await dataService.getDirectMessages(user.id, selectedConv.id);
    if (res.data) {
      setMessages(res.data);
    }
  };

  const markAsRead = async (convId: string) => {
    if (!user) return;
    await dataService.markChatMessagesAsRead(user.id, convId);
    setUnreadCounts(prev => ({ ...prev, [convId]: 0 }));
  };

  // Realtime subscription for incoming messages
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('admin-messages-sync')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages'
      }, (payload: any) => {
        const newMsg = payload.new;
        
        // If current open conversation matches sender or receiver
        if (selectedConv && (newMsg.sender_id === selectedConv.id || newMsg.receiver_id === selectedConv.id)) {
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id === selectedConv.id) {
            markAsRead(selectedConv.id);
          }
        } else if (newMsg.sender_id && newMsg.sender_id !== user.id) {
          // Increment unread count for that conversation
          setUnreadCounts((prev) => ({
            ...prev,
            [newMsg.sender_id]: (prev[newMsg.sender_id] || 0) + 1
          }));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, selectedConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !imageUrl) || !selectedConv || !user) return;

    const payload = {
      sender_id: user.id,
      sender_name: 'Administração',
      receiver_id: selectedConv.id,
      content: inputText.trim(),
      image_url: imageUrl,
      timestamp: new Date().toISOString(),
      is_read: false
    };

    await dataService.sendDirectMessage(payload);
    setInputText('');
    setImageUrl(null);
    await loadMessages();
  };

  const filteredConversations = conversations.filter(c => 
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col md:flex-row h-[600px] bg-black border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      
      {/* Sidebar: Lista de Conversas */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col bg-gray-950 shrink-0">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <MessageSquare size={18} className="text-amber-500" />
              <span>Conversas Ativas</span>
            </h3>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-black font-black text-[10px] rounded-full animate-pulse">
                {totalUnread} nova{totalUnread > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou e-mail..."
              className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-6 text-center text-xs text-gray-500">Carregando conversas...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-gray-500">Nenhuma conversa encontrada.</div>
          ) : filteredConversations.map(conv => {
            const isSelected = selectedConv?.id === conv.id;
            const unread = unreadCounts[conv.id] || 0;
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full p-3.5 flex items-center justify-between transition-colors border-b border-gray-900/50 ${
                  isSelected ? 'bg-amber-500/10 border-l-4 border-l-amber-500' : 'hover:bg-gray-900/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0 border border-gray-700">
                    {conv.name?.[0]?.toUpperCase() || 'U'}
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-amber-500 border-2 border-black animate-ping" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-xs truncate ${unread > 0 ? 'font-black text-amber-400' : 'font-bold text-white'}`}>
                      {conv.name || 'Cliente'}
                    </p>
                    <p className="text-[10px] text-gray-500 truncate">{conv.email}</p>
                  </div>
                </div>

                {unread > 0 && (
                  <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] font-black rounded-full shadow-md shadow-amber-500/20 shrink-0">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Área de Chat Principal */}
      <div className="flex-1 flex flex-col bg-gray-900/40 min-w-0">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-3.5 bg-gray-950/90 border-b border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {selectedConv.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{selectedConv.name || 'Cliente'}</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Atendimento Realtime Ativo
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-xl text-[10px] text-gray-400">
                <Sparkles size={12} className="text-amber-400" />
                <span>Modo Admin</span>
              </div>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <MessageSquare size={32} className="text-gray-700" />
                  <p className="text-xs text-gray-500">Inicie uma conversa direta com {selectedConv.name}</p>
                </div>
              ) : messages.map((msg, idx) => {
                const isMine = msg.sender_id === user?.id;
                const isRead = msg.is_read || isMine;
                return (
                  <div key={msg.id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-2xl text-xs space-y-1 ${
                      isMine 
                        ? 'bg-amber-600 text-white rounded-tr-none shadow-md' 
                        : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                    }`}>
                      {!isMine && (
                        <span className="text-[10px] font-bold text-amber-400 block mb-0.5">
                          {msg.sender_name || selectedConv.name || 'Cliente'}
                        </span>
                      )}

                      {msg.content && <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>}

                      {msg.image_url && (
                        <div className="pt-1">
                          <img src={msg.image_url} alt="Anexo" className="max-w-full rounded-xl max-h-48 object-cover border border-white/10" />
                        </div>
                      )}

                      {msg.audio_url && (
                        <div className="pt-1">
                          <audio src={msg.audio_url} controls className="w-48 h-8 rounded-lg" />
                        </div>
                      )}

                      <div className="mt-1 flex items-center justify-end gap-1.5 opacity-80 text-[9px]">
                        <span>{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</span>
                        {isMine && (
                          <span title={isRead ? 'Visualizada' : 'Enviada'}>
                            <CheckCheck 
                              size={13} 
                              className={isRead ? 'text-emerald-300' : 'text-gray-300'} 
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Preview de Imagem selecionada */}
            {imageUrl && (
              <div className="p-3 bg-gray-950 border-t border-gray-800 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-amber-400 font-bold">Imagem Anexa:</span>
                  <img src={imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-amber-500/40" />
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-gray-950 border-t border-gray-800 flex items-center gap-2 shrink-0">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageSelect} 
                accept="image/*" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 bg-gray-900 hover:bg-gray-800 text-amber-400 border border-gray-800 rounded-xl transition-colors shrink-0"
                title="Anexar Imagem"
              >
                <Image size={18} />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Escreva sua mensagem para a cliente..."
                className="flex-1 px-4 py-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputText.trim() && !imageUrl}
                className="p-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-amber-600/20 active:scale-95 shrink-0"
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
              <p className="text-xs text-gray-500 max-w-xs mx-auto">Selecione uma cliente na lista para visualizar o histórico e responder em tempo real.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
