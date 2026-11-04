import {useState, useEffect} from 'react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';
import {supabase} from '../../lib/supabase';

export function AppointmentManager() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const {user, role} = useAuth();

  const fetchAppointments = async () => {
    if (user && role) {
      const {data} = await dataService.getAppointments(user.id, role);
      if (data) setAppointments(data);
    }
  };

  useEffect(() => {
    fetchAppointments();

    // Set up Realtime subscription
    const channel = supabase
      .channel('appointments_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await dataService.updateAppointmentStatus(id, status);
      fetchAppointments();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDateTime = (dateStr: any) => {
    if (!dateStr) return 'Horário a definir';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Data a definir' : d.toLocaleString('pt-BR');
    } catch {
      return 'Data a definir';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-amber-500">Agendamentos</h3>
        <span className="text-xs text-gray-400">{appointments.length} encontrados</span>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl text-center text-gray-400 text-xs">
          Nenhum agendamento encontrado no momento.
        </div>
      ) : (
        appointments.map(app => (
          <div key={app.id || Math.random()} className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex justify-between items-center">
            <div>
              <h4 className="font-bold text-white text-sm">{app.services?.name || app.service_name || 'Serviço'}</h4>
              <p className="text-xs text-gray-400 mt-1">
                {formatDateTime(app.start_time)} • {role === 'client' ? (app.professional?.name || 'Profissional') : (app.client?.name || 'Cliente')}
              </p>
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {app.status || 'pendente'}
              </span>
            </div>
            {role !== 'client' && app.status === 'pending' && (
              <button onClick={() => updateStatus(app.id, 'confirmed')} className="text-amber-400 hover:text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-600/50">
                Confirmar
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}
