/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-09 16:51:23
 * @FilePath: \playa\front\src\components\utils.ts
 * @Description: 实现方法组
 */
import * as THREE from "three"
import * as INTERFACE_D from "../dts/interface_d";
import * as TYPE_D from "../dts/type_d";
  
const createCamera:INTERFACE_D.createCamera =  function(
    aspect=window.innerWidth / window.innerHeight,
    orthographic_camera_size=[100,100,100,100], 
    Scene_Size=1000
){
    return new THREE.OrthographicCamera( 
      orthographic_camera_size[0] * -1, // 左端边界
      orthographic_camera_size[1], // 右端边界
      orthographic_camera_size[2] / aspect, // 上端边界
      orthographic_camera_size[3] / -aspect, // 下端边界
      -Scene_Size * 2, // 近视角
      Scene_Size * 2 // 远视角
    );
}

const createSkyBox:INTERFACE_D.createSkyBox = function (Scene_Size=1000){
    let directions = [
        'http://localhost:3000/skyBox2/posx.jpg', 'http://localhost:3000/skyBox2/negx.jpg',
        'http://localhost:3000/skyBox2/posy.jpg', 'http://localhost:3000/skyBox2/negy.jpg',
        'http://localhost:3000/skyBox2/posz.jpg', 'http://localhost:3000/skyBox2/negz.jpg'
      ] // 获取对象

      const loader = new THREE.TextureLoader()
      const skyGeometry = new THREE.BoxGeometry(Scene_Size, Scene_Size, Scene_Size)
      // 设置盒子材质
      const materialArray = []
      for (let i = 0; i < 6; i++)
        materialArray.push(
          new THREE.MeshBasicMaterial({
            map: loader.load(directions[i]), // 将图片纹理贴上
            side: THREE.BackSide // 镜像翻转
          })
        )
      // 创建一个完整的天空盒，填入几何模型和材质的参数
      return new THREE.Mesh(skyGeometry, materialArray)
}

const createCanvas:INTERFACE_D.createCanvas = function (id_class_name="three-canvas"){
  const canvas : HTMLCanvasElement = document.createElement('canvas');
  canvas.id = id_class_name;
  canvas.className = id_class_name;
  return canvas;
}

const createRenderer:INTERFACE_D.createRenderer = function (canvas){
  const renderer = new THREE.WebGLRenderer({canvas});
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );
  return renderer;
}

const box_center_world:INTERFACE_D.box_center_world = function (thing){
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
}

export { 
  createCamera,
  createSkyBox,
  createCanvas,
  createRenderer,
  box_center_world
}