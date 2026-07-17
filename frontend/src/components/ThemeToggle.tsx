import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ThemeToggleProps {
    compact?: boolean;
}

export default function ThemeToggle({ compact }: ThemeToggleProps) {
    const { theme, toggleTheme } = useApp();

    if (compact) {
        return (
            <motion.button
                onClick={toggleTheme}
                whileTap={{ scale: 0.85 }}
                whileHover={{ rotate: 12 }}
                className="shrink-0 cursor-pointer p-1"
                aria-label="Toggle theme"
            >
                {theme === 'dark'
                    ? <Sun size={17} className="text-amber-400" />
                    : <Moon size={17} className="text-teal-600" />
                }
            </motion.button>
        );
    }

    return (
        <motion.button
            onClick={toggleTheme}
            whileTap={{ scale: 0.95 }}
            className="relative w-14 h-7 rounded-full p-1 cursor-pointer flex items-center transition-colors duration-150"
            style={{
                background: theme === 'dark'
                    ? 'rgba(13, 148, 136, 0.25)'
                    : 'rgba(245, 158, 11, 0.25)',
                border: `1px solid ${theme === 'dark' ? 'rgba(13, 148, 136, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
            }}
            aria-label="Toggle theme"
        >
            <motion.div
                className="w-5 h-5 rounded-full flex items-center justify-center"
                animate={{ x: theme === 'dark' ? 0 : 26 }}
                transition={{ type: 'spring', stiffness: 600, damping: 28 }}
                style={{
                    background: theme === 'dark'
                        ? 'linear-gradient(135deg, #0d9488, #14b8a6)'
                        : 'linear-gradient(135deg, #f59e0b, #f97316)',
                }}
            >
                {theme === 'dark'
                    ? <Moon size={11} className="text-white" />
                    : <Sun size={11} className="text-white" />
                }
            </motion.div>
        </motion.button>
    );
}
