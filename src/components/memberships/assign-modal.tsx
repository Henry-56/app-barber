'use client';

import { useState } from 'react';
import { UserPlus, Award, ChevronDown, CheckCircle2, Star } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { subscribeCustomer } from '@/lib/actions/memberships';
import { useToast } from '@/components/ui/toast';

interface OptionList {
    id: string;
    name: string;
}

interface PlanOption {
    id: string;
    name: string;
    config: string; // JSON
}

interface AssignMembershipModalProps {
    customers: OptionList[];
    plans: PlanOption[];
    defaultCustomerId?: string;
    trigger?: React.ReactNode;
}

export function AssignMembershipModal({ customers, plans, defaultCustomerId, trigger }: AssignMembershipModalProps) {
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerId: defaultCustomerId || '',
        planId: '',
        paymentMethod: 'efectivo' as 'efectivo' | 'yape' | 'plin' | 'tarjeta',
    });

    const selectedPlan = plans.find(p => p.id === formData.planId);
    const selectedCustomer = customers.find(c => c.id === formData.customerId);
    const benefits = selectedPlan ? JSON.parse(selectedPlan.config) : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerId || !formData.planId) {
            showToast('Por favor selecciona un cliente y un plan.', 'error');
            return;
        }

        setLoading(true);

        const res = await subscribeCustomer({
            customerId: formData.customerId,
            planId: formData.planId,
            months: 1,
            paymentMethod: formData.paymentMethod,
        });

        setLoading(false);
        if (res.success) {
            showToast('Membresía asignada exitosamente', 'success');
            setIsOpen(false);
            if (!defaultCustomerId) {
                setFormData({ customerId: '', planId: '', paymentMethod: 'efectivo' });
            }
        } else {
            showToast(res.error || 'No se pudo asignar la membresía', 'error');
        }
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="px-4 py-2 bg-amber-600/10 text-amber-500 rounded-xl text-xs font-bold hover:bg-amber-600/20 border border-amber-600/20 transition-all flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Asignar a Cliente
                </button>
            )}

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={defaultCustomerId ? "Renovar Membresía" : "Asignar Membresía"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Sección de Cliente */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <UserPlus className="w-3 h-3" /> Cliente
                        </label>
                        {defaultCustomerId ? (
                            <div className="p-4 rounded-2xl bg-zinc-900 border border-amber-500/20 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black">
                                        {selectedCustomer?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{selectedCustomer?.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Cliente seleccionado</p>
                                    </div>
                                </div>
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                            </div>
                        ) : (
                            <div className="relative group">
                                <select
                                    required
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-amber-500 outline-none transition-all text-white appearance-none hover:bg-zinc-800/50"
                                >
                                    <option value="" disabled>Seleccionar Cliente</option>
                                    {customers.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-amber-500 transition-colors" />
                            </div>
                        )}
                    </div>

                    {/* Sección de Plan */}
                    <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Award className="w-3 h-3" /> Plan de Membresía
                            </label>
                            <div className="relative group">
                                <select
                                    required
                                    value={formData.planId}
                                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-amber-500 outline-none transition-all text-white appearance-none hover:bg-zinc-800/50"
                                >
                                    <option value="" disabled>Seleccionar un Plan...</option>
                                    {plans.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-amber-500 transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                <Star className="w-3 h-3" /> Método de Pago
                            </label>
                            <div className="relative group">
                                <select
                                    required
                                    value={formData.paymentMethod}
                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-sm focus:border-amber-500 outline-none transition-all text-white appearance-none hover:bg-zinc-800/50"
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="yape">Yape</option>
                                    <option value="plin">Plin</option>
                                    <option value="tarjeta">Tarjeta</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none group-hover:text-amber-500 transition-colors" />
                            </div>
                        </div>
                    </div>

                    {/* Resumen de Beneficios */}
                    {benefits && (
                        <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Resumen de beneficios</p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(benefits).map(([cat, count]) => (
                                    <div key={cat} className="bg-black/40 p-3 rounded-xl border border-zinc-800/50 text-center">
                                        <p className="text-[9px] text-zinc-500 font-bold uppercase mb-1">{cat}</p>
                                        <p className="text-xl font-black text-white">{count as number}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                                <p className="text-[10px] text-zinc-500 font-medium">Vigencia recomendada</p>
                                <p className="text-[10px] font-bold text-white uppercase bg-zinc-800 px-2 py-1 rounded-md">30 Días</p>
                            </div>
                        </div>
                    )}

                    <button
                        disabled={loading || !formData.planId}
                        type="submit"
                        className="w-full btn-premium py-4 rounded-2xl text-base font-black uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all shadow-[0_10px_30px_rgba(245,158,11,0.1)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.2)]"
                    >
                        {loading ? 'Procesando...' : defaultCustomerId ? 'Renovar Ahora' : 'Confirmar Membresía'}
                    </button>
                </form>
            </Modal>
        </>
    );
}
