#pragma once
#include <string>

struct Book {
    std::string isbn;
    std::string title;
    std::string author;
    std::string category;
    int publication_year;
    std::string publisher;
    int total_copies;
    int available_copies;
    std::string description;

    Book() : publication_year(0), total_copies(1), available_copies(1) {}

    Book(const std::string& isbn, const std::string& title, const std::string& author,
         const std::string& category, int pub_year, const std::string& publisher,
         int total, int available, const std::string& desc = "")
        : isbn(isbn), title(title), author(author), category(category),
          publication_year(pub_year), publisher(publisher),
          total_copies(total), available_copies(available), description(desc) {}
};
