<template>
    <modal class="customer-form" :title="$t('contact.createContact')" @close="close">
        <!-- 创建联系人 -->
        <template v-if="createNewCustomer">
            <p class="disabled-text">{{'contact.keyIden' | t}}</p>
            <br>
            <div class="form-field create-user-list" v-for="(item, index) in selectedAttributes" :key="index">
                <label class="label">{{'contact.selectField' | t}} </label>
                <selector :options="availableAttrs" :value="item.id" search @select="selectAttr(item, $event)" />
                <span>{{'contact.value' | t}} </span>
                <input type="text" class="input" v-model.trim="item.value" />
                <span class="icon icon-tianjia add-icon" @click="addAttribute(index)"></span>
                <span class="icon icon-iconless delete-icon" @click="removeAttr(index)" v-if="selectedAttributes.length !== 1"></span>
            </div>
            <div class="form-field">
                <label class="label"></label>
                <radio source="use" v-model="labelSource">{{'contact.selectLabel' | t}}</radio>
                <radio source="create" v-model="labelSource">{{'contact.createLabel' | t}}</radio>
            </div>
            <!--选择标签-->
            <div class="form-field">
                <template v-if="labelSource === 'use'">
                    <label class="label">{{'contact.selectLabel' | t}}</label>
                    <selector-tree :options="labelGroups" :value="idArray" :max="20" @checkOptions="pickLabels($event)" v-model="checkedlabel" :maxlength="200" />
                </template>
                <template v-if="labelSource === 'create'">
                    <div class="create-tag">
                        <label class="label">{{'contact.createLabel' | t}}</label>
                        <tags-input inputType="many" :labels.sync="tags" @create="getTag" :ifReg="true" :maxTag="20" @del="deleteCreateTags" @changeFlag="changeFlag"></tags-input>
                        <div @click.stop>
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
                                <li v-for="label in createCheckedLabel">
                                    <checkbox :source="label.id" v-model="checkedHiddenLabels" />
                                    &nbsp;{{label.name}}
                                </li>
                                <li v-if="this.createCheckedLabel.length===0">
                                    <span class="no-data">
                                        {{'common.noData' | t}}
                                    </span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </template>
            </div>
        </template>

        <!-- 创建成功 -->
        <div v-else class="save-success">
            <svg aria-hidden="true" class="success-icon">
                <use xlink:href="#icon-success"></use>
            </svg>
            <h5>{{'contact.createSuccess' | t}}</h5>
        </div>

        <!-- 创建联系人 -->
        <template v-if="createNewCustomer" v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme-border" :value="$t('common.cancel')" @click="close">
            <input type="button" class="btn btn-md btn-theme" :value="$t('common.confirm')" @click="confirmHander">
        </template>
        <!-- 创建成功 -->
        <template v-else v-slot:buttons>
            <input type="button" class="btn btn-md btn-theme" :value="$t('contact.backList')" @click="complete">
            <input type="button" class="btn btn-md btn-theme" :value="$t('contact.createContinue')" @click="createNew">
        </template>
    </modal>
</template>

<script>

import { ContactApiV1, WebServAttrApiV1 } from '@/api';
import SelectorTree from '../../common/components/selector-tree.vue';
import { EMAIL_ADDRESS_REGEXP, PHONE_REGEXP } from '../../common/utils/regs.js';
import tagsInput from '../swarm/tags-input.vue';
import debounce from 'lodash/debounce';
import {I18N_STORE_NAME} from '@/locales';
import { mapState } from 'vuex';

// 创建联系人
export default {
    components: {
        SelectorTree,
        tagsInput
    },
    data () {
        return {
            createNewCustomer: true,
            errorText: '',
            labelGroups: [], // 标签列表数据
            labelSource: 'use',  //选择标签
            allAttributes: [],//所有用户属性列表
            selectedAttributes: [],//选中的用户属性列表
            sendObj: {},
            sortType: 1,
            checkedlabel: [],
            //标签中被选中的id数组
            idArray: [],
            createCheckedLabel: [],  //新建的label
            tags: [],
            label_ids: '',
            tag: '',
            changeTagFlag: true,//可接受子组件的参数：input的tag值变化时为false，确定输入完成时为true
            listenFlag: false,//确定创建用户->创建标签失败->listenFlag=true；再次创建标签成功后changeTagFlag =true ->走watch(changeTagFlag)

            //设置隐藏
            hiddenFlag: false,
            checkedHiddenLabels: [],//新建标签是选中的需要隐藏的标签
            // labelIds:[],//确定隐藏的标签ids
        };
    },
    computed: {
        ...mapState({
            // 语言状态
            lang: state => state[I18N_STORE_NAME].lang === 'zh-CN'
        }),
        availableAttrs () {
            return this.allAttributes
                .map(attr => {
                    attr.disabled = this.selectedAttributes.some(({ id }) => id === attr.id);
                    return attr;
                });
        }
    },
    mounted () {
        this.fetchLabelGroups();
        this.getAttributes();
        //点击其他地方收起
        window.addEventListener('click', this.eventListener);
    },
    watch: {
        labelSource () {
            if (this.labelSource === 'use') {
                this.fetchLabelGroups();
            }
        },
        changeTagFlag () {
            if (this.changeTagFlag && this.listenFlag) {
                this.confirmHander();
            }
        },
        hiddenFlag () {
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
                ContactApiV1
                    .batchHideShow(
                        groupId,
                        newArr,
                        labelIds,
                        show,
                        type
                    );//type=3 是新建标签时特殊处理
            }
        }
    },
    methods: {
        getAttributes () {
            WebServAttrApiV1
                .getAttributes({ attrType: 0, isFilter: '', isResult: '' })
                .then(({ body: { data: { attributeList } } }) => {
                    this.selectedAttributes = [];
                    this.allAttributes = [];
                    attributeList
                        .forEach(attr => {
                            // 标签属性额外选择，不在这里输入
                            if (attr.name === 'label_ids') return;
                            // 姓名、手机、邮箱三个属性默认展示
                            if (attr.name === 'name' || attr.name === 'mobile' || attr.name === 'email') {
                                this.selectedAttributes.push({
                                    id: attr.id,
                                    name: this.lang ? attr.meaning : attr.nameEn,
                                    meaning: attr.name,
                                    value: '',
                                    isPk: attr.isPk
                                });
                            }
                            // 展示在下拉框选项上的名字
                            let name = attr.name;
                            attr.name = this.lang ? attr.meaning : attr.nameEn;
                            attr.meaning = name;
                            if (attr.isPk) {
                                attr.name = '* ' + attr.name;
                            }
                            this.allAttributes.push(attr);
                        });
                });
        },
        close () {
            this.clearData();
            this.$emit('close');
        },
        complete () {
            this.clearData();
            this.$emit('close');
            this.$emit('complete');
        },
        // 接收子组件的flag
        changeFlag (flag, listen) {
            if (typeof listen === 'boolean') this.listenFlag = listen;
            this.changeTagFlag = flag;
        },
        confirmHander () {
            let isValid = true;
            let isPk = false;
            for (let item of this.selectedAttributes) {
                if (item.name === '') {
                    isValid = false;
                    this.$toast(this.$t('contact.filedNoEmpty'), 'warn');
                    break;
                } else if (item.value === '') {
                    isValid = false;
                    this.$toast(this.$t('contact.valueNoEmpty'), 'warn');
                    break;
                } else if (item.meaning === 'mobile' && !PHONE_REGEXP.test(item.value)) {
                    this.$toast(this.$t('contact.phoneReg'), 'warn');
                    isValid = false;
                    break;
                } else if (item.meaning === 'email' && !EMAIL_ADDRESS_REGEXP.test(item.value)) {
                    this.$toast(this.$t('contact.emailReg'), 'warn');
                    isValid = false;
                    break;
                }
                if (item.isPk) {
                    isPk = true;
                }
            }
            if (isValid) {
                if (!isPk) {
                    this.$toast(this.$t('contact.OneKey'), 'warn');
                    return;
                }
                this.selectedAttributes.map(item => {
                    this.sendObj[item.meaning] = item.value;
                });
                // 选择标签
                if (this.labelSource === 'use') {
                    this.sendObj.label_ids = this.idArray.join(',');
                    if (this.idArray.length !== 0) {
                        this.idArray = [];
                        this.tag = '';
                        this.createCheckedLabel = [];
                    }
                    this.createCustomer();

                } else {//this.labelSource === 'create' 创建标签
                    if (this.changeTagFlag) {
                        this.label_ids = this.createCheckedLabel.map(tags => tags.id)
                            .join(',');
                        this.sendObj.label_ids = this.label_ids;
                        // 创建用户
                        this.createCustomer();
                        this.tag = '';
                        this.idArray = [];
                        this.createCheckedLabel = [];
                        this.label_ids = '';
                    } else {
                        this.listenFlag = true;
                    }
                }
            }
            //创建完联系人后 清空联系人信息
            this.sendObj = {};
        },
        //获取子组件传过来的tag  防抖
        getTag: debounce(function (tag) {
            this.tag = tag;
            setTimeout(() => {
                this.selectTags();
            }, 60);
        }, 300),
        // 输入新建标签
        selectTags () {
            let tag = this.tag.toString();
            ContactApiV1
                .createLabel({
                    groupId: 1,
                    name: tag.toString()
                })
                .then(res => {
                    this.createCheckedLabel.push({ name: tag.toString(), id: res.body.data.id });
                    setTimeout(() => {
                        this.changeTagFlag = true;
                    });
                })
                .catch(() => {
                    this.tags.splice(-1, 1);
                    if (this.tags.length === 0) {
                        this.tag = '';
                    }
                    this.listenFlag = false;
                    this.changeTagFlag = true;
                });
        },
        // 删除新建tag
        deleteCreateTags (cur) {
            this.createCheckedLabel.splice(cur, 1);
        },
        // 新建用户
        createCustomer () {
            ContactApiV1
                .addCustomer(this.sendObj)
                .then(() => {
                    this.createNewCustomer = false;
                    this.listenFlag = false;
                    this.clearData();
                })
                .catch(() => {
                    this.clearData();
                    this.listenFlag = false;
                });
        },
        // 选择字段
        selectAttr (data, attr) {
            data.id = attr.id;
            data.name = attr.name;
            data.meaning = attr.meaning;
            data.isPk = attr.isPk;
        },
        // 选择标签
        pickLabels (val) {
            this.checkedlabel = val;
            this.idArray = this.checkedlabel.map(elm => elm.id);
        },
        // 获取标签列表
        fetchLabelGroups () {
            ContactApiV1
                .getGroups({
                    sortType: this.sortType
                })
                .then(res => {
                    this.labelGroups = res.body.data.rootGroup.childs;
                });
        },
        // 删除一行
        removeAttr (index) {
            this.selectedAttributes.splice(index, 1);
        },
        // 新增一行
        addAttribute (index) {
            if (this.selectedAttributes.length === this.allAttributes.length) {
                this.$toast(this.$t('contact.totalNumber'), 'warn');
                return;
            }
            this.selectedAttributes.splice(index + 1, 0, { id: '', name: '', meaning: '', value: '' });
        },
        createNew () {
            this.createNewCustomer = true;
            this.getAttributes();
            this.fetchLabelGroups();
            this.clearData();
        },
        clearData () {
            this.labelSource = 'use';
            this.tags = [];
            this.checkedlabel = [];
        },

        //通用方法 下拉菜单的收起
        eventListener () {
            this.hiddenFlag = false;
        }
    },
    destroyed () {
        window.removeEventListener('click', this.eventListener);
    }

};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../../common/scss/base/variables";
@import "../../common/scss/base/mixin";

.customer-form {
    .create-user-list {
        padding: 4px 0;
        margin-top: 0;

        &:hover {
            background-color: rgba($theme, 0.2);

            .add-icon,
            .delete-icon {
                visibility: visible;
            }
        }

        .add-icon,
        .delete-icon {
            visibility: hidden;
        }

        .add-icon {
            font-size: 16px;
            color: $light-green;
            margin-left: 6px;
            cursor: pointer;
            vertical-align: middle;
            @include user-select(none);
        }

        .delete-icon {
            font-size: 16px;
            color: $light-red;
            margin-left: 6px;
            cursor: pointer;
            vertical-align: middle;
            @include user-select(none);
        }
    }

    .save-success {
        text-align: center;

        .success-icon {
            width: 20px;
            height: 20px;
            fill: $theme;
            margin-bottom: 8px;
        }

        h5 {
            margin-bottom: $input-field-height;
        }
    }

    .selector-tree {
        width: 376px;
    }
    .create-tag {
        position: relative;
        display: flex;
        .icon-setting {
            width: 16px;
            height: 16px;
            fill: $color-content;
        }
        .new-labels-list {
            position: absolute;
            top: 30px;
            right: -110px;
            border: 1px solid $form-border;
            padding: 10px;
            background-color: white;
            height: 200px;
            overflow-y: scroll;
            z-index: 10;
            .icon-help {
                width: 12px;
                height: 12px;
                vertical-align: middle;
            }
            .no-data {
                color: $disabled;
                font-style: italic;
                height: 28px;
                line-height: 28px;
                padding-left: 16px;
            }
        }
    }
}
</style>
