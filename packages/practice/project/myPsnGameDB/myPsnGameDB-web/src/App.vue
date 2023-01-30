<template>
    <div class="container-fluid">
        <!-- <div class="row">
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
        </div> -->
        <router-view></router-view>
    </div>
</template>
<script>
export default {
  name: "App"
};
</script>
<style lang="less" scoped>
* {
			margin: 0;
			outline: 0;
			border: 0;
		}
.container-fluid{
    margin-top: 20px;
}
.h1 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
label {
  text-align: right;
  position: relative;
  #input {
    transition: all 0.4s;
    height: 3em;
    position: absolute;
    top: 0;
    left: 3.5em;
    width: 0;
    &:focus {
      width: 5em;
    }
  }
  .icon {
    width: 3em;
    height: 3em;
    fill: currentColor;
    overflow: hidden;
  }
}
</style>
