<template>
    <button class="start-end-btn-area" @click="changeStartEnd" :disabled="$has('datacentre_scorerating_active')">
        <i
            class="icon edit-icon start-fn"
            :class="getSwitchStatus ? 'edit-icon-kaishi icon-kaishi' : 'edit-icon-pause icon-pause'" 
            :title="getSwitchStatus ? $t('newScoring.activate') : $t('newScoring.deactivate')"
            >
            <span v-text="getSwitchStatus ? $t('newScoring.activate') : $t('newScoring.deactivate')" class="centent"></span>
        </i>
    </button>
</template>
<script type="text/ecmascript-6">
import {ScoringV2} from '@/api';
export default {
    props: {
        modelStatus:{
            type:Number,
            default:0
        },
        modelId:{
            type:Number,
            default:0
        },
    },
    data () {
        return {
            switchValue:false, // 按钮显示状态控制, true: 模型未启用，false: 模型已启用
            isLock:false // 接口执行锁
        };
    },
    computed:{
        getSwitchStatus(){
            // 保存参数 用于判断
            this.initSwitchValue();
            // status 0 未启用，显示 启用 | status 1 已启用，显示 停用 | 2 草稿状态 等同于未启用
            return !(this.modelStatus === 1);
        }
    },
    methods: {
        initSwitchValue(){
            // status 0 未启用，显示 启用 | status 1 已启用，显示 停用 | 2 草稿状态 等同于未启用
            this.switchValue = !(this.modelStatus === 1);
        },
        // 更改模型状态
        changeStartEnd(){
            if (this.isLock) return false;
            this.isLock = true;
            if (this.switchValue){
                ScoringV2
                    .modelStatus(this.modelId, this.switchValue ? 1 : 0)
                    .then((res) => {
                        this.isLock = false;
                        this.switchValue = !this.switchValue;
                        this.$toast(this.$t('menu.synSuccess'), 'success');
                        this.$emit('changeStartEnd');
                    })
                    .catch((err) => {
                        this.isLock = false;
                        if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                            this.$toast(err.body.message, 'warn');
                            this.$emit('changeStartEnd');
                        }
                    });
            } else {
                //停用
                this.$confirm(this.$t('newScoring.deactivateScoringModel'), this.$t('newScoring.deactivateScoringContent'))
                    .then(sure => {
                        if (sure) {
                            ScoringV2
                                .modelStatus(this.modelId, this.switchValue ? 1 : 0)
                                .then((res) => {
                                    this.isLock = false;
                                    this.switchValue = !this.switchValue;
                                    this.$toast(this.$t('menu.synSuccess'), 'success');
                                    this.$emit('changeStartEnd');
                                })
                                .catch((err) => {
                                    this.isLock = false;
                                    if (err.body.errorCode === 'MODEL_DOES_NOT_EXIST') {
                                        this.$toast(err.body.message, 'warn');
                                        this.$emit('changeStartEnd');
                                    }
                                });
                        } else {
                            this.isLock = false;
                        }
                    });
            }
        }
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss" scope>
    @import "../../../../common/scss/base/_variables";
    @import "../../../../common/scss/base/_mixin";
    .start-end-btn-area{
        padding: 0;
        border: none;
        background: #fff;
        .edit-icon {
            cursor: pointer;
            display: inline-block;
            padding: 0 10px;
            margin:0 4px;
            white-space:nowrap;
            border-radius: 5px;
        }
        .edit-icon-kaishi {
            padding:0 20px;
            color: #fff;
            background-color: $theme;
            .centent{
                font-style: normal;
                display:inline-block;
                text-indent:4px;
            }
        }
        .edit-icon-pause {
            padding:0 20px;
            color: #fff;
            background-color: $light-red;
            .centent{
                font-style: normal;
                display:inline-block;
                text-indent:4px;
            }
        }
    }
</style>
