<template>
  <div id="app">
    <div class="list" :style="{transform:transformList}">
      <div class="listItem">
        <h1>环境测试</h1>
        <ul>
          <li v-for="item in list" @click="moveToList" :key="item.id" >{{item.title}}</li>
        </ul>
      </div>
      <div class="arrowToRight">
        <div @click.stop="moveToLeft" v-if="list==true">关闭列表</div>
        <div @click.stop="moveToRight" v-if="list==true">返回列表</div>
      </div>
    </div>
    <div class="effect" :style="{transform:transformList}">
      this.is.effect
      <div>
        this.is.console
      </div>
      <div>
        this.is.box
      </div>
      <div>
        this.is.print
      </div>
      <div class="arrowToList" @click.stop="moveToList" v-if="list==false">打开列表</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";

@Component({})
export default class App extends Vue {
  msg: string = "Welcome to Your Vue-Typescript App";
  list: Object[] = [
    {
      id: 1,
      title: "a"
    },
    {
      id: 2,
      title: "a"
    },
    {
      id: 3,
      title: "a"
    },
    {
      id: 4,
      title: "a"
    },
    {
      id: 5,
      title: "a"
    },
    {
      id: 6,
      title: "e"
    }
  ];
}
</script>

<style>
.box {
  display: flex;
  width: 200vw;
  height: 100vh;
}

.list {
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #ff9c18;
  transition: transform 0.4s;
}

.listItem {
  color: #fff;
}

.listItem ul {
  list-style: none;
  padding: 0;
}

.listItem li {
  width: 100%;
  text-align: center;
  margin: 10px;
}

.arrowToRight {
  background: pink;
  position: absolute;
  right: 0;
}

.arrowToList {
  background: pink;
  position: absolute;
  left: 0;
}

.effect {
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #1c74b8;
  transition: transform 0.4s;
}
</style>