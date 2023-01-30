<template>
    <!-- 新建评分模型 -->
    <modal :title="$t('newScoring.configTitle')" @close="editScorinCancel(0)">
        <!-- 模型名称 -->
        <div class="form-field">
            <label class="label">{{'newScoring.modelName' | t}}</label>
            <input type="text" class='input' v-model.trim="form.modelName"
                :placeholder="$t('newScoring.enterUpTo100Characters')" maxLength="100">
            <p class="error" v-if="showError&&!form.modelName" style="margin-left:130px;">{{errorMsg}}</p>
        </div>
        <!-- 评分范围 -->
        <div class="form-field">
            <label class="label">{{'newScoring.scoringRange' | t}}</label>
            <div class="contacts-radio">
                <radio :source=1 v-model="form.isAllContacts">{{'newScoring.allContacts' | t}}</radio>
                <radio :source=0 v-model="form.isAllContacts">
                    {{'newScoring.newContactsFront' | t}}
                    <number-input class='input' v-model="form.scoringDay" :max=365 :min=1
                        @sync="scoringDayChange" />
                    {{'newScoring.newContactsAfter' | t}}
                    <span class="icon icon-help" v-title="$t('newScoring.newContactsHover')"></span>
                </radio>
            </div>
        </div>
        <!-- 运行机制 -->
        <div class="form-field how-to-work">
            <label class="label">{{'newScoring.howToWork' | t}}</label>
            <p>{{'newScoring.howToWorkContent' | t}}</p>
        </div>
        <template v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                @click="editScorinCancel(0)">
            <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')"
                :disabled="$has('datacentre_scorerating_edit')"
                @click="editScorinConfirm">
        </template>
    </modal>
</template>
<script type="text/ecmascript-6">
import { ScoringV2 } from '@/api';
export default {
    props:{
        modelId:{
            type:Number,
            default:0
        },
        modelScoringRange:{
            type:Number,
            default:0
        },
        modelName:{
            type:String,
            default:''
        },
    },
    data () {
        return {
            form: {
                modelName: '',
                scoringDay: 30,
                isAllContacts: 1,   // 1全部联系人，0新建联系人
            },
            errorMsg: '',//错误提示
            isLock: false,//提交 节流锁
            showError: false, // 是否展示错误信息
        };
    },
    mounted(){
        // 如果参数modelScoringRange为0,则为全部联系人模式
        if (this.modelScoringRange === 0){
            this.form.isAllContacts = 1;
            this.form.scoringDay = 30;
        // 如果参数modelScoringRange不为0,则为指定联系人模式
        } else {
            this.form.isAllContacts = 0;
            this.form.scoringDay = this.modelScoringRange;
        }
        this.form.modelName = this.modelName;
    },
    methods: {
        //关闭‘新建评分模型’
        editScorinCancel (data = null) {
            this.isLock = false;
            this.showError = false;
            this.$emit('close',data);
        },
        //保存‘新建评分模型’
        editScorinConfirm () {
            if (this.isLock) return;
            this.isLock = true;
            if (!this.form.modelName) {
                this.isLock = false;
                this.showError = true;
                this.errorMsg = this.$t('newScoring.dataRequired');
                return;
            }
            ScoringV2.editModelName(
                this.modelId, 
                this.form.modelName, 
                this.form.isAllContacts === 1 ? 0 : this.form.scoringDay)
                .then(({ body: { data } }) => {
                    this.editScorinCancel(1);
                    this.$toast(this.$t('common.createSuccess'), 'success');
                })
                .catch(({ body }) => {
                    this.isLock = false;
                    if (body.errorCode === 'MODEL_NAME_DUPLICATION') {
                        this.showError = true;
                        this.errorMsg = this.$t('newScoring.modelNamesCannotBeDuplicated');
                    }
                });
        },
        scoringDayChange (val) {
            if (val === '') {
                this.form.scoringDay = 1;
            }
        },
    },
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../../../common/scss/base/_variables';
@import '../../../../common/scss/base/_mixin';
    .form-field {
        .error {
            color: $light-red;
        }
    }
    .how-to-work {
        p {
            width: 440px;
            display: inline-block;
        }
    }
    .contacts-radio {
        width: 440px;
        display: inline-block;
        .radio {
            input {
                width: 30px;
                margin: 0 5px;
            }
        }
        .radio:nth-child(1) {
            margin-right: 300px;
        }
        .radio + .radio {
            margin-left: 0;
        }
    }
</style>