<template>
<!--    事件管理-->
    <div class="meta-event">
        <div class="data-item">
            <div class="content-top">
                <button class="pull-right btn btn-md btn-theme" @click="addMetaEvent">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'metaData.add' | t}}
                </button>
                <div class="search-box md">
                    <input type="text" :placeholder="$t('metaData.enterEventName')" v-model.trim="keyWordsTemp" @keydown.enter="handleSearch">
                    <svg aria-hidden="true" @click="handleSearch">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
                <p class="search-title">{{'common.total' | t}} <span>{{filteredOptions.length}}</span> {{'metaData.events' | t}}</p>
            </div>
            <div class="simplify-table">
                <table>
                    <thead>
                    <tr>
                        <td>{{'metaData.eventsName' | t}}</td>
                        <td>{{'metaData.displayName' | t}}</td>
                        <td>{{'metaData.displayNameEn' | t}}</td>
                        <td>{{'metaData.presetStatus' | t}}</td>
                        <td :width="60">{{'tag.operate' | t}}</td>
                        <!--<td>是否显示</td>-->
                    </tr>
                    </thead>
                </table>
                <div class="metadata-table-content">
                    <table>
                        <tbody>
                        <tr v-for="item in options" :key="item.id" @click="editMetaEvent(item.id,item.isPreset)">
                            <td v-if="!isShowCreate">{{item.name}}</td>
                            <td v-else>{{item.name}}</td>
                            <td>{{item.meaning}}</td>
                            <td>{{item.nameEn}}</td>
                            <td>{{item.isPreset?$t('metaData.Preset'):$t('metaData.defined')}}</td>
                            <td :width="60">
                                <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                     @click.stop="editMetaEvent(item.id,item.isPreset)"
                                     v-title:top="$t('dragJourney.edit')">
                                    <use xlink:href="#icon-round-pencil"></use>
                                </svg>
                                <svg aria-hidden="true" class="action-icon icon-delete"
                                     @click.stop="deleteLabelConfirm(item)" v-show='!item.isPreset'
                                     v-title:top="$t('tag.delete')">
                                    <use xlink:href="#icon-round-close"></use>
                                </svg>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <list-empty v-if="filteredOptions.length === 0 && keyWords === ''" :name="$t('metaData.metaevent')"/>
                    <list-search-empty v-if="filteredOptions.length === 0 && keyWords !== ''"/>
                </div>
                <div class="page-box" v-if="filteredOptions.length >= pageList">
                    <pager :now="pageNow" :total="totalPage" @page="pageNow = $event"/>
                </div>
            </div>
        </div>
        <!-- 新增 -->
        <transition name="slide">
            <div class="slide-form" v-if="isShowCreate" v-blur="closeDataOperate" key="eventSlideForm">
                <div class="form-title">
                    <span class="icon-right icon"></span>
                    {{id === '' ? $t('metaData.add') : $t('metaData.edit')}}{{'metaData.event' | t}}
                </div>
                <div class="form-content">
                    <div class="form-field">
                        <label class="label" for="name">{{'metaData.eventsName' | t}}</label>
                        <input type="text" class="input" id="name" maxlength="30" @focus="errorTextName=''"
                               :class="{error: errorTextName}" v-title:top.line.warn="errorTextName"
                               v-model.trim="metaEventDetail.name" :disabled='isPreset'
                               :placeholder="$t('metaData.nameRegEn')"
                               :title="$t('metaData.nameRegEn').replace('<br/> ', '')">
                    </div>
                    <div class="form-field">
                        <label class="label" for="meaning">{{'metaData.displayName' | t}}</label>
                        <input type="text" class="input" id="meaning" maxlength="30"
                               @focus="errorTextMeaning=''"
                               :class="{error: errorTextMeaning}" v-title:top.line.warn="errorTextMeaning"
                               :placeholder="$t('metaData.nameRegCn')" :title="$t('metaData.nameRegCn').replace('<br/> ', '')"
                               v-model.trim="metaEventDetail.meaning" :disabled='isPreset'>
                    </div>
                    <div class="form-field">
                        <label class="label" for="nameEn">{{'metaData.displayNameEn' | t}}</label>
                        <input type="text" class="input" id="nameEn" maxlength="30" @focus="errorTextMeaningEn=''"
                               :class="{error: errorTextMeaningEn}" v-title:top.line.warn="errorTextMeaningEn"
                               :placeholder="$t('metaData.nameRegEn')" :title="$t('metaData.nameRegEn').replace('<br/> ', '')"
                               v-model.trim="metaEventDetail.nameEn" :disabled='isPreset'>
                    </div>
                    <div class="form-field">
                        <label class="label">{{'metaData.label' | t}}</label>
                        <selector-tree :options='groupList'
                                       @checkOptions='checked($event)' v-model='checkedVipItem'>
                        </selector-tree>
                    </div>
                    <!-- 屏蔽 "可见/不可见" 字段 -->
                    <!--
                    <div class="form-field">
                        <label class="label">是否可见</label>
                        <switch-button v-model="metaEventDetail.isShow" v-if='!isPreset'>
                            {{metaEventDetail.isShow?'可见':'不可见'}}
                        </switch-button>
                        <span v-else>
                            {{metaEventDetail.isShow?'可见':'不可见'}}
                        </span>
                    </div>
                    -->
                    <div class="attributes">
                        <p>{{'metaData.presetAttr' | t}}</p>
                        <table>
                            <thead>
                            <tr>
                                <td width="35px">
                                    <checkbox :source="false" v-model="allChecked"
                                              :title="allChecked ?  $t('common.cancelAll') : $t('common.allSelected')"></checkbox>
                                </td>
                                <td>{{'metaData.attrName' | t}}</td>
                                <td>{{lang ? $t('metaData.displayName') : $t('metaData.displayNameEn')}}</td>
                                <!-- <td>{{'metaData.attrType' | t}}</td>
                                <td>{{'metaData.sttrLength' | t}}</td> -->
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="attr in presetAttrList" :key="attr.id" :class="{active:attrs.indexOf(attr.id) !== -1}">
                                <td>
                                    <checkbox :source="attr.id" v-model="attrs" :disabled='noChecked(attr)'
                                              :class='{disableLabel:noChecked(attr)}'></checkbox>
                                </td>
                                <td :title="attr.name">{{attr.name}}</td>
                                <td :title="lang ? attr.meaning : attr.nameEn">{{lang ? attr.meaning : attr.nameEn}}</td>
                                <!-- <td>
                                    {{attr.attrGenre === 0 ? $t('metaData.string') : attr.attrGenre === 1 ? $t('metaData.integer') : attr.attrGenre
                                    === 2 ? $t('metaData.date') : $t('metaData.decimal')}}
                                </td>
                                <td>{{attr.attrLength}}</td> -->
                            </tr>
                            </tbody>
                        </table>
                        <p class='default-title'>{{'metaData.definedAttr' | t}}</p>
                        <table>
                            <thead>
                            <tr>
                                <td width="35px">
                                    <checkbox :source="false" v-model="allDefaultChecked"
                                              :title="allDefaultChecked ? $t('common.cancelAll') : $t('common.allSelected')"></checkbox>
                                </td>
                                <td>{{'metaData.attrName' | t}}</td>
                                <td>{{lang ? $t('metaData.displayName') : $t('metaData.displayNameEn')}}</td>
                                <!-- <td>{{'metaData.attrType' | t}}</td>
                                <td>{{'metaData.sttrLength' | t}}</td> -->
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="attr in defaultAttrList" :key="attr.id"
                                :class="{active:defaultAttrs.indexOf(attr.id) !== -1}">
                                <td>
                                    <checkbox :source="attr.id" v-model="defaultAttrs"></checkbox>
                                </td>
                                <td :title="attr.name">{{attr.name}}</td>
                                <td :title="lang ? attr.meaning : attr.nameEn">{{lang ? attr.meaning : attr.nameEn}}</td>
                                <!-- <td>
                                    {{attr.attrGenre === 0 ? $t('metaData.string') : attr.attrGenre === 1 ? $t('metaData.integer') : attr.attrGenre
                                    === 2 ? $t('metaData.date') : $t('metaData.decimal')}}
                                </td>
                                <td>{{attr.attrLength}}</td> -->
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="e-save-box">
                    <button type="button" class="btn btn-md btn-theme-border" @click.stop="cancel">{{'common.cancel' | t}}</button>
                    <button type="button" class="btn btn-md btn-theme" @click.stop="saveEvent"
                            :disabled="loading">
                        {{'common.save' | t}}
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import { ContactApiV1, WebServAttrApiV1, WebServEventApiV1 } from '@/api';
    import filterArrayByKeys from '../../../common/utils/filterArrayByKeys';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import Tree from '../../../common/components/selector-tree.vue';
    import {logError, trackEvent} from '@/monitor';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapState } from 'vuex';

    const pageList = 9;
    export default {
        components: {
            'selector-tree': Tree
        },
        data() {
            return {
                pageNow: 1,
                pageList,
                isShowName: false,  //name显隐
                isShowCreate: false,    //新建显隐
                isConfirm: false,   //确定显隐
                loading: false, //加载
                keyWords: '',   //搜索关键字
                metaEventList: [],//元事件列表
                metaEventDetail: {//元事件细节
                    id: '',
                    cid: '',
                    name: '',
                    isShow: true,
                    meaning: '',
                    nameEn: '',
                    labels: [],
                    weight: '',
                    attributes: [{
                        attrGenre: '',
                        attrLength: '',
                        attrType: '',
                        cid: '',
                        id: '',
                        isEmpty: '',
                        meaning: '',
                        nameEn: '',
                        name: ''
                    }]
                },
                presetAttrList: [],//预置属性列表
                attrs: [], // 预置属性id列表
                defaultAttrList: [],// 自定义属性列表
                defaultAttrs: [],// 自定义属性id列表
                id: '',
                errorTextName: '',
                errorTextMeaning: '',   //显示名中文错误描述
                errorTextMeaningEn: '', //显示名英文错误描述
                isPreset: false, //预设配置
                checkedVipItem: [], //选中vip
                groupList: [],  //分组列表
                keyword: [],    //搜索关键字
                idArray: [],
                allLabelList: [],   //all标签列表
                presetCheckedAttr: [],  // 接口返回的已选中的预置属性id列表
                defaultCheckedAttr: [], // 接口返回的已选中的自定义属性id列表
                keyWordsTemp:'' ,   // 临时存储搜索关键字
                sortType:1,
            };
        },
        watch: {
            checkedVipItem(val) {
                this.keyword = [];
                this.idArray = [];
                // 获取被选中的标签名
                for (let i = 0; i < val.length; i++) {
                    this.keyword.push(val[i].name);
                }
                // 获取被选中的标签ID
                for (let i = 0; i < val.length; i++) {
                    this.idArray.push(val[i].id);
                }
            }
        },
        computed: {
            ...mapState({
                user: state => state.user,
                // 语言状态
                lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
            }),
            options() {
                return this.filteredOptions.slice((this.pageNow - 1) * pageList, this.pageNow * pageList);
            },
            // 关键字查找
            filteredOptions() {
                return filterArrayByKeys(this.metaEventList, this.keyWords, 'name', 'meaning', 'nameEn');
            },
            // 控制checkbox全选按钮状态
            allChecked: {
                get() {
                    return this.attrs.length === this.presetAttrList.length && this.presetAttrList.length !== 0; //返回布尔值判断状态是否为选中状态
                },
                set(newval) {
                    if (newval) {
                        this.attrs = this.presetAttrList.map(item => item.id);
                    } else {
                        this.attrs = this.metaEventDetail.attributes
                            .filter(item => item.isPresetEventRela)
                            .map(item => item.id);
                    }
                }
            },
            allDefaultChecked: {
                get() {
                    return this.defaultAttrs.length === this.defaultAttrList.length && this.defaultAttrList.length !== 0; //返回布尔值判断状态是否为选中状态
                },
                set(newval) {
                    if (newval) {
                        this.defaultAttrs = this.defaultAttrList.map(item => item.id);
                    } else {
                        this.defaultAttrs = [];
                    }
                }
            },
            totalPage() {
                let total = Math.ceil(this.filteredOptions.length / this.pageList);
                this.pageNow = this.pageNow > total ? total : this.pageNow;
                return total;
            }
        },

        methods: {
            /**
             * 预置属性默认勾选，不可操作
             * @param attr 列表
             **/
            noChecked(attr){
                let ids = this.metaEventDetail.attributes
                    .filter(item=>item.isPresetEventRela)
                    .map(item=>item.id);
                if (ids.indexOf(attr.id) !== -1){
                    return true;
                }
            },
            editAttr() {
                this.isShowName = true;
            },
            save() {
                this.isShowName = false;
            },
            /**
             * 选中标签
             * @param val 选中的标签
             */
            checked(val) {
                this.checkedVipItem = val;
                this.keyword = [];
                this.idArray = [];
                // 获取被选中的标签名
                for (let i = 0; i < val.length; i++) {
                    this.keyword.push(val[i].name);
                }
                // 获取被选中的标签ID
                for (let i = 0; i < val.length; i++) {
                    this.idArray.push(val[i].id);
                }
            },
            //新增的时候
            addMetaEvent() {
                this.isShowCreate = true;
                this.id = '';
                // 获取标签列表
                this.getVipLabel();
                this.getEventAttrList();
                this.checkedVipItem = [];

                this.isPreset = false;
                this.metaEventDetail = {
                    id: '',
                    cid: this.user.cid,
                    name: '',
                    meaning: '',
                    nameEn: '',
                    labels: [],
                    isShow: true,
                    weight: 1,
                    attributes: []
                };
            },
            /**
             * 编辑的时候
             * @param id
             * @param preset 预设配置
             */
            editMetaEvent(id, preset) {
                this.isShowCreate = true;
                this.checkedVipItem = [];
                this.allLabelList = [];
                this.id = id;
                this.isPreset = preset;
                this.getEventAttrList();
                this.$loading();
                WebServEventApiV1
                    .getMetaEventDetail(id)
                    .then((res) => {
                        this.$loaded();
                        this.metaEventDetail = res.body.data.event;
                        const attrList = this.metaEventDetail.attributes;
                        const attr = attrList.filter(attr => attr.isPreset === true);
                        for (let i = 0; i < attr.length; i++) {
                            this.attrs.push(attr[i].id);
                        }
                        // 被选中的预置属性id列表
                        this.presetCheckedAttr = this.attrs;
                        const attrDefault = attrList.filter(attr => attr.isPreset === null || attr.isPreset === false);
                        this.defaultAttrs = attrDefault.map(item => item.id);
                        // 被选中的自定义属性id列表
                        this.defaultCheckedAttr = this.defaultAttrs;
                        const labelsChecked = this.metaEventDetail.labels ? this.metaEventDetail.labels.split(',') : [];
                        // 获取所有会员标签
                        ContactApiV1
                            .getGroups({
                                sortType: this.sortType
                            })
                            .then((res) => {
                                this.groupList = res.body.data.rootGroup.childs;
                                // 将选中的会员标签回显
                                if (labelsChecked.length > 0) {
                                    if (labelsChecked.length > 0) {
                                        this.groupList.filter(item => {
                                            if (item.labels.length > 0) {
                                                this.allLabelList = this.allLabelList.concat(item.labels);
                                            }
                                            item.childs.filter(label => {
                                                if (label.labels.length > 0) {
                                                    this.allLabelList = this.allLabelList.concat(label.labels);
                                                }
                                                label.childs.filter(name => {
                                                    if (name.labels.length > 0) {
                                                        this.allLabelList = this.allLabelList.concat(name.labels);
                                                    }
                                                });
                                            });
                                        });
                                        this.allLabelList.map(item => {
                                            labelsChecked.map(contact => {
                                                if (item.id === parseInt(contact)) {
                                                    this.checkedVipItem = this.checkedVipItem.concat(item);
                                                }
                                            });
                                        });
                                        if (this.checkedVipItem.length !== labelsChecked.length) {
                                            logError(`[元数据-事件管理]<meta-event.vue> editMetaEvent 不能识别的会员标签ID ${labelsChecked} :387`);
                                        }
                                        this.checkedVipItem.filter(item => {
                                            this.keyword.push(item.name);
                                        });
                                    }
                                }
                            });
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //关闭新增页面时Data的变化
            closeDataOperate() {
                this.isShowCreate = false;
                this.attrs = [];
                this.defaultAttrs = [];
                this.allLabelList = [];
                this.presetCheckedAttr = [];
                this.defaultCheckedAttr = [];
                this.checkedVipItem = [];
                this.errorTextName = '';
                this.errorTextMeaning = '';
                this.errorTextMeaningEn = '';
            },
            /**
             * 删除事件
             * @param item
             */
            deleteLabelConfirm(item) {
                this.$confirm(this.$t('metaData.deleteConfirm'), this.$t('common.delete'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            WebServEventApiV1
                                .deleteMetaEvent(item.id)
                                .then(() => {
                                    this.metaEventList.$deleteByKey(item.id);
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('数据中心-元数据-删除事件管理', {id: item.id});
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });
            },
            //校验
            check() {
                this.errorTextName = '';
                this.errorTextMeaning = '';
                this.errorTextMeaningEn = '';
                let ob = this.metaEventDetail;
                let regName = /^[a-zA-Z][a-zA-Z0-9_]*$/;//允许输入数字、字母、下划线 字母开头
                let regNameCn = /^[\u4E00-\u9FA5A-Za-z].{0,}$/;//匹配是否以中英文字符开头
                if (ob.name === '') {
                    this.errorTextName = this.$t('metaData.eventNoEmpty');
                    return false;
                } else if (!regName.test(ob.name)) {
                    this.errorTextName = this.$t('metaData.nameRegEn');
                    return false;
                } else if (ob.meaning === '') {
                    this.errorTextMeaning = this.$t('metaData.displayNameNoEmpty');
                    return false;
                } else if (!COMMON_NAME_REGEXP.test(ob.meaning)) {
                    this.errorTextMeaning = this.$t('metaData.nameRegCn');
                    return false;
                } else if (/[+\-*/%().:]/.test(ob.meaning) || !regNameCn.test(ob.meaning)) {
                    this.errorTextMeaning = this.$t('metaData.nameRegCn');
                    return false;
                } else if (ob.nameEn === '') {
                    this.errorTextMeaningEn = this.$t('metaData.displayNameNoEmpty');
                    return false;
                } else if (!COMMON_NAME_REGEXP.test(ob.nameEn)) {
                    this.errorTextMeaningEn = this.$t('metaData.nameRegEn');
                    return false;
                } else if (/[+\-*/%().:]/.test(ob.nameEn) || !regName.test(ob.nameEn)) {
                    this.errorTextMeaningEn = this.$t('metaData.nameRegEn');
                    return false;
                }
                return true;
            },
            //保存新增事件
            saveEvent() {
                let ob = this.metaEventDetail;
                const allAttrs = this.attrs.concat(this.defaultAttrs);
                let attributes = allAttrs.map(item => {
                    return {
                        id: item
                    };
                });
                let labels1 = [];
                labels1 = this.idArray.join(',');
                let sendData = {
                    id: ob.id,
                    attributes: attributes,
                    cid: this.user.cid,
                    isShow: ob.isShow,
                    meaning: ob.meaning,
                    nameEn: ob.nameEn,
                    labels: labels1,
                    name: ob.name,
                    weight: ob.weight,
                    timeAttrId: 17
                };

                if (this.check()) {
                    this.loading = true;
                    this.$loading();
                    if (ob.id === '') {
                        WebServEventApiV1
                            .createMetaEvent(sendData)
                            .then(() => {
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                trackEvent('数据中心-元数据-新增事件管理', {name: ob.name});
                                this.loading = false;
                                // 刷新数据后清空数据
                                this.keyWordsTemp = '';
                                this.keyWords = '';
                                this.getMetaEventList();
                                this.closeDataOperate();
                                this.$loaded();
                            })
                            .catch(() => {
                                this.loading = false;
                                this.$loaded();
                            });
                    } else {
                        WebServEventApiV1
                            .editMetaEvent(sendData)
                            .then(() => {
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                trackEvent('数据中心-元数据-修改事件管理', {id: ob.id});
                                this.loading = false;
                                this.getMetaEventList();
                                this.closeDataOperate();
                                this.$loaded();
                            })
                            .catch(() => {
                                this.loading = false;
                                this.$loaded();
                            });
                    }
                }
            },
            //请求元事件列表
            getMetaEventList() {
                this.$loading();
                WebServEventApiV1
                    .getMetaEventList(this.keyWords)
                    .then((res) => {
                        this.metaEventList = res.body.data.eventList;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //自定义属性列表
            getEventAttrList() {
                this.$loading();
                WebServAttrApiV1
                    .getAttributes({attrType: 2, isFilter: '', isResult: ''})
                    .then((res) => {
                        this.presetAttrList = res.body.data.attributeList.filter(item => item.isPreset === true);
                        this.defaultAttrList = res.body.data.attributeList.filter(
                            item => item.isPreset === false || item.isPreset === null);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //取消新增事件
            cancel() {
                this.isShowCreate = false;
                this.metaEventDetail.name = '';
                this.metaEventDetail.meaning = '';
                this.metaEventDetail.nameEn = '';
                this.metaEventDetail.attributes = [];
                this.attrs = [];
                this.defaultAttrs = [];
                this.checkedVipItem = [];
                this.errorTextName = '';
                this.errorTextMeaning = '';
                this.errorTextMeaningEn = '';
            },
            // 获取会员标签
            getVipLabel() {
                this.$loading();
                ContactApiV1
                    .getGroups({
                        sortType: this.sortType
                    })
                    .then((res) => {
                        this.groupList = res.body.data.rootGroup.childs;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // handleSearch
            handleSearch(){
                this.keyWords = this.keyWordsTemp;
                this.pageNow = 1;
            }

        },
        mounted() {
            this.getMetaEventList();
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "../data-item";

    .meta-event {
        .attributes {
            margin-top: 32px;
            p {
                padding: 0 24px;
                font-weight: bold;
            }

            table {
                table-layout: fixed;
                margin-top: 18px;
                width: 100%;
                border-collapse: collapse;
                border-spacing: 0;
                color: $color-light-content;

                thead {
                    background-color: $title-bg;
                    border-bottom: 1px solid $border-color;
                    border-top: 1px solid $border-color;
                    tr:first-child {
                        text-align: center;
                    }
                }
                tbody {
                    tr:hover {
                        background-color: $select-bg;
                    }
                }

                tr {
                    height: $input-field-height;
                    &.active {
                        color: $color-content;
                        .disableLabel {
                            svg {
                                fill: $border-color;
                            }
                        }

                    }
                    td:first-child {
                        text-align: right;
                    }
                }

                td {
                    padding: 0 10px;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    text-align: left;
                    .checkbox {
                        &.disabled {
                            pointer-events: none;
                            color: $disabled;
                        }
                        svg {
                            box-shadow: none;
                        }
                    }
                }
            }
            .default-title {
                margin-top: 18px;
            }
        }
        .disabledColor {
            background-color: #f0f2f5;
        }
        .disableLabel:before {
            color: $border-color;
            box-shadow: none;
            border: none;
        }
    }
</style>
