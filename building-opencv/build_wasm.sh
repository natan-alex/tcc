git clone --depth 1 https://github.com/opencv/opencv.git opencv

# Build
(
    cd opencv &&

    docker run --rm --workdir /code -v "$PWD":/code "emscripten/emsdk" python3 ./platforms/js/build_js.py build_wasm --build_wasm --disable_single_file --emscripten_dir="/emsdk/upstream/emscripten"
)

# Copy compilation result
sudo mv ./opencv/build_wasm/ ./build_wasm
