<template>
    <div class="edit-model-level-area">
        <div class="edit-model-level-area-title-area">
            <!-- 模块标题 -->
            <span class="edit-model-level-area-title-text" v-text="$t('newScoring.levelModelTitle')"></span>
            <!-- 编辑按钮 -->
            <button class="icon icon-setting cursor-pointer" v-title:top="$t('newScoring.edit')" :disabled="$has('datacentre_scorerating_edit')" @click="openLevelModal"></button>
        </div>
        <!-- 显示信息区域 -->
        <div class="edit-model-level-area-block-area">
            <div class="edit-model-level-area-block" v-for="(item, index) of levelList" :key="index">
                <p class="edit-model-level-area-block-title"  v-text="$t(`${item.key}`)"></p>
                <div class="edit-model-level-area-block-zone-area">
                    <div class="edit-model-level-area-block-zone" :style="getWidth(item.list)" v-for="lsitem of item.list" :key="`${index}${lsitem.gradeId}`">
                        <span class="edit-model-level-area-block-name">{{lsitem.gradeName}}</span>
                        <span class="edit-model-level-area-block-value">{{getDesc(lsitem)}}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 等级编辑弹框 -->
        <LevelModal 
            @close="modalClose"
            :list="levelList"
            :modelId="this.modelId"
            v-if="levelModalSwitch"/>
    </div>
</template>
<script type="text/ecmascript-6">
import {ScoringV2} from '@/api';
const singleLen = 500;
// 等级修改组件
import LevelModal from './level-modal.vue';
export default {
    props: {
        modelId:{
            type:Number,
            default:0
        }
    },
    components:{
        LevelModal
    },
    mounted(){
        //  获取模块等级信息
        this.getGrades();
    },
    watch:{
        modelId(){
            this.getGrades();
        }
    },
    data () {
        return {
            singleLen: 500, // 单模块长度系数
            levelModalSwitch: false, // 等级修改弹框开关
            levelList:[ // 等级列表 [ 属性维度，事件维度 ]
                {
                    list:[],
                    key: 'newScoring.levelModelAttrTitle'
                },
                {
                    list:[],
                    key: 'newScoring.levelModelEventTitle'
                }
            ]
        };
    },
    computed: {
        // 用于设定单个等级长度
        getWidth(){
            return function(list){
                return `width:${Math.floor(singleLen / list.length)}px`;
            };
        },
        // 用于设定单个等级显示文案
        getDesc(){
            return function(item){
                return item.min === item.max ? `${item.max}分` : `${item.min}~${item.max}分`;
            };
        },
    },
    methods: {
        //获取等级
        getGrades() {
            ScoringV2
                .getGrades(this.modelId)
                .then((res) => {
                    // use by test
                    // 评分等级类型 1：属性维度等级、2：事件维度等级
                    const propList = res.body.data.grades.filter(item=>item.type === 1);
                    const eventList = res.body.data.grades.filter(item=>item.type === 2);
                    this.levelList[0].list = propList;  
                    this.levelList[1].list = eventList;  
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                    }
                });
        },
        // 开启等级修改弹框
        openLevelModal(){
            this.levelModalSwitch = true;
        },
        // 关闭等级修改弹框 参数为1时则为执行后关闭，重新获取模型等级参数
        modalClose(data){
            if (data === 1){
                this.getGrades();
            }
            this.levelModalSwitch = false;
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../../common/scss/base/_variables";
    @import "../../../../../common/scss/base/_mixin";
    .edit-model-level-area{
        background: #ffffff;
        box-sizing:border-box;
        padding:10px;
        .edit-model-level-area-title-area{
            display:flex;
            align-items:center;
            line-height: $input-field-height;
            .edit-model-level-area-title-text{
                font-size: 14px;
            }
            .icon {
                background: #fff;
            }
        }
        .edit-model-level-area-block-area{
            display:flex;
            flex-direction:row;
            align-items:center;
            justify-content:space-between;
            font-size:12px;
        }
        .edit-model-level-area-block{
            width:46%;
            box-sizing:border-box;
            .edit-model-level-area-block-title{
                text-align:center;
                padding-bottom:10px;
            }
            .edit-model-level-area-block-zone-area{
                display:flex;
                flex-direction:row;
                justify-content:space-between;
                align-items:center;
                .edit-model-level-area-block-zone{
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    .edit-model-level-area-block-name{
                        padding:10px 0;
                        width:100%;
                        text-align:center;
                    }
                    .edit-model-level-area-block-value{
                        padding:4px 0;
                    }
                    &:nth-child(1){
                        .edit-model-level-area-block-name{
                            background-color:rgb(242,242,242);
                        }
                    }
                    &:nth-child(2){
                        .edit-model-level-area-block-name{
                            background-color:rgb(252,239,203);
                        }
                    }
                    &:nth-child(3){
                        .edit-model-level-area-block-name{
                            background-color:rgb(249,221,186);
                        }
                    }
                    &:nth-child(4){
                        .edit-model-level-area-block-name{
                            background-color:rgb(255,193,185);
                        }
                    }
                }
            }
        }
    }
</style>
