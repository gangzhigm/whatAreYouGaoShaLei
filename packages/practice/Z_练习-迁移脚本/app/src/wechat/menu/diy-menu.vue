<template>
    <wechatEditor
        :menuType="1"
        ref="wechatEditor"
        :menus="menuList"
        @addMenu="addMenu"
        @addSubMenu="addSubMenu"
        @delMenu="delMenu"
        @sortMenu="sortMenu"
        @saveMenu="saveMenu"
        @pullToLocal="pullToLocal"
        @syncToWeChat="syncToWeChat"
    >
    </wechatEditor>
</template>
<script>
import wechatEditor from './wechat-editor.vue';
import { WechatApiV1 } from '@/api';
import { trackEvent } from '../../monitor';
export default {
    components: {
        wechatEditor
    },
    data () {
        return {
            menuList: [],
            materialParent: null//子组件保存时传给父组件的值
        };
    },
    methods: {
        //获取菜单状态
        getMenuStatus () {
            WechatApiV1
                .getAuthorization()
                .then(res => {
                    if (res && res.body.data) {
                        this.$refs.wechatEditor.menuStatus = res.body.data.menuStatus ? this.$t('menu.pulled') : this.$t('menu.pushed');
                        this.$refs.wechatEditor.menuUpdateDate = res.body.data.menuUpdateDate;
                    }
                });
        },
        //获取菜单列表
        getMenus (callback) {
            WechatApiV1.getMenus()
                .then(({ body: { data } }) => {
                    const menuList = data.menuList;

                    const result = [];

                    // 1. find all parent menus, push them in this.menus;
                    let len = menuList.length;
                    while (len--) {
                        const menu = menuList[len];
                        if (!menu.materialId) menu.materialId = '';
                        if (!menu.content) menu.content = '';
                        if (menu.parentId === 0) {
                            menu.children = [];
                            result.push(menu);
                            menuList.splice(len, 1);
                        }
                    }
                    // 2. find all children
                    const parentIds = result.map(menu => menu.id);
                    menuList.forEach(menu => {
                        let index = parentIds.indexOf(menu.parentId);
                        if (result[index] && result[index].children) {
                            result[index].children.push(menu);
                        }
                    });

                    result.sort((a, b) => a.sort - b.sort);
                    result.forEach(pMenu => {
                        pMenu.children.sort((a, b) => a.sort - b.sort);
                    });

                    this.menuList = result;
                    this.$refs.wechatEditor.menusLoading = false;
                    callback && callback();
                });
        },
        //添加父级菜单
        addMenu (newMenu) {
            this.menuList.push(newMenu);
            WechatApiV1
                .saveMenu(newMenu)
                .then(res => {
                    newMenu.id = res.body.data.id;
                    trackEvent('微信管理-菜单管理-添加一级菜单');
                });
        },
        //添加子级菜单
        addSubMenu (parentMenu) {
            // 按需保存父菜单
            if (parentMenu.children && parentMenu.children.length === 0) {
                parentMenu.materialId = '';
                parentMenu.content = '';
                parentMenu.url = '';
                parentMenu.appid = '';
                parentMenu.material = null;
                parentMenu.pagepath = '';
                parentMenu.pagepath = '';
                WechatApiV1.saveMenu({
                    id: parentMenu.id,
                    menuName: parentMenu.menuName,
                    sort: parentMenu.sort,
                    parentId: parentMenu.parentId,
                    type: 2
                });
            }

            const lth = parentMenu.children.length;

            const newSubMenu = {
                menuName: this.$t('menu.subMenuName'),
                sort: lth === 0 ? 1 : parentMenu.children[lth - 1].sort + 1,
                type: 2,
                url: '',
                parentId: parentMenu.id,
                pagepath: ''
            };
            // 保存子菜单
            WechatApiV1
                .saveMenu(newSubMenu)
                .then(({ body: { data } }) => {
                    const wechatEditor = this.$refs.wechatEditor;
                    if (wechatEditor.editingMenu.parentId === 0) {
                        wechatEditor.editingMenu.children.push(data);
                        wechatEditor.temporaryMenu.children.push(data);
                    }
                    parentMenu.children.push(data);
                    trackEvent('微信管理-菜单管理-添加子菜单');
                });
        },
        //删除菜单
        delMenu () {
            const wechatEditor = this.$refs.wechatEditor;
            const editingMenu = wechatEditor.editingMenu;
            WechatApiV1.delMenu(editingMenu.id)
                .then(() => {
                    trackEvent('微信管理-菜单管理-删除菜单');
                    if (editingMenu.parentId === 0) {
                        this.menuList.$deleteByKey(wechatEditor.activeParentId);
                        wechatEditor.activeParentId = '';
                        wechatEditor.editingMenu.id = '';
                    } else {
                        let parent = this.menuList.$getByKey(wechatEditor.activeParentId);
                        let children = parent.children;
                        const menu = Object.assign({}, this.menuList.$getByKey(editingMenu.parentId));
                        children.$deleteByKey(editingMenu.id);
                        wechatEditor.activeChildId = '';
                        wechatEditor.editingMenu.id = '';
                        if (children.length === 0) {
                            wechatEditor.chooseMenuAfter(menu);
                        }
                    }
                });
        },
        //排序
        sortMenu (sortMap) {
            WechatApiV1
                .sortMenu(sortMap)
                .catch(() => {
                    this.$toast(this.$t('menu.sortErr'), 'warn');
                });
        },
        //保存
        saveMenu (cb) {
            this.$loading();
            const wechatEditor = this.$refs.wechatEditor;

            WechatApiV1
                .saveMenu(this.materialParent)
                .then(() => {
                    this.getMenus(() => {
                        this.$loaded();

                        wechatEditor.temporaryMenu = Object.assign({}, wechatEditor.editingMenu);
                        wechatEditor.temporaryMaterial = Object.assign({}, wechatEditor.material);

                        setTimeout(() => {
                            if (typeof cb === 'function') cb(true);
                        }, 500);
                    });
                })
                .catch(({ body }) => {
                    if (body.errorCode === 'wechat.code151') {
                        wechatEditor.resetTags();
                    }
                    this.$loaded();
                    if (typeof cb === 'function') cb(false);
                });
        },
        // 同步到本地
        pullToLocal () {
            WechatApiV1
                .syncToLocal()
                .then(() => {
                    this.$toast(this.$t('menu.synSuccess'), 'success');
                    this.$refs.wechatEditor.pulling = false;
                    setTimeout(() => {
                        location.reload();
                    }, 500);
                    this.$loaded();
                })
                .catch(() => {
                    this.$refs.wechatEditor.pulling = false;
                    this.$loaded();
                });
        },
        //保存并同步到微信
        syncToWeChat () {
            const wechatEditor = this.$refs.wechatEditor;
            if (!this.$refs.wechatEditor.valid()) return;

            //有编辑内容时先保存后执行 同步接口
            if (wechatEditor.material.id || wechatEditor.editingMenu.id) {
                wechatEditor.saveContent((state) => {
                    if (state) {
                        this.syncToWeChatAjax();
                    }
                });
            } else {
                this.syncToWeChatAjax();
            }
        },
        //保存并同步到微信接口
        syncToWeChatAjax () {
            this.$refs.wechatEditor.syncing = true;
            this.$loading();
            WechatApiV1
                .syncToWeChat()
                .then(() => {
                    this.$toast(this.$t('menu.synSuccess'), 'success');
                    this.$refs.wechatEditor.syncing = false;
                    this.getMenuStatus();
                    this.$loaded();
                    trackEvent('微信管理-菜单管理-保存并同步到微信');
                })
                .catch(() => {
                    this.$refs.wechatEditor.syncing = false;
                    this.$loaded();
                });
        }
    },
    mounted () {
        this.getMenuStatus();
        this.getMenus();
    }
};
</script>
