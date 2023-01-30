/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-05 16:52:35
 * @FilePath: \playa\front\src\components\utils_d.ts
 * @Description: 对应utils.ts的解释文件
 */
import * as THREE from "three"


/**
 * @description: 相机的宽高比例
 * @param aspect: 相机的宽高比例
 */
type Aspect = number;

/**
 * @description: 场景的尺寸
 * @param Scene_Size: 场景的尺寸
 */
type Scene_Size = number;

/**
 * @description: "a"|"b"|"c"
 * @param ABC: "a"|"b"|"c"
 */
type ABC = "a"|"b"|"c";

/**
 * @description: 0 或 1
 * @param Zero_or_One: 0 或 1
 */
type Zero_or_One = 0 | 1;

/**
 * @description: 一维数组
 * @param Number_Array_1: 一维数组
 */
type Number_Array_1 = [number];

/**
 * @description: 二维数组
 * @param Number_Array_2: 二维数组
 */
type Number_Array_2 = [number, number];

/**
 * @description: 三维数组
 * @param Number_Array_3: 三维数组
 */
type Number_Array_3 = [number, number, number];

/**
 * @description: 四维数组
 * @param Number_Array_4: 四维数组
 */
type Number_Array_4 = [number, number, number, number];

/**
 * @description: 相机的四方向可视长度
 * @param Orthographic_Camera_Size: 相机的四方向可视长度
 */
type Orthographic_Camera_Size = Number_Array_4; 

/**
 * @description: 一维数据对象,用于创建一维长度组
 * @param unit_size: 单个点尺寸 [X长度,Y长度,Z长度] 
 * @param list: 数据组 [当前点值,当前点索引,当前是否是锚点(可能不存在)]列表 
 * @param group: 待注入的THREE的Group对象 
 * @param unit_scale: 单个点值缩放比例 [最小值,最大值] 
 * @param offset: 当前列的偏离量 
 * @param anchorPointColor: 锚点的颜色 HSL模式,控制H值 
 * @param axis: 偏移方向,用于偏移量的计算
 */
type Render_Item_1 = [
    unit_size:Number_Array_3,
    list:[number,number,number?][],
    group:THREE.Group,
    unit_scale:Number_Array_2,
    offset?:number,
    anchorPointColor?:number,
    axis?:"x" | "z"
]

/**
 * @description: 二维数据对象,用于创建二维长度组
 * @param unit_size: 单个点尺寸 [X长度,Y长度,Z长度] 
 * @param list: 数据组 [当前点值,当前点行索引,当前点列索引,当前是否是锚点(可能不存在)]列表 
 * @param group: 待注入的THREE的Group对象 
 * @param unit_scale: 单个点值缩放比例 [最小值,最大值] 
 * @param offset: 当前列的偏离量 
 */
type Render_Item_2 = [
    unit_size:Number_Array_3,
    list:[number,number,number,number?][],
    group:THREE.Group,
    unit_scale:Number_Array_2,
    offset?:number
]

export type { 
    
    ABC,
    
    Aspect,
    
    Scene_Size,
    
    Zero_or_One,
    
    Number_Array_1,
    Number_Array_2,
    Number_Array_3,
    Number_Array_4,

    Render_Item_1,
    Render_Item_2,
    
    Orthographic_Camera_Size,
}