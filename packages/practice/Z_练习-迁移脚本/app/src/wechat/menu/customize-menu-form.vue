<template>
    <div class="personality-form roll">
        <div class="form-box">
            <div class="form-field slim" v-if="!menuLoading">
                <label class="label">{{ 'menu.editMenuName' | t }}</label>
                <input
                    type="text"
                    class="input rule-input"
                    :placeholder="$t('menu.menuTitle')"
                    v-model.trim="rule.title"
                    maxlength="255"
                />
            </div>
            <p v-else>{{ 'menu.loadContent' | t }}</p>
            <div class="form-field-wrapper" v-if="!menuLoading">
                <div class="label-form form-field">
                    <label class="label">{{ 'follower.tag' | t }}</label>
                    <selector class="inline" search :options="tags" v-model="rule.tagId"></selector>
                </div>

                <div class="form-field">
                    <label class="label">{{ 'menu.operating' | t }}</label>
                    <selector class="inline" :options="DEVICES_OPTIONS" v-model="rule.clientplatformtype"></selector>
                </div>
            </div>
        </div>
        <wechatEditor
            class="wechatEditor"
            :menuType="2"
            ref="wechatEditor"
            :menus="menuList"
            @addMenu="addMenu"
            @addSubMenu="addSubMenu"
            @delMenu="delMenu"
            @sortMenu="sortMenu"
            @saveMenu="saveMenu"
            @syncToWeChat="syncToWeChat"
        >
        </wechatEditor>
        <confirm
            :title="$t('common.notice')"
            v-if="noticeShow"
            @cancel="noticeShow = false"
            @confirm="noticeShow = false"
        >
            <p>{{ oneNonEmptyNotice }}</p>
        </confirm>
    </div>
</template>
<script type="text/babel">
import wechatEditor from './wechat-editor.vue';
import { I18N_STORE_NAME } from '@/locales';
import { WechatApiV1 } from '@/api';
import { trackEvent } from '../../monitor';

export default {
    data () {
        return {
            isActive: false,
            DEVICES_OPTIONS: [
                { id: '', name: this.$t('common.UnlimitCountry') },
                { id: 1, name: 'IOS' },
                { id: 2, name: 'Android' },
                { id: 3, name: 'Others' }
            ],
            tags: [{ id: '', name: this.$t('common.UnlimitCountry') }],
            tagId: '',
            rule: {
                id: '',
                title: '',
                sex: '',
                language: '',
                clientplatformtype: '',
                tagId: '',
                country: {},
                province: {},
                city: {},
                countryRemark: '',
                provinceRemark: '',
                cityRemark: ''
            },
            menuLoading: true,
            lastAreaSelect: {},      //回传给子组件的地区选择
            areaList: [],
            areaLoading: false,//地区选择显隐
            textContent: '',        // 文本输入内容
            fathersArr: [],
            ruleObj: {}, //保存规则时所传参数
            noticeShow: false,
            oneNonEmptyNotice: '',//规则全部选择的是"不限"时提示
            materialTypesWidth: null, // 类型栏宽度
            menuList: [],
            materialParent: null//子组件保存时传给父组件的值
        };
    },
    computed: {
        // 当前语言环境
        lang () {
            return this.$store.state[I18N_STORE_NAME].lang;
        }
    },
    mounted () {
        this.rule.id = ~~this.$route.params.ruleId;

        // 获取标签列表
        this.getUserTags();
        this.getMenusList();

        if (Number(this.rule.id) !== 0) {
            this.getRuleDetail();
        }
    },
    methods: {
        // 获取规则信息
        getRuleDetail () {
            WechatApiV1
                .menuMatchRuleOne(this.rule.id)
                .then(res => {
                    let TES = res.body.data.menuMatchRuleDTO;
                    this.rule.id = TES.id;
                    this.rule.title = TES.title;
                    this.rule.sex = '';
                    this.rule.language = '';
                    this.rule.clientplatformtype = TES.clientplatformtype || '';
                    this.rule.tagId = TES.tagId || '';
                    this.rule.countryRemark = '2';
                    this.rule.provinceRemark = '';
                    this.rule.cityRemark = '';
                    this.rule.country = {};
                    this.rule.province = {};
                    this.rule.city = {};
                });
        },
        // 获取菜单列表
        getMenusList () {
            WechatApiV1
                .getMenusOfRule(this.rule.id)
                .then(({ body: { data } }) => {
                    const menuList = data.menuList;

                    const result = [];
                    // 1. find all parent menus, push them in this.menus;
                    let len = menuList.length;
                    while (len--) {
                        const menu = menuList[len];
                        if (!menu.materialId) menu.materialId = '';
                        if (!menu.content) menu.content = '';
                        if (!menu.parentId) {
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
                    this.menuLoading = false;
                    this.$refs.wechatEditor.menusLoading = false;
                });
        },
        // 添加一级菜单
        addMenus (newMenu) {
            this.menuList.push(newMenu);
            newMenu.menuMatchRuleId = this.rule.id;
            WechatApiV1
                .saveRuleMenu(newMenu)
                .then(({ body: { data: { id } } }) => {
                    newMenu.id = id;
                });
        },
        // 添加子菜单
        addSubMenus (parentMenu) {
            // 按需保存父菜单
            if (parentMenu.materialId || parentMenu.content || parentMenu.url) {
                parentMenu.materialId = '';
                parentMenu.content = '';
                parentMenu.url = '';
                parentMenu.material = null;
                parentMenu.menuMatchRuleId = this.rule.id;
                delete parentMenu.wxTagIds;

                WechatApiV1.saveRuleMenu(parentMenu);
            }

            const lth = parentMenu.children.length;
            const newSubMenu = {
                menuName: this.$t('menu.subMenuName'),
                sort: lth === 0 ? 1 : parentMenu.children[lth - 1].sort + 1,
                type: 2,
                url: '',
                parentId: parentMenu.id,
                pagepath: '',
                menuMatchRuleId: this.rule.id
            };

            // 保存子菜单
            WechatApiV1
                .saveRuleMenu(newSubMenu)
                .then(({ body: { data } }) => {
                    const wechatEditor = this.$refs.wechatEditor;
                    if (wechatEditor.editingMenu.parentId === 0) {
                        wechatEditor.editingMenu.children.push(data);
                        wechatEditor.temporaryMenu.children.push(data);
                    }
                    parentMenu.children.push(data);

                });
        },

        // 规则并校验 添加一级菜单前校验/二级菜单前校验/保存并同步到微信
        saveRule () {
            return new Promise((resolve, reject) => {
                if (this.rule.title === '') {
                    this.$toast(this.$t('menu.ruleTitle'), 'warn');
                    reject();
                    return;
                }
                if (this.rule.sex === '' && this.rule.language === '' &&
                    this.rule.clientplatformtype === '' && this.rule.tagId === '' && this.rule.countryRemark === '') {
                    this.oneNonEmptyNotice = this.$t('menu.oneNonEmpty');
                    this.noticeShow = true;
                    reject();
                }
                let cou = this.lang === 'en' ? this.rule.country.enName : this.rule.country.znName;
                let pro = this.rule.province ?
                    (this.lang === 'en' ? this.rule.province.enName : this.rule.province.znName) : '';
                let cy = this.rule.city ?
                    (this.lang === 'en' ? this.rule.city.enName : this.rule.city.znName) : '';
                let ruleId = this.rule.id === 0 ? '' : this.rule.id;
                this.ruleObj = {
                    id: ruleId,
                    title: this.rule.title,
                    sex: this.rule.sex === '' ? null : this.rule.sex,
                    language: this.rule.language === '' ? null : this.rule.language,
                    clientplatformtype: this.rule.clientplatformtype === '' ? null : this.rule.clientplatformtype,
                    tagId: this.rule.tagId === '' ? null : this.rule.tagId,
                    country: cou !== this.$t('common.UnlimitCountry') ? cou : null,
                    province: pro,
                    city: cy,
                    countryRemark: this.rule.countryRemark || '',
                    provinceRemark: this.rule.provinceRemark || '',
                    cityRemark: this.rule.cityRemark || '',
                };
                resolve();
            });
        },
        // 校验并添加一级菜单
        addMenu (newMenu) {
            this.saveRule().then(() => {
                WechatApiV1
                    .putMenuRule(this.ruleObj)
                    .then(({ body: { data: { data: id } } }) => {
                        if (this.rule.id === 0) {//首次创建规则
                            this.rule.id = id;
                        }
                        this.addMenus(newMenu);
                    });
            });
        },
        // 校验并添加二级菜单
        addSubMenu (parentMenu) {
            this.saveRule().then(() => {
                WechatApiV1
                    .putMenuRule(this.ruleObj)
                    .then(({ body: { data: { data: id } } }) => {
                        if (this.rule.id === 0) {//首次创建规则
                            this.rule.id = id;
                        }
                        this.addSubMenus(parentMenu);
                    });
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
        //排序时拖动调用的接口
        sortMenu (sortMap) {
            let obj = {
                menuMatchRuleId: this.rule.id,
                menuSort: sortMap
            };
            WechatApiV1
                .sortRuleMenu(obj)
                .catch(() => {
                    this.$toast(this.$t('menu.sortErr'), 'warn');
                });
        },
        //保存
        saveMenu (cb) {
            this.$loading();
            const wechatEditor = this.$refs.wechatEditor;

            WechatApiV1
                .saveRuleMenu(this.materialParent)
                .then(() => {
                    this.$loaded();
                    wechatEditor.temporaryMenu = Object.assign({}, wechatEditor.editingMenu);
                    wechatEditor.temporaryMaterial = Object.assign({}, wechatEditor.material);

                    this.getMenusList();
                    this.$toast(this.$t('common.saveSuccess'), 'success');
                    if (typeof cb === 'function') cb(true);
                })
                .catch(({ body }) => {
                    if (body.errorCode === 'wechat.code151') {
                        wechatEditor.resetTags();
                    }
                    this.$loaded();
                    if (typeof cb === 'function') cb(false);
                });
        },
        //保存并同步到微信
        syncToWeChat () {
            if (this.rule.title === '') {
                this.$toast(this.$t('menu.ruleTitle'), 'warn');
                return;
            }
            if (this.rule.sex === '' && this.rule.language === '' &&
                this.rule.clientplatformtype === '' && this.rule.tagId === ''
                /*eslint-disable-next-line*/
                && (this.rule.countryRemark == '2' || this.rule.countryRemark === '')) {
                this.$toast(this.$t('menu.atLeaseOneContent'), 'warn');
                return;
            }
            let cou = this.lang === 'en' ? this.rule.country.enName : this.rule.country.znName;
            let pro = this.rule.province ?
                (this.lang === 'en' ? this.rule.province.enName : this.rule.province.znName) : '';
            let cy = this.rule.city ?
                (this.lang === 'en' ? this.rule.city.enName : this.rule.city.znName) : '';
            this.ruleObj = {
                id: this.rule.id,
                title: this.rule.title,
                sex: this.rule.sex === '' ? null : this.rule.sex,
                language: this.rule.language === '' ? null : this.rule.language,
                clientplatformtype: this.rule.clientplatformtype === '' ? null : this.rule.clientplatformtype,
                tagId: this.rule.tagId === '' ? null : this.rule.tagId,
                country: cou !== this.$t('common.UnlimitCountry') ? cou : null,
                province: pro,
                city: cy,
                countryRemark: this.rule.countryRemark || '',
                provinceRemark: this.rule.provinceRemark || '',
                cityRemark: this.rule.cityRemark || '',
            };
            WechatApiV1
                .putMenuRule(this.ruleObj)
                .then(() => {
                    this.syncToWeChats();
                })
                .catch((err) => {
                    console.error(err);
                });
        },

        // 获取标签
        getUserTags () {
            this.tags = [{ id: '', name: this.$t('common.UnlimitCountry') }];
            WechatApiV1
                .getTagList()
                .then(res => {
                    res.body.data.tagList.map(item => {
                        let tag = {};
                        tag.name = item.name;
                        tag.id = item.id;
                        this.tags.push(tag);
                    });
                });
        },
        // 同步到微信
        syncToWeChats () {
            const wechatEditor = this.$refs.wechatEditor;
            if (!this.$refs.wechatEditor.valid()) return;

            //有编辑内容时先保存后执行 同步接口
            if (wechatEditor.material.id || wechatEditor.editingMenu.id) {
                wechatEditor.saveContent((state) => {
                    if (state) {
                        this.wechartRequest();
                    }

                });
            } else {
                this.wechartRequest();
            }
        },
        // 同步微信接口
        wechartRequest () {
            // 同步到微信
            this.$refs.wechatEditor.syncing = true;
            this.$loading();
            WechatApiV1
                .syncOneRuleToWechat(this.rule.id)
                .then(() => {
                    this.$toast(this.$t('menu.synSuccess'), 'success');
                    this.$refs.wechatEditor.syncing = false;
                    setTimeout(() => {
                        this.$router.push({ name: 'customizeMenu' });
                    }, 30);
                    this.$loaded();
                })
                .catch(() => {
                    this.$refs.wechatEditor.syncing = false;
                    this.$loaded();
                });
        }
    },
    components: {
        wechatEditor
    }
};
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import '../../common/scss/base/variables';
@import '../../common/scss/base/mixin';
.personality-form {
    background-color: white;
    .clearfix:after {
        content: '.';
        height: 0;
        display: block;
        clear: both;
    }
    .wechatEditor {
        margin-top: 50px;
    }
    img.sorting {
        display: inline-block;
        vertical-align: top;
        margin-top: 16px;
        width: 16px;
        height: 16px;
    }

    .rule-input {
        width: 480px !important;
        height: 36px;
    }

    .form-field.slim {
        max-width: 600px;
    }

    .dmt-flex-horizontal {
        display: flex;
    }

    .rule-queries {
        > label {
            float: left;
            margin-right: 5px;
        }

        .vue-select {
            display: inline-block;
            width: 100px;

            .select-list {
                @include box-sizing();
            }
        }
    }
    .form-field-wrapper {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 10px;
        .label-form {
            margin-top: 12px;
        }
    }
    .area-wrapper {
        position: relative;
        width: 210px;
        .distpicker {
            position: absolute;
            z-index: 1;
        }
    }
}
</style>
