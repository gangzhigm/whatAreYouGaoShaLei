<template>
<!--    事件属性-->
    <div class="event-attribute">
        <div class="data-item">
            <div class="content-box">
                <div class="content-top">
                    <button class="btn btn-md btn-theme pull-right" @click="addItem">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'metaData.add' | t}}
                    </button>
                    <div class="search-box md">
                        <input type="text" :placeholder="$t('metaData.eventProName')" v-model.trim="keyWordsTemp"
                               @keydown.enter="handleSearch">
                        <svg aria-hidden="true" @click="handleSearch">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <p class="search-title">{{'common.total' | t}} <span>{{filteredOptions.length}}</span>
                        {{'metaData.eventproperties' | t}}</p>
                    <button class="search-btn btn btn-md btn-theme save-drag-list" @click="sendDragList"
                            v-if="isDragList"> {{'metaData.saveOrder' | t}}
                    </button>
                </div>
                <div class="simplify-table">
                    <table>
                        <thead>
                        <tr>
                            <td>{{'metaData.attrName' | t}}</td>
                            <td>{{'metaData.displayName' | t}}</td>
                            <td>{{'metaData.displayNameEn' | t}}</td>
                            <td>{{'metaData.type' | t}}</td>
                            <td>{{'metaData.length' | t}}</td>
                            <!--<td>是否唯一</td>-->
                            <!-- <td>{{'metaData.allowEmpty' | t}}</td> -->
                            <!-- 屏蔽 "可见/不可见" 字段 -->
                            <!--<td>是否显示</td>-->
                            <td>{{'metaData.presetStatus' | t}}</td>
                            <td :width="60">{{'tag.operate' | t}}</td>
                        </tr>
                        </thead>
                    </table>
                    <div class="metadata-table-content simplify-table">
                        <table>
                            <draggable class="draggable" v-model="eventAttrList" v-if="filteredOptions.length !== 0"
                                       tag="tbody" @update="getUpdateList">
                                <!--不可编辑-->
                                <tr v-for="item in filteredOptions" :key="item.id" @click="editAttr(item)">
                                    <td>{{item.name}}</td>
                                    <td>{{item.meaning}}</td>
                                    <td>{{item.nameEn}}</td>
                                    <td class="selector-td">
                                        {{item.attrGenre === 0 ? $t('metaData.string') : item.attrGenre === 1 ?
                                        $t('metaData.integer') : item.attrGenre
                                        === 2 ? $t('metaData.date') : $t('metaData.decimal')}}
                                    </td>
                                    <td>{{item.attrLength}}</td>
                                    <!-- <td class="selector-td">{{item.empty ? $t('common.yes') : $t('common.no')}}</td> -->
                                    <!-- 屏蔽 "可见/不可见" 字段 -->
                                    <!--<td class="selector-td">{{item.filter ? '是' : '否'}}</td>-->
                                    <td class="selector-td">{{item.isPreset ? $t('metaData.Preset') :
                                        $t('metaData.defined')}}
                                    </td>
                                    <td :width="60">
                                        <svg :title="$t('metaData.edit')" aria-hidden="true"
                                             class="action-icon icon-round-pencil"
                                             @click.stop="editAttr(item)"
                                             v-title:top="$t('dragJourney.edit')">
                                            <use xlink:href="#icon-round-pencil"></use>
                                        </svg>
                                        <svg :title="$t('metaData.delete')" aria-hidden="true"
                                             class="action-icon icon-delete"
                                             @click.stop="deleteAttrConfirm(item)" v-show='!item.isPreset'
                                             v-title:top="$t('tag.delete')">
                                            <use xlink:href="#icon-round-close"></use>
                                        </svg>
                                    </td>
                                </tr>
                            </draggable>
                        </table>
                        <list-empty v-if="filteredOptions.length === 0 && keyWords === ''"
                                    :name="$t('metaData.eventproperty')"/>
                        <list-search-empty v-if="filteredOptions.length === 0 && keyWords !== ''"/>
                    </div>
                </div>
            </div>
        </div>
        <transition name="slide">
            <div class="slide-form" v-if="isShowCreate" v-blur="closeDataOperate" key="eventAttrSlideForm">
                <div class="form-title">
                    <span class="icon-right icon"></span>
                    {{detail.id === '' ? $t('metaData.add') : $t('metaData.edit')}}{{'metaData.eventproperty' | t}}
                </div>
                <div class="form-content">
                    <div class="form-field">
                        <label class="label">{{'metaData.attrName' | t}}</label>
                        <input type="text" class="input" maxlength="30" :placeholder="$t('metaData.nameRegEn')"
                               :title="$t('metaData.nameRegEn').replace('<br/> ', '')" v-model.trim="detail.name"
                               @focus="error.name=''"
                               :class="{error: error.name}" v-title:top.line.warn="error.name" :disabled='isPreset'>
                    </div>
                    <div class="form-field">
                        <label class="label">{{'metaData.displayName' | t}}</label>
                        <input type="text" class="input" maxlength="30"
                               @focus="error.meaning=''"
                               :class="{error: error.meaning}" v-title:top.line.warn="error.meaning"
                               v-model.trim="detail.meaning"
                               :title="$t('metaData.nameRegCn').replace('<br/> ', '')"
                               :placeholder="$t('metaData.nameRegCn')" :disabled='isPreset'>
                    </div>
                    <div class="form-field">
                        <label class="label" for="nameEn">{{'metaData.displayNameEn' | t}}</label>
                        <input type="text" class="input" id="nameEn" maxlength="30" @focus="error.errorTextMeaningEn=''"
                               :class="{error: error.errorTextMeaningEn}" v-title:top.line.warn="error.errorTextMeaningEn"
                               :placeholder="$t('metaData.nameRegEn')" :title="$t('metaData.nameRegEn').replace('<br/> ', '')"
                               v-model.trim="detail.nameEn" :disabled='isPreset'>
                    </div>
                    <div class="form-field">
                        <label class="label">{{'metaData.type' | t}}</label>
                        <selector type="select" v-model="detail.attrGenre" class="select-field"
                                  :options="attrGenreList" :disabled="detail.id !== ''"
                                  v-title:top.line.warn="error.attrGenre"
                                  :class="{error: error.attrGenre}"/>
                    </div>
                    <div class="form-field">
                        <label class="label" for="length">{{'metaData.length' | t}}</label>
                        <number-input maxlength="6" id="length" v-model="detail.attrLength" class="input"
                                      v-title:top.line.warn="error.attrLength" :class="{error: error.attrLength}"
                                      :disabled='isPreset'></number-input>
                    </div>
                    <!-- 屏蔽 "是否允许为空" 字段 -->
                    <!--<div class="form-field">-->
                    <!--<label class="label">{{'metaData.allowEmpty' | t}}</label>-->
                    <!--<switch-button v-model="detail.empty" v-if='!isPreset'>-->
                    <!--{{detail.empty?$t('metaData.yes') : $t('metaData.no')}}-->
                    <!--</switch-button>-->
                    <!--<span v-else>-->
                    <!--{{detail.empty?$t('metaData.yes') : $t('metaData.no')}}-->
                    <!--</span>-->
                    <!--</div>-->
                    <!-- 屏蔽 "可见/不可见" 字段 -->
                    <!--
                    <div class="form-field">
                        <label class="label">是否显示</label>
                        <switch-button v-model="detail.filter" v-if='!isPreset'>
                            {{detail.filter?'显示':'不显示'}}
                        </switch-button>
                        <span v-else>
                            {{detail.filter?'显示':'不显示'}}
                        </span>
                    </div>
                    -->
                </div>
                <div class="e-save-box">
                    <button type="button" class="btn btn-md btn-theme-border" @click.stop="closeDataOperate">
                        {{'common.cancel' | t}}
                    </button>
                    <button type="button" class="btn btn-md btn-theme" @click="save" :disabled="loading||isPreset">
                        {{'common.save' | t}}
                    </button>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import { WebServAttrApiV1 } from '@/api';
    import filterArrayByKeys from '../../../common/utils/filterArrayByKeys';
    import cloneDeep from 'lodash/cloneDeep';
    import {trackEvent} from '../../../monitor';

    const emptyAttr = { //新建时id为空
        name: '',
        meaning: '',
        nameEn: '',
        attrGenre: '',
        attrLength: '',
        attrType: 2,
        id: '',
        empty: true,
        filter: true,
        reserve: true,
        result: true,
        sole: true
    };
    export default {
        data() {
            return {
                loading: false,
                isShowCreate: false,    //新建显隐
                detail: cloneDeep(emptyAttr),
                //校验字段
                error: {
                    name: '',
                    meaning: '',
                    attrGenre: '',
                    attrLength: '',
                    errorTextMeaningEn: ''
                },
                keyWords: '',//搜索关键字
                eventAttrList: [],  //事件属性list
                attrGenreList: [
                    {id: 0, name: this.$t('metaData.string')},
                    {id: 1, name: this.$t('metaData.integer')},
                    {id: 2, name: this.$t('metaData.date')},
                    {id: 3, name: this.$t('metaData.decimal')},
                ], //类型
                isDragList: false,
                dragList: [],
                isPreset: false,    //预设
                keyWordsTemp: ''// 临时存储搜索关键字
            };
        },
        //拖拽后未保存离开当前页面的提示
        beforeRouteLeave(to, from, next) {
            if (this.isDragList) {
                this.$confirm(this.$t('common.save'), this.$t('metaData.dragConfirm'))
                    .then((sure) => {
                        if (sure) next();
                    });
            } else {
                next();
            }
        },
        computed: {
            filteredOptions() {
                return filterArrayByKeys(this.eventAttrList, this.keyWords, 'name', 'meaning', 'nameEn');
            }
        },
        methods: {
            closeDataOperate() {
                this.error.name = '';
                this.error.meaning = '';
                this.error.errorTextMeaningEn = '';
                this.error.attrGenre = '';
                this.error.attrLength = '';
                this.isShowCreate = false;
            },
            //拖拽后数组的排序
            getUpdateList() {
                this.isDragList = true;
                this.dragList = this.eventAttrList.map(item => item.id);
            },

            //拖拽后保存
            sendDragList() {
                //将新增未保存的数据删除
                for (let i = 0; i < this.dragList.length; i++) {
                    if (this.dragList[i] === '') {
                        this.dragList.splice(i, 1);
                    }
                }
                const dragList = this.dragList.map((item) => {
                    return item;
                });
                this.$loading();
                WebServAttrApiV1
                    .attributesSort(dragList)
                    .then(() => {
                        this.isDragList = false;
                        this.$loaded();
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        trackEvent('数据中心-元数据-事件属性拖拽');
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },

            //编辑事件属性
            editAttr(item) {
                this.isShowCreate = true;
                this.detail = cloneDeep(item);
                if (item.isPreset) {
                    this.isPreset = true;
                } else {
                    this.isPreset = false;
                }
            },

            //校验方法
            check(item) {
                this.error.name = '';
                this.error.meaning = '';
                this.error.errorTextMeaningEn = '';
                this.error.attrGenre = '';
                this.error.attrLength = '';
                let regMeaning = /^[\w\u4e00-\u9fa5]+$/;//允许输入汉字、数字、字母、下划线
                let regName = /^[a-zA-Z][a-zA-Z0-9_]*$/;//允许输入数字、字母、下划线 字母开头
                let regNameCn = /^[\u4E00-\u9FA5A-Za-z].{0,}$/;//匹配是否以中英文字符开头
                if (item.name === '') {
                    this.error.name = this.$t('metaData.propertyNamenoEmpty');
                    return false;
                } else if (item.meaning === '') {
                    this.error.meaning = this.$t('metaData.displayNameNoEmpty');
                    return false;
                } else if (item.nameEn === '') {
                    this.error.errorTextMeaningEn = this.$t('metaData.displayNameNoEmpty');
                    return false;
                } else if (item.attrGenre === '') {
                    this.error.attrGenre = this.$t('metaData.typenoEmpty');
                    return false;
                } else if (item.attrLength === '') {
                    this.error.attrLength = this.$t('metaData.lengthnoEmpty');
                    return false;
                } else if (!regName.test(item.name)) {
                    this.error.name = this.$t('metaData.nameRegEn');
                    return false;
                } else if (!regMeaning.test(item.meaning) || !regNameCn.test(item.meaning)) {
                    this.error.meaning = this.$t('metaData.nameRegCn');
                    return false;
                } else if (!regName.test(item.nameEn)) {
                    this.error.errorTextMeaningEn = this.$t('metaData.nameRegEn');
                    return false;
                }
                switch (item.attrGenre) {
                    case 0: // 字符串
                        if (item.attrLength > 65535) {
                            this.error.attrLength = this.$t('metaData.lengthStringReg');
                            return false;
                        }
                        break;
                    case 3:// 小数
                        if (item.attrLength < 1) {
                            this.error.attrLength = this.$t('metaData.lengthDecimalReg1');
                            return false;
                        } else if (item.attrLength > 38) {
                            this.error.attrLength = this.$t('metaData.lengthDecimalReg38');
                            return false;
                        }
                        break;
                    default:
                        if (item.attrLength !== 0) {
                            this.error.attrLength = this.$t('metaData.lengthDateReg');
                            return false;
                        }
                }
                item.attrGenre = Number(item.attrGenre);
                item.attrType = Number(item.attrType);
                return true;
            },

            //保存
            save() {
                if (this.check(this.detail)) {
                    this.loading = true;
                    this.$loading();
                    if (this.detail.id === '') { //如果这个id为空代表是新增，用post请求 否则是编辑，走put请求
                        WebServAttrApiV1
                            .createEventAttr({
                                ...this.detail,
                                cid: this.$store.state.user.cid
                            })
                            .then((/*{body: {data: {attribute}}}*/) => {
                                // fixme push instead of get list.
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                trackEvent('数据中心-元数据-新建事件属性', {name: this.detail.name});
                                // 刷新数据后清空数据
                                this.keyWordsTemp = '';
                                this.keyWords = '';
                                this.getAttrList();
                                this.$loaded();
                                this.loading = false;
                            })
                            .catch(() => {
                                this.loading = false;
                                this.$loaded();
                            });
                    } else {// id != ''时，为编辑
                        WebServAttrApiV1
                            .editEventAttr({
                                ...this.detail,
                                cid: this.$store.state.user.cid
                            })
                            .then(() => {
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                trackEvent('数据中心-元数据-修改事件属性', {id: this.detail.id});
                                this.loading = false;
                                this.$loaded();
                                this.getAttrList();
                            })
                            .catch(() => {
                                this.$loaded();
                                this.loading = false;
                            });
                    }
                }
            },

            //删除事件属性
            deleteAttrConfirm(item) {
                this.$confirm(this.$t('common.defaultConfirmTitle'), this.$t('common.delete'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            WebServAttrApiV1
                                .deleteEventAttr(item.id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('数据中心-元数据-删除事件属性', {id: item.id});
                                    this.$loaded();
                                    this.getAttrList();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    });
            },

            //增加事件属性
            addItem() {
                this.isShowCreate = true;
                this.detail = cloneDeep(emptyAttr);
                this.isPreset = false;
            },

            //请求属性列表
            getAttrList() {
                this.$loading();
                WebServAttrApiV1 //这里的2表示请求的是事件属性
                    .getAttributes({attrType: 2, isFilter: '', isResult: ''})
                    .then((res) => {
                        this.$loaded();
                        this.eventAttrList = res.body.data.attributeList;
                        this.closeDataOperate();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            // handleSearch
            handleSearch() {
                this.keyWords = this.keyWordsTemp;
            }
        },
        mounted() {
            this.getAttrList();
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../data-item";
</style>
