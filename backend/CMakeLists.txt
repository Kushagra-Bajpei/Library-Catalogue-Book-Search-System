cmake_minimum_required(VERSION 3.16)
project(LibraryCatalogue CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Platform-specific settings
if(WIN32)
    # Windows: link against ws2_32 for Winsock
    set(PLATFORM_LIBS ws2_32)
    add_definitions(-D_WIN32_WINNT=0x0A00)
else()
    set(PLATFORM_LIBS pthread)
endif()



add_executable(library_server
    src/main.cpp
    src/avl_tree.cpp
    src/bst.cpp
)

target_include_directories(library_server PRIVATE src)
target_link_libraries(library_server PRIVATE ${PLATFORM_LIBS})

# Optimization
if(CMAKE_BUILD_TYPE MATCHES Release)
    target_compile_options(library_server PRIVATE -O2)
endif()

# Copy data directory to build
file(MAKE_DIRECTORY ${CMAKE_BINARY_DIR}/data)

message(STATUS "Build type: ${CMAKE_BUILD_TYPE}")
message(STATUS "Platform libs: ${PLATFORM_LIBS}")
