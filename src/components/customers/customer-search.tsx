'use client';

import { Search, X } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useEffect } from 'react';

export function CustomerSearch() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [value, setValue] = useState(searchParams.get('q') || '');

    const handleSearch = useCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        params.delete('page'); // Reset pagination if any
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (value !== (searchParams.get('q') || '')) {
                handleSearch(value);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [value, handleSearch, searchParams]);

    const clearSearch = () => {
        setValue('');
        handleSearch('');
    };

    return (
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Buscar solo por DNI..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-10 text-sm focus:outline-none focus:border-amber-500/50 transition-colors text-white"
            />
            {value && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <X className="w-3 h-3 text-zinc-500" />
                </button>
            )}
        </div>
    );
}
