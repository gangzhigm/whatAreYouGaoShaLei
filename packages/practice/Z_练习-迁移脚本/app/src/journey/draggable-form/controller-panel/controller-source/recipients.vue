<template>
    <transition name="scale-list">
        <div class="recipients">
            <div class="controller-source-lib">
<!--                左侧边栏-->
                <transition name='slide-left'>
                    <ul v-if="pageShow === 'start'" class="controller-source-types">
                        <li class="label" @click="gopage('contact')">
                            {{'home.customerSwarm' | t}}
                            <i class="icon icon-fanhui start-back"></i>
                        </li>
                        <li class="label" @click="gopage('subscription')">
                            {{'controller.account' | t}}
                            <i class="icon icon-fanhui start-back"></i>
                        </li>
                    </ul>
                </transition>
<!--                右侧边栏-->
                <transition name='slide-right'>
                    <div v-if="pageShow !== 'start'" class="controller-source-list">
                        <div class="go-back" @click="gopage('start')"><i class="icon icon-fanhui1"></i></div>
                        <div class="tool-bar">
                            <div v-if="pageShow ==='contact'" class="sort">
                                <span>{{'dragJourney.sortBy' | t}}：</span>
                                <span v-title:top="$t('dragJourney.sort')" @click="contactSort('updateSort')">
                                {{(sort.updateSort ? 'dragJourney.dateAsc' : 'dragJourney.dateDesc') | t}}
                            </span>
                                <span v-title:top="$t('dragJourney.sort')" @click="contactSort('nameSort')">
                                {{(sort.nameSort ? 'dragJourney.nameAsc' : 'dragJourney.nameDesc') | t}}
                            </span>
                            </div>
                            <div class="tools">
                                <router-link :to="goCreateRoute" v-if="pageShow !== 'subscription'">
                                    <i v-title:top="$t('dragJourney.add')" class="icon icon-plus"></i>
                                </router-link>
                                <div @click="refresh()">
                                    <i v-title:top="$t('dragJourney.refresh')" class="icon icon-refresh"></i>
                                </div>
                                <div v-if="pageShow ==='contact'" @click="searchBox=!searchBox">
                                    <i v-title:top.line="$t('dragJourney.search')" class="icon icon-search"></i>
                                </div>
                            </div>
                            <transition name='search-box'>
                                <div v-show="searchBox && pageShow ==='contact'" class="search"
                                     @keydown.enter="searchContact()">
                                    <input type="text" :placeholder="$t('dragJourney.search')" maxlength="50"
                                           v-model.trim="searchContent">
                                    <i @click="searchContact()" class="icon icon-search"></i>
                                    <i @click="closeSearch" class="icon icon-close"></i>
                                </div>
                            </transition>
                        </div>
                        <inline-loading v-if="loading"/>
                        <ul v-else-if="viewList.length" class="controller-contents" :class="{searching: searchBox && pageShow ==='contact'}">
                            <template v-for="item in viewList">
                                <li v-if="filterList(item)" class="contents-li" :key="item.id" draggable @dragstart="labelDragStart($event, item)"
                                    @dragend="labelDragEnd" :title="item.name">
                                    <div class="li-content">
                                        <p class="name" :style="{lineHeight:pageShow ==='contact'?'':'43px'}">
                                            {{item.name}}</p>
                                        <p v-if="pageShow ==='contact'" class="time">{{item.time}}</p>
                                    </div>
                                    <p class="count" v-if="pageShow !=='contact'">{{item.count ? item.count.toLocaleString() : 0}}</p>
                                    <i class="icon icon-tuozhuai"></i>
                                </li>
                            </template>
                        </ul>
                        <template v-else>
                            <list-empty v-if="!searchBox"/>
                            <list-search-empty v-else-if="searchBox"
                                               @action="goBackList"
                                               :action="$t('common.back')"/>
                        </template>
                    </div>
                </transition>
            </div>
        </div>
    </transition>
</template>

<script type="text/ecmascript-6">

    import { ContactApiV1, WechatApiV1 } from '@/api';
    import {logError} from '../../../../monitor.js';
    import {CONTACT_CONTROLLER} from '../../canvas/controller/CONTROLLER_TYPES';
    import { mapState } from 'vuex';

    export default {
        data() {
            return {
                loading: false, //加载
                pageShow: 'start', // start contact subscription
                searchBox: false,   //搜索
                currentPageNumber: 1,   //当前页码

                viewList: [],   //查看列表

                sort: {//排序
                    updateSort: true, // true = asc, false = desc
                    nameSort: true
                },

                searchContent: '', //搜索关键字
            };
        },
        computed: {
            ...mapState({
                // 特殊id,用于隐藏'全部联系人'项
                hiddenId: state => state.canvasStore.hiddenId
            }),
            // 创建
            goCreateRoute() {
                if (this.pageShow === 'contact') {
                    return {name: 'swarm'};
                }
                if (this.pageShow === 'subscription') {
                    return {name: 'bindWechatOfficialAccount'};
                }
            }
        },
        methods: {
            /**
             * 根据id过滤'全部联系人'项
             * @param e
             * @returns {boolean}
             */
            filterList(e) {
                return e.id !== this.hiddenId;
            },
            //创建
            goCreate() {
                let {href} = this.$router.resolve(this.goCreateRoute);
                window.open(href);
            },
            // 返回列表
            goBackList() {
                this.searchContent = '';
                switch (this.pageShow) {
                    case 'contact':
                        this.getCustomerSwarms(true);
                        break;
                    case 'subscription':
                        this.getWechatBindingList();
                        break;
                }
            },
            // 取消搜索
            closeSearch() {
                this.searchBox = false;
                this.searchContent = '';
            },
            /**
             * 标签拖动
             * @param e
             * @param i
             */
            labelDragStart(e, i) {
                e.dataTransfer.setData('text/plain', 'compatFireFox');
                this.$emit('labelDragStart', i);
            },
            // 拖动结束
            labelDragEnd() {
                this.$emit('labelDragEnd');
            },
            /**
             * 页码跳转
             * @param page {Number} 页码
             */
            gopage(page) {
                this.pageShow = page;
                switch (page) {
                    case 'start':
                        this.searchContent = '';
                        this.viewList = [];
                        this.currentPageNumber = 1;
                        this.searchBox = false;
                        break;
                    case 'contact':
                        this.getCustomerSwarms(true);
                        break;
                    case 'subscription':
                        this.getWechatBindingList();
                        break;
                }
            },
            /**
             *  获取用户群的类型
             * @param type
             */
            contactSort(type) {
                this.sort[type] = !this.sort[type];
                if (type === 'updateSort' && this.sort[type] === true) {
                    this.getCustomerSwarms(true, 0);
                }
                if (type === 'updateSort' && this.sort[type] === false) {
                    this.getCustomerSwarms(true, 1);
                }
                if (type === 'nameSort' && this.sort[type] === true) {
                    this.getCustomerSwarms(true, 2);
                }
                if (type === 'nameSort' && this.sort[type] === false) {
                    this.getCustomerSwarms(true, 3);
                }
                if (type !== 'updateSort' && type !== 'nameSort') {
                    logError(`[营销旅程] <recipients /> contactSort 出现了无法获取用户群的类型{type:${type}} :208`);
                }
            },
            // 搜索联系人
            searchContact() {
                this.getCustomerSwarms(true);
            },
            // 刷新
            refresh() {
                switch (this.pageShow) {
                    case 'contact':
                        this.getCustomerSwarms(true);
                        break;
                    case 'subscription':
                        this.viewList = [];
                        this.getWechatBindingList();
                        break;
                }
            },
            /**
             * 获取联系人分群
             * @param reset
             * @param sort
             */
            getCustomerSwarms(reset, sort) {
                this.loading = true;
                if (reset) {
                    ContactApiV1
                        .getSwarms(sort, this.searchContent)
                        .then(({body: {data: {swarmList}}}) => {
                            this.viewList = swarmList.map(({id, name, total, updateDate}) => ({
                                id,
                                name,
                                count: total,
                                time: updateDate ? updateDate.slice(5) : '',
                                type: CONTACT_CONTROLLER,
                                sub_type: 'contact'
                            }));
                            this.loading = false;
                        });
                } else {
                    ContactApiV1
                        .getSwarms(sort, name)
                        .then(({body: {data: {swarmList}}}) => {
                            swarmList.forEach(({id, name, total, updateDate}) => {
                                this.viewList.push({
                                    id,
                                    name,
                                    count: total,
                                    time: updateDate ? updateDate.slice(5) : '',
                                    type: CONTACT_CONTROLLER,
                                    sub_type: 'contact'
                                });
                            });
                            this.loading = false;
                        });
                }
            },
            //获取微信绑定列表
            getWechatBindingList() {
                this.loading = true;
                WechatApiV1
                    .getWechatAccounts(1) // 参数：类型(1.需要获取公众号粉丝总数及24小时互动粉丝数字段contactInteractTotalRow)
                    .then(({body: {data: {authorizerInfoList}}}) => {
                        this.viewList = authorizerInfoList.map(authorizeInfo => ({
                            id: authorizeInfo.WxAppId,
                            name: authorizeInfo.principalName,
                            count: authorizeInfo.contactTotalRow, // 公众号粉丝总数
                            type: CONTACT_CONTROLLER,
                            sub_type: 'subscription'
                        }));
                        this.loading = false;
                    });
            }
        }
    };
</script>

<style lang="scss">
    @import "controller-source-lib";

    .recipients {
        .controller-source-lib .controller-source-list .controller-contents li {
            position: relative;
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            flex-wrap: nowrap;
            @include clearfix();
            .li-content {
                flex: 1;
                display: inline-grid;
            }
        }
    }
</style>
