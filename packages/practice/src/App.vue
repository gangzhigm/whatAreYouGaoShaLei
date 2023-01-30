<template>
  <div id="app">
    <template v-if="$route.name == 'index'">
      <router-view/>
    </template>

    <template v-else>
      <div class="app-box">
        <sidebar></sidebar>
        <router-view class="route-view"/>
      </div>
    </template>

  </div>
</template>
<script>
import sidebar from './views/Sidebar'
export default {
  components:{
    sidebar
  },
  methods:{},
  
}
</script>

<style lang="scss">
body{
  padding: 0px;
  margin: 0px;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.app-box{
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .route-view{
    width: 100%;
  }
}






// one
.sidebar{
  background-color:#E0E3DA;
}
.app-box{
  background-color:#FFFFF3;
}

// // two
// .sidebar{
//   background-color:#1B1C21;
// }
// .app-box{
//   background-color:#2A2B2F;
// }
</style>
