import React, {useState, useEffect} from 'react';
import {Bell, Check, CheckCheck, Trash2, Calendar, ShoppingBag, Info, X, Clock, MessageSquare} from 'lucide-react';
import {dataService} from '../../lib/data';
import {supabase} from '../../lib/supabase';
import {useAuth} from '../../context/AuthContext';

interface NotificationCenterProps {
  onClose?: () => void;
  isAdmin?: boolean;
}

export function NotificationCenter({onClose, isAdmin = false}: NotificationCenterProps) {
  const {user} = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();

      const channel = supabase
        .channel(`notifications_${user.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          loadNotifications();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const res = await dataService.getNotifications(isAdmin ? undefined : user.id);
    if (res.data) setNotifications(res.data);
    setLoading(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await dataService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? {...n, is_read: true} : n));
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    await dataService.markAllNotificationsAsRead(user.id);
    setNotifications(prev => prev.map(n => ({...n, is_read: true})));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageSquare size={14} className="text-amber-400" />;
      case 'appointment': return <Calendar size={14} className="text-amber-400" />;
      case 'order': return <ShoppingBag size={14} className="text-emerald-400" />;
      case 'system': return <Info size={14} className="text-blue-400" />;
      default: return <Bell size={14} className="text-gray-400" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex flex-col h-full bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right duration-300">
      <div className="p-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Central de Notificações</h3>
            <p className="text-[10px] text-gray-400">{unreadCount} novas mensagens</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors"
              title="Marcar todas como lidas"
            >
              <CheckCheck size={18} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {isAdmin && (
          <div className="mb-4 p-4 bg-gray-900 border border-amber-500/20 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Enviar Comunicado Geral</h4>
            <div className="space-y-2">
              <input
                id="broadcast-title"
                type="text"
                placeholder="Título do aviso..."
                className="w-full px-3 py-2 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500"
              />
              <textarea
                id="broadcast-message"
                placeholder="Mensagem para todas as clientes..."
                className="w-full px-3 py-2 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 h-20"
              />
              <button
                onClick={async () => {
                  const title = (document.getElementById('broadcast-title') as HTMLInputElement).value;
                  const message = (document.getElementById('broadcast-message') as HTMLTextAreaElement).value;
                  if (!title || !message) return;
                  
                  // In a real app, this would iterate over all user IDs or send to a special 'all' topic
                  // Here we send to 'system' or iterate if we have IDs.
                  await dataService.addNotification({
                    user_id: 'all', // Logic in data.ts handles this
                    title,
                    message,
                    type: 'system'
                  });
                  
                  (document.getElementById('broadcast-title') as HTMLInputElement).value = '';
                  (document.getElementById('broadcast-message') as HTMLTextAreaElement).value = '';
                  loadNotifications();
                }}
                className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold rounded-xl transition-all"
              >
                Disparar Notificação para Todos
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-[11px] text-gray-500">Buscando atualizações...</div>
        ) : notifications.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Bell size={32} className="mx-auto text-gray-800" />
            <p className="text-xs text-gray-500 max-w-[180px] mx-auto">Você está em dia! Nenhuma notificação por aqui.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkAsRead(n.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                n.is_read 
                  ? 'bg-gray-900/40 border-gray-800/60 opacity-70' 
                  : 'bg-gray-900 border-gray-800 hover:border-amber-500/30 shadow-md shadow-black/20'
              }`}
            >
              {!n.is_read && (
                <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-amber-500 rounded-full shadow-sm shadow-amber-500/40" />
              )}
              
              <div className="flex gap-3">
                <div className={`p-2 rounded-xl h-fit ${
                  n.type === 'appointment' ? 'bg-amber-500/10' :
                  n.type === 'order' ? 'bg-emerald-500/10' :
                  'bg-blue-500/10'
                }`}>
                  {getTypeIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold truncate ${n.is_read ? 'text-gray-300' : 'text-white'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[9px] text-gray-500 whitespace-nowrap flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-gray-950 border-t border-gray-800">
        <p className="text-[10px] text-center text-gray-600 font-medium italic">
          Bela Mulher • Sistema de Alertas Automáticos
        </p>
      </div>
    </div>
  );
}
