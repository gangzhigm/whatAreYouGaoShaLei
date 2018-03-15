<template>
  <div class="box">
    <div class="list" :style="{transform:transformList}">
      <div class="listItem">
        <h1>环境测试</h1>
        <ul>
          <li v-for="item in list" @click="moveToList" :key="item.id" >{{item.title}}</li>
          <li>1</li>
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

<script>
  export default {
    name: "index",
    data() {
      return {
        list:false,
        that: "",
        color: "red",
        transformList: "translate(0, 0)",
        // list:[
        //   {
        //     id:1,
        //     title:"tele"
        //   },
        //   {
        //     id:2,
        //     title:"tele"
        //   },
        //   {
        //     id:3,
        //     title:"tele"
        //   },
        //   {
        //     id:4,
        //     title:"tele"
        //   },
        //   {
        //     id:5,
        //     title:"tele"
        //   },
        //   {
        //     id:6,
        //     title:"tele"
        //   }
        // ]
      };
    },
    methods: {
      moveToList: function () {
        this.transformList = "translate(-80%, 0)";
        this.list=true;
      },
      moveToLeft: function (ev) {
        this.transformList = "translate(-100%, 0)";
        this.list=false;
      },
      moveToRight: function () {
        this.transformList = "translate(0, 0)";
        this.list=["1","1","1","1","1","1","1"]
      }
    }
  };

</script>

<style scoped>
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
