<template>
  <div id="index">
      <ul class="nav-list">
        <li class="nav-item" v-for="i in $store.state.proList" :key="i.id" v-text="i.name" @click="routerPush(i.route)"></li>
      </ul>
  </div>
</template>
<script>
export default {
  data(){
    return{}
  },
  methods:{
    routerPush(route){
      this.$router.push({name:route})
    }
  },
  mounted(){
    document.title = 'Menu';
  }
}
</script>

<style lang="scss" scoped>
  .nav-list{
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    .nav-item{
      margin: 10px;
      min-width: 150px;
      border-radius: 15px;
      min-height: 100px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 0 10px -4px #000;
      transition: all .4s;
      background: white;
      color: black;
      &:hover{
        background: rgba(20, 20, 20, 0.8);
        color: white;
        text-shadow: 0 0 0.2em #fff, 0 0 0.2em #fff;
      }
    }
  }
</style>
