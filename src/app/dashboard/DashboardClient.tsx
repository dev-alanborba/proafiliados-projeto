'use client'

import { Sidebar } from '@/components/Sidebar'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function DashboardClient({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex bg-[#0a0a0a] min-h-screen text-foreground overflow-x-hidden">
            <Sidebar />
            <main className="flex-grow md:ml-64 p-4 pt-20 md:pt-8 md:p-8 pb-32 md:pb-8">
                <div className="max-w-6xl mx-auto">
                    <ErrorBoundary fallback={
                        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                            <div className="text-center space-y-3">
                                <h2 className="text-2xl font-black text-white">Erro ao carregar</h2>
                                <p className="text-muted text-sm">Ocorreu um erro ao renderizar esta página.</p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all"
                            >
                                Recarregar Página
                            </button>
                        </div>
                    }>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </ErrorBoundary>
                </div>
            </main>
        </div>
    )
}
