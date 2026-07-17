import type { Book, SearchResult, Stats, AVLTreeData, TraversalResult, AddBookResponse } from '../types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(BASE + url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Network error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export const api = {
    // Books
    getBooks: () => request<Book[]>('/books'),
    getBook: (isbn: string) => request<Book>(`/books/${encodeURIComponent(isbn)}`),
    addBook: (book: Omit<Book, ''>) => request<AddBookResponse>('/books', {
        method: 'POST',
        body: JSON.stringify(book),
    }),
    updateBook: (isbn: string, book: Partial<Book>) => request<{ success: boolean; message: string; book: Book }>(`/books/${encodeURIComponent(isbn)}`, {
        method: 'PUT',
        body: JSON.stringify(book),
    }),
    deleteBook: (isbn: string) => request<{ success: boolean; message: string; rotation: { type: string; pivot: string; description: string } }>(`/books/${encodeURIComponent(isbn)}`, {
        method: 'DELETE',
    }),

    // Search
    search: (params: {
        q?: string;
        type?: string;
        category?: string;
        year_from?: number;
        year_to?: number;
        available?: number;
    }) => {
        const query = new URLSearchParams();
        if (params.q) query.set('q', params.q);
        if (params.type) query.set('type', params.type);
        if (params.category) query.set('category', params.category);
        if (params.year_from) query.set('year_from', String(params.year_from));
        if (params.year_to) query.set('year_to', String(params.year_to));
        if (params.available !== undefined && params.available !== -1) {
            query.set('available', String(params.available));
        }
        return request<SearchResult>(`/search?${query}`);
    },

    // Stats
    getStats: () => request<Stats>('/stats'),

    // Categories
    getCategories: () => request<string[]>('/categories'),

    // AVL Tree
    getAVLTree: () => request<AVLTreeData>('/avl/tree'),
    getTraversal: (type: 'inorder' | 'preorder' | 'postorder') =>
        request<TraversalResult>(`/avl/traversal/${type}`),

    // Health
    health: () => request<{ status: string }>('/health'),

    // BST vs AVL Comparison
    getCompare: () => request<{
        total_books: number;
        avl_height: number;
        bst_sorted_height: number;
        bst_random_height: number;
        ideal_height: number;
        avl_complexity: string;
        bst_worst_complexity: string;
        explanation: string;
        insert_orders: { sorted: string[]; interleaved: string[] };
    }>('/compare'),
};
