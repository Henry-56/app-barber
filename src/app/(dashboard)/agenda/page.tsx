import { getAppointments } from '@/lib/actions/appointments';
import { getBarbers } from '@/lib/actions/barbers';
import { getCustomers } from '@/lib/actions/customers';
import { getServices } from '@/lib/actions/services';
import Link from 'next/link';
import {
    Calendar,
    Clock,
    Plus,
    User,
    Scissors,
    CheckCircle2,
    XCircle,
    MessageSquare,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { AppointmentModal } from '@/components/appointments/appointment-modal';
import { DatePickerFilter } from '@/components/appointments/date-picker-filter';

export default async function AgendaPage({
    searchParams
}: {
    searchParams: Promise<{ date?: string }>
}) {
    const params = await searchParams;
    const selectedDateStr = params.date || new Date().toISOString().split('T')[0];
    const selectedDate = new Date(selectedDateStr + 'T00:00:00');
    
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);
    
    const prevDay = new Date(selectedDate);
    prevDay.setDate(selectedDate.getDate() - 1);
    const prevDayStr = prevDay.toISOString().split('T')[0];
    const nextDayStr = nextDay.toISOString().split('T')[0];

    const [appointmentsList, barbers, customers, services] = await Promise.all([
        getAppointments(selectedDate, nextDay),
        getBarbers(),
        getCustomers(''),
        getServices()
    ]);

    const formattedDate = selectedDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Agenda <span className="text-zinc-500 text-sm font-normal uppercase tracking-widest">/ {formattedDate}</span>
                    </h1>
                    <p className="text-zinc-500 text-sm">Gestiona las reservas de tu negocio de manera eficiente.</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                        <Link 
                            href={`/agenda?date=${prevDayStr}`}
                            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        
                        <DatePickerFilter initialDate={selectedDateStr} />

                        <Link 
                            href={`/agenda?date=${nextDayStr}`}
                            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>

                    <AppointmentModal
                        customers={customers.map(c => ({ id: c.id, name: c.name }))}
                        barbers={barbers.map(b => ({ id: b.id, name: b.name }))}
                        services={services.map(s => ({ id: s.id, name: s.name, price: s.price }))}
                        defaultDate={selectedDateStr}
                    />
                </div>
            </div>

            {/* Barber Selector (Optional for filtering) */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button className="px-6 py-2 bg-amber-600/20 border border-amber-600/30 text-amber-500 rounded-full text-xs font-bold whitespace-nowrap">
                    Todos los Barberos
                </button>
                {barbers.map(barber => (
                    <button key={barber.id} className="px-6 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full text-xs font-bold whitespace-nowrap hover:bg-zinc-800 hover:text-white transition-all">
                        {barber.name}
                    </button>
                ))}
            </div>

            {/* Appointment Timeline List */}
            <div className="space-y-4">
                {appointmentsList.length === 0 ? (
                    <div className="p-12 glass-card text-center border-dashed border-zinc-800">
                        <Calendar className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500 italic">No hay citas programadas para hoy.</p>
                    </div>
                ) : (
                    appointmentsList.map((app) => (
                        <div key={app.id} className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-amber-500/30 transition-all">
                            <div className="flex items-center gap-6 w-full md:w-auto">
                                <div className="flex flex-col items-center justify-center p-3 bg-zinc-900 rounded-2xl border border-zinc-800 min-w-[80px]">
                                    <Clock className="w-4 h-4 text-amber-500 mb-1" />
                                    <span className="text-lg font-black">{app.appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        {app.customer.name}
                                        {app.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-1">
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                            <Scissors className="w-3 h-3" /> {app.service.name}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                            <User className="w-3 h-3" /> Con <span className="font-bold text-zinc-400">{app.barber.name}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                {app.status === 'scheduled' && (
                                    <>
                                        {app.customer.phone && (
                                            <a
                                                href={`https://wa.me/${app.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${app.customer.name}, te confirmo tu cita para ${app.service.name} el día ${app.appointmentTime.toLocaleDateString()} a las ${app.appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. ¡Te esperamos!`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 border border-emerald-500/20 transition-all flex items-center gap-2"
                                            >
                                                <MessageSquare className="w-3 h-3" /> WhatsApp
                                            </a>
                                        )}
                                        <button className="flex-1 md:flex-none px-6 py-2 bg-zinc-900 text-zinc-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/20 transition-all">
                                            Cancelar
                                        </button>
                                        <button className="flex-1 md:flex-none px-6 py-2 bg-amber-600/10 text-amber-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-600/20 border border-amber-600/20 transition-all">
                                            Confirmar Llegada
                                        </button>
                                    </>
                                )}
                                {app.status === 'completed' && (
                                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl">
                                        Completado
                                    </span>
                                )}
                                {app.status === 'cancelled' && (
                                    <span className="text-[10px] font-black uppercase text-red-500 tracking-widest bg-red-500/10 px-4 py-2 rounded-xl">
                                        Cancelado
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
}
