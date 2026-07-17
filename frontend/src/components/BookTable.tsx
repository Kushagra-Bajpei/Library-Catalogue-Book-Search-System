import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, BookOpen, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { Book } from '../types';

interface BookTableProps {
    books: Book[];
    onEdit?: (book: Book) => void;
    onDelete?: (isbn: string) => void;
    loading?: boolean;
}

type SortKey = keyof Book | '';
type SortDir = 'asc' | 'desc';

export default function BookTable({ books, onEdit, onDelete, loading }: BookTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const sorted = [...books].sort((a, b) => {
        if (!sortKey) return 0;
        const va = a[sortKey as keyof Book];
        const vb = b[sortKey as keyof Book];
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const SortIcon = ({ col }: { col: SortKey }) => (
        <span className="ml-1 inline-flex flex-col">
            <ChevronUp size={10} className={sortKey === col && sortDir === 'asc' ? 'text-indigo-400' : 'opacity-30'} />
            <ChevronDown size={10} className={sortKey === col && sortDir === 'desc' ? 'text-indigo-400' : 'opacity-30'} />
        </span>
    );

    const cols: { key: SortKey; label: string; width?: string }[] = [
        { key: 'isbn', label: 'ISBN', width: 'w-36' },
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author', width: 'w-40' },
        { key: 'category', label: 'Category', width: 'w-36' },
        { key: 'publication_year', label: 'Year', width: 'w-20' },
        { key: 'available_copies', label: 'Available', width: 'w-24' },
    ];

    if (loading) {
        return (
            <div className="glass-card overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                        {Array.from({ length: 6 }).map((_, j) => (
                            <div key={j} className="skeleton h-4 flex-1 rounded" />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                            {cols.map(col => (
                                <th
                                    key={col.key}
                                    onClick={() => handleSort(col.key)}
                                    className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-indigo-400 transition-colors ${col.width || ''}`}
                                    style={{ color: 'rgb(var(--text-muted))' }}
                                >
                                    {col.label}
                                    <SortIcon col={col.key} />
                                </th>
                            ))}
                            {(onEdit || onDelete) && (
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right"
                                    style={{ color: 'rgb(var(--text-muted))' }}>
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {sorted.map((book, i) => (
                                <motion.tr
                                    key={book.isbn}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="group hover:bg-white/[0.025] transition-colors duration-150"
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    <td className="px-4 py-3">
                                        <span className="text-xs font-mono" style={{ color: 'rgb(var(--text-muted))' }}>
                                            {book.isbn}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={13} className="text-indigo-400 shrink-0" />
                                            <span className="text-sm font-medium truncate max-w-[200px]"
                                                style={{ color: 'rgb(var(--text-primary))' }}>
                                                {book.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm truncate block max-w-[150px]"
                                            style={{ color: 'rgb(var(--text-secondary))' }}>
                                            {book.author}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="badge badge-indigo">{book.category}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                                            {book.publication_year}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            {book.available_copies > 0
                                                ? <CheckCircle size={13} className="text-emerald-400" />
                                                : <XCircle size={13} className="text-rose-400" />
                                            }
                                            <span className={`text-sm font-medium ${book.available_copies > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {book.available_copies}/{book.total_copies}
                                            </span>
                                        </div>
                                    </td>
                                    {(onEdit || onDelete) && (
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                {onEdit && (
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => onEdit(book)}
                                                        className="p-1.5 rounded-lg transition-colors"
                                                        style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}
                                                    >
                                                        <Edit size={13} />
                                                    </motion.button>
                                                )}
                                                {onDelete && (
                                                    <motion.button
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => onDelete(book.isbn)}
                                                        className="p-1.5 rounded-lg transition-colors"
                                                        style={{ background: 'rgba(244,63,94,0.1)', color: '#fb7185' }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </motion.button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {sorted.length === 0 && (
                    <div className="py-16 text-center">
                        <BookOpen size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'rgb(var(--text-muted))' }} />
                        <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>No books found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
