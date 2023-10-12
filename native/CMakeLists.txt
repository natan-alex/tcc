cmake_minimum_required(VERSION 3.5)

project(native)

set(OpenCV_DIR /home/natan/libs/opencv4.8/lib/cmake/opencv4/)

find_package(OpenCV REQUIRED)

add_executable(native main.cpp)

target_link_libraries(native ${OpenCV_LIBS})
