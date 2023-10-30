browsers_and_times = {
    "firefox": [
        (144.9,	286.45,	1312.60),
        (300.9,	588.40,	3219.05),
        (380.5,	744.55,	3525.75),
        (389.5,	773.00,	4155.90),
        (472.65,	908.40,	4655.35),
        (530.65,	1051.50,	5470.30),
        (818.2,	1540.80,	8091.50),
        (1328.4,	2510.90,	11692.75),
        (1830.65,	3278.00,	14133.60),
    ],
    "edge": [
        (144.9,	284.94,	1045.64),
        (300.9,	568.92,	2229.90),
        (380.5,	765.42,	2769.27),
        (389.5,	762.37,	2936.49),
        (472.65,	903.98,	3410.36),
        (530.65,	1102.13,	3837.97),
        (818.2,	1575.54,	5679.84),
        (1328.4,	2588.18,	8957.02),
        (1830.65,	3446.16,	11203.81),
    ],
    "chrome": [
        (144.9,	284.88,	1046.38),
        (300.9,	568.40,	2228.97),
        (380.5,	756.04,	2937.91),
        (389.5,	760.53,	3825.29),
        (472.65,	902.34,	3406.94),
        (530.65,	1099.20,	2757.39),
        (818.2,	1570.32,	5667.36),
        (1328.4,	2588.55,	8954.68),
        (1830.65,	3424.67,	11167.33),
    ]
}

c_to_wasm_speed_ups = {} 
wasm_to_js_speed_ups = {}

for browser in browsers_and_times:
    all_times = browsers_and_times[browser]

    for times in all_times:
        (c, wasm, js) = times

        if browser not in c_to_wasm_speed_ups:
            c_to_wasm_speed_ups[browser] = []

        if browser not in wasm_to_js_speed_ups:
            wasm_to_js_speed_ups[browser] = []

        c_to_wasm_speed_ups[browser].append(wasm / c)
        wasm_to_js_speed_ups[browser].append(js / wasm)

for browser in browsers_and_times:
    c_to_wasm_speed_ups[browser].sort()
    wasm_to_js_speed_ups[browser].sort()

for browser in c_to_wasm_speed_ups:
    print(f'\n{browser} c to wasm: ')

    for speed_up in c_to_wasm_speed_ups[browser]:
        print(f'\t{speed_up}')

    print(f'{browser} wasm to js: ')

    for speed_up in wasm_to_js_speed_ups[browser]:
        print(f'\t{speed_up}')
