import { getMembershipPlans, getActiveSubscriptions } from '@/lib/actions/memberships';
import { getCustomers } from '@/lib/actions/customers';
import {
    Award,
    Plus,
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Scissors,
    Sparkles,
    User,
    History
} from 'lucide-react';
import { PlanModal } from '@/components/memberships/plan-modal';
import { AssignMembershipModal } from '@/components/memberships/assign-modal';

export default async function MembershipsPage() {
    const [plans, subscriptions, customers] = await Promise.all([
        getMembershipPlans(),
        getActiveSubscriptions(),
        getCustomers(''),
    ]);

    // Lógica de segmentación y renovación inteligente
    const activeSubs = subscriptions.filter(sub => {
        const benefitsJson = sub.benefits ? JSON.parse(sub.benefits) : {};
        const totalBenefits = Object.values(benefitsJson).reduce((acc: number, val) => acc + (val as number), 0);
        const isExpired = sub.endDate && new Date(sub.endDate) < new Date();
        const isExhausted = totalBenefits === 0;
        return !isExpired && !isExhausted && sub.status === 'active';
    });

    const inactiveSubs = subscriptions.filter(sub => !activeSubs.find(a => a.id === sub.id));

    // Agrupar para saber quién ya tiene algo activo
    const customerHasActive = new Set(activeSubs.map(s => s.customerId));
    
    // Encontrar la más reciente por cliente en los inactivos
    const mostRecentInactiveByCustomer = new Map();
    inactiveSubs.forEach(sub => {
        if (!mostRecentInactiveByCustomer.has(sub.customerId)) {
            mostRecentInactiveByCustomer.set(sub.customerId, sub.id);
        }
    });

    const BenefitIcon = ({ category }: { category: string }) => {
        switch (category.toLowerCase()) {
            case 'corte': return <Scissors className="w-3 h-3" />;
            case 'facial': return <Sparkles className="w-3 h-3" />;
            case 'barba': return <User className="w-3 h-3" />;
            default: return <Plus className="w-3 h-3" />;
        }
    };

    const SubscriptionTable = ({ subs, title, icon: Icon, showRenew = false }: { subs: any[], title: string, icon: any, showRenew?: boolean }) => (
        <section className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Icon className="w-5 h-5 text-amber-500" /> {title}
            </h2>
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-900/50 text-zinc-500 border-b border-zinc-800">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest">Cliente</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-center">Plan</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-center">Vence el</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-center">Beneficios Restantes</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                        {subs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-zinc-500 italic">No hay suscripciones en esta categoría.</td>
                            </tr>
                        ) : (
                            subs.map((sub) => {
                                const benefitsJson = sub.benefits ? JSON.parse(sub.benefits) : {};
                                const isExpired = sub.endDate && new Date(sub.endDate) < new Date();
                                const totalRemaining = Object.values(benefitsJson).reduce((acc: number, val) => acc + (val as number), 0);
                                const isExhausted = totalRemaining === 0;
                                const isActive = !isExpired && !isExhausted && sub.status === 'active';
                                
                                // Mostrar renovar si: no hay nada activo y es el más reciente inactivo
                                const canRenew = !customerHasActive.has(sub.customerId) && mostRecentInactiveByCustomer.get(sub.customerId) === sub.id;

                                return (
                                    <tr key={sub.id} className={`hover:bg-zinc-900/40 transition-colors ${!isActive ? 'opacity-50 grayscale-[0.3]' : ''}`}>
                                        <td className="p-4">
                                            <p className="font-semibold text-sm">{sub.customer.name}</p>
                                            <p className="text-[10px] text-zinc-500">{sub.customer.phone}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${isActive ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                                {sub.plan.name}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-xs ${isExpired ? 'text-rose-500' : 'text-zinc-400'}`}>
                                                {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-wrap justify-center gap-1.5">
                                                {Object.entries(benefitsJson).map(([cat, count]) => (
                                                    <div key={cat} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${ (count as number) > 0 ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
                                                        <BenefitIcon category={cat} />
                                                        <span className="text-[10px] font-black">{count as number}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end gap-2">
                                                {isActive ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-500">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span className="text-[10px] font-bold uppercase tracking-tighter">Vigente</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-1.5 text-rose-500/70 mb-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span className="text-[10px] font-bold uppercase tracking-tighter">
                                                                {isExhausted ? 'Agotada' : isExpired ? 'Vencida' : 'Inactiva'}
                                                            </span>
                                                        </div>
                                                        {canRenew && (
                                                            <AssignMembershipModal 
                                                                customers={customers.map(c => ({ id: c.id, name: c.name }))}
                                                                plans={plans.map(p => ({ id: p.id, name: p.name, config: p.config || '{}' }))}
                                                                defaultCustomerId={sub.customerId}
                                                                trigger={
                                                                    <button className="px-3 py-1.5 bg-amber-500 text-black text-[10px] font-black rounded-lg hover:bg-amber-400 transition-all uppercase shadow-lg shadow-amber-500/10 active:scale-95">
                                                                        Renovar Membresía
                                                                    </button>
                                                                }
                                                            />
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        Membresías <span className="text-amber-500 text-sm bg-amber-500/10 px-2 py-1 rounded-lg">PRO</span>
                    </h1>
                    <p className="text-zinc-500 text-sm">Gestiona tus planes de suscripción y fideliza a tus clientes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <AssignMembershipModal
                        customers={customers.map(c => ({ id: c.id, name: c.name }))}
                        plans={plans.map(p => ({ id: p.id, name: p.name, config: p.config || '{}' }))}
                    />
                    <PlanModal />
                </div>
            </div>

            {/* Planes Section */}
            <section className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" /> Planes Disponibles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className="glass-card p-6 relative overflow-hidden group border-zinc-800/50 hover:border-amber-500/30 transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Award className="w-16 h-16 text-amber-500" />
                            </div>
                            <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                            <p className="text-zinc-500 text-xs mb-6 uppercase font-bold tracking-widest">{plan.benefits || 'Membresía Premium'}</p>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-xs font-bold text-zinc-500">S/</span>
                                <span className="text-4xl font-black text-amber-500">{plan.price}</span>
                                <span className="text-xs font-bold text-zinc-500">/mes</span>
                            </div>
                            <button className="w-full py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors">
                                Configuración
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Suscripciones Vigentes */}
            <SubscriptionTable 
                subs={activeSubs} 
                title="Suscripciones Vigentes" 
                icon={CheckCircle2} 
            />

            {/* Historial */}
            <SubscriptionTable 
                subs={inactiveSubs} 
                title="Historial y Renovaciones" 
                icon={History} 
                showRenew={true}
            />
        </div>
    );
}
