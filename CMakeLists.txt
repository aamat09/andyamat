cmake_minimum_required(VERSION 3.16)
project(andyamat CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Drogon REQUIRED
    HINTS /usr/local/lib/cmake/Drogon
          /usr/local/Cellar/drogon/1.9.12/lib/cmake/Drogon)

file(GLOB_RECURSE SOURCES
    "controllers/*.cc"
    "filters/*.cc"
    "models/*.cc"
)

add_executable(${PROJECT_NAME} main.cc ${SOURCES})
target_link_libraries(${PROJECT_NAME} PRIVATE Drogon::Drogon)
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
