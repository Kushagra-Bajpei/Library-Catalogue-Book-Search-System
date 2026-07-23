import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, AlertCircle, Loader2, ArrowLeft, Save, GitBranch } from 'lucide-react';
import { api } from '../api/library';
import { useApp } from '../context/AppContext';
import type { Book, RotationEvent } from '../types';

interface FormData {
    isbn: string;
    title: string;
    author: string;
    category: string;
    publication_year: string;
    publisher: string;
    total_copies: string;
    available_copies: string;
    description: string;
}

const empty: FormData = {
    isbn: '', title: '', author: '', category: '',
    publication_year: '', publisher: '',
    total_copies: '1', available_copies: '1',
    description: '',
};

interface FieldProps {
    label: string;
    required?: boolean;
    children: React.ReactNode;
    error?: string;
}

function Field({ label, required, children, error }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                {label} {required && <span className="text-rose-400">*</span>}
            </label>
            {children}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="text-xs flex items-center gap-1" style={{ color: '#fb7185' }}
                    >
                        <AlertCircle size={11} />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function AddEditBook() {
    const [params] = useSearchParams();
    const isbn = params.get('isbn');
    const isEdit = !!isbn;
    const navigate = useNavigate();
    const { addToast } = useApp();

    const [form, setForm] = useState<FormData>(empty);
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [rotation, setRotation] = useState<RotationEvent | null>(null);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    useEffect(() => {
        if (!isbn) return;
        setFetching(true);
        api.getBook(isbn)
            .then(b => {
                setForm({
                    isbn: b.isbn,
                    title: b.title,
                    author: b.author,
                    category: b.category,
                    publication_year: String(b.publication_year),
                    publisher: b.publisher,
                    total_copies: String(b.total_copies),
                    available_copies: String(b.available_copies),
                    description: b.description || '',
                });
            })
            .catch(() => {
                addToast({ type: 'error', title: 'Book not found' });
                navigate('/books');
            })
            .finally(() => setFetching(false));
    }, [isbn]);

    const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        setErrors(er => ({ ...er, [key]: '' }));
    };

    const validate = () => {
        const e: Partial<FormData> = {};
        if (!form.isbn.trim()) e.isbn = 'ISBN is required';
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.author.trim()) e.author = 'Author is required';
        const yr = Number(form.publication_year);
        if (form.publication_year && (yr < 1000 || yr > 2030)) e.publication_year = 'Enter a valid year (1000–2030)';
        const tc = Number(form.total_copies);
        const ac = Number(form.available_copies);
        if (tc < 0) e.total_copies = 'Must be ≥ 0';
        if (ac < 0) e.available_copies = 'Must be ≥ 0';
        if (ac > tc) e.available_copies = 'Cannot exceed total copies';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async () => {
        if (!validate()) return;
        setLoading(true);
        setRotation(null);
        const book: Book = {
            isbn: form.isbn.trim(),
            title: form.title.trim(),
            author: form.author.trim(),
            category: form.category.trim() || 'General',
            publication_year: Number(form.publication_year) || 0,
            publisher: form.publisher.trim(),
            total_copies: Number(form.total_copies),
            available_copies: Number(form.available_copies),
            description: form.description.trim(),
        };

        try {
            if (isEdit) {
                await api.updateBook(isbn!, book);
                addToast({ type: 'success', title: 'Book updated successfully' });
                setSuccess(true);
            } else {
                const res = await api.addBook(book);
                if (res.rotation?.type && res.rotation.type !== 'NONE') {
                    setRotation(res.rotation);
                    addToast({
                        type: 'info',
                        title: `AVL Tree Rebalanced — ${res.rotation.type} Rotation`,
                        message: res.rotation.description,
                    });
                }
                addToast({ type: 'success', title: 'Book added successfully' });
                setSuccess(true);
                setForm(empty);
            }
        } catch (e: unknown) {
            addToast({ type: 'error', title: isEdit ? 'Update failed' : 'Add failed', message: String(e) });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 size={32} className="text-teal-400" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3">
                <motion.button
                    onClick={() => navigate('/books')}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                    <ArrowLeft size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                </motion.button>
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                        {isEdit ? 'Edit Book' : 'Add New Book'}
                    </h1>
                    <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>
                        {isEdit ? 'Update book information in the catalogue' : 'Insert a new book into the AVL Tree'}
                    </p>
                </div>
            </motion.div>

            {/* Success banner */}
            <AnimatePresence>
                {success && !isEdit && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl p-4 flex items-start gap-3"
                        style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}
                    >
                        <CheckCircle size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-400">Book added to catalogue!</p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-secondary))' }}>
                                The AVL Tree has been updated with the new ISBN.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rotation notification */}
            <AnimatePresence>
                {rotation && rotation.type !== 'NONE' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl p-4 flex items-start gap-3"
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}
                    >
                        <GitBranch size={18} className="text-amber-400 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-400">
                                AVL Tree Rebalanced — {rotation.type} Rotation
                            </p>
                            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
                                {rotation.description}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form sections */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="glass-card p-6 space-y-6">
                {/* Section: Basic Info */}
                <div>
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                        <BookOpen size={16} className="text-teal-400" />
                        Basic Information
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <Field label="ISBN" required error={errors.isbn}>
                                <input
                                    type="text"
                                    value={form.isbn}
                                    onChange={set('isbn')}
                                    placeholder="e.g. 9780132350884"
                                    className="input-field font-mono"
                                    disabled={isEdit}
                                />
                            </Field>
                        </div>
                        <Field label="Title" required error={errors.title}>
                            <input type="text" value={form.title} onChange={set('title')} placeholder="Book title" className="input-field" />
                        </Field>
                        <Field label="Author" required error={errors.author}>
                            <input type="text" value={form.author} onChange={set('author')} placeholder="Author name" className="input-field" />
                        </Field>
                    </div>
                </div>

                <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                {/* Section: Publication */}
                <div>
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                        📚 Publication Information
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <Field label="Publication Year" error={errors.publication_year}>
                            <input type="number" value={form.publication_year} onChange={set('publication_year')} placeholder="e.g. 2023" className="input-field" min={1000} max={2030} />
                        </Field>
                        <Field label="Publisher">
                            <input type="text" value={form.publisher} onChange={set('publisher')} placeholder="Publisher name" className="input-field" />
                        </Field>
                        <Field label="Category">
                            {categories.length > 0 ? (
                                <select value={form.category} onChange={set('category')} className="input-field" style={{ cursor: 'pointer' }}>
                                    <option value="">Select or type below</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            ) : (
                                <input type="text" value={form.category} onChange={set('category')} placeholder="e.g. Computer Science" className="input-field" />
                            )}
                        </Field>
                    </div>
                    {categories.length > 0 && (
                        <div className="mt-3">
                            <Field label="Or enter custom category">
                                <input type="text" value={form.category} onChange={set('category')} placeholder="Custom category" className="input-field" />
                            </Field>
                        </div>
                    )}
                </div>

                <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                {/* Section: Inventory */}
                <div>
                    <h2 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                        📦 Inventory
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Total Copies" error={errors.total_copies}>
                            <input type="number" value={form.total_copies} onChange={set('total_copies')} className="input-field" min={0} />
                        </Field>
                        <Field label="Available Copies" error={errors.available_copies}>
                            <input type="number" value={form.available_copies} onChange={set('available_copies')} className="input-field" min={0} />
                        </Field>
                    </div>
                </div>

                <div className="border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                {/* Section: Description */}
                <div>
                    <h2 className="text-base font-bold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
                        📝 Additional Information
                    </h2>
                    <Field label="Description">
                        <textarea
                            value={form.description}
                            onChange={set('description')}
                            placeholder="Short description of the book..."
                            className="input-field resize-none h-28"
                        />
                    </Field>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <motion.button
                        onClick={() => navigate('/books')}
                        whileTap={{ scale: 0.97 }}
                        className="btn-secondary"
                    >
                        Cancel
                    </motion.button>
                    <motion.button
                        onClick={submit}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={loading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                                    <Loader2 size={16} />
                                </motion.div>
                                {isEdit ? 'Updating...' : 'Adding...'}
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {isEdit ? 'Update Book' : 'Add Book'}
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
