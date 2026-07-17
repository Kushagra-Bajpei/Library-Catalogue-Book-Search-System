import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { BookOpen, Search, GitBranch, Zap, ArrowRight, Star, ChevronDown, CheckCircle2, Layers } from 'lucide-react';
import { api } from '../api/library';
import type { Stats } from '../types';
import Logo from '../components/Logo';
import ThemeToggle from '../components/ThemeToggle';

function FloatingBook({ x, y, delay, size = 40, rotate = 0 }: { x: number; y: number; delay: number; size?: number; rotate?: number }) {
    return (
        <motion.div
            className="absolute pointer-events-none select-none"
            style={{ left: `${x}%`, top: `${y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, 0.6, 0.4, 0.6],
                scale: 1,
                y: [0, -15, 0, -8, 0],
                rotate: [rotate, rotate + 5, rotate - 5, rotate],
            }}
            transition={{
                duration: 6 + delay,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        >
            <BookOpen size={size} className="text-teal-500/20" />
        </motion.div>
    );
}

interface StatCounterProps {
    value: number;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: 'indigo' | 'emerald' | 'cyan' | 'amber';
    suffix?: string;
}

const colorMap = {
    indigo: {
        text: 'text-teal-400',
        bg: 'bg-teal-500/10',
        border: 'group-hover:border-teal-500/30',
        glow: 'rgba(13, 148, 136, 0.18)',
        badge: 'badge-teal',
    },
    emerald: {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'group-hover:border-emerald-500/30',
        glow: 'rgba(16, 185, 129, 0.15)',
        badge: 'badge-emerald',
    },
    cyan: {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'group-hover:border-amber-500/30',
        glow: 'rgba(245, 158, 11, 0.15)',
        badge: 'badge-amber',
    },
    amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'group-hover:border-amber-500/30',
        glow: 'rgba(245, 158, 11, 0.15)',
        badge: 'badge-amber',
    },
};

function StatCounter({ value, label, description, icon, color, suffix = '' }: StatCounterProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);
    const cfg = colorMap[color];

    useEffect(() => {
        if (!isInView || value === 0) return;
        let start = 0;
        const duration = 1500;
        const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = Math.min((timestamp - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isInView, value]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className={`group relative flex flex-col justify-between p-6 rounded-2xl glass-card border border-white/5 transition-all duration-300 ${cfg.border}`}
            style={{
                background: 'rgba(8, 18, 12, 0.45)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            }}
        >
            {/* Soft background glow */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${cfg.glow} 0%, transparent 60%)`,
                }}
            />

            <div>
                {/* Icon & Label */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-wider uppercase text-white/50">{label}</span>
                    <div className={`p-2.5 rounded-xl ${cfg.bg} ${cfg.text} transition-transform duration-300 group-hover:scale-110`}>
                        {icon}
                    </div>
                </div>

                {/* Counting Number */}
                <div className="text-4xl font-extrabold text-white tracking-tight tabular-nums flex items-baseline">
                    <span className="gradient-text">{count}</span>
                    {suffix && <span className="text-lg font-medium text-white/40 ml-1">{suffix}</span>}
                </div>
            </div>

            {/* Micro-detailing Description */}
            <p className="text-xs text-white/40 mt-3 group-hover:text-white/60 transition-colors duration-300 line-clamp-2">
                {description}
            </p>
        </motion.div>
    );
}

export default function Landing() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [backendOk, setBackendOk] = useState<boolean | null>(null);

    useEffect(() => {
        api.health()
            .then(() => {
                setBackendOk(true);
                return api.getStats();
            })
            .then(s => setStats(s))
            .catch(() => setBackendOk(false));
    }, []);

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ background: 'rgb(var(--bg-primary))' }}>
            {/* Animated gradient orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(13,148,136,0.14) 0%, transparent 70%)',
                        top: '-10%', left: '-10%',
                    }}
                    animate={{ x: [0, 40, 0], y: [0, 60, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute w-[500px] h-[500px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(217,119,6,0.10) 0%, transparent 70%)',
                        bottom: '-10%', right: '-5%',
                    }}
                    animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute w-[300px] h-[300px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
            </div>

            {/* Floating books */}
            <FloatingBook x={8} y={15} delay={0} size={32} rotate={-15} />
            <FloatingBook x={85} y={10} delay={1.5} size={48} rotate={20} />
            <FloatingBook x={5} y={70} delay={3} size={28} rotate={10} />
            <FloatingBook x={90} y={60} delay={0.8} size={36} rotate={-25} />
            <FloatingBook x={50} y={85} delay={2} size={24} rotate={5} />
            <FloatingBook x={70} y={30} delay={2.5} size={30} rotate={-10} />

            {/* Grid pattern */}
            <div className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(13,148,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.04) 1px, transparent 1px)',
                    backgroundSize: '48px 48px',
                }}
            />

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link to="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer select-none">
                        <Logo size={36} />
                        <div>
                            <span className="font-bold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>LibraryOS</span>
                            <span className="ml-2 badge badge-teal">AVL Engine</span>
                        </div>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4"
                >
                    {backendOk === true && <span className="badge badge-emerald flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Backend Online</span>}
                    {backendOk === false && <span className="badge badge-rose">Backend Offline</span>}
                    <ThemeToggle />
                    <Link to="/dashboard">
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary text-sm">
                            Open Dashboard
                        </motion.button>
                    </Link>
                </motion.div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-5"
                >
                    <span className="badge badge-indigo text-xs px-4 py-1.5">
                        <Zap size={10} className="mr-1 inline" />
                        Powered by C++ AVL Tree Data Structure
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                    className="text-5xl md:text-7xl font-black leading-tight mb-6 max-w-4xl"
                >
                    <span style={{ color: 'rgb(var(--text-primary))' }}>Smarter Libraries.</span>
                    <br />
                    <span className="gradient-text">Faster Discovery.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
                    style={{ color: 'rgb(var(--text-secondary))' }}
                >
                    Experience a modern digital library powered by C++ and self-balancing AVL Trees
                    for fast and efficient book discovery with O(log n) search performance.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="flex flex-wrap items-center justify-center gap-4"
                >
                    <Link to="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(13,148,136,0.55)' }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary flex items-center gap-2 text-base py-3 px-8"
                        >
                            <BookOpen size={18} />
                            Explore Library
                            <ArrowRight size={16} />
                        </motion.button>
                    </Link>
                    <Link to="/avl">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-secondary flex items-center gap-2 text-base py-3 px-8"
                        >
                            <GitBranch size={18} />
                            View AVL Tree
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="mt-16 flex flex-col items-center gap-2"
                >
                    <span className="text-xs uppercase tracking-widest" style={{ color: 'rgb(var(--text-muted))' }}>Scroll to explore</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <ChevronDown size={18} style={{ color: 'rgb(var(--text-muted))' }} />
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats */}
            <section className="relative z-10 px-6 py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCounter
                            value={stats?.total_books ?? 0}
                            label="Total Books"
                            description="Total unique book titles indexed inside the live database catalogue."
                            icon={<BookOpen size={20} />}
                            color="indigo"
                        />
                        <StatCounter
                            value={stats?.available_copies ?? 0}
                            label="Available Copies"
                            description="Physical book copies currently available on-shelf for active borrowing."
                            icon={<CheckCircle2 size={20} />}
                            color="emerald"
                        />
                        <StatCounter
                            value={stats?.categories ?? 0}
                            label="Categories"
                            description="Distinct genres, subjects, and topics categorizing the catalogue."
                            icon={<Layers size={20} />}
                            color="cyan"
                        />
                        <StatCounter
                            value={stats?.avl_height ?? 0}
                            label="AVL Tree Height"
                            description="Overall height of the self-balancing binary search structure."
                            icon={<GitBranch size={20} />}
                            color="amber"
                        />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 px-6 py-16">
                <div className="max-w-6xl mx-auto">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl font-bold text-center mb-12 gradient-text"
                    >
                        Why AVL Trees?
                    </motion.h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: <Search size={24} />,
                                title: 'O(log n) ISBN Lookup',
                                desc: 'Binary search on a balanced BST gives guaranteed logarithmic search time — dramatically faster than linear scan.',
                                color: '#6366f1',
                            },
                            {
                                icon: <GitBranch size={24} />,
                                title: 'Self-Balancing',
                                desc: 'LL, RR, LR, RL rotations keep the tree balanced after every insert/delete, maintaining the height invariant.',
                                color: '#a855f7',
                            },
                            {
                                icon: <Zap size={24} />,
                                title: 'Real-Time Visualization',
                                desc: 'Watch the tree restructure live as you add or remove books, with animated rotation demonstrations.',
                                color: '#10b981',
                            },
                        ].map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15 }}
                                whileHover={{ y: -6 }}
                                className="glass-card p-6"
                            >
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                                    <span style={{ color: f.color }}>{f.icon}</span>
                                </div>
                                <h3 className="text-base font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>{f.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative z-10 px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto text-center glass-card p-12"
                    style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.1), rgba(16,185,129,0.08))' }}
                >
                    <Star size={32} className="mx-auto mb-4 text-amber-400" />
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'rgb(var(--text-primary))' }}>
                        Ready to explore?
                    </h2>
                    <p className="mb-6 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        Browse the full catalogue, search with advanced filters, add new books, and visualize the AVL tree structure.
                    </p>
                    <Link to="/dashboard">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="btn-primary flex items-center gap-2 mx-auto"
                        >
                            Open Dashboard <ArrowRight size={16} />
                        </motion.button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
