import { getRecentSales } from '@/lib/actions/sales';
import { getCustomers } from '@/lib/actions/customers';
import { getBarbers } from '@/lib/actions/barbers';
import { getServices } from '@/lib/actions/services';
import SaleForm from '@/components/sales/sale-form';
import Pagination from '@/components/ui/pagination';

interface PageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function SalesPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const currentPage = Number(sp?.page) || 1;
    const pageSize = 5;

    const [recentSalesData, barbers, services] = await Promise.all([
        getRecentSales(currentPage, pageSize),
        getBarbers(),
        getServices(),
    ]);

    const { sales: recentSales, totalPages } = recentSalesData;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Formulario de Registro */}
            <div className="xl:col-span-1">
                <SaleForm
                    barbers={barbers}
                    services={services}
                />
            </div>

            {/* Listado de Ventas Recientes */}
            <div className="xl:col-span-2 space-y-6">
                <div className="glass-card p-6">
                    <h3 className="text-xl font-bold mb-6">Atenciones Recientes</h3>
                    <div className="space-y-4">
                        {recentSales.length === 0 ? (
                            <p className="text-center text-zinc-500 py-8">No hay ventas registradas hoy.</p>
                        ) : (
                            recentSales.map((sale) => (
                                <div key={sale.id} className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs uppercase">
                                            {sale.customer?.name.substring(0, 2) || 'C'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{sale.customer?.name || 'Cliente Casual'}</p>
                                            <p className="text-xs text-zinc-500">{sale.membershipPlan?.name || sale.service?.name || 'Servicio'} • <span className="text-zinc-400">{sale.barber?.name || 'Sin asignar'}</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-amber-500">S/ {sale.amountPaid}</p>
                                        <p className="text-[10px] text-zinc-600 uppercase font-bold">{sale.paymentMethod}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <Pagination totalPages={totalPages} currentPage={currentPage} />

                {/* Resumen Rápido Detallado */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-4 bg-emerald-500/5 border-emerald-500/10 transition-all hover:bg-emerald-500/10">
                        <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-widest">Total del Día</p>
                        <p className="text-xl font-black mt-1">S/ {(recentSalesData.todayTotalIncome || 0).toFixed(2)}</p>
                    </div>
                    <div className="glass-card p-4 bg-blue-500/5 border-blue-500/10 transition-all hover:bg-blue-500/10">
                        <p className="text-[10px] text-blue-500 uppercase font-bold tracking-widest">Servicios (Neto)</p>
                        <p className="text-xl font-black mt-1">S/ {(recentSalesData.todayServicesNet || 0).toFixed(2)}</p>
                    </div>
                    <div className="glass-card p-4 bg-purple-500/5 border-purple-500/10 transition-all hover:bg-purple-500/10">
                        <p className="text-[10px] text-purple-500 uppercase font-bold tracking-widest">Membresías</p>
                        <p className="text-xl font-black mt-1">S/ {(recentSalesData.todayMembershipsIncome || 0).toFixed(2)}</p>
                    </div>
                    <div className="glass-card p-4 bg-rose-500/5 border-rose-500/10 transition-all hover:bg-rose-500/10">
                        <p className="text-[10px] text-rose-500 uppercase font-bold tracking-widest">Comisiones hoy</p>
                        <p className="text-xl font-black mt-1">S/ {(recentSalesData.todayCommissions || 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
