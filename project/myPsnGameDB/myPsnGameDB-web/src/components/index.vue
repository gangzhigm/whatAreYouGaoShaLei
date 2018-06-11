<template>
  <div id="vue">
    <div class="row">
            <div class="col-xs-12 col-sm-8">
                <H1 class="h1">在线游戏索引库
                    <small>
                        <strong>从下载列表里一个一个找,真的很烦</strong>
                    </small>
                </H1>
            </div>
            <div class="col-xs-12 col-sm-4">
                <label for="input">
                    <svg class="icon" aria-hidden="true">
                        <use xlink:href="#icon-icon-test"></use>
                    </svg>
                    <input id="input" type="" name="">
                </label>
            </div>
        </div>
      <div class="row">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" id='content'>
          <div id="PS3">
            <h2>PS3</h2>
            <router-link  v-for="(item,index) in ps3" :to="{name: 'games',params:{id:index}}">
              <div>{{item.name}}</div>
            </router-link>
          </div>
          <div id="PS4">
            <h2>PS4</h2>
            <router-link  v-for="(item,index) in ps4" :to="{name: 'games',params:{id:index}}">
              <div>{{item.name}}</div>
            </router-link>
          </div>
          <div id="PSV">
            <h2>PSV</h2>
            <router-link  v-for="(item,index) in psv" :to="{name: 'games',params:{id:index}}">
              <div>{{item.name}}</div>
            </router-link>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import psnGame from "../data/psnGame";

export default {
  data() {
    return {
      psv: [],
      ps3: [],
      ps4: []
    };
  },
  beforeMount() {
    const psndata = psnGame;
    for (var value of psndata.game) {
      if (value.playstation.indexOf("ps3") >= 0) {
        this.ps3.push(value);
      }
      if (value.playstation.indexOf("ps4") >= 0) {
        this.ps4.push(value);
      }
      if (value.playstation.indexOf("psv") >= 0) {
        this.psv.push(value);
      }
    }
  }
};
</script>

<style lang="less" scoped>

a:hover{
        text-decoration: none;
      }
#content {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  #PSV {
    background-color: #fc1a86;
  }
  #PS3 {
    background-color: #f8cd28;
  }
  #PS4 {
    background-color: #43bef7;
  }
  #PSV,
  #PS3,
  #PS4 {
    border-radius: 6px;
    margin: 0 5px;
    padding: 5px;
    width: 33%;
    height: auto;
    transition: all 0.4s;
    h2 {
      color: #fff;
    }
    div {
      width: 100%;
      user-select: none;
      color: #fff;
      text-indent: 10px;
      margin: 10px 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: all 0.4s;
      position: relative;
      &:hover {
        padding-left: 10px;
        text-shadow: 0 0 10px #000000;
      }
    }
  }
}
</style>

