<template>
    <div class="questionnaire-picker">
        <div class='questionnaire-picker-level-one' v-blur="close">
            <label @click="toggle">
                <span class="questionnaire-text">{{text}}</span>
                <span class="select-icon icon icon-arrow-down"></span>
            </label>
            <input v-if="globalSearch" class="btn btn-md btn-theme" type="button" :value="globalSearchModel ? $t('common.groupingQuery') : $t('common.globallySearch')" @click="handleChangeSearchModel"/>
            <transition name="drop">
                <div v-if='showList && globalSearchInput === false' class='drop-down-list'>
                    <inline-loading v-if="loading"/>
                    <template v-else>
                        <div class="list-item">
                            <div class="search-filed">
                                <input type="text" class="search-input"
                                       :placeholder="$t('QRCode.searchGroup')"
                                       v-model="groupNameKeyword"
                                       @input="searchGroup">
                                <i class="icon icon-search"></i>
                            </div>
                            <ul>
                                <li v-if='groupList.length === 0'>{{'material.noGroup' | t}}</li>
                                <!-- clear写在此处， 只有手动触发点击事件才需执行 -->
                                <li v-else v-for='group in groupList' @click='selectGroup(group);clearExtendedValue()'
                                    :class='{active: group.id === groupId}'>
                                    <span class="drop-text" :title="group.name">{{group.name}}</span>
                                    <span class="icon icon-arrow-right"></span>
                                </li>
                            </ul>
                        </div>
                        <div class="list-item">
                            <div class="search-filed">
                                <input type="text" class="search-input"
                                       :placeholder="$t('QRCode.searchForm')"
                                       v-model="formNameKeyword"
                                       @input="searchForm">
                                <i class="icon icon-search"></i>
                            </div>
                            <ul>
                                <li v-if='paperList.length === 0'>{{'material.noForm' | t}}</li>
                                <li v-else v-for='paper in paperList' @click='selectFatherPaper(paper)'
                                    :class='{active: paper.id === formOriginId}' :title="paper.paperName">{{paper.paperName}}
                                </li>
                            </ul>
                        </div>
                        <!-- 有自定义表单时，才展开第三级 -->
                        <div class="list-item" v-if="allTypePaperList.length && allTypePaperList.length > 1">
                            <ul>
                                <li v-for="all in allTypePaperList" :key="all.id"
                                    @click="selectPaper(all)"  :title="all.paperName"
                                    :class="{active: all.id === finalCheckedId}">
                                    {{all.paperName}}
                                </li>
                            </ul>
                        </div>
                    </template>
                </div>
                <div v-if="globalSearchInput" class='drop-down-list'>
                    <inline-loading v-if="loading"/>
                    <template v-else>
                        <div class="global-list-item">
                            <div class="search-filed">
                                <input type="text" class="search-input"
                                       :placeholder="$t('QRCode.searchForm')"
                                       v-model="formKeyword"
                                       @input="searchAllForm">
                                <i class="icon icon-search"></i>
                            </div>
                            <ul v-load="loadMore" ref="ul">
                                <li v-if='formData.length === 0'>{{'material.noForm' | t}}</li>
                                <li v-else v-for='form in formData' @click='selectFatherPaper(form)'
                                    :class='{active: form.id === formOriginId}' :title="form.paperName">{{form.paperName}}
                                </li>
                            </ul>
                        </div>
                        <!-- 有自定义表单时，才展开第三级 -->
                        <div class="list-item" v-if="allTypePaperList.length && allTypePaperList.length > 1">
                            <ul>
                                <li v-for="all in allTypePaperList" :key="all.id"
                                    @click="selectPaper(all)"  :title="all.paperName"
                                    :class="{active: all.id === finalCheckedId}">
                                    {{all.paperName}}
                                </li>
                            </ul>
                        </div>
                    </template>
                </div>
            </transition>
        </div>
        <selector id="selector" v-if="extendedList.length > 0"
                  :options="extendedList" v-model="formExtendedValue"
                  :searchPlaceholder="$t('QRCode.searchExtended')"
                  :placeholder="$t('QRCode.selectedExtended')"
                  :disabled="isChecking"
                  search @select="chooseExtended"/>
    </div>
</template>
<script type="text/ecmascript-6">
    import { QuestionnaireApiV1 } from '@/api';
    import debounce from 'lodash/debounce';

    export default {
        props: {
            value: Number,
            customId: Number,
            formExtend: Number,
            // 何处调用该组件 QRCode：二维码， template：模板
            use: String,
            // 查看模式
            isChecking: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                showList: false,
                groupList: [],
                paperList: [],
                groupId: -1,
                loading: true,
                text: '',
                allTypePaperList: [],
                fatherValue: '',
                extendedList: [],
                formExtendedValue: '',
                selectedPaperName: '',
                finalCheckedId: '',
                groupNameKeyword: '',
                formNameKeyword: '',
                // 添加了搜索，这里需要存一个原始数据, 分组
                originalGroupList: [],
                // 表单原始数据
                originalFormList: [],
                formOriginId: null,
                groupName: '',
                globalSearch: false,
                globalSearchInput: false,
                globalSearchModel: false, //搜索模式 false为全局搜索，true为分组搜索
                formData: [],
                formKeyword: '',
                pageNumber: 1,
                pageSize: 10,
                totalPage: Infinity
            };
        },
        mounted() {
            // 获取所有表单分组
            QuestionnaireApiV1
                .getFormGroupList()
                .then((res) => {
                    this.groupList = res.body.data.paperGroups;
                    this.originalGroupList = res.body.data.paperGroups;
                    if (this.value) {
                        // 通过formId获取所在分组的信息
                        QuestionnaireApiV1
                            .getGroupName(this.value)
                            .then((res) => {
                                this.loading = false;
                                // 获取当前分组下的表单列表
                                return this.selectGroup(res.body.data.paperGroup)
                                    .then(() => {
                                        let paper = this.paperList.find(paper => paper.id === this.value);
                                        if (!paper) {
                                            return this.clearSelect();
                                        }
                                        if (!this.customId) {
                                            this.text = res.body.data.paperGroup.name + '：' + paper.paperName;
                                            this.finalCheckedId = ~~paper.formId.split('-')[1];
                                            this.$emit('formName',paper.paperName);
                                        } else {
                                            this.finalCheckedId = this.customId;
                                        }

                                        if (paper.formSource === 3) this.findNextStep(paper, res.body.data.paperGroup.name);
                                    });
                            })
                            .catch(() => {
                                this.text = this.$t('QRCode.chooseForm');
                                this.loading = false;
                            });
                    } else {
                        this.text = this.$t('QRCode.chooseForm');
                        this.loading = false;
                    }
                });
            this.getAllForm();
        },
        methods: {
            toggle() {
                if (this.isChecking) return;
                this.showList = !this.showList;
                this.globalSearch = !this.globalSearch;
                this.globalSearchInput = false;
                this.globalSearchModel = false;
                // 如果选择数据交互后， 未重新选择表单，重新展示上次选择的数据
                if (this.showList === true && this.value) {
                    this.groupNameKeyword = '';
                    this.formNameKeyword = '';
                    this.groupList = this.originalGroupList;
                    QuestionnaireApiV1
                        .getGroupName(this.value)
                        .then(({body: {data: {paperGroup}}}) => {
                            // 当源表单被删除后，无法查询到表单分组
                            if (!paperGroup) return;
                            this.groupId = paperGroup.id;
                            QuestionnaireApiV1
                                .getFormListNoPage(paperGroup.id)
                                .then(({body: {data: {papers}}}) => {
                                    let paper = papers.find(paper => paper.id === this.value);
                                    this.paperList = papers.filter(item =>
                                        item.status === 2 || item.status === 6 || item.status === 7);
                                    this.formOriginId = paper.id;

                                    if (paper.formSource === 3) {
                                        this.arrangeSelectPaperList(paper)
                                            .then(() => {
                                                if (this.allTypePaperList.length) {
                                                    const normalForm = this.allTypePaperList.find(elm => !elm.formType);
                                                    this.finalCheckedId = this.customId ? this.customId : normalForm.id;
                                                }
                                            });
                                    }
                                });
                        });
                }
            },
            close() {
                this.showList = false;
                this.globalSearch = false;
                this.globalSearchInput = false;
                this.globalSearchModel = false;
                if (this.groupNameKeyword !== '') {
                    this.groupNameKeyword = '';
                    this.searchGroup();
                }
                if (this.formNameKeyword !== '') {
                    this.formNameKeyword = '';
                    this.searchForm();
                }
                if (this.formKeyword !== '') {
                    this.formKeyword = '';
                    this.getAllForm();
                }
            },
            // 请求表单列表
            selectGroup(group) {
                const groupId = group.id;
                this.groupName = group.name;
                this.groupId = groupId;
                this.allTypePaperList = [];
                this.formOriginId = null;
                this.formNameKeyword = '';
                return QuestionnaireApiV1
                    .getFormListNoPage(groupId)
                    .then((res) => {
                        /**
                         * 正常或者已发布状态的表单可以进行选择
                         * status：
                         * -1：全部
                         * dmartech状态： 1 未配置， 2 正常， 3 异常，
                         * 金数据表单状态：4 未测试 5 已测试 6 已发布，
                         * 标准表单状态：  7 正常 8 暂停
                         */
                        this.paperList = res.body.data.papers.filter(item =>
                            item.status === 2 || item.status === 6 || item.status === 7);
                        this.originalFormList = res.body.data.papers.filter(item =>
                            item.status === 2 || item.status === 6 || item.status === 7);
                    });
            },
            selectPaper(paper) {
                // paper.formType为空是源表单
                if (paper.formType) {
                    this.$emit('selectCustom', {...paper, formId: this.formOriginId});
                    this.$emit('textLink',paper.indexLink);
                } else {
                    this.$emit('selectCustom', {id: null, indexLink: '',
                        formId: this.formOriginId, paperName: paper.paperName, formName: paper.formName});
                    this.$emit('textLink',paper.formLink + '?id=' + paper.id);
                }
                // txt change
                this.text = this.groupName + '：' + paper.paperName;
                this.showList = false;
                this.globalSearch = false;
                this.globalSearchInput = false;
                this.finalCheckedId = paper.id;

                this.arrangeExtendedList(paper);

                // 重置选择的扩展值（每个表单的扩展值ID不一）
                this.formExtendedValue = '';
                // 扩展链接参数与自定义表单链接参数为同一字段，如果是自定义表单未选择扩展值，为自定义链接， 否则为空
                const indexUrl = paper.formType ? paper.indexLink : '';
                this.$emit('selectExtended', {id: null, url: indexUrl, name: ''});
            },
            // 选择源表单
            selectFatherPaper(paper) {
                this.formOriginId = paper.id;
                // 重置第三级
                this.clearCustom();
                // 重置扩展值
                this.clearExtendedValue();

                // formSource = 3为标准表单，2为金数据表单只有点标准表单才会有第三级和扩展值列表
                if (paper.formSource === 3) {
                    this.arrangeSelectPaperList(paper)
                        .then(() => {
                            // 未有自定义表单时， 需要检查是否有扩展值， 并已当前选择表单为最终表单
                            if (this.allTypePaperList.length && this.allTypePaperList.length === 1) {
                                paper.extensionValueList = this.allTypePaperList[0].extensionValueList;
                                this.arrangeExtendedList(paper);
                                this.doSelectOriginalForm(paper);
                                this.$emit('textLink',
                                    this.allTypePaperList[0].formType ?
                                        this.allTypePaperList[0].indexLink :
                                        this.allTypePaperList[0].formLink + '?id=' + this.allTypePaperList[0].id);
                            } else if (this.globalSearchModel) {
                                QuestionnaireApiV1
                                    .getGroupName(paper.id)
                                    .then(({body: {data: {paperGroup}}}) => {
                                        this.groupName = paperGroup.name;
                                    })
                                    .catch(() => {
                                        this.text = this.$t('QRCode.chooseForm');
                                    });
                            }
                        });
                } else {
                    this.$emit('textLink',paper.url);
                    this.doSelectOriginalForm(paper);
                }
            },
            clearExtendedValue() {
                // 重置扩展值选择
                this.extendedList = [];
                this.formExtendedValue = '';
                this.$emit('selectExtended', {id: null, url: '', name: ''});
            },
            // 选择扩展属性
            chooseExtended(e) {
                const url = this.extendedList.find(elm => elm.id === e.id).formLink;
                this.$emit('selectExtended', {id: e.id, url: url, name: e.name});
            },
            // 用于回显
            findNextStep(paper, groupName) {
                this.arrangeSelectPaperList(paper)
                    .then(() => {
                        const paper = this.allTypePaperList.find(elm => elm.id === this.finalCheckedId);
                        if (!paper) {
                            this.clearSelect();
                            return;
                        }
                        this.text = groupName + '：' + paper.paperName;
                        this.$emit('formName',paper.paperName);
                        this.$emit('exterUrl',paper.formLink);
                        this.arrangeExtendedList(paper);
                        if (this.formExtend) {
                            this.formExtendedValue = this.formExtend;
                        }
                    });
            },
            // 整理可选表单（源、自定义）
            arrangeSelectPaperList(paper) {
                return QuestionnaireApiV1
                    .wechatGetFormList(paper.id)
                    .then(({body: {data}}) => {
                        data.formList.forEach(elm => {
                            elm.paperName = elm.formName;
                        });
                        this.allTypePaperList = data.formList;
                    });
            },
            // 整理扩展值
            arrangeExtendedList(paper) {
                paper.extensionValueList.forEach(elm => {
                    const extensionValue = JSON.parse(elm.extensionValue).map(elm =>elm.value);
                    elm.name = extensionValue.toString().replace(/,/g, ' - ');
                });
                this.extendedList = paper.extensionValueList;
            },
            // 搜索分组
            searchGroup() {
                if (this.groupNameKeyword !== '') {
                    this.groupList = this.originalGroupList.filter(elm => elm.name.indexOf(this.groupNameKeyword) > -1);
                } else {
                    this.groupList = this.originalGroupList;
                }
            },
            // 搜索表单
            searchForm() {
                if (this.formNameKeyword !== '') {
                    this.paperList = this.originalFormList.filter(elm => elm.paperName.indexOf(this.formNameKeyword) > -1);
                } else {
                    this.paperList = this.originalFormList;
                }
            },
            searchAllForm:debounce(function(){
                this.pageNumber = 1;
                this.formData = [];
                this.getAllForm();
            },300),
            clearCustom() {
                this.finalCheckedId = '';
                this.allTypePaperList = [];
            },
            setTxt(id) {
                if (id) {
                    // 通过formId获取所在分组的信息
                    QuestionnaireApiV1
                        .getGroupName(id)
                        .then(({body: {data: {paperGroup}}}) => {
                            QuestionnaireApiV1
                                .getFormListNoPage(paperGroup.id)
                                .then(({body: {data: {papers}}}) => {
                                    let paper = papers.find(paper => paper.id === id);
                                    this.text = paperGroup.name + '：' + paper.paperName;
                                });
                        })
                        .catch(() => {
                            this.text = this.$t('QRCode.chooseForm');
                        });
                } else {
                    this.text = this.$t('QRCode.chooseForm');
                }
            },
            clearSelect() {
                this.clearExtendedValue();
                this.$emit('selectCustom', {id: null, indexLink: '',
                    formId: null, paperName: ''});
                this.text = this.$t('QRCode.chooseForm');
                this.groupId = null;
                this.groupName = '';
                this.allTypePaperList = [];
                this.paperList = [];
            },
            doSelectOriginalForm(paper) {
                this.showList = false;
                this.globalSearch = false;
                this.globalSearchInput = false;
                this.$emit('input', paper.id);
                this.$emit('select', paper);
                this.setTxt(paper.id);
            },
            handleChangeSearchModel(){
                this.globalSearchInput = !this.globalSearchInput;
                this.globalSearchModel = !this.globalSearchModel;
                if (this.groupNameKeyword !== '') {
                    this.groupNameKeyword = '';
                    this.searchGroup();
                }
                if (this.formNameKeyword !== '') {
                    this.formNameKeyword = '';
                    this.searchForm();
                }
                if (this.formKeyword !== '') {
                    this.formKeyword = '';
                    this.getAllForm();
                }
            },
            getAllForm() {
                QuestionnaireApiV1
                    .getAllForm(this.formKeyword,this.pageNumber,this.pageSize)
                    .then(res => {
                        let list = res.body.data.papers;
                        this.formData = this.formData.concat(list);
                        this.totalPage = res.body.data.totalPage;
                    });
            },
            loadMore() {
                if (this.pageNumber >= this.totalPage) return;
                let target = this.$refs.ul;
                if (target.clientHeight + target.scrollTop + 1 > target.scrollHeight) {
                    this.pageNumber++;
                    this.getAllForm();
                }
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .questionnaire-picker {
        display: inline-block;
        vertical-align: middle;
        // width: 465px;

        #selector {
            width: 445px;
        }
        .questionnaire-picker-level-one {
            position: relative;
            margin-bottom: 15px;
            display: flex;
            label {
                display: block;
                position: relative;
                width: 423px;
                height: $input-field-height - 2px;
                line-height: $input-field-height - 2px;
                border: 1px solid $border-color;
                border-radius: 4px;
                padding-right: 8px;
                cursor: pointer;
                padding-left: 1em;
                margin-right: 8px;
                &:hover {
                    border-color: $light-green;
                }

                .icon {
                    float: right;
                }

                .questionnaire-text {
                    display: inline-block;
                    width: 400px;
                    @include ellipsis();
                }
            }

            .drop-down-list {
                position: absolute;
                z-index: 1;
                display: flex;
                left: 0;
                top: 100%;
                margin-top: 4px;
                height: 193px;
                background-color: white;
                border: 1px solid $border-color;
                border-radius: 4px;

                .list-item {
                    max-width: 214px;
                    + .list-item {
                        border-left: 1px solid $border-color;
                    }
                }
                .global-list-item {
                    width: 428px;
                    + .global-list-item {
                        border-left: 1px solid $border-color;
                    }
                }
                ul {
                    flex: 1;
                    height: calc(100% - 33px);
                    overflow: auto;
                    position: relative;

                    li {
                        padding: 0 8px 0 16px;
                        height: $input-field-height;
                        line-height: $input-field-height;
                        cursor: pointer;
                        @include ellipsis();

                        .drop-text {
                            display: inline-block;
                            width: 170px;
                            @include ellipsis();
                        }

                        &:hover {
                            background-color: $hover-bg;
                        }

                        .icon {
                            float: right;
                        }
                    }

                    .active {
                        background-color: $select-bg;

                        &:hover {
                            background-color: $select-bg;
                        }
                    }
                }
            }

            .search-filed {
                align-items: center;
                background-color: #f8f8f8;
                border-bottom: 1px solid #e4e9ed;
                color: #8c8c8c;
                display: flex;
                height: 32px;
                position: relative;
                @include border-radius(0);

                .search-input {
                    background-color: transparent;
                    border: none;
                    height: 32px;
                    min-width: 5em;
                    padding: 0 8px 0 28px;
                    width: 100%;
                }

                .icon-search {
                    background-color: transparent;
                    height: 30px;
                    left: 1px;
                    line-height: 32px;
                    position: absolute;
                    text-align: center;
                    top: 1px;
                    width: 26px;
                }
            }
        }
    }
</style>
