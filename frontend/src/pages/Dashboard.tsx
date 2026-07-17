import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
    BookOpen, Copy, CheckCircle, Tag, GitBranch,
    ArrowRight, RotateCcw, TrendingUp, RefreshCw
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../api/library';
import type { Stats, Book } from '../types';

const COLORS = ['#0d9488', '#2dd4bf', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#0f766e', '#22c55e'];

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentBooks, setRecentBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        try {
            const [s, books] = await Promise.all([api.getStats(), api.getBooks()]);
            setStats(s);
            setRecentBooks(books.slice(-5).reverse());
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const refresh = () => { setRefreshing(true); load(); };

    const categoryData = stats
        ? Object.entries(stats.books_per_category)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
        : [];

    const yearData = stats
        ? Object.entries(stats.books_per_year)
            .map(([year, count]) => ({ year: Number(year), count }))
            .sort((a, b) => a.year - b.year)
        : [];

    const availData = stats
        ? [
            { name: 'Available', value: stats.available_copies },
            { name: 'Borrowed', value: stats.total_borrowed },
        ]
        : [];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>Dashboard</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                        Library overview & AVL Tree statistics
                    </p>
                </div>
                <motion.button
                    onClick={refresh}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-xl transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.6, repeat: refreshing ? Infinity : 0 }}>
                        <RefreshCw size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                    </motion.div>
                </motion.button>
            </motion.div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Books" value={stats?.total_books ?? 0} icon={BookOpen} color="indigo" loading={loading}
                    description="Unique titles in catalogue" />
                <StatCard title="Total Copies" value={stats?.total_copies ?? 0} icon={Copy} color="purple" loading={loading}
                    description="Across all titles" />
                <StatCard title="Available" value={stats?.available_copies ?? 0} icon={CheckCircle} color="emerald" loading={loading}
                    description="Ready to borrow" />
                <StatCard title="Categories" value={stats?.categories ?? 0} icon={Tag} color="amber" loading={loading}
                    description="Subject areas" />
                <StatCard title="AVL Height" value={stats?.avl_height ?? 0} icon={GitBranch} color="rose" loading={loading}
                    description="Tree depth (log n)" />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Books by Category */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="glass-card p-5 lg:col-span-2"
                >
                    <h2 className="section-title mb-4">Books by Category</h2>
                    {loading ? (
                        <div className="skeleton h-48 rounded-xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                                <XAxis dataKey="name" tick={{ fill: 'rgba(160,160,200,0.7)', fontSize: 11 }} angle={-30} textAnchor="end" />
                                <YAxis tick={{ fill: 'rgba(160,160,200,0.7)', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(22,22,38,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {categoryData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Available vs Borrowed */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-card p-5"
                >
                    <h2 className="section-title mb-2">Copy Status</h2>
                    <p className="text-xs mb-4" style={{ color: 'rgb(var(--text-muted))' }}>Available vs Borrowed</p>
                    {loading ? (
                        <div className="skeleton h-48 rounded-xl" />
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={availData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                        {availData.map((_, i) => (
                                            <Cell key={i} fill={i === 0 ? '#10b981' : '#f43f5e'} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(22,22,38,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-around mt-4">
                                {availData.map((d, i) => (
                                    <div key={d.name} className="text-center">
                                        <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: i === 0 ? '#10b981' : '#f43f5e' }} />
                                        <div className="text-xs font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>{d.value}</div>
                                        <div className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{d.name}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Year chart + recent books + rotations */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Year distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="glass-card p-5 lg:col-span-2"
                >
                    <h2 className="section-title mb-4">Books by Publication Year</h2>
                    {loading ? (
                        <div className="skeleton h-40 rounded-xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={yearData}>
                                <XAxis dataKey="year" tick={{ fill: 'rgba(160,160,200,0.7)', fontSize: 11 }} />
                                <YAxis tick={{ fill: 'rgba(160,160,200,0.7)', fontSize: 11 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(22,22,38,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }}
                                />
                                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Recent AVL Rotations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="glass-card p-5"
                >
                    <h2 className="section-title mb-4 flex items-center gap-2">
                        <RotateCcw size={16} className="text-indigo-400" />
                        Recent Rotations
                    </h2>
                    {loading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
                        </div>
                    ) : stats?.rotation_history.length === 0 ? (
                        <div className="py-8 text-center">
                            <GitBranch size={28} className="mx-auto mb-2 opacity-20" style={{ color: 'rgb(var(--text-muted))' }} />
                            <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>No rotations recorded yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2 overflow-y-auto max-h-48">
                            {[...(stats?.rotation_history || [])].reverse().map((r, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="rounded-xl p-3 flex items-start gap-2"
                                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}
                                >
                                    <span className="badge badge-amber shrink-0 text-xs">{r.type}</span>
                                    <span className="text-xs leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
                                        at ISBN {r.pivot.slice(-6)}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recently added books */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                className="glass-card p-5"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="section-title">Recently Added Books</h2>
                    <Link to="/books">
                        <button className="text-xs flex items-center gap-1" style={{ color: 'rgb(var(--accent-primary))' }}>
                            View all <ArrowRight size={13} />
                        </button>
                    </Link>
                </div>
                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence>
                            {recentBooks.map((b, i) => (
                                <motion.div
                                    key={b.isbn}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="flex items-center gap-4 p-3 rounded-xl group hover:bg-white/[0.02] transition-colors duration-150"
                                    style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: `${COLORS[i % COLORS.length]}20` }}>
                                        <BookOpen size={14} style={{ color: COLORS[i % COLORS.length] }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--text-primary))' }}>{b.title}</p>
                                        <p className="text-xs truncate" style={{ color: 'rgb(var(--text-muted))' }}>{b.author} · {b.category}</p>
                                    </div>
                                    <span className={`badge ${b.available_copies > 0 ? 'badge-emerald' : 'badge-rose'} shrink-0`}>
                                        {b.available_copies > 0 ? 'Available' : 'Unavailable'}
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>

            {/* Quick links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { to: '/books', icon: BookOpen, label: 'Browse Catalogue', color: '#6366f1' },
                    { to: '/add', icon: TrendingUp, label: 'Add New Book', color: '#a855f7' },
                    { to: '/search', icon: '🔍', label: 'Advanced Search', color: '#10b981' },
                    { to: '/avl', icon: GitBranch, label: 'AVL Visualizer', color: '#f59e0b' },
                ].map((item, i) => (
                    <Link key={item.to} to={item.to}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                            whileHover={{ y: -4 }}
                            className="glass-card p-4 flex flex-col items-center text-center gap-2 cursor-pointer"
                            style={{
                                borderColor: `${item.color}20`,
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                                {typeof item.icon === 'string'
                                    ? <span className="text-lg">{item.icon}</span>
                                    : <item.icon size={18} style={{ color: item.color }} />
                                }
                            </div>
                            <span className="text-xs font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>{item.label}</span>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
