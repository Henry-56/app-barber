'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="glass-card w-full max-w-md bg-zinc-950 border border-zinc-800/50 p-6 relative z-10 animate-in fade-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-900 rounded-xl transition-all text-zinc-500 hover:text-white group"
                    >
                        <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
