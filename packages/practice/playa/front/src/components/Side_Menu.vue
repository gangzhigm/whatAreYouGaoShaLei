<!--
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2022-12-28 09:45:49
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-06 15:39:13
 * @FilePath: \playa\front\src\components\Side_Menu.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<script setup lang="ts">
  import { ref, defineEmits, onMounted, provide, inject, Ref } from 'vue'
  const emits = defineEmits(["change-name"]);
  
  
  const menu_list:any = inject('menu_list')
  const menu:any = inject('menu');
  
  

  function handle_click_menu(value:any){
    menu.value = value;
    emits("change-name");
  }

</script>

<template>
  <div class="main positino_absolute flex_column_start_center">
    <h1 class="title cursor_default">G</h1>
    <div class="menu-list">
      <template v-for="item in menu_list">
        <h2 @click="handle_click_menu(item)" 
          :title="item.fullname"
          class="menu-item cursor_pointer" :class="menu.value === item.value ? 'active' : ''">{{item.name}}</h2>
  
          <h3 v-for="subitem in item.children">{{subitem.name}}</h3>
      </template>

    </div>
    
  </div>
</template>

<style scoped>
.main {
  --width: 100px;
  --title-size: calc( var(--width) * .8 );
}
.main {
  z-index: 100;
  height: 100%;
  width: var(--width);
  background: var(--background);
  box-shadow: calc( var(--width) * -.5 ) 0px var(--width) black;
}
.title{
  width: var(--title-size);
  color: var(--title-color);
  height: var(--title-size);
  line-height: var(--title-size);
  background-color: var(--title-background-color);
  margin: calc( calc( var(--width) - var(--title-size) ) * .5 );
}

.menu-list{
  overflow: auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.menu-list::-webkit-scrollbar {
  width : 4px;  
}
.menu-list::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  background   : #535353;
}
.menu-list::-webkit-scrollbar-track {
  /* 滚动条里面轨道 */
  box-shadow   : inset 0 0 5px rgba(0, 0, 0, .3);
}
.menu-item{
  width: 20%;
  border-bottom: 1px solid var(--color);
}
.menu-item:hover{
  border-bottom: 2px solid var(--color);
}

.active{
  border: none;
  color: #ffffff;
  animation: sad .5s linear 0s infinite normal forwards;
}

@keyframes sad{
  0% {
    filter: drop-shadow(-2px -2px 1px #ff0000);
  }

  10% {
    filter: drop-shadow(3px -2px 1px #0000ff);
  }

  20% {
    filter: drop-shadow(3px 3px 1px #ff0000);
  }

  30% {
    filter: drop-shadow(3px -2px 1px #0000ff);
  }

  40% {
    filter: drop-shadow(-2px -2px 1px #ff0000);
  }

  50% {
    filter: drop-shadow(-2px 3px 1px #0000ff);
  }

  60% {
    filter: drop-shadow(3px 3px 1px #ff0000);
  }

  70% {
    filter: drop-shadow(3px -2px 1px #0000ff);
  }

  80% {
    filter: drop-shadow(-2px 3px 1px #ff0000);
  }

  90% {
    filter: drop-shadow(3px -2px 1px #0000ff);
  }

  100% {
    filter: drop-shadow(-2px -2px 1px #ff0000);
  }
}

</style>
