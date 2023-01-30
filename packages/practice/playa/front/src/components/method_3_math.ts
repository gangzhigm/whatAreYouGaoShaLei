/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-17 16:17:11
 * @FilePath: \playa\front\src\components\utils.ts
 * @Description: 实现方法组
 */
import * as THREE from "three"
import * as INTERFACE_D from "../dts/interface_d";
import * as TYPE_D from "../dts/type_d";
  
const random_noise_3:INTERFACE_D.random_noise_3 = function (noise_size=[2,2,2]){
    let list:[number, number, number, number][] = [];
    for(let i = 0; i < noise_size[0]; i+=1){
      for(let j = 0; j < noise_size[1]; j+=1){
        for(let z = 0; z < noise_size[2]; z+=1){
            list.push([Number(Math.random().toFixed(2)),i,j,z])
        }
      }
    }
    return list
}







const sin_random_noise_3 = function(len=[20,20,20], subblock=[2,2,2], type=0){

  let list = [];

  const min_Len = 1


  // 每块x向尺寸
  const subblock_LenX = len[0] / subblock[0] > min_Len ? Math.ceil(len[0] / subblock[0]) : min_Len;
  // 每块y向尺寸
  const subblock_LenY = len[1] / subblock[1] > min_Len ? Math.ceil(len[1] / subblock[1]) : min_Len;
  // 每块z向尺寸
  const subblock_LenZ = len[2] / subblock[2] > min_Len ? Math.ceil(len[2] / subblock[2]) : min_Len;
  
  // 总块数
  const block_num = subblock.reduce((a,b)=>a*b);
  
  // 各方向当前遍历块数[x,y,z]
  const curr_coordinates_number = [0,0,0]
  // 各方向总块数[x,y,z]
  const all_coordinates_number = Array.from(subblock)


  // 每块x向步进数
  const subblock_numberX = Math.floor(subblock_LenX / (len[0] / subblock[0]));
  // 每块y向步进数
  const subblock_numberY = Math.floor(subblock_LenY / (len[1] / subblock[1]));
  // 每块y向步进数
  const subblock_numberZ = Math.floor(subblock_LenY / (len[2] / subblock[2]));

  // 初始化上下左右四角基础量
  let [TLD,TRD,BLD,BRD,TLU,TRU,BLU,BRU] = [Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random(),Math.random()];
  

  for(let b = 0; b < block_num; b++){



    console.info(b);
    console.info(b);
    console.info(b);

    let subblock = [];

    for(let x = 0;x<subblock_LenX;x++){
      console.info(x)
    }



    // for(let x = 0;x<subblock_LenX;x++){
    //   for(let y = 0;y<subblock_LenY;y++){
    //     for(let z = 0;z<subblock_LenZ;z++){
        
    //       // 生成x方向的长度比例
    //       const prop_x = x === 0 ? 0 : (x + 1) / subblock_LenX;
    //       // 生成y方向的长度比例
    //       const prop_y = y === 0 ? 0 : (y + 1) / subblock_LenY;
    //       // 生成z方向的长度比例
    //       const prop_z = z === 0 ? 0 : (z + 1) / subblock_LenZ;


    //       // 生成x方向的缓动比例
    //       const prop_x_smoothstep = smoothstep(prop_x, 0, 1) 
    //       // 生成y方向的缓动比例
    //       const prop_y_smoothstep = smoothstep(prop_y, 0, 1) 
    //       // 生成z方向的缓动比例
    //       const prop_z_smoothstep = smoothstep(prop_z, 0, 1) 

    //       // 获取x方向2边界的缓动方案2长度比例 
    //       const prop_x_smoothstep_2 = smoothstep_2(prop_x) 
    //       // 获取y方向2边界的缓动方案2长度比例 
    //       const prop_y_smoothstep_2 = smoothstep_2(prop_y) 
    //       // 获取z方向2边界的缓动方案2长度比例 
    //       const prop_z_smoothstep_2 = smoothstep_2(prop_z) 



    //     // 获取d层x方向2边界的长度比例值
    //     const value_tbd = [lerp(TLD,TRD,prop_x),lerp(BLD,BRD,prop_x)];
    //     // // 获取d层x方向2边界的缓动长度比例值
    //     const value_tbd_smoothstep = [lerp(TLD,TRD,prop_x_smoothstep),lerp(BLD,BRD,prop_x_smoothstep)];
    //     // // 获取d层x方向2边界的缓动长度比例值
    //     const value_tbd_smoothstep_2 = [lerp(TLD,TRD,prop_x_smoothstep_2),lerp(BLD,BRD,prop_x_smoothstep_2)];

    //     // 获取u层x方向2边界的长度比例值
    //     const value_tbu = [lerp(TLU,TRU,prop_x),lerp(BLU,BRU,prop_x)];
    //     // // 获取u层x方向2边界的缓动长度比例值
    //     const value_tbu_smoothstep = [lerp(TLU,TRU,prop_x_smoothstep),lerp(BLU,BRU,prop_x_smoothstep)];
    //     // // 获取u层x方向2边界的缓动长度比例值
    //     const value_tbu_smoothstep_2 = [lerp(TLU,TRU,prop_x_smoothstep_2),lerp(BLU,BRU,prop_x_smoothstep_2)];


    //     // 获取当前点du层的长度比例值
    //     const value_du_len = [ 
    //       lerp(value_tbd[0],value_tbd[1],prop_y), 
    //       lerp(value_tbu[0],value_tbu[1],prop_y) 
    //     ];
    //     // 获取当前点du层的缓动比例值
    //     const value_du_smoothstep = [
    //       lerp(value_tbd_smoothstep[0],value_tbd_smoothstep[1],prop_y_smoothstep),
    //       lerp(value_tbu_smoothstep[0],value_tbu_smoothstep[1],prop_y_smoothstep)
    //     ];
    //     // 获取当前点u层的缓动2比例值
    //     const value_u_smoothstep_2 = [
    //       lerp(value_tbd_smoothstep_2[0],value_tbd_smoothstep_2[1],prop_y_smoothstep_2),
    //       lerp(value_tbu_smoothstep_2[0],value_tbu_smoothstep_2[1],prop_y_smoothstep_2)
    //     ];
        

    //     // 获取当前点d层的长度比例值
    //     const value_len = lerp(value_du_len[0],value_du_len[1],prop_z);
    //     // 获取当前点d层的缓动比例值
    //     const value_smoothstep = lerp(value_du_smoothstep[0],value_du_smoothstep[1],prop_z_smoothstep);
    //     // 获取当前点d层的缓动2比例值
    //     const value_smoothstep_2 = lerp(value_u_smoothstep_2[0],value_u_smoothstep_2[1],prop_z_smoothstep_2);


    //     let value = null;
    //     if(type === 0){
    //       value = Math.random();
    //     }
    //     else if(type === 1){
    //       value = value_len;
    //     }
    //     else if(type === 2){
    //       value = value_smoothstep;
    //     }
    //     else if(type === 3){
    //       value = value_smoothstep_2;
    //     }

    //     subblock.push(
    //       {
    //         v:value,
    //         x:subblock_LenX * curr_coordinates_number[0] + x,
    //         y:subblock_LenY * curr_coordinates_number[1] + y,
    //         z:subblock_LenZ * curr_coordinates_number[2] + z
    //       }
    //     )
    //     }
    //   }
    // }

    // list.push(subblock)

    // if((curr_coordinates_number[0] + 1) >= all_coordinates_number[0]){
    //   // const TopOne  = list[list.length - all_coordinates_number[0]];
    //   // TL = TopOne[subblock_LenX-1].v; // BL
    //   // TR = TopOne[TopOne.length-1].v; // BR
    //   // BL = Math.random();
    //   // BR = Math.random();
    //   curr_coordinates_number[0] = 0
    //   curr_coordinates_number[1] += 1;
    // }
    // else if(curr_coordinates_number[1] === 0){
    //   // TL = TR;
    //   // BL = BR;
    //   // TR = Math.random();
    //   // BR = Math.random();
    //   curr_coordinates_number[0] += 1;
    // }
    // else{
    //   const TopOne  = list[list.length - all_coordinates_number[0]];
    //   // TL = TR;
    //   // BL = BR;
    //   // TR = TopOne[TopOne.length - 1].v;
    //   // BR = Math.random();
    //   curr_coordinates_number[0] += 1;
    // }

  }
  // list = list.flat().flat().map(({v,x,y,z})=>[v,x,y,z])

  return list;
}






// 获取分段参数
function getStep(l:any,t:any){

  let Len_List = [];
  let Step_List:any = [];
  if(Array.isArray(l) && Array.isArray(t)){
    Len_List = l;
    Step_List = t;
  }
  else if(Array.isArray(l) || Array.isArray(t)){
    throw("参数不匹配")
  }
  else{
    Len_List = [l];
    Step_List = [t];
  }

  let Block_List = Len_List.map((item,index)=>{
    let list = []
    for(let x = 0; x <= Step_List[index]; x++){
      list.push(x * item / Step_List[index]);
    }
    return [list, item, Step_List[index], item / Step_List[index]];
  })

  // 总点数
  const A_number = t.reduce((a,b)=>a*b);
  const B_number = t.reduce((a,b)=>(a+1)*(b+1));
  // 各行总点数统计
  let Block_List_A = Block_List.map(item=>item[1]);
  // 各行总分隔数
  let Block_List_B = Block_List.map(item=>item[0]);
  


  let array = [
    [{
      v: get_dot_after(random( Math.random() * 100, 100, 100, 100)),
      x: 0,
      y: 0
    },
    {
      v: get_dot_after(random( Math.random() * 100, 100, 100, 100)),
      x: 1,
      y: 0
    }],
    [{
      v: get_dot_after(random( Math.random() * 100, 100, 100, 100)),
      x: 0,
      y: 1
    },
    {
      v: get_dot_after(random( Math.random() * 100, 100, 100, 100)),
      x: 1,
      y: 1
    }]
  ]

  return array
}

// 获取sin源参数
function random(a=1,b=1,c=1,d=0){
  return Math.sin(a * b) * c + d;
}

// 获取小数部分
function get_dot_after(number:any){
  return isNaN(Number(`0.${number.toString().split(".")[1]}`)) ? 0 : Number(`0.${number.toString().split(".")[1]}`);
}

// 生成缓动比例
function smoothstep(x:any,a:any,b:any){
  if(x < a) return 0;
  if(x > b) return 1;

  const t = ( x - a ) / ( b - a );
  const c = 3 * x * x - 2 * x * x * x
  return c;
}

// 线性插值
function lerp(a:any,b:any,t:any){
  return (b * t) + (a * (1 - t));
}


// 生成缓动比例2
function smoothstep_2(len){
  return (Math.pow(len,5) * 6) - (Math.pow(len,4) * 15) + (Math.pow(len,3) * 10);
}


























































export { 
  random_noise_3,
  sin_random_noise_3
}