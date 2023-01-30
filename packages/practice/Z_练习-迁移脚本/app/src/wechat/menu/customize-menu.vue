<template>
    <div class="menu-rules">
<!--        同步微信个性化菜单 -->
<!--        <button class="btn btn-md btn-theme synchronize" v-if="listFlag" :disabled="syncIng" @click="syncWeChat">-->
<!--            {{'menu.syncWeChat' | t}}-->
<!--        </button>-->
        <div class="personality-body table" v-show="listFlag">
            <p class="content-header">{{'menu.personalizedMenu' | t}} <span class="icon icon-help" @click="showDescription = true"></span></p>
            <div class="opt">
                <div class="search-box search-name">
                    <input type="text" :placeholder="$t('menu.searchMenu')" v-model="searchName"  @keyup.enter="searchMenu">
                    <svg aria-hidden="true" @click="searchMenu">
                        <use xlink:href="#icon-search"></use>
                    </svg>
                </div>
                <button class="btn btn-md btn-theme icon icon-plus" :disabled="$has('wechat_menu_individuation_add')"
                        @click="createEmptyMenu">{{'menu.addMenu' | t}}</button>
            </div>
            <div class="simplify-table auto-width personalized-menu-table">
                <table>
                    <thead>
                        <tr>
                            <th>{{'menu.menuName' | t}}</th>
                            <th>{{'follower.tag' | t}}</th>
                            <th>
                                {{'contact.sex' | t}}
                                <div class="filter-box" v-blur="closeSex">
                                    <svg aria-hidden="true" @click="chooseSex = !chooseSex">
                                        <use v-bind:xlink:href="'#icon-' + (chooseSex ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                    </svg>
<!--                                    性别-->
                                    <transition name="drop">
                                        <div class="drop-list" v-if="chooseSex">
                                            <radio v-for="(item, index) in sexList" :key="index"
                                                   :source="index === 0 ? '' : (index === 1 ? -1 : index-1)" v-model="sex">{{item}}</radio>
                                        </div>
                                    </transition>
                                </div>
                            </th>
                            <th>
                                {{'menu.operating' | t}}
                                <div class="filter-box" v-blur="closeSystem">
                                    <svg aria-hidden="true" @click="chooseSystem = !chooseSystem">
                                        <use v-bind:xlink:href="'#icon-' + (chooseSystem ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                    </svg>
<!--                                    操作系统-->
                                    <transition name="drop">
                                        <div class="drop-list" v-if="chooseSystem">
                                                <radio v-for="(system, index) in systemList" :key="index"
                                                       :source="index === 0 ? '' : (index === 1 ? -1 : index-1)"
                                                       v-model="clientPlatFormType">{{system}}</radio>
                                        </div>
                                    </transition>
                                </div>
                            </th>
<!--                            语言-->
                            <th>
                                {{'follower.language' | t}}
                                <div class="filter-box" v-blur="closeLanguage">
                                    <svg aria-hidden="true" @click="chooseLanguage = !chooseLanguage">
                                        <use v-bind:xlink:href="'#icon-' + (chooseLanguage ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                    </svg>
                                    <transition name="drop">
                                        <div class="drop-list" v-if="chooseLanguage">
                                            <radio v-model="language" v-for="(item, index) in languageList" :key="index"
                                                   :source="item.id" @input="selectLanguage">
                                                {{item.name}}
                                            </radio>
                                        </div>
                                    </transition>
                                </div>
                            </th>
                            <th>
                                {{'follower.region' | t}}
                                <div class="filter-box" v-blur="closeArea">
                                    <svg aria-hidden="true" @click="selectRegion">
                                        <use v-bind:xlink:href="'#icon-' + (chooseArea ? 'shaixuan-tianchong' : 'shaixuan')"></use>
                                    </svg>
                                    <transition name="drop">
                                        <div class="drop-list" v-if="chooseArea">
                                            <regional-linkage @sureAreaSelect="emitCloseArea" :lastAreaSelect="lastAreaSelect"
                                                              :areaList="areaList" :btnFlag="true" :pageStatus="true"></regional-linkage>
                                        </div>
                                    </transition>
                                </div>
                            </th>
                            <th>
                                {{'menu.createdDate' | t}}
                                <button type="button" class="table-sort-button" :title="createDateTitle" @click="ListSort('createDate')">
                                    <svg aria-hidden="true" class="asc"
                                         :class="{active:  sortValue === 'createDate' && sortOrder === 0}">
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                    <svg aria-hidden="true" class="desc"
                                         :class="{active:  sortValue === 'createDate' && sortOrder === 1}">
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                </button>
                            </th>
                            <th>
                                {{'journeyList.updateTime' | t}}
                                <button type="button" class="table-sort-button" :title="$t('swarm.arrangedByUpdateTime')"
                                        @click="ListSort('updateDate')">
                                    <svg aria-hidden="true" class="asc"
                                         :class="{active:  sortValue === 'updateDate' && sortOrder === 0}">
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                    <svg aria-hidden="true" class="desc"
                                         :class="{active:  sortValue === 'updateDate' && sortOrder === 1}">
                                        <use xlink:href="#icon-caret-down"></use>
                                    </svg>
                                </button>
                            </th>
                            <th>{{'data.Actions' | t}}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="rules.length === 0">
                            <td colspan="12" class="slim-cell">
                                <list-empty/>
                            </td>
                        </tr>
                        <tr v-else-if="rulesLoading">
                            <td colspan="12">
                                <inline-loading/>
                            </td>
                        </tr>
                        <tr v-else v-for="rule in rules">
                            <td :title="rule.title">{{rule.title}}</td>
                            <td>{{rule.tagName || $t('common.UnlimitCountry')}}</td>
                            <td>{{sexName(rule.sex)}}</td>
                            <td>{{deviceMap(rule.clientplatformtype)}}</td>
                            <td>{{languageMap(rule.language)}}</td>
                            <td>
                                <span>
                                    {{rule.country ? (lang === 'en' ? rule.countryEn : rule.countryZn) : $t('common.UnlimitCountry')}}
                                </span>
                                <span>
                                    {{rule.province ? (lang=== 'en' ? rule.provinceEn : rule.provinceZn) : ''}}
                                </span>
                                <span>
                                    {{rule.city ? (lang==='en' ? rule.cityEn : rule.cityZn) : ''}}
                                </span>
                            </td>
                            <td>{{rule.createDate ? rule.createDate : '-' }}</td>
                            <td>{{rule.updateDate ? rule.updateDate : '-' }}</td>
                            <td>
                                <div  class="operating-btn">
                                    <button type="button" class="btn edit-btn" @click="editMenus(rule)" :disabled="$has('wechat_menu_individuation_edit')">
                                        <svg aria-hidden="true" class="action-icon icon-pencil" v-title:top="$t('common.edit')">
                                            <use xlink:href="#icon-pencil"></use>
                                        </svg>
                                    </button>
                                    <button type="button" class="btn del-btn" @click="del(rule.id)" :disabled="$has('wechat_menu_individuation_delete')">
                                        <svg aria-hidden="true" class="action-icon icon-delete" v-title:top="$t('common.del')">
                                            <use xlink:href="#icon-delete"></use>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!--分页-->
            <div class="pager-wrapper">
                <div class="amount">{{'journey.totalCount' | t}}
                    <span class="theme-text">{{totalRow}}</span>
                    {{'journey.totalUnit' | t}}
                </div>
                <pager :total="totalPage" :now="pageNumber" @page="handlePage"/>
            </div>

        </div>
        <div class="page-content">
            <router-view/>
        </div>
        <!-- 个性化菜单规则描述 -->
        <modal v-if="showDescription" :title="$t('menu.personalizedMenuRules')" @close="showDescription = false">
            <p class="form-field">{{'menu.desOne' | t}}</p>
            <p class="form-field">{{'menu.desTwo' | t}}</p>
            <p class="form-field">{{'menu.desThree' | t}}</p>
            <p class="form-field">{{'menu.desFour' | t}}</p>
            <p class="form-field">{{'menu.desFive' | t}}</p>
            <p class="form-field">{{'menu.desSix' | t}}</p>
            <p class="form-field">{{'menu.desSeven' | t}}</p>

            <template v-slot:buttons>
                <button class="btn btn-md btn-theme" @click="showDescription = false">{{'common.confirm' | t}}</button>
            </template>
        </modal>
    </div>

</template>
<script type="text/babel">

    import { WechatApiV1 } from '@/api';
    import regionalLinkage from './area-select/regional-linkage.vue';
    import {I18N_STORE_NAME} from '@/locales';


    export default {
        data() {
            return {
                rules: [],
                rulesLoading: false,    // 请求列表过渡显隐
                chooseSex: false,//选择性别
                sex:'',//单选检索 性别
                chooseSystem:false,//选择系统
                clientPlatFormType: '',//操作系统 单选检索
                languageList:[//语言列表
                    {name: this.$t('journeyList.all'), id: ''},
                    {name: this.$t('common.UnlimitCountry'), id: -1},
                    {name: this.$t('common.zh_cn'), id: 'zh_CN'},
                    {name: this.$t('common.zh_TW'), id: 'zh_TW'},
                    {name: this.$t('common.zh_HK'), id: 'zh_HK'},
                    {name: this.$t('common.English'), id: 'en'},
                    {name: this.$t('common.Indonesian'), id: 'id'},
                    {name: this.$t('common.Malay'), id: 'ms'},
                    {name: this.$t('common.Spanish'), id: 'es'},
                    {name: this.$t('common.Korean'), id: 'ko'},
                    {name: this.$t('common.Italian'), id: 'it'},
                    {name: this.$t('common.Japanese'), id: 'ja'},
                    {name: this.$t('common.Polish'), id: 'pl'},
                    {name: this.$t('common.Portuguese'), id: 'pt'},
                    {name: this.$t('common.Russian'), id: 'ru'},
                    {name: this.$t('common.Thai'), id: 'th'},
                    {name: this.$t('common.Vietnamese'), id: 'vi'},
                    {name: this.$t('common.Arabic'), id: 'ar'},
                    {name: this.$t('common.Hindi'), id: 'hi'},
                    {name: this.$t('common.Hebrew'), id: 'he'},
                    {name: this.$t('common.Turkish'), id: 'tr'},
                    {name: this.$t('common.German'), id: 'de'},
                    {name: this.$t('common.French'), id: 'fr'},
                ],
                chooseLanguage: false,
                language: '',
                areaList:[],
                chooseArea:false,//地区 单选
                country:'',//国家
                city:'',//城市
                province: '',//省
                lastAreaSelect:{},//回传给子组件的地区选择
                totalPage: 1,           // 表单数据总页数
                pageNumber: 1,             // 当前页数
                searchName:'',
                sortOrder: '',//0 正序 1倒序
                sortValue: '',//排序字段
                totalRow: 0,
                sexList: [this.$t('journeyList.all'), this.$t('common.UnlimitCountry'),this.$t('common.man'), this.$t('common.woman')],
                systemList: [this.$t('journeyList.all'),this.$t('common.UnlimitCountry'), 'IOS', 'Android', 'Others'],
                showDescription: false,
                syncIng: false,
                languageStatus: '',//语言筛选条件，不限：languageStatus = -1，其余为'',
                countryStatus: '',//国家筛选条件，不限：languageStatus = -1，其余为'',
            };
        },
        watch:{
            sex() {
                this.pageNumber = 1;
                this.getRules();
            },
            clientPlatFormType() {
                this.pageNumber = 1;
                this.getRules();
            },
            $route(route) {
                if (route.name === 'customizeMenu') {
                    this.getRules();
                    this.getAllCountryList();
                }
            }
        },
        components:{regionalLinkage},
        mounted() {
            this.getRules();
            this.getAllCountryList();
        },
        computed: {
            listFlag() {
                return this.$route.name === 'customizeMenu';
            },
            // 判断当前语言环境
            lang() {
                return this.$store.state[I18N_STORE_NAME].lang;
            },
            createDateTitle() {
                return `${this.$t('analysis.by')}${this.$t('menu.createdDate')}${this.$t('material.sort')}`;
            }
        },
        methods: {
            // 获取城市列表
            getAllCountryList() {
                WechatApiV1
                    .getAllCountryList()
                    .then((res) => {
                        this.areaList = res.body.data.children;
                    });
            },
            // 获取个性化列表
            getRules() {
                this.rulesLoading = true;
                /*eslint-disable-next-line*/
                let countryId = (this.country.id == '2' || this.country.id === 3) ? '' : this.country.id;
                let language = this.language === -1 ? '' : this.language;//语言选择不限时，languageStatus=-1, this.language = ''

                let obj = {
                    city: this.city.id,
                    province: this.province.id,
                    country: countryId,
                    clientplatformtype: this.clientPlatFormType,
                    language: language,
                    pageNumber: this.pageNumber,
                    searchName: this.searchName,
                    sex: this.sex,
                    sortOrder: this.sortOrder,
                    sortValue: this.sortValue,
                    languageStatus: this.languageStatus,
                    countryStatus: this.countryStatus
                };
                WechatApiV1
                    .getRules(obj)
                    .then(res => {
                        this.totalPage = res.body.data.totalPage || 0;
                        this.totalRow = res.body.data.totalRow || 0;
                        this.rules = res.body.data.menuMatchRules || [];
                        this.rulesLoading = false;
                    })
                    .catch(() => {
                        this.rulesLoading = false;
                    });
            },
            //选择语言
            selectLanguage() {
                this.languageStatus = this.language === -1 ? -1 : ''; //语言选择全部时，languageStatus === -1
                this.pageNumber = 1;
                this.getRules();
            },
            sexName(sex) {
                return sex ? this.sexList[sex + 1] : this.sexList[1];
            },
            deviceMap(device) {
                return device ? this.systemList[device + 1] : this.systemList[1];
            },
            languageMap(lang) {
                return lang ? this.languageList.$getByKey(lang).name : this.languageList[1].name;
            },

            // 点击创建个性化菜单仅跳转页面
            createEmptyMenu() {
                this.$router.push({
                    name: 'createCustomizeMenuForm',
                    params: {ruleId: 0}
                });
            },
            // 编辑个性化菜单
            editMenus(rule) {
                this.$router.push({
                    name:'editCustomizeMenuForm',
                    params: {ruleId: rule.id}
                });
            },
            del(id) {
                this.$confirm(this.$t('common.delete'), this.$t('menu.confirmDelete'))
                    .then(sure => {
                        if (sure) {
                            WechatApiV1
                                .delRule(id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.pageNumber = 1;
                                    this.getRules();
                                });
                        }
                    });
            },
            // 隐藏表单状态筛选
            closeSex() {
                this.chooseSex = false;
            },
            closeSystem() {
                this.chooseSystem = false;
            },
            closeLanguage() {
                this.chooseLanguage = false;
            },
            // 地区选择显隐
            selectRegion(){
                this.chooseArea = !this.chooseArea;
                this.lastAreaSelect = {
                    country: this.country,
                    province: this.province,
                    city: this.city
                };
            },
            closeArea() {
                this.chooseArea = false;
            },
            emitCloseArea(obj) {
                // TODO eqeqeq
                /*eslint-disable-next-line*/
                this.countryStatus = obj.country.id == '2' ? -1 : '';//选中 "不限" 时，countryStatus===-1,其他情况===''
                this.country = obj.country;
                this.province = obj.province;
                this.city = obj.city;
                this.chooseArea = false;
                this.pageNumber = 1;
                this.getRules();
            },
            // 分页操作
            handlePage(e) {
                this.pageNumber = e;
                // ajax获取列表
                this.getRules();
            },
            // 排序
            ListSort(sortValue) {
                this.sortValue = sortValue;
                this.sortOrder = this.sortOrder ? 0 : 1;
                this.getRules();
            },
            searchMenu() {
                this.pageNumber = 1;
                this.getRules();
            },
            // 同步微信个性化菜单到本地
            syncWeChat() {
                this.syncIng = true;
                WechatApiV1
                    .getAllIndividuation()
                    .then(() => {
                        this.syncIng = false;
                        this.$toast(this.$t('wechatContent.syncSuccessTip'), 'success');
                        this.$nextTick(() => {
                            window.location.reload();
                        });
                    })
                    .catch(() => {
                        this.syncIng = false;
                    });
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">

    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';
    .function-menu{
        position: relative;
    }
    .menu-rules {
        padding: 20px 30px;

        .content-header {
            font-size: 15px;

            .icon {
                cursor: pointer;
            }
        }
        .synchronize{
            position: absolute;
            top: 53px;
            right: 85px;
        }
        .addRule {
            position: absolute;
            right: 44px;
            top: 80px;
            padding-left: 40px;
            &:before {
                position: absolute;
                left: 18px;
            }
        }

        .personality-body {
            padding-top: 10px;
            .opt{
                display: flex;
                justify-content: flex-end;
                margin-bottom: 10px;
                .search-box{
                    margin-right: 10px;
                }
            }
        }
        .filter-box {
            display: inline-block;
            position: relative;

            svg {
                fill: currentColor;
                width: 14px;
                height: 14px;
                vertical-align: middle;
                margin-left: 1px;
            }

            .radio {
                padding: 0 10px;
                display: block;
                margin: 0;
            }

            .drop-list {
                position: absolute;
                z-index: 1;
                left: 0;
                top: 100%;
                border-radius: 4px;
                border: 1px solid $border-color;
                background-color: $content-bg;
                line-height: $input-field-height;
                white-space: nowrap;
                max-height: 300px;
                overflow-y: scroll;
            }
        }
        .personalized-menu-table{
            table {
                tr {
                    th {
                        padding: 0 10px;
                        line-height: 48px;
                        overflow: visible;
                    }
                    td {
                        padding: 0 10px;
                        line-height: 48px;
                        overflow: hidden;
                        max-width: 150px;
                    }
                }
            }
            .operating-btn{
                .edit-btn{
                    padding: 0;
                }
                .del-btn{
                    padding: 0;
                    margin: 0;
                }
                svg{
                    width: 16px;
                    height: 16px;
                    margin-top: 15px;
                }
            }
        }
        .pager-wrapper{
            display: flex;
            justify-content: space-between;
            .amount{
                line-height: 60px;
            }
        }
    }


</style>
