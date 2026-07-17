#pragma once
#include <string>
#include <vector>
#include <functional>
#include "book.h"

enum class RotationType {
    NONE, LL, RR, LR, RL
};

struct RotationEvent {
    RotationType type;
    std::string pivot_isbn;
    std::string description;
};

struct AVLNode {
    Book book;
    int height;
    int balance_factor;
    AVLNode* left;
    AVLNode* right;

    explicit AVLNode(const Book& b)
        : book(b), height(1), balance_factor(0), left(nullptr), right(nullptr) {}
};

struct TreeNodeDTO {
    std::string isbn;
    std::string title;
    std::string author;
    int height;
    int balance_factor;
    bool has_left;
    bool has_right;
    std::vector<TreeNodeDTO> children; // [left, right] if they exist
};

class AVLTree {
public:
    AVLTree();
    ~AVLTree();

    // Returns rotation event (if any) after insertion
    RotationEvent insert(const Book& book);
    RotationEvent remove(const std::string& isbn);
    AVLNode* search(const std::string& isbn) const;

    int getHeight() const;
    int size() const;

    // Traversals
    std::vector<Book> inorder() const;
    std::vector<Book> preorder() const;
    std::vector<Book> postorder() const;

    // Full tree structure for visualization
    TreeNodeDTO getTreeStructure() const;

    // Get all books as flat list
    std::vector<Book> getAllBooks() const;

    // Get last rotation event
    RotationEvent getLastRotation() const { return last_rotation_; }

    // Iterate with predicate
    std::vector<Book> filter(std::function<bool(const Book&)> pred) const;

private:
    AVLNode* root_;
    int size_;
    RotationEvent last_rotation_;

    int height(AVLNode* node) const;
    int balanceFactor(AVLNode* node) const;
    void updateHeight(AVLNode* node);

    AVLNode* rotateRight(AVLNode* y);
    AVLNode* rotateLeft(AVLNode* x);
    AVLNode* balance(AVLNode* node, RotationEvent& evt);

    AVLNode* insert(AVLNode* node, const Book& book, RotationEvent& evt);
    AVLNode* remove(AVLNode* node, const std::string& isbn, RotationEvent& evt);
    AVLNode* minNode(AVLNode* node) const;

    void inorder(AVLNode* node, std::vector<Book>& result) const;
    void preorder(AVLNode* node, std::vector<Book>& result) const;
    void postorder(AVLNode* node, std::vector<Book>& result) const;
    void filter(AVLNode* node, std::function<bool(const Book&)> pred, std::vector<Book>& result) const;
    void destroy(AVLNode* node);

    TreeNodeDTO buildDTO(AVLNode* node) const;
};
