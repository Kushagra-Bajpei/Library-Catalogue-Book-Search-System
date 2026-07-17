import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, Search, RefreshCw, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import BookTable from '../components/BookTable';
import { api } from '../api/library';
import { useApp } from '../context/AppContext';
import type { Book, ViewMode } from '../types';

export default function BooksPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<ViewMode>('grid');
    const [query, setQuery] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const { addToast } = useApp();
    const navigate = useNavigate();

    const load = async () => {
        try {
            const data = await api.getBooks();
            setBooks(data);
        } catch {
            addToast({ type: 'error', title: 'Failed to load books', message: 'Check backend connection' });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (isbn: string) => {
        if (!confirm('Delete this book?')) return;
        try {
            const res = await api.deleteBook(isbn);
            addToast({ type: 'success', title: 'Book deleted' });
            if (res.rotation?.type && res.rotation.type !== 'NONE') {
                addToast({
                    type: 'info',
                    title: `AVL Tree Rebalanced — ${res.rotation.type} Rotation`,
                    message: res.rotation.description,
                });
            }
            load();
        } catch (e: unknown) {
            addToast({ type: 'error', title: 'Delete failed', message: String(e) });
        }
    };

    const filtered = books.filter(b =>
        !query ||
        b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.author.toLowerCase().includes(query.toLowerCase()) ||
        b.isbn.includes(query) ||
        b.category.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>Book Catalogue</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                        {loading ? 'Loading...' : `${filtered.length} of ${books.length} books`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* View toggle */}
                    <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                        {(['grid', 'table'] as ViewMode[]).map(v => (
                            <motion.button
                                key={v}
                                onClick={() => setView(v)}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 relative"
                                style={{
                                    background: view === v ? 'rgba(99,102,241,0.2)' : 'transparent',
                                    color: view === v ? '#818cf8' : 'rgb(var(--text-muted))',
                                }}
                            >
                                {v === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
                            </motion.button>
                        ))}
                    </div>

                    {/* Refresh */}
                    <motion.button
                        onClick={() => { setRefreshing(true); load(); }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.6, repeat: refreshing ? Infinity : 0 }}>
                            <RefreshCw size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                        </motion.div>
                    </motion.button>

                    {/* Add */}
                    <motion.button
                        onClick={() => navigate('/add')}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn-primary text-sm py-2 px-4"
                    >
                        + Add Book
                    </motion.button>
                </div>
            </motion.div>

            {/* Search bar */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="relative"
            >
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-muted))' }} />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Quick filter by title, author, ISBN, category..."
                    className="input-field pl-10"
                />
            </motion.div>

            {/* Book listing */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="glass-card p-5 h-52 skeleton" />
                        ))}
                    </motion.div>
                ) : view === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {filtered.map((b, i) => (
                            <BookCard
                                key={b.isbn}
                                book={b}
                                index={i}
                                onEdit={() => navigate(`/add?isbn=${encodeURIComponent(b.isbn)}`)}
                                onDelete={handleDelete}
                                onClick={() => navigate(`/add?isbn=${encodeURIComponent(b.isbn)}`)}
                            />
                        ))}
                        {filtered.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <BookOpen size={40} className="mx-auto mb-3 opacity-20" style={{ color: 'rgb(var(--text-muted))' }} />
                                <p style={{ color: 'rgb(var(--text-muted))' }}>No books match your filter</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <BookTable
                            books={filtered}
                            onEdit={b => navigate(`/add?isbn=${encodeURIComponent(b.isbn)}`)}
                            onDelete={handleDelete}
                            loading={loading}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
