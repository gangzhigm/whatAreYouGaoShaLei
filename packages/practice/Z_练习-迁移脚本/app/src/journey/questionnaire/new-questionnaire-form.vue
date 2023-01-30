<template>
    <!--新建标准表单-->
    <div class="content-container new-questionnaire-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <!--新建表单头部内容 包含表单名称、地址及复制操作、表单二维码展示、导出表单html、表单html名称-->
                <div class="pull-right">
                    <div class="form-detail" v-if="paperId !== ''">
                        <textarea class="form-id" readonly ref="copyFormId" v-model="paperId"></textarea>
                        <input class="form-links" readonly ref="copyLink" v-model="formLinks">
                        <div class="copy-links-hidden hidden-menu-trigger">
                            <i class="copy-links icon icon-copy"></i>
                            <div class="hidden-menu">
                                <ul>
                                    <li @click="copyFormLinks">{{'form.copyLink' | t}}</li>
                                    <li @click="copyFormId">{{'form.copyFormId' | t}}</li>
                                </ul>
                            </div>
                        </div>
                        <i class="Qr-code icon icon-two-dimensional-code"
                           @mouseover="codeReview = true"
                           @mouseleave="codeReview = false" v-title:top="$t('common.preview')"></i>
                        <transition name="drop" v-if="codeReview">
                            <img :src="formCode" class="Qr-code-image">
                        </transition>
                    </div>
                    <button type="button" class="btn btn-md btn-theme" @click="exportHtml">
                        {{'form.exportHtml' | t}}
                    </button>
                </div>
                <label for="formName">{{'form.formNames' | t}}</label>
                <input class="input lg questionnaire-name" type="text" id="formName" maxlength="100"
                       :class="{error: errorText}" :placeholder="$t('form.enterFormName')"
                       v-model.trim="formName"
                       :title="formName"
                       v-title:top.line.warn="errorText"
                       @focusin="errorText = ''"
                       :disabled="select !== 'edit'">
                <label for="htmlName">{{'form.htmlName' | t}}</label>
                <input class="input lg questionnaire-name" type="text" id="htmlName" maxlength="100"
                       :class="{error: htmlErrorText}" :placeholder="$t('form.htmlName')"
                       v-model.trim="htmlName"
                       :title="htmlName"
                       v-title:top.line.warn="htmlErrorText"
                       @focusin="htmlErrorText = ''"
                       :disabled="select !== 'edit'">
            </div>
        </div>
        <div class="page-content">
            <div class='content-view margin'>
                <!--新建标准表单系列模块切换-->
                <ul class="content-tabs">
                    <li v-for="tab in tabList" class="content-tab grey" :class="{'active': tab.routeName === select}"
                        @click="updateRouterHander(tab)">
                        {{tab.name}}
                    </li>
                </ul>
                <div class="tab-content margin padding">
                    <!--表单编辑-->
                    <div v-if="select === 'edit'">
                        <iframe :src="frameSrc" ref="formEditor" class="form-editor-frame"></iframe>
                    </div>
                    <!--字段匹配-->
                    <div v-if="select === 'field'" class="field-match">
                        <h3>{{'form.fieldMatching' | t}}</h3>
                        <p class="light-content-text">{{'form.fieldTip' | t}}</p>
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
                                {{'form.formField' | t}}
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
                                        <tr v-for="item in formList">
                                            <!--这里是copy的金数据字段对接，标准表单字段待定、、-->
                                            <td :title="item.formRemark">
                                                <span class="field-name">{{item.formRemark}}</span>
                                            </td>
                                            <td>{{fieldTypes[item.formFieldType]}}</td>
                                            <td>{{item.formContent}}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <list-empty :name="$t('form.data')" v-if="formList.length === 0"/>
                                </div>
                            </div>
                            <ul class="form-arrow">
                                <li v-for="item in formList">
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
                                        <tr v-for="(item,index) in metaList" :key="index">
                                            <td class="visible-cell">
                                                <selector class="lg" :options="eventAttrList" v-model="item.id"
                                                          v-title:top.line.warn="item.error" search
                                                          :class="{error: item.error}"
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
                        <div class="footer-btn">
                            <button class="btn btn-md btn-theme" @click="saveFieldMatch">{{'common.complete' | t}}
                            </button>
                            <button class="btn btn-md btn-white" @click="select = 'edit'">
                                {{'common.previous' | t}}
                            </button>
                        </div>
                    </div>
                    <!--扩展属性-->
                    <extend-attr v-if="select === 'extend'" :formId="paperId"></extend-attr>
                    <!--跳转设置-->
                    <!--                    <jump-set v-if="select === 'skip'" :formId="paperId"></jump-set>-->
                    <global-set v-if="select === 'global'" :formId="paperId" :formName="formName"></global-set>
                    <!--发送给华为线索管理-->
                    <huawei-set v-if="select === 'huawei'" :formId="paperId"></huawei-set>
                    <additional-required-fields v-if="select === 'additionalRequiredFields'" :formId="paperId"></additional-required-fields>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { WebServAttrApiV1, QuestionnaireApiAuth, QuestionnaireApiForm } from '@/api';
    import {getCurrentTime} from '@/common/utils/dateUtils';
    import LINKS from '../../LINKS';
    import ExtendAttr from './after-form-set/extend-attr.vue';
    import JumpSet from './after-form-set/jump-set.vue';
    import GlobalSet from './after-form-set/global-set.vue';
    import HuaweiSet from './after-form-set/huawei-set.vue';
    import AdditionalRequiredFields from './after-form-set/additional-required-fields.vue';
    import { mapState } from 'vuex';

    export default {
        components: {
            GlobalSet,
            JumpSet,
            ExtendAttr,
            HuaweiSet,
            AdditionalRequiredFields
        },
        data() {
            return {
                paperId: '',//表单id
                errorText: '',// 表单名称错误提示
                htmlErrorText: '',// html名称错误提示
                formName: '', // 表单名称
                htmlName: '', // HTML名称
                formLinks: '', //表单连接
                select: 'edit',// 表单编辑
                // 编辑表单设置的字段
                formList: [],
                // DMT已有属性字段
                eventAttrList: [],
                // 对接的DMT字段
                metaList: [],
                fieldTypes: ['String', 'Int', 'Date', 'Float', 'Boolean'], // 匹配表单字段，字段类型
                codeReview: false,                                         // 二维码显隐
                htmlContent: '',                                           // 表单内容
            };
        },
        computed: {
            ...mapState({
                companyType: state => state.user.companyType,
                user: state => state.user
            }),
            frameSrc() {
                return LINKS.ORIGIN + LINKS.WEB_BASE + '/form-editor/'
                    + `?groupId=${this.$route.query.groupId}`
                    + (this.$route.query.id ? `&id=${this.$route.query.id}` : '')
                    + `&Ato=${this.user.authorization}`
                    + `&cid=${this.user.cid}`;
            },
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    {
                        name: this.$route.query.id ? 'newQuestionnaireForm' : 'newQuestionnaire',
                        text: this.$route.query.id ? this.$t('home.editQuestionnaire') : this.$t('home.newQuestionnaire'),
                        query: this.$route.query.id ? {id: this.$route.query.id, groupId: this.$route.query.groupId}
                            : {groupId: this.$route.query.groupId}
                    },
                    {
                        name: 'newQuestionnaireForm',
                        text: this.$t('form.dmartechForm'),
                        query: this.$route.query.id ? {id: this.$route.query.id, groupId: this.$route.query.groupId}
                            : {groupId: this.$route.query.groupId}
                    }
                ];
            },

            // tab列表
            tabList() {
                let deafultList = [
                    {name: this.$t('form.formSetting'), routeName: 'edit'},
                    {name: this.$t('form.fieldMatching'), routeName: 'field'},
                    {name: this.$t('form.extendedAttr'), routeName: 'extend'},
                    {name: this.$t('form.globalSet'), routeName: 'global'},
                ];
                if (this.companyType === 2) {
                    deafultList.push({name: this.$t('form.additionalRequiredFields'), routeName: 'additionalRequiredFields'});
                }
                // 没有发送给华为线索管理权限
                if (this.$has('dmartech_huawei_thread')) {
                    return deafultList;
                }
                deafultList.push({name: this.$t('form.sendHuawei'), routeName: 'huawei'});
                return deafultList;
            }
        },
        watch: {
            paperId(id) {
                this.getStandardFormDetail(id);
            },
        },
        mounted() {
            let self = this;
            window['FATHER'] = () => {
                return self;
            };

            // 初始化表单名称、html名称
            this.formName = 'New form ' + getCurrentTime();
            this.htmlName = 'New HTML ' + getCurrentTime();

            if (this.$route.query.id) {
                this.paperId = this.$route.query.id;
            }
        },
        methods: {
            // 获取表单详情
            getStandardFormDetail(id) {
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 2,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            QuestionnaireApiForm
                                .getStandardFormDetail(id)
                                .then(({body: {data}}) => {
                                    this.formCode = data.qrCodePath;
                                    this.formLinks = data.formLink;
                                    this.formName = data.formName;
                                    this.htmlName = data.htmlName;
                                    this.htmlContent = data.htmlContent;
                                });
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            // 复制表单地址
            copyFormLinks() {
                this.$refs.copyLink.select();
                document.execCommand('Copy');
                this.$toast(this.$t('form.copied'), 'success');
            },
            // 复制表单id
            copyFormId() {
                this.$refs.copyFormId.select();
                document.execCommand('Copy');
                this.$toast(this.$t('form.copied'), 'success');
            },
            // 导出HTML
            async exportHtml() {
                if (this.paperId === '') return this.$toast(this.$t('common.noData'), 'warn');
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: this.paperId,
                        type: 9,
                    })
                    .then(async ({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            let {body: {data: {htmlContent}}} = await QuestionnaireApiForm.exportHtml(this.paperId);
                            const blob = new Blob([htmlContent]);
                            const name = `${this.htmlName}.html`;
                            // IE doesn't allow using a blob object directly as link href
                            // instead it is necessary to use msSaveOrOpenBlob
                            // https://blog.jayway.com/2017/07/13/open-pdf-downloaded-api-javascript/
                            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                window.navigator.msSaveOrOpenBlob(blob, name);
                                return;
                            }

                            const URL = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.download = name;
                            a.href = URL;

                            try {
                                const EV = new MouseEvent('click');
                                a.dispatchEvent(EV);
                            } catch (e) {
                                // 兼容IE(非 6,7,8)
                                let event = document.createEvent('MouseEvents');
                                event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                                a.dispatchEvent(event);
                            }
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            // 切换tab
            updateRouterHander(tab) {
                // 新建保存后， 路由添加id
                if (this.paperId && !this.$route.query.id) {
                    const groupId = ~~this.$route.query.groupId;
                    this.$router.replace({name: `newQuestionnaireForm`, query: {id: this.paperId, groupId: groupId}});
                }
                if (this.paperId) {
                    this.select = tab.routeName;
                    if (tab.routeName === 'field') {
                        this.getAttrList();
                    }
                } else {
                    this.$toast(this.$t('data.refineData'), 'warn');
                }
            },
            // ----------------------- 匹配字段start
            // 请求表单属性列表 && 以保存的字段匹配
            getFormList() {
                QuestionnaireApiForm
                    .getFieldMatch(this.paperId)
                    .then(({body: {data: {contrastList}}}) => {
                        this.formList = contrastList.map(list => {
                            return {
                                formRemark: list.fieldName,
                                formFieldType: list.type,
                                formContent: list.field,
                                id: list.fieldId
                            };
                        });
                        this.metaList = [];

                        // 对应已匹配字段
                        contrastList.forEach(list =>{
                            let item = {
                                name: list.dmtFieldName ? list.dmtFieldName : '',
                                attrGenre: typeof list.dmtType === 'number' ? list.dmtType : '',
                                meaning: list.dmtField ? list.dmtField : '',
                                id: list.dmtFieldId ? list.dmtFieldId : '',
                                error: '',
                                isPk: list.isPk ? list.isPk : false,
                            };
                            this.metaList.push(item);
                        });
                        // 联系人字段自动匹配
                        this.formList.forEach((form, index) => {
                            let result = this.matchContactField(form);
                            // 筛选重复的联系人字段（已选中的字段不可再选）, 以已匹配的为准
                            let hasMatch = contrastList.find(attr => attr.field === result.field);
                            if (result.name && hasMatch.dmtField === null) {
                                const item = {
                                    name: result.name,
                                    attrGenre: result.attrGenre,
                                    meaning: result.meaning,
                                    id: result.id,
                                    error: '',
                                    isPk: result.isPk
                                };
                                this.metaList.splice(index, 1, item);
                            }
                        });

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
                    });
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
                            meaning: '',
                            isPk: false
                        });
                        if (this.paperId) {
                            this.getFormList();
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // 匹配字段
            selectAttr(item, cur, attr) {
                item.error = '';
                item.id = attr.id;
                item.attrGenre = attr.attrGenre;
                item.meaning = attr.meaning;
                item.name = attr.name;
                item.isPk = attr.isPk;
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
                // 字段属性一一对应
                if (attr.attrGenre !== this.formList[cur].formFieldType && attr.id !== -1) {
                    item.error = this.$t('form.matchError');
                }
            },
            // 保存字段配置
            saveFieldMatch() {
                let hasData = this.metaList.filter(match => {
                    return match.id === '' || match.id === null;
                });
                if (hasData.length) return this.$toast(this.$t('data.refineData'), 'warn');
                let isError = this.metaList.every(match => {
                    return match.error === '';
                });
                let errorTxt = this.$t('form.matchError');
                if (!isError) {
                    return this.$toast(errorTxt, 'warn');
                }
                let postData = [];
                postData = this.metaList.map(meta => {
                    return {
                        dmtFieldName: meta.name,
                        dmtType: meta.attrGenre,
                        dmtField: meta.meaning,
                        dmtFieldId: meta.id,
                        // 表单报告-编辑数据， 是否是主键
                        isPk: meta.isPk
                    };
                });
                this.formList.forEach((form, cur) => {
                    postData.forEach((post, index) => {
                        if (cur === index) {
                            post.fieldName = form.formRemark;
                            post.type = form.formFieldType;
                            post.field = form.formContent;
                            post.fieldId = form.id;
                        }
                    });
                });
                QuestionnaireApiForm
                    .saveFieldMatch(this.paperId, postData)
                    .then(() => {
                        // 待定
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                    });
            },
            // 筛选联系人字段匹配信息
            matchContactField(form) {
                const name = form.formRemark;
                const canAutomaticMatchingField = {'手机': 'mobile', '邮箱': 'email', '姓名': 'name', '地址': 'address', '生日': 'birthday'};
                let field = {};
                const attr = this.eventAttrList.find(attr => attr.meaning === canAutomaticMatchingField[name]);
                if (attr) {
                    field = {
                        id: attr.id,
                        attrGenre: attr.attrGenre,
                        meaning: attr.meaning,
                        name: attr.name,
                        isPk: attr.isPk,
                        field: form.formContent
                    };
                    return field;
                }
                return field;
            }
            // ----------------------- 匹配字段end
        },
    };
</script>
<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .new-questionnaire-form {
        .pull-right {
            .form-links {
                display: inline-block;
                border: none;
                min-width: 350px;
                vertical-align: top;
            }
            .form-id {
                position: absolute;
                opacity: .01;
                height: 0;
                overflow: hidden;
                border: none;
                resize: none;
            }

            .icon {
                font-size: 23px;
                cursor: pointer;
                margin: 0 8px;
            }

            .Qr-code-image {
                position: absolute;
                width: 200px;
                height: 200px;
                right: 55px;
                top: 40px;
            }

            display: flex;
            position: relative;
            .copy-links-hidden {
                display: inline-block;
                .hidden-menu {
                    position: absolute;
                    top: 80%;
                    right: 20%;
                }
            }
        }

        .tab-content {
            height: 660px;
            max-height: 660px;
            overflow-y: auto;
            padding: 16px 24px;
            background-color: #ffffff;

            .save-btn {
                margin: 32px 48%;
            }

            .icon-plus {
                color: $theme;
                cursor: pointer;
                @include user-select(none);

                &:hover {
                    color: $light-theme;
                }
            }

            .icon-delete {
                color: $red;
                cursor: pointer;
                @include user-select(none);

                &:hover {
                    fill: $light-red;
                }
            }

            // 字段设置
            .field-match {
                .light-content-text {
                    padding: 8px 0;
                }

                .footer-btn {
                    display: flex;
                    justify-content: center;
                }

                .questionnaire-field-matcher {
                    display: flex;
                    align-items: flex-end;
                    padding: 16px;
                    border-radius: 4px;
                    background-color: $content-bg;
                    text-align: center;
                    margin: 25px 0;

                    .form-arrow {
                        flex: 0 0 10%;
                        line-height: 48px;

                        svg {
                            display: inline-block;
                            width: 16px;
                            height: 16px;
                            vertical-align: top;
                            margin-top: (48px - 16px)/2;
                            fill: $color-content;
                        }
                    }

                    .match-table {
                        flex: 1;
                    }
                }
            }
        }
        .click-view{
            color: $green;
        }
    }

    .form-editor-frame {
        border: none;
        width: 100%;
        height: 634px;
        overflow: hidden;
    }
</style>