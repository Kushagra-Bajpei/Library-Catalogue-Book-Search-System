# Library Catalogue & Book Search System — Backend

## C++ HTTP Server with AVL Tree

### Prerequisites
- CMake 3.16+
- A C++17-capable compiler (MSVC, GCC 9+, Clang 9+)
- No other dependencies (uses header-only `cpp-httplib`)

### Build (Windows — MinGW/MSYS2)
```bash
cd backend
cmake -B build -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### Build (Windows — Visual Studio)
```bash
cd backend
cmake -B build -G "Visual Studio 17 2022"
cmake --build build --config Release
```

### Build (Linux/Mac)
```bash
cd backend
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
```

### Run
```bash
cd backend/build
./library_server
# or on Windows: library_server.exe
```
Server starts at **http://localhost:8080**

### Data
- Books are auto-seeded from 20 classic CS/programming titles on first run
- Persistent storage in `data/books.json` relative to the working directory

### API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/books | All books (inorder) |
| GET | /api/books/:isbn | Get book by ISBN — AVL O(log n) |
| POST | /api/books | Add book |
| PUT | /api/books/:isbn | Update book |
| DELETE | /api/books/:isbn | Delete book |
| GET | /api/search?q=&type=&category=&year_from=&year_to=&available= | Search |
| GET | /api/stats | Library statistics |
| GET | /api/categories | All categories |
| GET | /api/avl/tree | Full AVL tree structure (JSON) |
| GET | /api/avl/traversal/inorder | Inorder traversal |
| GET | /api/avl/traversal/preorder | Preorder traversal |
| GET | /api/avl/traversal/postorder | Postorder traversal |
