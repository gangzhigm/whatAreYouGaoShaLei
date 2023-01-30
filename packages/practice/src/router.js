import Vue from 'vue'
import Router from 'vue-router'
import index from './views/Index.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'app',
      redirect: 'index',
    },
    {
      path: '/index',
      name: 'index',
      component: index
    },
    {
      path: '/notification',
      name: 'notification',
      component: () => import(/* webpackChunkName: "notification" */ './views/notification.vue')
    },
    {
      path: '/shadow',
      name: 'shadow',
      component: () => import(/* webpackChunkName: "shadow" */ './views/shadow.vue')
    },
    {
      path: '/typewriter',
      name: 'typewriter',
      component: () => import(/* webpackChunkName: "typewriter" */ './views/typewriter.vue')
    },
    {
      path: '/boxShadowAmi',
      name: 'boxShadowAmi',
      component: () => import(/* webpackChunkName: "boxShadowAmi" */ './views/boxShadowAmi.vue')
    },
    {
      path: '/indexDB',
      name: 'indexDB',
      component: () => import(/* webpackChunkName: "indexDB" */ './views/indexDB.vue')
    },
    {
      path: '/CSSshade',
      name: 'CSSshade',
      component: () => import(/* webpackChunkName: "CSSshade" */ './views/CSSshade.vue')
    },
    {
      path: '/CanvasAmi',
      name: 'CanvasAmi',
      component: () => import(/* webpackChunkName: "CanvasAmi" */ './views/CanvasAmi.vue')
    },
  ]
})
