import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import ToastContainer from './ToastContainer';
import { useApp } from '../context/AppContext';
import { api } from '../api/library';
import { Menu } from 'lucide-react';

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { setBackendOnline } = useApp();

    useEffect(() => {
        const check = async () => {
            try {
                await api.health();
                setBackendOnline(true);
            } catch {
                setBackendOnline(false);
            }
        };
        check();
        const iv = setInterval(check, 15000);
        return () => clearInterval(iv);
    }, []);

    const sidebarW = collapsed ? 72 : 240;

    return (
        <div className="page-container min-h-screen flex">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 h-full z-50 md:hidden"
                        >
                            <Sidebar collapsed={false} setCollapsed={() => setMobileOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <motion.main
                className="flex-1 min-h-screen overflow-x-hidden"
                animate={{ marginLeft: sidebarW }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ marginLeft: sidebarW }}
            >
                {/* Mobile header */}
                <div className="md:hidden flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(8, 14, 11, 0.85)', backdropFilter: 'blur(12px)' }}>
                    <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <Menu size={18} style={{ color: 'rgb(var(--text-primary))' }} />
                    </button>
                    <span className="font-bold text-sm" style={{ color: 'rgb(var(--text-primary))' }}>LibraryOS</span>
                </div>

                {/* Page content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="p-6"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </motion.main>

            <ToastContainer />
        </div>
    );
}
