'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { createCustomer } from '@/lib/actions/customers';
import { useToast } from '@/components/ui/toast';

export function CustomerModal() {
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        dni: '',
        phone: '',
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Convert current state into action format
        const res = await createCustomer({
            name: formData.name,
            dni: formData.dni || undefined,
            phone: formData.phone || undefined,
            notes: formData.notes || undefined,
        });

        setLoading(false);
        if (res.success) {
            showToast('Cliente registrado exitosamente', 'success');
            setIsOpen(false);
            setFormData({ name: '', dni: '', phone: '', notes: '' });
        } else {
            showToast(res.error || 'No se pudo registrar el cliente', 'error');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-premium flex items-center gap-2"
            >
                <UserPlus className="w-4 h-4" />
                Registrar Cliente
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo Cliente">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">DNI / Identificación</label>
                        <input
                            type="text"
                            value={formData.dni}
                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. 12345678"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Nombre Completo *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Teléfono</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. 987654321"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Notas Especiales</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white resize-none"
                            placeholder="Preferencias de corte, productos alérgicos, etc..."
                            rows={3}
                        />
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-premium py-3 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cliente'}
                    </button>
                </form>
            </Modal>
        </>
    );
}
