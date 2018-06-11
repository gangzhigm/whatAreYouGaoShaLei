import Vue from 'vue/dist/vue.js';
import 'normalize.css'
import VueRouter from 'vue-router'
import routes from './routes.js'
import App from './App.vue'
Vue.use(VueRouter);
let router = new VueRouter({
  routes
})
const app = window.addEventListener('load', () => {
  new Vue({
    el: '#vueapp',
    router,
    render: h => h(App)
  })
})