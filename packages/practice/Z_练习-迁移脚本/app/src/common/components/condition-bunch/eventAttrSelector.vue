<template>
    <div class='attr-selector' v-blur="close">
        <label class="select-text" :class="{'disabled': disabled}" @click="!disabled && toggle()">
            <span v-if="attrName" class="text-select-name" :title="attrName">{{attrName}}</span>
            <span v-else class="placeholder">{{$t('swarm.eventAttrPlaceholder')}}</span>
            <span class="select-icon icon icon-arrow-down"></span>
        </label>
        <transition name="drop">
            <div class="select-list" v-if="showList">
                <div class="search">
                    <label class="search-field">
                        <input type="text" ref="search" v-model.trim="keyword" :placeholder="$t('common.selectKeywordHolder')"
                               :disabled="loading">
                        <span class="icon icon-search"></span>
                    </label>
                </div>
                <div class="attrList">
                    <inline-loading v-if="loading"/>
                    <!-- 特殊处理：根据id为负值判断是否预设字段。因接口无法正确返回判断是否预设选项的字段，
                        后期优化需改为根据isPreset数据判断-DMT-5768 -->
                    <ul v-if="attrSearchListFixed.length && !loading" class="fixed-list">
                        <li v-for="(item,index) in attrSearchListFixed" :key="index" @click.stop="selectAttr(item)"
                            :class="{active: enhancedId(item)}" :title="item.name">{{item.name}}</li>
                    </ul>
                    <ul v-if="attrSearchListCustom.length && !loading">
                        <li v-for="(item,index) in attrSearchListCustom" :key="index" @click.stop="selectAttr(item)"
                            :class="{active: enhancedId(item)}" :title="item.name">{{item.name}}</li>
                    </ul>
                    <ul v-if="!attrSearchList.length && !loading">
                        <li>{{'common.noData' | t}}</li>
                    </ul>
                </div>
            </div>
        </transition>
    </div>
</template>
<script type="text/ecmascript-6">

    import { ContactApi } from '@/api';
    import filterArrayByName from '../../../common/utils/filterArrayByName';
    import {I18N_STORE_NAME} from '@/locales';
    import { mapState } from 'vuex';

    export default {
        props: {
            value: '',      //事件属性id
            eventID: '',    //事件id
            disabled: Boolean,
            noEC: Boolean,
            formSource: false
        },
        data () {
            return {
                showList: false,        //列表是否打开
                keyword: '',            //搜索关键词
                attrList: [],           //完整事件属性列表
                loading: true
            };
        },
        watch: {
            //根据事件id变化，实时加载对应事件属性列表
            eventID() {
                this.getAttrList(this.eventID);
            }
        },
        created() {
            //数据回显
            this.getAttrList(this.eventID);
        },
        methods: {
            toggle() {
                this.showList = !this.showList;
            },
            close() {
                this.showList = false;
                this.keyword = '';
            },
            //根据事件ID获取事件属性列表
            getAttrList(id) {
                this.loading = true;
                ContactApi
                    .getEventAttr(id)
                    .then(res => {
                        let eventList = res.body.data.customerFieldDTO.map(e => {
                            // if (e.fieldName === 'form_id') {
                            //     e.fieldCn = this.$t('form.formNames');
                            // } else if (e.fieldName === 'label_id') {
                            //     e.fieldCn = this.$t('tag.tagName');
                            // } // 6721需求中，削除将表单id选项显示为表单名称的逻辑
                            if (e.fieldName === 'label_id') {
                                e.name = this.$t('tag.tagName');
                            } else {
                                e.name = this.lang ? e.fieldCn : e.nameEn;
                            }
                            return e;
                        });
                        this.attrList = eventList;
                        this.loading = false;
                    });
            },
            //选择事件属性
            selectAttr(attr) {
                this.showList = false;
                // this.attrName = attr.fieldCn;
                // 来源表单选项特殊处理，不会触发input
                if (attr.fieldName !== 'form_source') {
                    this.$emit('input', attr.id);
                }
                this.$emit('select', attr);
            },
            enhancedId(item) {
                if (this.formSource) {
                    return item.id === -3002;
                }
                return item.id === this.value;
            }
        },
        computed: {
            ...mapState({
                // 语言状态
                lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
            }),
            //选中的属性名称
            attrName() {
                let name = '';
                if (this.attrList.length > 0) {
                    if (this.formSource) {
                        if (this.attrList.some(item => (item.id === -3002))) {
                            name = this.attrList.filter(item => (item.id === -3002))[0].name;
                        } else {
                            this.$emit('noitem');
                        }
                    } else {
                        if (this.value) {
                            if (this.attrList.some(item => (item.id === this.value))) {
                                name = this.attrList.filter(item => (item.id === this.value))[0].name;
                            } else {
                                this.$emit('noitem');
                            }
                        }
                    }
                }
                return name;
            },
            attrSearchList() {
                return this.keyword ? filterArrayByName(this.attrList,this.keyword,'name') : this.attrList;
            },
            attrSearchListFixed() {
                return this.attrSearchList.filter(e => {
                    if (this.noEC) {
                        return e.id < 0 && e.id !== -4001 && e.id !== -1001; //事件触发时间（-4001）在虚线以下显示
                    }
                    return e.id < 0 && e.id !== -4001; //事件触发时间（-4001）在虚线以下显示
                });
            },
            attrSearchListCustom() {
                return this.attrSearchList.filter(e => {
                    return e.id > 0 || e.id === -4001; //事件触发时间（-4001）在虚线以下显示
                });
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .attr-selector {
        display: inline-block;
        position: relative;
        vertical-align: top;
        margin-right: 10px;
        margin-bottom: 5px;
        label {
            float: left;
            // display: inline-block;
            position: relative;
            width: 150px;
            height: $input-field-height - 2px;
            line-height: $input-field-height - 2px;
            border: 1px solid $form-border;
            border-radius: 4px;
            padding-right: 8px;
            cursor: pointer;
            padding-left: 1em;
            background-color: #fff;
            &:hover {
                border-color: $light-green;
            }
            .icon {
                float: right;
            }
            .placeholder{
                color: #bfbfbf;
            }
            .text-select-name,.placeholder {
                display:inline-block;
                max-width: 135px;
                overflow: hidden;
                @include ellipsis();

            }
            &.disabled{
                background-color: #f0f2f5;
                cursor: default;
                color: $disabled;
            }
            &.disabled:hover {
                border: 1px solid $form-border;
            }
        }
        .select-list{
            width: 172px;
            height: 250px;
            box-sizing: border-box;
            position: absolute;
            left: 0;
            top: 33px;
            background-color: #fff;
            z-index: 1;
            border-radius: 4px;
            border: 1px solid $form-border;
            overflow: hidden;
            .search{
                position: absolute;
                top: -1px;
                left: -1px;
                width: 172px;
                z-index: 1;
                border: 1px solid $select-border;

                .search-field{
                    position: relative;
                    display: flex;
                    width: 100%;
                    align-items: center;
                    height: $input-field-height;
                    background-color: $title-bg;
                    @include border-radius(0);
                    color: $color-light-content;
                    box-sizing: border-box;
                    padding: 0;
                    border: none;

                    input {
                        height: $input-field-height - 1;
                        padding: 0 8px 0 28px;
                        width: 100%;
                        min-width: 5em; // 否则placeholder显示不全
                        background-color: transparent;
                        border: none;

                        &:hover {
                            background-color: $select-bg;

                            & + .icon-search {
                                background-color: $select-bg;
                            }
                        }

                        &:focus {
                            background-color: #fff;

                            & + .icon-search {
                                background-color: #fff;
                            }
                        }
                    }

                    .icon-search {
                        $offset: ($input-field-height - 14px) / 2;
                        position: absolute;
                        width: 26px;
                        height: $input-field-height - 3px;
                        line-height: $input-field-height;
                        text-align: center;
                        left: 1px;
                        top: 1px;
                        background-color: transparent;
                    }
                }
            }
            .attrList {
                height: 214px;
                margin-top: 33px;
                overflow-y: auto;
                ul {
                    width: 100%;
                    box-sizing: border-box;
                    li {
                        padding: 0 8px 0 16px;
                        height: $input-field-height;
                        line-height: $input-field-height;
                        @include ellipsis();
                        cursor: pointer;
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
                    &.fixed-list li:last-child{
                        border-bottom: 1px dashed #cccccc;
                    }
                }
            }
        }
    }
</style>
