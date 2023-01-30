<template>
    <div class="sms-form material-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{$route.meta.name | t}}</h1>
                <button type="button" class="pull-right preview-btn btn btn-md btn-orange" @click="preview">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                    {{'material.preview' | t}}
                </button>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view white-bg form">
                <div class="form-inner-wrapper">
                    <div class="form-field flex">
                        <label for="materialName" class="label">{{'material.contentName' | t}}</label>
                        <input type="text" v-model.trim="material.materialName" id="materialName" class="input"
                               maxlength="100">
                    </div>
                    <div class="form-field">
                        <span class="label placeholder">{{'material.materialGroup' | t}}</span>
                        <radio source="use" v-model="groupSource">{{'material.selectGroup' | t}}</radio>
                        <radio source="create" v-model="groupSource" :disabled="$has('journey_material_add_group')">{{'material.createGroup' | t}}</radio>
                    </div>
                    <div class="form-field" v-if="groupSource === 'create'">
                        <label class="label"></label>
                        <input type="text" class="input lg" :placeholder="$t('material.groupName')"
                               v-model.trim="groupName" maxlength="255">
                    </div>
                    <div class="form-field">
                        <label class="label placeholder" for="use">
                            {{groupSource === 'create' ? $t('common.parentGroup') : $t('newJourney.selectGroup')}}
                        </label>
                        <div class="choose-parent" id="use" @click.stop="readyCheckGroup">
                            <label class="select-text">
                                {{parentGroupName || $t('journey.journeyGroupHolder')}}
                                <span class="select-icon icon icon-arrow-down"></span>
                            </label>
                            <div class="search-tree-wrapper" v-if="groupSelectShow" @click.stop>
                                <search-tree :searchTreeData="groupList" :treeActiveId="selectGroupId"
                                             @getTreeAct='getTreeAct' :action="false"
                                             :levelStage="groupSource === 'use'"></search-tree>
                            </div>
                        </div>
                    </div>
                    <div class="form-field flex">
                        <span class="label">{{'material.contents' | t}}</span>
                        <div class="field-group">
                            <selector class="overlap-right" :options="fields" ref="select" @select="insertField"
                                      :search="'async'"
                                      @search="searchFields"
                                      @load="loadMoreField"
                                      :placeholder="$t('material.personalization')"
                                      v-model="fields_id"></selector>
                            <input type="text" class="input overlap-left overlap-right" v-model.trim="shortUrl"
                                   :placeholder="$t('material.shortUrlPlaceholder')">
                            <input type="button" :value="$t('material.insertLink')" class="field-tail-btn"
                                   @click="insertUrl">
                        </div>
                    </div>
                    <div class="form-field flex">
                        <span class="label placeholder"></span>
                        <div class="content-wrapper">
                            <textarea v-model="material.materialContent" class="textarea" ref="textarea" rows="15"
                                      @input="contentEmpty($event)"></textarea>
                            <div class="placeholder-content" v-if="placeholdersFlag"  @click="focusTextarea">
                                <billing-rules ></billing-rules>
                            </div>
                        </div>
                    </div>
                    <div @click.stop>
                        <div class="content-count-text">
                            <div class="about-sms-num">
                                {{'material.about' | t}}
                                <span class="red-text">{{contentCount}}</span> {{'material.char' | t}},
                                {{'material.smsNumber' | t}} {{Math.ceil(contentCount / 70)}} {{'controller.sms' | t}}。
                                <span class="red-text">{{'material.sendingSMS' | t}}</span>
                            </div>
                            <div class="view-rules" @click="viewDropRules">
                                <span>{{'material.billingRuleTitle' | t}}</span>
                                <div class="drop-arrow" :class="{'drop-active':dropRuleFlag}" >
                                    <svg aria-hidden="true">
                                        <use xlink:href="#icon-start1"></use>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div class="content-count-text drop-rule" v-if="dropRuleFlag">
                            <billing-rules ></billing-rules>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-panel">
                <input type="button" class="cancel-btn" :value="$t('common.cancel')" @click="cancel">
                <template v-if="!material.id"> {{'material.createNewSms' | t}}<span class="step">{{'material.design' | t}}</span>
                </template>
                <input type="button" class="confirm-btn btn btn-theme" :value="$t('material.done')" @click="done">
                <input v-if="!material.id" type="button" class="confirm-btn btn" :value="$t('material.previous')"
                       @click="cancel">
            </div>
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import { ContactApiV1, JourneyMaterialApiV1, JourneyMaterialApiV3 } from '@/api';
    import getCursorPosition from '../../../common/utils/cursorPosition';
    import {COMMON_WEIXIN_URL_REGEXP, COMMON_NAME_REGEXP, COMMON_URL_REGEXP} from '../../../common/utils/regs';
    import BillingRules from './billing-rules.vue';

    export const SHORT_LINK_REG = /<url>.*?<\/url>/gi;
    export const UNSUBSCRIBE_SMS_POSTFIX = '退订TD';

    export default {
        data() {
            return {
                UNSUBSCRIBE_SMS_POSTFIX,
                material: {//素材
                    materialContent: '',    //素材content
                    materialName: '',   //素材name
                    id: '', //素材id
                    groupId: 1,
                    type: '0' // stands for message, while 1 for email
                },
                fields: [], //自定义字段[]
                fields_id: '',  //选择插入的自定义字段的id
                shortUrl: '',   //跟踪短链
                groupList: [],  //分组list
                groupSource: 'use',   // use 使用已有的分组 create 创建新的标签
                selectGroupId: '',// 默认分组
                groupName: '',  //分组name

                parentGroupName: '',    //父级分组name
                parentGroupId:'',   //父级分组id
                groupSelectShow: false, //选择分组的下拉菜单
                echoQuery: {},   //route中的信息存储groupId,name,pageNumber,type

                //短信获取自定义字段
                fieldPageNum: 1,//搜索关键字
                searchFieldKey:'',//页码 下拉菜单滚动加载
                fieldTotalPage: 0,//总页数

                placeholdersFlag: true,
                dropRuleFlag: false,
            };
        },
        created() {
            this.getGroupListRequest();//获取分组列表
        },
        components: {
            BillingRules,
        },
        computed: {
            //面包屑
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'materialStore', text: this.$t('material.contentManagement')},
                    Object.assign({}, this.$route, {text: this.$t(this.$route.meta.name)})
                ];
            },
            contentCount() {
                const materialContent = this.material.materialContent;
                //有短链
                SHORT_LINK_REG.lastIndex = 0;
                if (SHORT_LINK_REG.test(materialContent)) {
                    return materialContent.length
                        - (materialContent.lastIndexOf('</url>') - materialContent.indexOf('<url>') + 6)
                        + 14 + UNSUBSCRIBE_SMS_POSTFIX.length;
                }
                return materialContent.length + UNSUBSCRIBE_SMS_POSTFIX.length;
            },
        },
        watch:{
            // 新建、选择分组时 获取父级name和id
            groupSource() {
                //新建素材时，全部分组不可选
                let  firstGroup = this.$getCurrentPart(2, this.groupList);
                firstGroup.open = true;
                if (this.groupSource === 'create') {
                    firstGroup.noSelect = true;
                    this.parentGroupName = this.groupList[0].name;
                    this.selectGroupId = this.groupList[0].id;
                }
                if (this.groupSource === 'use') {
                    firstGroup.noSelect = false;
                    // 默认选中 默认分组 id
                    let r = this.$getCurrentPart(1, firstGroup.childs);
                    let defaultId = r.id;
                    let routeId = this.$route.query.groupId;
                    if (!routeId || routeId === defaultId || routeId <= 0) {
                        this.selectGroupId = defaultId;
                        this.parentGroupName = r.name;
                    } else {
                        this.selectGroupId = routeId;
                        let p = this.$getPartById(Number(this.selectGroupId),this.groupList);
                        this.parentGroupName = p.name;
                    }
                }
                // 切换radio时，选中分组的所有父级展开
                this.fathersOpen(this.groupList, Number(this.selectGroupId));
            },

            'material.materialContent'() {
                if (!this.material.materialContent) {
                    this.placeholdersFlag = true;
                } else {
                    this.placeholdersFlag = false;
                }
            },
        },
        mounted() {
            if (this.$route.params.echoQuery) {
                this.echoQuery = this.$route.params.echoQuery;
            }
            //点击其他地方分组下拉菜单收起
            window.addEventListener('click', this.eventListener);
            window.addEventListener('click', this.eventDropRule);

            // determine editing or creating, get id
            let id = this.$route.query.id;
            // editing
            if (id) {
                // try get material from route param
                let material = this.$route.params.material;
                if (material) {
                    this.material = Object.assign({}, material, {type: 0, id});
                } else {
                    JourneyMaterialApiV1
                        .getMaterial(id)
                        .then(({body: {data: {material}}}) => {
                            this.material = Object.assign({}, material, {type: 0, id});
                        });
                }
            }
            this.getFields();
        },
        destroyed () {
            //下拉菜单点击其他地方收起
            window.removeEventListener('click', this.eventListener);
            window.removeEventListener('click', this.eventDropRule);
        },
        methods: {
            //获取自定义字段
            getFields(){
                // get fields
                ContactApiV1
                    .getFields(this.searchFieldKey,this.fieldPageNum)
                    .then(({body:{data}}) => {
                        this.fieldTotalPage = data.totalPage;
                        let resList = data.fieldList.map(field => ({
                            name: field.field,
                            id: field.id,
                            cn_name: field.fieldCn,
                            type: field.fieldType
                        }));
                        this.fields = this.fields.concat(resList);
                    });
            },
            //search自定义字段
            searchFields(keyword){
                this.fields = [];
                this.searchFieldKey = keyword;
                this.fieldPageNum = 1;
                this.getFields();
            },
            //自定义字段 滚动加载更多
            loadMoreField(){
                if (this.fieldTotalPage > this.fieldPageNum) {
                    let targetItem = this.$refs.select.$vnode.elm.childNodes[2].childNodes[4];
                    if (targetItem.clientHeight + targetItem.scrollTop + 1 > targetItem.scrollHeight) {
                        this.fieldPageNum += 1;
                        this.getFields();
                    }
                }
            },
            //选中分组的所有父级元素open=true
            fathersOpen(list, id) {
                let fathersArr = [];
                fathersArr = this.$getCurrentFathers(list, id);
                fathersArr.forEach(item => {
                    item.open = true;
                });
            },
            /**
             * search-tree中选择list的某一项时  接收选中项
             * @param group
             */
            getTreeAct (group) {
                this.selectGroupId = group.id;
                this.parentGroupName = group.name;
                this.parentGroupId = group.id;
                this.groupId = group.id;
                this.groupSelectShow = false;
            },
            // ready选择分组
            readyCheckGroup () {
                this.groupSelectShow = !this.groupSelectShow;
            },
            //  通用方法 下拉菜单的收起
            eventListener () {
                this.groupSelectShow = false;
            },
            //  获取分组列表
            getGroupListRequest() {
                JourneyMaterialApiV3
                    .getTreeGroupList({sortType:''})
                    .then((res) => {
                        this.groupList = [];
                        let arr = [];
                        let treeData = {};
                        treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.groupList.push(treeData);
                        this.$traverseTree(this.groupList,arr);
                        this.groupList = arr;

                        //查找到 "全部分组"
                        let  firstGroup = this.$getCurrentPart(2, this.groupList);
                        firstGroup.noSelect = false;

                        // 默认选中 默认分组 id
                        let r = this.$getCurrentPart(1, firstGroup.childs);
                        let defaultId = r.id;
                        let routeId = this.$route.query.groupId;
                        if (!routeId || routeId === defaultId || routeId <= 0) {
                            this.selectGroupId = defaultId;
                            this.parentGroupName = r.name;
                        } else {
                            this.selectGroupId = routeId;
                            let p = this.$getPartById(Number(this.selectGroupId),this.groupList);
                            this.parentGroupName = p.name;
                        }
                        this.fathersOpen(this.groupList, Number(this.selectGroupId));
                    });
            },
            /**
             * 插入字段
             * @param name
             * @returns {boolean}
             */
            insertField({name}) {
                let targetPos = getCursorPosition(this.$refs.textarea);
                let content = [...this.material.materialContent];

                if (content.length + ('${' + name + '}').length > 350) {
                    this.$toast(this.$t('material.tooLong'), 'warn');
                    return false;
                }
                content.splice(targetPos, 0, '${' + name + '}');
                this.material.materialContent = content.join('');
            },
            cancel() {
                if (this.$route.params.echoQuery) {
                    this.$router.push({
                        name: 'materialStore',
                        query: this.echoQuery
                    });
                } else {
                    this.$router.push({
                        name: 'materialStore',
                        query: {
                            tab: this.$route.query.tab,
                            groupId: this.$route.query.groupId,
                            pageNumber:this.$route.query.pageNumber,
                            type:this.$route.query.groupType
                        }
                    });
                }
            },
            //  完成
            done() {
                if (this.material.materialName === '') {
                    this.$toast(this.$t('material.smsNameNoEmpty'), 'warn');
                    return false;
                }
                if (this.material.materialContent === '') {
                    this.$toast(this.$t('material.noEmpty'), 'warn');
                    return false;
                }

                let materialContent = this.material.materialContent;            //输入内容
                let materialContentlen = 0;

                SHORT_LINK_REG.lastIndex = 0;
                if (SHORT_LINK_REG.test(materialContent)) {
                    materialContentlen = materialContent.length
                        - (materialContent.lastIndexOf('</url>') - materialContent.indexOf('<url>') + 6)
                        + 14
                        + UNSUBSCRIBE_SMS_POSTFIX.length;
                } else {
                    materialContentlen = materialContent.length + UNSUBSCRIBE_SMS_POSTFIX.length;
                }

                // 2020-01-14 http://jira.qdum.com/browse/DMARTECH-5047 ： 355 = 350 + 5
                if (materialContentlen > 355) {
                    this.$toast(this.$t('material.tooLong'), 'warn');
                    return false;
                }

                // 新建分组 名称校验
                if (this.groupSource === 'create' && !this.groupName) {
                    this.$toast(this.$t('material.groupNameNotNull'), 'warn');
                    return false;
                }
                if (this.groupName && !COMMON_NAME_REGEXP.test(this.groupName)) {
                    this.$toast(this.$t('common.filterName'), 'warn');
                    return false;
                }

                // if (this.material_saving) return false;
                // if (this.$refs.smsForm.bad()) return false;
                const links = this.material.materialContent.match(SHORT_LINK_REG);
                if (links && links.length > 1) {
                    this.$toast(this.$t('material.oneLink'), 'warn');
                    return false;
                }

                // this.material_saving = true;
                // 选择/新建分组
                if (this.groupSource === 'create') {
                    JourneyMaterialApiV3
                        .createGroup({
                            name: this.groupName,
                            parentId:this.parentGroupId
                        })
                        .then((res) => {
                            this.selectGroupId = parseInt(res.body.data.group.id);
                            this.material.groupId = parseInt(this.selectGroupId);
                            this.saveMaterial();
                        });
                    this.parentGroupId = '';
                } else { //选择已有分组
                    this.material.groupId = parseInt(this.selectGroupId);
                    this.saveMaterial();
                }
            },
            // 保存素材
            saveMaterial() {
                this.material.id
                    ? JourneyMaterialApiV1.update(this.material)
                        .then(() => {
                            this.$toast(this.$t('common.saveSuccess'), 'success');
                            if (this.$route.params.echoQuery) {
                                this.$router.push({name: 'materialStore', query: this.echoQuery});
                            } else {
                                this.$router.push({name: 'materialStore', query: {tab: this.$route.query.tab}});
                            }
                        })
                    : JourneyMaterialApiV1.create(this.material)
                        .then(() => {
                            this.$toast(this.$t('common.saveSuccess'), 'success');
                            this.$router.push({name: 'materialStore', query: {tab: this.$route.query.tab}});
                        });
            },
            //插入url
            insertUrl() {
                this.$nextTick(() => {
                    SHORT_LINK_REG.lastIndex = 0;
                    if (SHORT_LINK_REG.test(this.material.materialContent)) {
                        this.$toast(this.$t('material.oneLink'), 'warn');
                        return false;
                    }
                    if (String(this.shortUrl)
                        .trim() === '') {
                        this.$toast(this.$t('material.linkNoEmpty'), 'warn');
                        return false;
                    }
                    if (!COMMON_WEIXIN_URL_REGEXP.test(this.shortUrl) &&
                        !COMMON_URL_REGEXP.test(this.shortUrl) &&
                        !COMMON_URL_REGEXP.test('http://' + this.shortUrl)) {
                        this.$toast(this.$t('material.errorLink'), 'warn');
                        return false;
                    }
                    if (!/^(http|https|weixin)+/.test(this.shortUrl)) {
                        this.shortUrl = 'http://' + this.shortUrl;
                    }

                    //长度校验
                    let position = getCursorPosition(this.$refs.textarea);
                    let content = [...this.material.materialContent];

                    if (content.length + 10 > 350) {               //短链默认10个字符
                        this.$toast(this.$t('material.tooLong'), 'warn');
                        return false;
                    }

                    content.splice(position, 0, '<url>' + this.shortUrl + '</url>');
                    // this.material.materialContent = content.join('');
                    this.$set(this.material, 'materialContent', content.join(''));
                    this.shortUrl = '';
                    // trigger textarea's input event
                    const e = document.createEvent('HTMLEvents');
                    e.initEvent('input', true, true);
                    this.$nextTick(() => {
                        this.$refs.textarea.dispatchEvent(e);
                    });
                });
            },
            //  预览
            preview() {
                this.$preview({material: this.material});
            },
            // 短信文本输入框获取焦点
            focusTextarea() {
                this.$refs.textarea.focus();
            },
            //textarea的input事件
            contentEmpty(e) {
                if (e.target.value) {
                    this.placeholdersFlag = false;
                } else {
                    this.placeholdersFlag = true;
                }
            },
            //点击 展开计费规则
            viewDropRules() {
                this.dropRuleFlag = !this.dropRuleFlag;
            },
            //通用方法 下拉隐藏规则的收起
            eventDropRule() {
                this.dropRuleFlag = false;
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "./material-form";

    .sms-form {
        .form-inner-wrapper {
            margin: 32px auto;
            max-width: 735px;
            width: 80%;
            .choose-parent {
                display: inline-block;
                position: relative;

                $option-height: $input-field-height;
                $border-radius: 4px;
                $hover-bg: #f8f9fa;

                .select-text {
                    position: relative;
                    display: block;
                    @include box-sizing();
                    padding-right: $option-height - 2px;
                    width: 312px;
                    max-width: 312px;
                    height: $option-height;
                    line-height: $option-height - 2px;
                    border: 1px solid $form-border;
                    text-indent: .8em;
                    @include border-radius($border-radius);
                    @include user-select(none);
                    background-color: white;
                    @include ellipsis();

                    &:not(.disabled):hover {
                        border-color: $theme;
                    }

                    &:not(.disabled) {
                        cursor: pointer;
                    }

                    &.disabled {
                        color: $disabled;
                        cursor: not-allowed;
                        background-color: $content-bg;

                        .select-icon {
                            color: $disabled;
                        }
                    }

                    &.placeholder {
                        color: $disabled;
                    }

                    &.active {
                        border-color: $theme;
                        @include box-shadow(0 1px 3px rgba($theme, .35));

                        .select-icon {
                            color: $theme;
                        }
                    }

                    .select-icon {
                        height: $option-height - 2px;
                        width: $option-height - 2px;
                        position: absolute;
                        top: 0;
                        right: 0;
                        text-align: center;
                        text-indent: 0;
                        color: $color-light-content;
                    }
                }

                .search-tree-wrapper {
                    position: absolute;
                    width: 312px;
                    max-width: 312px;
                    max-height: 300px;
                    background-color: white;
                    border: 1px solid $border-color;
                    border-top: none;
                    z-index: $index-container;
                }
            }
        }

        .field-group {
            display: inline-flex;

            .input {
                flex: 1;
            }

            .field-tail-btn {
                @include appearance(none);
                padding: 0 16px;
                margin-left: -1px;
                border: 1px solid $form-border;
                line-height: $input-field-height - 2px;
                background-color: $content-bg;
                cursor: pointer;

                &:hover {
                    z-index: 1;
                    background-color: darken($content-bg, 2%);
                }
            }
        }

        .content-count-text {
            line-height: $input-field-height;
            text-align: right;
            display: flex;
            justify-content: space-between;
            width: 83%;
            background-color: $content-bg;
            float: right;
            box-sizing: border-box;
            padding: 0 10px;
            position: relative;
            .about-sms-num {
                text-align: left;
            }
            .view-rules {
                font-size: 14px;
                margin-left: 10px;
                color: $blue;
                cursor: pointer;
                display: flex;
                svg {
                    width: 16px;
                    height: 16px;
                    vertical-align: middle;
                }
                .drop-active {
                    transform: rotate(90deg);
                }
            }
        }
        .drop-rule {
            text-align: left;
        }
        .content-wrapper {
            flex: 1;
            position: relative;
            .textarea {
                width: 100%;
                min-height: 320px;
            }
            .placeholder-content {
                position: absolute;
                width: 96%;
                height: 90%;
                margin: auto;
                top: 3px;
                left: 0;
                right: 0;
            }
        }
        .red-text{
            color: $red;
        }
    }

</style>
