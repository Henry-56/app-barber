'use client';

import { useState } from 'react';
import { createSale } from '@/lib/actions/sales';
import { getCustomerActiveMembership } from '@/lib/actions/memberships';
import { getCustomerByDni } from '@/lib/actions/customers';
import { ShoppingBag, User, Scissors, TrendingUp, CreditCard, Star, Search, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface SaleFormProps {
    barbers: any[];
    services: any[];
}

export default function SaleForm({ barbers, services }: SaleFormProps) {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [activeMembership, setActiveMembership] = useState<any>(null);
    const [useMembership, setUseMembership] = useState(false);
    const [dni, setDni] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [formData, setFormData] = useState<{
        customerId: string;
        barberId?: string;
        serviceId: string;
        paymentMethod: 'efectivo' | 'yape' | 'plin' | 'tarjeta';
    }>({
        customerId: '',
        barberId: undefined,
        serviceId: '',
        paymentMethod: 'efectivo',
    });

    const handleSearchDni = async () => {
        if (!dni) return;
        setSearching(true);
        const customer = await getCustomerByDni(dni);
        setSearching(false);

        if (customer) {
            setSelectedCustomer(customer);
            setFormData(prev => ({ ...prev, customerId: customer.id }));

            // Buscar membresía
            const membership = await getCustomerActiveMembership(customer.id);
            setActiveMembership(membership);
        } else {
            showToast('Cliente no encontrado. Se registrará como cliente casual si continúas.', 'info');
            setSelectedCustomer(null);
            setFormData(prev => ({ ...prev, customerId: '' }));
            setActiveMembership(null);
        }
    };

    const clearCustomer = () => {
        setDni('');
        setSelectedCustomer(null);
        setFormData(prev => ({ ...prev, customerId: '' }));
        setActiveMembership(null);
        setUseMembership(false);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.serviceId) {
            showToast('Por favor selecciona un servicio', 'error');
            return;
        }

        setLoading(true);
        const selectedService = services.find(s => s.id === formData.serviceId);

        const res = await createSale({
            ...formData,
            customerId: formData.customerId || undefined,
            amountPaid: useMembership ? 0 : parseFloat(selectedService.price),
            membershipId: useMembership ? activeMembership?.id : undefined,
        });

        setLoading(false);
        if (res.success) {
            showToast('Venta registrada con éxito', 'success');
            setFormData({
                customerId: '',
            barberId: undefined,
                serviceId: '',
                paymentMethod: 'efectivo',
            });
            setSelectedCustomer(null);
            setDni('');
            setActiveMembership(null);
            setUseMembership(false);
        } else {
            showToast(res.error || 'No se pudo registrar la venta', 'error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-amber-500 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-black" />
                </div>
                <h3 className="text-xl font-bold">Nueva Venta</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cliente por DNI */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                        <User className="w-3 h-3" /> DNI Cliente
                    </label>

                    {!selectedCustomer ? (
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={dni}
                                    onChange={(e) => setDni(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchDni())}
                                    placeholder="Buscar por DNI..."
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-amber-500 outline-none transition-colors"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleSearchDni}
                                disabled={searching || !dni}
                                className="px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {searching ? '...' : <Search className="w-4 h-4" />}
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-[10px]">
                                    {selectedCustomer.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{selectedCustomer.name}</p>
                                    <p className="text-[10px] text-zinc-500">DNI: {selectedCustomer.dni}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={clearCustomer}
                                className="p-1 hover:bg-zinc-700 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-zinc-500" />
                            </button>
                        </div>
                    )}

                    {activeMembership && (
                        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 mt-2 animate-in fade-in slide-in-from-top-1 duration-500">
                            <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-amber-500 rounded-lg shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                        <Star className="w-3.5 h-3.5 text-black fill-black" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest leading-none">{activeMembership.plan.name}</p>
                                        <p className="text-[8px] text-zinc-500 font-bold uppercase mt-1">Membresía Activa</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-zinc-500 uppercase">Beneficios disponibles</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {(() => {
                                    try {
                                        const rawBenefits = activeMembership.benefits;
                                        let benefits: Record<string, number> = {};

                                        if (rawBenefits) {
                                            const parsed = JSON.parse(rawBenefits);
                                            if (typeof parsed === 'object' && parsed !== null) {
                                                benefits = parsed;
                                            } else if (typeof parsed === 'number') {
                                                benefits = { corte: parsed }; // Mapeo legado
                                            }
                                        }

                                        const selectedService = services.find(s => s.id === formData.serviceId);
                                        const activeCategory = selectedService?.category || 'corte';

                                        return Object.entries(benefits).map(([cat, count]) => {
                                            const isMatch = cat === activeCategory;
                                            const hasUnits = (count as number) > 0;

                                            return (
                                                <div
                                                    key={cat}
                                                    className={`relative group p-3 rounded-2xl border transition-all duration-500 ${isMatch
                                                        ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.05)] scale-[1.02]'
                                                        : 'bg-zinc-900/40 border-zinc-800/50 opacity-50 grayscale scale-95'
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className={`p-2 rounded-xl transition-colors ${isMatch ? 'bg-amber-500/20' : 'bg-zinc-800'}`}>
                                                            {cat === 'corte' && <Scissors className={`w-4 h-4 ${isMatch ? 'text-amber-500' : 'text-zinc-500'}`} />}
                                                            {cat === 'facial' && <TrendingUp className={`w-4 h-4 ${isMatch ? 'text-amber-500' : 'text-zinc-500'}`} />}
                                                            {cat === 'barba' && <User className={`w-4 h-4 ${isMatch ? 'text-amber-500' : 'text-zinc-500'}`} />}
                                                        </div>
                                                        <div className="text-center">
                                                            <p className={`text-[8px] font-black uppercase tracking-tighter ${isMatch ? 'text-amber-500' : 'text-zinc-500'}`}>{cat}</p>
                                                            <p className={`text-xl font-black leading-none mt-1 ${isMatch ? 'text-white' : 'text-zinc-500'}`}>{count as number}</p>
                                                        </div>
                                                    </div>

                                                    {isMatch && useMembership && (
                                                        <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-black p-1 rounded-full shadow-lg ring-2 ring-black animate-bounce">
                                                            <Star className="w-2.5 h-2.5 fill-current" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    } catch (e) {
                                        return <div className="col-span-3 p-4 text-center text-[10px] text-zinc-500 italic">Formato de beneficios no reconocido</div>;
                                    }
                                })()}
                            </div>

                            {formData.serviceId && (() => {
                                const selectedService = services.find(s => s.id === formData.serviceId);
                                try {
                                    const rawBenefits = activeMembership.benefits;
                                    let benefits: Record<string, number> = {};

                                    if (rawBenefits) {
                                        const parsed = JSON.parse(rawBenefits);
                                        if (typeof parsed === 'object' && parsed !== null) {
                                            benefits = parsed;
                                        } else if (typeof parsed === 'number') {
                                            benefits = { corte: parsed };
                                        }
                                    }

                                    const category = selectedService?.category || 'corte';
                                    const hasUnits = (benefits[category] || 0) > 0;

                                    if (selectedService) {
                                        return (
                                            <div className="flex flex-col gap-3 mt-1 pt-4 border-t border-amber-500/10">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Servicio Seleccionado</p>
                                                        <p className="text-xs font-black text-white uppercase">{selectedService.name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Categoría</p>
                                                        <p className={`text-xs font-black uppercase ${hasUnits ? 'text-amber-500' : 'text-red-500'}`}>{category}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={!hasUnits}
                                                    onClick={() => setUseMembership(!useMembership)}
                                                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${useMembership
                                                        ? 'bg-amber-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                                                        : 'bg-zinc-900 text-amber-500 border border-amber-500/30 hover:bg-amber-500/10 disabled:opacity-20 disabled:grayscale'
                                                        }`}
                                                >
                                                    {useMembership ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <Star className="w-4 h-4 fill-current" /> CANJEANDO BENEFICIO
                                                        </span>
                                                    ) : (
                                                        hasUnits ? `CANJEAR 1 ${category.toUpperCase()}` : `SIN ${category.toUpperCase()} DISPONIBLES`
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    }
                                } catch (e) { }
                                return null;
                            })()}
                        </div>
                    )}

                    {!selectedCustomer && dni && !searching && (
                        <p className="text-[10px] text-center text-zinc-600 italic mt-1">
                            Presiona Enter para buscar
                        </p>
                    )}
                </div>


                {/* Servicio */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                        <TrendingUp className="w-3 h-3" /> Servicio
                    </label>
                    <select
                        required
                        value={formData.serviceId}
                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors"
                    >
                        <option value="">Seleccionar Servicio...</option>
                        {services.map(s => (
                            <option key={s.id} value={s.id}>{s.name} - S/ {s.price}</option>
                        ))}
                    </select>
                </div>

                {/* Barbero */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                        <Scissors className="w-3 h-3" /> Barbero
                    </label>
                    <select
                        value={formData.barberId || ''}
                        onChange={(e) => setFormData({ ...formData, barberId: e.target.value || undefined })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors"
                    >
                        <option value="">Seleccionar Barbero...</option>
                        {barbers.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {/* Pago */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                        <CreditCard className="w-3 h-3" /> Método de Pago
                    </label>
                    <select
                        disabled={useMembership}
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                        className={`w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm focus:border-amber-500 outline-none transition-colors ${useMembership ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="efectivo">Efectivo</option>
                        <option value="yape">Yape</option>
                        <option value="plin">Plin</option>
                        <option value="tarjeta">Tarjeta</option>
                    </select>
                </div>
            </div>

            <button
                disabled={loading}
                type="submit"
                className="w-full btn-premium py-4 text-lg mt-4 disabled:opacity-50"
            >
                {loading ? 'Registrando...' : 'Registrar Cobro'}
            </button>
        </form>
    );
}
