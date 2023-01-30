<template>
    <div class="material-menu">
        <!-- 头部标题 必填-->
        <div class="form-field">
            <label class="label">
                {{$t('wechatContent.headContent')}}
            </label>
            <input class="input full-width" :class="{ error: headErrText }" type="text" maxlength="50"
                v-model.trim="material.menuMessage.headContent" v-title:top.warn.line="headErrText"
                :placeholder="$t('wechatContent.hContentTips')" @focusin="resetErr('head')">
        </div>
        <!-- 选项内容 最多10项目 不可有空值 -->
        <template v-for="(uid, index) in uniqueMenus">
            <div class="form-field" :key="uid">
                <!-- 顺序生成的序号 -->
                <label class="label">
                    {{ `${$t('wechatContent.option')}${index + 1}` }}
                </label>
                <!-- 选项内容 -->
                <input class="input full-width" type="text" maxlength="50"
                    :class="{error: currentJudge(uid, 'content')}"
                    v-model.trim="material.menuMessage.options[index].content" :placeholder="$t('contact.textInput')"
                    v-title:top.warn.line="currentJudge(uid, 'content') ? emptyTips : ''"
                    @focusin="resetErr('content', currentJudge(uid, 'content'))">
                <!-- Pall中国用户限定 标签分组和标签选项 -->
                <template v-if="isPallUser && !isCustomMenu">
                    <selector class="md-lg" :class="{error: currentJudge(uid, 'group')}" :options="groupList"
                        :value="material.menuMessage.options[index].groupId"
                        v-title:top.warn.line="currentJudge(uid, 'group') ? emptyTips : ''"
                        @input="handleGroup($event, material.menuMessage.options[index])"
                        @click="resetErr('group', currentJudge(uid, 'group'))" v-click-into-view.center search />
                    <selector class="md-lg" :class="{error: currentJudge(uid, 'label')}" :options="material.menuMessage.options[index].groupId
                        && groupList.$getByKey(material.menuMessage.options[index].groupId) ? 
                        groupList.$getByKey(material.menuMessage.options[index].groupId).labelList : []"
                        :value="material.menuMessage.options[index].labelId"
                        v-title:top.warn.line="currentJudge(uid, 'label') ? emptyTips : ''"
                        @input="handleLabel($event, material.menuMessage.options[index])"
                        @click="resetErr('label', currentJudge(uid, 'label'))" v-click-into-view.center search />
                </template>
                <!-- 删除单条选项，2个选项以上有效 -->
                <span class="icon icon-iconless"
                    :class="{ 'icon-disabled': !(material.menuMessage.options && material.menuMessage.options.length > 1) }"
                    @click="delItem(uid)" />
                <!-- 添加选项，最多10个 -->
                <span v-if="material.menuMessage.options 
                    && material.menuMessage.options.length < 10 
                    && index === material.menuMessage.options.length - 1 " class="icon icon-tianjia"
                    @click="addItem" />
            </div>
        </template>
        <!-- 尾部内容 非必填 -->
        <div class="form-field">
            <label class="label" for="title">
                {{$t('wechatContent.tailContent')}}
            </label>
            <input class="input full-width" type="text" maxlength="50" v-model.trim="material.menuMessage.tailContent"
                :placeholder="$t('wechatContent.tContentTips')">
        </div>
    </div>
</template>

<script>
import { ContactApiV1 } from '@/api';
import { uniqueId } from 'lodash';
import { mapGetters } from 'vuex';

export default {
    name: 'material-menu',
    props: {
        material: {
            type: Object,
        },
        //是否是自定义菜单进入
        isCustomMenu: {
            type: Boolean,
            defalut: false
        }
    },
    data () {
        return {
            // 源数组的dummy数组
            uniqueMenus: [],
            // 头部内容报错信息
            headErrText: '',
            // 选项内容报错index
            optionErrId: null,
            // Pall中国限定 所有标签分组列表
            groupList: [],
            // 当前错误选项的类型，普通用户只有content一种类型，Pall中国用户有 group, label
            optionErrType: 'content',
            // 当前错误选项的提示语
            emptyTips: this.$t('wechatContent.option') + ' ' + this.$t('menu.emptyError')
        };
    },
    computed: {
        ...mapGetters([
            'isPallUser',
        ]),
    },
    mounted () {
        this.uniqueMenus = this.material.menuMessage.options.map(() => uniqueId());
        // pall中国用户，获取标签分组
        if (this.isPallUser && !this.isCustomMenu) {
            ContactApiV1
                .getGroupsOld()
                .then(({ body: { data: { groupList } } }) => {
                    this.groupList = groupList[0].groupList;
                    if (this.material
                        && this.material.menuMessage
                        && this.material.menuMessage.options
                        && this.material.menuMessage.options.length > 0
                        && this.material.menuMessage.options[0].groupId
                        && this.material.menuMessage.options[0].labelId
                    ) {
                        // 校验所有选项的分组和标签是否存在，如果不存在，提示重新选择并清除失效groupId或labelId
                        let count = 0;
                        this.material.menuMessage.options.forEach(item => {
                            if (!this.groupList.$getByKey(item.groupId)) {
                                item.groupId = null;
                                item.labelId = null;
                                count++;
                            } else if (!this.groupList.$getByKey(item.groupId) ||
                                !this.groupList.$getByKey(item.groupId).labelList ||
                                !this.groupList.$getByKey(item.groupId).labelList.$getByKey(item.labelId)) {
                                item.labelId = null;
                                count++;
                            }
                        });
                        if (count > 0) {
                            this.$toast(this.$t('wechatContent.invalidTips'), 'warn');
                        }
                    }
                });
        }
    },
    methods: {
        /**
         * 添加选项
         */
        addItem () {
            this.uniqueMenus.push(uniqueId());
            this.material.menuMessage.options.push({
                content: '',
            });
        },
        /**
         * 删除选项
         * @description 根据目标uid，删除对应选项，如果目标有校验提示，则清空校验状态
         * @param {number} uid 目标在dummy数组中对应的uid
         */
        delItem (uid) {
            if (this.material.menuMessage.options && this.material.menuMessage.options.length > 1) {
                this.$confirm(this.$t('common.delete'), this.$t('wechatContent.delTips'))
                    .then(sure => {
                        if (sure) {
                            const dummyIndex = this.uniqueMenus.findIndex(e => e === uid);
                            this.uniqueMenus.splice(dummyIndex, 1);
                            this.material.menuMessage.options.splice(dummyIndex, 1);
                            // 如果删除了有错误提示的选项，直接清空状态
                            if (uid === this.optionErrId) {
                                this.optionErrId = null;
                                if (this.isPallUser) {
                                    this.optionErrType = 'content';
                                }
                            }
                        }
                    });
            }
        },
        /**
         * 全局校验
         * @description 按照顺序校验整个表单必填内容，包括 头部内容，选项
         * @returns {boolean} 是否通过校验
         */
        valid () {
            if (this.material.menuMessage.headContent === '') {
                this.headErrText = this.$t('wechatContent.headContent') + ' ' + this.$t('menu.emptyError');
                return false;
            }
            if (!this.validMenus()) {
                return false;
            }
            return true;
        },
        /**
         * 校验选项
         * @description 校验所有选项内容，并高亮第一个空选项
         * @returns {boolean} 所有选项是否通过校验
         */
        validMenus () {
            if (this.isPallUser) {
                // Pall中国用户 校验选项-分组/标签
                const errIndex = this.material.menuMessage.options.findIndex(e => e.content === '' || !e.groupId || !e.labelId);
                this.optionErrId = this.uniqueMenus[errIndex];
                if (errIndex === -1) {
                    this.optionErrType = 'content';
                    return true;
                }
                const errItem = this.material.menuMessage.options[errIndex];
                if (errItem.content === '') {
                    this.optionErrType = 'content';
                } else if (!errItem.groupId) {
                    this.optionErrType = 'group';
                } else {
                    this.optionErrType = 'label';
                }
                return false;
            }
            // 其他所有用户
            const emptyIndex = this.material.menuMessage.options.findIndex(e => e.content === '');
            if (emptyIndex > -1) {
                this.optionErrId = this.uniqueMenus[emptyIndex];
                return false;
            }
            this.optionErrId = null;
            return true;
        },
        /**
         *  focusin触发时重置校验提示
         * @description 有校验报错的选项重新输入值时，清空校验状态
         * @param {string} type 需清空的类型 'head'头部内容，'option'选项内容
         * @param {boolean} isCur 当type==='option'时，判断当前输入项是否有校验提示
         * 
         */
        resetErr (type, isCur) {
            switch (type) {
                case 'head':
                    this.headErrText = '';
                    break;
                case 'content':
                    if (isCur) {
                        this.optionErrId = null;
                    }
                    break;
                case 'group':
                case 'label':
                    // Pall中国限定
                    if (isCur) {
                        this.optionErrId = null;
                        this.optionErrType = 'content';
                    }
                    break;
                default:
                    this.headErrText = '';
                    this.optionErrId = null;
                    this.optionErrType = 'content';
                    break;
            }
        },
        /**
         * Pall中国限定-选择分组
         * @param {string} e 输入结果
         * @param {string} target 操作目标对象
         * @param {boolean} isCur 当前输入项是否有校验提示
         */
        handleGroup (e, target) {
            this.$set(target, 'groupId', e);
            this.$set(target, 'labelId', null);
        },
        /**
         * Pall中国限定-选择分组下的标签
         * @param {string} e 输入结果
         * @param {string} target 操作目标对象
         * @param {boolean} isCur 当前输入项是否有校验提示
         */
        handleLabel (e, target) {
            this.$set(target, 'labelId', e);
        },
        /**
         * 当前高亮项判断
         * @param {number} uid 目标uid
         * @param {string} type 目标类型 content,group,label
         * 
         */
        currentJudge (uid, type) {
            return this.optionErrId === uid && this.optionErrType === type;
        }
    },

};
</script>

<style lang="scss">
.material-menu {
    box-sizing: border-box;
    padding: 10px 0;
    min-height: 245px;

    .icon {
        margin: 0 5px;
        font-size: 16px;
        line-height: 30px;
        vertical-align: middle;
        cursor: pointer;
        &.icon-tianjia {
            color: #0cc2a9;
        }
        &.icon-iconless {
            color: #f67d7d;
        }
        &.icon-disabled {
            cursor: not-allowed;
            color: unset;
        }
    }
    .form-field:not(.flex) > .input {
        width: 100%;
    }
}
</style>
