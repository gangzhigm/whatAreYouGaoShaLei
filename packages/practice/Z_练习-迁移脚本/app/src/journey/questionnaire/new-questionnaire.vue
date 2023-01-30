<template>
    <!--新建表单-->
    <div class="content-container new-questionnaire" @click="closeCheckGroup">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'home.newQuestionnaire' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class='content-view padding margin white-bg'>
                <div class="form-inner-wrapper">
                    <!--表单分组-->
                    <div class="form-field">
                        <span class="label placeholder">{{'form.formGroup' | t}}</span>
                        <radio source="use" v-model="groupSource" @input="changeGroupSource('use')">
                            {{'material.selectGroup' | t}}
                        </radio>
                        <radio source="create" v-model="groupSource" @input="changeGroupSource('create')" :disabled="$has('journey_form_add_group')">
                            {{'material.createGroup' | t}}
                        </radio>
                    </div>
                    <!--表单分组选择新建表单-->
                    <div class="form-field" v-if="groupSource === 'create'">
                        <label class="label" for="create"></label>
                        <input type="text" class="input" id="create" :placeholder="$t('material.groupName')"
                               v-model.trim="groupName" maxlength="255"/>
                    </div>
                    <!--选择分组-->
                    <div class="form-field">
                        <label class="label placeholder" for="use">
                            {{groupSource === 'create' ? $t('common.parentGroup') : $t('newJourney.selectGroup')}}</label>
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
                    <!--创建方式-->
                    <div class="form-field">
                        <span class="label placeholder">{{'material.createMethod' | t}}</span>
                        <div class="create-entry drag-design"
                             @click="toCreateForm">
                            <button class="create-entry-btn" :disabled="$has('journey_form_add_standard')"></button>
                            {{'form.dmartechForm' | t}}
                        </div>
                        <div class="create-entry import-zip"
                             @click="toJinshujuForm">
                            <button class="create-entry-btn" :disabled="$has('journey_form_jinshuju_api')"></button>
                            {{'form.jinShuJu' | t}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import { QuestionnaireApiV1 } from '@/api';

    export default {
        data() {
            return {
                groupSource: 'use', // use 使用已有的分组 create 创建新的标签
                groupList: [],      // 表单分组列表
                selectGroupId: '',  // 选择的分组标识
                groupName: '',      // 新建表单分组名称

                parentGroupName: '', // 选择的分组名称
                groupSelectShow: false, // 控制选择分组选择框显隐
            };
        },
        computed: {
            // 导航
            crumbs() {
                return [
                    {name: 'journey', text: 'Dmartech'},
                    {name: 'journeyFormManagement', text: this.$t('home.leads'), params: {id: 0}},
                    {name: 'newQuestionnaire', text: this.$t('home.newQuestionnaire')},
                ];
            },
        },
        mounted() {
            this.getGroupListRequest();
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
            }
        },
        methods: {
            //选中分组的所有父级元素open=true
            fathersOpen(list, id) {
                let fathersArr = [];
                fathersArr = this.$getCurrentFathers(list, id);
                fathersArr.forEach(item => {
                    item.open = true;
                });
            },
            // 展开、隐藏选择分组选择器
            readyCheckGroup() {
                this.groupSelectShow = !this.groupSelectShow;
            },
            // 隐藏选择分组选择器
            closeCheckGroup(){
                this.groupSelectShow = false;
            },
            // search-tree中选择list的某一项时  接收选中项
            getTreeAct(group) {
                this.selectGroupId = group.id;
                this.parentGroupName = group.name;
                this.groupId = group.id;
                this.groupSelectShow = false;
            },
            // 获取分组内容
            getGroupListRequest() {
                const sortType = 1; // 分组默认排序
                QuestionnaireApiV1
                    .getFormGroup(sortType)
                    .then((res) => {
                        this.groupList = [];
                        let test = [];
                        let treeObj = {};

                        treeObj = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.groupList.push(treeObj);
                        this.$traverseTree(this.groupList,test);
                        this.groupList = test;

                        //查找到 "全部分组"
                        let  firstGroup = this.$getCurrentPart(2, this.groupList);
                        firstGroup.noSelect = false;

                        // 选中默认分组
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
            // 选择表单分组类型， 新建or直接选择
            changeGroupSource(source) {
                if (source === 'create') {
                    this.groupName = '';
                }
            },
            // 选择新建标准表单
            toCreateForm() {
                // 权限控制
                if (this.$has('journey_form_add_standard')) return;
                if (!this.groupReg()) return;
                // 选择/新建分组
                if (this.groupSource === 'create') {
                    QuestionnaireApiV1
                        .addGroup({
                            name: this.groupName,
                            parentId: this.selectGroupId
                        })
                        .then((res) => {
                            this.selectGroupId = parseInt(res.body.data.groupId);
                            this.groupName = '';
                            this.$router.push({
                                name: 'newQuestionnaireForm',
                                query: {
                                    groupId: parseInt(res.body.data.groupId),
                                },
                            });
                        });
                } else {
                    this.$router.push({
                        name: 'newQuestionnaireForm',
                        query: {groupId: this.selectGroupId},
                    });
                }
            },
            // 选择新建金数据表单
            toJinshujuForm() {
                // 权限控制
                if (this.$has('journey_form_jinshuju_api')) return;
                if (!this.groupReg()) return;
                // 选择/新建分组
                if (this.groupSource === 'create') {
                    QuestionnaireApiV1
                        .addGroup({
                            name: this.groupName,
                            parentId: this.selectGroupId
                        })
                        .then((res) => {
                            this.selectGroupId = parseInt(res.body.data.groupId);
                            this.groupName = '';
                            this.$router.push({
                                name: 'questionnaireForm',
                                params: {
                                    groupId: this.selectGroupId, id: -1
                                },
                            });
                        });
                } else {
                    this.$router.push({
                        name: 'questionnaireForm',
                        params: {groupId: this.selectGroupId, id: -1},
                    });
                }
            },

            // 新建表单分组字段校验
            groupReg() {
                // 新建分组 名称校验
                if (this.groupSource === 'create' && !this.groupName) {
                    this.$toast(this.$t('material.groupNameNotNull'), 'warn');
                    return false;
                }
                if (this.groupSource === 'create' && !COMMON_NAME_REGEXP.test(this.groupName)) {
                    this.$toast(this.$t('form.folderName') + ' ' + this.$t('common.nameSpecial'), 'warn');
                    return false;
                }
                return true;
            }
        }
    };
</script>
<style type="text/scss" lang="scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';

    .new-questionnaire {
        @import "questionnaire";

        .form-inner-wrapper {
            margin: 32px auto;
            max-width: 800px;
            width: 100%;
        }
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

        .create-entry {
            display: inline-block;
            margin: 0 24px 0 0;
            font-size: 14px;
            color: $color-light-content;

            &:hover,
            &:active {
                color: $orange;

                .create-entry-btn {
                    border-color: $orange;
                    @include grayscale(0);

                    &:disabled {
                        cursor: not-allowed;
                    }
                }
            }
        }

        .create-entry-btn {
            display: block;
            position: relative;
            width: 176px;
            height: 179px;
            margin-bottom: 10px;
            border: 1px dashed $border-color;
            @include border-radius(3px);
            @include transition-property(border-color, background-color, filter, -webkit-filter);
            @include transition(.2s ease);
            @include grayscale(100%);
        }

        .drag-design {
            .create-entry-btn {
                cursor: pointer;
                background: transparent url("../material/form/images/drag-design.png") no-repeat center;

                &:hover {
                    background: transparent url("../material/form/images/drag-design-active.png") no-repeat center;
                }
            }
        }

        .import-zip {
            .create-entry-btn {
                cursor: pointer;
                background: transparent url("../material/form/images/import-zip.png") no-repeat center;

                &:hover {
                    background: transparent url("../material/form/images/import-zip-active.png") no-repeat center;
                }
            }
        }

    }
</style>
