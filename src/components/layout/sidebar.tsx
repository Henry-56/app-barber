import Link from 'next/link';
import {
    Users,
    Scissors,
    ShoppingBag,
    DollarSign,
    Calendar,
    Award,
    LayoutDashboard,
    TrendingUp,
    BarChart3,
    ChevronRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
    { name: 'Ventas', icon: ShoppingBag, href: '/ventas' },
    { name: 'Clientes', icon: Users, href: '/clientes' },
    { name: 'Barberos', icon: Scissors, href: '/barberos' },
    { name: 'Servicios', icon: TrendingUp, href: '/servicios' },
    { name: 'Membresías', icon: Award, href: '/membresias' },
    { name: 'Reportes', icon: BarChart3, href: '/reportes' },
];

export default function Sidebar() {
    return (
        <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-900 fixed left-0 top-0 hidden md:flex flex-col">
            <div className="p-8">
                <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                    <span className="text-amber-500">BARBER</span>
                    <span className="text-zinc-400">PRO</span>
                </h1>
                <p className="text-[10px] text-zinc-600 font-medium tracking-[0.2em] mt-1">MANAGEMENT SYSTEM</p>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                            "hover:bg-amber-500/10 hover:text-amber-500 text-zinc-400"
                        )}
                    >
                        <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
                    <p className="text-xs text-zinc-500">Plan</p>
                    <p className="text-sm font-semibold text-amber-500">Administrador</p>
                    <button className="w-full mt-3 py-2 text-xs font-bold bg-amber-600/10 text-amber-500 rounded-lg hover:bg-amber-600/20 transition-colors">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </aside>
    );
}
