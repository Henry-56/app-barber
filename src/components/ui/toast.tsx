'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto
                            flex items-center gap-3 px-4 py-3 rounded-2xl border min-w-[300px]
                            animate-in slide-in-from-right duration-300
                            ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
                            ${toast.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : ''}
                            ${toast.type === 'info' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : ''}
                            backdrop-blur-md shadow-2xl
                        `}
                    >
                        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 shrink-0" />}
                        
                        <p className="text-sm font-semibold flex-1">{toast.message}</p>
                        
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 opacity-50" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
