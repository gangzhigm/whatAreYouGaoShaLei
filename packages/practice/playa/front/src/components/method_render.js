"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFloor_3 = exports.createFloor_2 = exports.createFloor_1 = exports.render_3_block = exports.render_2_block = exports.render_1_block = void 0;
/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-16 14:30:51
 * @FilePath: \playa\front\src\components\utils.ts
 * @Description: 实现方法组
 */
const THREE = __importStar(require("three"));
const Math_1 = __importStar(require("./method_1_math"));
const Math_2 = __importStar(require("./method_2_math"));
const Math_3 = __importStar(require("./method_3_math"));
const Mesh = __importStar(require("./method_mesh"));
const createFloor_1 = function (floor_Scale = [1, 2], floor_size = [1, 1, 1]) {
    const floor_1_group = new THREE.Group();
    const list_1 = [
        [Math_1.sin_random_noise_1_2(100, 10, 0), floor_1_group, floor_size, floor_Scale, 0],
        [Math_1.sin_random_noise_1_2(100, 10, 1), floor_1_group, floor_size, floor_Scale, 10],
        [Math_1.sin_random_noise_1_2(100, 10, 2), floor_1_group, floor_size, floor_Scale, 20],
    ];
    list_1.forEach((item) => {
        render_1_block(item);
    });
    const thing_1 = Mesh.box_center_world(floor_1_group);
    return thing_1;
};
exports.createFloor_1 = createFloor_1;
const render_1_block = function ([list = [], group, unit_size = [1, 1, 1], unit_scale = [1, 2], offset = 0, axis = "x"]) {
    const axis_list = ["x", null, "z"];
    const axis_index = axis_list.findIndex(item => item === axis);
    const offset_index = axis_list.findIndex(item => item !== axis && item !== null);
    const position_value = [offset, offset, offset];
    const geometry = new THREE.BoxGeometry(...unit_size);
    list.forEach((item) => {
        // 获取对应点的参数
        let coefficient = item[0];
        // 获取Y轴参数的比例
        const scale_Coefficient = (coefficient * (unit_scale[1] - unit_scale[0]) + unit_scale[0]);
        // 获取当前点颜色
        const color = new THREE.Color(`hsl(0, 0%, ${item[0] * 100}%)`);
        // 获取当前模型材质参数
        const material = new THREE.MeshStandardMaterial({ color });
        // 生成模型
        const cube = new THREE.Mesh(geometry, material);
        // 设置Y轴参数比例
        cube.scale.y = scale_Coefficient;
        // 获取Y轴的定位点
        position_value[1] = unit_size[1] / 2 * scale_Coefficient;
        // 定义非偏移方向
        position_value[axis_index] = item[1];
        // 定义偏移方向
        position_value[offset_index] = 0 + offset;
        // 设置定位
        cube.position.set(...position_value);
        // 设置组
        group.add(cube);
    });
};
exports.render_1_block = render_1_block;
const createFloor_2 = function (floor_Scale = [1, 2], floor_size = [1, 1, 1]) {
    const floor_2_group = new THREE.Group();
    const list_2 = [
        // 2维 全随机算法
        [Math_2.sin_random_noise_2([100, 1], [20, 1], 0), floor_2_group, floor_size, floor_Scale, 0],
        [Math_2.sin_random_noise_2([100, 1], [20, 1], 1), floor_2_group, floor_size, floor_Scale, 10],
        [Math_2.sin_random_noise_2([100, 1], [20, 1], 2), floor_2_group, floor_size, floor_Scale, 20],
        [Math_2.sin_random_noise_2([100, 1], [20, 1], 3), floor_2_group, floor_size, floor_Scale, 30],
        [Math_2.sin_random_noise_2([100, 40], [20, 8], 0), floor_2_group, floor_size, floor_Scale, 40],
        [Math_2.sin_random_noise_2([100, 40], [20, 8], 1), floor_2_group, floor_size, floor_Scale, 90],
        [Math_2.sin_random_noise_2([100, 40], [20, 8], 2), floor_2_group, floor_size, floor_Scale, 140],
        [Math_2.sin_random_noise_2([100, 40], [20, 8], 3), floor_2_group, floor_size, floor_Scale, 190],
    ];
    list_2.forEach(item => {
        render_2_block(item);
    });
    const thing_2 = Mesh.box_center_world(floor_2_group);
    return thing_2;
};
exports.createFloor_2 = createFloor_2;
const render_2_block = function ([list = [], group, unit_size = [1, 1, 1], unit_scale = [1, 2], offset = 0, axis = "x"]) {
    const axis_list = ["x", null, "z"];
    const axis_index = axis_list.findIndex(item => item === axis);
    // 偏移方向
    const offset_index = axis_list.findIndex(item => item !== axis && item !== null);
    const position_value = [offset, offset, offset];
    const geometry = new THREE.BoxGeometry(...unit_size);
    list.forEach(item => {
        // 获取对应点的参数
        let coefficient = item[0];
        // 获取Y轴参数的比例
        const scale_Coefficient = coefficient * (unit_scale[1] - unit_scale[0]) + unit_scale[0];
        // 获取当前点颜色
        let color = new THREE.Color(`hsl(0, 0%, ${item[0] * 100}%)`);
        // 获取当前模型材质参数
        const material = new THREE.MeshStandardMaterial({ color });
        // 生成模型
        const cube = new THREE.Mesh(geometry, material);
        // 设置Y轴参数比例
        cube.scale.y = scale_Coefficient;
        // 获取Y轴的定位点
        position_value[1] = unit_size[1] / 2 * scale_Coefficient;
        position_value[axis_index] = item[1];
        position_value[offset_index] = item[2] + offset;
        // 设置定位
        cube.position.set(...position_value);
        group.add(cube);
    });
};
exports.render_2_block = render_2_block;
const createFloor_3 = function (floor_Scale = [1, 2], floor_size = [1, 1, 1]) {
    const floor_3_group = new THREE.Group();
    const list_3 = [
        // 3维 全随机算法
        [floor_size, Math_3.random_noise_3([20, 20, 20]), floor_3_group, floor_Scale, 0],
        [floor_size, Math_3.sin_random_noise_3(), floor_3_group, floor_Scale, 30],
    ];
    list_3.forEach(item => {
        render_3_block(item);
    });
    const thing_3 = Mesh.box_center_world(floor_3_group);
    return thing_3;
};
exports.createFloor_3 = createFloor_3;
const render_3_block = function ([unit_size = [1, 1, 1], list = [], group, unit_scale = [1, 2], offset = 0,]) {
    const geometry = new THREE.BoxGeometry(...unit_size);
    list.forEach((item) => {
        let color = item[4] === 1 ?
            new THREE.Color(`hsl(0, 0%, ${item[0] * 100}%)`) :
            new THREE.Color(`hsl(0, 0%, ${item[0] * 100}%)`);
        let coefficient = item[0];
        const scale_Coefficient = Number((coefficient * (unit_scale[1] - unit_scale[0]) + unit_scale[0]).toFixed(1));
        const material = new THREE.MeshStandardMaterial({ color });
        const cube = new THREE.Mesh(geometry, material);
        cube.scale.set(scale_Coefficient, scale_Coefficient, scale_Coefficient);
        const x_axis = item[1];
        // const x_axis = item[1] * (1-scale_Coefficient) * 3;
        const y_axis = item[2] + unit_size[1] / 2;
        // const y_axis = item[2] * scale_Coefficient * 3 + unit_size[1] / 2;
        const z_axis = item[3] + offset;
        // const z_axis = item[3] * scale_Coefficient * 3 + offset;
        cube.position.set(x_axis, y_axis, z_axis);
        group.add(cube);
    });
};
exports.render_3_block = render_3_block;
