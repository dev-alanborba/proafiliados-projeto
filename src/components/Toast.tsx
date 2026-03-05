'use client'

import { useEffect } from 'react'
import { CheckCircle2, X, Info, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastProps {
    message: string
    type?: 'success' | 'info' | 'error'
    onClose: () => void
    duration?: number
}

export function Toast({ message, type = 'info', onClose, duration = 3500 }: ToastProps) {
    useEffect(() => {
        const t = setTimeout(onClose, duration)
        return () => clearTimeout(t)
    }, [onClose, duration])

    return (
        <div className={cn(
            "fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-300 whitespace-nowrap",
            type === 'success' && "bg-[#050505] border-secondary/30 text-secondary",
            type === 'info'    && "bg-[#050505] border-primary/30 text-primary",
            type === 'error'   && "bg-[#050505] border-red-500/30 text-red-400",
        )}>
            {type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {type === 'info'    && <Info className="w-4 h-4 shrink-0" />}
            {type === 'error'   && <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message}</span>
            <button onClick={onClose} className="ml-1 opacity-40 hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}
