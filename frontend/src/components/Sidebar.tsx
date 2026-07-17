import { motion } from 'framer-motion';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen, PlusCircle, Search, GitBranch,
    ChevronRight, Wifi, WifiOff, BarChart2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Logo from './Logo.tsx';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/books', icon: BookOpen, label: 'All Books' },
    { path: '/add', icon: PlusCircle, label: 'Add Book' },
    { path: '/search', icon: Search, label: 'Search Books' },
    { path: '/avl', icon: GitBranch, label: 'AVL Visualizer' },
    { path: '/compare', icon: BarChart2, label: 'BST vs AVL' },
];

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (v: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
    const location = useLocation();
    const { backendOnline } = useApp();

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 h-full z-50 flex flex-col overflow-hidden"
            style={{
                background: 'rgba(8, 14, 11, 0.96)',
                backdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.07)',
            }}
        >
            {/* Header */}
            <Link to="/" className="flex items-center gap-3 px-4 py-5 shrink-0 hover:opacity-80 transition-opacity duration-150 cursor-pointer select-none">
                <Logo size={36} />
                <AnimatedText show={!collapsed}>
                    <div>
                        <p className="text-xs font-bold text-white/90 leading-tight">LibraryOS</p>
                        <p className="text-[10px]" style={{ color: 'rgba(148,180,162,0.7)' }}>AVL Tree Engine</p>
                    </div>
                </AnimatedText>
            </Link>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-2 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path;
                    return (
                        <NavLink key={path} to={path} className="block">
                            <motion.div
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.97 }}
                                title={collapsed ? label : undefined}
                            >
                                <div className="shrink-0 relative">
                                    <motion.div
                                        animate={{ scale: isActive ? 1.1 : 1 }}
                                    >
                                        <Icon size={18} className={isActive ? 'text-teal-400' : ''} />
                                    </motion.div>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-glow"
                                            className="absolute inset-0 rounded-full"
                                            style={{ boxShadow: '0 0 12px rgba(13,148,136,0.65)', background: 'rgba(13,148,136,0.12)' }}
                                        />
                                    )}
                                </div>
                                <AnimatedText show={!collapsed}>
                                    <span className={`text-sm font-medium ${isActive ? 'text-teal-400' : ''}`}>{label}</span>
                                </AnimatedText>
                            </motion.div>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4 border-t shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {/* Backend status */}
                <div className={`nav-item mb-2 ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? (backendOnline ? 'Backend Online' : 'Backend Offline') : undefined}
                >
                    {backendOnline
                        ? <Wifi size={16} className="text-emerald-400 shrink-0" />
                        : <WifiOff size={16} className="text-rose-400 shrink-0" />
                    }
                    <AnimatedText show={!collapsed}>
                        <span className={`text-xs font-medium ${backendOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {backendOnline ? 'Backend Online' : 'Backend Offline'}
                        </span>
                    </AnimatedText>
                </div>


                {/* Collapse button */}
                <motion.button
                    onClick={() => setCollapsed(!collapsed)}
                    className="nav-item w-full"
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                >
                    <motion.div animate={{ rotate: collapsed ? 0 : 180 }}>
                        <ChevronRight size={18} style={{ color: 'rgb(var(--text-muted))' }} />
                    </motion.div>
                    <AnimatedText show={!collapsed}>
                        <span className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Collapse</span>
                    </AnimatedText>
                </motion.button>
            </div>
        </motion.aside>
    );
}

// Helper: animates text in/out
function AnimatedText({ show, children }: { show: boolean; children: React.ReactNode }) {
    return (
        <motion.div
            animate={{ opacity: show ? 1 : 0, width: show ? 'auto' : 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
        >
            {children}
        </motion.div>
    );
}
