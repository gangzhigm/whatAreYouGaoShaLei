import Vue from 'vue'
import Vuex from 'vuex'
import modal from '../router'
Vue.use(Vuex);

let proList = [];
const neednotRoute = ['app','index']
for(let item of modal.options.routes){
    if(!neednotRoute.includes(item.name)){
        proList.push({
            id:proList.length,
            name:item.name,
            route:item.name
        })
    }
}
export default new Vuex.Store({
    state: {
        proList
    },
    getter: {}, // 计算属性
    mutations: {}, // 同步更改
    actions: {} //异步更改
})

