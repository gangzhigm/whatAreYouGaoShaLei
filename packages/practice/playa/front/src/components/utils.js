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
exports.createFloor_3 = exports.createFloor_2 = exports.createFloor_1 = exports.render_2_block = exports.render_1_block = exports.value_noise_2 = exports.value_noise_1 = exports.random_noise_3 = exports.random_noise_2 = exports.random_noise_1 = exports.box_center_world = exports.get_index_2_to_1 = exports.get_average_1 = exports.getColor_16 = exports.get_near_2 = exports.lerp_2 = exports.lerp = exports.createRenderer = exports.createCanvas = exports.createSkyBox = exports.createCamera = void 0;
/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-06 18:18:32
 * @FilePath: \playa\front\src\components\utils.ts
 * @Description: 实现方法组
 */
const THREE = __importStar(require("three"));
const createCamera = function (aspect = window.innerWidth / window.innerHeight, orthographic_camera_size = [100, 100, 100, 100], Scene_Size = 1000) {
    return new THREE.OrthographicCamera(orthographic_camera_size[0] * -1, // 左端边界
    orthographic_camera_size[1], // 右端边界
    orthographic_camera_size[2] / aspect, // 上端边界
    orthographic_camera_size[3] / -aspect, // 下端边界
    -Scene_Size * 2, // 近视角
    Scene_Size * 2 // 远视角
    );
};
exports.createCamera = createCamera;
const createSkyBox = function (Scene_Size = 1000) {
    let directions = [
        'http://localhost:3000/skyBox2/posx.jpg', 'http://localhost:3000/skyBox2/negx.jpg',
        'http://localhost:3000/skyBox2/posy.jpg', 'http://localhost:3000/skyBox2/negy.jpg',
        'http://localhost:3000/skyBox2/posz.jpg', 'http://localhost:3000/skyBox2/negz.jpg'
    ]; // 获取对象
    const loader = new THREE.TextureLoader();
    const skyGeometry = new THREE.BoxGeometry(Scene_Size, Scene_Size, Scene_Size);
    // 设置盒子材质
    const materialArray = [];
    for (let i = 0; i < 6; i++)
        materialArray.push(new THREE.MeshBasicMaterial({
            map: loader.load(directions[i]),
            side: THREE.BackSide // 镜像翻转
        }));
    // 创建一个完整的天空盒，填入几何模型和材质的参数
    return new THREE.Mesh(skyGeometry, materialArray);
};
exports.createSkyBox = createSkyBox;
const createCanvas = function (id_class_name = "three-canvas") {
    const canvas = document.createElement('canvas');
    canvas.id = id_class_name;
    canvas.className = id_class_name;
    return canvas;
};
exports.createCanvas = createCanvas;
const createRenderer = function (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
};
exports.createRenderer = createRenderer;
const lerp = function (start, end, interpolation) {
    return Number((1 - interpolation).toFixed(2)) * start + interpolation * end;
};
exports.lerp = lerp;
const lerp_2 = function (value) {
    return Number(((Math.pow(value, 5) * 6) - (Math.pow(value, 4) * 15) + (Math.pow(value, 3) * 10)).toFixed(2));
};
exports.lerp_2 = lerp_2;
const get_average_1 = function (size, step) {
    const list = new Set();
    for (let i = 0; i < step - 1; i += 1) {
        const start_value = Math.round(size / (step - 1) * i);
        const end_value = Math.round(size / (step - 1) + size / (step - 1) * i);
        list.add(start_value);
        list.add(end_value);
    }
    return list;
};
exports.get_average_1 = get_average_1;
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
const box_center_world = function (thing) {
    //通过传入的object3D对象来返回当前模型的最小大小，值可以使一个mesh也可以使group
    const box = new THREE.Box3();
    box.expandByObject(thing);
    const mdlen = box.max.x - box.min.x;
    const mdwid = box.max.z - box.min.z;
    const mdhei = box.max.y - box.min.y;
    const centerpoint = new THREE.Vector3();
    const x1 = box.min.x + mdlen / 2;
    const y1 = box.min.y + mdhei / 2;
    const z1 = box.min.z + mdwid / 2;
    thing.position.set(-x1, 0, -z1);
    return thing;
};
exports.box_center_world = box_center_world;
const random_noise_1 = function (noise_size = 2) {
    let list = [];
    for (let i = 0; i < noise_size; i += 1) {
        list.push([Number(Math.random().toFixed(2)), i]);
    }
    return list;
};
exports.random_noise_1 = random_noise_1;
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
const random_noise_3 = function (noise_size = [2, 2, 2]) {
    let list = [];
    for (let i = 0; i < noise_size[0]; i += 1) {
        for (let j = 0; j < noise_size[1]; j += 1) {
            for (let z = 0; z < noise_size[2]; z += 1) {
                list.push([Number(Math.random().toFixed(2)), i, j, z]);
            }
        }
    }
    return list;
};
exports.random_noise_3 = random_noise_3;
const value_noise_1 = function (noise_size = 100, anchorPoint_count = 2, start_end_default_value = [0, 0], equalization_mode = 0, border_override_mode = 1) {
    anchorPoint_count = border_override_mode === 0 ? anchorPoint_count + 2 : anchorPoint_count;
    if (noise_size < anchorPoint_count) {
        throw new Error("锚点量超过生成长度");
    }
    let anchorPoint_list = new Set();
    if (equalization_mode === 0) {
        for (let i = 0; i < anchorPoint_count; i += 1) {
            let index = Math.floor(Math.random() * noise_size);
            do {
                if (!anchorPoint_list.has(index)) {
                    anchorPoint_list.add(index);
                    break;
                }
                else {
                    index = Math.floor(Math.random() * noise_size);
                }
            } while (true);
        }
    }
    else if (anchorPoint_count === 1) {
        anchorPoint_list.add(noise_size / 2 - 1);
    }
    else {
        anchorPoint_list = get_average_1(noise_size, anchorPoint_count);
        anchorPoint_list.delete(noise_size);
        anchorPoint_list.add(noise_size - 1);
    }
    if (border_override_mode === 0) {
        anchorPoint_list.delete(0);
        anchorPoint_list.delete(noise_size - 1);
    }
    let list = new Array(noise_size);
    list[0] = [start_end_default_value[0], 0];
    list[list.length - 1] = [start_end_default_value[1], list.length - 1];
    anchorPoint_list.forEach(index => {
        list[index] = [Math.random().toFixed(2), index, 1];
    });
    for (let i = 0; i < noise_size; i++) {
        if (list[i] === void 0) {
            const start = list.filter((item, index) => index < i).reverse()[0];
            const end = list.filter((item, index) => index > i)[0];
            const interpolation = Number(((i - start[1]) / (end[1] - start[1])).toFixed(2));
            list[i] = [lerp(start[0], end[0], interpolation), i, 0];
        }
    }
    return list;
};
exports.value_noise_1 = value_noise_1;
const value_noise_2 = function (anchorPoint_count = [3, 3], sizeingss = 10, type = "a") {
    // 单个块尺寸
    let itemSize = Math.ceil(sizeingss / anchorPoint_count[0]);
    // 添加锚点行列
    itemSize += 2;
    // 返回列表参数
    let list = [];
    // 噪音图渲染尺寸
    let mapsize = anchorPoint_count.map(item => item * (itemSize - 2));
    // 添加边界值处理锚点,即若传入1，1即分块横1竖1，即锚点行列为横2竖2，即n分块n+1锚点行列
    anchorPoint_count = [
        anchorPoint_count[0] + 1,
        anchorPoint_count[1] + 1
    ];
    // 添加锚点信息以及分配参数
    const anchorPoint_list = [];
    const anchorPoint_list_x = get_average_1(mapsize[0], anchorPoint_count[0]);
    const anchorPoint_list_y = get_average_1(mapsize[1], anchorPoint_count[1]);
    anchorPoint_list_x.forEach(itemI => {
        anchorPoint_list_y.forEach(itemJ => {
            anchorPoint_list.push([itemI, itemJ, Number(Math.random().toFixed(2))]);
        });
    });
    let block = [];
    anchorPoint_list.forEach(data => {
        const Y = get_near_2(anchorPoint_list
            .filter(item => item[0] > data[0] && item[1] === data[1]), [data[0], data[1]]);
        const X = get_near_2(anchorPoint_list
            .filter(item => item[0] === data[0] && item[1] > data[1]), [data[0], data[1]]);
        const XY = get_near_2(anchorPoint_list
            .filter(item => item[0] > data[0] && item[1] > data[1]), [data[0], data[1]]);
        if (X !== null && Y !== null && XY !== null) {
            block.push([data, X, Y, XY]);
        }
    });
    // 遍历块参数，生成块图
    block.forEach((blockItem) => {
        // 定义块锚点参数
        const anchorPoint_data_list = [];
        const anchorPoint_list = [
            [0, 0],
            [0, itemSize - 1],
            [itemSize - 1, 0],
            [itemSize - 1, itemSize - 1]
        ];
        anchorPoint_list.forEach((anchorPoint, index) => {
            anchorPoint_data_list.push([blockItem[index][2], anchorPoint[0], anchorPoint[1], 1]);
        });
        // 根据块锚点参数生成块内点参数
        let block_in_list = [];
        for (let i = 0; i < itemSize; i++) {
            for (let j = 0; j < itemSize; j++) {
                const anchorPoint = anchorPoint_data_list.find(item => item[1] === i && item[2] === j);
                if (anchorPoint) {
                    block_in_list[get_index_2_to_1([itemSize, itemSize], [i, j])] = anchorPoint;
                }
                else {
                    // 左上
                    const TL = get_near_2(anchorPoint_data_list.filter(item => item[1] <= i && item[2] <= j), [i, j]); //.map((item,index)=>index === 1 || index === 2 ? item + 1 : item);
                    // 左下
                    const BL = get_near_2(anchorPoint_data_list.filter(item => item[1] <= i && item[2] >= j), [i, j]); //.map((item,index)=>index === 1 || index === 2 ? item + 1 : item);
                    // 右上
                    const TR = get_near_2(anchorPoint_data_list.filter(item => item[1] >= i && item[2] <= j), [i, j]); //.map((item,index)=>index === 1 || index === 2 ? item + 1 : item);
                    // 右下
                    const BR = get_near_2(anchorPoint_data_list.filter(item => item[1] >= i && item[2] >= j), [i, j]); //.map((item,index)=>index === 1 || index === 2 ? item + 1 : item);
                    if (TL === null || BL === null || TR === null || BR === null) {
                        throw ("当前锚点或为0!");
                    }
                    // 上总长度
                    const TH = TR[1] - TL[1];
                    // 上左到点长度
                    const THN = i - TL[1];
                    // 上左到点比例
                    const TRO = THN === 0 || TH === 0 ? 0 : Number((THN / TH).toFixed(2));
                    // 上右到点比例
                    const TLO = 1 - TRO;
                    // 下总长度
                    const BH = BR[1] - BL[1];
                    // 下左到点长度
                    const BHN = i - BL[1];
                    // 下左到点比例
                    const BRO = BHN === 0 || BH === 0 ? 0 : Number((BHN / BH).toFixed(2));
                    // 下右到点比例
                    const BLO = 1 - BRO;
                    // 竖总长度
                    const CH = BL[2] - TL[2];
                    // 竖上到点长度
                    const CHN = j - TL[2];
                    // 竖上到点比例
                    const CBO = CHN === 0 || CH === 0 ? 0 : Number((CHN / CH).toFixed(2));
                    // 竖下到点比例
                    const CTO = 1 - CBO;
                    // 上左数值
                    const TLV = TL[0];
                    // 上右数值
                    const TRV = TR[0];
                    // 下左数值
                    const BLV = BL[0];
                    // 下右数值
                    const BRV = BR[0];
                    // A_竖总数值
                    const a_value = (TLV * TLO + TRV * TRO) * CTO + (BLV * BLO + BRV * BRO) * CBO;
                    // 上左到点比例
                    const TESTTLO = TRO;
                    // 上左数值
                    const TESTTLV = TLV;
                    // 上右数值
                    const TESTTRV = TRV;
                    // 上总数值
                    const TVALUE = Number((lerp_2(TESTTLO) * (TESTTRV - TESTTLV)).toFixed(2));
                    // 下左到点比例
                    const TESTBLO = BRO;
                    // 下左数值
                    const TESTBLV = BLV;
                    // 下右数值
                    const TESTBRV = BRV;
                    // 下总数值
                    const BVALUE = Number((lerp_2(TESTBLO) * (TESTBRV - TESTBLV)).toFixed(2));
                    // 竖上到点比例
                    const TESTCLO = CBO;
                    // 竖上数值
                    const TESTCLV = TVALUE;
                    // 竖下数值
                    const TESTCRV = BVALUE;
                    // B_竖总数值
                    const b_value = Number((lerp_2(TESTCLO) * (TESTCRV - TESTCLV)).toFixed(2));
                    // 上左到点比例
                    const TESTB_TLO = TRO;
                    // 上左数值
                    const TESTB_TLV = TLV;
                    // 上右数值
                    const TESTB_TRV = TRV;
                    const TESTB_A = lerp_2(TESTB_TLO);
                    const TESTB_B = Number((1 - lerp_2(TESTB_TLO)).toFixed(2));
                    // 下左到点比例
                    const TESTB_BLO = BRO;
                    // 下左数值
                    const TESTB_BLV = BLV;
                    // 下右数值
                    const TESTB_BRV = BRV;
                    const TESTB_C = lerp_2(TESTB_BLO);
                    const TESTB_D = Number((1 - lerp_2(TESTB_BLO)).toFixed(2));
                    // 竖上到点比例
                    const TESTB_CTO = CBO;
                    const TESTB_CTV = Number((TLV * TESTB_B + TRV * TESTB_A).toFixed(2));
                    const TESTB_CBV = Number((BLV * TESTB_D + BRV * TESTB_C).toFixed(2));
                    const TESTB_E = lerp_2(TESTB_CTO);
                    const TESTB_F = Number((1 - lerp_2(TESTB_CTO)).toFixed(2));
                    // C_竖总数值
                    const c_value = Number((TESTB_CTV * TESTB_F + TESTB_CBV * TESTB_E).toFixed(2));
                    let itemValue = 0;
                    if (type === "a") {
                        itemValue = Number(Math.abs(a_value));
                    }
                    else if (type === "b") {
                        itemValue = Number(Math.abs(b_value));
                    }
                    else if (type === "c") {
                        itemValue = Number(Math.abs(c_value));
                    }
                    block_in_list[get_index_2_to_1([itemSize, itemSize], [i, j])] = [itemValue, i, j, 0];
                }
            }
        }
        // 清洗块参数
        block_in_list = block_in_list.filter(item => anchorPoint_data_list.findIndex(it => it[1] === item[1] || it[2] === item[2]) < 0);
        block_in_list = block_in_list.map(item => [item[0], item[1] - 1, item[2] - 1, item[3]]);
        // 修正点索引值
        block_in_list = block_in_list.map(item => [item[0], item[1] + blockItem[0][0], item[2] + blockItem[0][1], item[3]]);
        list.push(block_in_list);
    });
    // 清洗整体参数
    let finish_list = list.flat(1);
    finish_list = finish_list.filter((item) => item[1] < sizeingss && item[2] < sizeingss);
    return finish_list;
};
exports.value_noise_2 = value_noise_2;
const value_noise_3 = function (anchorPoint_count = [2, 2, 2], sizeingss = 10) {
    let number = [10, 10, 10];
    number = number.map(item => item + 1);
    const list = [];
    for (let i = 0; i <= number[0]; i++) {
        for (let j = 0; j <= number[1]; j++) {
            for (let z = 0; z <= number[2]; z++) {
                list.push([1, i, j, z]);
            }
        }
    }
    function checkAnchorPoint_3(list) {
        const returnList = [[], []];
        list.forEach((item) => {
            if (((item[1] === 0 && item[2] === 0 && item[3] === 0) ||
                (item[1] === number[0] && item[2] === 0 && item[3] === 0) ||
                (item[1] === 0 && item[2] === number[1] && item[3] === 0) ||
                (item[1] === 0 && item[2] === 0 && item[3] === number[2]) ||
                (item[1] === 0 && item[2] === number[1] && item[3] === number[2]) ||
                (item[1] === number[0] && item[2] === 0 && item[3] === number[2]) ||
                (item[1] === number[0] && item[2] === number[1] && item[3] === 0) ||
                (item[1] === number[0] && item[2] === number[1] && item[3] === number[2]))) {
                returnList[0].push(item);
            }
            else {
                returnList[1].push(item);
            }
        });
        return returnList;
    }
    const [anchorPoint_list, normal_list] = [...checkAnchorPoint_3(list)];
    anchorPoint_list.forEach(item => {
        item[0] = Math.random();
    });
    // console.info(normal_list[0])
    // console.info(anchorPoint_list)
    // [x,y,z]
    // [xn,yn,zn]
    //  x [yn,zn] 
    //  y [xn,zn] 
    //  z [xn,yn] 
    // [1,0,0,1]
    //  x [yn,zn] 
    //  x [yn,zn] 
    // [0, 0, 0]
    // [0, 0, 11]
    // [0, 11, 0]
    // [0, 11, 11]
    // [11, 0, 0]
    // [11, 0, 11]
    // [11, 11, 0]
    // [11, 11, 11]
    const zxcqwe = [
        anchorPoint_list.filter(item => item[1] === 0),
        anchorPoint_list.filter(item => item[1] === 0),
        anchorPoint_list.filter(item => item[1] === 11)
    ];
    const asdqwe = [
        anchorPoint_list.filter(item => item[2] === 0),
        anchorPoint_list.filter(item => item[2] === 11)
    ];
    const qweqwe = [
        anchorPoint_list.filter(item => item[3] === 0),
        anchorPoint_list.filter(item => item[3] === 11)
    ];
    console.info(zxcqwe);
    console.info(asdqwe);
    console.info(qweqwe);
    normal_list.forEach(item => {
        item[0] = .2;
    });
    return list;
};
const createFloor_1 = function (floor_Scale = [1, 2], floor_size = [1, 1, 1]) {
    const floor_1_group = new THREE.Group();
    const list_1 = [
        // 1维 value_noise_不均衡_不覆盖
        [floor_size, value_noise_1(40, 10, [.4, .4], 0, 0), floor_1_group, floor_Scale, 0, 0],
        // 1维 value_noise_不均衡_覆盖
        [floor_size, value_noise_1(40, 10, [.4, .4], 0, 1), floor_1_group, floor_Scale, 10, 60],
        // 1维 value_noise_均衡_不覆盖
        [floor_size, value_noise_1(40, 10, [.4, .4], 1, 0), floor_1_group, floor_Scale, 20, 120],
        // 1维 value_noise_均衡_覆盖
        [floor_size, value_noise_1(40, 10, [.4, .4], 1, 1), floor_1_group, floor_Scale, 30, 180],
        // 1维 value_noise_全随机算法
        [floor_size, value_noise_1(40, 40), floor_1_group, floor_Scale, 40],
        // 1维 全随机算法
        [floor_size, random_noise_1(40), floor_1_group, floor_Scale, 50],
    ];
    list_1.forEach(item => {
        render_1_block(item);
    });
    const thing_1 = box_center_world(floor_1_group);
    return thing_1;
};
exports.createFloor_1 = createFloor_1;
const createFloor_2 = function (floor_Scale = [1, 2], floor_size = [1, 1, 1]) {
    const floor_2_group = new THREE.Group();
    const list_2 = [
        // 2维 全随机算法
        [floor_size, random_noise_2([20, 20]), floor_2_group, floor_Scale, 0],
        // // 2维 y=6x^5-15x^4+10x^3_插值_单边计算
        [floor_size, value_noise_2([4, 4], 20, "b"), floor_2_group, floor_Scale, 30],
        // // 2维 value_noise算法_线性插值
        [floor_size, value_noise_2([16, 16], 20, "a"), floor_2_group, floor_Scale, 60],
        // // 2维 value_noise算法_y=6x^5-15x^4+10x^3_插值
        [floor_size, value_noise_2([16, 16], 20, "c"), floor_2_group, floor_Scale, 90],
    ];
    list_2.forEach(item => {
        render_2_block(item);
    });
    const thing_2 = box_center_world(floor_2_group);
    return thing_2;
};
exports.createFloor_2 = createFloor_2;
const createFloor_3 = function (floor_Scale = [1, 2], floor_size = [1, 1, 1]) {
    const floor_3_group = new THREE.Group();
    const list_3 = [
        // 3维 全随机算法
        // [ floor_size, random_noise_3([20,20,20]), floor_3_group, floor_Scale, 0],
        // 3维 非全随机算法
        [floor_size, value_noise_3(), floor_3_group, floor_Scale, 40],
    ];
    list_3.forEach(item => {
        render_3_block(item);
    });
    const thing_3 = box_center_world(floor_3_group);
    return thing_3;
};
exports.createFloor_3 = createFloor_3;
const render_1_block = function ([unit_size = [1, 1, 1], list = [], group, unit_scale = [1, 2], offset = 0, anchorPointColor = 0, axis = "x"]) {
    const axis_list = ["x", "z"];
    const axis_index = axis_list.findIndex(item => item === axis);
    const position_value = [offset, offset, offset];
    const geometry = new THREE.BoxGeometry(...unit_size);
    list.forEach(item => {
        let coefficient = item[0];
        const scale_Coefficient = Number((coefficient * (unit_scale[1] - unit_scale[0]) + unit_scale[0]).toFixed(1));
        const y_axis = unit_size[1] * scale_Coefficient / 2;
        const color = item[2] === 1 ? new THREE.Color(`hsl(${anchorPointColor}, 100%, 50%)`) : new THREE.Color(`hsl(0, 0%, ${item[0] * 100}%)`);
        const material = new THREE.MeshStandardMaterial({ color });
        const cube = new THREE.Mesh(geometry, material);
        cube.scale.y = scale_Coefficient;
        position_value[1] = y_axis;
        position_value[axis_index] = item[1];
        cube.position.set(...position_value);
        group.add(cube);
    });
};
exports.render_1_block = render_1_block;
const render_2_block = function ([unit_size = [1, 1, 1], list = [], group, unit_scale = [1, 2], offset = 0,]) {
    let position_value = [0, 0, 0];
    const geometry = new THREE.BoxGeometry(...unit_size);
    list.forEach(item => {
        let coefficient = item[0];
        const scale_Coefficient = Number((coefficient * (unit_scale[1] - unit_scale[0]) + unit_scale[0]).toFixed(1));
        const y_axis = unit_size[1] * scale_Coefficient / 2;
        let color = item[3] === 1 ?
            new THREE.Color(`hsl(0, 0%, ${item[0] * 100}%)`) :
            new THREE.Color(`hsl(0, 0%, ${item[0] * 100}%)`);
        const material = new THREE.MeshStandardMaterial({ color });
        const cube = new THREE.Mesh(geometry, material);
        cube.scale.y = scale_Coefficient;
        position_value[0] = item[1];
        position_value[1] = y_axis;
        position_value[2] = item[2] + offset;
        cube.position.set(...position_value);
        group.add(cube);
    });
};
exports.render_2_block = render_2_block;
const render_3_block = function ([unit_size = [1, 1, 1], list = [], group, unit_scale = [1, 2], offset = 0,]) {
    const geometry = new THREE.BoxGeometry(...unit_size);
    list.forEach(item => {
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
// function value_noise_3(mapsize=[10,10,10], b = [2,3,4]){
//   let list = [];
//   // 添加锚点信息以及分配参数
//   const anchorPoint_list: [] | [number,number,number] = [];
//   const anchorPoint_list_x = get_average_1(mapsize[0], b[0])
//   const anchorPoint_list_y = get_average_1(mapsize[1], b[1])
//   const anchorPoint_list_z = get_average_1(mapsize[2], b[2])
//   anchorPoint_list_x.forEach(itemI=>{
//     anchorPoint_list_y.forEach(itemJ=>{
//       anchorPoint_list_z.forEach(itemZ=>{
//         anchorPoint_list.push([itemI,itemJ,itemZ,Number(Math.random().toFixed(2))]);
//       })
//     })
//   })
//   // console.info(anchorPoint_list_x)
//   // console.info(anchorPoint_list_y)
//   // console.info(anchorPoint_list_z)
//   // console.info(anchorPoint_list)
//   // 根据锚点信息生成块参数
//   let block = anchorPoint_list.map(data => {
//     const Y = get_near_2(anchorPoint_list
//       .filter(item => item[0] > data[0] && item[1] === data[1]), data)
//     const X = get_near_2(anchorPoint_list
//       .filter(item => item[0] === data[0] && item[1] > data[1]), data)
//     const XY = get_near_2(anchorPoint_list
//       .filter(item => item[0] > data[0] && item[1] > data[1]), data)
//     if(X !== null && Y !== null && XY !== null){
//       return [ data, X, Y, XY ]        
//     }
//     else{
//       return null;
//     }
//   }).filter(item => item !== null);
//   console.info(block);
//   list = random_noise_3([10,10,10]);
//   return list;
// }
