import React, {useState, useEffect} from 'react';
import {X, Calendar as CalIcon, Clock, User, Scissors, Check, AlertCircle, Sparkles} from 'lucide-react';
import {dataService} from '../../lib/data';
import {useAuth} from '../../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedService?: any;
}

export function BookingModal({isOpen, onClose, preSelectedService}: BookingModalProps) {
  const {user} = useAuth();
  
  // Data States
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  
  // Form State
  const [profId, setProfId] = useState('');
  const [serviceId, setServiceId] = useState(preSelectedService?.id || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadResources();
      if (preSelectedService) {
        setServiceId(preSelectedService.id);
      }
    }
  }, [isOpen, preSelectedService]);

  const loadResources = async () => {
    const [pRes, sRes, aRes] = await Promise.all([
      dataService.getProfiles('professional'),
      dataService.getServices(),
      dataService.getAppointments('', 'admin') // Load all to check conflicts
    ]);
    
    if (pRes.data) setProfessionals(pRes.data);
    if (sRes.data) setServices(sRes.data);
    if (aRes.data) setAppointments(aRes.data);
  };

  if (!isOpen) return null;

  const checkConflict = (pId: string, dateTime: string, duration: number) => {
    const newStart = new Date(dateTime).getTime();
    const newEnd = new Date(dateTime).getTime() + duration * 60000;

    return appointments.some(app => {
      if (app.professional_id !== pId) return false;
      if (app.status === 'cancelled') return false;

      const appStart = new Date(app.start_time).getTime();
      const appDur = app.duration_minutes || 60;
      const appEnd = appStart + appDur * 60000;

      return (newStart < appEnd && newEnd > appStart);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Você precisa estar logada para realizar um agendamento.');
      return;
    }

    const selectedService = services.find(s => s.id === serviceId);
    if (!selectedService) {
      setError('Selecione um serviço válido.');
      return;
    }

    const duration = selectedService.duration_minutes || 60;
    const startDateTime = `${date}T${time}`;

    if (checkConflict(profId, startDateTime, duration)) {
      setError('Conflito de Horário! Este profissional já possui um agendamento neste período. Por favor, escolha outro horário.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload = {
        client_id: user.id,
        professional_id: profId,
        service_id: serviceId,
        start_time: new Date(startDateTime).toISOString(),
        duration_minutes: duration,
        status: 'pending'
      };

      const res = await dataService.createAppointment(payload);
      if (!res.error) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 3000);
      } else {
        setError('Erro ao criar agendamento: ' + (res.error as any).message);
      }
    } catch (err: any) {
      setError('Falha na conexão: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={() => { if (!isSubmitting) onClose(); }}
    >
      <div 
        className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header do Modal */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-950 to-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Novo Agendamento Online</h3>
              <span className="text-[11px] text-gray-400">Escolha seu serviço e horário preferido</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check size={36} />
            </div>
            <h4 className="text-xl font-bold text-white">Solicitação Enviada!</h4>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Seu agendamento foi registrado. Em breve você receberá uma confirmação na sua área de cliente.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-200 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Serviço Desejado</label>
                <div className="relative">
                  <Scissors size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <select
                    required
                    value={serviceId}
                    onChange={e => setServiceId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="">Selecione o serviço...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} - R$ {Number(s.price).toFixed(2)} ({s.duration_minutes} min)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Profissional</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <select
                    required
                    value={profId}
                    onChange={e => setProfId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="">Escolha um profissional...</option>
                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Data</label>
                <div className="relative">
                  <CalIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1 mb-1 block">Horário</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Processando...' : 'Confirmar Solicitação de Horário'}
              </button>
              <p className="text-[10px] text-gray-500 text-center mt-3">
                * Sujeito à confirmação da equipe. Você poderá cancelar sem custos até 2h antes.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
