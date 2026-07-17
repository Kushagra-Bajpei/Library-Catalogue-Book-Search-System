import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number;
    icon: LucideIcon;
    description?: string;
    color: 'indigo' | 'purple' | 'emerald' | 'amber' | 'rose';
    suffix?: string;
    loading?: boolean;
}

const colorMap = {
    indigo: {
        gradient: 'from-teal-500/25 to-teal-600/5',
        icon: 'bg-teal-500/15 text-teal-400',
        glow: 'group-hover:shadow-[0_0_30px_rgba(13,148,136,0.25)]',
        border: 'group-hover:border-teal-500/35',
        text: 'text-teal-400',
        bar: 'bg-teal-500',
    },
    purple: {
        gradient: 'from-amber-500/20 to-amber-600/5',
        icon: 'bg-amber-500/15 text-amber-400',
        glow: 'group-hover:shadow-[0_0_30px_rgba(217,119,6,0.2)]',
        border: 'group-hover:border-amber-500/30',
        text: 'text-amber-400',
        bar: 'bg-amber-500',
    },
    emerald: {
        gradient: 'from-emerald-500/20 to-emerald-600/5',
        icon: 'bg-emerald-500/15 text-emerald-400',
        glow: 'group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
        border: 'group-hover:border-emerald-500/30',
        text: 'text-emerald-400',
        bar: 'bg-emerald-500',
    },
    amber: {
        gradient: 'from-amber-500/20 to-amber-600/5',
        icon: 'bg-amber-500/15 text-amber-400',
        glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
        border: 'group-hover:border-amber-500/30',
        text: 'text-amber-400',
        bar: 'bg-amber-500',
    },
    rose: {
        gradient: 'from-rose-500/20 to-rose-600/5',
        icon: 'bg-rose-500/15 text-rose-400',
        glow: 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]',
        border: 'group-hover:border-rose-500/30',
        text: 'text-rose-400',
        bar: 'bg-rose-500',
    },
};

function useCountUp(target: number, duration = 1200) {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number>(0);
    const startTime = useRef<number>(0);
    const startVal = useRef<number>(0);

    useEffect(() => {
        if (target === 0) { setCount(0); return; }
        cancelAnimationFrame(frameRef.current);
        startTime.current = performance.now();
        startVal.current = count;

        const animate = (now: number) => {
            const elapsed = now - startTime.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(startVal.current + (target - startVal.current) * eased));
            if (progress < 1) frameRef.current = requestAnimationFrame(animate);
        };
        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [target]);

    return count;
}

export default function StatCard({ title, value, icon: Icon, description, color, suffix = '', loading }: StatCardProps) {
    const c = colorMap[color];
    const displayValue = useCountUp(loading ? 0 : value);

    if (loading) {
        return (
            <div className="stat-card group rounded-2xl p-6">
                <div className="skeleton h-10 w-10 rounded-xl mb-4" />
                <div className="skeleton h-8 w-20 rounded mb-2" />
                <div className="skeleton h-4 w-32 rounded" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
            className={`stat-card group rounded-2xl p-6 transition-all duration-300 ${c.glow} ${c.border}`}
        >
            {/* Background gradient */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${c.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="relative">
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${c.icon} transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={20} />
                </div>

                {/* Value */}
                <div className="flex items-baseline gap-1 mb-1">
                    <span className={`text-3xl font-bold tabular-nums ${c.text}`}>
                        {displayValue.toLocaleString()}
                    </span>
                    {suffix && <span className="text-sm font-medium" style={{ color: 'rgb(var(--text-muted))' }}>{suffix}</span>}
                </div>

                {/* Title */}
                <p className="text-sm font-semibold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>{title}</p>

                {/* Description */}
                {description && (
                    <p className="text-xs leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{description}</p>
                )}

                {/* Bottom accent bar */}
                <div className={`absolute bottom-0 left-0 h-0.5 rounded-full transition-all duration-500 group-hover:w-full ${c.bar} opacity-40`} style={{ width: '30%' }} />
            </div>
        </motion.div>
    );
}
