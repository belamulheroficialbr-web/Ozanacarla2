import {useState, useEffect} from 'react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';

export function AppointmentManager() {
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
    await dataService.updateAppointmentStatus(id, status);
  };


  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-amber-500">Agendamentos</h3>
      {appointments.map(app => (
        <div key={app.id} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center">
          <div>
            <h4 className="font-bold">{app.services?.name}</h4>
            <p className="text-sm text-gray-400">
              {new Date(app.start_time).toLocaleString()} • {role === 'client' ? app.professional?.name : app.client?.name}
            </p>
            <span className="text-xs font-bold text-amber-600">{app.status}</span>
          </div>
          {role !== 'client' && app.status === 'pending' && (
            <button onClick={() => updateStatus(app.id, 'confirmed')} className="text-amber-500 text-sm">Confirmar</button>
          )}
        </div>
      ))}
    </div>
  );
}
