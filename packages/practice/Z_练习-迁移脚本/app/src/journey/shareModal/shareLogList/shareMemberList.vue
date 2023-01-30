<template>
        <div class="share-member-box cursor-default"  @mouseover="inputMouseOver" @mouseleave="inputMouseLeave" >
            <span>{{`material.${typeObj.name}` | t}}</span>
            <div class="share-member-list" v-if="listSwitch && typeObj.id != 0" >
                <ul>
                    <li class="share-member-item" v-for="(item,index) in list" :key="index" :title="item.createDate">
                        {{item.name}}
                    </li>
                </ul>
            </div>
        </div>
</template>
<script type="text/babel">
    import { DepartmentApiV1 } from '@/api';
    
    export default {
        props:{
            typeObj:Object, // 对象信息列表
        },
        data() {
            return {
                listSwitch:false,
                list: [],
            };
        },
        mounted() {
            if (this.typeObj.id !== 0 ) {
                const self = this;
                DepartmentApiV1
                    .searchDepartments({type: this.typeObj.id, ids: this.typeObj.ids})
                    .then((res)=>{
                        self.list = res.body.data.lists;
                    });
            }
        },
        methods: {
            // 鼠标移入对象选择
            inputMouseOver(){
                if (this.typeObj.id !== 0){
                    this.listSwitch = true;
                }
            },
            // 鼠标移出对象选择
            inputMouseLeave(){
                if (this.typeObj.id !== 0){
                    this.listSwitch = false;
                }
            },
        }
    };

</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
            .share-member-box{
                margin: 20px 0;
                cursor: pointer;
                position: relative;
            }
            .share-member-list{
                z-index:2;
                cursor: auto;
                background:#fff;
                position: absolute;
                width: 300px;
                height: 300px;
                background: #fff;
                border: 1px solid #000;
                overflow-y: scroll;
                overflow: scroll;
                text-overflow:ellipsis;
                white-space: nowrap;
            }
            .share-member-item{
                text-indent: 8px;
                margin: 4px 0;
                cursor: pointer;
            }
</style>
