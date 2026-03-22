'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { createService } from '@/lib/actions/services';
import { useToast } from '@/components/ui/toast';

export function ServiceModal() {
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: 'corte',
        durationMinutes: '30',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const price = parseFloat(formData.price);
        const duration = parseInt(formData.durationMinutes, 10);

        const res = await createService({
            name: formData.name,
            price: isNaN(price) ? 0 : price,
            category: formData.category,
            durationMinutes: isNaN(duration) ? 30 : duration,
        });

        setLoading(false);
        if (res.success) {
            showToast('Servicio guardado exitosamente', 'success');
            setIsOpen(false);
            setFormData({ name: '', price: '', category: 'corte', durationMinutes: '30' });
        } else {
            showToast(res.error || 'No se pudo guardar el servicio', 'error');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-premium flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Nuevo Servicio
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo Servicio">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Nombre del Servicio *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. Corte Clásico"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Precio (S/) *</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.10"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. 40.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Categoría</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                        >
                            <option value="corte">Corte</option>
                            <option value="facial">Lavado/Facial</option>
                            <option value="barba">Barba/Perfilado</option>
                            <option value="otro">Otro</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Duración (Minutos) *</label>
                        <input
                            required
                            type="number"
                            min="5"
                            step="5"
                            value={formData.durationMinutes}
                            onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. 30"
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-premium py-3 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Servicio'}
                    </button>
                </form>
            </Modal>
        </>
    );
}
