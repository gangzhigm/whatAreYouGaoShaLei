<template>
    <div class="customer-upload">
        <div class="content-view">
            <crumbs :crumbs="crumbs"/>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'swarm.upload' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view padding margin white-bg">
                <div class="container" v-if="!importState">
                    <!--注意事项-->
                    <div class="form-field flex">
                        <div class="tips">
                            <div class="describe">
                                <span>{{'swarm.template' | t}}</span>
                                <span class="csv-sample-link-button"
                                      @click="downloadSampleFiles('excel')">{{'swarm.downloadExcel' | t}}</span>
                                <span>{{'swarm.Excel' | t}}</span>
                                <span>&nbsp;{{'swarm.or' | t}} &nbsp;</span>
                                <span class="csv-sample-link-button"
                                      @click="downloadSampleFiles('csv')">{{'swarm.downloadCSV' | t}}</span>
                                <span>{{'swarm.CSV' | t}}</span>
                            </div>
                            <p class="indent">{{'contact.notice' | t}}：</p>
                            <p class="indent">1. {{'contact.csvNotice' | t}}</p>
                            <p class="levelIndent">1）{{'contact.csvNoticeName' | t}} <code>a-zA-Z0-9-_</code></p>
                            <p class="levelIndent">2）{{'contact.csvNoticeHead' | t}}</p>
                            <p class="levelIndent">
                                3）{{'contact.supportImport' | t}}
                                <b><code>utf8</code></b>、<b><code>Big5</code></b>、<b><code>gb18030</code></b>
                                {{'contact.threeType' | t}}
                            </p>
                            <p class="indent">2. {{'contact.primaryKeyNoticeA' | t}}
                                <router-link class="action-text" :to="{name: 'userAttribute'}" target="_blank">
                                    “{{'home.data' | t}}-{{'home.meta' | t}}-{{'metaData.userAttr' | t}}”
                                </router-link>
                                {{'contact.primaryKeyNoticeB' | t}}
                            </p>
                            <p class="indent">3. {{'contact.errorDataNotice' | t}}</p>
                            <p class="indent">4. {{'contact.importDetailNoticeA' | t}}
                                <router-link class="action-text" :to="{name: 'dataCenter'}" target="_blank">
                                    “{{'home.data' | t}}”
                                </router-link>
                                {{'contact.importDetailNoticeB' | t}}
                            </p>
                        </div>
                    </div>

                    <div class="form-field tips">
                        <div class="describe">
                            <span>{{'swarm.uploadPurpose' | t}}</span>
                        </div>
                        <selector :options="uploadChoiceGoal" @select="changeUploadChoiceGoal"
                                  class="xl component-margin" v-model="objective"/>
                    </div>
                    <!--快速上传 只有账户开通了快速上传 才会显示步骤三-->
                    <div class="form-field tips" v-if="fastUpload == 1 && (objective === 'delete_user' || objective ==='user')">
                        <div class="describe">
                            <span>{{'swarm.uploadMode' | t}}</span>
                        </div>
                        <div class="field-group">
                            <radio :source="0" v-model="uploadMode">{{'swarm.normalMode' | t}}</radio>
                            <radio :source="1" v-model="uploadMode">{{'swarm.speedMode' | t}}</radio>
                            <span class="icon icon-yiwen1"
                                  v-title:right="this.$t('swarm.uploadDescription')+this.$t('swarm.detailUrl')"></span>
                        </div>
                    </div>

                    <div class="form-field tips">
                        <div class="describe">
                            <span v-text="fastUpload == 1 && (objective === 'delete_user' || objective === 'user') ? this.$t('swarm.uploadFileFour') : this.$t('swarm.uploadFileThree')">
                            </span>
                        </div>
                        <div class="field-group component-margin">
                            <label class="picker">
                                <input type="file" id="openFile" @change="uploadFiles">
                                <span class="pull-right upload-button icon icon-folder">{{'swarm.leadFrom' | t}}</span>
                                {{ fileName }}
                            </label>
                            <p v-if="error" class="icon icon-warn red-text"> {{filePickerError}} </p>
                        </div>
                    </div>
                    <div class="form-field">
                        <button class="btn btn-md btn-theme btn-margin" @click="nextHander">{{'common.next' | t}}
                        </button>
                    </div>
                </div>
                <div class="container" v-if="importState">
                    <div class="form-field" v-if="objective === 'user' ">
                        <span class="label">{{'swarm.userLabel' | t}}</span>
                        <radio source="use" v-model="labelSource">{{'contact.selectLabel' | t}}</radio>
                        <radio source="create" v-model="labelSource">{{'contact.createLabel' | t}}</radio>
                    </div>
                    <!--选择标签-->
                    <div class="form-field" v-if="objective === 'user' ">
                        <template v-if="labelSource === 'use'">
                            <label class="label">{{'contact.selectLabel' | t}}</label>
                            <selector-tree :options="labelGroups" :value="label" :max="20" v-model="checkedlabel"
                                           @checkOptions="pickLabels($event)" :maxlength="200"/>
                        </template>
                        <template v-if="labelSource === 'create'">
                            <div class="create-tag">
                                <label class="label">{{'contact.createLabel' | t}}</label>
                                <tags-input inputType="many" :labels.sync="tags" @create="getTag"
                                            :ifReg="true" :maxTag="20"
                                            @del="deleteCreateTags"
                                            @changeFlag="changeFlag"></tags-input>
                                <div class="labels-to-hidden" @click.stop>
                                    <button class="btn btn-sm" :disabled="$has('customer_contact_is_conceal')" @click="hiddenFlag =! hiddenFlag">
                                        <svg aria-hidden="true" class="icon-setting" v-title:top="$t('contact.makeHidden')">
                                            <use xlink:href="#icon-setting"></use>
                                        </svg>
                                    </button>
                                    <ul class="new-labels-list" v-if="hiddenFlag">
                                        <li>
                                            <span>{{'contact.hiddenTitle' | t}}</span>
                                            <svg aria-hidden="true" class="icon-help" v-title:bottom="$t('contact.hiddenResult')">
                                                <use xlink:href="#icon-help"></use>
                                            </svg>
                                        </li>
                                        <li v-for="label in createCheckedLabel" :key="label.id">
                                            <checkbox :source="label.id" v-model="checkedHiddenLabels" />
                                            &nbsp;{{label.name}}
                                        </li>
                                        <li v-if="this.createCheckedLabel.length === 0">
                                            <span class="no-data">
                                                {{'common.noData' | t}}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div class="form-field">
                        <template>
                            <label class="label">{{'swarm.dataFormat' | t}}</label>
                            <selector
                                    :options="dataFormat"
                                    v-model="selectFormat"
                                    @select="pickFormat"
                                    class="lg"/>
                        </template>
                    </div>
                    <div class="form-field flex">
                        <label class="label">{{'swarm.dataPreview' | t}}</label>
                        <div class="field-group">
                            <p class="disabled-text">{{'swarm.previewTip' | t}}</p>
                            <p>
                                {{'swarm.totalData' | t}}
                                <span class="theme-text">{{ tableGroups.totalRow }}</span>
                                {{'swarm.row' | t}}
                                <span class="theme-text">{{ tableGroups.repeatRow }}</span>
                                {{'swarm.repeat' | t}}
                                <span class="theme-text">{{ tableGroups.totalRow - tableGroups.effectiveRow }}</span>
                                {{'swarm.effictive' | t}}
                                <span class="theme-text">{{ tableGroups.effectiveRow }}</span>
                                {{'swarm.rowData' | t}}
                            </p>
                        </div>
                    </div>
                    <!--table-->
                    <div class="preview-table-container">
                        <table v-show="load">
                            <thead>
                            <tr>
                                <th v-for="(item,index) in tableHeaders"
                                    v-title:top="item ? sendTableHeaders[index] : $t('swarm.noMatch')"
                                    :class="{'no-match': !item}">
                                    <span class="attr-name" v-if="noSelete(item)"> {{ sendTableHeaders[index] }} </span>
                                    <selector v-else
                                              :options="availableAttrs"
                                              :search="true"
                                              class="min-height md"
                                              :value="item"
                                              @input="$set(tableHeaders, index, $event)"
                                              @select="selectHander(index, $event)"
                                    />
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="v in tableGroups.data">
                                <td v-for="attr in v">{{ attr }}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="tac">
                        <button type="button" class="btn btn-md btn-theme" @click="prevHander">
                            {{'common.previous' | t}}
                        </button>
                        <button type="button" class="btn btn-md btn-theme" @click="exhaustHander">
                            {{'swarm.startLeadin' | t}}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <modal :title="$t('swarm.complete')" v-if="globalTip" readonly>
            <h5 class="upload-success">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-success"></use>
                </svg>
                {{'swarm.leading' | t}}
            </h5>
            <p class="upload-text">{{'swarm.wait' | t}}</p>
            <template v-slot:buttons>
                <router-link :to="{name: 'memberList'}" class="btn btn-theme btn-md">
                    {{'contact.backList' | t}}
                </router-link>
                <router-link :to="{name: 'sftpDetails', query: {id: sftpId}}" class="btn btn-theme btn-md">
                    {{'swarm.viewData' | t}}
                </router-link>
            </template>
        </modal>
    </div>
</template>

<script>
    import { ContactApiV1, EtlApiV1, EtlApiV2, WebServAttrApiV1 } from '@/api';
    import format from 'date-fns/format';
    import {logError, trackEvent} from '../../monitor.js';
    import SelectorTree from '../../common/components/selector-tree.vue';
    import {translate as t} from '@/locales';
    import tagsInput from './tags-input.vue';
    import debounce from 'lodash/debounce';

    export default {
        name: 'customer-upload',
        components: {
            SelectorTree,
            tagsInput
        },
        data() {
            return {
                fileName: '',
                fill: 0, // percent number
                file: null,
                filePickerError: '', // 错误提示
                error: false,
                fileKey: '',
                importState: false,
                labelSource: 'use',
                labelGroups: [],     // 标签可选项
                label: [],      // 当前选择的标签
                label_id: '',
                dataFormat: [
                    {id: 'utf8', name: 'utf8'},
                    {id: 'big5', name: 'big5'},
                    {id: 'gb18030', name: 'gb18030'}
                ], // 数据格式
                selectFormat: 'utf8', // 选中的数据格式
                tableHeaders: [], // 表头数据
                sendTableHeaders: [],
                eventAttrList: [], // 用户属性列表
                eventList: [],
                tableGroups: {
                    data: [],
                    totalRow: '',  // 总行数
                    repeatRow: '', // 重复行数
                    effectiveRow: '', // 有效行数
                },
                globalTip: false,
                sftpId: null,
                matchedAttrs: [],   // 匹配成功的属性
                load: true,
                once: true,
                sortType: 1,
                // 上传目的:
                // 新增、更新联系人: user
                // 删除联系人: delete_user
                // 邮件退订联系人: dmd_unsubscribe
                // 短、彩信退订联系人: sms_unsubscribe
                // 全局退订联系人: global_unsubscribe
                uploadChoiceGoal: [],
                objective: '', // 文件上传目的
                tags: [],
                checkedlabel: [],
                //标签中被选中的id数组
                idArray: [],
                createCheckedLabel: [],  //新建的label
                tag: '',
                changeTagFlag: true,//可接受子组件的参数：input的tag值变化时为false，确定输入完成时为true
                listenFlag: false,//确定创建用户->创建标签失败->listenFlag=true；再次创建标签成功后changeTagFlag =true ->走watch(changeTagFlag)

                //上传模式
                uploadMode: '',//上传模式 -- 0:普通上传；1:极速上传
                fastUpload:'',//用户 是否开启极速上上传 0:未开通；1:已开通

                //标签隐藏
                hiddenFlag:false,
                checkedHiddenLabels:[],//新建标签是选中的需要隐藏的标签
            };
        },
        computed: {
            crumbs() { // 面包屑导航
                return [
                    {name: 'home', text: 'Dmartech'},
                    {name: 'memberList', text: t('home.customerPerfile')},
                    {name: 'customerUpload', text: t('swarm.upload')}
                ];
            },
            availableAttrs() {
                return this.eventAttrList.map(attr => {
                    return this.tableHeaders.includes(attr)
                        ? {disabled: true, name: attr, id: attr}
                        : {name: attr, id: attr};
                });
            },

        },
        created() {
            this.fetchLabelGroups();
            this.csvPreviewHander();
            this.getAttrList();
            this.authority();

        },
        mounted(){
            this.fastUpload = ~~this.$store.state.user.fastUpload;
            if (this.fastUpload === 1) {
                this.uploadMode = 1;
            } else {
                this.uploadMode = 0;
            }
            //点击其他地方收起
            window.addEventListener('click', this.eventListener);
        },
        watch: {
            labelSource() {
                if (this.labelSource === 'use') {
                    this.fetchLabelGroups();
                }
            },
            changeTagFlag() {
                if (this.changeTagFlag && this.listenFlag) {
                    this.exhaustHander();
                }
            },
            hiddenFlag() {
                let labelIds = [];
                let type = 3;
                let groupId = null;
                let show = false;
                if (this.createCheckedLabel.length === 0) return;
                labelIds = this.createCheckedLabel.map(label => label.id);
                const allSet = new Set(labelIds);
                const cedSet = new Set(this.checkedHiddenLabels);
                const newArr = [...allSet].filter(item => {
                    return cedSet.has(item);
                });
                if (!this.hiddenFlag) {
                    ContactApiV1.batchHideShow(
                        groupId,
                        newArr,
                        labelIds,
                        show,
                        type);//type=3 是新建标签时特殊处理
                }
            }
        },
        methods: {
            authority() {
                if (!this.$has('customer_list_add_update')) {
                    this.uploadChoiceGoal.push({name: this.$t('swarm.user'), id: 'user'});
                }
                if (!this.$has('customer_list_upload_delete')) {
                    this.uploadChoiceGoal.push({name: this.$t('swarm.deleteUser'), id: 'delete_user'});
                }
                if (!this.$has('customer_list_customer_email')) {
                    this.uploadChoiceGoal.push({name: this.$t('swarm.mailUnsubscribe'), id: 'dmd_unsubscribe'});
                }
                if (!this.$has('customer_list_customer_sms')) {
                    this.uploadChoiceGoal.push({name: this.$t('swarm.smsmmsUnsubscribe'), id: 'sms_unsubscribe'});
                }
                if (!this.$has('customer_list_customer_global')) {
                    this.uploadChoiceGoal.push({name: this.$t('swarm.globalUnsubscribe'), id: 'global_unsubscribe'});
                }
                this.objective = this.uploadChoiceGoal[0].id;
            },

            // 获取标签列表
            fetchLabelGroups() {
                ContactApiV1
                    .getGroups({
                        sortType: this.sortType
                    })
                    .then(res => {
                        this.labelGroups = res.body.data.rootGroup.childs;
                    });
            },
            /**
             * 标签选择器选择标签
             **/
            pickLabels(val) {
                this.checkedlabel = val;
                this.idArray = this.checkedlabel.map(elm => elm.id);
            },
            pickFormat() {
                this.sendTableHeaders = [];
                this.once = true;
                this.load = false;
                this.eventAttrList = [...this.eventList];
                this.csvPreviewHander();
            },
            // 上传数据
            uploadFiles(event) {
                let file = event.target.files[0];
                if (!file) {
                    this.resetUpload();
                    return false;
                }
                if (this.objective) {
                    // 校验文件格式
                    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) {
                        this.filePickerError = this.$t('swarm.selectFiles');
                        this.error = true;
                        this.resetUpload();
                        return;
                    }
                    // 校验文件名字格式
                    if (!/^[$\w-]{1,128}.(csv|xlsx|xls)$/.test(file.name)) {
                        this.error = true;
                        this.filePickerError = this.$t('swarm.fileNameReg');
                        this.resetUpload();
                        return;
                    }

                    // 校验文件大小
                    if (file.size > 1024 * 1024 * 50) {
                        this.error = true;
                        this.filePickerError = this.$t('swarm.fileSize');
                        this.resetUpload();
                        return;
                    }

                    this.fileName = file.name;
                    this.file = file;
                    this.error = false;
                    this.filePickerError = '';
                    this.upload();
                } else {
                    this.$toast(this.$t('swarm.uploadValidation'), 'warn');
                }
            },
            // 取消上传请求
            resetUpload() {
                // if (this.uploadRequest) this.uploadRequest.abort();
                this.fileName = '';
                this.file = null;
                this.fill = 0;
            },
            // 新版导出文件（csv、excel）模板文件
            async downloadSampleFiles(type) {
                try {
                    const aLink = document.createElement('a');
                    // 多个文件下载 文件为zip包。
                    const {body} = await EtlApiV1.exportTemplateFiles(type);
                    // 文件名称
                    const name = `user_${format(new Date(), 'YYYY-MM-DD')}.zip`;

                    // IE doesn't allow using a blob object directly as link href
                    // instead it is necessary to use msSaveOrOpenBlob
                    // https://blog.jayway.com/2017/07/13/open-pdf-downloaded-api-javascript/
                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(body, name);
                        return;
                    }

                    if (this._handle) {
                        window.URL.revokeObjectURL(this._handle);
                    }
                    this._handle = window.URL.createObjectURL(body);
                    this.$once('hook:beforeDestroy', () => {
                        if (this._handle) {
                            window.URL.revokeObjectURL(this._handle);
                        }
                    });

                    // 下载文件名，符合数据中心中 sftp 文件命名规则
                    aLink.download = name;
                    // 触发下载
                    aLink.href = this._handle;

                    const evt = new MouseEvent('click');
                    aLink.dispatchEvent(evt);

                } catch (err) {
                    this.$toast(this.$t('swarm.downloadErr'), 'warn');
                    logError(`[联系人管理-上传文件] <uploader/> downloadSampleCSV 下载${type}模板异常 ${err}`);
                    if (this._handle) {
                        window.URL.revokeObjectURL(this._handle);
                    }
                }
            },
            // 点击确定上传文件
            async upload() {
                this.$loading();
                trackEvent('联系人管理/上传数据');
                try {
                    const result = await EtlApiV2.uploadCSV(this.file);
                    if (result.status === 200) {
                        this.fileKey = result.body.data.fileKey;
                        this.$toast(this.$t('swarm.uploadSuccess'), 'success');
                        this.$loaded();
                        // 获取到上传的文件返回的 fileKey值
                    } else {
                        this.$loaded();
                        logError(`[联系人管理-上传数据] <uploader/> downloadSampleCSV 上传数据文件异常 ${result.statusText},${result.status}`);
                    }
                } catch (err) {
                    this.$toast(this.$t('swarm.uploadFailed'), 'error');
                    this.fileName = '';
                    this.file = null;
                    logError(`[联系人管理-上传上传数据] <uploader/> downloadSampleCSV 上传数据文件异常 ${err}`);
                }
            },

            nextHander() {
                // 只有新增、编辑联系人 删除联系人时进行上传模式的校验
                if (this.objective === 'user' || this.objective === 'delete_user') {
                    if (this.fastUpload === 1 && this.uploadMode === '') {
                        this.$toast(this.$t('swarm.chooseUpload'), 'warn');
                        return;
                    }
                }
                if (this.file === null || !this.fileKey) {
                    this.$toast(this.$t('swarm.uploadFirst'), 'warn');
                    return;
                }
                this.load = false;
                this.importState = true;
                this.csvPreviewHander();
            },

            // 预览CSV
            async csvPreviewHander() {
                // 发送给后端的全部头部数据, 如果第一次上传头部数据为 ''
                let headers = this.sendTableHeaders.length < 1 ? '' : this.sendTableHeaders.join(',');
                try {
                    this.$loading();
                    if (!this.fileKey || !this.selectFormat) return;
                    const {body: {data}} = await EtlApiV2.csvPreview(this.fileKey, this.selectFormat,
                        headers, this.objective);
                    this.tableGroups.data = data.preview.slice(1);
                    this.tableGroups.repeatRow = data.repeatRow;
                    this.tableGroups.totalRow = data.totalRow;
                    this.tableGroups.effectiveRow = data.effectiveRow;
                    // 除了选择下拉列表比较一次更新信息。
                    if (this.once) {
                        this.tableHeaders = data.preview[0];
                        this.sendTableHeaders = [...data.preview[0]];
                        this.diff();
                    }
                    this.$loaded();
                } catch (err) {
                    this.$loaded();
                    logError(`[联系人管理-上传数据-预览数据] <uploader/> csvPreview 预览数据数据异常 ${err}`);
                }
            },

            // 请求用户属性列表
            getAttrList() {
                this.$loading();
                if (this.objective === '' || this.objective === 'user' || this.objective === 'delete_user') {
                    WebServAttrApiV1 //这里的0表示请求的是用户属性
                        .getAttributes({attrType: 0, isFilter: '', isResult: ''})
                        .then((res) => {
                            this.$loaded();
                            this.eventAttrList = res.body.data.attributeList.map(type => type.name);
                            this.eventList = res.body.data.attributeList.map(type => type.name);
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else {
                    WebServAttrApiV1
                        .getOptional({
                            objective: this.objective
                        })
                        .then((res) => {
                            this.$loaded();
                            this.eventAttrList = res.body.data.attributeList.map(type => type.name);
                            this.eventList = res.body.data.attributeList.map(type => type.name);
                        })
                        .catch(() => {
                            this.$loaded();
                        });

                }

            },

            changeUploadChoiceGoal(e) {
                this.objective = e.id;

                if ( this.fastUpload === 0) {
                    this.getAttrList();
                    return ;
                }
                if (this.objective === 'dmd_unsubscribe' || this.objective === 'sms_unsubscribe' || this.objective === 'global_unsubscribe') {
                    this.uploadMode = 0;
                } else {// 新增编辑/删除
                    if (this.uploadMode === 0) {
                        this.uploadMode = 1;
                    }
                }
                this.getAttrList();
            },
            prevHander() {
                this.importState = false;
                this.label = [];
                this.label_id = '';
                this.idArray = [];
                this.labelSource = 'use';
                this.selectFormat = 'utf8';
                this.once = true;
                this.sendTableHeaders = [];
                this.eventAttrList = [...this.eventList];
                this.tags = [];
                this.createCheckedLabel = [];
                this.checkedlabel = [];
            },

            // 接收子组件的flag
            changeFlag(flag, listen) {
                if (typeof listen === 'boolean') this.listenFlag = listen;
                this.changeTagFlag = flag;
            },
            // 开始导入
            exhaustHander() {
                //新增和编辑联系人
                if (this.objective === 'user') {
                    let labelSource = this.labelSource;
                    if (labelSource === 'use') {
                        if (!this.idArray.length) {
                            return this.$toast(this.$t('contact.labelTip'), 'warn');
                        }
                        this.label_id = this.idArray.join(',');
                        // 必须全部匹配之后才可以正常导入。
                        // 如果 eventAttrList为 []数组, 说明全部匹配成功, 直接导入就可以了。
                        // 如果eventAttrList 不为 []数组, 说明有没有匹配成功的, 通过 every排查是否全部选择就可以了
                        let len = this.eventAttrList.length;
                        if (len && !this.tableHeaders.every(attr => attr)) {
                            this.$toast(this.$t('swarm.notMatch'), 'warn');
                            return;
                        }
                        this.StartImport();
                    } else if (labelSource === 'create') {
                        let len = this.eventAttrList.length;
                        if (len && !this.tableHeaders.every(attr => attr)) {
                            this.$toast(this.$t('swarm.notMatch'), 'warn');
                            return;
                        }
                        if (this.createCheckedLabel.length === 0) {
                            this.$toast(this.$t('contact.labelTip'), 'warn');
                        } else {
                            if (this.changeTagFlag) {
                                this.label_id = this.createCheckedLabel.map(tags => tags.id)
                                    .join(',');
                                // 创建用户
                                this.StartImport();
                            } else {
                                this.listenFlag = true;
                            }
                        }

                    }
                } else {
                    //删除联系人 退订
                    this.StartImport();
                }

            },
            // 开始导入数据
            StartImport() {
                trackEvent('联系人管理-上传数据-拆解数据');
                this.$loading();
                const headers = this.sendTableHeaders;
                EtlApiV2
                    .csvExhaust(
                        this.selectFormat,
                        this.fileKey,
                        headers,
                        this.label_id,
                        this.objective,
                        this.uploadMode
                    )
                    .then((res) => {
                        if (res.body.code === 200) {
                            this.getSftpDefault();
                        }
                    })
                    .catch(err => {
                        // delete the label just created
                        //ContactApiV1.deleteLabel(this.label_id);
                        this.$loaded();
                        logError(`[联系人管理-上传数据-导入数据] <customer-upload/> exhaustHander 导入数据失败,${err.body.code}`);
                    });
            },


            async getSftpDefault() {
                try {
                    const sftp = await EtlApiV1.getDefaultSFTP();
                    this.sftpId = sftp.body.data.detail.id;
                    this.$loaded();
                    this.globalTip = true;
                } catch (err) {
                    this.$loaded();
                    logError(`[联系人管理-上传数据-默认SFTP数据源] <customer-upload/> exhaustHander SFTP 默认SFTP数据源,${err}`);
                }
            },
            // 找到用户属性和上传的CSV表头不同的项, 以用户属性为参考标准
            diff() {
                for (let i = 0; i < this.tableHeaders.length; i++) {
                    const attrFromCsv = this.tableHeaders[i];
                    const index = this.eventAttrList.findIndex(attr => attr === attrFromCsv);
                    if (index !== -1) {
                        this.matchedAttrs.push(attrFromCsv);
                        this.eventAttrList.splice(index, 1);
                    } else {
                        this.tableHeaders[i] = '';
                    }
                }
                this.load = true;
            },
            noSelete(item) {
                return !this.eventAttrList.length || item && !this.eventAttrList.includes(item);
            },
            selectHander(index, event) {
                this.once = false;
                this.$set(this.sendTableHeaders, index, event.name);
                this.csvPreviewHander();
            },
            //获取子组件传过来的tag  防抖
            getTag:debounce(function(tag){
                this.tag = tag;
                setTimeout(() => {
                    this.selectTags();
                }, 60);
            },300),
            // 新建标签
            selectTags() {
                let tag = this.tag.toString();
                ContactApiV1
                    .createLabel({
                        groupId: 1,
                        name: tag.toString()
                    })
                    .then(res => {
                        this.createCheckedLabel.push({name: tag.toString(), id: res.body.data.id});
                        setTimeout(() => {
                            this.changeTagFlag = true;
                        });
                    })
                    .catch(() => {
                        this.tags.splice(-1, 1);
                        this.listenFlag = false;
                        this.changeTagFlag = true;
                    });
            },
            // 删除新建tag
            deleteCreateTags(cur) {
                this.createCheckedLabel.splice(cur, 1);
            },
            //通用方法 下拉菜单的收起
            eventListener() {
                this.hiddenFlag = false;
            }
        },
        destroyed() {
            window.removeEventListener('click', this.eventListener);
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    .customer-upload {
        .container {
            padding: $input-field-height 0;
            .create-tag{
                position: relative;
                display: flex;
                .icon-setting {
                    width: 16px;
                    height: 16px;
                    fill: $color-content;
                }
                .new-labels-list{
                    position: absolute;
                    top: 30px;
                    left: 450px;
                    border: 1px solid $form-border;
                    padding: 10px;
                    background-color: white;
                    height: 200px;
                    overflow-y: scroll;
                    z-index: 10;
                    .icon-help{
                        width: 12px;
                        height: 12px;
                        vertical-align: middle;
                    }
                    .no-data{
                        color: $disabled;
                        font-style: italic;
                        height: 28px;
                        line-height: 28px;
                        padding-left: 16px
                    }
                }

            }
        }

        .picker {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            min-width: 448px;
            padding-left: 16px;
            border-radius: 4px;
            line-height: $input-field-height - 2px;
            border: solid 1px $border-color;
            overflow: hidden;

            [type="file"] {
                display: none;
            }

            .upload-button {
                height: 100%;
                padding: 0 2em;
                cursor: pointer;
                background-color: rgb(240, 240, 240);
                border-left: 1px solid $border-color;
            }

            &:hover {
                border-color: $light-theme;

                .upload-button {
                    border-left-color: $light-theme;
                }
            }
        }

        .csv-sample-link-icon {
            display: block;
            margin: auto;
            max-width: 80px;
            height: auto;
        }

        .csv-sample-link-button {
            display: block;
            margin: 0 auto;
            border: none;
            background-color: transparent;
            color: $theme;
            cursor: pointer;

            &:hover {
                color: $light-theme;
                text-decoration: underline;
            }

            &:active {
                color: $dark-theme;
            }
        }

        .tips {
            flex: 1;
            padding-left: 16px;
            line-height: 20px;

            .indent {
                text-indent: 1.6em;
            }

            .levelIndent {
                text-indent: 2.4em;
            }

            .describe {
                display: table;
                margin-bottom: 8px;

                span {
                    font-size: 13px;
                    display: table-cell;
                }
            }

            .component-margin {
                margin-left: 1.6em;
            }
        }

        .preview-table-container {
            margin-top: 1em;
            margin-bottom: 30px;
            overflow: auto;
            min-height: 200px;
            border: solid 1px $border-color;

            table {
                border-collapse: collapse;
                border-spacing: 0;
                min-width: 100%;
                line-height: $input-field-height;
                white-space: nowrap;

                thead {
                    background-color: $title-bg;
                }

                th {
                    width: 80px;
                    border-bottom: 1px solid $border-color;
                    cursor: pointer;

                    &.no-match {
                        padding: 0 4px;
                        color: $disabled;
                    }

                    + th {
                        border-left: 1px solid $border-color;
                    }

                    .attr-name {
                        display: inline-block;
                        width: 70px;
                        vertical-align: middle;
                        overflow: hidden;
                        -ms-text-overflow: ellipsis;
                        text-overflow: ellipsis;
                    }
                }

                tbody {
                    min-height: 300px;
                }

                td {
                    text-align: center;
                    border-bottom: 1px solid $border-color;

                    + td {
                        border-left: 1px solid $border-color;
                    }
                }
            }
        }

        .upload-success {
            text-align: center;
            line-height: 24px;

            svg {
                display: inline-block;
                vertical-align: top;
                fill: $theme;
                width: 24px;
                height: 24px;
                margin-right: 8px;
            }
        }

        .upload-text {
            color: $color-light-content;
            margin-top: 1em;
        }

        .btn-margin {
            margin-left: 2.6em;
        }
    }
    .tip{
        .detail-url{
            color: $green;
        }
    }
</style>
