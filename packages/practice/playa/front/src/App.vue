<!--
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-16 13:04:56
 * @FilePath: \playa\front\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
import SideMenu from './components/Side_Menu.vue'
import PlayGround from './components/playground.vue'
import { provide, ref } from 'vue';





const menu_list = [
  {name: "壹", value: "1", fullname: "一维展示", children:[]},
  {name: "贰", value: "2", fullname: "二维展示", children:[]},
  {name: "叁", value: "3", fullname: "三维展示", children:[]},
  {name: "D", value: "4", fullname: "", children:[]},
  {name: "E", value: "5", fullname: "", children:[]},
  {name: "F", value: "6", fullname: "", children:[]},
  {name: "G", value: "7", fullname: "", children:[]}
];
let menu = ref(menu_list[2]);

provide("menu_list", menu_list)
provide("menu", menu)







const PlayGroud:any = ref(null);

function changeName(){
  PlayGroud.value.handle_menuChange();
}

</script>

<template>
  <SideMenu @change-name="changeName" />
  <PlayGround ref="PlayGroud"/>
</template>

<style></style>
