<template>
    <div class="edit-model-options-plane-search-area-box">
        <!-- 查询功能 -->
        <div class="search-box">
            <!-- 查询输入框 -->
            <input type="text"
                :placeholder="$t('newScoring.searchKeyword')"
                @input="searchInput"
                @keyup.enter="!isSearch && search()"
                v-model.trim="searchKeyWord"/>
            <!-- 查询按钮 -->
            <svg v-if="!isSearch" aria-hidden="true" @click="search" class="search-box-btn">
                <use xlink:href="#icon-search"></use>
            </svg>
            <!-- 清除按钮 -->
            <svg v-else aria-hidden="true" @click="cleanSearch" class="search-box-btn">
                <use xlink:href="#icon-close"></use>
            </svg>
        </div>
        <!-- 列表区域 -->
        <ul class="edit-model-options-plane-search-list">
            <draggable
                class="dragArea list-group"
                :list="factorList"
                :group="{name: 'factor',pull: 'clone', put: false,sort:false }"
                :sort="false"
                :clone="cloneEv"
                @start="$emit('start')"
                @end="cloneDone"
            >
                <li v-for="(item, index) of computedFactorList" :key="index" @click="newFactor(item)">
                    <svg aria-hidden="true" class="icon event-icon" v-if="type === 0">
                        <use xlink:href="#icon-shuxing"></use>
                    </svg>
                    <CustomerIcon v-if="type===1" 
                        :eventGroupName="item.iconName"
                        :eventName="item.eventName" />
                    <span class="desc" v-text="item.showName" :title="item.showName"></span>
                </li>
            </draggable>
        </ul>
    </div>
</template>

<script type="text/ecmascript-6">
// 事件图表组件
import CustomerIcon from '@/customer/list/customer-icon.vue';
import { ScoringV2 } from '@/api';
export default {
    props: {
        type:{
            type:Number,
            default:0
        },
        modelId:{
            type:Number,
            default:0
        },
        eventFieldList:{
            type:Array,
            default:[]
        },
        customerFieldList:{
            type:Array,
            default:[]
        },
    },
    components:{
        CustomerIcon
    },
    computed:{
        computedFactorList(){
            return (
                this.factorList.filter(item => 
                    this.keyword.length !== 0 
                        ? item.showName.includes(this.keyword)
                        : true)
            );
        }
    },
    data () {
        return {
            keyword:'', // 查询关键字
            factorList:[], // 因子列表 
            isSearch:false, // 是否处于查询状态
            searchKeyWord:'', // 查询关键词
        };
    },
    watch:{
        type(){
            // 获取列表
            this.cleanSearch();
        },
        eventFieldList(){
            // 获取列表
            if (this.type === 1){
                this.cleanSearch();
            }
        },
        customerFieldList(){
            // 获取列表
            if (this.type === 0){
                this.cleanSearch();
            }
        }
    },
    mounted(){
        this.getList();
    },
    methods: {
        afterSearchFactorList(){
            return (
                this.factorList.filter(item => 
                    this.keyword.length !== 0 
                        ? item.showName.includes(this.keyword)
                        : true)
            );
        },
        // 点击新建流程
        newFactor(evt){
            if (this.$has('datacentre_scorerating_edit')){
                return false;
            }
            const factorRule = {
                scoringModelId: this.modelId,
                id: '',
                type: this.type,
                isTemplate: false,
                attributeOrEventId: evt.id,
                attributeOrEventInfo: evt,
            };
            this.$emit('create', factorRule);
        },
        cloneEv(){
            // 配合拖拽新建流程
        },
        // 拖拽新建流程
        cloneDone(evt) {
            if (this.$has('datacentre_scorerating_edit')){
                return false;
            }
            const factorList = this.afterSearchFactorList(); 
            // 拖拽新建流程
            const factorRule = {
                scoringModelId: this.modelId,
                id: '',
                type: this.type,
                isTemplate: false,
                attributeOrEventInfo: factorList[evt.oldIndex],
                attributeOrEventId: factorList[evt.oldIndex].id,
            };
            this.$emit('createByMove',{factorRule, index:evt.newIndex});
        },
        
        // 获取因子列表
        getList(){
            this.factorList = [];
            if (this.type === 0){
                this.factorList = this.customerFieldList.map(item=>({
                    ...item,
                    flag : true,
                    iconName : '',
                    eventName : '',
                    name:item.fieldCn,
                    type:item.fieldType,
                    showName : `${item.fieldCn}(${item.fieldName})`,
                }));
            } else if (this.type === 1){
                this.factorList = this.$parent.eventFieldList.map(item=>item.child.map(item=>({
                    ...item,
                    flag : true,
                    eventName : item.fieldName,
                    iconName : item.event_group,
                    showName : `${item.name}(${item.fieldName})`,
                }))).flat(1);
            }
        },
        // 查询输入时判断
        searchInput(){
            // 若当前输入参数与查询关键字一致且查询关键字不为空，则显示清空按钮，否则显示查询按钮
            if ( this.searchKeyWord === this.keyword && this.keyword !== ''){
                this.isSearch = true;
            } else {
                this.isSearch = false;
            }
        },
        // 关键字查询操作
        search(){
            if (this.$has('datacentre_scorerating_edit')){
                return false;
            }
            // 开启查询模式
            this.isSearch = true;
            // 注入关键字
            this.keyword = this.searchKeyWord;
        },
        // 清除查询操作
        cleanSearch(){
            // 关闭查询操作
            this.isSearch = false;
            this.searchKeyWord = '';
            this.keyword = '';
            this.getList();
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../../common/scss/base/_variables";
    @import "../../../../../common/scss/base/_mixin";
    .edit-model-options-plane-search-area-box{
        user-select: none;
        width:100%;
        box-sizing:border-box;
        height:100%;
        display:flex;
        flex-direction:column;
        align-items:center;
        justyify-content:flex-start;
        border-right:1px solid rgba(217,217,217,1);
        .search-box{
            box-sizing:border-box;
            width:90%;
            border-radius:8px;
            margin:10px auto;
            height:30px;
            .search-box-btn{
                cursor: pointer;
            }
        }
        .edit-model-options-plane-search-list{
            box-sizing:border-box;
            border-top:1px solid rgba(217,217,217,1);
            padding:10px;
            width:100%;
            height:calc(100% - 30px);
            font-size:12px;
            overflow-y:scroll;
            li{
                display:flex;
                width:100%;
                box-sizing: border-box;
                cursor: pointer;
                margin:6px 0;
                padding:4px 0;
                transition: all .2s;
                justify-content: center;
                align-items: center;
                span{
                    width:100%;
                    display: inline-block;
                    height:100%;
                    overflow: hidden;
                    text-overflow:ellipsis;
                    white-space: nowrap;
                }
                &:hover{
                    background-color:$theme;
                    color:#fff;
                }
                .icon{
                    border:none;
                }
            }
        }
    }
</style>
