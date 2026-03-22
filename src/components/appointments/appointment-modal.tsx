'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { createAppointment } from '@/lib/actions/appointments';

type OptionList = {
    id: string;
    name: string;
};

interface AppointmentModalProps {
    customers: OptionList[];
    barbers: OptionList[];
    services: OptionList[];
    defaultDate?: string;
}

export function AppointmentModal({ customers, barbers, services, defaultDate }: AppointmentModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerId: '',
        barberId: '',
        serviceId: '',
        time: '',
        date: defaultDate || new Date().toISOString().split('T')[0], // YYYY-MM-DD
    });

    // Sincronizar fecha si cambia el filtro de la página
    useEffect(() => {
        if (defaultDate) {
            setFormData(prev => ({ ...prev, date: defaultDate }));
        }
    }, [defaultDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerId || !formData.barberId || !formData.serviceId || !formData.time) {
            alert('Por favor completa todos los campos.');
            return;
        }

        setLoading(true);

        // Create a local Date object combining selected date and time
        const appointmentDate = new Date(`${formData.date}T${formData.time}`);

        const res = await createAppointment({
            customerId: formData.customerId,
            barberId: formData.barberId,
            serviceId: formData.serviceId,
            appointmentTime: appointmentDate,
        });

        setLoading(false);
        if (res.success) {
            setIsOpen(false);
            setFormData({ ...formData, customerId: '', barberId: '', serviceId: '', time: '' });
        } else {
            alert(res.error);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-premium flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Nueva Cita
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Agendar Nueva Cita">
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Cliente *</label>
                        <select
                            required
                            value={formData.customerId}
                            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white appearance-none"
                        >
                            <option value="" disabled>Seleccionar Cliente</option>
                            {customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Barbero *</label>
                        <select
                            required
                            value={formData.barberId}
                            onChange={(e) => setFormData({ ...formData, barberId: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white appearance-none"
                        >
                            <option value="" disabled>Seleccionar Barbero</option>
                            {barbers.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Servicio *</label>
                        <select
                            required
                            value={formData.serviceId}
                            onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white appearance-none"
                        >
                            <option value="" disabled>Seleccionar Servicio</option>
                            {services.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Fecha *</label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Hora *</label>
                            <input
                                required
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-premium py-3 mt-4 disabled:opacity-50"
                    >
                        {loading ? 'Agendando...' : 'Confirmar Cita'}
                    </button>
                </form>
            </Modal>
        </>
    );
}
