import { getCommissionsReport } from '@/lib/actions/commissions';
import {
    BarChart3,
    Wallet,
    Users,
    ArrowUp,
    Coins,
    Award
} from 'lucide-react';
import Link from 'next/link';
import Pagination from '@/components/ui/pagination';

interface PageProps {
    searchParams: Promise<{ page?: string; filter?: string }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const currentPage = Number(sp?.page) || 1;
    const filter = sp?.filter || 'hoy';
    const pageSize = 10;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate = new Date(today);
    let endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    if (filter === 'mes') {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (filter === '30d') {
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
    }

    const report = await getCommissionsReport(startDate, endDate, currentPage, pageSize);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reportes y Finanzas</h1>
                    <p className="text-zinc-500 text-sm">Análisis detallado de ingresos y comisiones.</p>
                </div>
                <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
                    {[
                        { id: 'hoy', label: 'Hoy' },
                        { id: 'mes', label: 'Este Mes' },
                        { id: '30d', label: 'Últimos 30 días' },
                    ].map((btn) => (
                        <Link
                            key={btn.id}
                            href={`/reportes?filter=${btn.id}`}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === btn.id
                                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                            }`}
                        >
                            {btn.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Financial KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Wallet className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Servicios Bruto</p>
                    </div>
                    <p className="text-3xl font-black">S/ {(report?.totals?.grossServices || 0).toFixed(2)}</p>
                </div>

                <div className="glass-card p-6 border-l-4 border-rose-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <Coins className="w-5 h-5 text-rose-500" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Total Comisiones</p>
                    </div>
                    <p className="text-3xl font-black text-rose-500">S/ {(report?.totals?.totalCommission || 0).toFixed(2)}</p>
                </div>

                <div className="glass-card p-6 border-l-4 border-purple-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <Award className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Membresías</p>
                    </div>
                    <p className="text-3xl font-black">S/ {(report?.totals?.membershipsIncome || 0).toFixed(2)}</p>
                </div>

                <div className="glass-card p-6 border-l-4 border-emerald-500 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Utilidad Neta</p>
                    </div>
                    <p className="text-3xl font-black text-emerald-500 relative z-10">
                        S/ {(report?.totals?.totalNet || 0).toFixed(2)}
                    </p>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                         <BarChart3 className="w-16 h-16 text-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Commissions Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-zinc-900/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Desglose por Barbero</h3>
                    <Users className="w-5 h-5 text-zinc-600" />
                </div>
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-zinc-900/50 text-zinc-500">
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest">Barbero</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-center">Cant. Servicios</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-right">Ventas Totales</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-center">Tasa %</th>
                            <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-right text-amber-500">Comisión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                        {report.data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-zinc-500 italic">No hay datos para este periodo.</td>
                            </tr>
                        ) : (
                            report.data.map((row: any) => (
                                <tr key={row.barberName} className="hover:bg-zinc-900/40 transition-colors">
                                    <td className="p-4 font-semibold">{row.barberName}</td>
                                    <td className="p-4 text-center">{row.totalSales}</td>
                                    <td className="p-4 text-right">S/ {Number(row.totalAmount || 0).toFixed(2)}</td>
                                    <td className="p-4 text-center">{parseFloat(row.commissionRate).toFixed(0)}%</td>
                                    <td className="p-4 text-right font-black text-amber-500">S/ {Number(row.totalCommission || 0).toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination totalPages={report.totalPages} currentPage={currentPage} />
        </div>
    );
}
