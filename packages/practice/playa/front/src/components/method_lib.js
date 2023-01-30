"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_index_2_to_1 = exports.get_average_1 = exports.getColor_16 = exports.get_near_2 = exports.lerp_2 = exports.lerp = void 0;
const lerp = function (start, end, interpolation) {
    return Number((1 - interpolation).toFixed(2)) * start + interpolation * end;
};
exports.lerp = lerp;
const lerp_2 = function (value) {
    return Number(((Math.pow(value, 5) * 6) - (Math.pow(value, 4) * 15) + (Math.pow(value, 3) * 10)).toFixed(2));
};
exports.lerp_2 = lerp_2;
const get_index_2_to_1 = function (size, index) {
    return index[0] * size[0] + index[1];
};
exports.get_index_2_to_1 = get_index_2_to_1;
const getColor_16 = function () {
    let color = "#";
    const colorList = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
    ];
    for (let i = 0; i < 6; i++) {
        color += colorList[Math.floor(Math.random() * 16)];
    }
    return color;
};
exports.getColor_16 = getColor_16;
const get_near_2 = function (list, [i, j]) {
    if (list.length === 0) {
        return null;
    }
    return list.reduce((a, b) => {
        const aa = Number(Math.sqrt(Math.pow(a[0] - i, 2) + Math.pow(a[1] - j, 2)).toFixed(3));
        const bb = Number(Math.sqrt(Math.pow(b[0] - i, 2) + Math.pow(b[1] - j, 2)).toFixed(3));
        return aa < bb ? a : b;
    });
};
exports.get_near_2 = get_near_2;
const get_near_3 = function (list, [i, j, z]) {
    if (list.length === 0) {
        return null;
    }
    // d=√[(x1-x2)^2+(y1-y2)^2+(z1-z2)^2]
    return list.reduce((a, b) => {
        const aa = Number(Math.sqrt(Math.pow(a[0] - i, 2) + Math.pow(a[1] - j, 2) + Math.pow(a[2] - z, 2)).toFixed(3));
        const bb = Number(Math.sqrt(Math.pow(b[0] - i, 2) + Math.pow(b[1] - j, 2) + Math.pow(a[2] - z, 2)).toFixed(3));
        return aa < bb ? a : b;
    });
};
const get_average_1 = function (size, step) {
    const list = new Set();
    for (let i = 0; i < step - 1; i += 1) {
        const start_value = Math.round(size / (step - 1) * i);
        const end_value = Math.round(size / (step - 1) + size / (step - 1) * i);
        list.add(start_value);
        list.add(end_value);
    }
    const array = [];
    list.forEach(item => {
        array.push(item);
    });
    return array;
};
exports.get_average_1 = get_average_1;
