export interface Book {
    isbn: string;
    title: string;
    author: string;
    category: string;
    publication_year: number;
    publisher: string;
    total_copies: number;
    available_copies: number;
    description: string;
}

export interface SearchResult {
    count: number;
    complexity: string;
    search_type: string;
    results: Book[];
}

export interface RotationEvent {
    type: 'LL' | 'RR' | 'LR' | 'RL' | 'NONE';
    pivot: string;
    description: string;
}

export interface AddBookResponse {
    success: boolean;
    message: string;
    rotation: RotationEvent;
    book: Book;
}

export interface Stats {
    total_books: number;
    total_copies: number;
    available_copies: number;
    total_borrowed: number;
    categories: number;
    avl_height: number;
    books_per_category: Record<string, number>;
    books_per_year: Record<string, number>;
    rotation_history: RotationEvent[];
}

export interface AVLTreeNode {
    isbn: string;
    title: string;
    author: string;
    height: number;
    balance_factor: number;
    has_left: boolean;
    has_right: boolean;
    left: AVLTreeNode | null;
    right: AVLTreeNode | null;
}

export interface AVLTreeData {
    root: AVLTreeNode | null;
    height: number;
    size: number;
}

export interface TraversalResult {
    type: string;
    books: Book[];
}

export type ViewMode = 'grid' | 'table';
export type SearchType = 'title' | 'author' | 'isbn' | 'category';
export type TraversalType = 'inorder' | 'preorder' | 'postorder';
export type Theme = 'dark' | 'light';
