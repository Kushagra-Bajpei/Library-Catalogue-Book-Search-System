# Library Catalogue & Book Search System

A full-stack digital library powered by a **C++ backend** with a self-balancing **AVL Tree** for O(log n) book lookup, and a **premium React + TypeScript** frontend with Framer Motion animations.

---

## 🚀 How to Run

> You need two terminals — one for the backend, one for the frontend.

---

### Terminal 1 — Backend (C++ Server)

#### First time only: Build the backend

```powershell
cd "C:\Users\Kushagra Bajpei\Desktop\Library Catalogue & Book Search System\backend"

cmake -B build -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release

cmake --build build
```

#### Every time: Start the server

```powershell
cd "C:\Users\Kushagra Bajpei\Desktop\Library Catalogue & Book Search System\backend"

.\build\library_server.exe
```

✅ You should see:
```
=== Library Catalogue & AVL Search System ===
Loaded 20 books.
AVL Tree Height: 5
Server listening on http://0.0.0.0:8080
```

> The backend runs on **http://localhost:8080**

---

### Terminal 2 — Frontend (React Dev Server)

```powershell
cd "C:\Users\Kushagra Bajpei\Desktop\Library Catalogue & Book Search System\frontend"

npm run dev
```

✅ You should see:
```
VITE v8.1.5  ready in ~1000 ms
➜  Local:   http://localhost:5173/
```

> Open **http://localhost:5173** in your browser.
> If port 5173 is busy, Vite will use 5174 — check the terminal output.

---

## 📋 Prerequisites

| Tool | Required | Check |
|------|----------|-------|
| **CMake** | ≥ 3.16 | `cmake --version` |
| **g++ (MinGW)** | ≥ 6.3 | `g++ --version` |
| **Node.js** | ≥ 16 | `node --version` |
| **npm** | ≥ 8 | `npm --version` |

---

## 🌐 App Pages

| URL | Page |
|-----|------|
| http://localhost:5173/ | Landing page |
| http://localhost:5173/dashboard | Dashboard (stats & charts) |
| http://localhost:5173/books | Book catalogue (grid/table) |
| http://localhost:5173/add | Add a new book |
| http://localhost:5173/search | Advanced search |
| http://localhost:5173/avl | AVL Tree visualizer |

---

## 🔌 Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| GET | /api/books | All books (inorder traversal) |
| GET | /api/books/:isbn | Get by ISBN — AVL O(log n) |
| POST | /api/books | Add book |
| PUT | /api/books/:isbn | Update book |
| DELETE | /api/books/:isbn | Delete book |
| GET | /api/search?q=&type=&category=&year_from=&year_to=&available= | Search |
| GET | /api/stats | Library statistics + rotation history |
| GET | /api/categories | All categories |
| GET | /api/avl/tree | Full AVL tree JSON for visualizer |
| GET | /api/avl/traversal/inorder | Inorder traversal |
| GET | /api/avl/traversal/preorder | Preorder traversal |
| GET | /api/avl/traversal/postorder | Postorder traversal |

---

## 🏗️ Project Structure

```
Library Catalogue & Book Search System/
├── backend/
│   ├── src/
│   │   ├── main.cpp          # HTTP server + API routes
│   │   ├── simple_server.h   # Self-contained Winsock HTTP server
│   │   ├── avl_tree.h/.cpp   # AVL Tree (LL/RR/LR/RL rotations)
│   │   ├── library.h         # CRUD, search, stats service
│   │   ├── book.h            # Book model
│   │   └── json_helper.h     # JSON serialization
│   ├── data/
│   │   └── books.json        # Persistent storage (auto-created)
│   └── CMakeLists.txt
└── frontend/
    ├── src/
    │   ├── pages/            # Landing, Dashboard, Books, Search, AddEdit, AVLVisualizer
    │   ├── components/       # Sidebar, StatCard, BookCard, BookTable, ToastContainer
    │   ├── api/              # Typed axios client
    │   ├── context/          # Theme + toast global state
    │   └── types/            # TypeScript interfaces
    ├── package.json
    └── vite.config.ts        # Proxy: /api → localhost:8080
```

---

## ⚡ Features

- **AVL Tree Engine** — Self-balancing BST, LL/RR/LR/RL rotation tracking
- **O(log n) ISBN Lookup** — Direct AVL node search by ISBN key
- **20 books pre-seeded** on first run (classic CS titles)
- **Dashboard** — Stat cards, bar/pie charts (Recharts)
- **Book Catalogue** — Grid & table view with sort/filter
- **Advanced Search** — Debounced real-time, category/year/availability filters
- **Add / Edit Form** — Inline validation, AVL rotation notification on insert
- **AVL Visualizer** — Interactive SVG tree, zoom/pan, traversal animation
- **Dark / Light mode** — Toggleable, persisted in localStorage
- **Responsive** — Works on mobile, tablet, desktop
