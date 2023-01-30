"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sin_random_noise_2 = exports.random_noise_2 = void 0;
const random_noise_2 = function (noise_size = [2, 2]) {
    let list = [];
    for (let i = 0; i < noise_size[0]; i += 1) {
        for (let j = 0; j < noise_size[1]; j += 1) {
            list.push([Number(Math.random().toFixed(2)), i, j]);
        }
    }
    return list;
};
exports.random_noise_2 = random_noise_2;
const sin_random_noise_2 = function (len = [100, 100], subblock = [10, 10], type = 0) {
    let list = [];
    const min_Len = 1;
    // 每块x向尺寸
    const subblock_LenA = len[0] / subblock[0] > min_Len ? Math.ceil(len[0] / subblock[0]) : min_Len;
    // 每块y向尺寸
    const subblock_LenB = len[1] / subblock[1] > min_Len ? Math.ceil(len[1] / subblock[1]) : min_Len;
    // 总块数
    const block_num = subblock.reduce((a, b) => a * b);
    // 各方向当前遍历块数[x,y,z]
    const curr_coordinates_number = [0, 0];
    // 各方向总块数[x,y,z]
    const all_coordinates_number = Array.from(subblock);
    // 每块x向步进数
    const subblock_numberA = Math.floor(subblock_LenA / (len[0] / subblock[0]));
    // 每块y向步进数
    const subblock_numberB = Math.floor(subblock_LenB / (len[1] / subblock[1]));
    // 初始化上下左右四角基础量
    let [TL, TR, BL, BR] = [Math.random(), Math.random(), Math.random(), Math.random()];
    for (let x = 0; x < block_num; x++) {
        let subblock = [];
        for (let i = 0; i < subblock_LenA; i++) {
            for (let j = 0; j < subblock_LenB; j++) {
                // 生成x方向的长度比例
                const prop_x = i === 0 ? 0 : (i + 1) / subblock_LenA;
                // 生成y方向的长度比例
                const prop_y = j === 0 ? 0 : (j + 1) / subblock_LenB;
                // 生成x方向的缓动比例
                const prop_x_smoothstep = smoothstep(prop_x, 0, 1);
                // 生成y方向的缓动比例
                const prop_y_smoothstep = smoothstep(prop_y, 0, 1);
                // 获取x方向2边界的缓动方案2长度比例 
                const prop_x_smoothstep_2 = smoothstep_2(prop_x);
                // 获取x方向2边界的缓动方案2长度比例 
                const prop_y_smoothstep_2 = smoothstep_2(prop_y);
                // 获取x方向2边界的长度比例值
                const value_tb = [lerp(TL, TR, prop_x), lerp(BL, BR, prop_x)];
                // // 获取x方向2边界的缓动长度比例值
                const value_tb_smoothstep = [lerp(TL, TR, prop_x_smoothstep), lerp(BL, BR, prop_x_smoothstep)];
                // // 获取x方向2边界的缓动长度比例值
                const value_tb_smoothstep_2 = [lerp(TL, TR, prop_x_smoothstep_2), lerp(BL, BR, prop_x_smoothstep_2)];
                // 获取当前点的长度比例值
                const value_len = lerp(value_tb[0], value_tb[1], prop_y);
                // 获取当前点的缓动比例值
                const value_smoothstep = lerp(value_tb_smoothstep[0], value_tb_smoothstep[1], prop_y_smoothstep);
                // 获取当前点的缓动2比例值
                const value_smoothstep_2 = lerp(value_tb_smoothstep_2[0], value_tb_smoothstep_2[1], prop_y_smoothstep_2);
                const [x, y] = [
                    subblock_LenA * curr_coordinates_number[0] + i,
                    subblock_LenB * curr_coordinates_number[1] + j
                ];
                let value = null;
                if (type === 0) {
                    value = Math.random();
                }
                else if (type === 1) {
                    value = value_len;
                }
                else if (type === 2) {
                    value = value_smoothstep;
                }
                else if (type === 3) {
                    value = value_smoothstep_2;
                }
                subblock.push({
                    v: value,
                    x,
                    y
                });
            }
        }
        list.push(subblock);
        if ((curr_coordinates_number[0] + 1) >= all_coordinates_number[0]) {
            const TopOne = list[list.length - all_coordinates_number[0]];
            TL = TopOne[subblock_LenA - 1].v; // BL
            TR = TopOne[TopOne.length - 1].v; // BR
            BL = Math.random();
            BR = Math.random();
            curr_coordinates_number[0] = 0;
            curr_coordinates_number[1] += 1;
        }
        else if (curr_coordinates_number[1] === 0) {
            TL = TR;
            BL = BR;
            TR = Math.random();
            BR = Math.random();
            curr_coordinates_number[0] += 1;
        }
        else {
            const TopOne = list[list.length - all_coordinates_number[0]];
            TL = TR;
            BL = BR;
            TR = TopOne[TopOne.length - 1].v;
            BR = Math.random();
            curr_coordinates_number[0] += 1;
        }
    }
    list = list.flat().map(({ v, x, y }) => [v, x, y]);
    return list;
};
exports.sin_random_noise_2 = sin_random_noise_2;
// 获取分段参数
function getStep(l, t) {
    let Len_List = [];
    let Step_List = [];
    if (Array.isArray(l) && Array.isArray(t)) {
        Len_List = l;
        Step_List = t;
    }
    else if (Array.isArray(l) || Array.isArray(t)) {
        throw ("参数不匹配");
    }
    else {
        Len_List = [l];
        Step_List = [t];
    }
    let Block_List = Len_List.map((item, index) => {
        let list = [];
        for (let x = 0; x <= Step_List[index]; x++) {
            list.push(x * item / Step_List[index]);
        }
        return [list, item, Step_List[index], item / Step_List[index]];
    });
    // 总点数
    const A_number = t.reduce((a, b) => a * b);
    const B_number = t.reduce((a, b) => (a + 1) * (b + 1));
    // 各行总点数统计
    let Block_List_A = Block_List.map(item => item[1]);
    // 各行总分隔数
    let Block_List_B = Block_List.map(item => item[0]);
    let array = [
        [{
                v: get_dot_after(random(Math.random() * 100, 100, 100, 100)),
                x: 0,
                y: 0
            },
            {
                v: get_dot_after(random(Math.random() * 100, 100, 100, 100)),
                x: 1,
                y: 0
            }],
        [{
                v: get_dot_after(random(Math.random() * 100, 100, 100, 100)),
                x: 0,
                y: 1
            },
            {
                v: get_dot_after(random(Math.random() * 100, 100, 100, 100)),
                x: 1,
                y: 1
            }]
    ];
    return array;
}
// 获取sin源参数
function random(a = 1, b = 1, c = 1, d = 0) {
    return Math.sin(a * b) * c + d;
}
// 获取小数部分
function get_dot_after(number) {
    return isNaN(Number(`0.${number.toString().split(".")[1]}`)) ? 0 : Number(`0.${number.toString().split(".")[1]}`);
}
// 生成缓动比例
function smoothstep(x, a, b) {
    if (x < a)
        return 0;
    if (x > b)
        return 1;
    const t = (x - a) / (b - a);
    const c = 3 * x * x - 2 * x * x * x;
    return c;
}
// 线性插值
function lerp(a, b, t) {
    return (b * t) + (a * (1 - t));
}
// 生成缓动比例2
function smoothstep_2(len) {
    return (Math.pow(len, 5) * 6) - (Math.pow(len, 4) * 15) + (Math.pow(len, 3) * 10);
}
