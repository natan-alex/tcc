#include <algorithm>
#include <chrono>
#include <cstddef>
#include <iostream>
#include <ratio>
#include <filesystem>
#include <string>
#include <vector>

#include "opencv2/core/core.hpp"
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgproc/imgproc.hpp"
#include "opencv2/imgcodecs/imgcodecs.hpp"

int main() {
    std::string n = "9";

    std::string source_image_path = "../assets/image" + n + ".jpg";
    std::string template_image_path = "../assets/template" + n + ".png";

    cv::Mat source_image = cv::imread(source_image_path);
    cv::Mat template_image = cv::imread(template_image_path);

    cv::Mat mask;
    cv::Mat result;

    auto start = std::chrono::steady_clock::now();

    cv::matchTemplate(source_image, template_image, result, cv::TM_CCOEFF_NORMED, mask);

    auto end = std::chrono::steady_clock::now();

    auto elapsedTime = std::chrono::duration_cast<std::chrono::milliseconds>(end - start).count();

    // double minVal, maxVal;
    // cv::Point minLoc, maxLoc;
    // cv::minMaxLoc(result, &minVal, &maxVal, &minLoc, &maxLoc);
    //
    // cv::Point rect_bottom_right(
    //   maxLoc.x + template_image.cols,
    //   maxLoc.y + template_image.rows
    // );
    //
    // cv::Scalar rect_color = cv::Scalar(0, 0, 255);
    //
    // cv::rectangle(source_image, maxLoc, rect_bottom_right, rect_color, 2);
    //
    // cv::imshow("Result", source_image);
    // cv::waitKey(0);

    std::cout << "Image: " << source_image_path << std::endl;
    std::cout << "\tWidth: " << source_image.cols << std::endl;
    std::cout << "\tHeight: " << source_image.rows << std::endl;
    std::cout << "\tTime elapsed: " << elapsedTime << "ms" << std::endl;
    std::cout << std::endl;

    return 0;
}
