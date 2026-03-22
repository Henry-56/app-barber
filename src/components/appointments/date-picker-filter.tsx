'use client';

import { useRouter } from 'next/navigation';
import { Calendar } from 'lucide-react';

export function DatePickerFilter({ initialDate }: { initialDate: string }) {
    const router = useRouter();

    return (
        <div className="px-4 py-2 text-xs font-bold text-zinc-300 flex items-center border-x border-zinc-800">
            <Calendar className="w-3.5 h-3.5 mr-2 text-amber-500" />
            <input 
                type="date" 
                defaultValue={initialDate}
                onChange={(e) => {
                    router.push(`/agenda?date=${e.target.value}`);
                }}
                className="bg-transparent border-none outline-none text-zinc-200 cursor-pointer [color-scheme:dark]"
            />
        </div>
    );
}
