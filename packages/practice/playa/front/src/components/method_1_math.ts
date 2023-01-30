/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-12 16:31:00
 * @FilePath: \playa\front\src\components\utils.ts
 * @Description: 实现方法组
 */
import * as THREE from "three"

import * as TYPE_D from "../dts/type_d";
import * as INTERFACE_D from "../dts/interface_d";
  
import * as Lib from "./method_lib";
import { smootherstep } from "three/src/math/MathUtils";



const random_noise_1:INTERFACE_D.random_noise_1 = function (noise_size=2){
  let list:[number,number][] = [];
  for(let i = 0; i < noise_size; i+=1){
      list.push([Number(Math.random().toFixed(2)),i])
  }
  return list
}





const sin_random_noise_1_1 = function (len=100, anchorPont=10, type=1){


  let list = [];

  if(type === 0){
    for(let i = 0; i < len; i+=1){
      const value = get_dot_after(random( i/10, 100, 100, 100));
      list.push([value,i]);
    }
  }


  else {
    const stepList = getStep(len,anchorPont);
    
    const d = stepList.map((item:any)=>{
      // 起始点参数
      const value_start = item[0].v;
      // 结束点参数
      const value_ended = item[1].v;
      // 起始点索引
      const index_start = item[0].x;
      // 结束点索引
      const index_ended = item[1].x;
      // 片段长度
      const step = item[1].x - item[0].x;
      // 遍历长度
      const len = step * 10; 
      const list = [];
      for(let x = 0; x <= len; x++){
          
        // 长度比例
        const prop_a = x / len;

        // 缓动插值比例
        // const prop_b = THREE.MathUtils.smoothstep(prop_a, 0, 1) 
        const prop_b = smoothstep(prop_a, 0, 1) 

        if(type === 1){
          list.push(
            {
              // v: THREE.MathUtils.lerp(value_start,value_ended,prop_a),
              v: lerp(value_start,value_ended,prop_a),
              x: index_start + step * prop_a
            }
          )
        }
        else if(type === 2){
          list.push(
            {
              // v: THREE.MathUtils.lerp(value_start,value_ended,prop_b),
              v: lerp(value_start,value_ended,prop_b),
              x: index_start + step * prop_a
            }
          )
        }
        
      }
      return list
    }).flat(1);

    list = d
      .filter((item:any)=>item.x % 1 === 0)
      .map((item:any)=>[item.v,item.x])
    
  }
  
  return list

}


































const get_average_1 = function (size, step){
  const list:Set<number> = new Set();
  for(let i = 0; i < step - 1 ; i+=1){
      const start_value = Math.round(size / (step - 1) * i);
      const end_value = Math.round(size / (step - 1) + size / (step - 1) * i);
      list.add(start_value)
      list.add(end_value)
  }
  const array = [];
  list.forEach(item=>{
    array.push(item);
  })
  return array;
}






const sin_random_noise_1_2 = function (len=100, sublevel=10, type=0){

  let list = [];
  
  const sublevel_Len = len / sublevel > 100 ? Math.ceil(len / sublevel) : 100;
  

  for(let i = 0; i < sublevel; i+=1){
    const Zone_List = [];
    const base = Math.random() * 100
    for(let i = 0; i < sublevel_Len; i+=1){
      const value = get_dot_after(random( (base + i), 100, 100, 100));
      Zone_List.push([value,i]);
    }
    list.push(Zone_List);
  }


  if(type !== 0){
    list.forEach((i,j)=>{
      if( list[j+1] ){
        i[i.length-1][0] = list[j+1][0][0]
      }
      else{
        const base = Math.random() * 100
        const value = get_dot_after(random( base, 100, 100, 100))
        i[i.length-1][0] = value
      }
    })
  
  
  
    list = list.map(item=>{
  
      const [value_start, index_start] = item[0];
      const [value_ended, index_ended] = item[item.length - 1];
      const len = item.length;
  
      return (
        [
          item[0],
          ...item.filter((i,j)=> j != 0 && j != (item.length - 1) ).map(item=>{
            const prop_a = item[1] / len;
            const prop_b = smoothstep(prop_a, 0, 1) 
            let value = 0
            if(type === 1){
              value = lerp(value_start,value_ended,prop_a)
            }
            else if(type === 2){
              value = lerp(value_start,value_ended,prop_b)
            }
            return [value,item[1]]
          }),
          item[item.length - 1]
        ]
      )
    })
  }




  // 每段步进数量
  const step_number = Math.floor(sublevel_Len / (len / sublevel));
  let Step_Number_List = []
  for(let i = 0; i < sublevel_Len; i+=step_number){
    Step_Number_List.push(i);
  }

  list = list.map(i=>Step_Number_List.map(j=>i[j])).flat(1)

  list = list.map((i,j)=>[i[0],j])

  list = list.filter((i,j)=>j<len);

  return list

}





















// 获取分段参数
function getStep(l:any,t:any){
  const a:any = []
  const b:any = []
  for(let x = 0; x <= t; x++){
    
    const data = {
      v: get_dot_after(random( Math.random() * 100, 100, 100, 100)),
      x: l/t * x
    }
    if(x === 0){
      a.push(data)
    }
    else if(x === t){
      b.push(data)
    }
    else{
      a.push(data)
      b.push(data)
    }
  }


  return a.map((i:any,index:any)=>[a[index],b[index]])

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




export { 
  random_noise_1,
  sin_random_noise_1_2,
  sin_random_noise_1_1,
}



