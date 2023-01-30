<template>
    <!-- 新建评分模型 -->
    <modal :title="$t('newScoring.levelModelTitle')" @close="close(0)">
            <div class="edit-model-level-area-modal-area">
                <!-- 维度模块 -->
                <div class="edit-model-level-area-modal" v-for="(item, index) of currentList" :key="index">
                    <!-- 维度标题 -->
                    <p class="edit-model-level-area-modal-title">
                        {{item.key | t}}
                        <i v-if="index === 1" class="icon icon-yiwen1" v-title:top="$t('newScoring.tipLevel')"></i>
                    </p>
                    <!-- 维度参数 -->
                    <div class="edit-model-level-area-modal-zone-area">
                        <div class="edit-model-level-area-modal-zone">
                            <template v-for="(selfItem, selfIndex) of item.list">
                                <!-- 等级指标 -->
                                <span 
                                    class="edit-model-level-area-modal-name" 
                                    :key="`${selfItem.gradeId}_1`" 
                                    :style="getRealWidth(index,selfIndex)">
                                    {{selfItem.gradeName}}
                                </span>
                                <!-- 操作指标 -->
                                <span
                                    class="edit-model-level-area-modal-slider"
                                    v-if="selfIndex + 1 !== item.list.length"
                                    :key="`${selfItem.gradeId}_2`"
                                    @mousedown="dragstart(index,selfIndex)">
                                    <!-- 操作游标 -->
                                    <span class="edit-model-level-area-modal-slider-buoy">{{selfItem.value}}</span>
                                </span>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                @click="close(0)">
            <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                :disabled="$has('datacentre_scorerating_edit')"
                @click="editScorinConfirm">
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
import {ScoringV2} from '@/api';
export default {
    props:{
        modelId:{
            type:Number,
            default:0
        },
        list:{
            type:Array,
            default:[]
        }
    },
    data () {
        return {
            zt_X:0, // 当前操作项坐标
            isLock: false, // 接口 节流锁
            singleLen:500, // 等级参数长度系数
            zt_X_index:[], // 当前操作项id
            currentList:[] // 当前操作列表
        };
    },
    computed:{
        // 设置每项宽度
        getRealWidth(){
            return function(index, selfIndex){
                return `width:${this.currentList[index].list[selfIndex].length}px;`;
            };
        }
    },
    mounted(){
        this.cleanList();
    },
    methods: {
        // 初始化清理参数
        cleanList(){
            this.currentList = JSON.parse(JSON.stringify(this.list)).map(item=>{
                const cleanList = item.list.map((ltitem, index)=>({
                    gradeId:ltitem.gradeId,
                    gradeName: ltitem.gradeName,
                    length: (ltitem.max - ltitem.min) / 100 * this.singleLen === 0 
                        ? 3 
                        : (ltitem.max - ltitem.min) / 100 * this.singleLen,
                    value: (item.list.length - 1) === index ? ltitem.max : ltitem.max + 1
                }));
                return {...item,list:cleanList};
            });
        },
        // 鼠标按压事件
        dragstart(index,selfIndex){
            // 配置默认参数
            // 当前操作项初始坐标
            // 当前操作项id
            this.zt_X = event.clientX;
            this.zt_X_index = [index,selfIndex];
            // 唤醒方法
            window.addEventListener('mousemove', this.mousemoveFn, true);
            window.addEventListener('mouseup', this.mouseupFn, true);
        },
        // 鼠标拖拽事件
        mousemoveFn(){
            // 获取参数项比例
            function getLengthValue(len) {
                const allNum = this.currentList[this.zt_X_index[0]].list.map(item=>item.length).reduce((a,b)=>a + b); 
                return Number((len / allNum * 100).toFixed(0));
            }
            // 如果当前操作项以及临近项为空的情况，则阻止操作
            if (getLengthValue
                .call(this,
                    this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1]].length + (event.clientX - this.zt_X))
                <= 0){
                return false;
            }
            if (getLengthValue
                .call(this,
                    this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1] + 1].length 
                    - (event.clientX - this.zt_X)) 
                <= 0 && this.currentList[this.zt_X_index[0]].list.length - 2 !== this.zt_X_index[1]){
                return false;
            }
            if (getLengthValue
                .call(this,
                    this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1] + 1].length 
                    - (event.clientX - this.zt_X)) 
                < 0 && this.currentList[this.zt_X_index[0]].list.length - 2 === this.zt_X_index[1]){
                return false;
            }
            // 末位项单独处理长度分数
            if (getLengthValue
                .call(this,
                    this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1] + 1].length 
                    - (event.clientX - this.zt_X)) 
                    === 0 && this.currentList[this.zt_X_index[0]].list.length - 2 
                        === this.zt_X_index[1]){
                this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1]].length 
                += (event.clientX - this.zt_X); 
                this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1] + 1].length 
                -= (event.clientX - this.zt_X);

                this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1]].length 
                += this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1] + 1].length; 
                this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1] + 1].length 
                = 0;
            }
            // 更改当前操作项以及临近项的宽度数据
            this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1]].length += (event.clientX - this.zt_X); 
            this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1] + 1].length -= (event.clientX - this.zt_X);
            // 更改当前操作项坐标
            this.zt_X = event.clientX;
            // 获取待修改参数
            const changeValue = getLengthValue
                .call(this,
                    this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1]].length 
                        + (event.clientX - this.zt_X));
            // 配置数值参数列表
            let valueList = this.currentList[this.zt_X_index[0]].list.map(item => item.value);
            // 配置用于相加的数值项
            const configValueList = valueList.filter((item,index) => index < this.zt_X_index[1]);
            // 修改对应value值
            valueList[this.zt_X_index[1]] = configValueList.length === 0 
                ? changeValue 
                : changeValue + configValueList[configValueList.length - 1];
            valueList = valueList.map(item => item > 100 ? 100 : item);
            // 重复分数情况警告不通过
            if ( new Set(valueList.filter((item,index)=>index < valueList.length - 1)).size 
            !== (this.currentList[this.zt_X_index[0]].list.length - 1)){
                return false;
            }
            // 更改当前操作项以及临近项的宽度数据
            this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1]].length += (event.clientX - this.zt_X); 
            this.currentList[this.zt_X_index[0]].list[this.zt_X_index[1] + 1].length -= (event.clientX - this.zt_X);
            // 更新参数
            this.currentList = this.currentList.map((item, index)=>
                index !== this.zt_X_index[0]
                    ? item
                    : {...item,list:item.list.map((item, index)=>({...item,value:valueList[index]}))}
            );
        },
        // 鼠标抬起事件
        mouseupFn(){
            // 参数回归默认值
            this.zt_X = 0;
            this.zt_X_index = [];
            
            // 清除事件
            window.removeEventListener('mousemove', this.mousemoveFn, true);
            window.removeEventListener('mouseup', this.mouseupFn, true);
        },
        //关闭等级修改弹框
        close (data) {
            this.isLock = false;
            this.mouseupFn();
            this.$emit('close', data);
            this.$nextTick(()=>{
                this.currentList = [];
            });
        },
        //保存等级修改弹框
        editScorinConfirm () {
            if (this.isLock) return false;
            this.isLock = true;
            // 清洗参数
            const grades = this.currentList.map(item=>{
                const valueList = [0,...item.list.map(item=>item.value)];
                return item.list.map((ltitem,index)=>({
                    gradeId:ltitem.gradeId,
                    gradeName:ltitem.gradeName,
                    type:ltitem.type,
                    min:valueList[index],
                    max:(item.list.length - 1) === index ? valueList[index + 1] : valueList[index + 1] - 1
                }));
            }).flat(1);
            // 调用接口
            ScoringV2
                .editGrades(this.modelId, grades)
                .then(() => {
                    this.isLock = false;
                    this.$toast(this.$t('menu.synSuccess'), 'success');
                    this.close(1);
                })
                .catch((err) => {
                    this.isLock = false;
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                    }
                });
        }
    },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../../common/scss/base/_variables';
@import '../../../../../common/scss/base/_mixin';
        .edit-model-level-area-modal-area{
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:space-between;
        }
        .edit-model-level-area-modal{
            padding-bottom:20px;
            margin-bottom:10px;
            width:100%;
            box-sizing:border-box;
            font-size: 12px;
            .edit-model-level-area-modal-title{
                text-align:left;
                padding-bottom:40px;
            }
            .edit-model-level-area-modal-zone-area{
                width:560px;
                display:flex;
                flex-direction:row;
                justify-content:space-between;
                align-items:center;
                .edit-model-level-area-modal-zone{
                    width:100%;
                    display:flex;
                    flex-direction:row;
                    align-items:center;
                    justify-content:center;
                    position: relative;
                    
                    .edit-model-level-area-modal-buoy{
                        white-space: nowrap;
                        border-top: 10px solid rgb(218,218,218);
                        width:1px;
                        position: absolute;
                        bottom: -2px;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        transform:translate(0%,100%);
                    }
                    .edit-model-level-area-modal-name{
                        display:inline-block;
                        user-select: none;
                        width:100px;
                        height:30px;
                        line-height: 30px;
                        text-align: center;
                        overflow: hidden;
                        text-overflow:ellipsis;
                        white-space: nowrap;
                        &:nth-child(1){
                            background-color:rgb(242,242,242);
                        }
                        &:nth-child(3){
                            background-color:rgb(252,239,203);
                        }
                        &:nth-child(5){
                            background-color:rgb(249,221,186);
                        }
                        &:nth-child(7){
                            background-color:rgb(255,193,185);
                        }
                    }
                    .edit-model-level-area-modal-slider{
                        user-select: none;
                        cursor: pointer;
                        display:inline-block;
                        background-color: rgb(218,218,218);
                        width:20px;
                        height:30px;
                        position: relative;
                        .edit-model-level-area-modal-slider-buoy{
                            white-space: nowrap;
                            transform: translate(-50%, -100%);
                            font-size: 12px;
                            position: absolute;
                            top: 0;
                            left: 50%;
                            display: flex;
                            background-color:#fff;
                            flex-direction: row;
                            width:16px;
                            height:16px;
                            justify-content: center;
                            border: 1px solid rgb(218,218,218);
                            top: -10px;
                            &::after{
                                content:'';
                                position: absolute;
                                bottom:-1px;
                                left:50%;
                                transform: translate(-50%,50%) rotate(45deg);
                                width:5px;
                                height:5px;
                                background-color:#fff;
                                border-right: 1px solid rgb(218,218,218);
                                border-bottom: 1px solid rgb(218,218,218);
                            }
                        }
                        &:hover{
                            box-sizing:border-box;
                            border: 1px solid rgb(126, 126, 126);
                        }
                    }
                    

                }
            }
        }
</style>