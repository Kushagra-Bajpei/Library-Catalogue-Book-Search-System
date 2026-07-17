#pragma once
#include <string>
#include <vector>
#include "book.h"

// -----------------------------------------------------------------------
// Plain (unbalanced) Binary Search Tree — for comparison with AVL Tree
// Keys are ISBNs (same as AVL tree)
// -----------------------------------------------------------------------

struct BSTNode {
    Book book;
    BSTNode* left;
    BSTNode* right;
    explicit BSTNode(const Book& b) : book(b), left(nullptr), right(nullptr) {}
};

struct BSTNodeDTO {
    std::string isbn;
    std::string title;
    int depth;
    bool has_left;
    bool has_right;
    std::vector<BSTNodeDTO> children;
};

class BST {
public:
    BST();
    ~BST();

    void insert(const Book& book);
    BSTNode* search(const std::string& isbn) const;
    int getHeight() const;
    int size() const;
    std::vector<Book> inorder() const;
    BSTNodeDTO getTreeStructure() const;

private:
    BSTNode* root_;
    int size_;

    BSTNode* insert(BSTNode* node, const Book& book);
    BSTNode* search(BSTNode* node, const std::string& isbn) const;
    int height(BSTNode* node) const;
    void inorder(BSTNode* node, std::vector<Book>& result) const;
    void destroy(BSTNode* node);
    BSTNodeDTO buildDTO(BSTNode* node, int depth) const;
};
