import { getServices } from '@/lib/actions/services';
import {
    Plus,
    Settings2,
    Clock,
    Tag,
    Sparkles
} from 'lucide-react';
import { ServiceModal } from '@/components/services/service-modal';

export default async function ServicesPage() {
    const servicesList = await getServices();

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
                    <p className="text-zinc-500 text-sm">Define el catálogo de servicios, precios y duraciones.</p>
                </div>
                <ServiceModal />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {servicesList.length === 0 ? (
                    <div className="md:col-span-2 lg:col-span-3 p-12 glass-card text-center">
                        <Sparkles className="w-12 h-12 text-amber-500/20 mx-auto mb-4" />
                        <p className="text-zinc-500">Aún no hay servicios configurados.</p>
                        <button className="text-amber-500 font-bold mt-2 hover:underline">
                            Crea tu primer servicio ahora
                        </button>
                    </div>
                ) : (
                    servicesList.map((service) => (
                        <div key={service.id} className="glass-card p-6 premium-gradient group hover:border-amber-500/40 transition-all">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                </div>
                                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                    <Settings2 className="w-4 h-4 text-zinc-500" />
                                </button>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold">{service.name}</h3>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">{service.durationMinutes} min</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-400">
                                        <Tag className="w-4 h-4" />
                                        <span className="text-xs font-medium">Cat. Premium</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Inversión</p>
                                    <p className="text-2xl font-black text-amber-500 mt-1">S/ {service.price}</p>
                                </div>
                                <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors">
                                    Detalles
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
}
