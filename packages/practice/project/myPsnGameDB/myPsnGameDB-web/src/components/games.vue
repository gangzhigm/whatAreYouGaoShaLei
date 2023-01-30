<template>
  <div class="body">1
    <div class="particles" id="particles-jsO"></div>
    <div class="particles" id="particles-jsX"></div>
    <div class="particles" id="particles-jsS"></div>
    <div class="particles" id="particles-jsF"></div>
  </div>
</template>
<script>
import norcss from 'normalize.css'
export default {
  name: "dasda",
  beforeMount() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(0, 0, 80, 100);
  }
};
</script>
<style lang="less" scoped>
div.body {
  background: #1097e3;
}
</style>
