<template>
    <div class="edit-model-options-plane-options-area-box">
        <!-- 分数统计 -->
        <p class="edit-model-options-plane-options-allpoint" v-text="`${$t('newScoring.fullScore')}: ${fullScore} / 100`"></p>
        <!-- 操作区域 -->
        <div class="edit-model-options-plane-options-list-area">
            <div class="edit-model-options-plane-options-list-scroll-box">
                <p v-if="!redTextShow && !isMoving && !scoringFactorList.length" class="edit-model-options-plane-options-list-empty">{{('newScoring.noFactor') | t}}</p>
                <draggable :options="{group:'factor',animation:150,ghostClass:'sortable-ghost',chosenClass:'chosenClass',scroll:true,scrollSensitivity:200}"
                    v-model="scoringFactorList"
                    @update="dragUpdate"
                    style="min-height: 100%; width:100%;">
                    <!-- 没有因子时显示提示语 -->
                    <!-- 操作单项 -->
                    <inline-loading  v-if='!redTextShow'/>
                    <template v-else>
                        <div class="edit-model-options-plane-options-list-items" v-for="(item,index) of scoringFactorList" :key="index">
                            <!-- 拖拽图标 -->
                            <i class="icon icon-tuozhuai1 edit-model-options-plane-options-list-items-drags"></i>
                            <!-- 因子基本信息 -->
                            <div class="edit-model-options-plane-options-list-items-title">
                                <svg aria-hidden="true" class="icon event-icon" v-if="item.type === 0 && fieldEventName(item).flag">
                                    <use xlink:href="#icon-shuxing"></use>
                                </svg>
                                <CustomerIcon v-if="item.type===1 && fieldEventName(item).flag" 
                                    :eventGroupName="fieldEventName(item).iconName"
                                    :eventName="fieldEventName(item).eventName" />
                                <span class="desc" v-text="fieldEventName(item).fieldName" :title="fieldEventName(item).fieldName" :class="{'red-text' : !fieldEventName(item).flag}"></span>
                            </div>
                            <!-- 因子备注信息=name字段 -->
                            <span class="edit-model-options-plane-options-list-items-desc" :title="item.name">{{item.name}}</span>
                            <!-- 规则数 -->
                            <span class="edit-model-options-plane-options-list-items-count"
                                v-text="`${$t('newScoring.ruleCount')}: ${item.rulesCount}`"></span>
                            <!-- 得分上限 -->
                            <span class="edit-model-options-plane-options-list-items-level"
                                v-text="`${$t('newScoring.scoreCeil')}: +${item.scoreCeil}`"></span>
                            <!-- 操作项 -->
                            <span class="edit-model-options-plane-options-list-items-option">
                                <!-- 编辑操作 -->
                                <button class="btn" :disabled="$has('datacentre_scorerating_edit')" :title="$t('newScoring.edit')"  @click="editFactor(item)">
                                    <svg aria-hidden="true" class="icon-round-pencil">
                                        <use xlink:href="#icon-round-pencil"></use>
                                    </svg>
                                </button>
                                <!-- 复制操作 -->
                                <button class="btn" :disabled="$has('datacentre_scorerating_edit')" :title="$t('newScoring.copy')" @click="copyFactor(item.id)">
                                    <svg aria-hidden="true" class="icon-copy">
                                        <use xlink:href="#icon-copy"></use>
                                    </svg>
                                </button>
                                <!-- 删除操作 -->
                                <button class="btn" @click="readyDel(item)"
                                        :disabled="$has('datacentre_scorerating_edit')"
                                        :title="$t('newScoring.delete')">
                                    <svg aria-hidden="true" class="icon-shanchu">
                                        <use xlink:href="#icon-shanchu"></use>
                                    </svg>
                                </button>
                            </span>
                        </div>
                    </template>
                </draggable>
            </div>
        </div>
        <!-- 删除评分因子二次确认弹框-->
        <confirm :title="$t('newScoring.delScoringFactor')" v-if="batchDel" @cancel="batchDel=false"
                 @confirm="delFactor">
            <div class="form-field">
                <span>{{ $t('newScoring.singleScore') }}</span>
            </div>
        </confirm>
    </div>
</template>

<script type="text/ecmascript-6">
import draggable from 'vuedraggable';
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
        isMoving: {
            type: Boolean,
            default: false
        },
    },
    components:{
        draggable,
        CustomerIcon
    },
    data () {
        return {
            fullScore:0, // 总分数
            totalPage:1, // 总页数
            pageSize: 50, // 配合排序,不添加分页,单页加载50条
            pageNumber:1, // 当前页码
            isLock:false, // 接口 节流锁
            batchDel: false, //删除弹窗显隐
            scoringFactorList:[], // 当前模型因子数
        };
    },
    computed: {
        // 设置显示图标以及显示文案
        fieldEventName(){
            return function(evtObj){
                return this.$parent.fieldEventName(evtObj);
            };
        },
        redTextShow () {
            return this.$parent.reqNum === this.$parent.eventFieldList.length;
        },
    },
    watch:{
        type(){
            this.reload();
        },
    },
    mounted(){
        // 初始化获取对应因子参数列表
        this.getScoringList();
    },
    methods: {
        // 获取参数进行排序操作 配合拖拽添加因子使用
        // index 因子需要排到的顺序
        getListToSort(index){
            // 获取列表参数
            ScoringV2
                .getScoringList({
                    keyword: '',
                    pageNumber: 1,
                    type: this.type,
                    isTemplate: false,
                    pageSize: this.pageSize,
                    scoringModelId: this.$route.query.modelId
                })
                .then((res) => {
                    // 获取新添加待排序的因子
                    const stepItem = res.body.data.factorList[res.body.data.factorList.length - 1];
                    // 生成排除待排序因子的列表
                    const list = res.body.data.factorList.filter((item,index)=>
                        index !== (res.body.data.factorList.length - 1));
                    // 添加待排序因子
                    list.splice(index,0,stepItem);
                    // 进行排序
                    const cleanList = list.map((item,index)=>({id:item.id,sortNumber:index + 1}));
                    ScoringV2.sortScoringFactor(cleanList)
                        .then((res) => {
                            // 排序后重新加载页面参数
                            this.reload();
                        })
                        .catch((err) => {
                            if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                                this.$toast(err.body.message, 'warn');
                            }
                        });
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                    }
                });
        },
        // 拖拽更新列表排序
        dragUpdate(){
            if (this.isLock) return;
            this.isLock = true;
            // 清洗列表
            const list = this.scoringFactorList.map((item,index)=>({id:item.id,sortNumber:index + 1}));
            // 调用接口
            ScoringV2.sortScoringFactor(list)
                .then((res) => {
                    this.isLock = false;
                    this.$toast(this.$t('sendChannel.success'), 'success');
                    // 重新加载列表
                    this.reload();
                })
                .catch((err) => {
                    this.isLock = false;
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                    }
                });
        },
        // 重置参数并获取列表参数
        reload(){
            // 重置参数
            this.pageNumber = 1;
            this.fullScore = 0;
            this.scoringFactorList = [];
            this.totalPage = 1;
            // 获取列表
            this.getScoringList();
        },
        // 获取因子列表
        getScoringList() {
            if (this.isLock) return;
            this.lock = true;
            ScoringV2
                .getScoringList({
                    keyword: '',
                    type: this.type,
                    isTemplate: false,
                    pageSize: this.pageSize,
                    pageNumber: this.pageNumber,
                    scoringModelId: this.$route.query.modelId,
                })
                .then((res) => {
                    this.lock = false;
                    this.fullScore = res.body.data.fullScore || 0;
                    this.scoringFactorList = this.scoringFactorList.length === 0 ? 
                        res.body.data.factorList :
                        this.scoringFactorList.concat(res.body.data.factorList);
                    this.totalPage = res.body.data.totalPage;
                })
                .catch((err) => {
                    this.lock = false;
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                    }
                });
        },
        //编辑因子
        editFactor(factor) {
            // 组合参数
            const factorRule = {
                scoringModelId: this.modelId,
                id: factor.id,
                type: factor.type,
                isTemplate: factor.isTemplate,
                attributeOrEventId: factor.attributeOrEventId,
            };
            // 调起方法
            this.$emit('editFactor',factorRule);
        },
        //复制因子
        copyFactor(id) {
            if (this.isLock) return;
            this.isLock = true;

            const editFactorScore = this.scoringFactorList.find(item=>item.id === id).scoreCeil;
            const afterScore = this.fullScore + editFactorScore;
            if ( afterScore > 100){
                this.$toast(`${this.$t('newScoring.theFullScoreShallNotBeGreaterThan100')}（${this.$t('newScoring.now')}：${afterScore}），${this.$t('newScoring.factorCannotBeCopied')}`, 'warn');
                this.isLock = false;
                return false;
            }
            
            ScoringV2
                .copyFactor(id, this.modelId)
                .then(() => {
                    this.$toast(this.$t('sendChannel.success'), 'success');
                    this.isLock = false;
                    this.reload();
                })
                .catch((err) => {
                    this.isLock = false;
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                    }
                    if (err.body.errorCode === 'FACTOR_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.reload();
                    }
                });
        },
        /**
         * ready del
         * @param type = 0单个删除/type=1:批量删除
         */
        readyDel(factor) {
            this.batchDel = true;
            this.curFactor = factor;
        },
        /**
         * 单个/批量删除因子
         */
        delFactor() {
            this.batchDel = false;
            let factorIdArray = [];
            factorIdArray.push(this.curFactor.id);
            ScoringV2
                .delFactor(factorIdArray, this.modelId)
                .then(() => {
                    this.$toast(this.$t('newScoring.deletedSuccessfully'), 'success');
                    this.reload();
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                    }
                    if (err.body.errorCode === 'FACTOR_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.reload();
                    }
                });
            this.checkedItem = [];
            this.curFactor = '';
        },
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../../common/scss/base/_variables";
    @import "../../../../../common/scss/base/_mixin";
    .icon{
        border:none;
    }
    .edit-model-options-plane-options-area-box{
        user-select: none;
        box-sizing:border-box;
        height:100%;
        width:100%;
        padding-right:10px;
        .edit-model-options-plane-options-allpoint{
            box-sizing: border-box;
            width:100%;
            height:50px;
            line-height:50px;
        }
        .edit-model-options-plane-options-list-area{
            width:100%;
            height:calc(100% - 50px);
            .edit-model-options-plane-options-list-scroll-box{
                position: relative;
                height: 100%; 
                width:100%;
                overflow-y:scroll;
                font-size:12px;
                .edit-model-options-plane-options-list-empty{
                    position: absolute;
                    top: 25%;
                    width: 100%;
                    text-align: center;
                }
                .edit-model-options-plane-options-list-items{
                    margin:10px;
                    border:1px solid rgba(217,217,217,1);
                    border-radius: 10px;
                    box-shadow: 0px 0px 5px 1px rgba(217,217,217,1);
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                    &:first-child {
                        margin-top: 0;
                    }
                    .edit-model-options-plane-options-list-items-title{
                        display:flex;
                        width:30%;
                        align-items: center;
                        span{
                            display:inline-block;
                            width:100%;
                            overflow: hidden;
                            text-overflow:ellipsis;
                            white-space: nowrap;
                        }
                    }
                    .edit-model-options-plane-options-list-items-desc{
                        width:20%;
                        display:inline-block;
                        overflow: hidden;
                        text-overflow:ellipsis;
                        white-space: nowrap;
                    }
                    .edit-model-options-plane-options-list-items-count{
                        min-width:15%;
                        flex-shrink: 0;
                        flex-grow: 1;
                    }
                    .edit-model-options-plane-options-list-items-level{
                        min-width:15%;
                        flex-shrink: 0;
                        flex-grow: 1;
                    }
                    .edit-model-options-plane-options-list-items-option{
                        padding:10px;
                        box-sizing: border-box;
                        flex-shrink: 0;
                        text-align: right;
                        flex-grow: 1;
                        button{
                            width:20px;
                            padding:0 2px;
                            margin:0;
                            svg{
                                width:20px;
                                height:20px;
                            }
                            .icon-round-pencil {
                                fill: $theme;
                            }
                            .icon-copy {
                                fill: $blue;
                            }
                            .icon-shanchu {
                                fill: $light-red;
                            }
                        }
                    }
                    .edit-model-options-plane-options-list-items-drags{
                        margin-right:10px;
                    }
                }
            }
        }
    }
</style>
