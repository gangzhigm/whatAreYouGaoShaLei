<template>
    <div class="sidebar">
        <div class="app-header">
            <p class="app-header-item" @click="back">Index</p>
            <p class="app-header-item" @click="back">Docs</p>
        </div>
        <ul class="sidebar-list">
            <li class="sidebar-item" v-for="i in $store.state.proList" :key="i.id" v-text="i.name" @click="routerPush(i.route)"></li>
        </ul>
    </div>
</template>
<script>
export default {
    data(){
        return {
            judge_sidebarSwitch: false
        }
    },
    methods: {
        routerPush(route){
            this.$router.push({name:route})
        },
        sidebarSwitch(){
            this.judge_sidebarSwitch = !this.judge_sidebarSwitch;
        },
        back(){
            this.$router.push({name:'index'})
        }
    }
}
</script>

<style lang="scss" scoped>
    $sidebar-size: 100px;
    .sidebar {
        padding: 10px;
        height: calc( 100vh - 40px );
        width: $sidebar-size;
        transition: all .4s;
        .sidebar-list{
            list-style: none;
            margin: 0px;
            padding: 0px;
            .sidebar-item{
                overflow: hidden;
                text-overflow:ellipsis;
                white-space: nowrap;
                box-shadow: 0 0 10px -4px #000;
                border-radius: 15px;
                margin-bottom: 10px;
                padding: 10px;
                cursor: pointer;
                transition: all .4s;
                &:hover{
                    background: rgba(20, 20, 20, 0.8);
                    color: white;
                    text-shadow: 0 0 0.2em #fff, 0 0 0.2em #fff;
                }
            }
        }
    }



    .app-header{
        margin: 10px 0;
        display: flex;
        flex-direction:column;
        transition: all .4s;
        text-shadow:1px 0px 1px #303030;
        .app-header-item{
            cursor: pointer;
            margin: 10px 10px;
            &:hover{
                animation: test .4s linear infinite alternate;
            }
        }
        }
        @keyframes test {
        0%{
            color: #000;
            text-shadow:-2px -2px 1px red;
        }
        25%{
            color: #fff;
            text-shadow:2px -2px 1px blue;
        }
        50%{
            color: #000;
            text-shadow:2px 2px 1px yellow;
        }
        75%{
            color: #fff;
            text-shadow:-2px 2px 1px green;
        }
        100%{
            color: #000;
            text-shadow:-2px -2px 1px black;
        }
        }
</style>
