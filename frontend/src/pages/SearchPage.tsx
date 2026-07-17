import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, BookOpen, Zap, Loader2, SlidersHorizontal } from 'lucide-react';
import BookCard from '../components/BookCard';
import { api } from '../api/library';
import { useApp } from '../context/AppContext';
import type { SearchType, Book } from '../types';
import { useNavigate } from 'react-router-dom';

function useDebounce<T>(val: T, ms: number): T {
    const [v, setV] = useState(val);
    useEffect(() => {
        const t = setTimeout(() => setV(val), ms);
        return () => clearTimeout(t);
    }, [val, ms]);
    return v;
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('title');
    const [category, setCategory] = useState('');
    const [yearFrom, setYearFrom] = useState('');
    const [yearTo, setYearTo] = useState('');
    const [available, setAvailable] = useState(-1);
    const [results, setResults] = useState<Book[]>([]);
    const [count, setCount] = useState<number | null>(null);
    const [complexity, setComplexity] = useState('');
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const debouncedQuery = useDebounce(query, 400);
    const { addToast } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    const doSearch = useCallback(async () => {
        if (!debouncedQuery && !category && !yearFrom && !yearTo && available === -1) {
            setSearched(false);
            setResults([]);
            setCount(null);
            return;
        }
        setLoading(true);
        try {
            const res = await api.search({
                q: debouncedQuery,
                type: searchType,
                category: category || undefined,
                year_from: yearFrom ? Number(yearFrom) : undefined,
                year_to: yearTo ? Number(yearTo) : undefined,
                available: available === -1 ? undefined : available,
            });
            setResults(res.results);
            setCount(res.count);
            setComplexity(res.complexity);
            setSearched(true);
        } catch (e: unknown) {
            addToast({ type: 'error', title: 'Search failed', message: String(e) });
        } finally {
            setLoading(false);
        }
    }, [debouncedQuery, searchType, category, yearFrom, yearTo, available]);

    useEffect(() => { doSearch(); }, [doSearch]);

    const clearAll = () => {
        setQuery('');
        setCategory('');
        setYearFrom('');
        setYearTo('');
        setAvailable(-1);
        setSearched(false);
        setResults([]);
        setCount(null);
    };

    const searchTypes: { value: SearchType; label: string; desc: string }[] = [
        { value: 'title', label: 'Title', desc: 'O(n)' },
        { value: 'author', label: 'Author', desc: 'O(n)' },
        { value: 'isbn', label: 'ISBN', desc: 'O(log n)' },
        { value: 'category', label: 'Category', desc: 'O(n)' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>Search Books</h1>
                <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                    Find books with advanced filters and real-time results
                </p>
            </motion.div>

            {/* Search bar */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card p-4 space-y-4"
            >
                {/* Main input */}
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgb(var(--text-muted))' }} />
                    <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder={`Search by ${searchType}...`}
                        className="input-field pl-11 pr-10 text-base py-3.5"
                        autoFocus
                    />
                    {query && (
                        <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                            <X size={15} style={{ color: 'rgb(var(--text-muted))' }} />
                        </button>
                    )}
                </div>

                {/* Search type pills */}
                <div className="flex flex-wrap gap-2">
                    {searchTypes.map(st => (
                        <motion.button
                            key={st.value}
                            onClick={() => setSearchType(st.value)}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                            style={{
                                background: searchType === st.value ? 'rgba(13,148,136,0.2)' : 'rgba(255,255,255,0.04)',
                                color: searchType === st.value ? '#2dd4bf' : 'rgb(var(--text-secondary))',
                                border: `1px solid ${searchType === st.value ? 'rgba(13,148,136,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            }}
                        >
                            {st.label}
                            <span className="px-1.5 py-0.5 rounded-md font-mono" style={{
                                background: searchType === st.value && st.value === 'isbn' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                                color: searchType === st.value && st.value === 'isbn' ? '#34d399' : 'rgb(var(--text-muted))',
                                fontSize: '10px',
                            }}>
                                {st.desc}
                            </span>
                        </motion.button>
                    ))}

                    <div className="flex-1" />

                    <motion.button
                        onClick={() => setShowFilters(!showFilters)}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                        style={{
                            background: showFilters ? 'rgba(217,119,6,0.2)' : 'rgba(255,255,255,0.04)',
                            color: showFilters ? '#fbbf24' : 'rgb(var(--text-secondary))',
                            border: `1px solid ${showFilters ? 'rgba(217,119,6,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        }}
                    >
                        <SlidersHorizontal size={12} />
                        Filters
                    </motion.button>
                </div>

                {/* Expanded Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                {/* Category */}
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgb(var(--text-muted))' }}>Category</label>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        className="input-field py-2.5 text-sm"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="">All categories</option>
                                        {categories.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year from */}
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgb(var(--text-muted))' }}>Year From</label>
                                    <input
                                        type="number"
                                        value={yearFrom}
                                        onChange={e => setYearFrom(e.target.value)}
                                        placeholder="e.g. 2000"
                                        className="input-field py-2.5 text-sm"
                                        min={1900} max={2030}
                                    />
                                </div>

                                {/* Year to */}
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgb(var(--text-muted))' }}>Year To</label>
                                    <input
                                        type="number"
                                        value={yearTo}
                                        onChange={e => setYearTo(e.target.value)}
                                        placeholder="e.g. 2024"
                                        className="input-field py-2.5 text-sm"
                                        min={1900} max={2030}
                                    />
                                </div>

                                {/* Availability */}
                                <div>
                                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'rgb(var(--text-muted))' }}>Availability</label>
                                    <select
                                        value={available}
                                        onChange={e => setAvailable(Number(e.target.value))}
                                        className="input-field py-2.5 text-sm"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value={-1}>All</option>
                                        <option value={1}>Available only</option>
                                        <option value={0}>Unavailable only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end mt-3">
                                <button onClick={clearAll} className="text-xs flex items-center gap-1" style={{ color: 'rgb(var(--text-muted))' }}>
                                    <X size={12} />
                                    Clear all filters
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Results info */}
            <AnimatePresence>
                {searched && count !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                                Found <span className="text-teal-400 font-bold">{count}</span> {count === 1 ? 'book' : 'books'}
                            </span>
                            {complexity && (
                                <span className={`badge ${complexity === 'O(log n)' ? 'badge-emerald' : 'badge-teal'} flex items-center gap-1`}>
                                    {complexity === 'O(log n)' && <Zap size={9} />}
                                    {complexity}
                                    {complexity === 'O(log n)' && ' AVL Lookup'}
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                        <Loader2 size={28} className="text-teal-400" />
                    </motion.div>
                </div>
            )}

            {/* Results */}
            {!loading && searched && (
                <AnimatePresence>
                    {results.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-20"
                        >
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <BookOpen size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'rgb(var(--text-muted))' }} />
                            </motion.div>
                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>No books found</h3>
                            <p className="text-sm mb-4" style={{ color: 'rgb(var(--text-muted))' }}>Try adjusting your search terms or filters</p>
                            <button onClick={clearAll} className="btn-secondary text-sm">
                                Clear search
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                        >
                            {results.map((b, i) => (
                                <BookCard
                                    key={b.isbn}
                                    book={b}
                                    index={i}
                                    onClick={() => navigate(`/add?isbn=${encodeURIComponent(b.isbn)}`)}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Initial state */}
            {!searched && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <Search size={48} className="mx-auto mb-4 opacity-15" style={{ color: 'rgb(var(--text-muted))' }} />
                    <p className="text-base font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                        Start searching the library
                    </p>
                    <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                        Type a query above. ISBN lookup uses AVL Tree O(log n) search.
                    </p>
                </motion.div>
            )}
        </div>
    );
}
