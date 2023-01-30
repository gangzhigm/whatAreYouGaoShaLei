<template>
    <div class="scoring-edit">
        <!-- 面包屑导航 -->
        <div class="content-view"><crumbs :crumbs="crumbs" /></div>
        <div class="page-head">
            <div class="content-view opt-head">
                <!-- 配置按钮 -->
                <div class="left-opt">
                    <svg aria-hidden="true" class="cursor-pointer" @click="$router.push({name:'scorerating'})">
                        <use xlink:href="#icon-fanhui1"></use>
                    </svg>
                    <span class="model-name" :title="modelInfo.modelName">{{modelInfo.modelName}}</span>
                    <button class="icon icon-setting" v-title:top="$t('newScoring.edit')" @click="openConfigModal" :disabled="$has('datacentre_scorerating_edit')"></button>
                </div>
                <!-- 启用按钮 -->
                <div class="right-opt">
                    <StartEndBtn :modelStatus="modelInfo.status" :modelId="modelId" @changeStartEnd="changeStartEnd"/>
                </div>
            </div>
        </div>
        <div class="content-view edit-model">
            <!-- 等级模块 -->
            <EditModelLevel :modelId="modelId"/>
            <!-- 因子模块 -->
            <EditModelOptions :modelId="modelId"/>
        </div>
        <!-- 配置弹框 -->
        <ConfigModal 
            :modelId="modelId"
            :modelName="modelInfo.modelName"
            :modelScoringRange="modelInfo.scoringRange" 
            v-if="configModalSwitch" @close="closeConfigModal"/>
    </div>
</template>

<script type="text/ecmascript-6">
import {ScoringV2} from '@/api';
// 基本配置功能
import ConfigModal from './components/config-modal.vue';
// 启用停用功能
import StartEndBtn from './components/start-end-btn.vue';
// 等级功能
import EditModelLevel from './components/level_fn/edit-model-level.vue';
// 因子功能
import EditModelOptions from './components/options_fn/edit-model-options.vue';
export default {
    computed: {
        //面包屑
        crumbs() {
            return [
                {name: 'index', text: 'Dmartech'},
                {name: 'scorerating', text: this.$t('newScoring.newScoring')},
                Object.assign({}, this.$route, {text: this.modelInfo.modelName})
            ];
        }
    },
    components:{
        StartEndBtn,
        ConfigModal,
        EditModelLevel,
        EditModelOptions
    },
    data () {
        return {
            modelId:0, // 评分模型ID 从URL.query获取
            modelInfo:{}, // 评级模型信息 从接口获取
            configModalSwitch: false, // 配置弹框开关
        };
    },
    beforeMount(){
        // 获取modelId
        this.modelId = isNaN(this.$route.query.modelId) ? 0 : Number(this.$route.query.modelId);
    },
    mounted(){
        // 获取模型参数
        this.getModelInfo();
    },
    methods: {
        //获取模版详情
        getModelInfo() {
            ScoringV2
                .getModelInfo(this.modelId)
                .then((res) => {
                    this.modelInfo = res.body.data;
                })
                .catch((err) => {
                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                        this.$toast(err.body.message, 'warn');
                        this.$router.back();
                    }
                });
        },
        // 开启配置弹框
        openConfigModal(){
            this.configModalSwitch = true;
        },
        // 关闭配置弹框 data {Number} 0: 关闭 | 1: 执行
        closeConfigModal(data = null){
            // 为执行结束关闭弹框，重新获取模型基本信息参数
            if (data === 1) {
                this.getModelInfo();
            }
            this.configModalSwitch = false;
        },
        // 切换启用开关，重新获取模型基本信息参数
        changeStartEnd(){
            this.getModelInfo();
        },
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/_variables";
    @import "../../../common/scss/base/_mixin";
    .scoring-edit {
        .page-head{
            .opt-head{
                display:flex;
                flex-direction:row;
                align-items:center;
                justify-content: space-between;
               .left-opt {
                    max-width: 35em;
                    display: flex;
                    align-items: center; /*  子元素相对父元素垂直居中 */
                    .model-name {
                        display: inline-block;
                        margin: 0 10px;
                        font-weight: bold;
                        font-size: 18px;
                        max-width: 18em;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        white-space: nowrap;
                    }
                    svg {
                        width: 16px;
                        height: 16px;
                        fill: $theme;
                    }
                    .icon-setting{
                        background:#fff;
                        cursor: pointer;
                    }
                }
                .right-opt {
                    cursor: default;
                }
            }
        }
        .edit-model {
            height: calc(100vh - #{$header-height + $toolbar-height + $page-head-height + 20px});
            margin: 20px 20px 0 20px;
            overflow: hidden;
        }
    }
    .cursor-pointer{
        cursor: pointer
    }
</style>
