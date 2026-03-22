import Sidebar from '@/components/layout/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-black text-white">
            <Sidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-8 animate-in fade-in duration-500">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-zinc-500 text-sm font-medium">Panel de Control</h2>
                        <h1 className="text-2xl font-bold">Vista General</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                            <span className="text-amber-500 font-bold">H</span>
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
