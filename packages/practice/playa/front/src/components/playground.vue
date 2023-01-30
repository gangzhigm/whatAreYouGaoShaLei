<script setup lang="ts">
  import * as THREE from "three"
  import * as utils from "./method_render"
  import * as Mesh from "./method_mesh"

  import Options from './options.vue'
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
  import { inject, onMounted, ref, watch, watchEffect, provide, reactive, onUpdated, VueElement } from 'vue'

  



  const menu:any = inject("menu");





  function setPluginData(data:any,obj:any){
    obj.value.plugin = data[0];
    obj.value.pluginFn = data[1];
    obj.value.pluginFnParam = data[2];
  }

  
  function handle_menuChange(){
    obj.value.scene.remove(obj.value.plugin);

    let PluginObj:any = [ null,null,null ];

    setPluginData(PluginObj, obj)
    
    if(menu.value.value == 1){
      PluginObj = [ null, utils.createFloor_1, [[1, 10], [1,1,1]]];
      PluginObj[0] = PluginObj[1](...PluginObj[2]);
    }
    else if(menu.value.value == 2){
      PluginObj = [ null, utils.createFloor_2, [[1, 10], [1,1,1]]];
      PluginObj[0] = PluginObj[1](...PluginObj[2]);
    }
    else if(menu.value.value == 3){
      PluginObj = [ null, utils.createFloor_3, [[.1, 1], [1,1,1]]];
      PluginObj[0] = PluginObj[1](...PluginObj[2]);
    }
    else if(menu.value.value == 4){
    }


    obj.value.scene.add(PluginObj[0]);
    setPluginData(PluginObj, obj)
  }





































































  // 规定场景尺寸
  const Scene_Size = 1000;
  // 规定比例
  const aspect = window.innerWidth / window.innerHeight;
  // 规定相机尺寸
  const orthographic_camera_size:[number,number,number,number] = [100, 100, 100, 100]
  // 规定场景地图尺寸
  const map_size = 100
  // 规定场景地图分割数量 X * y
  const map_unit = 100
  // 规定场景地图单个量
  const unit_size = map_size / map_unit;


  

  let obj:any = ref({
    scene:null,
    skybox:null,
    camera:null,
    controls:null,
    light:null,
    directionalLight:null,
    axes_helper:null,
    grid_helper:null,
    plugin:null,
    pluginFn:null,
    pluginFnParam:null
  })
  provide("obj", obj)

  defineExpose({
    handle_menuChange
  })

  onMounted(()=>{
    let {
      scene,
      skybox,
      camera,
      controls,
      light,
      directionalLight,
      axes_helper,
      grid_helper,
    }:any = {...obj.value}

    // 创建容器
    const canvas = Mesh.createCanvas('main_canvas');
    const renderer = Mesh.createRenderer(canvas);

    // 创建场景
    scene = new THREE.Scene();

    // 在场景中加入天空盒
    skybox = Mesh.createSkyBox(Scene_Size)
    scene.add(skybox)

    // 在场景中加入相机
    camera = Mesh.createCamera(aspect, orthographic_camera_size, Scene_Size);
    
    camera.position.z = 130;
    camera.position.x = 50;
    camera.position.y = 100;

    camera.lookAt(0,0,0);
    
    // 设置相机控制事件
    controls = new OrbitControls(camera, canvas)
    controls.update()

    // 在场景中加入平行灯光
    light = new THREE.AmbientLight( 0xffffff, .3 ); // soft white light
    scene.add( light );

    // 在场景中加入太阳灯光
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set(-10,10,5)
    scene.add( directionalLight );

    // 设置轴线辅助工具线    
    axes_helper = new THREE.AxesHelper(1000);
    scene.add(axes_helper);

    // 设置网格辅助工具线    
    grid_helper = new THREE.GridHelper( map_size, map_unit, 0x2C2C2C, 0xffffff );
    grid_helper.position.y = -0.01;
    scene.add(grid_helper);
    
    obj.value = Object.assign(obj.value, {
      scene,
      skybox,
      camera,
      controls,
      light,
      directionalLight,
      axes_helper,
      grid_helper
    })

    // 渲染
    requestAnimationFrame(render)
    function render() {
      renderer.render(scene, camera)
      requestAnimationFrame(render)
    }

    handle_menuChange();

  })
</script>

<template>
  <Options/>
</template>

<style>
.main_canvas {
  top: 0;
  left: 0;
  position: absolute;
  box-sizing: border-box;
}
</style>
