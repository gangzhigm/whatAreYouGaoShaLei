<template>
  <div class="shadow">

    <div class="btn g-left"></div>

    <div class="btn g-both"></div>

    <div class="btn g-slide"></div>

  </div>
</template>

<script>
// @ is an alias to /src

export default {
  name: 'shadow',
  data(){
    return{
    }
  },
  created(){
    document.title = 'shadow';
  },
  methods:{
  }
}
</script>
<style lang='scss' scoped>
.btn {
    position: relative;
    transition: all .4s;
    width: 600px;
    height: 100px;
    margin: 5vmin auto 15vmin;
    border-radius: 20px;
}
.g-left {
    background: hsl(48, 100%, 50%);
    box-shadow: 0 0 5px 2px hsl(48, 100%, 45%);
    &::before{
      transition: all .4s;
      content: "";
      position: absolute;
      top: 50%;
      left: 5%;
      right: 5%;
      bottom: 0;
      border-radius: 10px;
      background: hsl(48, 100%, 20%);
      transform: translate(0, -15%) rotate(-4deg);
      transform-origin: center center;
      box-shadow: 0 0 20px 15px hsl(48, 100%, 20%);
      z-index: -1;
    }
    &:hover{
      &::before{
        transform: translate(0, -15%) rotate(0deg);
      }
    }
}

.g-both {
    background: hsl(199, 98%, 48%);
    box-shadow: 0 0 5px 2px hsl(199, 98%, 40%);
     &::before{
      content: "";
      transition: all .4s;
      position: absolute;
      top: 50%;
      left: 5%;
      right: 5%;
      bottom: 15%;
      border-radius: 10px;
      background: hsl(199, 98%, 20%);
      transform: translate(0, -20%) rotate(-4deg);
      transform-origin: center center;
      box-shadow: 0 0 20px 15px hsl(199, 98%, 20%);
      z-index: -1;
    }
    &::after{
      content: "";
      transition: all .4s;
      position: absolute;
      top: 50%;
      left: 5%;
      right: 5%;
      bottom: 15%;
      border-radius: 10px;
      background: hsl(199, 98%, 20%);
      transform: translate(0, -20%) rotate(4deg);
      transform-origin: center center;
      box-shadow: 0 0 20px 15px hsl(199, 98%, 20%);
      z-index: -1;
    }
    &:hover{
      &::before{
        transform: translate(0, -20%) rotate(0deg);
      }
      &::after{
        transform: translate(0, -20%) rotate(0deg);
      }
    }
}

.g-slide{
  background: hsl(150, 62%, 52%);
  box-shadow: 0 0 5px 2px hsl(150, 62%, 40%);
  &::before{
    content: '';
    position: absolute;
    transition: all .4s;
    top: 15%;
    bottom: 20%;
    left: 90%;
    right: 5%;
    border-radius:10px;
    background: hsl(150, 62%, 20%);
    transform: translate(105%, 10%) rotate(15deg);
    transform-origin: center center;
    box-shadow: 0 0 10px 7px hsl(150, 62%, 20%);
    z-index: -1;
  }
  &::after{
    content: "";
    position: absolute;
    transition: all .4s;
    top: 15%;
    bottom: 20%;
    left: 5%;
    right: 90%;
    border-radius: 10px;
    background: hsl(150, 62%, 20%);
    transform: translate(-105%, 10%) rotate(-15deg);
    transform-origin: center center;
    box-shadow: 0 0 10px 7px hsl(150, 62%, 20%);
    z-index: -1;
  }
  &:hover{
    &::before{
      transform: translate(105%, 10%) rotate(0deg);
    }
    &::after{
      transform: translate(-105%, 10%) rotate(0deg);
    }
  }
}
</style>
