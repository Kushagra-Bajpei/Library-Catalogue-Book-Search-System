#pragma once
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <fstream>
#include <sstream>
#include <cctype>
#include "avl_tree.h"
#include "book.h"

// -----------------------------------------------------------------------
// Tiny JSON parser – enough to read our own books.json format
// -----------------------------------------------------------------------
namespace tiny_json {

inline std::string getString(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\":\"";
    auto pos = json.find(search);
    if (pos == std::string::npos) return "";
    pos += search.size();
    auto end = json.find("\"", pos);
    if (end == std::string::npos) return "";
    std::string val = json.substr(pos, end - pos);
    // unescape
    std::string result;
    for (size_t i = 0; i < val.size(); ++i) {
        if (val[i] == '\\' && i + 1 < val.size()) {
            switch (val[i+1]) {
                case 'n': result += '\n'; ++i; break;
                case 't': result += '\t'; ++i; break;
                case '"': result += '"'; ++i; break;
                case '\\': result += '\\'; ++i; break;
                default: result += val[i];
            }
        } else {
            result += val[i];
        }
    }
    return result;
}

inline int getInt(const std::string& json, const std::string& key) {
    std::string search = "\"" + key + "\":";
    auto pos = json.find(search);
    if (pos == std::string::npos) return 0;
    pos += search.size();
    // skip spaces
    while (pos < json.size() && json[pos] == ' ') ++pos;
    if (pos >= json.size() || json[pos] == '"') return 0;
    std::string numStr;
    bool neg = false;
    if (json[pos] == '-') { neg = true; ++pos; }
    while (pos < json.size() && std::isdigit(json[pos])) {
        numStr += json[pos++];
    }
    if (numStr.empty()) return 0;
    int val = std::stoi(numStr);
    return neg ? -val : val;
}

// Split JSON array into individual object strings
inline std::vector<std::string> splitArray(const std::string& json) {
    std::vector<std::string> objects;
    int depth = 0;
    size_t start = std::string::npos;
    bool inStr = false;
    char prev = 0;

    for (size_t i = 0; i < json.size(); ++i) {
        char c = json[i];
        if (c == '"' && prev != '\\') inStr = !inStr;
        if (inStr) { prev = c; continue; }

        if (c == '{') {
            if (depth == 0) start = i;
            ++depth;
        } else if (c == '}') {
            --depth;
            if (depth == 0 && start != std::string::npos) {
                objects.push_back(json.substr(start, i - start + 1));
                start = std::string::npos;
            }
        }
        prev = c;
    }
    return objects;
}

} // namespace tiny_json

// -----------------------------------------------------------------------
// Library Service
// -----------------------------------------------------------------------
class Library {
public:
    std::string data_file;
    AVLTree tree;
    std::vector<RotationEvent> rotation_history;

    explicit Library(const std::string& file = "data/books.json") : data_file(file) {
        load();
    }

    // ---- CRUD ----
    struct Result {
        bool ok;
        std::string message;
        RotationEvent rotation;
    };

    Result addBook(const Book& book) {
        if (tree.search(book.isbn)) {
            return { false, "ISBN already exists", { RotationType::NONE, "", "" } };
        }
        auto rot = tree.insert(book);
        if (rot.type != RotationType::NONE) {
            rotation_history.push_back(rot);
            if (rotation_history.size() > 50) rotation_history.erase(rotation_history.begin());
        }
        save();
        return { true, "Book added successfully", rot };
    }

    Result updateBook(const std::string& isbn, const Book& updated) {
        if (!tree.search(isbn)) {
            return { false, "Book not found", { RotationType::NONE, "", "" } };
        }
        tree.remove(isbn);
        Book b = updated;
        b.isbn = isbn;
        auto rot = tree.insert(b);
        save();
        return { true, "Book updated successfully", rot };
    }

    Result deleteBook(const std::string& isbn) {
        if (!tree.search(isbn)) {
            return { false, "Book not found", { RotationType::NONE, "", "" } };
        }
        auto rot = tree.remove(isbn);
        if (rot.type != RotationType::NONE) {
            rotation_history.push_back(rot);
            if (rotation_history.size() > 50) rotation_history.erase(rotation_history.begin());
        }
        save();
        return { true, "Book deleted successfully", rot };
    }

    Book* getBook(const std::string& isbn) {
        AVLNode* node = tree.search(isbn);
        return node ? &node->book : nullptr;
    }

    // ---- Search ----
    std::vector<Book> search(
        const std::string& query,
        const std::string& type,       // title, author, category, isbn
        const std::string& category,
        int year_from, int year_to,
        int available                   // -1 = all, 0 = unavailable, 1 = available
    ) const {
        auto toLower = [](std::string s) {
            std::transform(s.begin(), s.end(), s.begin(), ::tolower);
            return s;
        };
        std::string q = toLower(query);

        return tree.filter([&](const Book& b) -> bool {
            // Type-specific text match
            bool text_match = true;
            if (!q.empty()) {
                if (type == "isbn") {
                    text_match = (toLower(b.isbn).find(q) != std::string::npos);
                } else if (type == "author") {
                    text_match = (toLower(b.author).find(q) != std::string::npos);
                } else if (type == "category") {
                    text_match = (toLower(b.category).find(q) != std::string::npos);
                } else { // default: title
                    text_match = (toLower(b.title).find(q) != std::string::npos);
                }
            }

            // Category filter
            bool cat_match = category.empty() ||
                toLower(b.category) == toLower(category);

            // Year range
            bool year_match = true;
            if (year_from > 0) year_match = year_match && (b.publication_year >= year_from);
            if (year_to > 0)   year_match = year_match && (b.publication_year <= year_to);

            // Availability
            bool avail_match = true;
            if (available == 1) avail_match = (b.available_copies > 0);
            else if (available == 0) avail_match = (b.available_copies == 0);

            return text_match && cat_match && year_match && avail_match;
        });
    }

    // ---- Stats ----
    struct Stats {
        int total_books;
        int total_copies;
        int available_copies;
        int categories;
        int avl_height;
        std::map<std::string, int> books_per_category;
        std::map<int, int> books_per_year;
        int total_borrowed;
    };

    Stats getStats() const {
        auto books = tree.getAllBooks();
        Stats s{};
        s.total_books = (int)books.size();
        s.avl_height = tree.getHeight();
        std::map<std::string, bool> catSet;
        for (auto& b : books) {
            s.total_copies += b.total_copies;
            s.available_copies += b.available_copies;
            catSet[b.category] = true;
            s.books_per_category[b.category]++;
            if (b.publication_year > 0)
                s.books_per_year[b.publication_year]++;
        }
        s.categories = (int)catSet.size();
        s.total_borrowed = s.total_copies - s.available_copies;
        return s;
    }

    std::vector<std::string> getCategories() const {
        auto books = tree.getAllBooks();
        std::map<std::string, bool> seen;
        std::vector<std::string> cats;
        for (auto& b : books) {
            if (!seen[b.category]) {
                seen[b.category] = true;
                cats.push_back(b.category);
            }
        }
        std::sort(cats.begin(), cats.end());
        return cats;
    }

    std::vector<RotationEvent> getRotationHistory() const {
        return rotation_history;
    }

private:
    void save() const {
        auto books = tree.getAllBooks();
        std::ofstream f(data_file);
        if (!f.is_open()) return;
        f << "[\n";
        for (size_t i = 0; i < books.size(); ++i) {
            const auto& b = books[i];
            auto esc = [](const std::string& s) {
                std::string out;
                for (char c : s) {
                    if (c == '"') out += "\\\"";
                    else if (c == '\\') out += "\\\\";
                    else if (c == '\n') out += "\\n";
                    else out += c;
                }
                return out;
            };
            f << "  {";
            f << "\"isbn\":\"" << esc(b.isbn) << "\",";
            f << "\"title\":\"" << esc(b.title) << "\",";
            f << "\"author\":\"" << esc(b.author) << "\",";
            f << "\"category\":\"" << esc(b.category) << "\",";
            f << "\"publication_year\":" << b.publication_year << ",";
            f << "\"publisher\":\"" << esc(b.publisher) << "\",";
            f << "\"total_copies\":" << b.total_copies << ",";
            f << "\"available_copies\":" << b.available_copies << ",";
            f << "\"description\":\"" << esc(b.description) << "\"";
            f << "}";
            if (i + 1 < books.size()) f << ",";
            f << "\n";
        }
        f << "]\n";
    }

    void load() {
        std::ifstream f(data_file);
        if (!f.is_open()) {
            seedData();
            return;
        }
        std::string content((std::istreambuf_iterator<char>(f)),
                             std::istreambuf_iterator<char>());

        auto objs = tiny_json::splitArray(content);
        for (auto& obj : objs) {
            Book b;
            b.isbn             = tiny_json::getString(obj, "isbn");
            b.title            = tiny_json::getString(obj, "title");
            b.author           = tiny_json::getString(obj, "author");
            b.category         = tiny_json::getString(obj, "category");
            b.publication_year = tiny_json::getInt(obj, "publication_year");
            b.publisher        = tiny_json::getString(obj, "publisher");
            b.total_copies     = tiny_json::getInt(obj, "total_copies");
            b.available_copies = tiny_json::getInt(obj, "available_copies");
            b.description      = tiny_json::getString(obj, "description");
            if (!b.isbn.empty()) tree.insert(b);
        }
    }

    void seedData() {
        // 20 seed books to give AVL tree meaningful structure
        std::vector<Book> seeds = {
            {"9780132350884", "Clean Code", "Robert C. Martin", "Software Engineering", 2008, "Prentice Hall", 5, 3, "A handbook of agile software craftsmanship."},
            {"9780201633610", "Design Patterns", "Gang of Four", "Software Engineering", 1994, "Addison-Wesley", 4, 2, "Elements of reusable object-oriented software."},
            {"9780262033848", "Introduction to Algorithms", "CLRS", "Computer Science", 2009, "MIT Press", 6, 4, "Comprehensive introduction to algorithms and data structures."},
            {"9780134685991", "Effective Java", "Joshua Bloch", "Java", 2018, "Addison-Wesley", 3, 3, "Best practices for the Java platform."},
            {"9781491950357", "Python for Data Analysis", "Wes McKinney", "Data Science", 2017, "O'Reilly", 4, 2, "Data wrangling with pandas, NumPy, and IPython."},
            {"9780596516499", "JavaScript: The Good Parts", "Douglas Crockford", "JavaScript", 2008, "O'Reilly", 3, 1, "Unearthing the excellence in JavaScript."},
            {"9781491927007", "Learning React", "Alex Banks", "JavaScript", 2020, "O'Reilly", 4, 4, "Build functional web apps with React."},
            {"9781617294556", "Deep Learning with Python", "Francois Chollet", "Machine Learning", 2021, "Manning", 3, 2, "Deep learning using Keras and TensorFlow."},
            {"9780131101630", "The C Programming Language", "Kernighan & Ritchie", "C/C++", 1988, "Prentice Hall", 5, 5, "The definitive guide to the C programming language."},
            {"9780201703535", "The Pragmatic Programmer", "Hunt & Thomas", "Software Engineering", 1999, "Addison-Wesley", 4, 3, "Your journey to mastery."},
            {"9780596007126", "Head First Design Patterns", "Freeman & Robson", "Software Engineering", 2004, "O'Reilly", 3, 2, "A brain-friendly guide to design patterns."},
            {"9780321751041", "The Clean Coder", "Robert C. Martin", "Software Engineering", 2011, "Prentice Hall", 2, 1, "A code of conduct for professional programmers."},
            {"9781491903438", "Learning Python", "Mark Lutz", "Python", 2013, "O'Reilly", 5, 3, "Powerful object-oriented programming."},
            {"9780134494166", "Clean Architecture", "Robert C. Martin", "Software Engineering", 2017, "Prentice Hall", 4, 2, "A craftsman's guide to software structure and design."},
            {"9781492052203", "Designing Data-Intensive Applications", "Martin Kleppmann", "Databases", 2017, "O'Reilly", 3, 3, "The big ideas behind reliable, scalable, and maintainable systems."},
            {"9780134757599", "Refactoring", "Martin Fowler", "Software Engineering", 2018, "Addison-Wesley", 3, 1, "Improving the design of existing code."},
            {"9781491960202", "Programming Rust", "Jim Blandy", "Systems Programming", 2021, "O'Reilly", 2, 2, "Fast, safe systems development."},
            {"9780596154653", "JavaScript: The Definitive Guide", "David Flanagan", "JavaScript", 2020, "O'Reilly", 4, 2, "Master the world's most-used programming language."},
            {"9781492056300", "Kubernetes in Action", "Marko Luksa", "DevOps", 2018, "Manning", 3, 3, "Running applications in Kubernetes."},
            {"9780991344659", "You Don't Know JS", "Kyle Simpson", "JavaScript", 2015, "O'Reilly", 4, 4, "Deep dive into the JavaScript language."},
        };
        for (auto& b : seeds) tree.insert(b);
        save();
    }
};
