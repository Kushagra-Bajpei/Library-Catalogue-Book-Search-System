// import { motion, useInView } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { useRef, useState, useEffect } from 'react';
// import { BookOpen, Search, GitBranch, Zap, ArrowRight, Star, ChevronDown, CheckCircle2, Layers } from 'lucide-react';
// import { api } from '../api/library';
// import type { Stats } from '../types';
// import Logo from '../components/Logo';
// import ThemeToggle from '../components/ThemeToggle';

// function FloatingBook({ x, y, delay, size = 40, rotate = 0 }: { x: number; y: number; delay: number; size?: number; rotate?: number }) {
//     return (
//         <motion.div
//             className="absolute pointer-events-none select-none"
//             style={{ left: `${x}%`, top: `${y}%` }}
//             initial={{ opacity: 0, scale: 0 }}
//             animate={{
//                 opacity: [0, 0.6, 0.4, 0.6],
//                 scale: 1,
//                 y: [0, -15, 0, -8, 0],
//                 rotate: [rotate, rotate + 5, rotate - 5, rotate],
//             }}
//             transition={{
//                 duration: 6 + delay,
//                 delay,
//                 repeat: Infinity,
//                 ease: 'easeInOut',
//             }}
//         >
//             <BookOpen size={size} className="text-teal-500/20" />
//         </motion.div>
//     );
// }

// interface StatCounterProps {
//     value: number;
//     label: string;
//     description: string;
//     icon: React.ReactNode;
//     color: 'indigo' | 'emerald' | 'cyan' | 'amber';
//     suffix?: string;
// }

// const colorMap = {
//     indigo: {
//         text: 'text-teal-400',
//         bg: 'bg-teal-500/10',
//         border: 'group-hover:border-teal-500/30',
//         glow: 'rgba(13, 148, 136, 0.18)',
//         badge: 'badge-teal',
//     },
//     emerald: {
//         text: 'text-emerald-400',
//         bg: 'bg-emerald-500/10',
//         border: 'group-hover:border-emerald-500/30',
//         glow: 'rgba(16, 185, 129, 0.15)',
//         badge: 'badge-emerald',
//     },
//     cyan: {
//         text: 'text-amber-400',
//         bg: 'bg-amber-500/10',
//         border: 'group-hover:border-amber-500/30',
//         glow: 'rgba(245, 158, 11, 0.15)',
//         badge: 'badge-amber',
//     },
//     amber: {
//         text: 'text-amber-400',
//         bg: 'bg-amber-500/10',
//         border: 'group-hover:border-amber-500/30',
//         glow: 'rgba(245, 158, 11, 0.15)',
//         badge: 'badge-amber',
//     },
// };

// function StatCounter({ value, label, description, icon, color, suffix = '' }: StatCounterProps) {
//     const ref = useRef(null);
//     const isInView = useInView(ref, { once: true });
//     const [count, setCount] = useState(0);
//     const cfg = colorMap[color];

//     useEffect(() => {
//         if (!isInView || value === 0) return;
//         let start = 0;
//         const duration = 1500;
//         const step = (timestamp: number) => {
//             if (!start) start = timestamp;
//             const progress = Math.min((timestamp - start) / duration, 1);
//             const eased = 1 - Math.pow(1 - progress, 3);
//             setCount(Math.round(value * eased));
//             if (progress < 1) requestAnimationFrame(step);
//         };
//         requestAnimationFrame(step);
//     }, [isInView, value]);

//     return (
//         <motion.div
//             ref={ref}
//             initial={{ opacity: 0, y: 30 }}
//             animate={isInView ? { opacity: 1, y: 0 } : {}}
//             transition={{ duration: 0.6, type: 'spring', stiffness: 80 }}
//             whileHover={{ y: -8, transition: { duration: 0.2 } }}
//             className={`group relative flex flex-col justify-between p-6 rounded-2xl glass-card border border-white/5 transition-all duration-300 ${cfg.border}`}
//             style={{
//                 background: 'rgba(8, 18, 12, 0.45)',
//                 boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
//             }}
//         >
//             {/* Soft background glow */}
//             <div
//                 className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
//                 style={{
//                     background: `radial-gradient(circle at 50% 50%, ${cfg.glow} 0%, transparent 60%)`,
//                 }}
//             />

//             <div>
//                 {/* Icon & Label */}
//                 <div className="flex items-center justify-between mb-4">
//                     <span className="text-xs font-semibold tracking-wider uppercase text-white/50">{label}</span>
//                     <div className={`p-2.5 rounded-xl ${cfg.bg} ${cfg.text} transition-transform duration-300 group-hover:scale-110`}>
//                         {icon}
//                     </div>
//                 </div>

//                 {/* Counting Number */}
//                 <div className="text-4xl font-extrabold text-white tracking-tight tabular-nums flex items-baseline">
//                     <span className="gradient-text">{count}</span>
//                     {suffix && <span className="text-lg font-medium text-white/40 ml-1">{suffix}</span>}
//                 </div>
//             </div>

//             {/* Micro-detailing Description */}
//             <p className="text-xs text-white/40 mt-3 group-hover:text-white/60 transition-colors duration-300 line-clamp-2">
//                 {description}
//             </p>
//         </motion.div>
//     );
// }

// export default function Landing() {
//     const [stats, setStats] = useState<Stats | null>(null);
//     const [backendOk, setBackendOk] = useState<boolean | null>(null);

//     useEffect(() => {
//         api.health()
//             .then(() => {
//                 setBackendOk(true);
//                 return api.getStats();
//             })
//             .then(s => setStats(s))
//             .catch(() => setBackendOk(false));
//     }, []);

//     return (
//         <div className="min-h-screen relative overflow-hidden" style={{ background: 'rgb(var(--bg-primary))' }}>
//             {/* Animated gradient orbs */}
//             <div className="fixed inset-0 pointer-events-none overflow-hidden">
//                 <motion.div
//                     className="absolute w-[600px] h-[600px] rounded-full"
//                     style={{
//                         background: 'radial-gradient(circle, rgba(13,148,136,0.14) 0%, transparent 70%)',
//                         top: '-10%', left: '-10%',
//                     }}
//                     animate={{ x: [0, 40, 0], y: [0, 60, 0] }}
//                     transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
//                 />
//                 <motion.div
//                     className="absolute w-[500px] h-[500px] rounded-full"
//                     style={{
//                         background: 'radial-gradient(circle, rgba(217,119,6,0.10) 0%, transparent 70%)',
//                         bottom: '-10%', right: '-5%',
//                     }}
//                     animate={{ x: [0, -40, 0], y: [0, -40, 0] }}
//                     transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
//                 />
//                 <motion.div
//                     className="absolute w-[300px] h-[300px] rounded-full"
//                     style={{
//                         background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)',
//                         top: '50%', left: '50%',
//                         transform: 'translate(-50%, -50%)',
//                     }}
//                     animate={{ scale: [1, 1.3, 1] }}
//                     transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
//                 />
//             </div>

//             {/* Floating books */}
//             <FloatingBook x={8} y={15} delay={0} size={32} rotate={-15} />
//             <FloatingBook x={85} y={10} delay={1.5} size={48} rotate={20} />
//             <FloatingBook x={5} y={70} delay={3} size={28} rotate={10} />
//             <FloatingBook x={90} y={60} delay={0.8} size={36} rotate={-25} />
//             <FloatingBook x={50} y={85} delay={2} size={24} rotate={5} />
//             <FloatingBook x={70} y={30} delay={2.5} size={30} rotate={-10} />

//             {/* Grid pattern */}
//             <div className="fixed inset-0 pointer-events-none"
//                 style={{
//                     backgroundImage: 'linear-gradient(rgba(13,148,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.04) 1px, transparent 1px)',
//                     backgroundSize: '48px 48px',
//                 }}
//             />

//             {/* Navbar */}
//             <nav className="relative z-10 flex items-center justify-between px-8 py-5">
//                 <motion.div
//                     initial={{ opacity: 0, x: -20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                 >
//                     <Link to="/" className="flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer select-none">
//                         <Logo size={36} />
//                         <div>
//                             <span className="font-bold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>LibraryOS</span>
//                             <span className="ml-2 badge badge-teal">AVL Engine</span>
//                         </div>
//                     </Link>
//                 </motion.div>

//                 <motion.div
//                     initial={{ opacity: 0, x: 20 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     className="flex items-center gap-4"
//                 >
//                     {backendOk === true && <span className="badge badge-emerald flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />Backend Online</span>}
//                     {backendOk === false && <span className="badge badge-rose">Backend Offline</span>}
//                     <ThemeToggle />
//                     <Link to="/dashboard">
//                         <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-primary text-sm">
//                             Open Dashboard
//                         </motion.button>
//                     </Link>
//                 </motion.div>
//             </nav>

//             {/* Hero */}
//             <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-16">
//                 <motion.div
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.1 }}
//                     className="mb-5"
//                 >
//                     <span className="badge badge-indigo text-xs px-4 py-1.5">
//                         <Zap size={10} className="mr-1 inline" />
//                         Powered by C++ AVL Tree Data Structure
//                     </span>
//                 </motion.div>

//                 <motion.h1
//                     initial={{ opacity: 0, y: 40 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
//                     className="text-5xl md:text-7xl font-black leading-tight mb-6 max-w-4xl"
//                 >
//                     <span style={{ color: 'rgb(var(--text-primary))' }}>Smarter Libraries.</span>
//                     <br />
//                     <span className="gradient-text">Faster Discovery.</span>
//                 </motion.h1>

//                 <motion.p
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.35 }}
//                     className="text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
//                     style={{ color: 'rgb(var(--text-secondary))' }}
//                 >
//                     Experience a modern digital library powered by C++ and self-balancing AVL Trees
//                     for fast and efficient book discovery with O(log n) search performance.
//                 </motion.p>

//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.45 }}
//                     className="flex flex-wrap items-center justify-center gap-4"
//                 >
//                     <Link to="/dashboard">
//                         <motion.button
//                             whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(13,148,136,0.55)' }}
//                             whileTap={{ scale: 0.97 }}
//                             className="btn-primary flex items-center gap-2 text-base py-3 px-8"
//                         >
//                             <BookOpen size={18} />
//                             Explore Library
//                             <ArrowRight size={16} />
//                         </motion.button>
//                     </Link>
//                     <Link to="/avl">
//                         <motion.button
//                             whileHover={{ scale: 1.05 }}
//                             whileTap={{ scale: 0.97 }}
//                             className="btn-secondary flex items-center gap-2 text-base py-3 px-8"
//                         >
//                             <GitBranch size={18} />
//                             View AVL Tree
//                         </motion.button>
//                     </Link>
//                 </motion.div>

//                 {/* Scroll indicator */}
//                 <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 1.5 }}
//                     className="mt-16 flex flex-col items-center gap-2"
//                 >
//                     <span className="text-xs uppercase tracking-widest" style={{ color: 'rgb(var(--text-muted))' }}>Scroll to explore</span>
//                     <motion.div
//                         animate={{ y: [0, 8, 0] }}
//                         transition={{ duration: 1.5, repeat: Infinity }}
//                     >
//                         <ChevronDown size={18} style={{ color: 'rgb(var(--text-muted))' }} />
//                     </motion.div>
//                 </motion.div>
//             </section>

//             {/* Stats */}
//             <section className="relative z-10 px-6 py-12">
//                 <div className="max-w-6xl mx-auto">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//                         <StatCounter
//                             value={stats?.total_books ?? 0}
//                             label="Total Books"
//                             description="Total unique book titles indexed inside the live database catalogue."
//                             icon={<BookOpen size={20} />}
//                             color="indigo"
//                         />
//                         <StatCounter
//                             value={stats?.available_copies ?? 0}
//                             label="Available Copies"
//                             description="Physical book copies currently available on-shelf for active borrowing."
//                             icon={<CheckCircle2 size={20} />}
//                             color="emerald"
//                         />
//                         <StatCounter
//                             value={stats?.categories ?? 0}
//                             label="Categories"
//                             description="Distinct genres, subjects, and topics categorizing the catalogue."
//                             icon={<Layers size={20} />}
//                             color="cyan"
//                         />
//                         <StatCounter
//                             value={stats?.avl_height ?? 0}
//                             label="AVL Tree Height"
//                             description="Overall height of the self-balancing binary search structure."
//                             icon={<GitBranch size={20} />}
//                             color="amber"
//                         />
//                     </div>
//                 </div>
//             </section>

//             {/* Why AVL Section & Technical Specification details */}
//             <section className="relative z-10 px-6 py-16">
//                 <div className="max-w-6xl mx-auto">
//                     <div className="text-center mb-16">
//                         <motion.h2
//                             initial={{ opacity: 0, y: 20 }}
//                             whileInView={{ opacity: 1, y: 0 }}
//                             viewport={{ once: true }}
//                             className="text-4xl font-extrabold mb-4 gradient-text"
//                         >
//                             Why AVL Trees? The Mathematical Invariant
//                         </motion.h2>
//                         <p className="max-w-2xl mx-auto text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
//                             Standard Binary Search Trees (BST) degenerate into linear linked lists $O(n)$ if items are inserted in sorted order. An AVL Tree enforces strict balancing to guarantee logarithmic search.
//                         </p>
//                     </div>

//                     <div className="grid md:grid-cols-3 gap-6 mb-16">
//                         {[
//                             {
//                                 icon: <Search size={24} />,
//                                 title: 'O(log n) Guaranteed Lookups',
//                                 desc: 'Unlike arrays or databases requiring sequential scan disk queries, our C++ AVL Tree tree index maps books in memory tree heights with instant traversal.',
//                                 color: '#0d9488',
//                             },
//                             {
//                                 icon: <GitBranch size={24} />,
//                                 title: 'Height Balancing (BF)',
//                                 desc: 'Every single insertion or deletion evaluates node heights. The balance factor (BF) formula: BF = Height(Left) - Height(Right). If |BF| > 1, rotations trigger.',
//                                 color: '#f59e0b',
//                             },
//                             {
//                                 icon: <Zap size={24} />,
//                                 title: 'Self-Correcting Architecture',
//                                 desc: 'Standard files become slow as they grow. The AVL index matches these lookups by organizing pointers and keeping the global tree completely uniform.',
//                                 color: '#10b981',
//                             },
//                         ].map((f, i) => (
//                             <motion.div
//                                 key={f.title}
//                                 initial={{ opacity: 0, y: 30 }}
//                                 whileInView={{ opacity: 1, y: 0 }}
//                                 viewport={{ once: true }}
//                                 transition={{ delay: i * 0.1 }}
//                                 whileHover={{ y: -6 }}
//                                 className="glass-card p-6"
//                                 style={{ background: 'rgba(8, 18, 12, 0.4)' }}
//                             >
//                                 <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
//                                     style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
//                                     <span style={{ color: f.color }}>{f.icon}</span>
//                                 </div>
//                                 <h3 className="text-base font-bold mb-2 text-white">{f.title}</h3>
//                                 <p className="text-xs leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>{f.desc}</p>
//                             </motion.div>
//                         ))}
//                     </div>

//                     {/* Algorithmic Complexity Showdown Table */}
//                     <div className="glass-card p-8 mb-16" style={{ background: 'rgba(8, 18, 12, 0.3)' }}>
//                         <h3 className="text-lg font-bold mb-4 text-white">Algorithmic Efficiency Matrix</h3>
//                         <p className="text-xs mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
//                             Compare lookup, insertion, and deletion complexity ratios between balanced AVL, unbalanced BST, and typical linear files.
//                         </p>
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left text-xs border-collapse">
//                                 <thead>
//                                     <tr className="border-b border-white/10" style={{ color: 'rgb(var(--text-muted))' }}>
//                                         <th className="pb-3 font-semibold">Data Structure</th>
//                                         <th className="pb-3 font-semibold">Search (Avg)</th>
//                                         <th className="pb-3 font-semibold">Search (Worst)</th>
//                                         <th className="pb-3 font-semibold font-mono">Insert / Delete</th>
//                                         <th className="pb-3 font-semibold">Memory Overhead</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody style={{ color: 'rgb(var(--text-secondary))' }}>
//                                     <tr className="border-b border-white/5">
//                                         <td className="py-3 font-semibold text-teal-400">Balanced AVL Tree</td>
//                                         <td className="py-3 font-mono">O(log n)</td>
//                                         <td className="py-3 font-mono text-teal-400 font-bold">O(log n)</td>
//                                         <td className="py-3 font-mono">O(log n)</td>
//                                         <td className="py-3">O(n) - 1 Balance Factor integer per Node</td>
//                                     </tr>
//                                     <tr className="border-b border-white/5">
//                                         <td className="py-3 font-semibold text-white/80">Unbalanced BST</td>
//                                         <td className="py-3 font-mono">O(log n)</td>
//                                         <td className="py-3 font-mono text-amber-500 font-bold">O(n) [Degenerated]</td>
//                                         <td className="py-3 font-mono">O(n) [Worst]</td>
//                                         <td className="py-3">O(n) - No balancing attributes</td>
//                                     </tr>
//                                     <tr>
//                                         <td className="py-3 font-semibold text-white/50">Linear Files / Database Scan</td>
//                                         <td className="py-3 font-mono">O(n)</td>
//                                         <td className="py-3 font-mono text-rose-500 font-bold">O(n)</td>
//                                         <td className="py-3 font-mono">O(n) [Rewrite required]</td>
//                                         <td className="py-3">O(1) - External files overhead</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                     {/* Interactive Rotations Playground Simulator */}
//                     <RotationPlayground />

//                     {/* System Architecture Flow */}
//                     <div className="grid md:grid-cols-2 gap-8 items-stretch mt-16">
//                         <div className="glass-card p-6 flex flex-col justify-between" style={{ background: 'rgba(8, 18, 12, 0.4)' }}>
//                             <div>
//                                 <div className="inline-block p-2 rounded-lg bg-teal-500/10 text-teal-400 text-xs font-semibold mb-4">
//                                     DATA PERSISTENCE MODEL
//                                 </div>
//                                 <h3 className="text-lg font-bold mb-3 text-white">Custom JSON Serialization Engine</h3>
//                                 <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
//                                     To satisfy the core File Handling requirements, this system manages books using flat JSON files (`books.json`).
//                                     Instead of slow, repetitive disk polling on searching, the backend builds the memory self-balancing AVL Tree index once at boot.
//                                     Every write operation (Insert/Update/Delete) modifies the memory structure and updates the file concurrently.
//                                 </p>
//                             </div>
//                             <div className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-teal-300">
//                                 <span className="text-white/40">// Auto-save execution trace inside library.h</span><br />
//                                 std::ofstream file(db_path);<br />
//                                 file &lt;&lt; serializeToJson(tree.getRoot());<br />
//                                 file.close();
//                             </div>
//                         </div>

//                         <div className="glass-card p-6 flex flex-col justify-between" style={{ background: 'rgba(8, 18, 12, 0.4)' }}>
//                             <div>
//                                 <div className="inline-block p-2 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold mb-4">
//                                     ROTATION TRACKER HISTORY
//                                 </div>
//                                 <h3 className="text-lg font-bold mb-3 text-white">Self-Balancing Diagnostic Logger</h3>
//                                 <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
//                                     The C++ backend automatically intercepts all balance structural shifts (LL, RR, LR, RL) occurring during runtime operations and registers them in a central history collector.
//                                     This allows you to verify that balancing operations are occurring live and inspect the specific nodes being repositioned.
//                                 </p>
//                             </div>
//                             <div className="flex flex-col gap-2">
//                                 <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white/5 border border-white/5">
//                                     <span className="font-semibold text-white">Left-Left (LL) Right Rotation</span>
//                                     <span className="text-teal-400 font-mono">Pivot root node shift</span>
//                                 </div>
//                                 <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white/5 border border-white/5">
//                                     <span className="font-semibold text-white">Right-Left (RL) Double Rotation</span>
//                                     <span className="text-amber-400 font-mono">Double height balance fix</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* CTA */}
//             <section className="relative z-10 px-6 py-16">
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.95 }}
//                     whileInView={{ opacity: 1, scale: 1 }}
//                     viewport={{ once: true }}
//                     className="max-w-4xl mx-auto text-center glass-card p-12"
//                     style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.1), rgba(16,185,129,0.08))' }}
//                 >
//                     <Star size={32} className="mx-auto mb-4 text-amber-400" />
//                     <h2 className="text-3xl font-extrabold mb-3 text-white">
//                         Access Library Control Panel
//                     </h2>
//                     <p className="mb-8 text-sm max-w-xl mx-auto" style={{ color: 'rgb(var(--text-secondary))' }}>
//                         Connect to the live C++ compiler system. Insert new publications, trigger rotation actions, and query heights.
//                     </p>
//                     <div className="flex items-center justify-center gap-4">
//                         <Link to="/dashboard">
//                             <motion.button
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.97 }}
//                                 className="btn-primary flex items-center gap-2"
//                             >
//                                 Enter Dashboard <ArrowRight size={16} />
//                             </motion.button>
//                         </Link>
//                         <Link to="/avl">
//                             <motion.button
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.97 }}
//                                 className="btn-secondary"
//                             >
//                                 Visualizer Engine
//                             </motion.button>
//                         </Link>
//                     </div>
//                 </motion.div>
//             </section>
//         </div>
//     );
// }

// // ─── Interactive Rotation Simulator Component ───────────────────────────────

// interface TreeState {
//     parent: string;
//     left: string;
//     right: string;
//     leftLeft?: string;
//     leftRight?: string;
//     rightLeft?: string;
//     rightRight?: string;
// }

// function RotationPlayground() {
//     const [activeTab, setActiveTab] = useState<'LL' | 'RR' | 'LR' | 'RL'>('LL');

//     const simulations: Record<'LL' | 'RR' | 'LR' | 'RL', { title: string; trigger: string; code: string; leftTree: TreeState; rightTree: TreeState }> = {
//         LL: {
//             title: 'Single Right Rotation (LL)',
//             trigger: 'Triggered when the Left Subtree is left-heavy (BF = +2, Child BF = +1)',
//             code: `// Balancing left-left case
// Node* k1 = root->left;
// root->left = k1->right;
// k1->right = root;
// updateHeight(root);
// updateHeight(k1);
// return k1; // New sub-root`,
//             leftTree: {
//                 parent: 'A (BF=+2)',
//                 left: 'B (BF=+1)',
//                 right: 'T3',
//                 leftLeft: 'C (BF=0)',
//                 leftRight: 'T2',
//             },
//             rightTree: {
//                 parent: 'B (BF=0)',
//                 left: 'C (BF=0)',
//                 right: 'A (BF=0)',
//                 leftLeft: 'T0',
//                 leftRight: 'T1',
//                 rightRight: 'T3',
//                 rightLeft: 'T2'
//             }
//         },
//         RR: {
//             title: 'Single Left Rotation (RR)',
//             trigger: 'Triggered when the Right Subtree is right-heavy (BF = -2, Child BF = -1)',
//             code: `// Balancing right-right case
// Node* k2 = root->right;
// root->right = k2->left;
// k2->left = root;
// updateHeight(root);
// updateHeight(k2);
// return k2; // New sub-root`,
//             leftTree: {
//                 parent: 'A (BF=-2)',
//                 left: 'T0',
//                 right: 'B (BF=-1)',
//                 rightLeft: 'T1',
//                 rightRight: 'C (BF=0)',
//             },
//             rightTree: {
//                 parent: 'B (BF=0)',
//                 left: 'A (BF=0)',
//                 right: 'C (BF=0)',
//                 leftLeft: 'T0',
//                 leftRight: 'T1',
//                 rightLeft: 'T2',
//                 rightRight: 'T3'
//             }
//         },
//         LR: {
//             title: 'Double Left-Right Rotation (LR)',
//             trigger: 'Triggered when the Left Subtree is right-heavy (BF = +2, Child BF = -1)',
//             code: `// Balancing left-right case
// root->left = rotateLeft(root->left);
// return rotateRight(root);`,
//             leftTree: {
//                 parent: 'A (BF=+2)',
//                 left: 'B (BF=-1)',
//                 right: 'T3',
//                 leftLeft: 'T0',
//                 leftRight: 'C (BF=+1)',
//             },
//             rightTree: {
//                 parent: 'C (BF=0)',
//                 left: 'B (BF=0)',
//                 right: 'A (BF=0)',
//                 leftLeft: 'T0',
//                 leftRight: 'T1',
//                 rightLeft: 'T2',
//                 rightRight: 'T3'
//             }
//         },
//         RL: {
//             title: 'Double Right-Left Rotation (RL)',
//             trigger: 'Triggered when the Right Subtree is left-heavy (BF = -2, Child BF = +1)',
//             code: `// Balancing right-left case
// root->right = rotateRight(root->right);
// return rotateLeft(root);`,
//             leftTree: {
//                 parent: 'A (BF=-2)',
//                 left: 'T0',
//                 right: 'B (BF=+1)',
//                 rightLeft: 'C (BF=-1)',
//                 rightRight: 'T3',
//             },
//             rightTree: {
//                 parent: 'C (BF=0)',
//                 left: 'A (BF=0)',
//                 right: 'B (BF=0)',
//                 leftLeft: 'T0',
//                 leftRight: 'T1',
//                 rightLeft: 'T2',
//                 rightRight: 'T3'
//             }
//         }
//     };

//     const sim = simulations[activeTab];

//     const renderNode = (text: string | undefined, styleType: 'parent-rose' | 'parent-emerald' | 'child' | 'muted' | 'leaf-rose') => {
//         if (!text) return null;
//         const parts = text.split(' ');
//         const label = parts[0];
//         const bf = parts.slice(1).join(' '); // e.g. "(BF=+2)"

//         let borderClass = 'border-white/10';
//         let bgClass = 'bg-white/5';
//         let textClass = 'text-white/80';
//         let bfClass = 'text-white/40';

//         if (styleType === 'parent-rose') {
//             borderClass = 'border-rose-500/30';
//             bgClass = 'bg-rose-500/10';
//             textClass = 'text-rose-400 font-bold';
//             bfClass = 'text-rose-450';
//         } else if (styleType === 'parent-emerald') {
//             borderClass = 'border-emerald-500/30';
//             bgClass = 'bg-emerald-500/10';
//             textClass = 'text-emerald-400 font-bold';
//             bfClass = 'text-emerald-450';
//         } else if (styleType === 'muted') {
//             borderClass = 'border-white/5';
//             bgClass = 'bg-white/5';
//             textClass = 'text-white/40';
//             bfClass = 'text-white/20';
//         } else if (styleType === 'leaf-rose') {
//             borderClass = 'border-rose-500/20';
//             bgClass = 'bg-rose-500/5';
//             textClass = 'text-rose-405 font-medium';
//             bfClass = 'text-rose-450';
//         }

//         return (
//             <div className={`w-14 h-14 rounded-full border ${borderClass} ${bgClass} flex flex-col items-center justify-center select-none shadow-sm transition-all duration-300`}>
//                 <span className={`text-[11px] ${textClass} leading-none font-bold`}>{label}</span>
//                 {bf && <span className={`text-[8px] ${bfClass} font-mono mt-0.5 leading-none`}>{bf}</span>}
//             </div>
//         );
//     };

//     return (
//         <div className="glass-card p-6" style={{ background: 'rgba(8, 18, 12, 0.45)' }}>
//             <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-white/5 pb-4">
//                 <div>
//                     <h3 className="text-xl font-bold text-white flex items-center gap-2">
//                         <Zap size={18} className="text-amber-400" />
//                         AVL Rotation Playground
//                     </h3>
//                     <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>
//                         Toggle rotation events to isolate how balancing routines execute in the C++ kernel.
//                     </p>
//                 </div>
//                 <div className="flex flex-wrap gap-1">
//                     {(['LL', 'RR', 'LR', 'RL'] as const).map(tab => (
//                         <button
//                             key={tab}
//                             onClick={() => setActiveTab(tab)}
//                             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab
//                                 ? 'bg-teal-500 text-black shadow-md'
//                                 : 'white/5 text-white/60 hover:text-white hover:bg-white/5'
//                                 }`}
//                         >
//                             {tab} Rotation
//                         </button>
//                     ))}
//                 </div>
//             </div>

//             <div className="grid lg:grid-cols-12 gap-8 items-stretch">
//                 {/* Structural Diagram Representation */}
//                 <div className="lg:col-span-7 flex flex-col justify-between">
//                     <div>
//                         <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-400 mb-1">{sim.title}</h4>
//                         <p className="text-xs mb-6 text-white/50">{sim.trigger}</p>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4 text-center items-center justify-center p-4 bg-black/30 rounded-2xl border border-white/5">
//                         {/* Imbalanced state */}
//                         <div className="flex flex-col items-center">
//                             <span className="text-[10px] font-semibold text-rose-400/80 mb-4 uppercase">Imbalanced Tree</span>
//                             <div className="flex flex-col items-center justify-center min-h-[170px] leading-5">
//                                 {renderNode(sim.leftTree.parent, 'parent-rose')}
//                                 <div className="w-0.5 h-3 bg-white/10 my-1" />
//                                 <div className="flex gap-4 items-center">
//                                     {renderNode(sim.leftTree.left, 'child')}
//                                     {renderNode(sim.leftTree.right, 'muted')}
//                                 </div>
//                                 {(sim.leftTree.leftLeft || sim.leftTree.leftRight || sim.leftTree.rightLeft || sim.leftTree.rightRight) && (
//                                     <>
//                                         <div className="w-0.5 h-3 bg-white/10 my-1" />
//                                         <div className="flex gap-2">
//                                             {renderNode(sim.leftTree.leftLeft, 'leaf-rose')}
//                                             {renderNode(sim.leftTree.leftRight, 'muted')}
//                                             {renderNode(sim.leftTree.rightLeft, 'muted')}
//                                             {renderNode(sim.leftTree.rightRight, 'leaf-rose')}
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Rebalanced state */}
//                         <div className="flex flex-col items-center border-l border-white/5">
//                             <span className="text-[10px] font-semibold text-emerald-400 mb-4 uppercase">Rebalanced (Balanced)</span>
//                             <div className="flex flex-col items-center justify-center min-h-[170px] leading-5">
//                                 {renderNode(sim.rightTree.parent, 'parent-emerald')}
//                                 <div className="w-0.5 h-3 bg-white/10 my-1" />
//                                 <div className="flex gap-4 items-center">
//                                     {renderNode(sim.rightTree.left, 'child')}
//                                     {renderNode(sim.rightTree.right, 'child')}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Code snippets */}
//                 <div className="lg:col-span-5 flex flex-col justify-between">
//                     <div>
//                         <h4 className="text-[10px] font-semibold uppercase tracking-wider text-amber-400 mb-3">C++ Rebalancing Code</h4>
//                         <pre className="p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] leading-relaxed text-emerald-300 overflow-x-auto">
//                             <code>{sim.code}</code>
//                         </pre>
//                     </div>
//                     <div className="mt-4 p-3 rounded-lg bg-teal-500/5 border border-teal-500/10 text-[11px] leading-relaxed text-teal-200/80">
//                         <strong>Logic Note:</strong> Pointer swapping occurs in $O(1)$ constant time step. Balancing keeps the overall height bound tightly to $1.44 \log_2(n)$ at all times.
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
