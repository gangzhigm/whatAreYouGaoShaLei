<template>
    <modal :title="$t('form.editData')" class="clue-data" @close="close" size="lg"
           :style="{'--justify': !!formInfo.customerId ? 'space-between' : 'flex-end'}">
        <!--自定义展示字段-->
        <div class="form-edit-customize">
            <div class="shuttle-wrapper" v-blur="closeShuttle">
                <div class="dropdown-trigger" :class="{active: shuttleFlag}" @click="shuttleFlag = !shuttleFlag">
                    <span class="icon icon-menu"></span>
                    {{'contact.customColumn' | t}}
                    <span class="action-icon icon icon-arrow-down"></span>
                </div>
                <transition name="drop">
                    <div class="shuttle-content" v-show="shuttleFlag">
                        <shuttle-box v-show="shuttleFlag" v-bind="shuttleInfo" v-model="selectedIds"/>
                    </div>
                </transition>
            </div>
            <button class="btn color" v-if="companyType!== 2" @click="formSelectFiled">{{'form.listSettings' | t}}</button>
        </div>

        <!-- 表单字段编辑、展示 -->
        <div v-if="!loading" class="filed-content">
            <div class="form-field flex" v-for="(form,index) in formFieldJson" :key="form.id" v-if="form.check">
                <!--基础字段-->
                <template v-if="form.basicTrue">
                    <!-- 询盘Id 仅世邦账号展示-->
                    <div class="form-field" v-if="companyType === 2 && form.questionId === -5">
                        <label class="label">{{form.fieldName}}</label>
                        <span class="questionId" v-text="form.value?form.value:'/'" :style="{'--width': lang === 'en' ? '268px' : '229px'}"></span>
                        <!-- 复制 -->
                        <svg class="svg action-icon icon-copy" v-if="companyType=== 2" @click="copyText" :data-clipboard-text="form.value?form.value:'/'"
                                v-title:top="$t('common.copy')">
                            <use xlink:href="#icon-copy"></use>
                        </svg>
                    </div>
                    <div class="form-field" v-else>
                        <label class="label">{{form.fieldName}}</label>
                        <span v-text="form.value?form.value:'/'"></span>
                    </div>
                </template>
                <!-- 类型对应各自组件 -->
                <div class="components" v-else>
                    <label class="label">
                        <span class="necessary" v-if="form.requiredKey">*</span>
                        <span class="additional-required" v-if="form.additionalRequiredCheck && companyType === 2">*</span>
                        {{form.label}}
                    </label>
                    <!-- 单选、多选有多个选项，展示多个组件 -->
                    <div class="check-component"  v-if="form.list && chooseComponent.includes(whatComponents(form.type))"
                         :style="{'--width': lang === 'en' ? '268px' : '229px'}">
                        <div v-for="(item,index) in form.list" :key="index">
                            <component :key="item.id" :is="whatComponents(form.type)" :source="item.id"
                                    @input="checkChange(form)" v-model="form.value" :class="{'include-other': item.isOther}">
                                {{item.dataName ? item.dataName : item.name ? item.name : ''}}
                            </component>
                            <input v-if="item.isOther" type="text" class="input other-input" v-model.trim="form.otherValue">
                        </div>
                        <!-- 复制 -->
                        <svg  class="svg action-icon icon-copy " v-if="companyType=== 2" @click="copyText(form)" :data-clipboard-text="clipboardText(form)"
                                v-title:top="$t('common.copy')">
                            <use xlink:href="#icon-copy"></use>
                        </svg>
                        <!-- 样式调整， 不要单独抽出 -->
                        <!-- 主键 -->
                        <span v-if="form.isPk">{{'contact.mainKey' | t}}</span>
                        <!-- 同步 -->
                        <span v-if="form.sync">{{'form.sync' | t}}</span>
                    </div>
                    <!-- 指向原生标签， 双向绑定需要重写 -->
                    <template v-else>
                        <!-- mobile字段收集国际号码 暂定-->
                        <component :is="whatComponents(form.type)"
                                   :class="bindClass(form)"
                                   :minlength="form.minLength ? form.minLength : ''" :maxLength="form.maxLength ? form.maxLength : ''"
                                   :options="form.list" :placeholder="form.desc" @input="input(form, $event)"
                                   :start="form.startDate ? form.startDate : ''" :end="form.endDate ? form.endDate : ''"
                                   :value.prop="form.value" @select="selectorComponent(form, $event)"
                                   :style="{'--width': lang === 'en' ? '268px' : '229px'}"
                                   :settings="getSettings(form)"
                                   :address="form.type === 'addressShow' && addressList"
                                   :country="form.type === 'country' && countryList"
                                   :domId="form.type === 'country' && form.domId"
                                   :templateAddressValue="getAddressTemplate(form)" @updateTemplate="updateTemplate(form, $event)"
                                   :secondShow="form.type === 'dateTime'"
                                   v-model="form.value" search></component>
                        <svg class="svg action-icon icon-search" v-if="companyType=== 2 && whatComponents(form.type)==='textarea'" @click="textareaModelClick(form,index)">
                                <use xlink:href="#icon-search"></use>
                            </svg>
                        <!-- 复制 -->
                        <svg  class="svg action-icon icon-copy" v-if="companyType=== 2" @click="copyText(form)" :data-clipboard-text="clipboardText(form)"
                                v-title:top="$t('common.copy')">
                            <use xlink:href="#icon-copy"></use>
                        </svg>
                        <!-- 主键 -->
                        <span class="main-key" v-if="form.isPk">{{'contact.mainKey' | t}}</span>
                        <!-- 同步 -->
                        <span class="match" v-if="form.sync">{{'form.sync' | t}}</span>
                    </template>
                    <p class="error" v-if="errorMessage(form) !== '' && showError" style="margin-left:130px;">{{errorMessage(form)}}</p>
                    <p class="error" v-if="errorMessageAdditionalFields(form) !== '' && additionalShowError" style="margin-left:130px;">
                        {{errorMessageAdditionalFields(form)}}</p>
                </div>
            </div>
            <inline-loading :offset="'sm'" v-if="filedLoading"/>
        </div>
        <inline-loading v-else/>
        <!-- 底部Button -->
        <template v-slot:buttons>
            <router-link target="_blank" class="theme" v-if="!!formInfo.customerId"
                         :to="{name: 'customerDetail', query: {id: formInfo.customerId}}">
                {{'form.checkCustomerDetail' | t}}
            </router-link>
            <div class="btn-area">
                <button class="btn btn-md btn-white"  @click="close">{{'common.cancel' | t}}</button>
                <button class="btn btn-md btn-theme" :disabled="saving" @click="save">{{'common.save' | t}}</button>
                <button v-if="isSaveAndSync(formInfo)" :disabled="saving" class="btn btn-md btn-theme"
                        @click="save('sync')">{{'form.saveAndSync' | t}}</button>
            </div>
        </template>
        <modal :title="textareaModel.title" class="clue-data textarea-modal" v-if="textareaModelShow" @close="textareaClose" size="lg"
           :style="{'--justify': !!formInfo.customerId ? 'space-between' : 'flex-end'}">
           <textarea minlength maxlength class="textarea w-lg textareaModel" v-model.trim="textareaModel.content"></textarea>
            <!-- 底部Button -->
            <template v-slot:buttons>
                <div class="btn-area">
                    <button class="btn btn-md btn-white"  @click="textareaClose">{{'common.cancel' | t}}</button>
                    <button class="btn btn-md btn-theme" :disabled="saving" @click="textareaSave">{{'common.save' | t}}</button>
                </div>
            </template>
        </modal>
    </modal>
</template>

<script>
    import LinkageSelector from './linkage-selector.vue';
    import Calendar from '../../../common/components/date-time/calendar.vue';
    import {allCountriesEN} from '@/common/components/vue-input-tel/vue-tel-input-data-en';
    import {EMAIL_ADDRESS_REGEXP, PHONE_REGEXP} from '@/common/utils/regs';
    import {I18N_STORE_NAME} from '@/locales';
    import Country from '../common/country.vue';
    import FormAddress from '../common/address.vue';
    import Clipboard from 'clipboard';
    import cloneDeep from 'lodash/cloneDeep';
    import { ManageApi, QuestionnaireApiV1, QuestionnaireApiWebApi } from '@/api';
    import { mapState } from 'vuex';
    const chatOperator = 'chat_operator';
    export default {
        props: {
            formInfo: {
                type: Object
            },
            formJson: {
                type: Array
            },
            paperId: {
                type: [String, Number]
            },
            answersList: {
                type: Array,
                require: true
            },
            answerItem: {
                type: Object,
            },
            selectedFields: {//form表单选中的展示字段list
                type: Array,
            }
        },
        name: 'clue-data',
        components: {
            LinkageSelector,
            Calendar,
            Country,
            FormAddress
        },
        computed: {
            ...mapState({
                companyType: state => state.user.companyType,
                lang: state => state[I18N_STORE_NAME].lang
            }),
            dialCode() {
                const codes = [...new Set(allCountriesEN.map(item => item[2]))];
                return codes.map(code => {return {name: '+' + code, id: ~~code}});
            },
            shuttleInfo() {
                return {
                    titles: [this.$t('form.formField'), this.$t('form.displayField')],
                    dataList: this.allFieldArr,
                    selectedVal: this.selectedIds,
                    fromPage: 'setting',
                    search: true,
                    draggable: true,
                };
            }
        },
        data() {
            return {
                // 可展示表单字段全部类型
                allFiledType: [
                    {name: 'singleLineText', components: 'input'},
                    {name: 'email', components: 'input'},
                    {name: 'mobile', components: 'input'},
                    {name: 'birthday', components: 'calendar'},
                    {name: 'multiLineText', components: 'textarea'},
                    {name: 'singleChoice', components: 'radio'},
                    {name: 'multiChoice', components: 'checkbox'},
                    {name: 'times', components: 'hour-minute-select'},
                    {name: 'date', components: 'calendar'},
                    {name: 'singleSelect', components: 'selector'},
                    {name: 'multiLevelDropList', components: 'linkage-selector'},
                    {name: 'description', components: 'span'},
                    {name: 'subscription', components: 'radio'},
                    {name: 'country', components: 'country'},
                    {name: 'addressShow', components: 'form-address'},
                    {name: 'dateTime', components: 'date-time'}
                ],
                // 表单字段列表
                formFieldJson: [],
                // 是否展示错误信息
                showError: false,
                additionalShowError:false,
                saving: false,
                // 单选、多选类型
                chooseComponent: ['radio', 'checkbox'],
                // 订阅选项
                subscribeArray: [
                    {id: 1, name: '是'},
                    {id: 2, name: '否'}
                ],
                // 组件值为number的字段
                idsValueFiled: ['singleChoice', 'multiChoice', 'singleSelect', 'multiLevelDropList', 'subscription'],
                //自定义展示
                shuttleFlag: false,//传索框显隐
                selectedIds: '',//右侧 已选择列 id
                rightSelectedAttrs: [],  // 右边，已选择列 数据
                allFieldArr: [],//所有字段列表
                basicInfoList: [],//表单基础信息
                filedLoading: true,
                // 省市区地址
                addressList: [],
                // 地址接口响应时间过长，加一个过渡
                loading: false,
                countryList: [],
                templateAddressValue: [],
                textareaIndex: '',
                textareaModel: {
                    title: '',
                    content: ','
                },
                textareaModelShow: false,
                //api出过来的信息员信息
                informationOffice: {},
                saveEditComplete: false,//保存字段的接口是否完成
            };
        },
        mounted() {
            // 已选的列数据 Array
            this.allFieldArr = this.answersList.filter(item => item.questionId !== null && item.questionId !== -8);

            const checkList = this.formJson.filter(q => q.check);
            this.getInformationOfficerAndList(() => {
                if (!checkList.length) this.changeFormFieldJson();
            });
            
            this.selectedIds = checkList.filter(e=>{ 
                return e.questionId !== null && e.questionId !== '' && e.questionId !== undefined;
            }).map(item => item.questionId)
                .join(',');

            this.templateAddressValue = this.formInfo.templateAddressValue;
        },
        watch: {
            selectedIds() {
                if (this.saveEditComplete) return;
                this.saveEditComplete = true;
                let strArr  = this.selectedIds.split(',');
                strArr = strArr.filter(item => item).map((item) => {
                    return Number(item);
                });
                QuestionnaireApiV1
                    .saveEditAnswer(Number(this.paperId), strArr)
                    .then(() => {
                        this.$emit('showFormEditor', this.answerItem);
                        this.filedLoading = false;
                        this.saveEditComplete = false;
                    });
            },
            formJson() {
                this.changeFormFieldJson();
            }
        },
        methods: {
            //  是否显示保存联系人按钮
            isSaveAndSync(formInfo){
                //世邦用户
                let show = false;
                if (this.companyType === 2) {
                    const index = this.formFieldJson.findIndex(e=> {
                        return e.isPk === 1;  
                    });
                    show = index !== -1;
                } else {
                    show = !!formInfo.customerId;
                }
                return show;
            },
            //获取信息员名称和列表
            getInformationOfficerAndList(callback) {
                const index = this.formJson.findIndex((e) => {
                    return e.domId === chatOperator;
                });
                if (index !== -1 && this.companyType === 2) {
                    ManageApi.getUserNameList()
                        .then((res) => {
                            const name = res.body.data.userName;
                            this.informationOffice = {
                                name: name,
                                dataName: name,
                                id: 0 // 信息员列表中的id 是从1开始
                            };
                            callback();
                        });
                } else {
                    callback();
                }
            },
            //信息员相关的逻辑（仅世邦用户）
            informationOfficerRender() {
                const index = this.formJson.findIndex((e) => {
                    return e.domId === chatOperator;
                });
                if (index === -1) return;
                const name = this.informationOffice.name;
                let value = this.formFieldJson[index].value;
                if (name && value.length === 0) {
                    this.formFieldJson[index].value = this.informationOffice.id;
                }
            },
            textareaClose(){
                this.textareaModelShow = false;
            },
            textareaSave(){
                this.formFieldJson[this.textareaIndex].value = this.textareaModel.content;
                this.textareaModelShow = false;
            },
            textareaModelClick(form,index){
                this.textareaModelShow = true;
                this.textareaIndex = index;
                this.textareaModel.title = form.label;
                this.textareaModel.content = form.value;
            },
            //复制文字
            copyText(form) {
                if (form.questionId && (form.value === '' || (form.type === 'multiLevelDropList' && !form.value[0]) ||
                     form.value.length === 0)) {
                    return this.$toast(this.$t('common.nothingToCopy'), 'warn');
                } 
                let _this = this;
                let clipboard = new Clipboard('.icon-copy'); // 这里括号里填写上面点击事件绑定的class名
                clipboard.on('success', () => {
                    // 复制成功，提示根据自己项目实际使用的UI来写
                    _this.$toast(this.$t('common.copySuccess'), 'success');
                    // 释放内存
                    clipboard.destroy();
                });
                clipboard.on('error', () => {
                    // 不支持复制，提示根据自己项目实际使用的UI来写
                    _this.$toast(this.$t('common.copyError'), 'warn');
                    // 释放内存
                    clipboard.destroy();
                });
            },
            clipboardText(form){
                let val = '';
                switch (form.type) {
                    case 'singleSelect':
                        if ((form.value instanceof Array) &&  form.value.length > 0) {
                            const select1 = form.list.filter(item=>{ return form.value[0] === item.id });
                            val += select1[0].name;
                        } else if (!(form.value instanceof Array) && form.value) {
                            const select1 = form.list.filter(item=>{ return form.value === item.id });
                            val += select1[0].name;
                        }
                        break;
                    case 'multiChoice':
                        if (!form.value) {
                            val = '';
                            form.value = [];
                            return;
                        }
                        form.value.forEach(e=>{
                            val += form.list.filter(item=>{ return e === item.id })[0].name + ' ';
                        });
                        val = val.substring(0,val.length - 1);
                        break;
                    case 'multiLevelDropList':
                        if (form.value.length > 0 && form.value[0]) {
                            const select1 = form.multiOrderData.filter(item=>{ return form.value[0] === item.id });
                            val += select1[0].name;
                            if (form.value.length === 2) {
                                val += ' ' + select1[0].dataList.filter(i=>{return form.value[1] === i.id})[0].name;
                            }
                        }
                        break;
                    case 'singleChoice':
                    case 'subscription':
                        val = form.value ? form.list.filter(item=>{ return form.value === item.id })[0].name :  '';
                        break;
                    default:
                        val = form.value;
                        break;
                }
                val = val.constructor === String ? val.trim() : val;
                return val;
            },
            //匹配列表页选中的展示字段 载入列表展示设置
            formSelectFiled() {
                this.filedLoading = true;
                let arr = [];
                for (let i = 0; i < this.selectedFields.length; i++) {
                    for (let j = 0; j < this.answersList.length; j++) {
                        if (this.selectedFields[i].formContent === this.answersList[j].field) {
                            arr.push(this.answersList[j].questionId);
                        }
                    }
                }
                this.selectedIds = arr.map(item => item).join(',');
                this.filedLoading = false;
                this.$toast(this.$t('menu.synSuccess'), 'success');
            },
            //世邦用户 信息员字段特殊处理
            informationOfficerFiledRender(json) {
                json.singleDropListData = [...[this.informationOffice] ,...json.singleDropListData];
            },
            changeFormFieldJson() {
                this.formJson.forEach(json => {
                    if (json.type === 'times' && json.value !== '') {
                        let dateArray = json.value.split(',');
                        for (let i = 0; i < dateArray.length; i++) {
                            dateArray[i] = ~~dateArray[i] >= 10 ? dateArray[i] : '0' + dateArray[i];
                        }
                        json.value = dateArray.toString();
                    }
                    if (this.companyType === 2 && json.domId === chatOperator) {
                        this.informationOfficerFiledRender(json);
                    }
                    // 单选、多选、下拉框等列表数据字段统一为list字段
                    const keys = ['singleOrderData', 'singleDropListData', 'multiOrderData'];
                    keys.forEach(key => {
                        if (toString.call(json[key]).indexOf('Array') > -1) {
                            json[key].forEach(item => {
                                if (!Object.keys(item).includes('name')) {
                                    item.name = item.dataName;
                                }
                            });

                            json.list = json[key];
                            // 向下拉框及多级下拉框添加空值
                            if (json.type === 'singleSelect') {
                                json.list = [
                                    {dataName : `\xa0\xa0\xa0\xa0`, id : '', name:`\xa0\xa0\xa0\xa0`, showType : ''},
                                    ...json.list
                                ];
                            }

                            if (json.type === 'multiLevelDropList') {
                                json.list = [
                                    {dataIndex : '', dataList:[] , id : '', name:`\xa0\xa0\xa0\xa0`},
                                    ...json.list
                                ];
                                json.list.map((item) => {
                                    item.dataList = [
                                        {dataIndex : '', id: '', name: `\xa0\xa0\xa0\xa0`},
                                        ...item.dataList
                                    ];
                                });
                            }

                            // 表单提交的值为普通文本， 这里要转换成对应Id， name重复的， 使用第一个Id
                            let values = json.type !== 'singleChoice' ? json.value.split(',') : json.value;
                            if (json.type !== 'singleChoice' && json.value === '') {
                                json.value = [];
                                return;
                            }
                            if (!values.length) {
                                json.value = values;
                                return;
                            }
                            if (json.type === 'multiLevelDropList') {
                                let levelOne = this.strTransformNum(json.list, values[0]);
                                let levelTwo = '';
                                if (levelOne) {
                                    let levelOneList = json.list.find(elm => elm.id === levelOne).dataList;
                                    levelTwo = this.strTransformNum(levelOneList, values[1]);
                                }

                                json.value = levelOne ? [levelOne, levelTwo] : [];
                            } else {
                                // 当包含其它选项(多选、单选)时，值无法直接转换选项Id
                                const filed = this.strTransformNum(json.list, values);
                                const arrJ = filed !== '' && typeof filed !== 'number' && filed.length < values.length;
                                const isOther  = json.list.find(elm => elm.isOther);
                                const allName = json.list.map(elm => elm.name);
                                const filterOtherValue = arrJ && values.filter(elm => !allName.includes(elm))[0];
                                const selectedOther = isOther && [].concat(values).includes(isOther.name);
                                if (values && (filed === '' || arrJ)) {
                                    json.otherValue = isOther ? arrJ ? filterOtherValue : values : '';
                                    json.value = isOther ? arrJ ? [...filed.concat([isOther.id])] : isOther.id : '';
                                    return;
                                }
                                // 当 '其他'选项提交的值与选项名称一致，仍需添加otherValue字段
                                if (selectedOther) json.otherValue = isOther.name;
                                json.value = filed;
                            }
                        }
                    });
                    // 订阅添加订阅选项列表，提交数据转换为Id
                    if (json.type === 'subscription') {
                        json.list = this.subscribeArray;
                        json.value = this.strTransformNum(this.subscribeArray, json.value);
                    }
                    // 世邦定制需求，多行输入框替换<br>
                    if (json.type === 'multiLineText' && this.companyType === 2) {
                        if (json.value !== '') {
                            json.value = json.value.replace(/<br>/g, '\n');
                        }
                    }
                    if (json.type === 'multiChoice' && !json.value) {
                        json.value = [];
                    }
                });
                // 地址字段 配置省市区 获取省市区数据
                if (this.formJson.filter(json => json.type === 'addressShow' && json.addressSelector.includes(1)).length > 0) {
                    this.getAddress();
                }

                if (this.formJson.filter(json => json.type === 'country').length > 0) {
                    this.getCountry();
                }
                if (this.companyType === 2) {
                    this.formFieldJsonRender();
                } else {
                    this.formFieldJson = this.formJson;
                }
            },
            //给每个字段添加是否是‘非必填字段’的标止
            formFieldJsonRender () {
                const id = this.$route.query.id;
                let formJsonCopy = cloneDeep(this.formJson);
                QuestionnaireApiV1.getAdditionalRequired(id)
                    .then(({ body: { data: { questionsList } } }) => {
                        this.filedLoading = false;
                        formJsonCopy.forEach((e) => {
                            questionsList.forEach((item) => {
                                if (e.domId === item.field) {
                                    e.additionalRequiredCheck = item.additionalRequiredCheck ? 
                                        item.additionalRequiredCheck : false;
                                }
                            });
                        });
                        this.formFieldJson = formJsonCopy.filter(item => 
                            item.questionId !== null && item.questionId !== -8);
                        this.informationOfficerRender();
                    });
            },
            close() {
                // 清空数据
                this.formFieldJson = [];
                this.saving = false;
                this.allFieldArr = [];
                this.selectedIds = '';
                this.$emit('close');
            },
            whatComponents(filedType) {
                return this.allFiledType.find(filed => filed.name === filedType).components;
            },
            //保存联系人之前的操作,主键字段校验
            primaryKeyFieldCheck() {
                let ischecked = false;
                const index = this.formFieldJson.findIndex(e => {
                    return e.isPk === 1 && e.value !== '';
                });
                if (index === -1) {
                    ischecked = true;
                    this.$toast(this.$t('form.fillPrimaryKeyField'),'warn');
                }
                return ischecked;
            },
            // 保存表单更改
            save(sync) {
                if (this.saving) return;

                const filterValue = this.formFieldJson.filter(form => this.errorMessage(form) !== '');
                if (filterValue.length > 0) {
                    this.showError = true;
                    return ;
                }

                if (!this.additionalShowError){
                    const fltVal = this.formFieldJson.filter(form => this.errorMessageAdditionalFields(form) !== '');
                    if (fltVal.length > 0) {
                        this.additionalShowError = true;
                        return ;
                    }
                }

                if (sync === 'sync' && this.primaryKeyFieldCheck()) return false;
                this.saving = true;

                // 整理传参数据
                let postData = {};
                let filterFormJson = this.formFieldJson.filter(item => !item.basicTrue);//编辑保存表单时去除基础字段
                filterFormJson.forEach(item => {
                    if (item.type === 'times') {
                        let dataArray = item.value.split(':');
                        // 表单提交数据为逗号隔开， 这里说明该项数据未被更改
                        if (dataArray.length === 1) {
                            // 为了回显， 未大于10的数据添加了0前缀， 这里去掉
                            let noChangeArray = item.value.split(',');
                            for (let i = 0; i < noChangeArray.length; i++) {
                                // 00:00 格式改为 0:0
                                noChangeArray[i] = ~~noChangeArray[i];
                            }
                            postData[item.domId] = noChangeArray.toString();
                        } else {
                            // 更新时亦要以逗号隔开
                            for (let i = 0; i < dataArray.length; i++) {
                                // 00:00 格式改为 0:0
                                dataArray[i] = ~~dataArray[i];
                            }
                            postData[item.domId] = dataArray.toString();
                        }
                    } else {
                        // 组件值为Id的提交数据时要转换成name
                        const valueChange = this.idsValueFiled.includes(item.type) && typeof item.value !== 'string';
                        const isOther = item.list && item.list.find(elm => elm.isOther);
                        const selectedOther = isOther && [].concat(item.value).includes(isOther.id);
                        if (valueChange) {
                            let value = this.strTransformNum(item.list, item.value, 'id').toString();
                            if (item.type === 'multiLevelDropList') {
                                let levelOne = item.value[0] && this.strTransformNum(item.list, item.value[0], 'id');
                                let levelOneList = levelOne && item.list.find(elm => elm.id === item.value[0]).dataList;
                                let levelTwo = levelOneList && this.strTransformNum(levelOneList, item.value[1] ? item.value[1] : '', 'id');

                                value = !levelOne && !levelTwo ? '' : !levelTwo ? `${levelOne}` : `${levelOne},${levelTwo}`;
                            }
                            // 当包含其它选项(多选、单选)时，id无法直接转换选项值
                            if (isOther && selectedOther) {
                                postData[item.domId] = typeof item.value === 'number' ? item.otherValue : `${value.split(isOther.name)[0]}${item.otherValue}`;
                            } else {
                                postData[item.domId] = item.strValue ? item.strValue.toString() : value;
                                if (item.value[0] === '' && item.value[1] === '') postData[item.domId] = value;
                                let levelOne = item.value[0] && this.strTransformNum(item.list, item.value[0], 'id');
                                if (item.value[0] !== '' && item.value[1] === '') postData[item.domId] = levelOne;
                            }
                        } else {
                            postData[item.domId] = item.value;
                        }
                    }
                    // 世邦定制需求，多行输入框替换<br>
                    if (item.type === 'multiLineText' && this.companyType === 2) {
                        if (item.value !== '') {
                            postData[item.domId] = item.value.replace(/\n/g, '<br>');
                        }
                    }
                });
                postData._id = this.formInfo._id;
                postData.paperId = ~~this.paperId;
                postData.templateAddressValue = JSON.stringify(this.templateAddressValue);
                if (sync === 'sync') return this.saveAndSync(postData);
                QuestionnaireApiV1
                    .updateFormSubmit(postData)
                    .then(() => {
                        this.close();
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        this.$emit('saved');
                    })
                    .catch(() => {
                        this.saving = false;
                    });
            },
            // 保存表单更改并更新联系人属性
            saveAndSync(postData) {
                QuestionnaireApiV1
                    .asyncAndSave(postData)
                    .then(() => {
                        this.close();
                        this.$toast(this.$t('wechatContent.saveSuccess'), 'success');
                        this.$emit('saved');
                    })
                    .catch(() => {
                        this.saving = false;
                    });
            },
            // 绑定输入内容到字段
            input(form, e) {
                if (e.target) {
                    // textarea类型不trim，与表单编辑器内一致
                    form.value = this.whatComponents(form.type) === 'textarea' ? String(e.target.value) : String(e.target.value).trim();
                } else {
                    form.value = e;
                }
            },
            // 输出错误内容
            errorMessage(form) {
                // 校验数据完整性
                if (form.requiredKey && this.dataEmpty(form)) {
                    return form.errorPrompts ? form.errorPrompts : this.$t('form.dataRequired');
                }
                // 最少字符校验
                if (form.minLength && form.minLength !== '' && form.value.length < form.minLength) {
                    return this.$t('form.minL') + form.minLength;
                }
                // 校验邮箱格式
                if (form.type === 'email' && form.emailVerifyData && !EMAIL_ADDRESS_REGEXP.test(form.value)) {
                    return this.$t('form.errorEmail');
                }
                // 校验手机格式
                if (form.type === 'mobile' && form.value !== '' && !form.internationalKey && !PHONE_REGEXP.test(form.value)) {
                    return this.$t('form.phoneError');
                }
                // 单选、多选选择 '其他'选项， '其他' 选项值不能为空
                if (form.type === 'singleChoice' || form.type === 'multiChoice') {
                    const isOther = form.list.find(elm => elm.isOther);
                    if (!isOther) return '';
                    const selectedOther = [].concat(form.value).includes(isOther.id);
                    if (selectedOther && !form.otherValue) {
                        return this.$t('form.selectedValueEmpty');
                    }
                }

                return '';
            },
            //额外必填字段错误提示
            errorMessageAdditionalFields(form) {
                if (form.additionalRequiredCheck && this.dataEmpty(form)) {
                    return this.$t('form.dataRequired');
                }
                return '';
            },
            // 动态绑定样式class
            bindClass(form) {
                const components = this.whatComponents(form.type);
                return {
                    input: components === 'input',
                    textarea: components === 'textarea',
                    'w-lg': true
                };
            },
            // 校验表单必填项数据是否完善
            dataEmpty(form) {
                const baseBoolean = Object.keys(form).includes('value');
                if (form.type === 'multiLevelDropList') {
                    return baseBoolean && form.value.toString().length < 4;
                } else if (form.type === 'singleSelect') {
                    if ( form.value.length === 0) return true;
                } else if (form.type === 'times') {
                    return baseBoolean && form.value.split(':').filter(time => time === '').length > 0;
                } else if (form.type === 'dateTime') {
                    return form.value.length !== 19;
                } else if (form.type === 'addressShow') {
                    // 无原数据
                    if (!this.templateAddressValue.length) return true;
                    const target = this.templateAddressValue.find(elm => elm.fieldsId === form.domId);
                    // 地址选择器空值
                    const selectorEmpty = form.addressSelector.includes(1) && target.selectValue === '';
                    // 详情输入框空值
                    const detailEmpty = form.addressSelector.includes('default') && target.detail === '';
                    return selectorEmpty || detailEmpty;
                } else {
                    return baseBoolean && form.value.length === 0;
                }
            },
            // name值、Id值互换
            strTransformNum(list, value, key = 'name') {
                if (typeof value !== 'object') {
                    let target = this.getTarget(list, value, key);
                    return target ? key === 'name' ? target.id : target.name : '';
                }
                if (toString.call(value).indexOf('Array') > -1) {
                    let array = [];
                    value.forEach(name => {
                        let target = this.getTarget(list, name, key);
                        if (target) array.push(key === 'name' ? target.id : target.name);
                    });
                    return array;
                }
            },
            // 下拉选项组件存储选中结果的name
            selectorComponent(form, e) {
                // e 的数据结构有数组对象，及Object对象
                form.strValue = toString.call(e).indexOf('Array') > -1 ? e.map(item => item.name) : e.name;
            },
            // 根据条件查找目标
            getTarget(list, value, key) {
                return list.find(item => item[key] === value);
            },
            closeShuttle() {
                this.shuttleFlag = false;
            },
            // 单选、多选选中、取消选择
            checkChange(form) {
                const isOther = form.list.find(elm => elm.isOther);
                if (!isOther) return;
                if (form.type === 'singleChoice') {
                    form.otherValue = '';
                }
                if (form.type === 'multiChoice' && !form.value.includes(isOther.id)) {
                    form.otherValue = '';
                }
            },
            // 获取国家、地址相关设置
            getSettings(form) {
                const types = {'country': 'countrySet', 'addressShow': 'addressSelector'};
                if (form[types[form.type]]) return form[types[form.type]];
            },
            // 获取省市区地址数据
            getAddress() {
                this.loading = true;
                QuestionnaireApiWebApi
                    .getAllArea()
                    .then(({body: {data}}) => {
                        this.loading = false;
                        this.addressList = data.countryListAreaAllDTO[0].children;
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            // 获取国家数据
            getCountry() {
                QuestionnaireApiWebApi
                    .getAllCountry()
                    .then(({body: {data}}) => {
                        this.countryList = data.CountryListWorldDataAll;
                    });
            },
            getAddressTemplate(form) {
                if (form.type === 'addressShow') {
                    let target = this.formInfo.templateAddressValue.find(value => value.fieldsId === form.domId);
                    return target ? target : {detail: '', selectValue: ''};
                }
            },
            // 更新地址原始数据字段
            updateTemplate(form, data) {
                if (form.type === 'addressShow') {
                    let index = this.templateAddressValue.findIndex(value => value.fieldsId === form.domId);
                    data.fieldsId = form.domId;
                    if (index > -1) {
                        this.templateAddressValue.splice(index, 1, data);
                    } else {
                        this.templateAddressValue.push(data);
                    }
                }
            }
        }
    };
</script>

<style type="text/scss" lang="scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .clue-data {
        .textareaModel {
            width: 100%;
            height: 500px;
        }

        .modal-content {
            max-height: 600px;
        }
        .necessary, .error {
            color: $light-red;
        }
        .additional-required {
            color: #0000FF;
        }
        .checkbox {
            margin-right: 16px;
        }
        .theme {
            color: $theme;
        }
        .modal-panel {
            display: flex;
            justify-content: var(--justify);
        }
        .form-edit-customize {
            display: flex;
            margin-bottom: 20px;
            position: relative;
            .dropdown-trigger {
                position: relative;
                padding: 0 8px;
                line-height: $input-field-height - 2px;
                border-radius: 4px;
                border: 1px solid $form-border;
                cursor: pointer;

                .icon-menu {
                    color: $theme;
                    margin-right: 4px;
                }

                &:hover {
                    border-color: $theme;
                }

                &.active {
                    border-color: $theme;
                    @include box-shadow(0 1px 3px rgba($theme, .35));

                    .icon-arrow-down {
                        color: $theme;
                    }
                }
            }
            .shuttle-wrapper {
                .shuttle-content{
                    position: absolute;
                    background-color: #ffffff;
                    padding: 10px;
                    border-radius: 3px;
                    z-index: 1;
                    .shuttle-box {
                        width: 500px;
                        .security-item{
                            padding: 3px 0;
                        }
                    }
                }
            }
            .color {
                color: $theme;
            }
        }
        .filed-content{
            max-height: 400px;
            overflow: auto;
            &::-webkit-scrollbar {
                width: 10px;
            }
            &::-webkit-scrollbar-thumb {
                border-radius: 10px;
                -webkit-box-shadow: inset 0 0 5px #9b9ba3;
            }
            .questionId {
                width: calc(100% - var(--width));
            }

            .svg {
                width: 14px;
                height: 14px;
                margin: 0;
                vertical-align: middle;
            }
        }
        .radio + .radio {
            margin-left: 0;
        }
        .radio {
            margin-right: 16px;
        }
        .components {
            width: 100%;
            .check-component {
                display: inline-flex;
                flex-wrap: wrap;
                width: calc(100% - var(--width) + 20px);
                .action-icon {
                    padding: 9px 10px;
                }
            }
            .w-lg {
                width: calc(100% - var(--width));
                .selector {
                    width: calc(50% - 6px);
                }
            }
            .calendar.w-lg, .textarea.w-lg, .hour-minute-select.w-lg, .linkage-selector.w-lg {
                width: calc(100% - var(--width) + 10px);
            }
            .linkage-selector {
                .selector {
                    width: calc(50% - 2px);
                }
            }
            .selector.w-lg,
            .form-address,
            .form-country {
                width: calc(100% - var(--width) + 20px);
            }
            .textarea {
                min-height: 192px;
            }
            .main-key, .match {
                margin-left: 3px;
            }
            .include-other {
                margin-right: 0;
            }
            .other-input {
                margin-right: 16px;
            }
        }
    }

    .textarea-modal {
        .textareaModel {
            height: 454px;
            max-height: 454px;
        }

        .modal-panel {
            display: flex;
            .btn-area {
                margin-left: auto;
            }
        }
    }
</style>
