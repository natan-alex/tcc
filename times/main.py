times = [
    (297, 898, 4319),
    (894, 3177, 16665),
    (212, 758, 3918),
    (209, 742, 4019),
    (452, 1611, 8185),
    (204, 730, 3750),
    (586, 2145, 10865),
    (130, 440, 2353),
    (109, 385, 2145),
]

for item in times:
    (c, wasm, js) = item
    c_to_wasm_speed_up = wasm / c
    wasm_to_js_speed_up = js / wasm
    print(wasm_to_js_speed_up)
