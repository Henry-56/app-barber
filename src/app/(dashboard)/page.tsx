import {
    DollarSign,
    Users,
    TrendingUp,
    Calendar,
    ArrowUpRight,
    Wallet,
    BarChart3
} from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/ui/pagination';

import { getDashboardMetrics } from '@/lib/actions/dashboard';
import { getRecentSales } from '@/lib/actions/sales';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const currentPage = Number(sp?.page) || 1;
    const pageSize = 10;

    const [metrics, recentSales] = await Promise.all([
        getDashboardMetrics(),
        getRecentSales(currentPage, pageSize)
    ]);

    const { totalPages } = recentSales;

    const stats = [
        { 
            name: 'Total del día (Neto)', 
            value: `S/ ${metrics.todayIncome.toFixed(2)}`, 
            icon: DollarSign, 
            trend: 'Hoy', 
            color: 'text-emerald-500',
            breakdown: [
                { label: 'Servicios (Neto)', value: `S/ ${(metrics.todayServicesNet || 0).toFixed(2)}` },
                { label: 'Membresías', value: `S/ ${(metrics.todayMembershipsIncome || 0).toFixed(2)}` },
                { label: 'Comisiones', value: `S/ ${(metrics.todayCommissions || 0).toFixed(2)}`, isNegative: true },
            ]
        },
        { name: 'Atenciones hoy', value: metrics.todayCuts.toString(), icon: Users, trend: 'Hoy', color: 'text-amber-500' },
        { name: 'Servicio Top', value: metrics.topService, icon: TrendingUp, trend: 'Pop.', color: 'text-blue-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="glass-card p-6 premium-gradient hover:border-amber-500/30 transition-all cursor-default group">
                        <div className="flex justify-between items-start">
                            <div className={stat.color}>
                                <stat.icon className="w-8 h-8 opacity-80" />
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3" />
                                {stat.trend}
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{stat.name}</p>
                            <h3 className="text-3xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                            
                            {stat.breakdown && (
                                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                                    {stat.breakdown.map((item) => (
                                        <div key={item.label} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-zinc-500">{item.label}</span>
                                            <span className={item.isNegative ? 'text-rose-500' : 'text-zinc-400'}>{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 gap-8">
                {/* Ventas Recientes */}
                <div className="glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Ventas Recientes</h3>
                        <Link href="/ventas" className="text-sm font-semibold text-amber-500 hover:text-amber-400 transition-colors">
                            Ver todas
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recentSales.sales.length === 0 ? (
                            <p className="text-center text-zinc-500 py-8">No hay ventas registradas hoy.</p>
                        ) : (
                            recentSales.sales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-amber-500">
                                            {sale.customer?.name ? sale.customer.name.substring(0, 2).toUpperCase() : 'C'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{sale.customer?.name || 'Cliente Casual'}</p>
                                            <p className="text-xs text-zinc-500">
                                                {sale.membershipPlan?.name || sale.service?.name || 'Servicio'} • {sale.barber?.name || 'Personal'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-500">S/ {sale.amountPaid}</p>
                                        <p className="text-[10px] text-zinc-600">
                                            {sale.createdAt ? formatDistanceToNow(sale.createdAt, { addSuffix: true, locale: es }) : 'Reciente'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <Pagination totalPages={totalPages} currentPage={currentPage} />
            </div>
        </div>
    );
}
