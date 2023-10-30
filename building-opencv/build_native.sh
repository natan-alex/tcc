git clone --depth 1 https://github.com/opencv/opencv.git opencv

(
    mkdir -p build_native && cd build_native &&

    cmake -DWITH_IPP=OFF -DWITH_TBB=OFF -DWITH_OPENMP=OFF -DWITH_PTHREADS_PF=OFF -DCMAKE_INSTALL_PREFIX=/home/natan/libs/opencv4.8 ../opencv

    cmake --build . --target install
)
