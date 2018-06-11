import index from './components/index.vue'
import games from './components/games.vue'

// 管理

/**
 * vue 用路由表
 */
export default [
    {
        path: '/',
        name:'index',
        component: games,
    },
    {
        path: '/conponents:id',
        name: 'games',
        component: games
    }
]
