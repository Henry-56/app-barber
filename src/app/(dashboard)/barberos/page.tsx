import { getBarbers } from '@/lib/actions/barbers';
import {
    Scissors,
    Percent,
    TrendingUp,
    Settings,
    Circle
} from 'lucide-react';
import { BarberModal } from '@/components/barbers/barber-modal';

export default async function BarbersPage() {
    const barbersList = await getBarbers();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Barberos</h1>
                    <p className="text-zinc-500 text-sm">Gestiona tu equipo, comisiones y niveles de productividad.</p>
                </div>
                <BarberModal />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {barbersList.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 p-12 glass-card text-center">
                        <Scissors className="w-12 h-12 text-amber-500/20 mx-auto mb-4" />
                        <p className="text-zinc-500">No hay barberos registrados aún.</p>
                    </div>
                ) : (
                    barbersList.map((barber) => (
                        <div key={barber.id} className="glass-card overflow-hidden group hover:border-amber-500/30 transition-all">
                            <div className="h-24 bg-zinc-900 premium-gradient relative">
                                <div className="absolute -bottom-10 left-6">
                                    <div className="h-20 w-20 rounded-2xl bg-black border-4 border-zinc-950 flex items-center justify-center shadow-2xl">
                                        <span className="text-2xl font-black text-amber-500">{barber.name.charAt(0)}</span>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4">
                                    <button className="p-2 bg-black/40 backdrop-blur-md rounded-lg hover:bg-black/60 transition-colors">
                                        <Settings className="w-4 h-4 text-zinc-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 pt-12">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold">{barber.name}</h3>
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                                        <Circle className="w-2 h-2 fill-current" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{barber.status}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                            <Percent className="w-3 h-3" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Comisión</span>
                                        </div>
                                        <p className="text-lg font-bold">{parseFloat(barber.commissionRate).toFixed(0)}%</p>
                                    </div>
                                    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-zinc-500 mb-1">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="text-[10px] uppercase font-bold tracking-wider">Servicios</span>
                                        </div>
                                        <p className="text-lg font-bold">{(barber as any).sales?.length || 0}</p>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-3 border border-zinc-800 rounded-xl text-xs font-bold hover:bg-zinc-900 transition-colors uppercase tracking-widest text-zinc-400 hover:text-white">
                                    Ver Historial Completo
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
}
