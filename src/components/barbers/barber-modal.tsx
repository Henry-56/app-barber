'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { createBarber } from '@/lib/actions/barbers';
import { useToast } from '@/components/ui/toast';

export function BarberModal() {
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        commissionRate: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const rate = parseFloat(formData.commissionRate);
        const finalRate = isNaN(rate) ? 50 : rate;

        const res = await createBarber({
            name: formData.name,
            commissionRate: finalRate,
        });

        setLoading(false);
        if (res.success) {
            showToast('Barbero registrado exitosamente', 'success');
            setIsOpen(false);
            setFormData({ name: '', commissionRate: '' });
        } else {
            showToast(res.error || 'No se pudo registrar el barbero', 'error');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-premium flex items-center gap-2"
            >
                <UserPlus className="w-4 h-4" />
                Registrar Barbero
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo Barbero">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Nombre del Barbero *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. Luis Rodríguez"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Porcentaje de Comisión (%) *</label>
                        <input
                            required
                            type="number"
                            min="0"
                            max="100"
                            value={formData.commissionRate}
                            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. 50"
                        />
                        <p className="text-[10px] text-zinc-500">El porcentaje que ganará por cada servicio realizado.</p>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-premium py-3 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Barbero'}
                    </button>
                </form>
            </Modal>
        </>
    );
}
