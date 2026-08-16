import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GitBranch, RefreshCw, ZoomIn, ZoomOut, Maximize2, RotateCcw,
    Loader2, Info, ChevronRight, Play
} from 'lucide-react';
import { api } from '../api/library';
import type { AVLTreeNode, AVLTreeData, TraversalType } from '../types';

// ─── Layout ──────────────────────────────────────────────────────────────────
const NODE_RADIUS = 28;
const V_GAP = 80;

interface LayoutNode {
    node: AVLTreeNode;
    x: number;
    y: number;
    id: string;
}

function layoutTree(root: AVLTreeNode | null, containerW: number): LayoutNode[] {
    if (!root) return [];
    const nodes: LayoutNode[] = [];
    let counter = 0;

    const xOf: Record<string, number> = {};

    function countLeaves(n: AVLTreeNode | null): number {
        if (!n) return 1;
        return countLeaves(n.left) + countLeaves(n.right);
    }

    function assign(n: AVLTreeNode | null, depth: number, left: number, right: number, _parentId = ''): void {
        if (!n) return;
        const id = `${n.isbn}-${counter++}`;
        const x = (left + right) / 2;
        const y = depth * V_GAP + NODE_RADIUS + 20;
        xOf[n.isbn] = x;
        nodes.push({ node: n, x, y, id });
        const leftLeaves = countLeaves(n.left);
        const rightLeaves = countLeaves(n.right);
        const total = leftLeaves + rightLeaves;
        assign(n.left, depth + 1, left, left + ((right - left) * leftLeaves) / total, id);
        assign(n.right, depth + 1, right - ((right - left) * rightLeaves) / total, right, id);
    }

    assign(root, 0, 0, containerW, '');
    return nodes;
}

function buildEdges(root: AVLTreeNode | null, layoutNodes: LayoutNode[]): Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> {
    const edges: Array<{ x1: number; y1: number; x2: number; y2: number; key: string }> = [];
    const map = new Map(layoutNodes.map(n => [n.node.isbn, n]));

    function walk(n: AVLTreeNode | null): void {
        if (!n) return;
        const parent = map.get(n.isbn);
        if (!parent) return;
        if (n.left) {
            const child = map.get(n.left.isbn);
            if (child) edges.push({ x1: parent.x, y1: parent.y, x2: child.x, y2: child.y, key: `${parent.node.isbn}-${child.node.isbn}` });
        }
        if (n.right) {
            const child = map.get(n.right.isbn);
            if (child) edges.push({ x1: parent.x, y1: parent.y, x2: child.x, y2: child.y, key: `${parent.node.isbn}-r-${child.node.isbn}` });
        }
        walk(n.left);
        walk(n.right);
    }

    walk(root);
    return edges;
}

// ─── Rotation explanations ───────────────────────────────────────────────────
const ROTATION_INFO: Record<string, { color: string; title: string; desc: string }> = {
    LL: {
        color: '#0d9488',
        title: 'LL Rotation (Single Right)',
        desc: 'The left subtree of the left child became heavy. A single right rotation at the unbalanced node restores AVL property.',
    },
    RR: {
        color: '#2dd4bf',
        title: 'RR Rotation (Single Left)',
        desc: 'The right subtree of the right child became heavy. A single left rotation at the unbalanced node restores AVL property.',
    },
    LR: {
        color: '#d97706',
        title: 'LR Rotation (Left then Right)',
        desc: 'The left subtree became right-heavy. A left rotation on the left child followed by a right rotation at the node restores balance.',
    },
    RL: {
        color: '#10b981',
        title: 'RL Rotation (Right then Left)',
        desc: 'The right subtree became left-heavy. A right rotation on the right child followed by a left rotation at the node restores balance.',
    },
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AVLVisualizer() {
    const [treeData, setTreeData] = useState<AVLTreeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [traversalType, setTraversalType] = useState<TraversalType>('inorder');
    const [traversalResult, setTraversalResult] = useState<string[]>([]);
    const [traversalActive, setTraversalActive] = useState(false);
    const [animatedIndex, setAnimatedIndex] = useState(-1);
    const [selectedNode, setSelectedNode] = useState<AVLTreeNode | null>(null);
    const [lastRotation, setLastRotation] = useState<{ type: string; pivot: string; desc: string } | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerW = 900;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [tree, stats] = await Promise.all([api.getAVLTree(), api.getStats()]);
            setTreeData(tree);
            // Set last rotation from stats history
            const hist = stats.rotation_history;
            if (hist.length > 0) {
                const r = hist[hist.length - 1];
                if (r.type !== 'NONE') {
                    setLastRotation({ type: r.type, pivot: r.pivot, desc: r.description });
                }
            }
        } catch {
            setTreeData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const runTraversal = async () => {
        setTraversalActive(true);
        setAnimatedIndex(-1);
        setTraversalResult([]);
        try {
            const res = await api.getTraversal(traversalType);
            const isbns = res.books.map(b => b.isbn);
            setTraversalResult(isbns);
            // Animate one node at a time
            for (let i = 0; i < isbns.length; i++) {
                setAnimatedIndex(i);
                await new Promise(r => setTimeout(r, 600));
            }
            setAnimatedIndex(-1);
        } finally {
            setTraversalActive(false);
        }
    };

    const isTraversalHighlighted = (isbn: string) => {
        if (traversalResult.length === 0) return false;
        return traversalResult.indexOf(isbn) <= animatedIndex && animatedIndex >= 0;
    };

    const isCurrentTraversal = (isbn: string) => {
        if (animatedIndex < 0) return false;
        return traversalResult[animatedIndex] === isbn;
    };

    const layoutNodes = treeData?.root ? layoutTree(treeData.root, containerW) : [];
    const edges = treeData?.root ? buildEdges(treeData.root, layoutNodes) : [];
    const svgH = layoutNodes.length > 0 ? Math.max(...layoutNodes.map(n => n.y)) + NODE_RADIUS + 40 : 200;

    const isRoot = (isbn: string) => treeData?.root?.isbn === isbn;
    const isUnbalanced = (node: AVLTreeNode) => Math.abs(node.balance_factor) > 1;

    // Panning
    const dragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>AVL Tree Visualizer</h1>
                    <p className="text-sm mt-0.5" style={{ color: 'rgb(var(--text-muted))' }}>
                        Interactive visualization of the self-balancing Binary Search Tree
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {treeData && (
                        <>
                            <span className="badge badge-indigo">Height: {treeData.height}</span>
                            <span className="badge badge-emerald">Nodes: {treeData.size}</span>
                        </>
                    )}
                    <motion.button
                        onClick={load}
                        whileTap={{ scale: 0.95 }}
                        className="p-2.5 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <motion.div animate={{ rotate: loading ? 360 : 0 }} transition={{ duration: 0.8, repeat: loading ? Infinity : 0 }}>
                            <RefreshCw size={16} style={{ color: 'rgb(var(--text-secondary))' }} />
                        </motion.div>
                    </motion.button>
                </div>
            </motion.div>

            {/* Last Rotation Banner */}
            <AnimatePresence>
                {lastRotation && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl p-4 flex items-start gap-3"
                        style={{
                            background: `${ROTATION_INFO[lastRotation.type]?.color || '#6366f1'}15`,
                            border: `1px solid ${ROTATION_INFO[lastRotation.type]?.color || '#6366f1'}30`,
                        }}
                    >
                        <RotateCcw size={18} className="mt-0.5 shrink-0" style={{ color: ROTATION_INFO[lastRotation.type]?.color || '#6366f1' }} />
                        <div>
                            <p className="text-sm font-semibold" style={{ color: ROTATION_INFO[lastRotation.type]?.color }}>
                                {ROTATION_INFO[lastRotation.type]?.title || `${lastRotation.type} Rotation`} Detected
                            </p>
                            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgb(var(--text-secondary))' }}>
                                {lastRotation.desc}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls row */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Zoom controls */}
                <div className="flex items-center gap-1 rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                    <button onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}
                        className="p-2 hover:bg-white/5 transition-colors" title="Zoom Out">
                        <ZoomOut size={15} style={{ color: 'rgb(var(--text-secondary))' }} />
                    </button>
                    <span className="px-3 py-1 text-xs font-mono" style={{ color: 'rgb(var(--text-muted))' }}>
                        {Math.round(zoom * 100)}%
                    </span>
                    <button onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
                        className="p-2 hover:bg-white/5 transition-colors" title="Zoom In">
                        <ZoomIn size={15} style={{ color: 'rgb(var(--text-secondary))' }} />
                    </button>
                </div>

                <button
                    onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgb(var(--text-secondary))' }}
                >
                    <Maximize2 size={13} />
                    Reset View
                </button>

                <div className="w-px h-5 opacity-20" style={{ background: 'rgb(var(--text-muted))' }} />

                {/* Traversal */}
                {(['inorder', 'preorder', 'postorder'] as TraversalType[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTraversalType(t)}
                        className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                        style={{
                            background: traversalType === t ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                            color: traversalType === t ? '#818cf8' : 'rgb(var(--text-secondary))',
                            border: `1px solid ${traversalType === t ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        }}
                    >
                        {t}
                    </button>
                ))}
                <motion.button
                    onClick={runTraversal}
                    disabled={traversalActive || !treeData?.root}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
                    style={{
                        background: 'rgba(16,185,129,0.15)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        color: '#34d399',
                        opacity: traversalActive || !treeData?.root ? 0.5 : 1,
                    }}
                >
                    {traversalActive
                        ? <><Loader2 size={13} className="animate-spin" />Animating...</>
                        : <><Play size={13} />Run Traversal</>
                    }
                </motion.button>
            </div>

            {/* SVG Tree Canvas */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card overflow-hidden relative"
                style={{ minHeight: 420, cursor: 'grab' }}
                onMouseDown={e => { dragging.current = true; dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }; }}
                onMouseMove={e => {
                    if (!dragging.current) return;
                    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
                }}
                onMouseUp={() => { dragging.current = false; }}
                onMouseLeave={() => { dragging.current = false; }}
                onWheel={e => setZoom(z => Math.max(0.3, Math.min(2.5, z - e.deltaY * 0.001)))}
            >
                {loading ? (
                    <div className="flex items-center justify-center h-80">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                            <Loader2 size={32} className="text-indigo-400" />
                        </motion.div>
                    </div>
                ) : !treeData?.root ? (
                    <div className="flex flex-col items-center justify-center h-80">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                            <GitBranch size={48} className="opacity-10 mb-4" style={{ color: 'rgb(var(--text-muted))' }} />
                        </motion.div>
                        <p className="text-sm" style={{ color: 'rgb(var(--text-muted))' }}>No books in the tree yet</p>
                        <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-muted))' }}>Add a book to see the AVL Tree</p>
                    </div>
                ) : (
                    <div className="overflow-hidden" style={{ height: Math.max(420, svgH * zoom + 60) }}>
                        <svg
                            ref={svgRef}
                            width={containerW}
                            height={svgH}
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                                transformOrigin: 'top center',
                                display: 'block',
                                margin: '0 auto',
                                transition: 'transform 0.05s',
                            }}
                        >
                            {/* Defs */}
                            <defs>
                                <filter id="glow-indigo">
                                    <feGaussianBlur stdDeviation="4" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                <filter id="glow-amber">
                                    <feGaussianBlur stdDeviation="6" result="blur" />
                                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                                {['indigo', 'purple', 'emerald', 'amber'].map(c => (
                                    <radialGradient key={c} id={`grad-${c}`} cx="50%" cy="35%" r="70%">
                                        <stop offset="0%" stopColor={
                                            c === 'indigo' ? '#2dd4bf' :
                                                c === 'purple' ? '#a7f3d0' :
                                                    c === 'emerald' ? '#34d399' : '#fbbf24'
                                        } stopOpacity="1" />
                                        <stop offset="100%" stopColor={
                                            c === 'indigo' ? '#0d9488' :
                                                c === 'purple' ? '#0f766e' :
                                                    c === 'emerald' ? '#059669' : '#d97706'
                                        } stopOpacity="1" />
                                    </radialGradient>
                                ))}
                            </defs>

                            {/* Edges */}
                            {edges.map(e => (
                                <line
                                    key={e.key}
                                    x1={e.x1} y1={e.y1}
                                    x2={e.x2} y2={e.y2}
                                    stroke="rgba(13,148,136,0.3)"
                                    strokeWidth={1.5}
                                    strokeDasharray="4 3"
                                />
                            ))}

                            {/* Nodes */}
                            {layoutNodes.map(({ node, x, y, id }) => {
                                const root = isRoot(node.isbn);
                                const unbal = isUnbalanced(node);
                                const hovered = hoveredNode === node.isbn;
                                const traversalHit = isTraversalHighlighted(node.isbn);
                                const traversalCurrent = isCurrentTraversal(node.isbn);

                                const gradId = root ? 'grad-indigo'
                                    : traversalCurrent ? 'grad-amber'
                                        : traversalHit ? 'grad-emerald'
                                            : unbal ? 'grad-amber'
                                                : 'grad-purple';

                                const strokeColor = root ? '#0d9488'
                                    : traversalCurrent ? '#fbbf24'
                                        : unbal ? '#d97706'
                                            : hovered ? '#2dd4bf'
                                                : 'rgba(255,255,255,0.15)';

                                return (
                                    <g
                                        key={id}
                                        className="avl-node"
                                        style={{ cursor: 'pointer' }}
                                        onMouseEnter={() => setHoveredNode(node.isbn)}
                                        onMouseLeave={() => setHoveredNode(null)}
                                        onClick={() => setSelectedNode(node)}
                                    >
                                        {/* Glow ring for root / current traversal */}
                                        {(root || traversalCurrent) && (
                                            <circle
                                                cx={x} cy={y}
                                                r={NODE_RADIUS + 8}
                                                fill="none"
                                                stroke={root ? '#0d9488' : '#fbbf24'}
                                                strokeWidth={1}
                                                strokeOpacity={0.3}
                                            />
                                        )}

                                        {/* Node circle */}
                                        <circle
                                            cx={x} cy={y}
                                            r={NODE_RADIUS}
                                            fill={`url(#${gradId})`}
                                            stroke={strokeColor}
                                            strokeWidth={hovered || root ? 2.5 : 1.5}
                                            style={{
                                                filter: (root || traversalCurrent) ? (root ? 'url(#glow-indigo)' : 'url(#glow-amber)') : undefined,
                                                transition: 'all 0.3s ease',
                                            }}
                                        />

                                        {/* ISBN short */}
                                        <text
                                            x={x} y={y - 3}
                                            textAnchor="middle"
                                            fontSize={8}
                                            fontFamily="monospace"
                                            fill="rgba(255,255,255,0.7)"
                                        >
                                            {node.isbn.slice(-6)}
                                        </text>

                                        {/* Balance factor */}
                                        <text
                                            x={x} y={y + 9}
                                            textAnchor="middle"
                                            fontSize={9}
                                            fontWeight="700"
                                            fill={Math.abs(node.balance_factor) > 1 ? '#fbbf24' : 'rgba(255,255,255,0.9)'}
                                        >
                                            bf={node.balance_factor}
                                        </text>

                                        {/* Height badge */}
                                        <text
                                            x={x + NODE_RADIUS - 4}
                                            y={y - NODE_RADIUS + 10}
                                            textAnchor="middle"
                                            fontSize={7}
                                            fill="rgba(255,255,255,0.5)"
                                        >
                                            h{node.height}
                                        </text>

                                        {/* Root label */}
                                        {root && (
                                            <text x={x} y={y - NODE_RADIUS - 8} textAnchor="middle" fontSize={8} fontWeight="700" fill="#818cf8">
                                                ROOT
                                            </text>
                                        )}

                                        {/* Hover tooltip */}
                                        {hovered && (
                                            <g>
                                                <rect
                                                    x={x + NODE_RADIUS + 6}
                                                    y={y - 32}
                                                    width={160}
                                                    height={62}
                                                    rx={8}
                                                    fill="rgba(22,22,50,0.96)"
                                                    stroke="rgba(99,102,241,0.4)"
                                                    strokeWidth={1}
                                                />
                                                <text x={x + NODE_RADIUS + 14} y={y - 16} fontSize={9} fontWeight="700" fill="#818cf8">
                                                    {node.title.length > 22 ? node.title.slice(0, 20) + '…' : node.title}
                                                </text>
                                                <text x={x + NODE_RADIUS + 14} y={y - 2} fontSize={8} fill="rgba(160,160,200,0.8)">
                                                    {node.author}
                                                </text>
                                                <text x={x + NODE_RADIUS + 14} y={y + 12} fontSize={8} fill="rgba(160,160,200,0.6)">
                                                    ISBN: {node.isbn}
                                                </text>
                                                <text x={x + NODE_RADIUS + 14} y={y + 24} fontSize={8} fill="rgba(160,160,200,0.6)">
                                                    h={node.height}  bf={node.balance_factor}
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                )}

                {/* Legend */}
                {!loading && treeData?.root && (
                    <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {[
                            { color: '#6366f1', label: 'Root node' },
                            { color: '#c084fc', label: 'Balanced node' },
                            { color: '#fbbf24', label: 'Current traversal' },
                            { color: '#34d399', label: 'Visited node' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                                <span>{l.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Traversal sequence */}
            <AnimatePresence>
                {traversalResult.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="glass-card p-4"
                    >
                        <p className="text-xs font-semibold mb-3 capitalize" style={{ color: 'rgb(var(--text-secondary))' }}>
                            {traversalType} Traversal Sequence ({traversalResult.length} nodes)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {traversalResult.map((isbn, i) => {
                                const isHit = i <= animatedIndex && animatedIndex >= 0;
                                const isCurr = traversalResult[animatedIndex] === isbn;
                                return (
                                    <div key={isbn} className="flex items-center gap-1">
                                        <motion.span
                                            animate={{
                                                scale: isCurr ? 1.15 : 1,
                                                background: isCurr ? 'rgba(245,158,11,0.4)' : isHit ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                                            }}
                                            className="px-2 py-1 rounded-lg text-xs font-mono"
                                            style={{ border: '1px solid rgba(255,255,255,0.08)', color: isHit ? '#34d399' : 'rgb(var(--text-muted))' }}
                                        >
                                            {isbn.slice(-6)}
                                        </motion.span>
                                        {i < traversalResult.length - 1 && (
                                            <ChevronRight size={10} style={{ color: 'rgb(var(--text-muted))' }} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selected node info */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="glass-card p-5"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                                    <Info size={18} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold" style={{ color: 'rgb(var(--text-primary))' }}>Selected Node Details</h3>
                                    <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>Click on any node to inspect</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedNode(null)} className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>✕</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            {[
                                { label: 'ISBN', value: selectedNode.isbn },
                                { label: 'Title', value: selectedNode.title },
                                { label: 'Author', value: selectedNode.author },
                                { label: 'Height', value: selectedNode.height },
                                { label: 'Balance Factor', value: selectedNode.balance_factor },
                                { label: 'Left Child', value: selectedNode.has_left ? 'Yes' : 'None' },
                                { label: 'Right Child', value: selectedNode.has_right ? 'Yes' : 'None' },
                                { label: 'Is Root', value: isRoot(selectedNode.isbn) ? 'Yes' : 'No' },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-xs" style={{ color: 'rgb(var(--text-muted))' }}>{label}</p>
                                    <p className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--text-primary))' }}>{String(value)}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rotation reference */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                className="grid md:grid-cols-4 gap-4">
                {Object.entries(ROTATION_INFO).map(([type, info]) => (
                    <div key={type} className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="badge font-mono text-xs px-2 py-0.5 rounded-lg"
                                style={{ background: `${info.color}20`, color: info.color, border: `1px solid ${info.color}30` }}>
                                {type}
                            </span>
                        </div>
                        <p className="text-xs font-semibold mb-1" style={{ color: 'rgb(var(--text-primary))' }}>{info.title}</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgb(var(--text-muted))' }}>{info.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
