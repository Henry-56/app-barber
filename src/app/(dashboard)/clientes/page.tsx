import { getCustomers } from '@/lib/actions/customers';
import {
    UserPlus,
    Search,
    MoreHorizontal,
    Phone,
    Calendar,
    ChevronRight
} from 'lucide-react';
import { CustomerModal } from '@/components/customers/customer-modal';
import { CustomerSearch } from '@/components/customers/customer-search';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
    const sp = await searchParams;
    const query = sp.q || '';
    const customersList = await getCustomers(query);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-zinc-500 text-sm">Gestiona la base de datos de tus clientes y su historial.</p>
                </div>
                <CustomerModal />
            </div>

            {/* Search and Filters */}
            <div className="glass-card p-4 flex gap-4 items-center">
                <CustomerSearch />
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors">
                        Frecuentes
                    </button>
                    <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors">
                        Nuevos
                    </button>
                </div>
            </div>

            {/* Customers List */}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-900/50 border-b border-zinc-800">
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Cliente</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest hidden md:table-cell">Contacto</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest hidden lg:table-cell">Última Visita</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Estado</th>
                            <th className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {customersList.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-zinc-500 italic">
                                    No se encontraron clientes.
                                </td>
                            </tr>
                        ) : (
                            customersList.map((customer) => (
                                <tr key={customer.id} className="hover:bg-zinc-900/40 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs">
                                                {customer.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">{customer.name}</p>
                                                <p className="text-[10px] text-zinc-500 font-medium">Desde {customer.createdAt?.toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Phone className="w-3 h-3" />
                                                <span className="text-xs">{customer.phone || 'Sin teléfono'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-xs">{customer.lastVisit ? customer.lastVisit.toLocaleDateString() : 'Nunca'}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-tighter">
                                            Activo
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2 outline-none">
                                            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                                <MoreHorizontal className="w-4 h-4 text-zinc-500" />
                                            </button>
                                            <Link href={`/clientes/${customer.id}`} className="p-2 hover:bg-amber-500/10 rounded-lg transition-colors group/link">
                                                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover/link:text-amber-500" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
