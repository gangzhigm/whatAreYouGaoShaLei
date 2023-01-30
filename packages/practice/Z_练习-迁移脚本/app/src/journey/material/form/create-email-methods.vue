<template>
    <div class="email-edit-methods material-form">
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'material.createNewEmail' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view white-bg form">
                <div class="form-inner-wrapper">
                    <div class="form-field">
                        <span class="label placeholder">{{'material.materialGroup' | t}}</span>
                        <radio source="use" v-model="groupSource">{{'material.selectGroup' | t}}</radio>
                        <radio source="create" v-model="groupSource" :disabled="$has('journey_material_add_group')">
                            {{'material.createGroup' | t}}
                        </radio>
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
                                <search-tree :searchTreeData="groupList"
                                             :treeActiveId="selectGroupId"
                                             @getTreeAct='getTreeAct' :action="false"
                                             :levelStage="groupSource === 'use'"></search-tree>
                            </div>
                        </div>
                    </div>
                    <div class="form-field">
                        <span class="label placeholder">{{'material.createMethod' | t}}</span>
                        <div class="create-entry drag-design" @click="toEditor">
                            <button class="create-entry-btn"></button>
                            {{'material.layoutEditor' | t}}
                            <span class="icon icon-warn"
                                  v-title:bottom="$t('material.dropTip')+`<a href='https://doc.dmartech.cn/qi-ta-shuo-ming/guan-yu-tuo-bian-ji-qi-jian-rong-xing-shuo-ming' target='_blank' class='action-text' rel='noopener'>`+$t('material.help')+`</a>`"></span>
                        </div>
                        <div class="create-entry drag-design" @click="toEditorBlock" v-if="isNike">
                            <button class="create-entry-btn"></button>
                            {{'material.layoutEditorBlock' | t}}
                            <span class="icon icon-warn"
                                  v-title:bottom="$t('material.dropTip')+`<a href='https://doc.dmartech.cn/qi-ta-shuo-ming/guan-yu-tuo-bian-ji-qi-jian-rong-xing-shuo-ming' target='_blank' class='action-text' rel='noopener'>`+$t('material.help')+`</a>`"></span>
                        </div>
                        <div class="create-entry paste-html-code" @click="nextStep">
                            <button class="create-entry-btn"></button>
                            {{'material.pastCode' | t}}
                        </div>
                        <!-- 粘贴代码(批次发送) -->
                        <div class="create-entry paste-html-code" @click="toPastCode" v-if="isNike">
                            <button class="create-entry-btn"></button>
                            {{'material.pastCodeBatch' | t}}
                        </div>
                        <div class="create-entry import-zip" :class="{active: importStatus != 'empty'}">
                            <div class="create-entry-btn" @click="actionImportZIP">
                                <p class="zip-name" :title="fileName">{{fileName}}</p>
                                <p class="import-status" :class="importStatus">
                                    <span class="icon icon-correct" v-if="importStatus == 'complete'">{{'material.uploadSuccess' | t}}</span>
                                    <template v-if="importStatus == 'uploading'">
                                        <span class="icon icon-classic-loading"></span>
                                        {{'material.uploading' | t}}{{'punctuation.colon' | t}} {{progress}}%
                                        <span class="icon icon-round-close" @click.stop="resetUpload"></span>
                                    </template>
                                    <span v-if="importStatus == 'error'" :title="$t('material.uploadError')"
                                          class="icon icon-warn">{{'material.uploadError' | t}}</span>
                                </p>
                                <label class="btn btn-white btn-md icon icon-folder"
                                       :disabled="importStatus == 'uploading'">
                                    {{'material.selectZip' | t}}
                                    <input type="file" v-if="importReset" :disabled="importStatus == 'uploading'"
                                           ref="importer"
                                           @change="fileChange">
                                </label>
                            </div>
                            <p>
                                {{'material.importZip' | t}}
                                <span class="icon icon-warn"
                                      v-title:bottom="$t('material.emailTip')+`<a href='https://doc.dmartech.cn/ying-xiao-lv-cheng/su-cai/' target='_blank' class='action-text' rel='noopener'>`+$t('material.help')+`</a>`"></span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form-panel">
            <input type="button" class="cancel-btn" :value="$t('common.cancel')" @click="cancel">
            {{'material.selectEmail' | t}}<span class="step">{{'material.setup' | t}}</span>
            &nbsp;&gt;&nbsp;{{'material.design' | t}}
            <input type="button" class="confirm-btn btn btn-contact" :value="$t('material.next')" @click="nextStep"
                   :disabled="!zipUrl">
            <input type="button" class="confirm-btn btn btn-contact" :value="$t('material.copyCode')" v-if="isNike" v-clipboard:copy="sourceCode" v-clipboard:success="onCopy" v-clipboard:error="onError"
                   :disabled="getContent">
        </div>
    </div>
</template>
<script type="text/ecmascript-6">
    import { JourneyMaterialApiV1, JourneyMaterialApiV3 } from '@/api';
    import {trackEvent} from '../../../monitor';
    import {COMMON_NAME_REGEXP} from '../../../common/utils/regs';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                tab: null,
                error: 0,   //错误number
                progress: 0,    //进度 %
                fileName: '',   //  文件name
                uploader: null, //上传
                importReset: true,
                zipUrl: '', //zip
                file: null, //文件
                groupList: [],  //分组ID
                groupSource: 'use',   // use 使用已有的分组 create 创建新的标签
                selectGroupId: '',  //  选中的分组id
                groupName: '',  //分组name

                parentGroupName: '', //父级分组name
                parentGroupId: '',   //父级分组id
                groupSelectShow: false, //选择分组下拉菜单显隐
                sourceCode: '',    //复制到粘贴板的源码
                getContent: true,  //是否已经获取到zip内容
            };
        },
        created() {
            this.tab = this.$route.query.tab;
            this.getGroupListRequest();//获取分组列表
        },
        mounted() {
            //点击其他地方下拉菜单收起
            window.addEventListener('click', this.eventListener);
        },
        computed: {
            // 是否是 nike 账号
            ...mapState({
                isNike: state => state.user.isNikeCount
            }),
            //面包屑
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {name: 'materialStore', text: this.$t('material.contentManagement')},
                    Object.assign({}, this.$route, {text: this.$t('material.createNewEmail')})
                ];
            },
            //complete 、error、 uploading 、empty
            importStatus() {
                if (this.error !== 0) {
                    return 'error';
                }
                if (!this.file && this.progress === 0) {
                    return 'empty';
                }
                if (this.progress === 100 && this.zipUrl) {
                    return 'complete';
                }
                return 'uploading';
            },
        },
        watch: {
            // 新建、选择分组时 获取父级name和id
            groupSource() {
                //新建素材时，全部分组不可选
                let firstGroup = this.$getCurrentPart(2, this.groupList);
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
                        let p = this.$getPartById(Number(this.selectGroupId), this.groupList);
                        this.parentGroupName = p.name;
                    }
                }
                // 切换radio时，选中分组的所有父级展开
                this.fathersOpen(this.groupList, Number(this.selectGroupId));
            }

        },
        destroyed() {
            window.removeEventListener('click', this.eventListener);
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
            //获取分组列表
            getGroupListRequest() {
                JourneyMaterialApiV3
                    .getTreeGroupList({sortType: ''})
                    .then((res) => {
                        let arr = [];
                        let treeData = {};

                        treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.groupList.push(treeData);
                        this.$traverseTree(this.groupList, arr);
                        this.groupList = arr;
                        //查找到 "全部分组"
                        let firstGroup = this.$getCurrentPart(2, this.groupList);
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
                            let p = this.$getPartById(Number(this.selectGroupId), this.groupList);
                            this.parentGroupName = p.name;
                        }
                        this.fathersOpen(this.groupList, Number(this.selectGroupId));

                    });
            },
            /**
             * search-tree中选择list的某一项时  接收选中项
             * @param group 分组
             * */
            getTreeAct(group) {
                this.selectGroupId = group.id;
                this.parentGroupName = group.name;
                this.parentGroupId = group.id;
                this.groupId = group.id;
                this.groupSelectShow = false;
            },
            // ready选择分组
            readyCheckGroup() {
                this.groupSelectShow = !this.groupSelectShow;
            },
            //通用方法 下拉菜单的收起
            eventListener() {
                this.groupSelectShow = false;
            },

            // 准备导入压缩包
            actionImportZIP() {
                if (this.importStatus === 'empty') {
                    this.$refs.importer.click();
                }
            },
            /** 文件变更
             * @param event 文件
             * */
            fileChange(event) {
                this.error = 0;
                let file = event.target.files[0];
                let vm = this;
                if (!file) {
                    return false;
                }
                if (!/\.zip$/i.test(file.name)) {
                    this.$toast(this.$t('material.selectZip'), 'warn');
                    this.resetUpload();
                    return false;
                }
                this.fileName = file.name;
                this.file = file;
                this.progress = 0;
                if (this.uploader) {
                    this.uploader.abort();
                }
                // upload the file
                JourneyMaterialApiV1
                    .uploadZIP(file, function (e) {
                        // remember request for abort()
                        if (vm.uploader === null)
                            vm.uploader = this;
                        if (e.percent > vm.progress)
                            vm.progress = e.percent.toFixed(2);
                    })
                    .then(({body: {data: {materialZipUrl}}}) => {
                        this.progress = 100;
                        this.resetFile();
                        this.zipUrl = materialZipUrl;
                        this.uploader = null;
                        trackEvent('营销旅程-邮件素材-上传ZIP', {keyword: this.name});
                        if (this.isNike) {
                            // 获取zip的内容，用于复制源码到粘贴板
                            JourneyMaterialApiV1.getZIPContent(this.zipUrl)
                                .then(res => {
                                    this.sourceCode = res.body.data.materialContent;
                                    this.getContent = false;
                                });
                        }
                    })
                    .catch(() => {
                        this.progress = 0;
                        this.error = 1;
                        this.resetFile();
                    });
            },
            // 重置
            resetFile() {
                this.importReset = false;
                this.$nextTick(() => {
                    this.importReset = true;
                });
            },
            /**
             * 底部栏操作\粘贴html
             */
            cancel() {
                this.$router.go(-1);
            },

            toEditor() {
                // 新建分组 名称校验
                if (this.groupSource === 'create' && !this.groupName) {
                    this.$toast(this.$t('material.groupNameNotNull'), 'warn');
                    return false;
                }
                if (this.groupName && !COMMON_NAME_REGEXP.test(this.groupName)) {
                    this.$toast(this.$t('common.filterName'), 'warn');
                    return false;
                }

                // 选择/新建分组
                if (this.groupSource === 'create') {
                    JourneyMaterialApiV3
                        .createGroup({
                            name: this.groupName,
                            parentId: this.parentGroupId
                        })
                        .then((res) => {
                            this.selectGroupId = res.body.data.group.id;
                            this.$router.push({
                                name: 'draggableEmail',
                                query: {groupId: this.selectGroupId, groupType: 3},
                            });

                        });
                    this.parentGroupId = '';
                } else {
                    this.$router.push({
                        name: 'draggableEmail',
                        query: {groupId: this.selectGroupId, groupType: 3},
                    });
                }
            },
            toEditorBlock() {
                // 新建分组 名称校验
                if (this.groupSource === 'create' && !this.groupName) {
                    this.$toast(this.$t('material.groupNameNotNull'), 'warn');
                    return false;
                }
                // 选择/新建分组
                if (this.groupSource === 'create') {
                    JourneyMaterialApiV3
                        .createGroup({
                            name: this.groupName,
                            parentId: this.parentGroupId
                        })
                        .then((res) => {
                            this.selectGroupId = res.body.data.group.id;
                            this.$router.push({
                                name: 'templateEmail',
                                query: {groupId: this.selectGroupId, groupType: 6},
                            });
                        });
                    this.parentGroupId = '';
                } else {
                    this.$router.push({
                        name: 'templateEmail',
                        query: {groupId: this.selectGroupId, groupType: 6},
                    });
                }
            },
            // 复制成功
            onCopy() {
                this.$toast(this.$t('form.copied'), 'success');
            },
            // 复制失败
            onError() {
                this.$toast(this.$t('form.copyErr'), 'error');
            },
            nextStep() {
                // 下一步
                if (this.zipUrl) {
                    localStorage.setItem('file', this.zipUrl);
                } else {
                    localStorage.removeItem('file');
                }

                // 新建分组 名称校验
                if (this.groupSource === 'create' && !this.groupName) {
                    this.$toast(this.$t('material.groupNameNotNull'), 'warn');
                    return false;
                }

                // 选择/新建分组
                if (this.groupSource === 'create') {
                    JourneyMaterialApiV3
                        .createGroup({
                            name: this.groupName,
                            parentId: this.parentGroupId
                        })
                        .then((res) => {
                            this.selectGroupId = parseInt(res.body.data.group.id);
                            this.$router.push({
                                name: 'createEmail',
                                params: {file: this.zipUrl},
                                query: {
                                    tab: this.tab,
                                    groupId: this.selectGroupId,
                                    groupSource: this.groupSource,
                                },
                            });
                        });
                    this.parentGroupId = '';
                } else {
                    this.$router.push({
                        name: 'createEmail',
                        params: {file: this.zipUrl},
                        query: {
                            tab: this.tab,
                            groupId: this.selectGroupId,
                            groupSource: this.groupSource,
                        }
                    });
                }
            },
            // nike批次发送粘贴代码
            toPastCode() {
                // 新建分组 名称校验
                if (this.groupSource === 'create' && !this.groupName) {
                    this.$toast(this.$t('material.groupNameNotNull'), 'warn');
                    return false;
                }
                // 选择/新建分组
                if (this.groupSource === 'create') {
                    JourneyMaterialApiV3
                        .createGroup({
                            name: this.groupName,
                            parentId: this.parentGroupId
                        })
                        .then((res) => {
                            this.selectGroupId = parseInt(res.body.data.group.id);
                            this.$router.push({
                                name: 'createNikeEmail',
                                // params: {file: this.zipUrl},
                                query: {
                                    // tab: this.tab,
                                    groupId: this.selectGroupId,
                                    groupSource: this.groupSource,
                                },
                            });
                        });
                    this.parentGroupId = '';
                } else {
                    this.$router.push({
                        name: 'createNikeEmail',
                        // params: {file: this.zipUrl},
                        query: {
                            // tab: this.tab,
                            groupId: this.selectGroupId,
                            groupSource: this.groupSource,
                        }
                    });
                }
            },
            //取消上传
            resetUpload() {
                if (this.uploader)
                    this.uploader.abort();
                this.file = null;
                this.fileName = '';
                this.progress = 0;
                this.zipUrl = '';
                this.uploader = null;
                this.resetFile();
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "./material-form";

    .email-edit-methods {

        .form {
            text-align: center;
        }

        .form-inner-wrapper {
            margin: 32px auto;
            max-width: 1000px;
            width: 100%;

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
                }
            }
        }

        .drag-design {
            .create-entry-btn {
                cursor: pointer;
                background: transparent url("./images/drag-design.png") no-repeat center;

                &:hover {
                    background: transparent url("./images/drag-design-active.png") no-repeat center;
                }
            }
        }

        .paste-html-code {
            .create-entry-btn {
                cursor: pointer;
                background: transparent url("./images/paste-html-code.png") no-repeat center;

                &:hover {
                    background: transparent url("./images/paste-html-code-active.png") no-repeat center;
                }
            }
        }

        .import-zip {
            .zip-name {
                color: $color-light-content;
                padding: 54px 5px 5px;
                @include ellipsis();
                background: transparent url("./images/import-zip-active.png") no-repeat center 8px;
                @include background-size(auto 45px);
                text-align: center;
            }

            .import-status {
                line-height: 14px;
                text-align: center;
                @include ellipsis();

                &.complete {
                    color: $green;
                }

                &.error {
                    color: $red;
                    font-size: 12px;
                }

                &.uploading {
                    position: relative;
                    color: #b28619;
                }

                @include keyframes(rotate) {
                    from {
                        @include transform(rotate(360deg));
                    }
                    to {
                        @include transform(rotate(0deg));
                    }
                }

                // classic loading icon
                .icon-classic-loading {
                    display: inline-block;
                    @include animation(rotate .4s linear infinite)
                }

                .icon-round-close {
                    cursor: pointer;
                }
            }

            .icon-folder {
                position: absolute;
                bottom: 0;
                white-space: nowrap;
                left: 50%;
                color: $color-light-content;
                @include transform(translateX(-50%));
                @include user-select(none);
            }

            &.active {
                .create-entry-btn {
                    border-color: $orange;
                    background-color: #fff1eb;
                    @include grayscale(0);
                }
            }

            &:not(.active) {

                .zip-name,
                .icon-folder {
                    display: none;
                }

                .create-entry-btn {
                    cursor: pointer;
                    background: transparent url("./images/import-zip.png") no-repeat center;

                    &:hover {
                        background: transparent url("./images/import-zip-active.png") no-repeat center;
                    }
                }
            }

            input[type="file"] {
                display: none;
            }
        }

        .create-entry-btn {
            display: block;
            position: relative;
            width: 140px;
            height: 140px;
            margin-bottom: 10px;
            border: 1px dashed $border-color;
            @include border-radius(3px);
            @include transition-property(border-color, background-color, filter, -webkit-filter);
            @include transition(.2s ease);
            @include grayscale(100%);
        }
    }

</style>
