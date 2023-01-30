/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-10 11:12:02
 * @FilePath: \playa\front\src\components\utils.ts
 * @Description: 实现方法组
 */
import * as THREE from "three"
import * as INTERFACE_D from "../dts/interface_d";
import * as TYPE_D from "../dts/type_d";
  
const lerp:INTERFACE_D.lerp = function (start, end, interpolation){
  return Number((1-interpolation).toFixed(2)) * start + interpolation * end
}

const lerp_2:INTERFACE_D.lerp_2 = function (value){
  return Number(((Math.pow(value,5) * 6) - (Math.pow(value,4) * 15) + (Math.pow(value,3) * 10)).toFixed(2))
}



const get_index_2_to_1:INTERFACE_D.get_index_2_to_1 =  function (size, index){
    return index[0] * size[0] + index[1]
}

const getColor_16:INTERFACE_D.getColor_16 = function (){
    let color:string = "#"
    const colorList = [
    '0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'
    ]
    for(let i = 0 ; i < 6 ; i++){
       color += colorList[Math.floor(Math.random() * 16)]
    }
    return color;
}

const get_near_2:INTERFACE_D.get_near_2 = function (list, [i,j]){
  if(list.length === 0){
    return null;
  }
  return list.reduce((a:number[],b:number[])=>{
      const aa = Number(Math.sqrt(Math.pow(a[0] - i,2) + Math.pow(a[1] - j,2)).toFixed(3));
      const bb = Number(Math.sqrt(Math.pow(b[0] - i,2) + Math.pow(b[1] - j,2)).toFixed(3))
      return aa < bb ? a : b;
  })
}

const get_near_3:any = function (list:any, [i,j,z]:any){
  if(list.length === 0){
    return null;
  }
  // d=√[(x1-x2)^2+(y1-y2)^2+(z1-z2)^2]
  return list.reduce((a:number[],b :number[])=>{
      const aa = Number(Math.sqrt(Math.pow(a[0] - i,2) + Math.pow(a[1] - j,2) + Math.pow(a[2] - z,2)).toFixed(3));
      const bb = Number(Math.sqrt(Math.pow(b[0] - i,2) + Math.pow(b[1] - j,2) + Math.pow(a[2] - z,2)).toFixed(3))
      return aa < bb ? a : b;
  })
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


export { 
  lerp,
  lerp_2,
  get_near_2,
  getColor_16,
  get_average_1,
  get_index_2_to_1
}