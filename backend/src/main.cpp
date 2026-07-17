#include "simple_server.h"
#include "library.h"
#include "json_helper.h"
#include "bst.h"
#include <iostream>
#include <sstream>
#include <string>
#include <algorithm>
#include <random>
#include <sys/stat.h>
#ifdef _WIN32
#include <direct.h>
#define MAKE_DIR(p) _mkdir(p)
#else
#include <sys/types.h>
#define MAKE_DIR(p) mkdir(p, 0755)
#endif

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------
std::string getQueryParam(const httplib::Request& req, const std::string& name, const std::string& def = "") {
    auto it = req.params.find(name);
    if (it != req.params.end()) return it->second;
    return def;
}

int getQueryInt(const httplib::Request& req, const std::string& name, int def = 0) {
    auto v = getQueryParam(req, name, "");
    if (v.empty()) return def;
    try { return std::stoi(v); } catch (...) { return def; }
}

void setCors(httplib::Response& res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

void jsonOk(httplib::Response& res, const std::string& body) {
    setCors(res);
    res.set_content(body, "application/json");
}

void jsonError(httplib::Response& res, int code, const std::string& msg) {
    setCors(res);
    res.status = code;
    res.set_content("{\"error\":\"" + json::escape(msg) + "\"}", "application/json");
}

// Parse a JSON body for a Book
Book parseBookBody(const std::string& body) {
    Book b;
    b.isbn             = tiny_json::getString(body, "isbn");
    b.title            = tiny_json::getString(body, "title");
    b.author           = tiny_json::getString(body, "author");
    b.category         = tiny_json::getString(body, "category");
    b.publication_year = tiny_json::getInt(body, "publication_year");
    b.publisher        = tiny_json::getString(body, "publisher");
    b.total_copies     = tiny_json::getInt(body, "total_copies");
    if (b.total_copies <= 0) b.total_copies = 1;
    b.available_copies = tiny_json::getInt(body, "available_copies");
    if (b.available_copies < 0) b.available_copies = 0;
    b.description      = tiny_json::getString(body, "description");
    return b;
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------
int main() {
    // Ensure data directory exists
    MAKE_DIR("data");

    Library lib("data/books.json");

    // Build a plain BST with the same books inserted in sorted (ISBN) order
    // to demonstrate worst-case degeneration
    BST bst_sorted;
    BST bst_random;
    {
        auto books = lib.tree.inorder(); // inorder = already sorted by ISBN
        for (auto& b : books) bst_sorted.insert(b);

        // Insert in a shuffled order for bst_random
        auto shuffled = books;
        std::mt19937 g(42);
        std::shuffle(shuffled.begin(), shuffled.end(), g);
        for (auto& b : shuffled) bst_random.insert(b);
    }

    httplib::Server svr;

    std::cout << "=== Library Catalogue & AVL Search System ===" << std::endl;
    std::cout << "Loaded " << lib.tree.size() << " books." << std::endl;
    std::cout << "AVL Tree Height: " << lib.tree.getHeight() << std::endl;
    std::cout << "BST (sorted insert) Height: " << bst_sorted.getHeight() << std::endl;
    std::cout << "BST (random insert) Height: " << bst_random.getHeight() << std::endl;
    std::cout << "Starting HTTP server on http://localhost:8080 ..." << std::endl;

    // -- CORS preflight --
    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        setCors(res);
        res.set_content("", "text/plain");
    });

    // ---- GET /api/books ----
    svr.Get("/api/books", [&](const httplib::Request&, httplib::Response& res) {
        auto books = lib.tree.getAllBooks();
        jsonOk(res, json::booksToJson(books));
    });

    // ---- GET /api/books/:isbn ----
    svr.Get(R"(/api/books/([^/]+))", [&](const httplib::Request& req, httplib::Response& res) {
        std::string isbn = req.matches[1];
        auto* b = lib.getBook(isbn);
        if (!b) { jsonError(res, 404, "Book not found"); return; }
        jsonOk(res, json::bookToJson(*b));
    });

    // ---- POST /api/books ----
    svr.Post("/api/books", [&](const httplib::Request& req, httplib::Response& res) {
        Book b = parseBookBody(req.body);
        if (b.isbn.empty() || b.title.empty()) {
            jsonError(res, 400, "isbn and title are required"); return;
        }
        auto result = lib.addBook(b);
        if (!result.ok) { jsonError(res, 409, result.message); return; }
        std::ostringstream ss;
        ss << "{"
           << "\"success\":true,"
           << "\"message\":\"" << json::escape(result.message) << "\","
           << "\"rotation\":{"
           << "\"type\":\"" << json::rotationToString(result.rotation.type) << "\","
           << "\"pivot\":\"" << json::escape(result.rotation.pivot_isbn) << "\","
           << "\"description\":\"" << json::escape(result.rotation.description) << "\""
           << "},"
           << "\"book\":" << json::bookToJson(b)
           << "}";
        res.status = 201;
        jsonOk(res, ss.str());
    });

    // ---- PUT /api/books/:isbn ----
    svr.Put(R"(/api/books/([^/]+))", [&](const httplib::Request& req, httplib::Response& res) {
        std::string isbn = req.matches[1];
        Book b = parseBookBody(req.body);
        b.isbn = isbn;
        auto result = lib.updateBook(isbn, b);
        if (!result.ok) { jsonError(res, 404, result.message); return; }
        std::ostringstream ss;
        ss << "{"
           << "\"success\":true,"
           << "\"message\":\"" << json::escape(result.message) << "\","
           << "\"book\":" << json::bookToJson(b)
           << "}";
        jsonOk(res, ss.str());
    });

    // ---- DELETE /api/books/:isbn ----
    svr.Delete(R"(/api/books/([^/]+))", [&](const httplib::Request& req, httplib::Response& res) {
        std::string isbn = req.matches[1];
        auto result = lib.deleteBook(isbn);
        if (!result.ok) { jsonError(res, 404, result.message); return; }
        std::ostringstream ss;
        ss << "{"
           << "\"success\":true,"
           << "\"message\":\"" << json::escape(result.message) << "\","
           << "\"rotation\":{"
           << "\"type\":\"" << json::rotationToString(result.rotation.type) << "\","
           << "\"pivot\":\"" << json::escape(result.rotation.pivot_isbn) << "\","
           << "\"description\":\"" << json::escape(result.rotation.description) << "\""
           << "}"
           << "}";
        jsonOk(res, ss.str());
    });

    // ---- GET /api/search ----
    svr.Get("/api/search", [&](const httplib::Request& req, httplib::Response& res) {
        auto q        = getQueryParam(req, "q");
        auto type     = getQueryParam(req, "type", "title");
        auto category = getQueryParam(req, "category");
        auto yearFrom = getQueryInt(req, "year_from", 0);
        auto yearTo   = getQueryInt(req, "year_to", 0);
        auto avail    = getQueryInt(req, "available", -1);

        auto books = lib.search(q, type, category, yearFrom, yearTo, avail);

        // For ISBN exact match, note it as O(log n)
        bool is_isbn_exact = (type == "isbn" && !q.empty());
        std::ostringstream ss;
        ss << "{"
           << "\"count\":" << books.size() << ","
           << "\"complexity\":\"" << (is_isbn_exact ? "O(log n)" : "O(n)") << "\","
           << "\"search_type\":\"" << json::escape(type) << "\","
           << "\"results\":" << json::booksToJson(books)
           << "}";
        jsonOk(res, ss.str());
    });

    // ---- GET /api/stats ----
    svr.Get("/api/stats", [&](const httplib::Request&, httplib::Response& res) {
        auto s = lib.getStats();
        std::ostringstream ss;
        ss << "{"
           << "\"total_books\":" << s.total_books << ","
           << "\"total_copies\":" << s.total_copies << ","
           << "\"available_copies\":" << s.available_copies << ","
           << "\"total_borrowed\":" << s.total_borrowed << ","
           << "\"categories\":" << s.categories << ","
           << "\"avl_height\":" << s.avl_height << ","
           << "\"books_per_category\":{";
        bool first = true;
        for (auto it = s.books_per_category.begin(); it != s.books_per_category.end(); ++it) {
            if (!first) ss << ",";
            ss << "\"" << json::escape(it->first) << "\":" << it->second;
            first = false;
        }
        ss << "},\"books_per_year\":{";
        first = true;
        for (auto it = s.books_per_year.begin(); it != s.books_per_year.end(); ++it) {
            if (!first) ss << ",";
            ss << "\"" << it->first << "\":" << it->second;
            first = false;
        }
        ss << "},\"rotation_history\":[";
        auto history = lib.getRotationHistory();
        for (size_t i = 0; i < history.size(); ++i) {
            if (i > 0) ss << ",";
            const auto& r = history[i];
            ss << "{"
               << "\"type\":\"" << json::rotationToString(r.type) << "\","
               << "\"pivot\":\"" << json::escape(r.pivot_isbn) << "\","
               << "\"description\":\"" << json::escape(r.description) << "\""
               << "}";
        }
        ss << "]}";
        jsonOk(res, ss.str());
    });

    // ---- GET /api/categories ----
    svr.Get("/api/categories", [&](const httplib::Request&, httplib::Response& res) {
        auto cats = lib.getCategories();
        std::ostringstream ss;
        ss << "[";
        for (size_t i = 0; i < cats.size(); ++i) {
            if (i > 0) ss << ",";
            ss << "\"" << json::escape(cats[i]) << "\"";
        }
        ss << "]";
        jsonOk(res, ss.str());
    });

    // ---- GET /api/avl/tree ----
    svr.Get("/api/avl/tree", [&](const httplib::Request&, httplib::Response& res) {
        auto dto = lib.tree.getTreeStructure();
        if (dto.isbn.empty()) {
            jsonOk(res, "{\"root\":null,\"height\":0,\"size\":0}");
            return;
        }
        std::ostringstream ss;
        ss << "{"
           << "\"root\":" << json::treeNodeToJson(dto) << ","
           << "\"height\":" << lib.tree.getHeight() << ","
           << "\"size\":" << lib.tree.size()
           << "}";
        jsonOk(res, ss.str());
    });

    // ---- GET /api/avl/traversal/:type ----
    svr.Get(R"(/api/avl/traversal/([^/]+))", [&](const httplib::Request& req, httplib::Response& res) {
        std::string ttype = req.matches[1];
        std::vector<Book> books;
        std::string label;
        if (ttype == "preorder") { books = lib.tree.preorder(); label = "Preorder"; }
        else if (ttype == "postorder") { books = lib.tree.postorder(); label = "Postorder"; }
        else { books = lib.tree.inorder(); label = "Inorder"; }

        std::ostringstream ss;
        ss << "{"
           << "\"type\":\"" << label << "\","
           << "\"books\":" << json::booksToJson(books)
           << "}";
        jsonOk(res, ss.str());
    });

    // ---- GET /api/compare ---- BST vs AVL comparison
    svr.Get("/api/compare", [&](const httplib::Request&, httplib::Response& res) {
        auto all_books = lib.tree.inorder(); // sorted by ISBN
        int n = (int)all_books.size();

        // Rebuild BST instances fresh each request so they reflect current books
        BST bst_s, bst_r;
        auto shuffled = all_books;
        std::mt19937 g(42);
        std::shuffle(shuffled.begin(), shuffled.end(), g);
        for (auto& b : all_books) bst_s.insert(b);
        for (auto& b : shuffled)  bst_r.insert(b);

        int avl_h   = lib.tree.getHeight();
        int bst_s_h = bst_s.getHeight();
        int bst_r_h = bst_r.getHeight();

        // Theoretical log2(n)+1
        int ideal = 0;
        for (int tmp = n; tmp > 0; tmp >>= 1) ++ideal;

        std::ostringstream ss;
        ss << "{";
        ss << "\"total_books\":" << n << ",";
        ss << "\"avl_height\":" << avl_h << ",";
        ss << "\"bst_sorted_height\":" << bst_s_h << ",";
        ss << "\"bst_random_height\":" << bst_r_h << ",";
        ss << "\"ideal_height\":" << ideal << ",";
        ss << "\"avl_complexity\":\"O(log n)\",";
        ss << "\"bst_worst_complexity\":\"O(n)\",";
        ss << "\"explanation\":\"When books are inserted in sorted ISBN order, a plain BST degenerates into a linked list. The AVL Tree self-balances after every insertion, guaranteeing O(log n) height always.\",";
        ss << "\"insert_orders\":{";
        ss << "\"sorted\":[";
        for (int i = 0; i < n; ++i) {
            if (i) ss << ",";
            ss << "\"" << json::escape(all_books[i].isbn) << "\"";
        }
        ss << "],\"interleaved\":[";
        for (int i = 0; i < (int)shuffled.size(); ++i) {
            if (i) ss << ",";
            ss << "\"" << json::escape(shuffled[i].isbn) << "\"";
        }
        ss << "]}";
        ss << "}";
        jsonOk(res, ss.str());
    });

    // ---- Health ----
    svr.Get("/api/health", [](const httplib::Request&, httplib::Response& res) {
        setCors(res);
        res.set_content("{\"status\":\"ok\",\"service\":\"Library Catalogue API\"}", "application/json");
    });

    svr.listen("0.0.0.0", 8080);
    return 0;
}
