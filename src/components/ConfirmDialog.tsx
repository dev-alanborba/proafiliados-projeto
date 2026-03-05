'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'danger' | 'warning'
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onCancel()
    }, [onCancel])

    useEffect(() => {
        if (open) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [open, handleKeyDown])

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm"
                        onClick={onCancel}
                        aria-hidden="true"
                    />

                    {/* Dialog */}
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="confirm-dialog-title"
                        aria-describedby="confirm-dialog-desc"
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed left-1/2 top-1/2 z-[301] -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4"
                    >
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                                    variant === 'danger' ? "bg-red-500/10 border border-red-500/20" : "bg-amber-500/10 border border-amber-500/20"
                                )}>
                                    <AlertTriangle className={cn(
                                        "w-6 h-6",
                                        variant === 'danger' ? "text-red-400" : "text-amber-400"
                                    )} />
                                </div>
                                <button
                                    onClick={onCancel}
                                    aria-label="Fechar"
                                    className="p-2 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-colors -mt-1 -mr-2"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <h2 id="confirm-dialog-title" className="text-lg font-black text-white tracking-tight">
                                    {title}
                                </h2>
                                <p id="confirm-dialog-desc" className="text-sm text-muted font-medium leading-relaxed">
                                    {description}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-muted bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-all"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className={cn(
                                        "flex-1 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                        variant === 'danger'
                                            ? "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                                            : "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                    )}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
