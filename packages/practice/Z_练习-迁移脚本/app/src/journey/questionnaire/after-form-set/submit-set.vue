<template>
    <div>
        <!--        表单-全局设置-提交设置-->
        <div class="form-sumbit-set">
            <h3>{{'form.subSet' | t}}</h3>
            <div class="form-field flex">
                <label class="label">{{'form.submissionsPer' | t}}</label>
                <div class="single-sub">
                    <ul class="change-limit-ul">
                        <li class="change-limit" :class="{active:singleFlag}" @click="singleFlag=true">{{'form.Unlimited' | t}}</li>
                        <li class="change-limit" :class="{active:!singleFlag}" @click="singleSubmit">{{'form.onlyOnce' | t}}</li>
                    </ul>
                    <div v-show="!singleFlag">
                        <div class="limit-num">
                            <span>{{'form.submissionPer' | t}}</span>
                            <selector :options="questionList" v-model="questionId"></selector>
                            <span>{{'form.one' | t}}</span>
                        </div>
                        <span>{{'form.AlreadySubmitted' | t}}</span>
                        <input type="text" class="input hg" maxlength="50" v-model="singleTips">
                    </div>
                </div>
            </div>
            <div class="form-field flex">
                <label class="label">{{'form.totalNumber' | t}}</label>
                <div class="single-sub">
                    <ul class="change-limit-ul">
                        <li class="change-limit" :class="{active:totalFlag}" @click="totalFlag=true">{{'form.Unlimited' | t}}</li>
                        <li class="change-limit" :class="{active:!totalFlag}" @click="totalFlag=false">{{'form.custom' | t}}</li>
                    </ul>
                    <div v-show="!totalFlag">
                        <div class="limit-num">
                            {{'form.maximum' | t}} <number-input class="input" :max="1000000" v-model="totalLimit"></number-input> {{'form.sub' | t}}
                        </div>
                        <span>{{'form.limitPrompt' | t}}</span>
                        <input type="text" class="input hg" maxlength="50" v-model="totalTips">
                    </div>
                </div>
            </div>
            <button class="btn btn-md btn-theme sub-btn" @click="saveSubmitSet">{{'common.save' | t}}</button>
        </div>
    </div>
</template>

<script>
    import { QuestionnaireApiV1 } from '@/api';

    export default {
        name: 'submit-set',
        data() {
            return {
                paperId:'',//表单id
                questionId:'',//字段id 空就是不限制
                singleFlag:true,//每人提交次数 true不限，false仅限提交一次
                singleTips:this.$t('form.subAgain'),//单次提示
                totalFlag: true,//表单总提交次数 true不限，false仅限提交一次
                totalLimit:100, //总提交次数限制 空就是不限制
                totalTips: this.$t('form.limitCannot'),//总提交提示

                questionList:[],
            };
        },
        components: {},
        props:{
            formId:{
                type: [Number,String]
            },
        },
        watch: {},
        mounted() {
            this.getQuestionList();
        },
        methods: {
            //获取表单提交设置主键字段list
            getQuestionList() {
                QuestionnaireApiV1
                    .getQuestionList(Number(this.formId))
                    .then(({body:{data}}) => {
                        this.questionList = data.questionList.map(qs => ({
                            name: qs.formRemark,
                            id: qs.id,
                        }));
                        this.getSubmitSetting();
                    });
            },
            //获取表单提交设置
            getSubmitSetting() {
                QuestionnaireApiV1
                    .getSubmitSetting(Number(this.formId))
                    .then(({body:{data}}) => {
                        //历史数据 没有questionId等字段
                        if (data.questionId === null || data.questionId === undefined || data.questionId === '') {
                            this.singleFlag = true;
                        } else {
                            this.questionId = data.questionId;
                            this.singleFlag = false;
                            this.singleTips = data.singleTips;
                            let flag = this.questionList.some((i) => {
                                return i.id === this.questionId;
                            });
                            if (!flag) this.questionId = '';
                        }
                        if (data.totalLimit) {//表单提交总次数 自定义
                            this.totalFlag = false;
                            this.totalLimit = data.totalLimit;
                            this.totalTips = data.totalTips;
                        } else {
                            this.totalFlag = true;
                        }

                    });
            },
            //每人仅限提交一次
            singleSubmit() {
                if (this.questionList.length === 0) {this.$toast(this.$t('form.doesMatch'), 'warn'); return}
                this.singleFlag = false;
                // this.singleTips = '您已提交过表单，无法再次提交';
                if (!this.questionId) {
                    this.questionId = this.questionList[0].id;
                }
            },
            //保存提交设置
            saveSubmitSet() {
                //判断选择
                if (this.singleFlag) {//不限
                    this.questionId = '';
                    this.singleTips = '';
                } else {//仅限提交一次
                    if (this.singleTips === '') this.singleTips = this.$t('form.subAgain');
                    if (this.questionId === '') {
                        this.$toast(this.$t('form.primaryKey'), 'warn');
                        return;
                    }
                }
                if (this.totalFlag) {//表单提交总次数 不限
                    this.totalLimit = '';
                    this.totalTips = '';
                } else { //自定义
                    if (this.totalTips === '') this.totalTips = this.$t('form.limitCannot');
                    if (this.totalLimit === '') this.totalLimit = 100;
                }
                QuestionnaireApiV1
                    .saveSubmitSet(
                        Number(this.formId),this.questionId,
                        this.singleTips,this.totalLimit, this.totalTips)
                    .then(() => {
                        this.$toast(this.$t('menu.synSuccess'), 'success');
                        if (this.singleFlag) {
                            this.singleTips = this.$t('form.subAgain');
                        }
                        if (this.totalFlag) {
                            this.totalTips = this.$t('form.limitCannot');
                            this.totalLimit = 100;
                        }
                    });
            },
        }
    };
</script>

<style type="text/scss" lang="scss">
    @import '../../../common/scss/base/variables';
    @import '../../../common/scss/base/mixin';

    .form-sumbit-set{
        h3{
            margin-bottom: 20px;
        }
        .form-field{
            margin-bottom: 50px;
        }
        .change-limit-ul{
            display: flex;
            .change-limit{
                padding: 0 20px;
                border: 1px solid $form-border;
                cursor: pointer;
                &:first-child{
                    border-right: 0;
                }
                &.active{
                    color: white;
                    background-color: $theme;
                }
            }
        }

        .limit-num{
            margin: 10px 0;
        }
        .sub-btn{
            margin: 30px;
        }
    }

</style>