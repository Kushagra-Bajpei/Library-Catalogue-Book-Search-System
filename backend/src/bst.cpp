#include "bst.h"
#include <algorithm>

BST::BST() : root_(nullptr), size_(0) {}

BST::~BST() {
    destroy(root_);
}

void BST::destroy(BSTNode* node) {
    if (!node) return;
    destroy(node->left);
    destroy(node->right);
    delete node;
}

BSTNode* BST::insert(BSTNode* node, const Book& book) {
    if (!node) {
        ++size_;
        return new BSTNode(book);
    }
    if (book.isbn < node->book.isbn)
        node->left = insert(node->left, book);
    else if (book.isbn > node->book.isbn)
        node->right = insert(node->right, book);
    else
        node->book = book; // update
    return node;
}

void BST::insert(const Book& book) {
    root_ = insert(root_, book);
}

BSTNode* BST::search(BSTNode* node, const std::string& isbn) const {
    if (!node) return nullptr;
    if (isbn == node->book.isbn) return node;
    if (isbn < node->book.isbn) return search(node->left, isbn);
    return search(node->right, isbn);
}

BSTNode* BST::search(const std::string& isbn) const {
    return search(root_, isbn);
}

int BST::height(BSTNode* node) const {
    if (!node) return 0;
    return 1 + std::max(height(node->left), height(node->right));
}

int BST::getHeight() const {
    return height(root_);
}

int BST::size() const {
    return size_;
}

void BST::inorder(BSTNode* node, std::vector<Book>& result) const {
    if (!node) return;
    inorder(node->left, result);
    result.push_back(node->book);
    inorder(node->right, result);
}

std::vector<Book> BST::inorder() const {
    std::vector<Book> result;
    inorder(root_, result);
    return result;
}

BSTNodeDTO BST::buildDTO(BSTNode* node, int depth) const {
    BSTNodeDTO dto;
    dto.isbn = node->book.isbn;
    dto.title = node->book.title;
    dto.depth = depth;
    dto.has_left = node->left != nullptr;
    dto.has_right = node->right != nullptr;
    if (node->left)  dto.children.push_back(buildDTO(node->left,  depth + 1));
    else { BSTNodeDTO n; n.isbn = ""; dto.children.push_back(n); }
    if (node->right) dto.children.push_back(buildDTO(node->right, depth + 1));
    else { BSTNodeDTO n; n.isbn = ""; dto.children.push_back(n); }
    return dto;
}

BSTNodeDTO BST::getTreeStructure() const {
    if (!root_) return {};
    return buildDTO(root_, 0);
}
