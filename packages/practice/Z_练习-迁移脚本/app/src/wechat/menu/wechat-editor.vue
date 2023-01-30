<template>
    <div class="diy-menu">
        <div class="form-box">
            <div class="menu-preview" v-if="!menusLoading">
                <div class="status-box" v-if="menuType === 1">
                    <div>{{ 'menu.status' | t }}{{ 'punctuation.colon' | t }} {{ menuStatus || '-' }}</div>
                    <div>{{ 'menu.updatetime' | t }}{{ 'punctuation.colon' | t }} {{ menuUpdateDate || '-' }}</div>
                </div>

                <!-- 手机展示 -->
                <div class="mobile-menu-preview">
                    <p class="mobile-head">
                        <span class="mobile-head-back">{{ 'common.back' | t }}</span>
                        {{ 'menu.userName' | t }}
                    </p>
                    <div class="mobile-body">
                        <ul class="menu-list">
                            <draggable
                                :list="menus"
                                :group="{ name: 'parent' }"
                                :disabled="!sorting"
                                :animation="300"
                                @change="sortMenu(menus)"
                            >
                                <li
                                    class="menu-item list-item"
                                    :class="[menus.length > 1 ? 'size3' : 'size2', { sorting }]"
                                    v-for="(menu, i) in menus"
                                    :key="i"
                                >
                                    <span
                                        class="menu-link"
                                        :class="{ active: activeParentId === menu.id }"
                                        @click="chooseMenu(menu)"
                                        :title="menu.menuName"
                                        >{{ menu.menuName }}</span
                                    >
                                    <ul class="sub-menu" v-if="activeParentId === menu.id">
                                        <draggable
                                            :list="menu.children"
                                            :group="{ name: 'children' }"
                                            :disabled="!sorting"
                                            :animation="300"
                                            @change="sortMenu(menu.children)"
                                        >
                                            <li
                                                v-for="(subMenu, i) in menu.children"
                                                class="sub-menu-name"
                                                :class="{ active: subMenu.id === activeChildId, sorting }"
                                                @click="chooseMenu(subMenu)"
                                                :key="i"
                                                :title="subMenu.menuName"
                                            >
                                                {{ subMenu.menuName }}
                                            </li>
                                        </draggable>
                                        <li
                                            v-if="menu.children.length < 5"
                                            class="add_menu"
                                            :class="{ 'icon-disable': $has('wechat_menu_add_menu') }"
                                            :title="$t('menu.max5submenu')"
                                            @click="addSubMenu(false)"
                                        >
                                            +
                                        </li>
                                    </ul>
                                </li>
                            </draggable>
                            <li class="add-item list-item" v-if="menus.length < 3">
                                <a :title="$t('menu.max3submenu')" class="menu-link" @click="addMenu"> + </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- 手机展示end  -->

                <!-- 排序 -->
                <span
                    v-if="sorting"
                    class="sort-btn btn btn-md btn-round btn-theme-border"
                    @click="finishSort(editingMenu)"
                    >{{ 'menu.done' | t }}</span
                >
                <button
                    v-else
                    type="button"
                    class="sort-btn btn btn-md btn-round btn-theme-border"
                    :disabled="$has('wechat_menu_sort_menu') || menus.length === 0"
                    @click="sorting = true"
                >
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-sort"></use>
                    </svg>
                    {{ 'menu.menuOrder' | t }}
                </button>

                <!-- 同步按钮 -->
                <div class="form-panel">
                    <button
                        type="button"
                        class="btn btn-md btn-theme-border"
                        @click="pullShow = true"
                        :class="{ busy: pulling }"
                        :disabled="pulling || syncing"
                        v-if="menuType === 1"
                    >
                        <span v-if="!pulling" :title="$t('menu.pullFromWechat')">{{ 'menu.pullFromWechat' | t }}</span>
                        <span v-else :title="$t('menu.syncing')">{{ 'menu.syncing' | t }}</span>
                    </button>
                    <span
                        class="icon icon-help margin-right"
                        v-title:top="$t('menu.syncTip')"
                        v-if="menuType === 1"
                    ></span>
                    <button
                        type="button"
                        class="btn btn-md btn-theme-border"
                        @click="syncShow = true"
                        :class="{ busy: syncing }"
                        :disabled="$has('wechat_menu_save_syn') || syncing || pulling || menus.length === 0"
                    >
                        <span v-if="!syncing" :title="$t('menu.saveandSynchronize')">{{
                            'menu.saveandSynchronize' | t
                        }}</span>
                        <span v-else :title="$t('menu.saveandSynchronize')">{{ 'menu.syncing' | t }}</span>
                    </button>
                </div>
            </div>
            <p v-else class="disabled-text">{{ 'menu.validatePrepare' | t }}</p>

            <!-- 素材 -->
            <div class="menu-form" v-if="!menusLoading && editingMenu.id && !sorting">
                <div class="editor-menu">
                    <div class="inner-title">
                        <span>{{ 'menu.editMenu' | t }}</span>
                        <div class="del-menu">
                            <a
                                @click="delMenu"
                                class="delete"
                                :class="{ 'icon-disable': $has('wechat_menu_delete_menu') }"
                            >
                                <div class="icon icon-delete">
                                    <span>{{ 'common.del' | t }}</span>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="form-body">
                        <!-- 菜单名称 or 子菜单名称 -->
                        <div class="form-field">
                            <label
                                >{{ 'menu.menuName' | t }}
                                <i
                                    class="icon icon-yiwen1"
                                    v-title:bottom="menuType === 1 ? $t('menu.menuTipDiy') : $t('menu.menuTip')"
                                ></i>
                            </label>
                            <br />
                            <input
                                type="text"
                                v-model.trim="editingMenu.menuName"
                                class="input"
                                required
                                @input="testleth(editingMenu.menuName)"
                            />
                        </div>

                        <!-- 添加粉丝标签 -->
                        <div class="form-field" v-if="tagShow(material)">
                            <label>{{ 'menu.createTags' | t }} </label>
                            <br />
                            <selector uniqueKey="tagId" :options="tagsList" v-model="editingMenu.wxTagIds" search />
                        </div>

                        <!-- 发送消息or网页跳转 -->
                        <div class="form-field" v-if="isShowMenu">
                            <label>{{ 'menu.menuContent' | t }}</label>
                            <br />
                            <radio :source="2" v-model="radioSource" @valChange="selectMsg"
                                >{{ 'menu.sendMessage' | t }}
                            </radio>
                            &nbsp;<radio :source="1" v-model="radioSource" @valChange="selectMsg">
                                {{ 'menu.webRedirection' | t }}</radio
                            >
                        </div>
                        <!-- 发送消息or网页跳转end -->

                        <!-- 菜单内容 -->
                        <div class="form-field" v-if="isShowMenu">
                            <material-editor
                                class="send-message"
                                :types="types"
                                v-if="radioSource === 2"
                                ref="material"
                                :no-sub-materials="true"
                                v-model="material"
                                :max-width="materialTypesWidth"
                                :isCustomMenu="isCustomMenu"
                                :key="materialKey"
                                :urlMaxLth="1024"
                            />
                            <template v-else>
                                <label>{{ 'menu.website' | t }}</label>
                                <br />
                                <input
                                    type="text"
                                    class="input lg"
                                    :placeholder="$t('menu.httpStart')"
                                    @input="clearSendMessage"
                                    v-model.trim="editingMenu.url"
                                />
                                <p class="disabled-text">{{ 'menu.clickURL' | t }}</p>
                                <p class="disabled-text">{{ 'menu.createTagsTip' | t }}</p>
                            </template>
                        </div>
                        <!-- 菜单内容end -->
                    </div>
                </div>

                <span class="editor_arrow_wrp">
                    <i class="editor_arrow editor_arrow_out"></i>
                    <i class="editor_arrow editor_arrow_in"></i>
                </span>

                <!-- *文字,外部页,表单,小程序卡片,菜单消息支持创建添加标签，同时基于微信端事件推送，会存在未推送事件的可能 -->
                <p>{{ 'menu.saveTip' | t }}</p>

                <button class="pull-right btn btn-theme btn-md" @click="savePage">
                    {{ 'common.save' | t }}
                </button>
            </div>
            <div class="menu-form sorting" v-if="sorting">
                {{ 'menu.dragSort' | t }}
            </div>
        </div>

        <!-- 操作 -->
        <confirm
            v-if="syncShow"
            :size="'md'"
            :autoConfirm="false"
            :title="$t('common.notice')"
            @cancel="syncShow = false"
            @confirm="syncToWeChat"
        >
            {{ 'menu.syncNotice' | t }}
        </confirm>
        <confirm
            v-if="pullShow"
            :size="'md'"
            :autoConfirm="false"
            :title="$t('common.notice')"
            @cancel="pullShow = false"
            @confirm="pullToLocal"
        >
            {{ 'menu.pullNotice' | t }}
        </confirm>

        <!-- 跳转确认 -->
        <modal v-if="junpModal" :title="$t('menu.leaveConfirm')" @close="junpModal = false">
            <p>{{ 'menu.leaveConfirmTip' | t }}</p>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white" @click="junpModal = false">{{ 'common.cancel' | t }}</button>
                <button class="btn btn-md btn-theme" @click="handleConfirm">
                    {{ 'common.confirm' | t }}
                </button>
            </template>
        </modal>
    </div>
</template>
<script type="text/babel">

import { trackEvent } from '../../monitor';
import MaterialEditor from '../material/material-editor.vue';
import debounce from 'lodash/debounce';
import { uniqId } from '@/store/vuex/modules/canvasStore';
import { TAGANDWEBPAGE_NAME_REGEXP, COMMON_URL_REGEXP } from '@/common/utils/regs.js';
import objDeepEqual from '@/common/utils/objDeepEqual.js';
import { mapState } from 'vuex';
import { WechatApiV1 } from '@/api';
import { cutStr, menuRender, beforeSaveMaterial, emojiRender } from './wechat-editor';
import cloneDeep from 'lodash/cloneDeep';

export default {
    name: 'wechat-editor',
    components: {
        MaterialEditor
    },
    props: {
        menuType: {
            type: Number,
            defalut: 1// 1自定义，2个性化
        },
        menus: {
            type: Array,
            defalut: []
        }
    },
    data () {
        return {
            materialTypesWidth: null, // 类型栏宽度
            menusLoading: true,
            activeParentId: '',  // 选中父级的菜单序号
            activeChildId: '',  // 选中子级的菜单序号
            editingMenu: {}, // 菜单内容
            temporaryMenu: {},// 临时的菜单内容
            material: {}, // 素材内容
            temporaryMaterial: {},// 临时的素材内容
            // 扫码回复类型：1图片；2语音；3视频；5图文；'text'文本；6链接（外部页）；7表单；8小程序卡片 9菜单消息 10小程序
            types: [5, 'text', 1, 2, 3, 6, 7, 8, 9, 10],
            // 排序
            sorting: false,
            // 同步
            syncing: false,
            pulling: false, //拉取至本地
            syncShow: false, //确认弹窗
            pullShow: false, //确认弹窗
            menuStatus: '', // 状态 已同步至微信,已同步至本地
            menuUpdateDate: '', //最后更新时间
            radioSource: 2,//1：网页链接 2：发送消息
            materialKey: 0,
            isCustomMenu: true,//是否是自定义菜单进入
            saveMaterial: null, // 待保存的素材内容
            junpModal: false, // 跳转确认弹窗
            targetMenu: null, // 将要跳转的菜单
            tagsList: [], //粉丝标签列表
            isSubmit: false, // 是否提交
            selectId: '', // 当前选中的 子菜单id or 菜单id
        };
    },
    computed: {
        ...mapState({
            wechatId: state => state.user.authorizerInfoId,
        }),

        //是否显示‘菜单内容’
        isShowMenu () {
            const child = this.editingMenu.children;
            return !child || child.length === 0;
        },
        //是否子菜单
        isChild () {
            return this.editingMenu.parentId !== 0;
        }
    },
    watch: {
        'editingMenu.type' (val) {
            if (Number(val) !== 1) {
                this.radioSource = 2;
            } else {
                this.radioSource = 1;
            }
        },
        'material.type' () {
            if (this.material.type !== this.temporaryMaterial.type
                && this.editingMenu.wxTagIds) this.editingMenu.wxTagIds = '';
        }
    },
    created () {
        window.addEventListener('resize', this.countWindowWidth, false);
        this.$nextTick(() => {
            const width = window.innerWidth - 520;
            this.materialTypesWidth = width > 550 ? width : 550;
        });

        this.getTagsOptions();
    },
    mounted () {
        // 阻止火狐浏览器，IE浏览器,菜单拖拽防止信开页面
        document.body.ondrop = function (event) {
            event.preventDefault();
            event.stopPropagation();
        };
    },
    methods: {
        objDeepEqual, // 判断两个对象是否平等
        cutStr, // 截取指定字符数长度的文本 如果后一个字符截取后超出指定的长度，将不会截取该字符
        menuRender, // 选中菜单后进行渲染
        beforeSaveMaterial, // 保存前，素材结构处理
        emojiRender, // emoji表情转换

        //粉丝标签是否展示
        tagShow (mtl) {
            const { children } = this.editingMenu;
            let show = true;

            if ((children && children.length !== 0) || !mtl || !mtl.type) return false;

            show = ['text', 6, 7, 8, 9].includes(mtl.type);
            return show;
        },

        //获取粉丝标签列表
        getTagsOptions () {
            WechatApiV1
                .getTagList()
                .then(({ body: { data } }) => {
                    this.tagsList = data.tagList;
                });
        },

        //粉丝标签失效时，重置标签列表以及清空选项
        resetTags () {
            this.getTagsOptions();
            this.editingMenu.wxTagIds = '';
        },

        /**
         * 菜单名称可输入数量限制
         * 1.自定义菜单：没有子菜单时，主菜单字节限制上限为60，如果有则为16，子菜单为60。
         * 2.个性化菜单：没有子菜单时，主菜单字节限制上限为40，如果有则为16，子菜单为40
         */
        testleth (data) {
            const { children } = this.editingMenu;

            // 自定义子菜单字节数最多可输入60 ，个性化菜单字节数最多可输入40
            const num = this.menuType === 1 ? 60 : 40;
            const num1 = (children && children.length) ? 16 : num;

            this.editingMenu.menuName = this.cutStr(data, this.isChild ? num : num1);
        },

        //菜单内容类型切换
        selectMsg (radioSource) {
            if (radioSource === this.radioSource) return;

            this.editingMenu.type = this.radioSource;
            this.editingMenu.url = '';

            this.material = {
                id: this.editingMenu.id,
                type: this.radioSource === 1 ? 1 : 5,
                sort: this.editingMenu.sort,
                parentId: this.editingMenu.parentId,
                children: this.editingMenu.children
            };

        },

        countWindowWidth: debounce(function () {
            const width = window.innerWidth - 520;
            this.materialTypesWidth = width > 550 ? width : 550;
        }),

        // 添加一级菜单
        addMenu () {
            const lth = this.menus.length;
            this.$emit('addMenu', {
                type: 2,
                url: '',
                parentId: 0,
                menuName: this.$t('menu.menuName'),
                materialId: '',
                content: '',
                sort: lth === 0 ? 1 : this.menus[lth - 1].sort + 1,
                children: [],
                pagepath: ''
            });
        },

        // 排序结束时保留菜单内容
        finishSort () {
            this.$toast(this.$t('common.saveSuccess'), 'success');
            this.sorting = false;
        },

        /**
         * 添加子菜单
         * isJudgment 是否跳过判断
         */
        addSubMenu (isJudgment) {

            if (!this.menuIsChange() && !isJudgment && this.editingMenu.parentId === 0) {
                this.jumpModalOpen();
                return;
            }

            const parentMenu = this.menus.$getByKey(this.activeParentId);

            //如果在添加子菜单前 选中的是主菜单，则将主菜的名称的长度缩短为16个字节
            if (this.temporaryMenu.children) {
                this.temporaryMenu.menuName = this.editingMenu.menuName =
                    parentMenu.menuName = this.cutStr(parentMenu.menuName, 16);
            }

            this.$emit('addSubMenu', parentMenu);
        },

        // 添加子菜单前,判断当前页面是否有改动
        menuIsChange () {

            let valid = false;

            //跳转表单，回复样式为‘回复外部页’单独处理
            const { type, formReplyType } = this.temporaryMaterial;

            if (type === 7 && formReplyType === 'external') {

                const { id, materialCoverId, externalTitle, externalDescription, name }
                    = this.temporaryMaterial;
                const { wxTagIds, menuName } = this.editingMenu;

                if (id === this.material.id && materialCoverId === this.material.materialCoverId
                    && externalTitle === this.material.externalTitle
                    && externalDescription === this.material.externalDescription
                    && name === this.material.name
                    && wxTagIds === this.temporaryMenu.wxTagIds
                    && menuName === this.temporaryMenu.menuName) {
                    valid = true;
                }
            } else {
                const { parentId, menuName, id, children } = this.temporaryMenu;

                if (parentId === 0) {
                    if (children.length) {
                        valid = id === this.editingMenu.id
                            && menuName === this.editingMenu.menuName;
                    } else {
                        valid = this.objDeepEqual(this.material, this.temporaryMaterial)
                            && this.menuEqual();
                    }
                } else {
                    valid = this.objDeepEqual(this.material, this.temporaryMaterial)
                        && this.menuEqual();
                }
            }
            return valid;
        },

        /**
         * 选择菜单
         * targetMenu 当前选中的菜单内容
         */
        chooseMenu (menu) {
            if (menu.id === this.editingMenu.id) return;

            if ((this.activeChildId || this.activeParentId) && this.editingMenu.id) {
                this.deepEqual(menu);
            } else {
                this.chooseMenuAfter(menu);
            }
        },

        /**
         * 判断内容是否有变动
         * targetMenu ：菜单信息
         */
        deepEqual (targetMenu) {
            this.menuIsChange() ? this.chooseMenuAfter(targetMenu) : this.jumpModalOpen(targetMenu);
        },

        //判断菜单名称 、标签、链接
        menuEqual () {
            const { wxTagIds, menuName, url } = this.temporaryMenu;
            const { wxTagIds: id, menuName: name, url: editUrl } = this.editingMenu;

            //发送消息
            if (this.radioSource === 2) {
                return (wxTagIds === id && menuName === name);
            }
            return (url === editUrl && menuName === name);
        },

        /**
         * 打开跳转确认页面
         * menu 选中的菜单信息，如果没有值则表示是点击了添加按钮
         */
        jumpModalOpen (menu) {
            this.junpModal = true;
            this.targetMenu = menu;
        },

        /**
         * 选中菜单的逻辑
         * targetMenu ：菜单信息
         */
        chooseMenuAfter (targetMenu) {
            this.materialKey = uniqId();

            //切换前判断菜单名称是否为空
            if (this.editingMenu.menuName && this.editingMenu.menuName.trim() === '') {
                this.$toast(this.$t('menu.nameEmptyError'), 'warn');
                return;
            }

            this.material = {};
            this.temporaryMaterial = {};

            if (targetMenu.parentId === 0) {
                this.activeParentId = targetMenu.id;
                this.activeChildId = '';
            } else {
                this.activeChildId = targetMenu.id;
            }

            if (targetMenu.wxTagIds && (targetMenu.wxTagIds instanceof Array)) {
                targetMenu.wxTagIds = targetMenu.wxTagIds[0];
            }

            this.editingMenu = cloneDeep(targetMenu);
            this.temporaryMenu = cloneDeep(targetMenu);
            this.materialTypeJudge(cloneDeep(targetMenu));
        },

        //根据消息类型渲染素材界面
        materialTypeJudge (targetMenu) {
            if (targetMenu.children !== (void 0) && targetMenu.children.length > 0) return;

            // 网页链接 
            if (targetMenu.type === 1) {
                this.editingMenu = targetMenu;
                this.radioSource = 1;
            } else {
                //其它类型的素材
                this.material = cloneDeep(this.menuRender(targetMenu));
                this.temporaryMaterial = cloneDeep(this.material);
            }
        },
        clearSendMessage () {
            this.material = {};
        },
        // 删除当前菜单
        delMenu () {
            this.$confirm(this.$t('common.del'), this.$t('menu.delMenu'))
                .then(sure => {
                    if (sure) {
                        this.material = {};
                        this.$emit('delMenu');
                    }
                });
        },

        //排序时拖动调用的接口
        sortMenu (menus) {
            const sortMap = {};
            const parentId = menus[0].parentId;
            menus.forEach((menu, index) => {
                const id = menu.id;
                const sort = index + 1;
                sortMap[id] = sort;
                if (parentId) { // sorting sub menus
                    let parent = this.menus.$getByKey(parentId);
                    let child = parent.children.$getByKey(id);
                    child.sort = sort;
                } else {    // sorting parent menus
                    let menu = this.menus.$getByKey(id);
                    menu.sort = sort;
                }
                if (this.editingMenu.id === id)
                    this.editingMenu.sort = sort;
            });
            trackEvent('微信管理-菜单管理-菜单排序');
            this.$emit('sortMenu', sortMap);
        },

        // 保存
        saveContent (cb) {
            let material = this.beforeSaveMaterial(this.editingMenu, this.material, this.radioSource);
            const { id, parentId, sort, wxTagIds } = this.editingMenu;

            material.id = id;
            material.parentId = parentId;
            material.menuType = this.menuType;
            material.sort = sort;

            // 个性化菜单 获取menuMatchRuleId
            if (this.menuType === 2) {
                material.menuMatchRuleId = this.$parent.rule.id;
            }

            // 表情转换 
            if (material.content) {
                this.emojiRender(material);
            }


            material.tagIds = [];

            if (wxTagIds) {
                const res = this.tagsList.filter(e => e.tagId === wxTagIds);
                if (res.length) material.tagIds.push(res[0].id);
            }

            delete material.wxTagIds;

            this.$parent.materialParent = material;
            this.$emit('saveMenu', cb);
        },

        // 点击保存按钮触发
        savePage () {
            if (this.isSubmit) return;
            if (!this.validForm()) return;
            this.isSubmit = true;
            this.saveContent((state) => {
                this.isSubmit = false;
                if (state) {
                    this.savePageAfter();
                    this.$toast(this.$t('common.saveSuccess'), 'success');
                }
            });
        },

        // 保存数据后的操作
        savePageAfter () {
            this.temporaryMenu = cloneDeep(this.editingMenu);
            this.temporaryMaterial = cloneDeep(this.material);
        },

        // 同步到本地
        pullToLocal () {
            this.pulling = true;
            this.pullShow = false;
            this.$loading();
            this.$emit('pullToLocal');
        },

        //校验当前编辑菜单(this.material)中的内容
        validForm () {
            if (!this.editingMenu.id) return false;
            let valid = true;
            let m = cloneDeep(this.material);
            const { menuName, id } = this.editingMenu;

            //判断是否是网页链接
            if (this.radioSource === 1) {
                m = this.editingMenu;
            }

            m.menuName = menuName;
            m.menuId = id;
            this.excludeId = '';
            valid = this.validContent(m, true);
            this.excludeId = id;

            return valid;
        },

        //提交前的校验
        valid () {
            let valid = true;
            //校验当前编辑菜单(this.material)中的内容
            if (!this.validForm() && (this.editingMenu.id || this.editingMenu.id === 0)) {
                return false;
            }

            //校验所有菜单(this.menus)中的内容
            for (let menu of this.menus) {
                //有子级
                if (menu.children && menu.children.length > 0) {
                    if (menu.menuName && menu.menuName.trim() === '') {
                        this.$toast(this.$t('menu.nameEmptyError'), 'warn');
                        return false;
                    }
                    for (let m of menu.children) {
                        if (!this.validContent(m)) {
                            return false;
                        }
                    }
                } else {
                    //无子级
                    if (!this.validContent(menu)) {
                        return false;
                    }
                }
            }
            return valid;
        },

        //根据id 获取菜单名称
        getNameById (id) {
            let name = '';

            this.menus.forEach(e => {
                if (e.id === id) {
                    name = e.menuName;
                } else {
                    e.children.forEach(ele => {
                        if (ele.id === id) name = ele.menuName;
                    });
                }
            });

            return name;
        },

        //校验的内容
        /**
         * isForm 是否检验当前菜单的内容
         */
        validContent (menu, isForm) {
            if (menu.id && this.excludeId === menu.id) return true;

            const menuName = this.$t('menu.menuName');

            const $menuName = `【${this.getNameById(menu.menuId) || menu.menuName}】`;

            const isHttp = /^https?:\/\/[^.]*\..*/;//判断是否是http开头

            if (!menu.menuName) {
                this.$toast(menuName + ':' + $menuName + ',' + this.$t('menu.nameEmptyError'), 'warn');
                return false;
            }

            //判断是否是网页跳转
            if ((menu.type === 1 && !isForm) || (this.radioSource === 1 && isForm)) {
                if (!menu.url) {
                    this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.pageAddress')), 'warn');
                    return false;
                }
                if (!isHttp.test(menu.url)) {
                    this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.fillCorrectAddress')), 'warn');
                    return false;
                }
            } else {
                if (isForm) {
                    //图片、图文消息
                    if ([1, 5].includes(menu.type)) {
                        if (!menu.url) {
                            this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.chooseMaterial')), 'warn');
                            return false;
                        }
                    }
                    //音频、视频
                    if ([2, 3].includes(menu.type)) {
                        if (!menu.mediaId) {
                            this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.chooseMaterial')), 'warn');
                            return false;
                        }
                    }
                } else {
                    //图片、音频、视频、图文消息
                    if (menu.type === 2) {
                        if (!menu.material) {
                            this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.chooseMaterial')), 'warn');
                            return false;
                        }
                    }
                }

                //文字
                if (((menu.type === 3 && !isForm) || (menu.type === 'text' && isForm))
                    && (!menu.content || menu.content === '<div><br></div>')
                    && !menu.material) {
                    this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.fillText')), 'warn');
                    return false;
                }

                //外部页
                if (menu.type === 6) {
                    let exUrl = menu.exUrl;
                    let exTitle = menu.exTitle;
                    let url = menu.url;
                    if (!isForm) {
                        exUrl = menu.externalUrl;
                        exTitle = menu.externalTitle;
                        url = menu.externalImageUrl;
                    }

                    if (exUrl === '') {
                        this.$toast((menuName + ':' + $menuName + ',' +
                            this.$t('menu.emptyLink')), 'warn');
                        return false;
                    } else if (!COMMON_URL_REGEXP.test(exUrl)) {
                        this.$toast((menuName + ':' + $menuName + ',' +
                            this.$t('menu.badLink')), 'warn');
                        return false;
                    }

                    if (exTitle === '') {
                        this.$toast((menuName + ':' + $menuName + ',' +
                            this.$t('menu.titleEmpty')), 'warn');
                        return false;
                    } else if (!TAGANDWEBPAGE_NAME_REGEXP.test(exTitle)) {
                        this.$toast((menuName + ':' + $menuName + ',' +
                            this.$t('menu.titleInvalid')), 'warn');
                        return false;
                    }

                    if (!url) {
                        this.$toast((menuName + ':' + $menuName + ',' +
                            this.$t('menu.chooseMaterial')), 'warn');
                        return false;
                    }
                }

                //表单
                if (menu.type === 7) {
                    if (menu.formReplyType === 'external' && !menu.id) {

                        this.$toast((menuName + ':' + $menuName + ',' + this.$t('QRCode.validForm')), 'warn');
                        return false;
                    }

                    if (menu.formReplyType === 'sheet' && !menu.content) {
                        this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.pleaseAddAreply')), 'warn');
                        return false;
                    }
                }

                //小程序卡片
                if (menu.type === 8) {
                    let mediaId;
                    let name;
                    let imageUrl;

                    if (isForm) {
                        menu.appid = menu.miniprogramAppid;
                        menu.pagepath = menu.pagePath;
                        mediaId = menu.materialId;
                        name = menu.name;
                        imageUrl = menu.url;
                    } else {
                        mediaId = menu.material ? menu.material.mediaId : '';
                        name = menu.material ? menu.material.name : '';
                        imageUrl = menu.material ? menu.material.url : '';
                    }
                    if (!menu.miniprogramTitle) {
                        this.$toast((menuName + ':' + $menuName + ','
                            + this.$t('wechatContent.enterMiniCardTitle')), 'warn');
                        return false;
                    }

                    if (!menu.miniprogramAppid && !menu.appid) {
                        this.$toast((menuName + ':' + $menuName + ','
                            + this.$t('wechatContent.enterAppid')), 'warn');
                        return false;
                    }

                    if (!menu.pagepath) {
                        this.$toast((menuName + ':' + $menuName + ','
                            + this.$t('wechatContent.enterAppPath')), 'warn');
                        return false;
                    }

                    if (!mediaId || !name || !imageUrl) {
                        this.$toast((menuName + ':' + $menuName + ','
                            + this.$t('QRCode.selectCoverMaterial')), 'warn');
                        return false;
                    }
                }

                //菜单
                if (menu.type === 9) {
                    if (menu.menuMessage.headContent === '') {
                        this.$toast((menuName + ':' + $menuName + ',' +
                            this.$t('wechatContent.headContent') + this.$t('menu.emptyError')), 'warn');
                        return false;
                    }
                }

                //小程序
                if (menu.type === 10) {
                    if (!menu.miniprogramAppid && !menu.appid) {
                        this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.fillAppid')), 'warn');
                        return false;
                    }

                    if (!menu.pagePath && !menu.pagepath) {
                        this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.fillAppPath')), 'warn');
                        return false;
                    }

                    if (!menu.weChatUrl) {
                        this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.fillUrl')), 'warn');
                        return false;
                    }

                    if (!isHttp.test(menu.weChatUrl)) {
                        this.$toast((menuName + ':' + $menuName + ',' + this.$t('menu.fillCorrectUrl')), 'warn');
                        return false;
                    }

                }
            }
            return true;
        },
        // 保存并同步到微信
        syncToWeChat () {
            this.syncShow = false;
            //表单校验
            this.$emit('syncToWeChat');
        },

        // 跳转确认
        handleConfirm () {
            this.junpModal = false;
            this.targetMenu ? this.chooseMenuAfter(this.targetMenu) : this.addSubMenu(true);
        }
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';

.diy-menu {
    min-width: 1100px;

    .form-box {
        display: flex;
    }

    .menu-preview {
        position: relative;
        float: left;
        margin-right: 12px;

        .mobile-menu-preview {
            margin: 0 auto;
            position: relative;
            width: 317px;
            height: 580px;
            border: 1px solid #e7e7eb;
            background: url('bg_mobile_head.png') top no-repeat;

            .mobile-head {
                position: relative;
                text-align: center;
                padding-top: 20px;
                line-height: 44px;
                font-size: 15px;
                width: auto;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                word-wrap: normal;
                margin: 0 30px;
                color: white;
            }

            .mobile-head-back {
                position: absolute;
                left: 0;
                bottom: 0;
            }

            .menu-list {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding-left: 43px;
                border-top: 1px solid #e7e7eb;
                background: url('bg_mobile_foot.png');

                li {
                    cursor: pointer;

                    &.sorting {
                        cursor: move;
                    }
                }

                .menu-item {
                    position: relative;
                    float: left;
                    text-align: center;
                    line-height: 50px;

                    .menu-link {
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        display: block;
                        height: 48px;
                        line-height: 48px;
                        border: 1px solid $border-color;
                        color: #333;
                        @include transition();

                        &.active {
                            border-color: $green;
                            background-color: white;
                        }
                    }

                    .sub-menu {
                        position: absolute;
                        bottom: 60px;
                        left: 0;
                        right: 0;

                        .sub-menu-name {
                            min-height: 48px;
                        }

                        .add_menu {
                            font-size: 25px;

                            &.active {
                                border: 1px solid $green !important;
                                color: #17f9a8;

                                &:after {
                                    border-bottom: 1px solid #17f9a8;
                                    border-right: 1px solid #17f9a8;
                                    background-color: #fafafa;
                                }
                            }
                        }

                        li {
                            z-index: 2;
                            line-height: 44px;
                            border: 1px solid #e7e7eb;
                            background-color: #fafafa;
                            @include ellipsis();

                            &:nth-last-of-type(1) {
                                &:after {
                                    content: '';
                                    position: absolute;
                                    bottom: -10px;
                                    left: 50%;
                                    width: 10px;
                                    height: 10px;
                                    z-index: 2;
                                    border-bottom: 1px solid #e7e7eb;
                                    border-right: 1px solid #e7e7eb;
                                    background-color: #fafafa;
                                    @include transform(rotate(45deg) translateX(-50%));
                                }

                                &.active {
                                    border-color: $green;

                                    &:after {
                                        border-bottom: 1px solid $green;
                                        border-right: 1px solid $green;
                                        background-color: #fafafa;
                                    }
                                }
                            }

                            &.active {
                                border-color: $green;
                            }
                        }
                    }
                }

                .list-item {
                    line-height: 50px;
                    text-align: center;

                    a {
                        display: block;
                        width: auto;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        word-wrap: normal;
                        color: #616161;
                        text-decoration: none;
                    }
                }

                .add-item {
                    float: none;
                    width: auto;
                    overflow: hidden;

                    a {
                        font-size: 18px;
                        font-weight: bolder;
                        border-left: 1px solid #e7e7ed;
                    }

                    .add-menu {
                        font-size: 14px;
                        color: #3b9641;
                    }
                }

                .item-null {
                    border: 1px solid #3b9641;

                    .menu-link {
                        color: #3b9641;
                    }
                }

                .size2 {
                    width: 50%;
                }

                .size3 {
                    width: 33.2%;
                }
            }
        }

        .sort-btn {
            display: block;
            width: 128px;
            margin: 15px auto 0;
        }
    }

    .menu-form {
        flex-grow: 1;
        display: inline-block;
        position: relative;
        vertical-align: top;

        &.sorting {
            text-align: center;
            line-height: 582px;
        }

        .editor-menu {
            position: relative;
            min-height: 560px;
            padding: 0 20px 5px;
            padding-bottom: 20px;
            background-color: #fff;
            border: 1px solid #e7e7eb;
            border-radius: 3px;
            -moz-border-radius: 3px;
            -webkit-border-radius: 3px;
            box-shadow: none;
            -moz-box-shadow: none;
            -webkit-box-shadow: none;

            .inner-title {
                padding: 9px 0;

                span {
                    float: left;
                    font-size: 14px;
                    line-height: 30px;
                }

                .del-menu {
                    text-align: right;

                    a.delete {
                        position: relative;
                        cursor: pointer;
                        display: inline-block;

                        div.icon {
                            width: 25px;
                            height: 25px;
                            border-radius: 50%;
                            text-align: center;
                            position: relative;
                            display: inline-block;
                            font-size: 14px;
                            line-height: 25px;
                            color: #999999;
                            border: 1px solid #cccccc;
                            -webkit-box-sizing: border-box;
                            -moz-box-sizing: border-box;
                            box-sizing: border-box;

                            &:hover {
                                cursor: pointer;
                                border: none;
                                color: #fff;
                                background: #d40000;

                                span {
                                    display: block;
                                }
                            }

                            span {
                                position: absolute;
                                bottom: -30px;
                                left: 50%;
                                margin-left: -20px;
                                width: 40px;
                                font-size: 12px;
                                line-height: 25px;
                                color: #fff;
                                background: #000;
                                @include border-radius(3px);
                                display: none;
                                z-index: 1;

                                &:after {
                                    position: absolute;
                                    top: 0;
                                    left: 50%;
                                    margin-top: -3px;
                                    margin-left: -3px;
                                    width: 6px;
                                    height: 6px;
                                    background: #000;
                                    @include transform(rotate(45deg));
                                    content: '';
                                }
                            }
                        }
                    }
                }
            }

            .form-body {
                margin-top: 15px;
            }
        }

        .editor_arrow_wrp {
            position: absolute;
            left: 0;
            top: 545px;
        }

        .editor_arrow {
            position: absolute;
            display: inline-block;
            width: 0;
            height: 0;
            border-width: 12px 12px 12px 0;
            border-style: solid;
            border-color: transparent #e7e7eb transparent;
        }

        .editor_arrow_in {
            left: -11px;
            border-right-color: #f4f5f9;
        }

        .editor_arrow_out {
            left: -12px;
        }

        > p {
            padding: 10px 20px;
        }
    }

    .form-panel {
        padding-top: 34px;
        padding-bottom: 22px;
        text-align: center;
        .margin-right {
            margin-right: 15px;
        }
        button {
            width: 142px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
    .status-box {
        width: 317px;
        margin: 0 auto;
        padding-bottom: 10px;
    }
}
</style>
