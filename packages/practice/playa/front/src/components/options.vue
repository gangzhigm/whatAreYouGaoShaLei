<!--
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-30 16:54:55
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-06 15:10:20
 * @FilePath: \playa\front\src\components\options.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">

  import { inject } from 'vue'
  
  const obj:any = inject('obj')

  function add_axes(){
    obj.value.scene.add(obj.value.axes_helper)
  }

  function add_grid(){
    obj.value.scene.add(obj.value.grid_helper)
  }

  function remove_axes(){
    obj.value.scene.remove(obj.value.axes_helper)
  }

  function remove_grid(){
    obj.value.scene.remove(obj.value.grid_helper)
  }

  function show_X_Face(){
    obj.value.camera.position.set(50, 0, 0);
    obj.value.camera.lookAt(0, 0, 0);
  }

  function show_Y_Face(){
    obj.value.camera.position.set(0, 50, 0);
    obj.value.camera.lookAt(0, 0, 0);
  }

  function show_Z_Face(){
    obj.value.camera.position.set(0, 0, 50);
    obj.value.camera.lookAt(0, 0, 0);
  }

  function reload(){
    obj.value.scene.remove(obj.value.plugin);
    obj.value.plugin = obj.value.pluginFn(...obj.value.pluginFnParam);
    obj.value.scene.add(obj.value.plugin);
  }
  
</script>

<template>
  <div class="option">
    <button @click="add_axes">Add Axes</button>
    <button @click="remove_axes">Remove Axes</button>
    <br />
    <button @click="add_grid">Add Grid</button>
    <button @click="remove_grid">Remove Grid</button>
    <br />
    <button @click="show_X_Face">X Face</button>
    <button @click="show_Y_Face">Y Face</button>
    <button @click="show_Z_Face">Z Face</button>

    <br />
    <button @click="reload">Reload</button>




  </div>
</template>

<style scoped>
.option{
  position: absolute;
  z-index:100;
  top: 0;
  right: 0;
  padding: 10px;
  margin: 10px;
  background-color: rgba(255, 255, 255, 0.288);
  display:flex;
  flex-direction: column;
}
.option > button{
  border: 1px solid rgb(0, 0, 0);
  margin: 2px;
  font-size: 6px;
  text-align: left;
}
</style>
