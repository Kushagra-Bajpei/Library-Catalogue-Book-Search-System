import { motion } from 'framer-motion';

interface LogoProps {
    size?: number;
    className?: string;
}

export default function Logo({ size = 40, className = "" }: LogoProps) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 512 512"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
        >
            {/* Aesthetic Open Book Line Art */}
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                d="M70,380 C140,340 210,340 256,375 C302,340 372,340 442,380 L442,190 C372,150 302,150 256,185 C210,150 140,150 70,190 Z"
                stroke="#0d9488"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Central Spine line of the book */}
            <motion.line
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                style={{ originY: 1 }}
                x1="256"
                y1="185"
                x2="256"
                y2="375"
                stroke="#0d9488"
                strokeWidth="12"
                strokeLinecap="round"
            />

            {/* Tree Branch Lines */}
            <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                x1="256"
                y1="120"
                x2="170"
                y2="210"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeLinecap="round"
            />
            <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                x1="256"
                y1="120"
                x2="342"
                y2="210"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeLinecap="round"
            />

            {/* Root Node (Top - Amber Gold) */}
            <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 350, delay: 0.8 }}
                cx="256"
                cy="120"
                r="28"
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth="6"
            />

            {/* Left Child Node (Teal) */}
            <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 350, delay: 0.9 }}
                cx="170"
                cy="210"
                r="24"
                fill="#0d9488"
                stroke="#ffffff"
                strokeWidth="5"
            />

            {/* Right Child Node (Teal) */}
            <motion.circle
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 350, delay: 0.9 }}
                cx="342"
                cy="210"
                r="24"
                fill="#0d9488"
                stroke="#ffffff"
                strokeWidth="5"
            />
        </motion.svg>
    );
}
