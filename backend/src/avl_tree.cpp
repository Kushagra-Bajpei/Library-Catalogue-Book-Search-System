#include "avl_tree.h"
#include <algorithm>
#include <stdexcept>

AVLTree::AVLTree() : root_(nullptr), size_(0) {
    last_rotation_ = { RotationType::NONE, "", "" };
}

AVLTree::~AVLTree() {
    destroy(root_);
}

void AVLTree::destroy(AVLNode* node) {
    if (!node) return;
    destroy(node->left);
    destroy(node->right);
    delete node;
}

int AVLTree::height(AVLNode* node) const {
    return node ? node->height : 0;
}

int AVLTree::balanceFactor(AVLNode* node) const {
    return node ? height(node->left) - height(node->right) : 0;
}

void AVLTree::updateHeight(AVLNode* node) {
    if (node) {
        node->height = 1 + std::max(height(node->left), height(node->right));
        node->balance_factor = balanceFactor(node);
    }
}

AVLNode* AVLTree::rotateRight(AVLNode* y) {
    AVLNode* x = y->left;
    AVLNode* T2 = x->right;

    x->right = y;
    y->left = T2;

    updateHeight(y);
    updateHeight(x);
    return x;
}

AVLNode* AVLTree::rotateLeft(AVLNode* x) {
    AVLNode* y = x->right;
    AVLNode* T2 = y->left;

    y->left = x;
    x->right = T2;

    updateHeight(x);
    updateHeight(y);
    return y;
}

AVLNode* AVLTree::balance(AVLNode* node, RotationEvent& evt) {
    updateHeight(node);
    int bf = balanceFactor(node);

    // LL Case
    if (bf > 1 && balanceFactor(node->left) >= 0) {
        evt.type = RotationType::LL;
        evt.pivot_isbn = node->book.isbn;
        evt.description = "LL Rotation at ISBN " + node->book.isbn +
            ": Left subtree was left-heavy. A single right rotation restored AVL balance.";
        return rotateRight(node);
    }
    // LR Case
    if (bf > 1 && balanceFactor(node->left) < 0) {
        node->left = rotateLeft(node->left);
        evt.type = RotationType::LR;
        evt.pivot_isbn = node->book.isbn;
        evt.description = "LR Rotation at ISBN " + node->book.isbn +
            ": Left subtree was right-heavy. A left rotation followed by a right rotation restored AVL balance.";
        return rotateRight(node);
    }
    // RR Case
    if (bf < -1 && balanceFactor(node->right) <= 0) {
        evt.type = RotationType::RR;
        evt.pivot_isbn = node->book.isbn;
        evt.description = "RR Rotation at ISBN " + node->book.isbn +
            ": Right subtree was right-heavy. A single left rotation restored AVL balance.";
        return rotateLeft(node);
    }
    // RL Case
    if (bf < -1 && balanceFactor(node->right) > 0) {
        node->right = rotateRight(node->right);
        evt.type = RotationType::RL;
        evt.pivot_isbn = node->book.isbn;
        evt.description = "RL Rotation at ISBN " + node->book.isbn +
            ": Right subtree was left-heavy. A right rotation followed by a left rotation restored AVL balance.";
        return rotateLeft(node);
    }
    return node;
}

AVLNode* AVLTree::insert(AVLNode* node, const Book& book, RotationEvent& evt) {
    if (!node) {
        ++size_;
        return new AVLNode(book);
    }

    if (book.isbn < node->book.isbn)
        node->left = insert(node->left, book, evt);
    else if (book.isbn > node->book.isbn)
        node->right = insert(node->right, book, evt);
    else {
        // Update existing
        node->book = book;
        return node;
    }

    return balance(node, evt);
}

AVLNode* AVLTree::minNode(AVLNode* node) const {
    AVLNode* current = node;
    while (current->left) current = current->left;
    return current;
}

AVLNode* AVLTree::remove(AVLNode* node, const std::string& isbn, RotationEvent& evt) {
    if (!node) return nullptr;

    if (isbn < node->book.isbn)
        node->left = remove(node->left, isbn, evt);
    else if (isbn > node->book.isbn)
        node->right = remove(node->right, isbn, evt);
    else {
        if (!node->left || !node->right) {
            AVLNode* temp = node->left ? node->left : node->right;
            if (!temp) {
                temp = node;
                node = nullptr;
            } else {
                *node = *temp;
            }
            delete temp;
            --size_;
        } else {
            AVLNode* temp = minNode(node->right);
            node->book = temp->book;
            node->right = remove(node->right, temp->book.isbn, evt);
        }
    }

    if (!node) return nullptr;
    return balance(node, evt);
}

RotationEvent AVLTree::insert(const Book& book) {
    RotationEvent evt = { RotationType::NONE, "", "" };
    root_ = insert(root_, book, evt);
    last_rotation_ = evt;
    return evt;
}

RotationEvent AVLTree::remove(const std::string& isbn) {
    RotationEvent evt = { RotationType::NONE, "", "" };
    root_ = remove(root_, isbn, evt);
    last_rotation_ = evt;
    return evt;
}

AVLNode* AVLTree::search(const std::string& isbn) const {
    AVLNode* current = root_;
    while (current) {
        if (isbn == current->book.isbn) return current;
        else if (isbn < current->book.isbn) current = current->left;
        else current = current->right;
    }
    return nullptr;
}

int AVLTree::getHeight() const {
    return height(root_);
}

int AVLTree::size() const {
    return size_;
}

void AVLTree::inorder(AVLNode* node, std::vector<Book>& result) const {
    if (!node) return;
    inorder(node->left, result);
    result.push_back(node->book);
    inorder(node->right, result);
}

void AVLTree::preorder(AVLNode* node, std::vector<Book>& result) const {
    if (!node) return;
    result.push_back(node->book);
    preorder(node->left, result);
    preorder(node->right, result);
}

void AVLTree::postorder(AVLNode* node, std::vector<Book>& result) const {
    if (!node) return;
    postorder(node->left, result);
    postorder(node->right, result);
    result.push_back(node->book);
}

void AVLTree::filter(AVLNode* node, std::function<bool(const Book&)> pred, std::vector<Book>& result) const {
    if (!node) return;
    filter(node->left, pred, result);
    if (pred(node->book)) result.push_back(node->book);
    filter(node->right, pred, result);
}

std::vector<Book> AVLTree::inorder() const {
    std::vector<Book> result;
    inorder(root_, result);
    return result;
}

std::vector<Book> AVLTree::preorder() const {
    std::vector<Book> result;
    preorder(root_, result);
    return result;
}

std::vector<Book> AVLTree::postorder() const {
    std::vector<Book> result;
    postorder(root_, result);
    return result;
}

std::vector<Book> AVLTree::getAllBooks() const {
    return inorder();
}

std::vector<Book> AVLTree::filter(std::function<bool(const Book&)> pred) const {
    std::vector<Book> result;
    filter(root_, pred, result);
    return result;
}

TreeNodeDTO AVLTree::buildDTO(AVLNode* node) const {
    TreeNodeDTO dto;
    dto.isbn = node->book.isbn;
    dto.title = node->book.title;
    dto.author = node->book.author;
    dto.height = node->height;
    dto.balance_factor = node->balance_factor;
    dto.has_left = node->left != nullptr;
    dto.has_right = node->right != nullptr;
    if (node->left) dto.children.push_back(buildDTO(node->left));
    else { TreeNodeDTO null_node; null_node.isbn = ""; dto.children.push_back(null_node); }
    if (node->right) dto.children.push_back(buildDTO(node->right));
    else { TreeNodeDTO null_node; null_node.isbn = ""; dto.children.push_back(null_node); }
    return dto;
}

TreeNodeDTO AVLTree::getTreeStructure() const {
    if (!root_) return {};
    return buildDTO(root_);
}
