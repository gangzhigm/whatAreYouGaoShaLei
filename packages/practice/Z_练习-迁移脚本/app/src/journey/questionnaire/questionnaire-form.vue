<template>
    <!--新建金数据表单-->
    <div class="content-container questionnaire-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <!--头部表单名称、绑定金数据、取消、测试、发布、保存按钮-->
                <div class="pull-right">
                    <button type="button" class="btn btn-md btn-theme-border" @click='back'>
                        {{'common.cancel' | t}}
                    </button>
                    <button type="button" class="btn btn-md btn-theme" @click="confirm(true)">
                        {{'form.testDev' | t}}
                    </button>
                    <button type="button" class="btn btn-md btn-theme" @click="confirm(false)">
                        {{'common.save' | t}}
                    </button>
                </div>
                <label for="formName">{{'form.formNames' | t}}</label>
                <input class="input lg questionnaire-name" type="text" id="formName" maxlength="30"
                       :class="{error: errorText}" :placeholder="$t('form.enterFormName')"
                       v-model.trim="formName"
                       :title="formName"
                       v-title:top.line.warn="errorText"
                       @focusin="errorText = ''">
                <button type="button" class="btn btn-md btn-theme king-btn" @click="showAPIModal=true">
                    {{'form.KingDataAPI' | t}}
                </button>
            </div>
        </div>
        <div class="page-content">
            <div class='content-view padding margin white-bg'>
                <!--接入金数据静态内容-->
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
                <div class="form-field flex">
                    <label class="label" for="formLink">{{'form.goldFormLink' | t}}</label>
                    <div class="field-group">
                        <input type="text" class="input lg" id="formLink"
                               :class="{error: errorTextLink}"
                               :placeholder="$t('form.enterFormLink')"
                               v-model.trim="formLink"
                               :title="formLink"
                               :disabled="formId > 0"
                               v-title:top.line.warn="errorTextLink"
                               @focusin="errorTextLink = ''">
                        <button type="button" class="btn btn-md btn-theme btn-check-link" @click='checkLink'>
                            {{actionName}}
                        </button>
                    </div>
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
                            <!--金数据字段-->
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
                                            <td :title="item.formRemark">
                                                <span class="field-name">{{item.formRemark}}</span>
                                            </td>
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
                            <!--Dmartech元数据-->
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
                                                          v-title:top.line.warn="item.error"
                                                          :class="{error: item.error}" search
                                                          @select="selectAttr(item,index,$event)"/>
                                            </td>
                                            <td>{{fieldTypes[item.attrGenre]}}</td>
                                            <td :title="item.meaning">{{item.meaning}}</td>
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
        <!-- 刷新表单 -->
        <confirm v-if="showChangeLink"
                 :title="$t('form.refreshForm')"
                 @cancel="showChangeLink=false"
                 @confirm="confirmChange">
            <div class="form-field"> {{'form.refreshNote' | t}}</div>
        </confirm>
        <!--绑定金数据API模态框-->
        <questionnaireBindjinshujuAPIModal v-if="showAPIModal" @close="showAPIModal=false"/>
        <!--绑定确认框-->
        <modal v-if="bindTip" :title="$t('form.bindTip')" @close="bindTip=false">
            <div>{{'form.bindTips' | t}}</div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('form.latter')"
                        @click="bindTip=false">
                <input type="button" class="btn btn-md btn-theme" :value="$t('form.bindNow')"
                        @click="bindApi">
            </template>
        </modal>
    </div>
</template>
<script>

    import { WebServAttrApiV1, QuestionnaireApiV1, QuestionnaireApiJinShuJu, QuestionnaireApiAuth } from '@/api';
    import questionnaireBindjinshujuAPIModal from './questionnaire-bind-jinshuju-api-modal.vue';
    import {jinshujuLinks} from './common/jinshujuLinks.js';

    export default {
        data() {
            return {
                formId: -1,         // 编辑时用到的表单Id
                groupId: '',        // 表单分组Id
                errorText: '',      // 表单校验名称错误内容
                errorTextLink: '',  // 金数据地址校验错误内容
                formName: '',       // 表单名称
                formLink: '',       // 表单地址链接
                jinFormList: [],    // 金数据字段列表
                eventAttrList: [],  // MDT元数据列表
                metaList: [],       // 匹配的元数据列表
                jinFormId: '',      // 金数据表单Id
                questionList: [],   // 用于传参保存表单内容的数组
                actionName: this.$t('form.getForm'),    // 编辑或新建时，金数据链接后按钮value
                showChangeLink: false,                  // 刷新表单模态框显隐
                confirmChangeLink: false,               // 用于存储金数据表单链接是否更换
                clickGetForm: false,                    // 判断是否获取了金数据表单
                // 0:'String', 1:'Int', 2:'Date', 3:'Float', 4:'Boolean'
                fieldTypes: ['String', 'Int', 'Date', 'Float', 'Boolean'],      // 回显字段类型
                showAPIModal: false,                    // 金数据绑定API模态框显隐
                bindTip: false,                         // 金数据绑定提示
                hasApi: false,                          // 是否已绑定金数据API
            };
        },
        components: {
            questionnaireBindjinshujuAPIModal
        },
        computed: {
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    {name: 'questionnaireForm', text: this.formId > 0 ? this.formName : this.$t('form.jinShuJu')}
                ];
            },
            url() {
                return jinshujuLinks;
            }
        },
        mounted() {
            this.formId = this.$route.params.id;
            this.groupId = this.$route.params.groupId;
            if (this.formId > 0) {
                this.getFormDetail(this.formId);
                this.actionName = this.$t('form.refreshForm');
            }
        },
        methods: {
            // 获取表单内容
            async getFormDetail(id) {
                this.$loading();
                // 优先获取DMT元数据用于回显
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
                // 检测是否绑定了金数据API
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 1,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            // 获取金数据表单内容
                            QuestionnaireApiV1
                                .getFormDetail(id)
                                .then((res) => {
                                    const formDetail = res.body.data.papers;
                                    this.formName = formDetail.paperName;
                                    this.formLink = formDetail.url;
                                    const index = this.formLink.lastIndexOf('/');
                                    this.jinFormId = this.formLink.substring(index + 1);
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
                                            error: '',
                                            name: item.remark
                                        });
                                    });
                                    // 选中的属性不可重复选择
                                    this.eventAttrList.forEach(attr => {
                                        this.metaList.forEach(meta => {
                                            if (attr.id === meta.id && meta.id !== -1) {
                                                attr.disabled = true;
                                            }
                                        });
                                    });
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });

            },
            // 测试金数据表单
            testFormAction() {
                this.$router.push({name: 'questionnaireTest', params: {groupId: this.groupId, id: this.formId}});
            },
            confirmApi() {

                return this.hasApi;
            },
            // 确定绑定金数据API
            bindApi() {
                this.bindTip = false;
                this.showAPIModal = true;
            },
            // 保存表单内容
            async confirm(test) {
                // 先验证是否绑定金数据API
                await QuestionnaireApiJinShuJu
                    .findJinByApi()
                    .then(res => {
                        // 是否绑定金数据API
                        if (res.body.data && res.body.data.apiKey) {
                            this.hasApi = true;
                        } else {
                            this.bindTip = true;
                            this.hasApi = false;
                        }
                    });
                if (!this.hasApi) {
                    return;
                }
                if (this.formName === '') {
                    this.errorText = this.$t('form.enterFormName');
                    return;
                }
                if (this.checkAttr()) {
                    this.questionList = [];
                    this.metaList.forEach((item, index) => {
                        if (item.id > 0) {
                            this.questionList.push({
                                content: item.meaning, //DMARTECH 属性名
                                fieldId: item.id, // DMARTECH字段id
                                remark: item.name, // DMARTECH 字段名
                                fieldType: item.attrGenre, // DMARTECH 字段类型
                                formContent: this.jinFormList[index].formContent, //金数据属性名,
                                formFieldType: this.jinFormList[index].formFieldType, //金数据字段类型,
                                formId: this.jinFormId,  //金数据ID
                                formRemark: this.jinFormList[index].formRemark, //金数据字段名
                            });
                        }
                    });
                    const sendObj = {
                        formId: this.jinFormId,
                        formSource: 2, // 1Dmartech表单，2金数据表单
                        paperName: this.formName,
                        url: this.formLink,
                        questionDTOList: this.questionList
                    };
                    // 新建表单时必须点击获取表单数据
                    if (this.formId < 0 && !this.clickGetForm) {
                        this.$toast(this.$t('form.getFormFirst'), 'warn');
                        return;
                    }
                    // 至少填写一个匹配字段
                    if (this.questionList.length === 0) {
                        this.$toast(this.$t('form.atLeastOneFiled'), 'warn');
                        return;
                    }
                    this.$loading();
                    if (this.formId > 0) {
                        sendObj.isUpdateField = this.confirmChangeLink;
                        // 编辑表单
                        QuestionnaireApiAuth
                            .downloadDetailAccess({
                                paperId: this.formId,
                                type: 2,
                            })
                            .then(({body:{data:{isAccess}}})=>{
                                if ( isAccess === 1 ) {
                                    QuestionnaireApiV1
                                        .updateForm(this.formId, sendObj)
                                        .then(() => {
                                            this.$loaded();
                                            this.$toast(this.$t('form.editSuccess'), 'success');
                                            if (test) this.testFormAction();
                                            else this.$router.push({name: 'journeyFormManagement', params: {id: 0}});
                                        })
                                        .catch(() => {
                                            this.$loaded();
                                        });
                                } else if ( isAccess === 0 ) {
                                    this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                                }
                            });
                    } else {
                        // 新建表单
                        QuestionnaireApiV1
                            .createNewForm(this.groupId, sendObj)
                            .then(res => {
                                this.$loaded();
                                this.$toast(this.$t('form.addFormSuccess'), 'success');
                                if (res.body.data && res.body.data.id) this.formId = res.body.data.id;
                                if (test) this.testFormAction();
                                else this.$router.push({name: 'journeyFormManagement', params: {id: 0}});
                            })
                            .catch(() => {
                                this.$loaded();
                            });
                    }
                }
            },
            // 取消按钮
            back() {
                this.$router.push({name: 'newQuestionnaire'});
            },
            // 确认更换金数据链接
            confirmChange() {
                this.showChangeLink = false;
                this.confirmChangeLink = true;
                this.getJinFormDetail();
            },
            // 校验金数据链接
            checkLink() {
                if (!this.formLink || !/\/f\/[a-zA-Z0-9_-]+$/.test(this.formLink)) {
                    this.errorTextLink = this.$t('form.enterCorrectGoldFormLink');
                    return;
                }
                if (this.formId > 0) {
                    this.showChangeLink = true;
                    return;
                }
                this.getJinFormDetail();
            },
            // 输入金数据表单链接检验
            // 获取金数据表单数据
            getJinFormDetail() {
                const index = this.formLink.lastIndexOf('/');
                this.jinFormId = this.formLink.substring(index + 1);
                this.$loading();
                QuestionnaireApiV1
                    .getJinFormDetail(this.jinFormId, this.formId ? this.formId : '')
                    .then((res) => {
                        this.$loaded();
                        this.clickGetForm = true;
                        this.jinFormList = res.body.data.formList;
                        this.metaList = [];
                        this.jinFormList.forEach(() => {
                            this.metaList.push({id: -1, attrGenre: '', meaning: '', error: '', name: ''});
                        });

                    })
                    .catch(() => {
                        this.clickGetForm = false;
                        this.$loaded();
                    });

                this.getAttrList();
            },
            // 保存时校验金数据表单字段不存在不匹配的情况
            checkAttr() {
                let isCheck = true;
                this.metaList.forEach(item => {
                    if (item.error !== '') {
                        isCheck = false;
                    }
                });
                return isCheck;
            },
            //请求属性列表
            getAttrList() {
                this.$loading();
                WebServAttrApiV1 //这里的0表示请求的是用户属性
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
            },
            // 选择DMT元数据匹配
            selectAttr(item, index, val) {
                item.error = '';
                item.id = val.id;
                item.attrGenre = val.attrGenre;
                item.meaning = val.meaning;
                item.name = val.name;
                // 已选中的字段不可再选
                this.eventAttrList.forEach(attr => {
                    attr.disabled = false;
                });
                this.eventAttrList.forEach(attr => {
                    this.metaList.forEach(meta => {
                        if (attr.id === meta.id && meta.id !== -1) {
                            attr.disabled = true;
                        }
                    });
                });
                // 0:字符串 1:整数 2:时间 3:小数
                // 元数据为String时，可以对应金数据所有字段，其余必须一一对应
                if (val.attrGenre === 1 || val.attrGenre === 2 || val.attrGenre === 4) {
                    item.error = this.$t('form.matchError');
                } else if (val.attrGenre === 3) {
                    if (this.jinFormList[index].formFieldType === 'String') {
                        item.error = this.$t('form.matchError');
                    }
                }
            }
        },
    };
</script>
<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .questionnaire-form {
        @import "questionnaire";
        .king-btn {
            vertical-align: middle;
        }

        .field-name {
            display: inline-block;
            max-width: 10vw;
            vertical-align: middle;
            @include ellipsis;
        }
        .click-view{
            color: $green;
        }
    }
</style>
