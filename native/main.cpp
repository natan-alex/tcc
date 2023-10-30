#include <algorithm>
#include <chrono>
#include <cstddef>
#include <filesystem>
#include <iostream>
#include <map>
#include <numeric>
#include <ratio>
#include <string>
#include <vector>

#include "opencv2/core/core.hpp"
#include "opencv2/highgui/highgui.hpp"
#include "opencv2/imgcodecs/imgcodecs.hpp"
#include "opencv2/imgproc/imgproc.hpp"

namespace fs = std::filesystem;

const auto ITERATIONS = 20;

int main() {
    auto source_paths = std::vector<std::string>();
    auto template_paths = std::vector<std::string>();

    for (const auto &entry : fs::directory_iterator("../assets")) {
        const auto path = entry.path();
        const auto filename = path.filename().string();
        const auto extension = path.extension();

        if (extension == ".jpg" || extension == ".jpeg" || extension == ".png") {
            if (filename.rfind("image", 0) == 0)
                source_paths.push_back(path);
            else
                template_paths.push_back(path);
        }
    }

    std::sort(source_paths.begin(), source_paths.end());
    std::sort(template_paths.begin(), template_paths.end());

    auto source_mats = std::vector<cv::Mat>();
    auto template_mats = std::vector<cv::Mat>();

    for (size_t i = 0; i < source_paths.size(); ++i) {
        source_mats.push_back(cv::imread(source_paths[i]));
        template_mats.push_back(cv::imread(template_paths[i]));
    }

    auto pathsAndTimes = std::map<std::string, std::vector<long>>();

    for (size_t i = 0; i < source_mats.size() * ITERATIONS; ++i) {
        const auto index = i % source_mats.size();

        cv::Mat mask = cv::Mat();
        cv::Mat result = cv::Mat();

        const auto start = std::chrono::steady_clock::now();

        cv::matchTemplate(source_mats[index], template_mats[index], result, cv::TM_CCOEFF_NORMED, mask);

        const auto end = std::chrono::steady_clock::now();

        const auto time_elapsed =
            std::chrono::duration_cast<std::chrono::milliseconds>(end - start)
            .count();

        if (pathsAndTimes.find(source_paths[index]) == pathsAndTimes.end()) {
            pathsAndTimes[source_paths[index]] = std::vector<long>();
        }

        pathsAndTimes[source_paths[index]].push_back(time_elapsed);
    }

    std::cout
        << "Source\t"
        << "Source width\t"
        << "Source height\t"
        << "Template\t"
        << "Template width\t"
        << "Template height\t"
        << "Average time"
        << std::endl;

    for (size_t i = 0; i < source_paths.size(); ++i) {
        const auto times = pathsAndTimes[source_paths[i]];
        const auto sum = std::accumulate(times.begin(), times.end(), 0LL);
        const auto average = 1.0 * sum / times.size();

        std::cout 
            << source_paths[i] << "\t"
            << source_mats[i].cols << "\t"
            << source_mats[i].rows << "\t"
            << template_paths[i] << "\t"
            << template_mats[i].cols << "\t"
            << template_mats[i].rows << "\t"
            << average << std::endl;
    }

    for (size_t i = 0; i < source_paths.size(); ++i) {
        const auto times = pathsAndTimes[source_paths[i]];

        for (const auto time : times) {
            std::cout << time << "\t";
        }

        std::cout << std::endl;
    }

    return 0;
}
