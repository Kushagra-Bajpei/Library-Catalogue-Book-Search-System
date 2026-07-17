#pragma once
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>
#include "book.h"
#include "avl_tree.h"

// Minimal JSON helpers – no external dependencies
namespace json {

inline std::string escape(const std::string& s) {
    std::string out;
    out.reserve(s.size() + 4);
    for (char c : s) {
        switch (c) {
            case '"':  out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n";  break;
            case '\r': out += "\\r";  break;
            case '\t': out += "\\t";  break;
            default:   out += c;
        }
    }
    return out;
}

inline std::string bookToJson(const Book& b) {
    std::ostringstream ss;
    ss << "{"
       << "\"isbn\":\"" << escape(b.isbn) << "\","
       << "\"title\":\"" << escape(b.title) << "\","
       << "\"author\":\"" << escape(b.author) << "\","
       << "\"category\":\"" << escape(b.category) << "\","
       << "\"publication_year\":" << b.publication_year << ","
       << "\"publisher\":\"" << escape(b.publisher) << "\","
       << "\"total_copies\":" << b.total_copies << ","
       << "\"available_copies\":" << b.available_copies << ","
       << "\"description\":\"" << escape(b.description) << "\""
       << "}";
    return ss.str();
}

inline std::string booksToJson(const std::vector<Book>& books) {
    std::ostringstream ss;
    ss << "[";
    for (size_t i = 0; i < books.size(); ++i) {
        if (i > 0) ss << ",";
        ss << bookToJson(books[i]);
    }
    ss << "]";
    return ss.str();
}

inline std::string rotationToString(RotationType t) {
    switch (t) {
        case RotationType::LL: return "LL";
        case RotationType::RR: return "RR";
        case RotationType::LR: return "LR";
        case RotationType::RL: return "RL";
        default: return "NONE";
    }
}

inline std::string treeNodeToJson(const TreeNodeDTO& node, bool is_null = false) {
    if (is_null || node.isbn.empty()) return "null";
    std::ostringstream ss;
    ss << "{"
       << "\"isbn\":\"" << escape(node.isbn) << "\","
       << "\"title\":\"" << escape(node.title) << "\","
       << "\"author\":\"" << escape(node.author) << "\","
       << "\"height\":" << node.height << ","
       << "\"balance_factor\":" << node.balance_factor << ","
       << "\"has_left\":" << (node.has_left ? "true" : "false") << ","
       << "\"has_right\":" << (node.has_right ? "true" : "false") << ","
       << "\"left\":";

    if (node.children.size() > 0)
        ss << treeNodeToJson(node.children[0], node.children[0].isbn.empty());
    else
        ss << "null";

    ss << ",\"right\":";
    if (node.children.size() > 1)
        ss << treeNodeToJson(node.children[1], node.children[1].isbn.empty());
    else
        ss << "null";

    ss << "}";
    return ss.str();
}

} // namespace json
