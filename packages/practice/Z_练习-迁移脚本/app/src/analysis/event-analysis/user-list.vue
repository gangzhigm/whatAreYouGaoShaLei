<!--用户列表-->
<template>
    <div class="user-wrapper content-container">
        <div class="content-view toolbar">
            <crumbs class="pull-left" :crumbs="crumbs"/>
            <div class="toolbar-btn" @click.self="selectShow = !selectShow" v-blur="hideSelect">
                <svg aria-hidden="true" @click="selectShow = !selectShow" v-title:left="$t('eventAnalysis.saveUser')">
                    <use xlink:href="#icon-user-group"></use>
                </svg>
                <transition name="drop">
                    <div class="inline-user-group-form" v-if="selectShow">
                        <div class="mark-title">{{'eventAnalysis.saveUser' | t}}</div>
                        <div class="inline-form-content">
                            <div class="form-field">
                                <label for="groupName">{{'eventAnalysis.groupName' | t}}</label>
                                <input type="text" class="input full-width" v-model.trim="groupName" id="groupName"
                                       autofocus :placeholder="groupTitle" v-title:top.line.warn="errorText"
                                       :class="{error: errorText}" @focusin="errorText = ''">
                            </div>
                            <div class="form-field tar">
                                <button class="btn btn-md btn-white" @click="hideSelect">{{'common.cancel' | t}}</button>
                                <button class="btn btn-md btn-theme" @click="saveGroup" :disabled="!valid">{{'common.confirm' |t}}</button>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>
            <span class="divider"></span>
            <button type="button" class="toolbar-btn" @click="resetData" v-title="$t('eventAnalysis.update')">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-refresh"></use>
                </svg>
            </button>
            <span class="divider"></span>
            <button type="button" class="toolbar-btn" :disabled="storeLoading" @click="downUserList"
                    v-title="$t('eventAnalysis.downloadCSV')">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-download"></use>
                </svg>
            </button>
        </div>
        <div class="page-head">
            <div class="content-view">
                <selector class="pull-right lg" type="checkSelect" :listName="$t('eventAnalysis.columnDisplay')"
                          :options="dropUserAttr" v-model="showList" search/>
                <h1 :title="userListTitle">{{userListTitle}}</h1>
            </div>
        </div>
        <div class="content-view">
            <query-filter-condition :eventIdList="[]"
                                    v-if="userFilter.conditions.length"
                                    :condition="userFilter.conditions[0]"
                                    :groups="groups"
                                    :resetBtn="true"
                                    :deleteBtn="false"
                                    @reset="resetCondition($event,0)"
                                    @change="modifyCondition($event,0)"/>
            <div class="table-wrap table-user-list" v-if="userList.length && showList.length">
                <div class="table-box" :class="{scroll:showList.length > 3}">
                    <table class="table">
                        <thead>
                        <tr class="condition event">
                            <th v-for="(user,index) in userAttrList"
                                @click="sortList(user)"
                                v-if="showList.indexOf(user.id) !== -1">
                                {{user.name}}
                                <div class="sort-box">
                                    <i class="top-i"
                                       :class="{checked :sortId[0] === user.id && sortId[1] === 'asc'}"></i>
                                    <!--caret-up-->
                                    <i class="bottom-i"
                                       :class="{checked :sortId[0] === user.id && sortId[1] === 'desc'}"></i>
                                    <!--caret-down-->
                                </div>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr class="condition" v-for="(user,index) in userList" @click="routerEvent(user[0])">
                            <td v-for="(item,idx) in user" v-text="item !== '' ? item : '-'"
                                v-if="idx !== 0 && idx <= userAttrList.length && showList.indexOf(userAttrList[idx - 1].id) !== -1"></td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <block-empty v-if="userList.length === 0"/>
            <p v-if="userList.length && !showList.length" class="data-empty"> {{'eventAnalysis.tickItem' | t}}</p>
            <template v-if="totalSize !== null && showList.length">
                <pager v-if="totalSize > 50" :total="totalPage" :now="query.pagination.pageNum"
                       @page="query.pagination.pageNum = arguments[0];getUser()">
                    <span v-if="totalSize > 1000">{{'eventAnalysis.mostLine' | t}}</span>
                    <span v-if="totalSize < 1000 && totalSize > 50">{{'common.total' | t}}<strong> {{totalSize}} </strong>{{'eventAnalysis.line' | t}}，</span>
                    <span v-if="totalSize > 50">{{'eventAnalysis.currentDisplay' | t}} {{pageAfter}}~{{pageBefore}} {{'eventAnalysis.line' | t}}</span>
                </pager>
            </template>
        </div>

    </div>
</template>
<script>
    import { QueryApi, WebServAttrApiV1 } from '@/api';
    import storageKey from '@/common/utils/storageKey';
    import downCsv from '@/common/utils/downloadUtils';
    import QueryFilterCondition, {
        filterConditionFactory,
        isCompleteCondition
    } from '../components/query-filter-condition.vue';
    import {isSameConditions} from '../components/query-filter.vue';
    import {KEY_PREFIXES} from '@/store/vuex/modules/analysisStore';
    import cloneDeep from 'lodash/cloneDeep';
    import {COMMON_NAME_REGEXP} from '@/common/utils/regs';
    import LINKS from '@/LINKS';
    import { mapState } from 'vuex';

    export default {
        components: {
            QueryFilterCondition
        },
        data() {
            return {
                groupName: '',

                totalPage: 0,
                totalSize: null,
                userList: [],
                userAttrList: [],
                attributeList: [],
                selectShow: false,
                query: {
                    byFields: [],
                    cid: this.userId,
                    csvName: '',
                    filter: {
                        conditions: [],
                        relation: 'and'
                    },
                    measures: [],
                    pagination: {
                        pageNum: 1,
                        pageSize: 50
                    },
                    attrs: [],
                    sliceByValues: []
                },
                showList: [],
                titleData: null,
                listSelectShow: false,
                filter: {
                    attrId: '',
                    function: '',
                    functionSelectList: [],
                },
                userFilter: {
                    conditions: [],
                    relation: 'and'
                },
                dropList: [],
                sortId: ['', ''],

                data: {},
                paramsObj: '',
                confirmTitle: this.$t('eventAnalysis.userAmount'),
                errorText: ''
            };
        },
        watch: {
            showList: {
                handler(value) {
                    let data = JSON.parse(localStorage.getItem(this.key));
                    data.userListData.showList = value;
                    data.userListData.attrs = this.attributeList.filter(user => {
                        return value.indexOf(user.id) !== -1;
                    });
                    this.localStorageKey(data, this.key);
                },
                deep: true
            },
            'query.pagination.pageNum'() {
                let data = JSON.parse(localStorage.getItem(this.key));
                data.userListData.query = this.query;
                this.localStorageKey(data);
            },
            userFilter: {
                handler(newFilter) {
                    if (newFilter.conditions[0].field.attrId !== '') {
                        let data = JSON.parse(localStorage.getItem(this.key));
                        data.userListData.userFilter = this.userFilter;
                        this.localStorageKey(data);
                        this.query.pagination.pageNum = 1;
                        this.getUser();
                    }
                },
                deep: true
            },
        },
        computed: {
            ...mapState({
                userId: state => state.user.cid,
                storeLoading: state => state.loading
            }),
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    this.data.bmsId
                        ? {name: 'event', text: this.$t('eventAnalysis.analysis'), query: {bmsId: this.data.bmsId}}
                        : {name: 'event', text: this.$t('eventAnalysis.analysis')},
                    {name: 'eventUserList', text: this.$t('eventAnalysis.userList'), query: {timeStamp: this.$route.query.timeStamp}}
                ];
            },
            groups() {
                let options = this.userAttrList.map(list => {
                    list.key = KEY_PREFIXES.USER_ATTR + list.id;
                    return list;
                });
                return [{
                    icon: 'fans-attr',
                    options: options,
                    title: this.$t('eventAnalysis.userAttribute'),
                }];
            },
            attrs() {
                let attrs = [];
                if (this.userAttrList.length > 0) {
                    this.userAttrList.forEach(user => {
                        if (this.showList.indexOf(user.id) !== -1) {
                            let order = '';
                            if (this.sortId[0] === user.id) {
                                order = this.sortId[1];
                            }
                            attrs.push({
                                attrGenre: user.attrGenre,
                                attrId: user.id,
                                attrName: user.name,
                                order: order
                            });
                        }
                    });
                    return attrs;
                }
                return [];
            },
            key() {
                return this.$route.query.timeStamp;
            },
            pageAfter() {
                return (Number(this.query.pagination.pageNum) - 1) * 50 + 1;
            },
            pageBefore() {
                return (Number(this.query.pagination.pageNum)) * 50;
            },
            pageTotal() {
                return this.totalPage > 1000 ? 1000 : this.totalPage;
            },
            groupTitle() {
                if (!this.titleData) return;
                let str = this.titleData.sliceByTitle;
                let nameList = this.titleData.titleList;
                let time = this.titleData.time;
                let bookMarkName = this.titleData.markName;
                let title = '';
                let titleType = bookMarkName ? bookMarkName : this.$t('eventAnalysis.accordingTo') + nameList.join('，') + this.$t('eventAnalysis.checkUser');
                if (this.titleData.sliceByValues.length !== 0) {
                    str.forEach((item, idx) => {
                        title += `${nameList[idx]}：${item}`;
                        if (idx + 1 < str.length) {
                            title += '，';
                        }
                    });
                    return str.length === nameList.length
                        ? `${titleType}（${time}，${title}）`
                        : `${titleType}（${time}，${this.titleData.sliceByTitle}）`;
                }
                return `${titleType}（${time}）`;
            },
            userListTitle() {
                if (!this.titleData) return;
                let value = this.titleData.value;
                if (isCompleteCondition(this.userFilter.conditions[0])) {
                    return `${this.groupTitle} ${ this.$t('eventAnalysis.part') }：${this.$t('eventAnalysis.only')}${this.totalSize}${ this.$t('eventAnalysis.people') }`;
                }
                return `${this.groupTitle} ${this.$t('eventAnalysis.whole')}：${value}${this.$t('eventAnalysis.people')}`;
            },
            dropUserAttr() {
                return this.userAttrList;
            },
        },
        mounted() {
            if (this.key) {
                this.data = JSON.parse(localStorage.getItem(this.key));
                let data = this.data;
                this.titleData = data.queryObj;
                this.query = {
                    ...data.sendDataObj,
                    attrs: this.attrs,
                    pagination: {
                        pageNum: 1,
                        pageSize: 50
                    },
                    sliceByValues: this.titleData.sliceByValues,
                    sliceDate: this.titleData.sliceDate
                };
                if (data.userListData.userFilter) {
                    if (data.userListData.userFilter.conditions.length === 0) {
                        this.userFilter.conditions[0] = filterConditionFactory();
                    } else {
                        this.userFilter = data.userListData.userFilter;
                    }
                } else {
                    this.userFilter.conditions[0] = filterConditionFactory();
                }
                this.sortId = data.userListData.sortId || ['', ''];
                this.getUser();
                this.get();
            } else {
                this.$router.go(-1);
            }
        },
        methods: {
            hideSelect() {
                this.selectShow = false;
                this.errorText = '';
            },
            valid() {
                let name = this.groupName === '' ? this.groupTitle : this.groupName;
                this.errorText = '';
                if (name.length > 30) {
                    this.errorText = this.$t('eventAnalysis.mostGroupName');
                    return false;
                } else if (!COMMON_NAME_REGEXP.test(name)) {
                    this.errorText = this.$t('common.nameSpecial');
                    return false;
                }
                return true;
            },
            saveGroup() {
                let name = this.groupName === '' ? this.groupTitle : this.groupName;
                if (this.valid()) {
                    this.$loading();
                    QueryApi
                        .saveEventGroup({
                            groupName: name,
                            cid: this.userId,
                            userFilter: {
                                conditions: this.userFilter.conditions.filter(list => list.field.attrId !== ''),
                                relation: 'and',
                            },
                            ...this.query,
                        })
                        .then(() => {
                            this.$loaded();
                            this.hideSelect();
                            this.$toast(this.$t('common.createSuccess'), 'success');
                            this.groupName = '';
                        })
                        .catch(() => {
                            this.$loaded();
                        });
                }

            },
            modifyCondition(newCondition, position) {

                let condition = filterConditionFactory();

                // update the condition properly, could be editing/deleting
                const targetConditions = this.userFilter.conditions;
                const conditionsCopy = cloneDeep(targetConditions);
                if (newCondition) {
                    // edit
                    conditionsCopy.splice(position, 1, newCondition);
                } else {
                    conditionsCopy.splice(position, 1, condition);
                }
                // actual change check
                if (!isSameConditions(targetConditions, conditionsCopy) && isCompleteCondition(conditionsCopy[0])) {
                    this.userFilter.conditions = conditionsCopy;
                }
            },
            resetCondition() {
                this.userFilter.conditions = [filterConditionFactory()];
                this.query.pagination.pageNum = 1;
                this.getUser();
            },
            localStorageKey(data) {
                data.userListData.showList = data.userListData.showList.length === 0
                    ? this.dropUserAttr.map(attr => attr.id)
                    : data.userListData.showList;
                storageKey(data, this.key);
            },
            //路由跳转
            routerEvent(id) {
                if (id !== '') {
                    this.$router.push({
                        name: 'eventUserBehavior',
                        query: {timeStamp: this.$route.query.timeStamp},
                        params: {id: id}
                    });
                }
            },

            //获取值列表
            searchValueList(filter, keyWord) {
                this.getValueList1(filter.field.attrId, keyWord, filter.attrGenre, filter.numberPrecision);
            },
            //获取值列表
            getValueList1(attrId, keyWord, attrGenre, attrLength) {
                let sendObj = {
                    attrId: attrId,
                    attrType: 0,
                    eventIds: [0],
                    keyword: keyWord,
                    limit: 100,
                    attrGenre: attrGenre,
                    attrLength: attrLength,
                };
                WebServAttrApiV1
                    .getValueList(sendObj)
                    .then(({body: {data: {values}}}) => {
                        this.dropList = values;
                    });

            },

            //data-list的选项
            dataListSelect(filter, e) {
                filter.params = e;
            },

            resetData() {
                this.query.pagination.pageNum = 1;
                this.getUser();
            },
            sortList(user) {
                if (this.sortId[0] === user.id) {
                    this.sortId[0] = user.id;
                    this.sortId[1] = this.sortId[1] === 'desc' ? 'asc' : 'desc';
                } else {
                    this.sortId[0] = user.id;
                    this.sortId[1] = 'desc';
                }
                this.$nextTick(() => {
                    let data = JSON.parse(localStorage.getItem(this.key));
                    data.userListData.sortId = this.sortId;
                    this.localStorageKey(data);
                    this.getUser();
                });
            },
            get() {
                WebServAttrApiV1
                    .getAttributes({attrType: 0, isFilter: '', isResult: ''})
                    .then(({body: {data: {attributeList}}}) => {
                        let listLoading = true;
                        this.attributeList = attributeList;
                        if (this.data.userListData.showList) {
                            this.showList = this.data.userListData.showList;
                            listLoading = false;
                        }
                        this.userAttrList = attributeList.map(item => {
                            if (listLoading) this.showList.push(item.id);
                            return {
                                attrGenre: item.attrGenre,
                                attrType: item.attrType,
                                id: item.id,
                                name: item.meaning,
                                attrLength: item.attrLength,
                                isSecondSelect: true,
                                disabled: false,
                                type: 'user'
                            };
                        });
                    });
            },
            getUser() {
                this.$loading();
                if (this.sortId[0] === '') {
                    this.query.attrs = [];
                } else {
                    this.query.attrs = [{
                        attrId: this.sortId[0],
                        order: this.sortId[1]
                    }];
                }
                let query = {
                    ...this.query,
                    userFilter: {
                        conditions: this.userFilter.conditions.filter(list => list.field.attrId !== ''),
                        relation: 'and',
                    },
                };
                QueryApi
                    .getEventUserList(query)
                    .then(({body: {data}}) => {
                        this.userList = data.data;
                        this.totalPage = data.pageCount > 20 ? 20 : data.pageCount;
                        this.query.pagination.pageNum = data.pageNum;
                        this.totalSize = data.totalSize;
                        this.$loaded();

                        let newData = JSON.parse(localStorage.getItem(this.key));
                        newData.userListData.userFilter = this.userFilter;
                        this.localStorageKey(newData);
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            downUserList() {
                let attrs = [];
                this.userAttrList.forEach((user) => {
                    if (this.showList.indexOf(user.id) !== -1) {
                        let order = '';
                        if (this.query.attrs.length && this.query.attrs[0].attrId === user.id) {
                            order = this.query.attrs[0].order;
                        }
                        attrs.push({
                            attrGenre: user.attrGenre,
                            attrId: user.id,
                            attrName: user.name,
                            order: order
                        });
                    }
                });
                if (attrs.length === 0) {
                    return this.$toast(this.$t('eventAnalysis.chooseItem'));
                }
                let data = {
                    ...this.query,
                    csvName: this.userListTitle + '.csv',
                    attrs: attrs,
                    userFilter: {
                        conditions: this.userFilter.conditions.filter(list => list.field.attrId !== ''),
                        relation: 'and',
                    },
                };
                downCsv(
                    'post',
                    'param',
                    JSON.stringify(data),
                    LINKS.QUERY_API_BASE + '/api/export/event/analytics/list/post'
                );
            }
        }
    };
</script>
<style lang="scss">
    @import "../user-list";
</style>
