import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const icons = {
    success: <CheckCircle size={18} className="text-emerald-400" />,
    error: <XCircle size={18} className="text-rose-400" />,
    info: <Info size={18} className="text-teal-400" />,
    warning: <AlertTriangle size={18} className="text-amber-400" />,
};

const colors = {
    success: 'border-emerald-500/30',
    error: 'border-rose-500/30',
    info: 'border-teal-500/30',
    warning: 'border-amber-500/30',
};

export default function ToastContainer() {
    const { toasts, removeToast } = useApp();

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`glass rounded-2xl p-4 border pointer-events-auto shadow-2xl ${colors[toast.type]}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                                    {toast.title}
                                </p>
                                {toast.message && (
                                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
                                        {toast.message}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                                style={{ color: 'rgb(var(--text-secondary))' }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
