'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
    totalPages: number;
    currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                disabled={currentPage <= 1}
                onClick={() => router.push(createPageURL(1))}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            >
                <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
                disabled={currentPage <= 1}
                onClick={() => router.push(createPageURL(currentPage - 1))}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 mx-2">
                <span className="text-sm font-bold text-amber-500">{currentPage}</span>
                <span className="text-sm text-zinc-600">de</span>
                <span className="text-sm font-medium text-zinc-400">{totalPages}</span>
            </div>

            <button
                disabled={currentPage >= totalPages}
                onClick={() => router.push(createPageURL(currentPage + 1))}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
            <button
                disabled={currentPage >= totalPages}
                onClick={() => router.push(createPageURL(totalPages))}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-500 hover:border-amber-500/30 disabled:opacity-30 disabled:hover:text-zinc-400 transition-all"
            >
                <ChevronsRight className="w-4 h-4" />
            </button>
        </div>
    );
}
