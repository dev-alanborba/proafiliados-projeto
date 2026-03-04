'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    ShieldCheck,
    Search,
    MoreVertical,
    DollarSign,
    RefreshCw,
    AlertCircle,
    Zap,
    Lock,
    ArrowUpRight
} from 'lucide-react'
import { cn } from "@/lib/utils"

import { loginAdmin, logoutAdmin, isAdminAuthenticated } from '@/lib/actions/admin'
import { fetchAdminDashboard, type AdminUser, type AdminStats } from '@/lib/actions/admin-data'

// Define prop types for GlobalStatCard
interface GlobalStatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: 'primary' | 'secondary' | 'warning';
}

// GlobalStatCard component definition
const GlobalStatCard: React.FC<GlobalStatCardProps> = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        primary: 'bg-primary/10 border-primary/20 text-primary',
        secondary: 'bg-secondary/10 border-secondary/20 text-secondary',
        warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    };

    return (
        <div className={cn(
            "p-6 rounded-3xl border shadow-lg flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
            colorClasses[color]
        )}>
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted">{title}</span>
                <Icon className="w-4 h-4 opacity-50" />
            </div>
            <span className="text-3xl font-black tracking-tighter">{value}</span>
        </div>
    );
};

export default function MasterPanelPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | false>(false)
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [stats, setStats] = useState<AdminStats>({
        totalUsers: 0,
        paidUsers: 0,
        unpaidUsers: 0,
        activeSessions: 0,
        totalLinks: 0,
        mrr: 0
    })

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(false)

        const formData = new FormData()
        formData.append('username', username)
        formData.append('password', password)

        const result = await loginAdmin(formData)

        if (result.success) {
            setIsAuthenticated(true)
            fetchData()
        } else {
            setError(result.error || 'Credenciais inválidas')
            setTimeout(() => setError(false), 3000)
        }
    }

    const handleLogout = async () => {
        await logoutAdmin()
        setIsAuthenticated(false)
    }

    const fetchData = async () => {
        setLoading(true)
        try {
            const data = await fetchAdminDashboard()
            setUsers(data.users)
            setStats(data.stats)
        } catch (err) {
            console.error('Erro ao buscar dados:', err)
        }
        setLoading(false)
    }

    // Filter users based on tab and search
    const filteredUsers = users.filter(u => {
        const matchesFilter = filter === 'all' || (filter === 'paid' ? u.status === 'Pago' : u.status === 'Pendente')
        const matchesSearch = !searchQuery ||
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.id.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    useEffect(() => {
        const checkAuth = async () => {
            const auth = await isAdminAuthenticated()
            if (auth) {
                setIsAuthenticated(true)
                fetchData()
            }
        }
        checkAuth()
    }, [])

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans text-white">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full animate-pulse delay-700" />
                </div>

                <div className="w-full max-w-md relative z-10 bg-[#0a0a0a]/40 backdrop-blur-2xl border border-white/5 shadow-2xl transition-all duration-500 hover:border-white/10 p-10 rounded-[2.5rem] space-y-8">
                    <div className="text-center space-y-2">
                        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 group hover:scale-110 transition-all duration-500 shadow-2xl shadow-primary/20">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Acesso Root</h1>
                        <p className="text-xs text-muted font-black uppercase tracking-[0.2em]">Autenticação de Controle Mestre</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Usuário do Sistema</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nome de Usuário"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary/50 focus:bg-black/60 transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-4">Chave de Segurança</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold focus:border-primary/50 focus:bg-black/60 transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-[10px] font-black uppercase tracking-widest justify-center bg-red-500/5 py-3 rounded-xl border border-red-500/20 animate-shake">
                                <AlertCircle className="w-3.5 h-3.5" /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
                        >
                            <span>Inicializar Sessão</span>
                            <ArrowUpRight className="w-4 h-4 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </button>
                    </form>

                    <p className="text-[9px] text-muted text-center font-bold uppercase tracking-widest opacity-30 mt-8">
                        Apenas Pessoal Autorizado • Node v20.10.0 • DB: Supabase Cluster
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-12 bg-[#050505] min-h-screen text-white font-sans pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em]">Ambiente Restrito: Root Admin</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase tracking-tighter">Painel <span className="text-primary italic">Mestre</span></h1>
                    <p className="text-muted font-medium">Controle global e monitoramento de infraestrutura.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end px-6 py-2 border-r border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted">Status do Sistema</span>
                        <span className="text-xs font-bold text-emerald-400">Todos os Sistemas Operantes</span>
                    </div>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest backdrop-blur-md"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-primary", loading && "animate-spin")} /> Sincronizar
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-8 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl hover:bg-red-500/20 transition-all text-xs font-black uppercase tracking-widest backdrop-blur-md text-red-500"
                    >
                        <Lock className="w-4 h-4" /> Sair
                    </button>
                </div>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <GlobalStatCard title="Total de Contas" value={stats.totalUsers} icon={Users} color="primary" />
                <GlobalStatCard title="Pagantes" value={stats.paidUsers} icon={ShieldCheck} color="secondary" />
                <GlobalStatCard title="Sem Plano" value={stats.unpaidUsers} icon={AlertCircle} color="warning" />
                <GlobalStatCard title="Links Capturados" value={stats.totalLinks} icon={Zap} color="primary" />
                <GlobalStatCard title="MRR Projetado" value={`R$ ${stats.mrr}`} icon={DollarSign} color="secondary" />
            </div>

            {/* User List & Filter */}
            <div className="bg-[#0a0a0a]/40 backdrop-blur-2xl border border-white/5 shadow-2xl transition-all duration-500 hover:border-white/10 rounded-[2.5rem] overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-30" />

                <div className="p-8 border-b border-white/5 flex flex-col gap-6 bg-white/[0.01]">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 bg-black/40 border border-white/5 px-6 py-4 rounded-2xl w-full max-w-2xl group focus-within:border-primary/50 transition-all backdrop-blur-sm">
                            <Search className="w-5 h-5 text-muted group-focus-within:text-primary transition-all" />
                            <input
                                type="text"
                                placeholder="Pesquisar usuários por Nome, Email ou ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-[10px] font-black text-muted uppercase tracking-widest bg-white/5 px-6 py-2.5 rounded-xl border border-white/5 backdrop-blur-md">
                                Banco de Dados: <span className="text-white ml-1">{stats.totalUsers} Registros</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-3">
                        {[
                            { key: 'all' as const, label: 'Todos', count: stats.totalUsers },
                            { key: 'paid' as const, label: 'Pagantes', count: stats.paidUsers },
                            { key: 'unpaid' as const, label: 'Sem Plano', count: stats.unpaidUsers },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={cn(
                                    "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95",
                                    filter === tab.key
                                        ? "bg-primary/10 text-primary border-primary/30 shadow-lg shadow-primary/10"
                                        : "bg-white/5 text-muted border-white/5 hover:bg-white/10 hover:border-white/10"
                                )}
                            >
                                {tab.label} <span className="ml-2 opacity-60">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Identificação</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Tier</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Recursos em Uso</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Membro Desde</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && filteredUsers.length === 0 ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-10 py-12">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl" />
                                                <div className="space-y-2 flex-grow">
                                                    <div className="h-4 bg-white/5 rounded w-1/4" />
                                                    <div className="h-3 bg-white/5 rounded w-1/3 opacity-50" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20">
                                            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 mb-2">
                                                <Search className="w-10 h-10" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-[0.3em]">Nenhum registro encontrado no banco mestre</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-primary/[0.02] transition-all duration-300 group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center text-primary font-black border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-500 shadow-xl overflow-hidden">
                                                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity" />
                                                    {user.name[0]}
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                                                        <ShieldCheck className="w-3 h-3 text-primary" />
                                                    </div>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-base font-black text-white tracking-tight">{user.name}</p>
                                                    <p className="text-xs text-muted font-bold lowercase tracking-wider">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <span className={cn(
                                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg backdrop-blur-sm transition-all group-hover:scale-105",
                                                user.plan === 'Enterprise' ? "bg-secondary/10 text-secondary border-secondary/20 shadow-secondary/5" :
                                                    user.plan === 'Professional' ? "bg-primary/10 text-primary border-primary/20 shadow-primary/5" :
                                                        user.plan ? "bg-white/5 text-muted border-white/10" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            )}>
                                                {user.plan || 'Sem Plano'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className="flex flex-col gap-2.5 min-w-[140px]">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.1em]">
                                                    <span className="text-muted/60">Sessões</span>
                                                    <span className="text-primary">{user.sessions} <span className="text-muted font-bold">/ 10</span></span>
                                                </div>
                                                <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
                                                        style={{ width: `${(user.sessions / 10) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-8">
                                            <div className={cn(
                                                "inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-[0.1em] backdrop-blur-sm",
                                                user.status === 'Pago' ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" : "bg-amber-500/5 text-amber-400 border-amber-500/10"
                                            )}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_10px]", user.status === 'Pago' ? 'bg-emerald-400' : 'bg-amber-400')} />
                                                {user.status === 'Pago' ? 'Pago' : 'Pendente'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-8 text-xs text-muted font-bold uppercase tracking-widest">{user.joined}</td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl text-muted hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg active:scale-95">
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                                <button className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl text-muted hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all shadow-lg active:scale-95">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01] backdrop-blur-md">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-50">Exibindo {filteredUsers.length} de {stats.totalUsers} registros globais</p>
                    <div className="flex gap-3">
                        <button disabled className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed transition-all">Anterior</button>
                        <button className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-lg">Próxima Página</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

