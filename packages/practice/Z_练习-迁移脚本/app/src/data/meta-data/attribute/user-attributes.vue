<template>
<!--    用户属性-->
    <div class="user-attribute">
        <div class="data-item">
            <div class="content-box">
                <div class="content-top">
                    <button class="pull-right btn btn-md btn-theme" @click="addItem">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'metaData.add' | t}}
                    </button>
                    <div class="search-box md">
                        <input type="text" :placeholder="$t('metaData.enterAttrName')" v-model.trim="keyWordsTemp"
                               @keydown.enter="handleSearch">
                        <svg aria-hidden="true" @click="handleSearch">
                            <use xlink:href="#icon-search"></use>
                        </svg>
                    </div>
                    <p class="search-title">{{'common.total' | t}} <span>{{filteredOptions.length}}</span>
                        {{'metaData.userAttrs' | t}}</p>
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
                            <td>{{'metaData.keyIden' | t}}</td>
                            <td>{{'metaData.presetStatus' | t}}</td>
                            <!-- <td width=70>{{'metaData.synchronization' | t}}</td> -->
                            <td width=90>{{'tag.operate' | t}}</td>
                        </tr>
                        </thead>
                    </table>
                    <div class="metadata-table-content simplify-table">
                        <table>
                            <draggable class="draggable" v-if="filteredOptions.length !== 0" v-model="eventAttrList"
                                       @update="getUpdateList" tag="tbody">
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
                                    <!--<td class="selector-td">{{item.filter === true ? '是' : '否'}}</td>-->
                                    <td class="selector-td">{{item.isPk ? $t('common.yes') : $t('common.no')}}</td>
                                    <td class="selector-td">{{item.isPreset ? $t('metaData.Preset') :
                                        $t('metaData.defined')}}
                                    </td>
                                    <!-- <td width=60>{{item.syncDmd? $t('common.yes') : $t('common.no')}}</td> -->
                                    <td width=90>
                                        <svg aria-hidden="true" class="action-icon icon-round-pencil"
                                             @click.stop="editAttr(item)"
                                             v-title:top="$t('dragJourney.edit')">
                                            <use xlink:href="#icon-round-pencil"></use>
                                        </svg>
                                        <svg aria-hidden="true" class="action-icon icon-mp-top"
                                             @click.stop="topLabelElement(item)" v-show='!item.isPreset'
                                             v-title:top="$t('metaData.stick')">
                                            <use xlink:href="#icon-mp-top"></use>
                                        </svg>
                                        <svg aria-hidden="true" class="action-icon icon-delete"
                                             @click.stop="deleteLabelConfirm(item)" v-show='!item.isPreset'
                                             v-title:top="$t('tag.delete')">
                                            <use xlink:href="#icon-round-close"></use>
                                        </svg>
                                    </td>
                                </tr>
                            </draggable>
                        </table>
                        <list-empty v-if="filteredOptions.length === 0 && keyWords === ''"
                                    :name="$t('metaData.userproperty')"/>
                        <list-search-empty v-if="filteredOptions.length === 0 && keyWords !== ''"/>
                    </div>
                </div>
            </div>
        </div>

        <transition name="slide">
            <div class="slide-form" v-if="isShowCreate" v-blur="closeDataOperate" key="userAttrSlideForm">
                <div class="form-title">
                    <span class="icon-right icon"></span>
                    {{detail.id === '' ? $t('metaData.add') : $t('metaData.edit')}}{{'metaData.userproperty' | t}}
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
                                      :disabled='isPreset'
                                      v-title:top.line.warn="error.attrLength"
                                      :class="{error: error.attrLength}"
                                      @focus.native="error.attrLength=''"></number-input>
                    </div>
                    <div class="form-field">
                        <label class="label">{{'metaData.keyIden' | t}}</label>
                        <i class="icon icon-yiwen1" v-title:left="$t('metaData.primaryKeyPrompt')"></i>
                        <switch-button :has="detail.primaryKeySurplusEditCount === 0"
                            v-model="detail.isPk" v-if="isShowSwitchButton">
                            {{detail.isPk?$t('common.yes') : $t('common.no')}}
                        </switch-button>
                        <span v-else>
                            {{detail.isPk?$t('common.yes') : $t('common.no')}}
                        </span>
                    </div>
                </div>
                <div class="e-save-box">
                    <button type="button" class="btn btn-md btn-theme-border" @click.stop="closeDataOperates">
                        {{'common.cancel' | t}}
                    </button>
                    <button type="button" class="btn btn-md btn-theme" @click="save" :disabled="saveIsDisabled">{{'common.save'
                        | t}}
                    </button>
                </div>
            </div>
        </transition>
        <!-- 任意主、子账号中，【表单】-【全局设置】内使用该字段作为限制提交次数，那么修改为未非主键后都将被改为“不限” -->
        <modal class="save-modal" v-if="tipShow" @close="tipShow = false" :size="'md'" :title="$t('common.notice')">
            <div class="form-field">
                <p>{{'metaData.tipShow' | t}}</p>
            </div>
            <template v-slot:buttons>
                <button slot="buttons" class="btn btn-md btn-theme-border" @click="tipShow = false">{{'metaData.thinkAgain'| t}}</button>
                <button slot="buttons" class="btn btn-md btn-theme" @click="editSubmit(0)">{{'metaData.confirmModification'| t}}</button>
            </template>
        </modal>
    </div>
</template>
<script>
    import { WebServAttrApiV1, ManageApi } from '@/api';
    import filterArrayByKeys from '../../../common/utils/filterArrayByKeys';
    import cloneDeep from 'lodash/cloneDeep';
    import {trackEvent} from '@/monitor';
    import { mapState } from 'vuex';

    const emptyAttr = { //新建时id为空
        name: '',
        meaning: '',
        nameEn: '',
        attrGenre: '',
        attrLength: '',
        attrType: 0,
        id: '',
        empty: true,
        filter: true,
        isPk: false,
        reserve: true,
        result: true,
        sole: true,
        // defaultValue: '',
        syncDmd: false, //是否与dmd同步
    };

    export default {
        data() {
            return {
                tipShow: false,//提示
                loading: false, //加载
                isShowCreate: false,    //是否新建
                detail: cloneDeep(emptyAttr),   //详情
                error: {//校验字段
                    name: '',
                    meaning: '',
                    attrGenre: '',
                    attrLength: '',
                    errorTextMeaningEn: ''
                },
                keyWords: '',   //搜索关键词
                eventAttrList: [],  //事件分析列表

                attrGenreList: [    //类型
                    {id: 0, name: this.$t('metaData.string')},
                    {id: 1, name: this.$t('metaData.integer')},
                    {id: 2, name: this.$t('metaData.date')},
                    {id: 3, name: this.$t('metaData.decimal')},
                ],
                isDragList: false,
                dragList: [],
                isPreset: false,    //预设
                dates: [],
                keyWordsTemp: '' // 临时存储搜索关键字
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
            ...mapState(['user']),
            filteredOptions() {
                return filterArrayByKeys(this.eventAttrList, this.keyWords, 'name', 'meaning', 'nameEn');
            },
            //判断是否展示switchBtn按钮
            isShowSwitchButton() {
                const name = this.detail.name;
                const isMobileAndEmail = (name === 'mobile' || name === 'email');
                //判断是否是（手机号或邮箱）
                if (isMobileAndEmail) {
                    return this.detail.editable;
                }
                return !this.isPreset;
            },
            //保存按钮是否禁用
            saveIsDisabled() {
                const name = this.detail.name;
                const isMobileAndEmail = (name === 'mobile' || name === 'email');

                //预置主键
                if (this.isPreset) {
                    if (isMobileAndEmail) {
                        return this.loading || this.detail.primaryKeySurplusEditCount === 0;
                    }
                    return this.isPreset;
                }
                //自定义主键
                return this.loading;
            }
        },
        methods: {
            //获取在admin中是否可以编辑
            checkEditable(name) {
                if (name !== 'mobile' && name !== 'email') return;
                ManageApi
                    .getPrimaryKeyEdit({
                        companyId: this.user.cid
                    })
                    .then(({body}) => {
                        if (body.code === 200) {
                            // 不可编辑 1:可编辑（默认为0）
                            if (name === 'mobile' ) {
                                this.detail.editable = body.data.mobilePrimaryEdit !== 0;
                            } else {
                                this.detail.editable = body.data.emailPrimaryEdit !== 0;
                            }
                        } else {
                            this.$toast(body.message);
                        }
                    })
                    .catch(err => {
                        throw err;
                    });
            },
            /**
             * 关闭数据操作
             * @param targetDom
             */
            closeDataOperate(targetDom) {
                if (this.tipShow) return;
                if (this.$root.$el.contains(targetDom)) {
                    this.isShowCreate = false;
                    return;
                }
                this.isShowCreate = true;
                this.error.name = '';
                this.error.meaning = '';
                this.error.errorTextMeaningEn = '';
                this.error.attrGenre = '';
                this.error.attrLength = '';
            },
            // 关闭数据操作后恢复默认值
            closeDataOperates() {
                this.isShowCreate = false;
                this.error.name = '';
                this.error.meaning = '';
                this.error.errorTextMeaningEn = '';
                this.error.attrGenre = '';
                this.error.attrLength = '';
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
                        this.$toast(this.$t('common.saveSuccess'), 'success');
                        trackEvent('数据中心-元数据-用户属性拖拽');
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            /**
             * 置顶用户属性
             * @param item
             */
            topLabelElement(item){
                WebServAttrApiV1
                    .topEventAttr({id: item.id, top: 1})
                    .then(({body}) => {
                        if (body.code === 200) {
                            this.$loaded();
                            this.getAttrList();
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                        this.loading = false;
                    });
            },
            /**
             * 编辑用户属性
             * @param item
             */
            editAttr(item) {
                this.isShowCreate = true;
                this.detail = Object.assign({}, item, { editable: false });
                this.checkEditable(item.name);
                if (item.isPreset) {
                    this.isPreset = true;
                } else {
                    this.isPreset = false;
                }
            },
            /**
             * 校验方法
             * @param item
             * @returns {boolean}
             */
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
                        if (item.attrLength > 30) {
                            this.error.attrLength = this.$t('metaData.lengthDecimalReg');
                            return false;
                        }
                        if (item.attrLength < 1) {
                            this.error.attrLength = this.$t('metaData.lengthDecimalReg1');
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
                                cid: this.user.cid
                            })
                            .then((/*{body: {data: {attribute}}}*/) => {
                                // fixme should push attribute instead of re-fetch the whole list.
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                trackEvent('数据中心-元数据-新建用户属性', {name: this.detail.name});
                                this.loading = false;
                                this.$loaded();
                                // 刷新数据后清空数据
                                this.keyWordsTemp = '';
                                this.keyWords = '';
                                this.getAttrList();
                            })
                            .catch(() => {
                                this.$loaded();
                                this.loading = false;
                            });
                        this.closeDataOperates();
                    } else {
                        //编辑相关得逻辑
                        this.editSubmit(1);
                    }
                }
            },
            /**
             * checkFormPrimaryKey
             * 编辑预置主键时，是否需要获取表单是否使用了该主键。0：无需获取 1：需要获取
             * 修改接口请求
             */
            editSubmit(key) {
                if (key === 1){
                    this.tipShow = false;
                }
                WebServAttrApiV1
                    .editEventAttr({
                        ...this.detail,
                        cid: this.user.cid,
                        checkFormPrimaryKey: key
                    })
                    .then(({body}) => {
                        if (body.code === 200) {
                            this.$loaded();
                            this.loading = false;
                            if (body.data.warning) {
                                //主键对其他表单有影响，
                                this.tipShow = true;
                            } else {
                                this.tipShow = false;
                                this.$toast(this.$t('common.saveSuccess'), 'success');
                                trackEvent('数据中心-元数据-修改用户属性', {id: this.detail.id});
                                this.getAttrList();
                                this.closeDataOperates();
                            }
                        } else {
                            this.$toast(body.message);
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                        this.loading = false;
                    });
            },
            /**
             * 删除事件
             * @param item
             */
            deleteLabelConfirm(item) {
                this.$confirm(this.$t('common.defaultConfirmTitle'), this.$t('common.delete'))
                    .then(sure => {
                        if (sure) {
                            this.$loading();
                            WebServAttrApiV1
                                .deleteEventAttr(item.id)
                                .then(() => {
                                    this.$loaded();
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    trackEvent('数据中心-元数据-删除用户属性', {id: item.id});
                                    this.getAttrList();
                                })
                                .catch(() => {
                                    this.$loaded();
                                    this.loading = false;
                                });
                        }
                    });
            },
            //增加用户属性列表项
            addItem() {
                this.isShowCreate = true;
                this.isPreset = false;
                this.detail = cloneDeep(emptyAttr);
            },
            //请求属性列表
            getAttrList() {
                this.$loading();
                WebServAttrApiV1 //这里的0表示请求的是用户属性
                    .getAttributes({attrType: 0, isFilter: '', isResult: ''})
                    .then((res) => {
                        this.$loaded();
                        this.eventAttrList = res.body.data.attributeList;
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
