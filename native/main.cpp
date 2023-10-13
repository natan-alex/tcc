#include <chrono>
#include <iostream>
#include <ratio>

#include "opencv2/core/core.hpp"
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/imgcodecs/imgcodecs.hpp"

int main() {
    // Load the images
    cv::Mat source_image = cv::imread("../assets/nature.jpg");
    cv::Mat template_image = cv::imread("../assets/nature-tree.png");


    // Initialize variables
    cv::Mat result;
    cv::Point minLoc, maxLoc;
    double minVal, maxVal;

    auto start = std::chrono::steady_clock::now();

    // Perform template matching using NCC
    cv::matchTemplate(source_image, template_image, result, cv::TM_CCOEFF_NORMED);

    auto end = std::chrono::steady_clock::now();

    auto elapsedTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();

    cv::minMaxLoc(result, &minVal, &maxVal, &minLoc, &maxLoc);


    // Draw a rectangle around the best match
    cv::Point rect_bottom_right(
        maxLoc.x + template_image.cols,
        maxLoc.y + template_image.rows
    );

    cv::Scalar rect_color = cv::Scalar(0, 0, 255);

    cv::rectangle(source_image, maxLoc, rect_bottom_right, rect_color, 2);


    // Display the result
    cv::imshow("Result", source_image);
    cv::waitKey(0);

    std::cout << "Time elapsed: " << elapsedTime << "ms" << std::endl;

    return 0;
}
