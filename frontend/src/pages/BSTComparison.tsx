import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api/library';
import { TrendingUp, GitBranch, AlertTriangle, CheckCircle, Info, BarChart2 } from 'lucide-react';

interface CompareData {
    total_books: number;
    avl_height: number;
    bst_sorted_height: number;
    bst_random_height: number;
    ideal_height: number;
    avl_complexity: string;
    bst_worst_complexity: string;
    explanation: string;
    insert_orders: { sorted: string[]; interleaved: string[] };
}

// A single animated height bar
function HeightBar({ label, height, maxHeight, color, sublabel, icon }: {
    label: string; height: number; maxHeight: number;
    color: string; sublabel: string; icon: React.ReactNode;
}) {
    const pct = maxHeight > 0 ? Math.max(6, (height / maxHeight) * 100) : 6;
    return (
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="text-xs font-semibold text-center" style={{ color: 'rgb(var(--text-muted))' }}>{label}</div>
            <div className="relative w-full rounded-xl bg-white/5 border border-white/5 flex flex-col justify-end overflow-hidden" style={{ height: 160 }}>
                <motion.div
                    className="w-full rounded-lg flex items-end justify-center pb-2"
                    style={{ background: color, minHeight: 16 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                >
                    <span className="text-white text-base font-bold drop-shadow-sm">{height}</span>
                </motion.div>
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-center mt-1 w-full" style={{ color: 'rgb(var(--text-muted))' }}>
                {icon}
                <span className="truncate max-w-[130px]">{sublabel}</span>
            </div>
        </div>
    );
}

// Shows one ISBN step in insert-order list
function IsbnStep({ isbn, idx }: { isbn: string; idx: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.025, duration: 0.2 }}
            className="flex items-center gap-2 text-xs px-2 py-1 rounded"
            style={{ background: 'rgba(255,255,255,0.04)' }}
        >
            <span style={{ color: 'rgb(var(--text-muted))' }} className="w-5 text-right shrink-0">{idx + 1}.</span>
            <span className="font-mono" style={{ color: 'rgb(var(--text-secondary))' }}>{isbn}</span>
        </motion.div>
    );
}

export default function BSTComparison() {
    const [data, setData] = useState<CompareData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeOrder, setActiveOrder] = useState<'sorted' | 'interleaved'>('sorted');

    useEffect(() => {
        api.getCompare()
            .then(setData)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-96">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-10 h-10 border-2 border-t-teal-400 rounded-full"
                style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'rgb(45,212,191)' }}
            />
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-96 gap-3 text-rose-400">
            <AlertTriangle size={20} />
            <span>{error}. Make sure the backend is running.</span>
        </div>
    );

    if (!data) return null;

    const maxH = Math.max(data.avl_height, data.bst_sorted_height, data.bst_random_height, data.ideal_height, 1);
    const optimality = ((data.avl_height - data.ideal_height) / Math.max(data.ideal_height, 1) * 100).toFixed(0);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-lg" style={{ background: 'rgba(45,212,191,0.15)' }}>
                        <BarChart2 size={22} className="text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                            BST vs AVL Tree — Performance Comparison
                        </h1>
                        <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                            Live comparison using your {data.total_books} books — same data, different data structures
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: 'AVL Height', value: data.avl_height,
                        color: '#10b981', icon: <CheckCircle size={16} />, desc: 'Guaranteed O(log n)'
                    },
                    {
                        label: 'BST Sorted Insert', value: data.bst_sorted_height,
                        color: '#f43f5e', icon: <AlertTriangle size={16} />, desc: 'Worst case — near O(n)'
                    },
                    {
                        label: 'BST Mixed Insert', value: data.bst_random_height,
                        color: '#f59e0b', icon: <TrendingUp size={16} />, desc: 'Better but unpredictable'
                    },
                    {
                        label: 'Ideal (log₂ n)', value: data.ideal_height,
                        color: '#6366f1', icon: <Info size={16} />, desc: 'Theoretical minimum'
                    },
                ].map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.35 }}
                        className="rounded-xl p-4"
                        style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                        <div className="flex items-center gap-2 mb-2" style={{ color: m.color }}>
                            {m.icon}
                            <span className="text-xs font-semibold">{m.label}</span>
                        </div>
                        <div className="text-3xl font-bold mb-1" style={{ color: m.color }}>{m.value}</div>
                        <div className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{m.desc}</div>
                    </motion.div>
                ))}
            </div>

            {/* Height Bar Chart */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl p-6"
                style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div className="flex items-center gap-2 mb-6">
                    <GitBranch size={18} className="text-teal-400" />
                    <h2 className="font-semibold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>Tree Height Comparison</h2>
                    <span className="ml-auto text-xs px-2 py-1 rounded-full font-mono"
                        style={{ background: 'rgba(45,212,191,0.12)', color: 'rgb(45,212,191)' }}>
                        n = {data.total_books} books
                    </span>
                </div>

                <div className="flex items-end gap-4 mt-6" style={{ minHeight: 220 }}>
                    <HeightBar
                        label="AVL Tree" height={data.avl_height} maxHeight={maxH}
                        color="linear-gradient(180deg, #10b981, #059669)"
                        sublabel="Guaranteed O(log n)"
                        icon={<CheckCircle size={12} className="text-emerald-400" />}
                    />
                    <HeightBar
                        label="BST (sorted)" height={data.bst_sorted_height} maxHeight={maxH}
                        color="linear-gradient(180deg, #f43f5e, #be123c)"
                        sublabel="Worst case — near O(n)"
                        icon={<AlertTriangle size={12} className="text-rose-400" />}
                    />
                    <HeightBar
                        label="BST (mixed)" height={data.bst_random_height} maxHeight={maxH}
                        color="linear-gradient(180deg, #f59e0b, #d97706)"
                        sublabel="Avg case — random order"
                        icon={<TrendingUp size={12} className="text-amber-400" />}
                    />
                    <HeightBar
                        label="Ideal log₂(n)" height={data.ideal_height} maxHeight={maxH}
                        color="linear-gradient(180deg, #6366f1, #4f46e5)"
                        sublabel="Theoretical minimum"
                        icon={<Info size={12} className="text-indigo-400" />}
                    />
                </div>

                {/* Insight pills */}
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ background: 'rgba(244,63,94,0.12)', color: '#f43f5e' }}>
                        🔴 BST (sorted) is {(data.bst_sorted_height / Math.max(1, data.avl_height)).toFixed(1)}x taller than AVL — O(n) degeneration
                    </div>
                    <div className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                        ✅ AVL is only ~{optimality}% above ideal height
                    </div>
                    <div className="text-xs px-3 py-1.5 rounded-full font-medium"
                        style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
                        📐 Ideal log₂({data.total_books}) ≈ {data.ideal_height}
                    </div>
                </div>
            </motion.div>

            {/* Explanation */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-6"
                style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div className="flex items-center gap-2 mb-3">
                    <Info size={18} className="text-amber-400" />
                    <h2 className="font-semibold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>Why does this happen?</h2>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {data.explanation}
                </p>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    {/* BST degeneration visual */}
                    <div className="rounded-xl p-4" style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                        <div className="text-xs font-bold mb-3 text-rose-400">❌ Plain BST — Sorted Insert (Linked List!)</div>
                        <pre className="text-xs font-mono leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>
                            {`ISBN-A
  \\
  ISBN-B
     \\
     ISBN-C
        \\
        ISBN-D  ← O(n) to reach!
           \\
           ISBN-E`}
                        </pre>
                        <div className="text-xs mt-3 text-rose-400">Height = n = {data.bst_sorted_height} steps</div>
                    </div>

                    {/* AVL balanced visual */}
                    <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div className="text-xs font-bold mb-3 text-emerald-400">✅ AVL Tree — Always Balanced</div>
                        <pre className="text-xs font-mono leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>
                            {`        ISBN-C
       /       \\
   ISBN-B     ISBN-D
   /    \\         \\
ISBN-A  ISBN-B2  ISBN-E`}
                        </pre>
                        <div className="text-xs mt-3 text-emerald-400">Height = log₂(n) = {data.avl_height} steps always</div>
                    </div>
                </div>
            </motion.div>

            {/* Complexity Table */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl p-6"
                style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                <h2 className="font-semibold text-lg mb-4" style={{ color: 'rgb(var(--text-primary))' }}>📊 Complexity Summary</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {['Operation', 'Plain BST (avg)', 'Plain BST (sorted)', 'AVL Tree'].map(h => (
                                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wide"
                                        style={{ color: 'rgb(var(--text-muted))' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ['Search', 'O(log n)', 'O(n) ❌', 'O(log n) ✅'],
                                ['Insert', 'O(log n)', 'O(n) ❌', 'O(log n) ✅'],
                                ['Delete', 'O(log n)', 'O(n) ❌', 'O(log n) ✅'],
                                ['Height guarantee', 'None ❌', 'None ❌', 'log₂(n) ✅'],
                                ['Self-balancing?', 'No ❌', 'No ❌', 'Yes ✅'],
                            ].map(([op, avg, worst, avl], i) => (
                                <tr key={op}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                                    <td className="py-2.5 px-3 font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{op}</td>
                                    <td className="py-2.5 px-3 font-mono text-amber-400">{avg}</td>
                                    <td className="py-2.5 px-3 font-mono text-rose-400">{worst}</td>
                                    <td className="py-2.5 px-3 font-mono text-emerald-400">{avl}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Insert Order Explorer */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="rounded-2xl p-6"
                style={{ background: 'rgb(var(--surface))', border: '1px solid rgba(255,255,255,0.07)' }}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>🔢 Insert Order Explorer</h2>
                    <div className="flex gap-2">
                        {(['sorted', 'interleaved'] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setActiveOrder(mode)}
                                className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200"
                                style={{
                                    background: activeOrder === mode ? 'rgba(45,212,191,0.18)' : 'rgba(255,255,255,0.05)',
                                    color: activeOrder === mode ? 'rgb(45,212,191)' : 'rgb(var(--text-muted))',
                                    border: activeOrder === mode ? '1px solid rgba(45,212,191,0.4)' : '1px solid transparent',
                                }}
                            >
                                {mode === 'sorted' ? '🔴 Sorted (worst)' : '🟡 Interleaved (better)'}
                            </button>
                        ))}
                    </div>
                </div>
                <p className="text-xs mb-3" style={{ color: 'rgb(var(--text-muted))' }}>
                    {activeOrder === 'sorted'
                        ? `Sorted ISBNs → BST becomes a right-skewed chain of height ${data.bst_sorted_height}`
                        : `Interleaved ISBNs → BST height = ${data.bst_random_height}, closer to balanced`}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 max-h-64 overflow-y-auto pr-1">
                    {(activeOrder === 'sorted' ? data.insert_orders.sorted : data.insert_orders.interleaved)
                        .map((isbn, i) => <IsbnStep key={isbn} isbn={isbn} idx={i} />)}
                </div>
            </motion.div>
        </div>
    );
}
