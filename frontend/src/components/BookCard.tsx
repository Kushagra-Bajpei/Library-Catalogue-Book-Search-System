import { motion } from 'framer-motion';
import { BookOpen, Edit, Trash2, User, Calendar, Tag, Hash } from 'lucide-react';
import type { Book } from '../types';

interface BookCardProps {
    book: Book;
    index?: number;
    onEdit?: (book: Book) => void;
    onDelete?: (isbn: string) => void;
    onClick?: (book: Book) => void;
}

const categoryColors: Record<string, string> = {
    'Software Engineering': 'indigo',
    'Computer Science': 'purple',
    'Data Science': 'emerald',
    'Machine Learning': 'rose',
    'JavaScript': 'amber',
    'Python': 'emerald',
    'Java': 'orange',
    'C/C++': 'blue',
    'Databases': 'cyan',
    'DevOps': 'teal',
    'Systems Programming': 'violet',
};

function getCategoryColor(cat: string) {
    const color = categoryColors[cat];
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        indigo: { bg: 'rgba(13,148,136,0.12)', text: '#2dd4bf', border: 'rgba(13,148,136,0.25)' },
        purple: { bg: 'rgba(217,119,6,0.12)', text: '#fbbf24', border: 'rgba(217,119,6,0.25)' },
        emerald: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
        rose: { bg: 'rgba(244,63,94,0.12)', text: '#fb7185', border: 'rgba(244,63,94,0.25)' },
        amber: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
        orange: { bg: 'rgba(249,115,22,0.12)', text: '#fb923c', border: 'rgba(249,115,22,0.25)' },
        blue: { bg: 'rgba(13,148,136,0.12)', text: '#2dd4bf', border: 'rgba(13,148,136,0.25)' },
        cyan: { bg: 'rgba(6,182,212,0.12)', text: '#22d3ee', border: 'rgba(6,182,212,0.25)' },
        teal: { bg: 'rgba(20,184,166,0.12)', text: '#2dd4bf', border: 'rgba(20,184,166,0.25)' },
        violet: { bg: 'rgba(217,119,6,0.12)', text: '#fbbf24', border: 'rgba(217,119,6,0.25)' },
    };
    return colors[color] || colors['indigo'];
}

export default function BookCard({ book, index = 0, onEdit, onDelete, onClick }: BookCardProps) {
    const catColor = getCategoryColor(book.category);
    const isAvailable = book.available_copies > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4, type: 'spring', stiffness: 200 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="glass-card p-5 cursor-pointer group relative overflow-hidden"
            onClick={() => onClick?.(book)}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Top row */}
            <div className="relative flex items-start justify-between gap-2 mb-3">
                {/* Book icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: catColor.bg, border: `1px solid ${catColor.border}` }}>
                    <BookOpen size={18} style={{ color: catColor.text }} />
                </div>

                {/* Availability badge */}
                <span className={`badge ${isAvailable ? 'badge-emerald' : 'badge-rose'} shrink-0`}>
                    {isAvailable ? `${book.available_copies} avail.` : 'Unavailable'}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold leading-tight mb-1 group-hover:text-teal-300 transition-colors duration-200 line-clamp-2"
                style={{ color: 'rgb(var(--text-primary))' }}>
                {book.title}
            </h3>

            {/* Meta */}
            <div className="space-y-1 mb-3">
                <div className="flex items-center gap-1.5">
                    <User size={11} style={{ color: 'rgb(var(--text-muted))' }} />
                    <span className="text-xs truncate" style={{ color: 'rgb(var(--text-secondary))' }}>{book.author}</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={11} style={{ color: 'rgb(var(--text-muted))' }} />
                        <span className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{book.publication_year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Hash size={11} style={{ color: 'rgb(var(--text-muted))' }} />
                        <span className="text-xs font-mono" style={{ color: 'rgb(var(--text-muted))' }}>
                            {book.isbn.slice(-6)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Category */}
            <div className="mb-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg"
                    style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}>
                    <Tag size={10} />
                    {book.category}
                </span>
            </div>

            {/* Actions */}
            {(onEdit || onDelete) && (
                <div className="flex gap-2 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    {onEdit && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={e => { e.stopPropagation(); onEdit(book); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'rgba(13,148,136,0.1)', color: '#2dd4bf' }}
                        >
                            <Edit size={12} />
                            Edit
                        </motion.button>
                    )}
                    {onDelete && (
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={e => { e.stopPropagation(); onDelete(book.isbn); }}
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}
                        >
                            <Trash2 size={12} />
                            Delete
                        </motion.button>
                    )}
                </div>
            )}
        </motion.div>
    );
}
