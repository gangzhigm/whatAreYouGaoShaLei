<template>
    <div class="mms-form material-form">
        <!-- 创建彩信素材 -->
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{$route.meta.name | t}}</h1>
                <button type="button" class="pull-right btn btn-md btn-orange" @click="$preview({material})">
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
                        <label for="materialName" class="label">{{'material.mmsName' | t}}</label>
                        <input type="text" v-model.trim="material.materialName" class="input" id="materialName"
                               maxlength="100">
                    </div>
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
                                <search-tree :searchTreeData="groupList" :treeActiveId="selectGroupId"
                                             @getTreeAct='getTreeAct' :action="false"
                                             :levelStage="groupSource === 'use'"></search-tree>
                            </div>
                        </div>
                    </div>
                    <div class="form-field flex">
                        <span class="label">{{'material.MMSContents' | t}}</span>
                        <div class="field-group mms-materials-box">
                            <draggable class="mms-materials" v-if="material.materialMms && material.materialMms.length"
                                       :group="{animation: 100}" @update="dragEnd($event)">
                                <div class="mms-material" v-for="(subMaterial, index) in material.materialMms"
                                     :key="subMaterial.id"
                                     @click="editSubMaterial(subMaterial)">
                                    <span class="light-content-text">{{'material.labelDraggable' | t}}</span>
                                    <p class="mms-material-content">{{subMaterial.mmsContent}}</p>
                                    <b class="theme-text">{{subMaterial.size}}K</b>
                                    <span class="mms-material-delete"
                                          v-if="material.materialMms.length > 1"
                                          @click.stop="removeSubMaterial(index, subMaterial.id)">
                                        {{'common.del' | t}}
                                    </span>
                                </div>
                            </draggable>
                            <div class="pull-right">
                                <span class="title-text">{{'material.remainder' | t}}</span>
                                <span class="theme-text" :class=" availableKB() < 0 ? 'theme-text-negative' : '' ">{{availableKB()}}K</span>
                            </div>
                            <span class="action-text" @click="addSubMaterial">
                                <i class="icon icon-add"></i>
                                {{'material.addNewMMS' | t}}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-panel">
                <input type="button" class="cancel-btn" :value="$t('common.cancel')" @click="cancel">
                <template v-if="!material.id"> {{$route.meta.name | t}}：<span
                        class="step">{{'material.design' | t}}</span></template>
                <input type="button" class="confirm-btn btn btn-theme" :value="$t('material.done')" @click="done">
                <input v-if="!material.id" type="button" class="confirm-btn btn" :value="$t('material.previous')"
                       @click="cancel">
            </div>
        </div>

        <!-- 单屏彩信内容编辑 -->
        <modal v-if="subMaterial.id || creatingSubMaterial"
               :title="$t('material.MMSContents')" size="lg"
               @close="closeMMSDetailModel">
            <div class="form-field">
                <label class="label">{{'material.imgContent' | t}}</label>
                <label class="mms-picture-picker">
                    <img v-if="subMaterial.pictureUrl" :src="subMaterial.pictureUrl">
                    <svg aria-hidden="true" v-else>
                        <use xlink:href="#icon-upload"></use>
                    </svg>
                    <input type="file" ref="imgFile" @change="filePicked" accept="image/gif, image/jpeg">
                    {{'material.uploadImg' | t}}
                    <br>
                    {{'material.format' | t}}
                </label>
            </div>
            <div class="form-field flex">
                <span class="label">{{'material.txtContents' | t}}</span>
                <div class="field-group short-url-insert">
                    <selector class="overlap-right lg"
                              :options="fields"
                              @select="insertField"
                              :placeholder="$t('material.personalization')"
                              v-model="fieldId"/>
                    <input type="text" class="input lg overlap-left overlap-right"
                           v-model.trim="shortUrl"
                           :placeholder="$t('material.shortUrlPlaceholder')">
                    <input type="button"
                           class="field-tail-btn"
                           :value="$t('material.insertLink')"
                           @click="insertUrl">
                </div>
            </div>
            <div class="form-field flex">
                <span class="label placeholder"></span>
                <div class="field-group">
                    <textarea v-model="subMaterial.mmsContent"
                              class="textarea"
                              :placeholder="$t('material.mmsPlaceHolder')+ '“' +UNSUBSCRIBE_SMS_POSTFIX +'”' +$t('material.text')"
                              ref="textarea"></textarea>
                    <p class="content-count-text">
                        {{'material.about' | t}}
                        <span class="orange-text">{{mmsContentLength}}</span>
                        {{'material.char' | t}}
                        <template v-if="isLastSubMaterial">{{'material.tdIncluded' | t}}</template>
                    </p>
                </div>
            </div>
            <template v-slot:buttons>
                <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')"
                       @click="closeMMSDetailModel">
                <input type="button" class="btn btn-md btn-theme" :value="$t('common.save')"
                       @click="saveSubMaterial">
            </template>
        </modal>
    </div>
</template>
<script type="text/ecmascript-6">
    import { ContactApiV1, JourneyMaterialApiV1, JourneyMaterialApiV3 } from '@/api';
    import format from 'date-fns/format';
    import getCursorPosition from '../../../common/utils/cursorPosition';
    import {SHORT_LINK_REG, UNSUBSCRIBE_SMS_POSTFIX} from './sms-material-form.vue';
    import {computeWordsLength} from '../../../common/utils/mixin';
    import {COMMON_WEIXIN_URL_REGEXP, COMMON_NAME_REGEXP, COMMON_URL_REGEXP} from '../../../common/utils/regs';
    import cloneDeep from 'lodash/cloneDeep';

    export const UNSUBSCRIBE_MMS_POSTFIX = '退订TD';

    export default {
        data() {
            return {
                UNSUBSCRIBE_SMS_POSTFIX,
                // 彩信素材
                material: {
                    groupId: 1, //  分组id
                    materialContent: '',    //素材内容
                    materialName: '',   //素材name
                    id: '',
                    type: '2', // 彩信
                    materialMms: [],
                },
                // 单屏子素材
                subMaterial: {
                    // materialId, 主素材id
                    // id,
                    // mmsContent,
                    // pictureUrl,
                    // size, 子素材总大小
                    // fileSize 子素材文件大小
                },
                creatingSubMaterial: false, // 添加单屏子素材
                fields: [],     // 个性化字段列表
                fieldId: '',    // 个性化字段选中项id
                shortUrl: '',   // 短链url

                // 初始状态子素材id用逗号拼接字符串 12,32,42
                originalSubMaterialIdStr: '',
                saving: false, // 正在保存
                errCode:'',//新建保存标签时 接口调用失败code
                groupList: [],  //分组[]
                groupSource: 'use',   // use 使用已有的分组 create 创建新的标签
                selectGroupId: '',  //选中的分组id
                groupName: '',  //分组name

                parentGroupName: '',    //父级分组name
                groupSelectShow: false, //分组选择是否显示
                echoQuery: {}   //route中的信息存储groupId,name,pageNumber,type
            };
        },
        created() {
            this.getGroupListRequest();//获取分组列表
        },
        watch: {
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
                        let p = this.$getPartById(Number(this.selectGroupId), this.groupList);
                        this.parentGroupName = p.name;
                    }
                }
                // 切换radio时，选中分组的所有父级展开
                this.fathersOpen(this.groupList, Number(this.selectGroupId));
            }
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
            // 子素材文本内容长度
            mmsContentLength() {
                const content = this.subMaterial.mmsContent;
                SHORT_LINK_REG.lastIndex = 0;
                if (SHORT_LINK_REG.test(content)) {
                    // 有短链
                    return content.length
                        - (content.lastIndexOf('</url>') - content.indexOf('<url>') + 6)
                        + 14
                        + (this.isLastSubMaterial ? this.UNSUBSCRIBE_SMS_POSTFIX.length : 0);
                }
                return content.length + (this.isLastSubMaterial ? this.UNSUBSCRIBE_SMS_POSTFIX.length : 0);
            },
            // 子素材文本内容字节数
            mmsContentBytes() {
                return this.calculateContentBytes(
                    this.subMaterial.mmsContent
                    + (this.isLastSubMaterial ? this.UNSUBSCRIBE_SMS_POSTFIX : '')
                );
            },
            isLastSubMaterial() {
                if (!this.subMaterial.id) return true;
                const subMaterialIndex = this.material.materialMms.findIndex(({id}) => id === this.subMaterial.id);
                return subMaterialIndex === this.material.materialMms.length - 1;
            },
        },
        mounted() {
            if (this.$route.params.echoQuery) {
                this.echoQuery = this.$route.params.echoQuery;
            }
            //点击其他地方下拉菜单收起
            window.addEventListener('click', this.eventListener);

            this.getMaterial();//获取对应素材

            // 个性化字段
            ContactApiV1
                .getFields()
                .then(({body: {data: {fieldList}}}) => {
                    this.fields = fieldList.map(field => ({
                        name: field.field,
                        id: field.id,
                        cn_name: field.fieldCn,
                        type: field.fieldType
                    }));
                });
        },
        destroyed() {
            window.removeEventListener('click', this.eventListener);//点击其他地方下拉菜单收起
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
            /**
             * search-tree中选择list的某一项时  接收选中项
             * @param group 分组
             */
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
            //获取资源数据
            getMaterial() {
                if (this.$route.query.id) {
                    JourneyMaterialApiV1
                        .getMaterial(this.$route.query.id)
                        .then(({body: {data: {material}}}) => {
                            delete material.updateDate;
                            material.materialContent = '';
                            this.$set(this.$data, 'material', material);
                            this.material.materialMms.forEach((elm, cur) => {
                                elm.sort = cur;
                                elm.fileSize = elm.pictureUrl
                                    ? elm.size * 1024 - this.calculateContentBytes(elm.mmsContent)
                                    : 0;
                                this.originalSubMaterialIdStr += ',' + elm.id;
                            });
                        });
                } else {
                    this.material.materialName = this.$t('material.mms') + format(new Date(), 'YYYY-MM-DD HH:mm:ss');
                }
            },
            // 整个彩信素材剩余 KB 数
            availableKB() {
                let total = 80; // KB
                if (this.material.materialMms)
                    this.material.materialMms.forEach(subMaterial => {
                        total -= subMaterial.size;
                    });
                return Number(total)
                    .toFixed(2);
            },
            //获取分组列表
            getGroupListRequest() {
                JourneyMaterialApiV3
                    .getTreeGroupList({sortType: ''})
                    .then((res) => {
                        this.groupList = [];
                        let arr = [];
                        let treeData = {};

                        treeData = JSON.parse(JSON.stringify(res.body.data.rootGroup));
                        this.groupList.push(treeData);
                        this.$traverseTree(this.groupList, arr);
                        this.groupList = arr;

                        //查找到 "全部分组"
                        let  firstGroup = this.$getCurrentPart(2, this.groupList);
                        firstGroup.noSelect = false;

                        // 默认选中 默认分组 id
                        let r = this.$getCurrentPart(1, firstGroup.childs);
                        let defaultId = r.id;
                        let routeId = this.$route.query.groupId;
                        if (!routeId || routeId === defaultId) {
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
            //计算内容字节
            calculateContentBytes(content) {
                if (!content) return 0;
                SHORT_LINK_REG.lastIndex = 0;
                if (SHORT_LINK_REG.test(content)) {
                    // 有短链
                    let replaceStart = content.indexOf('<url>'),
                        replaceEnd = content.lastIndexOf('</url>');
                    return computeWordsLength(content.slice(0, replaceStart))
                        - 6 + 14
                        + computeWordsLength(content.slice(replaceEnd))
                        + computeWordsLength(this.UNSUBSCRIBE_SMS_POSTFIX);
                }
                return computeWordsLength(content + this.UNSUBSCRIBE_SMS_POSTFIX);
            },
            // 拖拽排序
            dragEnd(e) {
                [this.material.materialMms[e.oldIndex], this.material.materialMms[e.newIndex]] =
                    [this.material.materialMms[e.newIndex], this.material.materialMms[e.oldIndex]];
            },
            // 编辑子素材
            editSubMaterial(subMaterial) {
                const copy = cloneDeep(subMaterial);
                copy.materialId = this.material.id;
                this.$set(this.$data, 'subMaterial', copy);
            },
            // 添加子素材
            addSubMaterial() {
                this.creatingSubMaterial = true;
                const total = this.material.materialMms.length;
                this.$set(this.$data, 'subMaterial', {
                    materialId: this.material.id,
                    id: '',
                    size: 0,
                    fileSize: 0,
                    pictureUrl: '',
                    mmsContent: '',
                    sort: total ? total + 1 : 0
                });
            },
            // 删除子素材
            removeSubMaterial(index, id) {
                JourneyMaterialApiV1
                    .deleteSingleMms(id)
                    .then(() => {
                        this.$toast(this.$t('common.deleteSuccess'), 'success');
                        this.getMaterial();
                    });
            },
            // 子素材表单 - 重置文件选择
            resetFileInput() {
                this.$refs.imgFile.value = '';
            },
            /**
             * 子素材表单 - 选择图片
             * @param e 选择的图片
             * @returns {boolean|undefined}
             */
            filePicked(e) {
                const fileList = e.target.files;

                if (!fileList.length) {
                    return false;
                }

                const file = fileList[0];
                if (!/(jpg|jpeg|gif|png)$/i.test(file.name)) {
                    return this.$toast(this.$t('material.typeWrong'), 'warn');
                }

                if (file.size + this.mmsContentBytes > 80 * 1024) {
                    this.resetFileInput();
                    return this.$toast(this.$t('material.largeSize'), 'warn');
                }

                //https://www.jianshu.com/p/288813b5ee82
                //获取图片文件原始宽高
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (ev) => {
                    const img = new Image();
                    img.src = ev.target.result;
                    img.onload = () => {
                        // 本地预览
                        this.subMaterial.pictureUrl = URL.createObjectURL(file);
                        this.subMaterial.fileSize = file.size;
                    };
                };
            },
            /**
             * 子素材表单 - 插入个性化字段
             * @param name
             */
            insertField({name}) {
                let targetPos = getCursorPosition(this.$refs.textarea);
                let content = [...this.subMaterial.mmsContent];

                /*if (content.length + ('${' + name + '}').length > 350) {
                    this.$toast(this.$t('material.tooLong'), 'warn');
                    return false;
                }*/
                content.splice(targetPos, 0, '${' + name + '}');
                this.subMaterial.mmsContent = content.join('');
            },
            // 子素材表单 - 插入短链
            insertUrl() {
                this.$nextTick(() => {
                    SHORT_LINK_REG.lastIndex = 0;
                    if (SHORT_LINK_REG.test(this.subMaterial.mmsContent)) {
                        this.$toast(this.$t('material.oneLink'), 'warn');
                        return false;
                    }
                    if (this.shortUrl === '') {
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
                    let content = [...this.subMaterial.mmsContent];

                    /*if (content.length + 10 > 350) {               //短链默认10个字符
                        this.$toast(this.$t('material.tooLong'), 'warn');
                        return false;
                    }*/

                    content.splice(position, 0, '<url>' + this.shortUrl + '</url>');
                    // this.subMaterial.mmsContent = content.join('');
                    this.$set(this.subMaterial, 'mmsContent', content.join(''));
                    this.shortUrl = '';
                    // trigger textarea's input event
                    const e = document.createEvent('HTMLEvents');
                    e.initEvent('input', true, true);
                    this.$nextTick(() => {
                        this.$refs.textarea.dispatchEvent(e);
                    });
                });
            },
            // 子素材表单 - 计算子素材

            // 取消子素材 编辑/新建
            closeMMSDetailModel() {
                this.creatingSubMaterial = false;
                this.$set(this.$data, 'subMaterial', {});
                this.fieldId = '';
                this.shortUrl = '';
            },
            // 保存子素材
            async saveSubMaterial() {
                // 内容必填
                if (this.subMaterial.mmsContent === '' && this.subMaterial.pictureUrl === '') {
                    return this.$toast(this.$t('material.noEmpty'), 'warn');
                }

                // 文本内容折合长度
                // 2020-01-14 http://jira.qdum.com/browse/DMARTECH-5047 ： 355 = 350 + 5
                /*if (this.mmsContentLength > 355) {
                    return this.$toast(this.$t('material.tooLong'), 'warn');
                }*/
                // 只能添加一个短链
                const links = this.subMaterial.mmsContent.match(SHORT_LINK_REG);
                if (links && links.length > 1) {
                    this.$toast(this.$t('material.oneLink'), 'warn');
                    return false;
                }
                // 大小
                // 单素材大小不能超过80kb
                if (this.mmsContentBytes + this.subMaterial.fileSize > 80 * 1024) {
                    return this.$toast(this.$t('material.largeSize'), 'warn');
                }
                this.subMaterial.size = ((this.mmsContentBytes + this.subMaterial.fileSize) / 1024).toFixed(2);
                // 多素材大小不能超过80kb
                if (this.subMaterial.id && this.material && this.availableKB() < 0) {
                    return this.$toast(this.$t('material.largeSize'), 'warn');
                }

                if (!this.subMaterial.id && this.material && this.availableKB() - this.subMaterial.size < 0) {
                    return this.$toast(this.$t('material.largeSize'), 'warn');
                }

                // 如果主素材不存在，创建主素材
                if (!this.material.id) {
                    // 主素材名称不能为空
                    if (this.material.materialName === '') {
                        this.$toast(this.$t('material.mmsNameNoEmpty'), 'warn');
                        return false;
                    }

                    let {body: {data: {material}}} = await JourneyMaterialApiV1.create(this.material);

                    delete material.updateDate;
                    material.materialContent = '';
                    this.$set(this.$data, 'material', material);
                    this.material.materialMms = [];

                    this.subMaterial.materialId = material.id;

                    this.$router.replace(Object.assign(
                        {},
                        this.$route,
                        {name: 'editMMS', query: Object.assign({}, this.$route.query, {id: material.id})}
                    ));
                }


                // 是否有要上传图片
                const files = this.$refs.imgFile.files;
                if (files && files.length) {
                    // 上传图片
                    this.$toast(this.$t('material.uploading'));
                    const {body: {data: {fileUrl}}} = await JourneyMaterialApiV1.mmsUpload(files[0]);
                    this.$toast(this.$t('material.uploadSuccess', 'success'));
                    this.subMaterial.pictureUrl = fileUrl;
                }

                if (this.subMaterial.id) {
                    // 更新分屏素材
                    await JourneyMaterialApiV1
                        .updateSingleMms(this.subMaterial)
                        .then(({body: {data: {material}}}) => {
                            this.$toast(this.$t('common.updateSuccess'), 'success');
                            let currentIdx = this.material.materialMms.findIndex(({id}) => id === this.subMaterial.id);
                            material.sort = currentIdx;
                            material.fileSize = material.pictureUrl
                                ? material.size * 1024 - this.calculateContentBytes(material.mmsContent)
                                : 0;
                            this.material.materialMms.splice(currentIdx, 1, material);
                            this.closeMMSDetailModel();
                        });
                } else {
                    // 新建分屏素材
                    await JourneyMaterialApiV1
                        .createSingleMms(this.subMaterial)
                        .then(({body: {data: {material}}}) => {
                            this.$toast(this.$t('common.saveSuccess'), 'success');
                            material.sort = this.material.materialMms.length;
                            material.fileSize = material.pictureUrl
                                ? material.size * 1024 - this.calculateContentBytes(material.mmsContent)
                                : 0;
                            this.material.materialMms.push(material);
                        });
                }

                this.closeMMSDetailModel();
            },
            // 取消 编辑 彩信素材
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
                            pageNumber: this.$route.query.pageNumber,
                            type: this.$route.query.groupType
                        }
                    });
                }
            },
            // 保存当前彩信素材
            async done() {
                if (this.saving) return false;

                if (this.material.materialName === '') {
                    this.$toast(this.$t('material.mmsNameNoEmpty'), 'warn');
                    return false;
                }

                // 没有任何分屏
                if (this.material.materialMms.length === 0) {
                    let sure = await this.$confirm(this.$t('common.defaultConfirmTitle'), this.$t('material.mmsEmptyTip'));
                    if (sure) {
                        if (this.$route.params.echoQuery) {
                            this.$router.push({name: 'materialStore', query: this.echoQuery});
                        } else {
                            this.$router.push({name: 'materialStore', query: {tab: this.$route.query.tab}});
                        }
                    }
                    return;
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

                this.saving = true;

                // 选择/新建分组
                if (this.groupSource === 'create') {
                    await JourneyMaterialApiV3
                        .createGroup({
                            name: this.groupName,
                            parentId: this.parentGroupId
                        })
                        .then((res) => {
                            this.selectGroupId = parseInt(res.body.data.group.id);
                            this.material.groupId = parseInt(this.selectGroupId);
                        })
                        .catch((err)=>{
                            this.errCode = err.body.code;
                        });
                    if (this.errCode) {
                        this.saving = false;
                        this.errCode = '';
                        return;
                    }
                    this.parentGroupId = '';
                } else {
                    this.material.groupId = parseInt(this.selectGroupId);
                }

                // 拖动排序
                const subMaterialIds = this.material.materialMms.map(({id}) => id);
                const sortChange = this.originalSubMaterialIdStr !== subMaterialIds.join(',');
                try {
                    if (sortChange) {
                        await JourneyMaterialApiV1.sortMMSMaterials(this.material.id, subMaterialIds);
                    }

                    if (this.material.id) {
                        await JourneyMaterialApiV1.update(this.material);
                        this.$toast(this.$t('common.updateSuccess'), 'success');
                    } else {
                        await JourneyMaterialApiV1.create(this.material);
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                    }
                    if (this.$route.params.echoQuery) {
                        this.$router.push({name: 'materialStore', query: this.echoQuery});
                    } else {
                        this.$router.push({name: 'materialStore', query: {tab: this.$route.query.tab}});
                    }
                } catch (e) {
                    this.saving = false;
                }
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "./material-form";

    .mms-form {
        .form-inner-wrapper {
            margin: 32px auto;
            max-width: 700px;
            width: 80%;

            .theme-text-negative {
                color: $dark-red;
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
        }

        .mms-materials-box {
            overflow: hidden;
        }

        .mms-materials {
            background: $content-bg;
            border: 1px solid $form-border;
            @include border-radius(4px);
            padding: 8px;

            .mms-material {
                display: flex;
                padding: 0 8px;
                background-color: white;
                cursor: move;

                ~ .mms-material {
                    margin-top: 8px;
                }

                .mms-material-content {
                    flex: 1;
                    margin-left: 8px;
                    border-left: 1px solid $border-color;
                    color: $color-title;
                    padding: 0 8px;
                    @include ellipsis;
                }

                .mms-material-delete {
                    margin-left: 24px;
                    padding-left: 8px;
                    cursor: pointer;
                    color: $red;

                    &:hover {
                        color: $dark-red;
                    }
                }
            }
        }

        .mms-picture-picker {
            display: inline-block;
            vertical-align: top;
            line-height: 20px;
            padding: $input-field-height / 2;
            border: 1px dashed $form-border;
            @include border-radius(4px);
            text-align: center;
            background-color: $content-bg;
            @include transition();
            cursor: pointer;

            &:hover {
                background-color: $select-bg;
                border-style: solid;
                border-color: $theme;
            }

            &:active,
            &:focus {
                @include box-shadow(0 0 4px rgba(#2ecbb5, .35))
            }

            input {
                display: none;
            }

            svg {
                display: block;
                width: 50px;
                height: 50px;
                margin: auto auto $input-field-height/2;
                fill: currentColor;
            }

            img {
                display: block;
                width: 200px;
                margin: auto auto $input-field-height/2;
            }
        }

        .short-url-insert {
            display: flex;

            .field-tail-btn {
                padding: 0 16px;
                margin-left: -1px;
                border: 1px solid $form-border;
                line-height: $input-field-height - 2px;
                background-color: $content-bg;
                border-top-right-radius: 4px;
                border-bottom-right-radius: 4px;
                @include appearance(none);
                cursor: pointer;

                &:hover {
                    z-index: 1;
                    background-color: darken($content-bg, 2%);
                }
            }
        }

        .content-count-text {
            text-align: right;
            width: 70%;
        }
    }

</style>
