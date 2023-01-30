<template>
    <!--金数据表单查看-->
    <div class="content-container questionnaire-view">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <!--头部表单名称、 返回按钮、 二维码按钮-->
            <div class="content-view">
                <div class="pull-right">
                    <button type="button" class="btn btn-md btn-white" @click="$router.go(-1)">
                        {{'form.back' | t}}
                    </button>
                    <div class="btn btn-md btn-theme hidden-menu-trigger qr-code-btn">
                        {{'QRCode.code' | t}}
                        <div class="hidden-menu">
                            <img :src='imageUrl'/>
                        </div>
                    </div>
                </div>
                <label>{{'form.formNames' | t}}</label>
                <input class="input lg questionnaire-name" type="text" disabled
                       :placeholder="$t('form.enterFormName')"
                       :value="formName" :title="formName">
            </div>
        </div>
        <div class="page-content">
            <div class='content-view padding margin white-bg'>
                <!--接入金数据表单步骤-->
                <div class="tip-steps">
                    <p>{{'form.step' | t}}</p>
                    <ul>
                        <li>
                            <span class="step-content">{{'form.step1' | t}}</span>
                            {{'form.step1Content' | t}}
                        </li>
                        <li>
                            <a class='action-text' href='https://jinshuju.net' target="_blank" rel="noopener">https://jinshuju.net</a>
                            ({{'form.personSeal' | t}}) {{'common.or'| t}}
                            <a class='action-text' href='https://jinshuju.com' target="_blank" rel="noopener">https://jinshuju.com</a>
                            ({{'form.companySeal' | t}})
                        </li>
                        <li>
                            <span class="step-content">{{'form.step2' | t}}</span>
                            {{'form.step2Content' | t}}
                            <br>
                            <span>{{url}}</span>
                        </li>
                        <li>
                            <span class="step-content">{{'form.step3' | t}}</span>
                            {{'form.step3Content' | t}}
                        </li>
                        <li>
                            <span class="step-content">{{'form.step4' | t}}</span>
                            {{'form.step4Content' | t}}
                        </li>
                        <li>
                            <span class="step-content">{{'form.step5' | t}}</span>
                            {{'form.step5Content' | t}}
                        </li>
                        <li>
                            {{'form.moreDetails' | t}}
                            <a class='action-text'
                               href='https://doc.dmartech.cn/ying-xiao-lv-cheng/jin-shu-ju-biao-dan-shi-yong-shuo-ming'
                               target="_blank" rel="noopener">{{'form.helpCenter' | t}}</a>
                        </li>
                        <li>
                            <span class="step-content">{{'form.payAttention' | t}}</span>
                            <span>{{'form.payAttentionContent' | t}}</span>
                        </li>
                    </ul>
                </div>
                <!--金数据表单地址链接-->
                <div class="form-field">
                    <label class="label">{{'form.goldFormLink' | t}}</label>
                    {{formLink}}
                </div>
                <!--表单字段匹配-->
                <div class="form-field flex">
                    <label class="label">{{'form.formMatch' | t}}</label>
                    <div class="field-group">
                        <p class="light-content-text">{{'form.formTip' | t}}</p>
                        <p class="light-content-text">
                            {{'form.formHistory1' | t}}
                            <a class="click-view" target="_blank"
                               href="https://doc.dmartech.cn/ying-xiao-lv-cheng/shi-yong-biao-dan-ti-jiao-ji-lu-zuo-wei-shai-xuan-tiao-jian-shuo-ming">
                                {{'form.formHistory2' | t}}
                            </a>
                            {{'form.formHistory3' | t}}
                        </p>
                        <div class='questionnaire-field-matcher'>
                            <div class='match-table'>
                                {{'form.goldField' | t}}
                                <div class="simplify-table auto-width">
                                    <table>
                                        <thead>
                                        <tr>
                                            <td>{{'form.fieldName' | t}}</td>
                                            <td>{{'form.type' | t}}</td>
                                            <td>{{'form.attributeName' | t}}</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="item in jinFormList">
                                            <td>{{item.formRemark}}</td>
                                            <td>{{item.formFieldType}}</td>
                                            <td>{{item.formContent}}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <list-empty :name="$t('form.data')" v-if="jinFormList.length === 0"/>
                                </div>
                            </div>
                            <ul class="form-arrow">
                                <li v-for="item in jinFormList">
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-switch"></use>
                                    </svg>
                                </li>
                            </ul>
                            <div class='match-table'>
                                {{'form.Dmartech' | t}}
                                <div class="simplify-table auto-width">
                                    <table>
                                        <thead>
                                        <tr>
                                            <td>{{'form.fieldName' | t}}</td>
                                            <td>{{'form.type' | t}}</td>
                                            <td>{{'form.attributeName' | t}}</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="(item,index) in metaList">
                                            <td class="visible-cell">
                                                <selector class="lg" :options="eventAttrList" v-model="item.id"
                                                          disabled/>
                                            </td>
                                            <td>{{fieldTypes[item.attrGenre]}}</td>
                                            <td> {{item.meaning}}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <list-empty :name="$t('form.data')" v-if="metaList.length === 0"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

    import { WebServAttrApiV1, QuestionnaireApiV1, QuestionnaireApiAuth } from '@/api';
    import {jinshujuLinks} from './common/jinshujuLinks.js';
    import LINKS from '../../LINKS.js';

    export default {
        data() {
            return {
                formId: -1,     // 表单Id
                formName: '',   // 表单名称
                formLink: '',   // 表单地址链接
                jinFormList: [],// 金数据字段列表
                eventAttrList: [],  // 元数据列表
                metaList: [],   // 对应金数据的元数据选项列表
                imageUrl: '',   // 二维码图片地址
                // 0:'String', 1:'Int', 2:'Date', 3:'Float', 4:'Boolean'
                fieldTypes: ['String', 'Int', 'Date', 'Float', 'Boolean'] // 回显字段类型集合
            };
        },
        computed: {
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    {name: 'questionnaireView', text: this.formName}
                ];
            },
            url() {
                return jinshujuLinks;
            }
        },
        mounted() {
            this.formId = this.$route.params.id;
            this.getFormDetail(this.formId);
        },
        methods: {
            // 获取表单详情
            async getFormDetail(id) {
                this.$loading();
                await WebServAttrApiV1 //这里的0表示请求的是用户属性
                    .getAttributes({attrType: 0, isFilter: '', isResult: ''})
                    .then((res) => {
                        this.$loaded();
                        this.eventAttrList = [];
                        res.body.data.attributeList.forEach(item => {
                            if (!item.isWechat) {
                                let name = item.name;
                                item.name = item.meaning;
                                item.meaning = name;
                                this.eventAttrList.push(item);
                            }
                        });
                        this.eventAttrList.unshift({
                            id: -1,
                            name: this.$t('form.donotMatch'),
                            attrGenre: '',
                            meaning: ''
                        });
                    })
                    .catch(() => {
                        this.$loaded();
                    });
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 1,
                    })
                    .then(({body: {data: {isAccess}}}) => {
                        if (isAccess === 1) {
                            QuestionnaireApiV1
                                .getFormDetail(id)
                                .then((res) => {
                                    const formDetail = res.body.data.papers;
                                    this.formName = formDetail.paperName;
                                    this.formLink = formDetail.url;
                                    this.imageUrl = LINKS.WECHAT_API_BASE + '/api/web-api/wechat/v1/quickMarks/downloadFormQRCode?height=500&url=' + this.formLink + '&width=500';
                                    formDetail.questionDTOList.forEach(item => {
                                        this.jinFormList.push(
                                            {
                                                id: item.formId, formContent: item.formContent,
                                                formRemark: item.formRemark, formFieldType: item.formFieldType
                                            });
                                        this.metaList.push({
                                            id: item.fieldId,
                                            attrGenre: item.fieldType,
                                            meaning: item.content,
                                            error: ''
                                        });
                                    });
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        } else if (isAccess === 0) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            // 返回
            back() {
                this.$router.go(-1);
            }
        }
    };
</script>
<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .questionnaire-view {
        @import "questionnaire";

        .qr-code-btn {
            position: relative;

            .hidden-menu {
                top: $input-field-height;
                right: 0;
                width: 200px;
                @include transform-origin(right top);
                padding: 16px;
                background-color: white;

                img {
                    display: block;
                    margin: auto;
                    width: 100%;
                    height: auto;
                }
            }
        }
        .click-view{
            color: $green;
        }
    }
</style>
