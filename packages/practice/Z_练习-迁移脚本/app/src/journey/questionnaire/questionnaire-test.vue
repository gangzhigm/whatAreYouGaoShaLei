<template>
    <!--表单测试-->
    <div class="content-container questionnaire-test">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <!--表单名称、正式发布按钮-->
            <div class="content-view">
                <button type="button" class="btn btn-md btn-theme pull-right" @click='release'>
                    {{'form.release' | t}}
                </button>
                <label>{{'form.formNames' | t}}</label>
                <input class="input lg questionnaire-name" type="text" disabled
                       :placeholder="$t('form.enterFormName')"
                       :value="formName" :title="formName">
            </div>
        </div>
        <div class="page-content">
            <div class='content-view padding margin white-bg'>
                <!--金数据表单地址链接-->
                <div class="form-field flex">
                    <label class="label">{{'form.goldFormLink' | t}}</label>
                    <div class="field-group">
                        <input type="text" v-model.trim="formLink" :placeholder="$t('form.enterFormLink')"
                               class="input xl" readonly :title="formLink">
                        <a class="btn btn-md btn-orange btn-check-link" target="_blank" rel="noopener" :disabled="isAccess" @click.stop="noAccess">
                            {{'form.clickToTest' | t}}
                        </a>
                    </div>
                </div>
                <!--表单测试记录-->
                <div class="form-field flex">
                    <label class="label">{{'form.testRecord' | t}}</label>
                    <div class="field-group">
                        <button type="button" class="btn btn-md btn-theme btn-refresh pull-right"
                                @click='refreshReport'>
                            {{'form.refresh' | t}}
                        </button>
                        <p class="light-content-text">{{'form.recordTip' | t}}</p>
                        <div class="simplify-table record-table">
                            <table>
                                <thead>
                                <tr>
                                    <th width="120">{{'form.submitTime' | t}}</th>
                                    <th width="120">{{'form.recoveryTime' | t}}</th>
                                    <th>{{'form.formData' | t}}</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="item in answers">
                                    <td>{{item.submitDate}}</td>
                                    <td>{{item.createDate}}</td>
                                    <td class="slim-cell">
                                        <table>
                                            <tr v-for="row in Math.ceil(item.answerTestList.length / 3)">
                                                <template v-for="col in 3">
                                                    <template v-if="item.answerTestList[row * 3 - 3 + col - 1]">
                                                        <td align="right">
                                                            {{item.answerTestList[row * 3 - 3 + col - 1].remark}}
                                                        </td>
                                                        <th :class="{'disabled-text': item.answerTestList[row * 3 - 3 + col - 1].answer === ''}"
                                                            :title="item.answerTestList[row * 3 - 3 + col - 1].answer">
                                                            {{
                                                            item.answerTestList[row * 3 - 3 + col - 1].answer === ''
                                                            ? $t('common.noData')
                                                            : item.answerTestList[row * 3 - 3 + col - 1].answer
                                                            }}
                                                        </th>
                                                    </template>
                                                </template>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr v-if="answers.length === 0">
                                    <td colspan="3" class="slim-cell">
                                        <list-empty :name="$t('form.data')"/>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <pager :total="totalPage" :now="nowPage" @page="handlePage"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

    import { QuestionnaireApiV1, QuestionnaireApiAuth } from '@/api';
    import { mapState } from 'vuex';
    export default {
        data() {
            return {
                formName: '', // 表单名称
                formLink: '', //表单地址链接
                answers: [], // 表单测试记录
                totalPage: 1,       // 总页数
                nowPage: 1,         // 当前页
                formStatus: null,   // 表单类型
                isAccess: false,    // 是否有权限
            };
        },
        computed: {
            ...mapState({
                user: state => state.user
            }),
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    {name: 'questionnaireTest', text: this.formName}
                ];
            }
        },
        mounted() {
            this.formId = this.$route.params.id;
            this.getFormDetail(this.formId);
            QuestionnaireApiAuth
                .downloadDetailAccess({paperId: this.formId, type: 3})
                .then((res) => {
                    this.isAccess = res.body.data.isAccess === 1 ? false : true;
                });
        },
        methods: {
            // 获取表单信息
            getFormDetail(id) {
                this.$loading();
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 1,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            QuestionnaireApiV1
                                .getFormDetail(id)
                                .then((res) => {
                                    const formDetail = res.body.data.papers;
                                    this.formName = formDetail.paperName;
                                    this.formStatus = formDetail.status;
                                    this.formLink = formDetail.url + '?x_field_1=' + this.user.id + ',' + this.user.cid;
                                    if (this.formStatus === 5) {
                                        this.refreshReport();
                                    } else {
                                        this.$loaded();
                                    }
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            // 获取测试信息
            refreshReport() {
                QuestionnaireApiV1
                    .getTestReport(this.formId, this.nowPage, 5)
                    .then((res) => {
                        this.$loaded();
                        this.totalPage = res.body.data.totalPage;
                        this.answers = res.body.data.answerResultList;
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 翻页
            handlePage(e) {
                this.nowPage = e;
                this.refreshReport();
            },
            // 发布前重新获取表单状态
            release() {
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: this.formId,
                        type:1,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            QuestionnaireApiV1
                                .getFormDetail(this.formId)
                                .then((res) => {
                                    const formDetail = res.body.data.papers;
                                    this.formStatus = formDetail.status;
                                    // 已测试
                                    if (this.formStatus === 5) {
                                        this.$confirm(this.$t('form.confirmRelease'), this.$t('form.releaseTip'))
                                            .then(sure => {
                                                if (sure) {
                                                    this.confirmRelease();
                                                }
                                            });
                                    } else if (this.formStatus === 4) { //未测试
                                        this.$confirm(this.$t('form.testConfirm'), this.$t('form.testTip'));
                                    }
                                });
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            confirmRelease() {
                // 发布表单
                this.$loading();
                QuestionnaireApiV1
                    .releaseForm(this.formId)
                    .then(() => {
                        this.$loaded();
                        this.$toast(this.$t('form.releaseSuccess'), 'success');
                        this.$router.push({name: 'journeyFormManagement', params: {id: 0}});
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 校验是否有权限
            noAccess() {
                if (this.isAccess){
                    this.$toast(this.$t('components.noAuthorized'),'warn');
                } else {
                    window.open(this.formLink);
                }
            },
        }
    };
</script>
<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .questionnaire-test {
        @import "./questionnaire";

        .record-table {
            margin-top: 8px;
        }
    }
</style>
