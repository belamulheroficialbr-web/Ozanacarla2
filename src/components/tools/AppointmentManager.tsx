import React, { useState, useEffect } from 'react';
import {
  Calendar as CalIcon,
  Clock,
  User,
  Scissors,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { dataService } from '../../lib/data';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export function AppointmentManager() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedProfFilter, setSelectedProfFilter] = useState<string>('all');

  // Resource Selection States
  const [clients, setClients] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // Modals State
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const [viewingApp, setViewingApp] = useState<any>(null);

  const { user, role } = useAuth();

  // Form State
  const [clientId, setClientId] = useState('');
  const [profId, setProfId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [status, setStatus] = useState('pending');

  const fetchAppointments = async () => {
    if (!user || !role) return;
    setLoading(true);
    const { data } = await dataService.getAppointments(user.id, role === 'admin' ? 'admin' : role);
    if (data) setAppointments(data);
    setLoading(false);
  };

  const loadResources = async () => {
    const [cRes, pRes, sRes] = await Promise.all([
      dataService.getProfiles('client'),
      dataService.getProfiles('professional'),
      dataService.getServices()
    ]);
    if (cRes.data) setClients(cRes.data);
    if (pRes.data) setProfessionals(pRes.data);
    if (sRes.data) setServices(sRes.data);
  };

  useEffect(() => {
    fetchAppointments();
    loadResources();

    const channel = supabase
      .channel('appointments_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchAppointments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  const resetForm = () => {
    setClientId('');
    setProfId('');
    setServiceId('');
    setStartTime('');
    setStatus('pending');
    setEditingApp(null);
  };

  const handleOpenAdd = (prefillDate?: Date, prefillProfId?: string, hour?: number) => {
    resetForm();
    const baseDate = prefillDate ? new Date(prefillDate) : new Date(selectedDate);
    if (hour !== undefined) {
      baseDate.setHours(hour, 0, 0, 0);
    } else if (!prefillDate) {
      baseDate.setHours(9, 0, 0, 0);
    }

    // Format datetime-local format (YYYY-MM-DDTHH:mm)
    const year = baseDate.getFullYear();
    const month = String(baseDate.getMonth() + 1).padStart(2, '0');
    const day = String(baseDate.getDate()).padStart(2, '0');
    const hours = String(baseDate.getHours()).padStart(2, '0');
    const minutes = String(baseDate.getMinutes()).padStart(2, '0');
    setStartTime(`${year}-${month}-${day}T${hours}:${minutes}`);

    if (prefillProfId) {
      setProfId(prefillProfId);
    } else if (selectedProfFilter !== 'all') {
      setProfId(selectedProfFilter);
    }

    setShowFormModal(true);
  };

  const handleOpenEdit = (app: any) => {
    setEditingApp(app);
    setClientId(app.client_id || '');
    setProfId(app.professional_id || '');
    setServiceId(app.service_id || '');
    if (app.start_time) {
      const d = new Date(app.start_time);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      setStartTime(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setStartTime('');
    }
    setStatus(app.status || 'pending');
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  const handleOpenDetail = (app: any) => {
    setViewingApp(app);
    setShowDetailModal(true);
  };

  const checkConflict = (pId: string, start: string, dur: number, excludeId?: string) => {
    const newStart = new Date(start).getTime();
    const newEnd = new Date(start).getTime() + dur * 60000;

    return appointments.some(app => {
      if (app.id === excludeId) return false;
      if (app.professional_id !== pId) return false;
      if (app.status === 'cancelled') return false;

      const appStart = new Date(app.start_time).getTime();
      const appDur = app.duration_minutes || 60;
      const appEnd = appStart + appDur * 60000;

      return newStart < appEnd && newEnd > appStart;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedService = services.find(s => s.id === serviceId);
    const duration = selectedService?.duration_minutes || 60;

    if (checkConflict(profId, startTime, duration, editingApp?.id)) {
      alert('Conflito de Horário! Este profissional já possui um agendamento neste período.');
      return;
    }

    const payload = {
      client_id: clientId,
      professional_id: profId,
      service_id: serviceId,
      start_time: new Date(startTime).toISOString(),
      duration_minutes: duration,
      status
    };

    if (editingApp) {
      await dataService.updateAppointment(editingApp.id, payload);
    } else {
      await dataService.createAppointment(payload);
    }

    setShowFormModal(false);
    fetchAppointments();
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    await dataService.updateAppointmentStatus(appId, newStatus);
    if (viewingApp && viewingApp.id === appId) {
      setViewingApp({ ...viewingApp, status: newStatus });
    }
    fetchAppointments();
  };

  const handleCancelAppointment = async (id: string) => {
    if (confirm('Deseja realmente cancelar este agendamento?')) {
      await dataService.updateAppointmentStatus(id, 'cancelled');
      setShowDetailModal(false);
      fetchAppointments();
    }
  };

  // Date Navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const setToday = () => {
    setSelectedDate(new Date());
  };

  // Filtering helpers
  const getFilteredAppointments = () => {
    return appointments.filter(app => {
      if (selectedProfFilter !== 'all' && app.professional_id !== selectedProfFilter) {
        return false;
      }
      return true;
    });
  };

  const activeApps = getFilteredAppointments();

  // Mode Specific Date Calculations
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Status Badge Helper
  const renderStatusBadge = (appStatus: string) => {
    switch (appStatus) {
      case 'confirmed':
        return (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Confirmado
          </span>
        );
      case 'concluded':
        return (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Concluído
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Pendente
          </span>
        );
    }
  };

  // Hours array from 08:00 to 20:00
  const hoursGrid = Array.from({ length: 13 }, (_, i) => i + 8);

  // Week days calculation
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Month days calculation
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    const startingDayOfWeek = firstDay.getDay();

    // Padding days from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, currentMonth: false });
    }

    // Days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }

    return days;
  };

  const monthDays = getMonthDays(selectedDate);

  // Active Professionals list for per-professional column view
  const displayProfessionals =
    selectedProfFilter === 'all'
      ? professionals
      : professionals.filter(p => p.id === selectedProfFilter);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md">
            <CalIcon size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Agenda & Atendimentos
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
                Painel ADM
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Visualização por profissional, horários ocupados e agendamentos.
            </p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Selector */}
          <div className="flex bg-gray-900 border border-gray-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'day'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'week'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'month'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mês
            </button>
          </div>

          {/* Professional Filter */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl px-2.5 py-1.5">
            <Filter size={14} className="text-amber-400 mr-2 shrink-0" />
            <select
              value={selectedProfFilter}
              onChange={e => setSelectedProfFilter(e.target.value)}
              className="bg-transparent text-xs text-white outline-none cursor-pointer font-medium max-w-[140px] truncate"
            >
              <option value="all" className="bg-gray-900 text-white">
                Todos Profissionais
              </option>
              {professionals.map(p => (
                <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              title="Anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={setToday}
              className="px-2 py-1 text-[11px] font-semibold text-gray-400 hover:text-amber-400 transition-colors"
            >
              Hoje
            </button>
            <span className="px-2 py-1 text-xs font-bold text-amber-400 min-w-[110px] text-center border-x border-gray-800/80">
              {viewMode === 'day' &&
                selectedDate.toLocaleDateString('pt-BR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short'
                })}
              {viewMode === 'week' &&
                `${weekDays[0].toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short'
                })} - ${weekDays[6].toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short'
                })}`}
              {viewMode === 'month' &&
                selectedDate.toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric'
                })}
            </span>
            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
              title="Próximo"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* New Appointment Button */}
          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/20 active:scale-95"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-xs text-gray-500 flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          Sincronizando agenda e disponibilidades...
        </div>
      ) : (
        <>
          {/* DAY VIEW: Visual Hourly Schedule Grid by Professional */}
          {viewMode === 'day' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Day Header Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-black/40 border border-gray-800 p-3 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Visualização Diária:
                  <span className="text-white font-bold capitalize">
                    {selectedDate.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span> Pendentes
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Confirmados
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span> Concluídos
                  </span>
                </div>
              </div>

              {/* Hours Grid */}
              <div className="overflow-x-auto rounded-3xl border border-gray-800 bg-gray-950/80 shadow-2xl">
                <div className="min-w-[700px]">
                  {/* Table Column Headers */}
                  <div className="grid grid-cols-12 bg-gray-900/90 border-b border-gray-800 text-xs font-bold text-gray-300">
                    <div className="col-span-2 p-3 text-center border-r border-gray-800 flex items-center justify-center gap-1 text-amber-400">
                      <Clock size={14} /> Horário
                    </div>
                    <div className="col-span-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-x divide-gray-800">
                      {displayProfessionals.length === 0 ? (
                        <div className="p-3 text-center text-gray-500 col-span-full">
                          Nenhum profissional cadastrado.
                        </div>
                      ) : (
                        displayProfessionals.map(prof => (
                          <div key={prof.id} className="p-3 text-center truncate flex items-center justify-center gap-1.5">
                            <Scissors size={13} className="text-amber-500/80 shrink-0" />
                            <span className="text-gray-100 font-bold truncate">{prof.name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Hourly Rows */}
                  <div className="divide-y divide-gray-800/60">
                    {hoursGrid.map(hour => {
                      const hourString = `${String(hour).padStart(2, '0')}:00`;

                      return (
                        <div key={hour} className="grid grid-cols-12 min-h-[64px] hover:bg-white/[0.01] transition-colors">
                          {/* Hour Label */}
                          <div className="col-span-2 p-2 border-r border-gray-800/80 flex flex-col items-center justify-center bg-black/40">
                            <span className="text-xs font-bold text-amber-400/90">{hourString}</span>
                            <span className="text-[9px] text-gray-500">{`${String(hour + 1).padStart(2, '0')}:00`}</span>
                          </div>

                          {/* Professionals Slots for this Hour */}
                          <div className="col-span-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-x divide-gray-800/60">
                            {displayProfessionals.map(prof => {
                              // Find appointments for this prof and hour
                              const matchedApps = activeApps.filter(app => {
                                if (app.professional_id !== prof.id) return false;
                                const appDate = new Date(app.start_time);
                                return isSameDay(appDate, selectedDate) && appDate.getHours() === hour;
                              });

                              return (
                                <div key={prof.id} className="p-1.5 relative group min-h-[60px] flex flex-col justify-center">
                                  {matchedApps.length > 0 ? (
                                    <div className="space-y-1.5">
                                      {matchedApps.map(app => (
                                        <div
                                          key={app.id}
                                          onClick={() => handleOpenDetail(app)}
                                          className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.01] shadow-md ${
                                            app.status === 'confirmed'
                                              ? 'bg-emerald-950/40 border-emerald-500/40 hover:border-emerald-400'
                                              : app.status === 'concluded'
                                              ? 'bg-blue-950/40 border-blue-500/40 hover:border-blue-400'
                                              : app.status === 'cancelled'
                                              ? 'bg-red-950/30 border-red-500/30 line-through opacity-60'
                                              : 'bg-amber-950/40 border-amber-500/40 hover:border-amber-400'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between gap-1 mb-1">
                                            <span className="text-[11px] font-bold text-white truncate">
                                              {app.services?.name || app.service_name || 'Procedimento'}
                                            </span>
                                            {renderStatusBadge(app.status)}
                                          </div>
                                          <div className="flex items-center justify-between text-[10px] text-gray-300">
                                            <span className="flex items-center gap-1 truncate font-medium">
                                              <User size={10} className="text-amber-400" />
                                              {app.client?.name || app.client_name || 'Cliente'}
                                            </span>
                                            <span className="text-amber-400/90 font-bold shrink-0 ml-1">
                                              R$ {app.services?.price || app.service_price || 0}
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    /* Available Slot Button */
                                    <button
                                      onClick={() => handleOpenAdd(selectedDate, prof.id, hour)}
                                      className="w-full h-full min-h-[44px] rounded-xl border border-dashed border-gray-800/80 hover:border-amber-500/50 bg-black/20 hover:bg-amber-500/5 flex items-center justify-center gap-1 text-[10px] font-semibold text-gray-600 hover:text-amber-400 transition-all opacity-60 hover:opacity-100 group-hover:border-amber-500/30"
                                    >
                                      <Plus size={12} />
                                      <span>Livre</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WEEK VIEW: 7-Day Schedule Matrix */}
          {viewMode === 'week' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDays.map((day, idx) => {
                  const isToday = isSameDay(day, new Date());
                  const dayApps = activeApps
                    .filter(app => isSameDay(new Date(app.start_time), day))
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

                  return (
                    <div
                      key={idx}
                      className={`bg-black/60 border rounded-2xl p-3 flex flex-col justify-between space-y-3 transition-colors ${
                        isToday
                          ? 'border-amber-500 bg-amber-500/[0.02] shadow-lg shadow-amber-500/5'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {/* Day Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                          </p>
                          <p className={`text-base font-extrabold ${isToday ? 'text-amber-400' : 'text-white'}`}>
                            {day.getDate()}{' '}
                            <span className="text-[10px] text-gray-500 font-normal">
                              {day.toLocaleDateString('pt-BR', { month: 'short' })}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenAdd(day)}
                          className="p-1 rounded-lg bg-gray-900 hover:bg-amber-500 hover:text-black text-gray-400 transition-colors"
                          title="Agendar neste dia"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Day Appointments List */}
                      <div className="space-y-2 flex-1 min-h-[140px] max-h-[360px] overflow-y-auto pr-1">
                        {dayApps.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center p-4 text-center border border-dashed border-gray-800/60 rounded-xl">
                            <span className="text-[10px] text-gray-600">Sem agendamentos</span>
                          </div>
                        ) : (
                          dayApps.map(app => (
                            <div
                              key={app.id}
                              onClick={() => handleOpenDetail(app)}
                              className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] ${
                                app.status === 'confirmed'
                                  ? 'bg-emerald-950/30 border-emerald-500/30'
                                  : app.status === 'concluded'
                                  ? 'bg-blue-950/30 border-blue-500/30'
                                  : app.status === 'cancelled'
                                  ? 'bg-red-950/20 border-red-500/20 line-through opacity-50'
                                  : 'bg-amber-950/30 border-amber-500/30'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 mb-0.5">
                                <span>
                                  {new Date(app.start_time).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {renderStatusBadge(app.status)}
                              </div>
                              <p className="text-xs font-bold text-white truncate">
                                {app.services?.name || app.service_name || 'Serviço'}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {app.client?.name || app.client_name || 'Cliente'}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Day Footer Summary */}
                      <div className="pt-2 border-t border-gray-800 text-[10px] text-gray-500 flex justify-between font-medium">
                        <span>Total: {dayApps.length}</span>
                        <button
                          onClick={() => {
                            setSelectedDate(day);
                            setViewMode('day');
                          }}
                          aria-label={`Ver detalhes do dia ${day.getDate()}`}
                          className="text-amber-500 hover:underline"
                        >
                          Ver Dia
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MONTH VIEW: Interactive Month Calendar Grid */}
          {viewMode === 'month' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-black/60 border border-gray-800 rounded-3xl p-4 shadow-xl">
                {/* Weekday Labels Header */}
                <div className="grid grid-cols-7 mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-amber-400/80">
                  <span>Dom</span>
                  <span>Seg</span>
                  <span>Ter</span>
                  <span>Qua</span>
                  <span>Qui</span>
                  <span>Sex</span>
                  <span>Sáb</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {monthDays.map((item, idx) => {
                    const isToday = isSameDay(item.date, new Date());
                    const isSelected = isSameDay(item.date, selectedDate);

                    const dayApps = activeApps.filter(app =>
                      isSameDay(new Date(app.start_time), item.date)
                    );

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedDate(item.date);
                        }}
                        className={`min-h-[75px] sm:min-h-[90px] p-2 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                          !item.currentMonth
                            ? 'bg-black/20 border-gray-900/60 opacity-30 text-gray-600'
                            : isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10'
                            : isToday
                            ? 'bg-gray-900 border-amber-500/60'
                            : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-extrabold ${
                              isToday
                                ? 'bg-amber-500 text-black px-1.5 py-0.5 rounded-md'
                                : item.currentMonth
                                ? 'text-white'
                                : 'text-gray-600'
                            }`}
                          >
                            {item.date.getDate()}
                          </span>
                          {dayApps.length > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
                              {dayApps.length}
                            </span>
                          )}
                        </div>

                        {/* Event Dots/Mini Titles */}
                        <div className="space-y-1 mt-1 overflow-hidden">
                          {dayApps.slice(0, 2).map(app => (
                            <div
                              key={app.id}
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenDetail(app);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[9px] truncate font-medium ${
                                app.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : app.status === 'concluded'
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {new Date(app.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}{' '}
                              - {app.services?.name || app.service_name || 'Atendimento'}
                            </div>
                          ))}
                          {dayApps.length > 2 && (
                            <p className="text-[8px] text-gray-500 font-bold pl-1">
                              +{dayApps.length - 2} mais
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Day Quick List in Month View */}
              <div className="bg-black/40 border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2">
                    <CalIcon size={14} className="text-amber-400" />
                    Agendamentos de{' '}
                    {selectedDate.toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h4>
                  <button
                    onClick={() => setViewMode('day')}
                    className="text-xs text-amber-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Abrir Visão Diária</span>
                    <ChevronRight size={12} />
                  </button>
                </div>

                {activeApps.filter(app => isSameDay(new Date(app.start_time), selectedDate))
                  .length === 0 ? (
                  <p className="text-xs text-gray-500 italic text-center py-4">
                    Nenhum agendamento para esta data selecionada.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeApps
                      .filter(app => isSameDay(new Date(app.start_time), selectedDate))
                      .map(app => (
                        <div
                          key={app.id}
                          onClick={() => handleOpenDetail(app)}
                          className="bg-gray-900 border border-gray-800 p-3 rounded-xl cursor-pointer hover:border-amber-500/40 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">
                              {app.services?.name || app.service_name || 'Procedimento'}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Cliente: {app.client?.name || app.client_name || 'Visitante'}
                            </p>
                            <p className="text-[10px] text-amber-400 font-semibold mt-1">
                              {new Date(app.start_time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          {renderStatusBadge(app.status)}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* APPOINTMENT DETAIL DRAWER / MODAL */}
      {showDetailModal && viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl space-y-0">
            {/* Modal Header */}
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Eye size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Detalhes do Agendamento</h4>
                  <p className="text-[10px] text-gray-400">Código ID: #{viewingApp.id?.substring(0, 8)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Status Header */}
              <div className="flex items-center justify-between bg-black/50 p-3 rounded-2xl border border-gray-800">
                <span className="text-xs text-gray-400 font-medium">Situação Atual:</span>
                {renderStatusBadge(viewingApp.status)}
              </div>

              {/* Service Info */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Serviço / Procedimento
                </label>
                <div className="p-3 bg-black/60 border border-gray-800 rounded-xl flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-bold text-white">
                      {viewingApp.services?.name || viewingApp.service_name || 'Procedimento'}
                    </h5>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock size={11} className="text-amber-400" />
                      Duração estimada: {viewingApp.duration_minutes || 60} min
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-400">
                      R$ {viewingApp.services?.price || viewingApp.service_price || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client & Professional Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-black/60 border border-gray-800 rounded-xl space-y-1">
                  <label className="text-[9px] font-bold uppercase text-gray-500 flex items-center gap-1">
                    <User size={10} className="text-amber-400" /> Cliente
                  </label>
                  <p className="text-xs font-bold text-white truncate">
                    {viewingApp.client?.name || viewingApp.client_name || 'Visitante'}
                  </p>
                  {viewingApp.client?.phone && (
                    <p className="text-[10px] text-gray-400 truncate">{viewingApp.client.phone}</p>
                  )}
                </div>

                <div className="p-3 bg-black/60 border border-gray-800 rounded-xl space-y-1">
                  <label className="text-[9px] font-bold uppercase text-gray-500 flex items-center gap-1">
                    <Scissors size={10} className="text-amber-400" /> Profissional
                  </label>
                  <p className="text-xs font-bold text-white truncate">
                    {viewingApp.professional?.name || 'Não atribuído'}
                  </p>
                </div>
              </div>

              {/* Date and Time */}
              <div className="p-3 bg-black/60 border border-gray-800 rounded-xl space-y-1">
                <label className="text-[9px] font-bold uppercase text-gray-500 flex items-center gap-1">
                  <CalIcon size={10} className="text-amber-400" /> Data e Horário
                </label>
                <p className="text-xs font-bold text-white">
                  {new Date(viewingApp.start_time).toLocaleString('pt-BR', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {viewingApp.status !== 'confirmed' && viewingApp.status !== 'concluded' && (
                    <button
                      onClick={() => handleUpdateStatus(viewingApp.id, 'confirmed')}
                      className="py-2.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Confirmar
                    </button>
                  )}

                  {viewingApp.status !== 'concluded' && (
                    <button
                      onClick={() => handleUpdateStatus(viewingApp.id, 'concluded')}
                      className="py-2.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} /> Concluir
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(viewingApp)}
                    className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Editar Horário
                  </button>
                  <button
                    onClick={() => handleCancelAppointment(viewingApp.id)}
                    className="py-2.5 px-4 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <XCircle size={14} /> Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT APPOINTMENT FORM MODAL */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSave}
            className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">
                {editingApp ? 'Editar Agendamento' : 'Novo Agendamento'}
              </h4>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                  Cliente
                </label>
                <select
                  required
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Selecione a cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                  Profissional
                </label>
                <select
                  required
                  value={profId}
                  onChange={e => setProfId(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Selecione o profissional...</option>
                  {professionals.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                  Serviço
                </label>
                <select
                  required
                  value={serviceId}
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Selecione o serviço...</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (R$ {s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                  Data & Horário
                </label>
                <input
                  required
                  type="datetime-local"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 ml-1 mb-1 block">
                  Status Inicial
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full p-2.5 bg-black border border-gray-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="pending">Pendente de Confirmação</option>
                  <option value="confirmed">Confirmado / Reservado</option>
                  <option value="concluded">Concluído</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-2">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex-1 py-3 bg-gray-900 text-gray-400 hover:text-white font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <Check size={18} />
                <span>{editingApp ? 'Atualizar Agendamento' : 'Criar Agendamento'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
