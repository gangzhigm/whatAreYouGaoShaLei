<template>
<!--    事件分组-->
    <div class="event-group">
        <div class="data-item">
            <div class="content-top">
                <button class="pull-right btn btn-md btn-theme" @click="addEventGroup">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-plus"></use>
                    </svg>
                    {{'metaData.add' | t}}
                </button>
                <!-- 搜索 -->
                <div class="search-box md">
                    <input type="text" :placeholder="$t('metaData.enterGroupName')" v-model.trim="keyWordsTemp" @keydown.enter="handleSearch">
                    <svg aria-hidden="true" @click="handleSearch">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
                <p class="search-title">{{'common.total' | t}} <span>{{filteredOptions.length}}</span> {{'metaData.enentGroups' | t}}</p>
            </div>
            <div class="simplify-table">
                <table>
                    <thead>
                    <tr>
                        <td>{{'metaData.groupName' | t}}</td>
                        <td>{{'metaData.displayName' | t}}</td>
                        <td>{{'metaData.displayNameEn' | t}}</td>
                        <!-- 屏蔽 "可见/不可见" 字段 -->
                        <!--<td>是否可见</td>-->
                        <td>{{'metaData.presetStatus' | t}}</td>
                        <td :width="60">{{'tag.operate' | t}}</td>
                        <!--<td>是否显示</td>-->
                    </tr>
                    </thead>
                </table>
                <div class="metadata-table-content">
                    <table>
                        <tbody>
                        <tr v-for="item in options" :key="item.id" @click="editEventGroup(item.id,item.isPreset)">
                            <td>{{item.name}}</td>
                            <td>{{item.meaning}}</td>
                            <td>{{item.nameEn}}</td>
                            <!-- 屏蔽 "可见/不可见" 字段 -->
                            <!--<td>{{item.isShow?'可见':'不可见'}}</td>-->
                            <td>{{item.isPreset?$t('metaData.Preset'):$t('metaData.defined')}}</td>
                            <td :width="60">
                                <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                     @click.stop="editEventGroup(item.id,item.isPreset)"
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
                    <list-empty v-if="filteredOptions.length === 0 && keyWords === ''" :name="$t('metaData.eventgroup')"/>
                    <list-search-empty v-if="filteredOptions.length === 0 && keyWords !== ''"/>
                </div>
                <div class="page-box" v-if="filteredOptions.length >= pageList">
                    <pager :now="pageNow" :total="totalPage" @page="pageNow = $event"/>
                </div>
            </div>
        </div>
        <!-- 新增 -->
        <transition name="slide">
            <div class="slide-form" v-if="isShowCreate" v-blur="closeDataOperate" key="eventGroupSlideForm">
                <div class="form-title">
                    <span class="icon-right icon"></span>
                    {{id === '' ? $t('metaData.add') : $t('metaData.edit')}}{{'metaData.eventgroup' | t}}
                </div>
                <div class="form-content">
                    <div class="form-field">
                        <label class="label" for="name">{{'metaData.groupName' | t}}</label>
                        <input type="text" class="input" id="name" maxlength="30" @focus="errorTextName=''"
                               :class="{error: errorTextName}" v-title:top.line.warn="errorTextName"
                               v-model.trim="eventGroupDetail.name" :disabled='isPreset'
                               :placeholder="$t('metaData.nameRegEn')"
                               :title="$t('metaData.nameRegEn').replace('<br/> ', '')">
                    </div>
                    <div class="form-field">
                        <label class="label" for="meaning">{{'metaData.displayName' | t}}</label>
                        <input type="text" class="input" id="meaning" maxlength="30" @focus="errorTextMeaning=''"
                               :class="{error: errorTextMeaning}" v-title:top.line.warn="errorTextMeaning"
                               :placeholder="$t('metaData.nameRegCn')" :title="$t('metaData.nameRegCn').replace('<br/> ', '')"
                               v-model.trim="eventGroupDetail.meaning" :disabled='isPreset'>
                    </div>
                    <div class="form-field">
                        <label class="label" for="nameEn">{{'metaData.displayNameEn' | t}}</label>
                        <input type="text" class="input" id="nameEn" maxlength="30" @focus="errorTextMeaningEn=''"
                               :class="{error: errorTextMeaningEn}" v-title:top.line.warn="errorTextMeaningEn"
                               :placeholder="$t('metaData.nameRegEn')" :title="$t('metaData.nameRegEn').replace('<br/> ', '')"
                               v-model.trim="eventGroupDetail.nameEn" :disabled='isPreset'>
                    </div>
                    <div class="form-field">
                        <label class="label">{{'metaData.presetStatus' | t}}</label>
                        <span class="theme-text">{{isPreset ? $t('metaData.Preset') : $t('metaData.defined')}}</span>
                    </div>
                    <!-- 屏蔽 "可见/不可见" 字段
                    <div class="form-field">
                        <label class="label">是否可见</label>
                        <switch-button v-model="eventGroupDetail.isShow" v-show='!isPreset'>
                            {{eventGroupDetail.isShow?'可见':'不可见'}}
                        </switch-button>
                        <span v-show='isPreset'>
                            {{eventGroupDetail.isShow?'可见':'不可见'}}
                        </span>
                    </div>
                    -->
                    <div class="attributes">
                        <p v-if='!isDefaultGroup'>{{isPreset ? $t('metaData.Preset') : $t('metaData.defined')}} {{'metaData.event' | t}}</p>
                        <p v-else>{{'metaData.definedEvent' | t}}</p>
                        <table>
                            <thead>
                            <tr>
                                <td width="35px">
                                    <checkbox :source="false" v-model="allChecked"
                                              :title="allChecked ? $t('common.cancelAll') : $t('common.allSelected')" :disabled='isPreset'></checkbox>
                                </td>
                                <td>{{'metaData.eventName' | t}}</td>
                                <td>{{lang ? $t('metaData.displayName') : $t('metaData.displayNameEn')}}</td>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="attr in EventsList" :key="attr.id" :class="{active:attrs.indexOf(attr.id) !== -1}">
                                <td>
                                    <checkbox :source="attr.id" v-model="attrs" :disabled='isPreset'></checkbox>
                                </td>
                                <td>{{attr.name}}</td>
                                <td>{{lang ? attr.meaning : attr.nameEn}}</td>
                            </tr>
                            <!-- <tr v-for="(attr,index) in canSelectEventList" :class="{active:canSelectattrs.indexOf(attr.id) !== -1}">
                                <td>
                                    <checkbox :source="attr.id" v-model="canSelectattrs"></checkbox>
                                </td>
                                <td>{{attr.name}}</td>
                                <td>{{attr.meaning}}</td>
                            </tr> -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="e-save-box">
                    <button type="button" class="btn btn-md btn-theme-border" @click.stop="cancel">{{'common.cancel' | t}}</button>
                    <button type="button" class="btn btn-md btn-theme" @click.stop="saveGroup"
                            :disabled="loading||isPreset">
                        {{'common.save' | t}}
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import { WebServEventGroupApiV1, WebServEventApiV1 } from '@/api';
    import filterArrayByKeys from '../../../common/utils/filterArrayByKeys';
    import {COMMON_NAME_REGEXP} from '../../../common/utils/regs';
    import {trackEvent} from '../../../monitor';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapState } from 'vuex';

    const pageList = 9;
    export default {
        data() {
            return {
                pageNow: 1, //页码
                pageList,   //pageSize
                isShowName: false,  //名字显隐
                isShowCreate: false,    // 新建显隐
                isConfirm: false,   //确认
                loading: false, //  加载
                deleteObject: {}, //删除对象
                isPreset: false, //是否为预置事件分组
                keyWords: '', //搜索关键字
                eventGroupList: [], //事件分组列表
                eventGroupDetail: { //事件分组细节
                    id: '',
                    cid: '',
                    createdId: '',
                    createdTime: '',
                    name: '',
                    meaning: '',
                    nameEn: '',
                    delFlag: false,
                    isShow: true,
                    isPreset: false,
                    events: [{
                        id: '',
                        cid: '',
                        createdId: '',
                        createdTime: '',
                        delFlag: false,
                        isPreset: false,
                        isPresetGroupRela: false,
                        isShow: false,
                        meaning: '',
                        nameEn: '',
                        name: '',
                        timeAttrId: '',
                        updateId: '',
                        updateTime: '',
                        weight: '',
                    }]
                },
                EventsList: [],//事件列表
                attrs: [], // 预置属性id列表
                // 自定义事件列表
                // definedEventsList: [],
                // definedAttr:[],
                canSelectEventList: [], //是否可选事件分析list
                canSelectattrs: [],
                id: '',
                errorTextName: '', //name错误提示语
                errorTextMeaning: '', //显示名中文错误描述
                errorTextMeaningEn: '', //显示名英文错误描述
                isDefaultGroup: false, //是否默认
                keyWordsTemp:'' // 临时存储搜索关键字
            };
        },
        computed: {
            ...mapState({
                // 语言状态
                lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
            }),
            options() {
                return this.filteredOptions.slice((this.pageNow - 1) * pageList, this.pageNow * pageList);
            },
            // 关键字查找
            filteredOptions() {
                return filterArrayByKeys(this.eventGroupList, this.keyWords, 'name', 'meaning', 'nameEn');
            },
            // 控制自定义事件checkbox全选按钮状态
            allChecked: {
                get() {
                    // return this.canSelectEventList.length===0;//返回布尔值判断状态是否为选中状态
                    return this.attrs.length === this.EventsList.length && this.attrs.length !== 0; //返回布尔值判断状态是否为选中状态
                },
                set(newval) {
                    if (newval) {
                        this.attrs = this.EventsList.map(item => item.id);
                    } else {
                        this.attrs = [];
                        this.canSelectattrs = [];
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
            editAttr() {
                this.isShowName = true;
            },
            save() {
                this.isShowName = false;
            },
            // 展开新增事件分组
            async addEventGroup() {
                this.isShowCreate = true;
                this.id = '';
                this.isPreset = false;
                this.getCanSelectEventList();
                this.eventGroupDetail = {
                    id: '',
                    // cid: this.$store.state.user.cid,
                    name: '',
                    meaning: '',
                    nameEn: '',
                    isShow: true,
                    events: []
                };
            },
            /**
             * 编辑事件分组
             * @param {Number} id
             * @param preset 设置
             **/
            editEventGroup(id, preset) {
                this.isShowCreate = true;
                // todo 展开的时候应该始终在页面的顶部
                //点击了默认分组
                if (id === 0) {
                    this.isPreset = true;
                    this.isDefaultGroup = true;
                    this.getCanSelectEventList(id);
                    this.eventGroupDetail.name = this.$t('metaData.defaultGroup');
                    this.$loading();
                    WebServEventGroupApiV1
                        .getEventGroupDetail(id)
                        .then((res) => {
                            this.eventGroupDetail = res.body.data.eventGroup;
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                } else if (id !== '' && id !== 0) {
                    //编辑分组
                    this.isDefaultGroup = false;
                    this.id = id;
                    this.isPreset = preset;
                    this.$loading();
                    // 获取有关系的事件列表
                    WebServEventGroupApiV1
                        .getEventGroupDetail(id)
                        .then((res) => {
                            this.eventGroupDetail = res.body.data.eventGroup;
                            const attrList = this.eventGroupDetail.events;
                            if (!this.isPreset) {
                                this.EventsList = attrList;
                            } else {
                                this.EventsList = attrList.filter(
                                    attr => attr.isPreset === true && attr.isPresetGroupRela === true
                                );
                            }
                            for (let i = 0; i < this.EventsList.length; i++) {
                                this.attrs.push(this.EventsList[i].id);
                            }
                            // 如果为自定义分组,获取没有被关联的事件列表
                            if (!this.isPreset) {
                                this.getCanSelectEventList();
                            }
                            this.$loaded();
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                }
            },
            //关闭新增页面时Data的变化
            closeDataOperate() {
                this.isShowCreate = false;
                this.EventsList = [];
                this.attrs = [];
                this.canSelectEventList = [];
                this.canSelectattrs = [];
                this.eventGroupDetail.name = '';
                this.eventGroupDetail.meaning = '';
                this.eventGroupDetail.nameEn = '';
                this.eventGroupDetail.events = [];
                this.id = '';
                this.isDefaultGroup = false;
                this.errorTextMeaning = '';
                this.errorTextMeaningEn = '';
                this.errorTextName = '';
            },
            /**
             * 确认删除标签事件
             * @param item
             */
            deleteLabelConfirm(item) {
                this.$confirm(this.$t('metaData.deleteConfirm'), this.$t('common.delete'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            WebServEventGroupApiV1
                                .deleteEventGroup(item.id)
                                .then(() => {
                                    this.eventGroupList.forEach((items, index) => {
                                        if (items.id === item.id) {
                                            this.eventGroupList.splice(index, 1);
                                        }
                                    });
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('数据中心-元数据-删除事件分组', {id: item.id});
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
                let regName = /^[a-zA-Z][a-zA-Z0-9_]*$/;//允许输入数字、字母、下划线 字母开头
                let regNameCn = /^[\u4E00-\u9FA5A-Za-z].{0,}$/;//匹配是否以中英文字符开头
                this.errorTextName = '';
                this.errorTextMeaning = '';
                this.errorTextMeaningEn = '';
                let ob = this.eventGroupDetail;
                if (ob.name === '') {
                    this.errorTextName = this.$t('metaData.groupNoEmpty');
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
            saveGroup() {
                let ob = this.eventGroupDetail;
                ob.events = this.attrs.map(item => {
                    return {
                        id: item
                    };
                });
                let sendData = {
                    id: ob.id,
                    events: ob.events,
                    // cid: this.$store.state.user.cid,
                    isShow: ob.isShow,
                    name: ob.name,
                    meaning: ob.meaning,
                    nameEn: ob.nameEn,
                };

                if (this.check()) {
                    this.loading = true;
                    this.$loading();
                    if (ob.id === '') {//新建
                        WebServEventGroupApiV1
                            .createEventGroup(sendData)
                            .then(() => {
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                trackEvent('数据中心-元数据-新增事件分组', {name: ob.name});
                                this.loading = false;
                                // 刷新数据后清空数据
                                this.keyWordsTemp = '';
                                this.keyWords = '';
                                this.getEventGroupList();
                                this.closeDataOperate();
                                this.$loaded();
                            })
                            .catch(() => {
                                this.loading = false;
                                this.$loaded();
                            });
                    } else {//编辑
                        WebServEventGroupApiV1
                            .editEventGroup(sendData)
                            .then(() => {
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                trackEvent('数据中心-元数据-修改事件分组', {id: ob.id});
                                this.loading = false;
                                this.getEventGroupList();
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

            //请求事件分组列表
            getEventGroupList() {
                this.$loading();
                WebServEventGroupApiV1
                    .getEventGroupList(this.keyWords)
                    .then((res) => {
                        this.eventGroupList = res.body.data.eventGroupList;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            /**
             *  未选择的事件列表
             * @param id
             */
            getCanSelectEventList(id) {
                this.$loading();
                WebServEventApiV1
                    .getCanSelectEventList('')
                    .then((res) => {
                        if (id) {
                            this.eventGroupDetail = res.body.data.eventGroup;
                        }
                        this.canSelectEventList = res.body.data.canSelectEvents;
                        this.EventsList = this.EventsList.concat(this.canSelectEventList);
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            //取消新增事件
            cancel() {
                this.isShowCreate = false;
                this.eventGroupDetail.name = '';
                this.eventGroupDetail.meaning = '';
                this.eventGroupDetail.nameEn = '';
                this.eventGroupDetail.events = [];
                this.EventsList = [];
                this.attrs = [];
                this.canSelectEventList = [];
                this.canSelectattrs = [];
                this.id = '';
                this.isDefaultGroup = false;
                this.errorTextMeaning = '';
                this.errorTextMeaningEn = '';
                this.errorTextName = '';
            },
            // handleSearch
            handleSearch(){
                this.keyWords = this.keyWordsTemp;
                this.pageNow = 1;
            }
        },
        mounted() {
            this.getEventGroupList();
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";
    @import "../data-item";

    .event-group {
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
                border-bottom: 1px solid #f8f8f8;

                .checkbox {
                    font-size: 14px;
                }

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
        }
    }
</style>
