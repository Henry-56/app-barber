'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { createMembershipPlan } from '@/lib/actions/memberships';
import { useToast } from '@/components/ui/toast';

export function PlanModal() {
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        benefits: '',
        config: {
            corte: 0,
            facial: 0,
            barba: 0
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const price = parseFloat(formData.price);

        const res = await createMembershipPlan({
            name: formData.name,
            price: isNaN(price) ? 0 : price,
            benefits: formData.benefits || undefined,
            config: JSON.stringify(formData.config),
        });

        setLoading(false);
        if (res.success) {
            showToast('Plan de membresía creado exitosamente', 'success');
            setIsOpen(false);
            setFormData({
                name: '',
                price: '',
                benefits: '',
                config: { corte: 0, facial: 0, barba: 0 }
            });
        } else {
            showToast(res.error || 'No se pudo crear el plan', 'error');
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn-premium flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Nuevo Plan
            </button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nuevo Plan de Membresía">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Nombre del Plan *</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. Plan VIP Semestral"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Precio del Plan (S/) *</label>
                        <input
                            required
                            type="number"
                            min="0"
                            step="0.10"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white"
                            placeholder="Ej. 150.00"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Descripción de Beneficios (Texto)</label>
                        <textarea
                            value={formData.benefits}
                            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors text-white resize-none"
                            placeholder="Ej. 4 Cortes + 2 Perfilados de barba al mes"
                            rows={2}
                        />
                    </div>

                    <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Configuración de Contadores</p>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.keys(formData.config).map((key) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-[10px] text-zinc-500 capitalize">{key}</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.config[key as keyof typeof formData.config]}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            config: { ...formData.config, [key]: parseInt(e.target.value) || 0 }
                                        })}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs focus:border-amber-500 outline-none transition-colors text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full btn-premium py-3 mt-2 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Crear Plan'}
                    </button>
                </form>
            </Modal>
        </>
    );
}
