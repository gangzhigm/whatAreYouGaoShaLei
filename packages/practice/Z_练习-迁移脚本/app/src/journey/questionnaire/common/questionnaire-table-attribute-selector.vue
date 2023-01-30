<template>
    <div class="questionnaire-table-attribute-selector" v-blur="close">
        <div class="dropdown-trigger" :class="{active: show}" @click="show = !show">
            <span class="icon icon-menu"></span>
            {{'metaData.defined' | t}}{{'form.displayField' | t}}
            <span class="action-icon icon icon-arrow-down"></span>
        </div>
        <transition name="drop">
            <div class="shuttle-content" v-show="show">
                <shuttle-box v-bind="shuttleInfo" v-model="selectedIds" @orderOptions='isDraggable=true' @toRight='toRight=true'/>
            </div>
        </transition>
    </div>
</template>

<script>
    import {I18N_STORE_NAME} from '@/locales';
    import { QuestionnaireApiV1, QuestionnaireApiAuth } from '@/api';
    import { mapState } from 'vuex';

    export default {
        name: 'questionnaire-table-attribute-selector',
        data() {
            return {
                show: false,        // 显隐
                allAttrs: [], // 全部用户属性
                selectedAttrs: [],  // 右边，已选择列 数据
                selectedIds: '',   // 右边，已选择列 id
                lastIds: [],         //本次变动上一次的已选ids，排序用\
                isFirst: true,
                isDraggable: false,
                toRight: false
            };
        },
        created() {
            this.getAttrList(this.questionnaireId);
        },
        watch: {
            selectedIds(n,o) {
                if (this.isFirst) {
                    if (!this.toRight) {
                        this.isFirst = false;
                        return;
                    }
                }
                
                if (this.isDraggable) {
                    this.isDraggable = false;
                } else {
                    const arrayO = o.split(',');
                    const arrayN = n.split(',');
                    const result = arrayO.length === arrayN.length 
                        && arrayO.every(a => arrayN.some(b => a === b)) 
                        && arrayN.every(_b => arrayO.some(_a => _a ===  _b));
                    if (result) return;
                }
                
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: this.questionnaireId,
                        type: 4,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            let ids = this.selectedIds.split(',')
                                .filter(id => id !== '')
                                .map(id => Number(id));
                            let isOrder = false;
                            if (ids.length === this.lastIds.length) {
                                for (let i = 0;i < ids.length;i++) {
                                    if (ids[i] !== this.lastIds[i]) isOrder = true;
                                }
                            }
                            if (isOrder || this.toRight) {
                                this.toRight = false;
                                QuestionnaireApiV1
                                    .sortFormFields(this.questionnaireId, ids)
                                    .then(() => {
                                        this.saveFormFieldsAndGetList(ids);
                                    });
                            } else {
                                this.saveFormFieldsAndGetList(ids);
                            }
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            }
        },
        computed: {
            ...mapState({
                // 系统当前语言
                language: state => state[I18N_STORE_NAME].lang
            }),
            // 表单Id
            questionnaireId() {
                return this.$route.query.id;
            },
            shuttleInfo() {
                return {
                    titles: [this.$t('form.formField'), this.$t('controller.selected') + this.$t('form.displayField')],
                    dataList: this.allAttrs,
                    selectedVal: this.selectedIds,
                    draggable: true,
                    search: true,
                };
            }
        },
        methods: {
            saveFormFieldsAndGetList(ids) {
                QuestionnaireApiV1
                    .saveFormFields(this.questionnaireId, ids)
                    .then(() => {
                        this.getAttrList(this.questionnaireId);
                    });
            },
            // 获取表单列表title
            getAttrList(id) {
                QuestionnaireApiAuth
                    .downloadDetailAccess({
                        paperId: id,
                        type: 4,
                    })
                    .then(({body:{data:{isAccess}}})=>{
                        if ( isAccess === 1 ) {
                            QuestionnaireApiV1
                                .getFormTitle({id})
                                .then(({body: {data: {questionsList}}}) => {
                                    // 所有属性列表
                                    this.allAttrs = questionsList.map(q => Object.assign({}, q, {
                                        id: q.id,
                                        name: this.language === 'en' ? q.content : q.formRemark
                                    }));
                                    // 已选的列数据 Array
                                    this.selectedAttrs = questionsList.filter(q => q.check);
                                    // 已选的列ids String
                                    let ids = '';
                                    this.lastIds = this.selectedAttrs.map(item => {
                                        ids += item.id + ',';
                                        return item.id;
                                    });
                                    if (this.selectedIds !== ids.slice(0,-1)) {
                                        this.selectedIds = ids.slice(0,-1);
                                    }
                                    //搜索时对应的下拉菜单选择中只显示字符串类型的字段值 fieldType === 0
                                    let searchFieldOptions =
                                        this.allAttrs.filter(f => f.check && f.fieldType === 0)
                                            .map(f => Object.assign({}, f ,{
                                                name: this.language === 'en' ? f.content : f.formRemark
                                            }));
                                    let fieldId = '';
                                    let formContent = '';
                                    if (searchFieldOptions.length > 0) {
                                        fieldId = searchFieldOptions[0].fieldId;
                                        formContent = searchFieldOptions[0].formContent;
                                    } else {
                                        fieldId = '';
                                        formContent = '';
                                    }
                                    this.$emit('searchOpt',
                                        {searchFieldOptions: searchFieldOptions,fieldId: fieldId,formContent: formContent});
                                    this.$emit('change', this.selectedAttrs, this.allAttrs);
                                    if (!this.isFirst) {
                                        this.$parent.keyword = '';
                                        this.$parent.getFormDetails(id);
                                    }
                                });
                        } else if ( isAccess === 0 ) {
                            this.$toast(this.$t('form.sharingVerifyOption'), 'warn');
                        }
                    });
            },
            close() {
                this.show = false;
            }
        }
    };
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../common/scss/base/variables";
    @import "../../../common/scss/base/mixin";

    .questionnaire-table-attribute-selector {
        position: relative;
        margin-right: 10px;

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

        .shuttle-content {
            position: absolute;
            z-index: $index-menu - 1;
            overflow: hidden;
            top: $input-field-height + 4px;
            right: 0;
            display: flex;
            flex-direction: row;
            width: 508px;
            padding: 8px;
            border: solid 1px $select-border;
            @include border-radius(4px);
            background-color: #fff;
            line-height: 32px;
        }
    }
</style>

