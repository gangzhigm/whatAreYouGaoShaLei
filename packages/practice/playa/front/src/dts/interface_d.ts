/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-06 15:54:39
 * @FilePath: \playa\front\src\components\utils_d.ts
 * @Description: 对应utils.ts的解释文件
 */
import * as THREE from "three"
import * as TYPE from "./type_d"

/**
 * @description: 创建THREE的Camera方法 
 * @param aspect: 相机的宽高比例
 * @param orthographic_camera_size: 相机的四方向可视长度
 * @param Scene_Size: 场景的尺寸
 * @return Camera: 返回THREE的Camera对象
 */
interface createCamera {
    (
        aspect?:TYPE.Aspect,
        orthographic_camera_size?:TYPE.Orthographic_Camera_Size, 
        Scene_Size?:TYPE.Scene_Size
    )
    :THREE.Camera;
}

/**
 * @description: 创建THREE的天空盒方法 
 * @param Scene_Size: 场景的尺寸
 * @return Mesh: 返回THREE的Mesh对象
 */
interface createSkyBox {
    (
        Scene_Size?:TYPE.Scene_Size
    )
    :THREE.Mesh;
}

/**
 * @description: 计算线性插值 10分比例
 * @param start: 起始点值
 * @param end: 结束点值
 * @param interpolation: 当前点比例值
 * @return number: 返回当前点值
 */
interface lerp {
    (
        start:number,
        end:number,
        interpolation:number
    )
    :number;
}

/**
 * @description: 计算线性插值 y = 6x^5 - 15x^4 + 10x^3 比例
 * @param value: 当前点比例
 * @return number: 返回当前点值
 */
interface lerp_2 {
    (
        value:number,
    )
    :number;
}

/**
 * @description: 一维尺寸均分长度
 * @param size: 总长度
 * @param step: 分段点数
 * @return Set number: 返回不重复的分段点值
 */
interface get_average_1 {
    (
        size:number,
        step:number
    )
    :Set<number>;
}

/**
 * @description: 二维塌缩至一维数列对应索引,即第二行的第三个为从上到下,从左到右数的第几个
 * @param size: [行数,列数]
 * @param index: [当前行数,当前列数]
 * @return number: 对应的索引数
 */
interface get_index_2_to_1 {
    (
        size:TYPE.Number_Array_2, 
        index:TYPE.Number_Array_2
    )
    :number;
}

/**
 * @description: 获取16进制的随机颜色
 * @return string: 对应的16进制的随机颜色,即 #XXXXXX
 */
interface getColor_16 {
    ():string;
}

/**
 * @description: 生成全随机一阶噪音的方法
 * @param noise_size: 一维长度的尺寸
 * @return array: [当前点对应的数值,当前点索引]
 */
interface random_noise_1 {
    (
        noise_size?:number
    )
    : TYPE.Number_Array_2[];
}

/**
 * @description: 生成全随机二阶噪音的方法
 * @param noise_size: 二维长度的尺寸 [行,列]
 * @return array: [当前点对应的数值,当前点行索引,当前点列索引]
 */
interface random_noise_2 {
    (
        noise_size?:TYPE.Number_Array_2
    )
    : TYPE.Number_Array_3[];
}

/**
 * @description: 生成全随机三阶噪音的方法
 * @param noise_size: 三维长度的尺寸 [X,Y,Z]
 * @return array: [当前点对应的数值,当前点X索引,当前点Y索引,当前点Z索引]
 */
interface random_noise_3 {
    (
        noise_size?:TYPE.Number_Array_3
    )
    : TYPE.Number_Array_4[];
}

/**
 * @description: 生成Value一阶噪音的方法
 * @param noise_size: 一维长度的尺寸
 * @param anchorPoint_count: 分段锚点的数量
 * @param start_end_default_value: 始终点默认值 [起始点值，结束点值] （0-1）
 * @param equalization_mode: 锚点均衡模式 [0:不均衡， 1:均衡] 不均衡即锚点随机,均衡即锚点平均分布 
 * @param border_override_mode: 始终点覆盖模式 [0:不覆盖， 1:覆盖] 不覆盖即始终点采用默认值, 覆盖即始终点为锚点
 * @return array: [当前点对应的数值,当前点索引, 0: 非锚点 | 1: 锚点]
 */
interface value_noise_1 {
    (
        noise_size?:number, 
        anchorPoint_count?:number, 
        start_end_default_value?:TYPE.Number_Array_2, 
        equalization_mode?:TYPE.Zero_or_One, 
        border_override_mode?:TYPE.Zero_or_One
    )
    : [number, number, TYPE.Zero_or_One][];
}

/**
 * @description: 创建一维长度组的方法 
 * @param TYPE.Render_Item_1: 一维数据对象 type TYPE.Render_Item_1
 * @return void
 */
interface render_1_block_fn {
    (arg0: TYPE.Render_Item_1):void;
}

/**
 * @description: 创建二维长度组的方法 
 * @param TYPE.Render_Item_2: 二维数据对象 type TYPE.Render_Item_2
 * @return void
 */
interface render_2_line_fn {
    (arg0: TYPE.Render_Item_2):void;
} 

/**
 * @description: 创建窗口环境,即生成Canvas对象
 * @param id_class_name: 生成的Canvas对象的className和Id
 * @return Canvas: Dom的Canvas对象
 */
interface createCanvas {
    (
        id_class_name?:string 
    )
    : HTMLCanvasElement;
}

/**
 * @description: 创建窗口环境,即生成THREE的Renderer对象
 * @param canvas: 用于生成的Canvas对象
 * @return Renderer: THREE的渲染窗口
 */
interface createRenderer {
    (
        canvas:HTMLCanvasElement 
    )
    : THREE.Renderer;
}

/**
 * @description: 创建组对象
 * @param floor_Scale: 本组值缩放比例 [最小值,最大值] 
 * @param floor_size: 本组尺寸 [X长度,Y长度,Z长度] 
 * @return MEsh | Group: THREE的MEsh或Group
 */
interface createFloor_1 {
    (
        floor_Scale?:TYPE.Number_Array_2,
        floor_size?:TYPE.Number_Array_3
    )
    :THREE.Group | THREE.Mesh;
} 

/**
 * @description: 创建组对象
 * @param floor_Scale: 本组值缩放比例 [最小值,最大值] 
 * @param floor_size: 本组尺寸 [X长度,Y长度,Z长度] 
 * @return MEsh | Group: THREE的MEsh或Group
 */
interface createFloor_2 {
    (
        floor_Scale?:TYPE.Number_Array_2,
        floor_size?:TYPE.Number_Array_3
    )
    :THREE.Group | THREE.Mesh;
} 

/**
 * @description: THREE的Mesh或Group对齐世界中心
 * @param thing: THREE的MEsh或Group
 * @return MEsh | Group: THREE的MEsh或Group
 */
interface box_center_world {
    (
        thing:THREE.Group | THREE.Mesh
    )
    :THREE.Group | THREE.Mesh;
}

/**
 * @description: 在二维中寻找到列表中距离当前坐标最近的坐标
 * @param list: 二维坐标点,携带当前坐标值 [X,Y,Value]
 * @param curr_index: 当前坐标点 [X, Y]
 * @return ARRAY | Null: 返回坐标点或没有找到坐标点
 */
interface get_near_2 {
    (
      list:number[][],
      curr_index:[
        i:number,
        j:number
      ]
    ) 
    : number[] | null;
}
    
/**
 * @description: 生成Value二阶噪音的方法
 * @param anchorPoint_count: 分段锚点的数量
 * @param sizeingss: 二维长度的尺寸,即 sizeingss * sizeingss
 * @param type: 计算模式 a | b | c   :    插值_单边计算 |  线性插值 | 插值
 * @return array: [当前点对应的数值,当前点X索引,当前点Y索引, 0: 非锚点 | 1: 锚点]
 */
interface value_noise_2 {
    (
        anchorPoint_count:[number,number], 
        sizeingss:number, 
        type: TYPE.ABC
    )
    : [number, number, number, number][];
}

/**
 * @description: 生成Value三阶噪音的方法
 * @param anchorPoint_count: 分段锚点的数量
 * @param sizeingss: 二维长度的尺寸,即 sizeingss * sizeingss
 * @param type: 计算模式 a | b | c   :    插值_单边计算 |  线性插值 | 插值
 * @return array: [当前点对应的数值,当前点X索引,当前点Y索引, 0: 非锚点 | 1: 锚点]
 */
interface value_noise_3 {
    (
        anchorPoint_count:[number,number], 
        sizeingss:number, 
        type: TYPE.ABC
    )
    : [number, number, number, number][];
}









export type { 
    createSkyBox, 
    createCanvas,
    createCamera, 
    createRenderer,

    lerp, 
    lerp_2,
    
    box_center_world, 
    
    get_index_2_to_1,

    get_near_2,
    
    getColor_16,

    get_average_1, 

    createFloor_1,
    createFloor_2,

    render_1_block_fn,
    render_2_line_fn,
    
    value_noise_1, 
    value_noise_2, 
    value_noise_3,

    random_noise_1, 
    random_noise_2, 
    random_noise_3, 
}