<!--用户列表-->
<template>
    <div class="user-wrapper content-container">
        <div class="content-view toolbar">
            <crumbs class="pull-left" :crumbs="crumbs"/>
            <button type="button" class="toolbar-btn" @click="resetData" v-title="$t('eventAnalysis.update')">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-refresh"></use>
                </svg>
            </button>
            <span class="divider"></span>
            <button type="button" class="toolbar-btn" :disabled="$store.state.loading" @click="downUserList"
                    v-title="$t('eventAnalysis.downloadCSV')">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-download"></use>
                </svg>
            </button>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1 :title="userListTitle">{{userListTitle}}</h1>
                <selector class="pull-right lg" type="checkSelect" :listName="$t('eventAnalysis.columnDisplay')"
                          :options="dropUserAttr" v-model="showList" :search="true"></selector>
            </div>
        </div>
        <div class="content-view">
            <div class="table-wrap table-user-list" v-if="userList.length && showList.length">
                <div class="table-box" :class="{scroll:showList.length > 3}">
                    <table class="table">
                        <thead>
                        <tr class="condition event">
                            <th v-for="user in userAttrList"
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
                        <tr class="condition" v-for="user in userList" @click="routerEvent(user[0])">
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
                <pager v-if="totalSize > 50" :total="totalPage" :now="query.pageNum"
                       @page="query.pageNum = arguments[0];getUser()">
                    <span v-if="totalSize > 1000">{{'eventAnalysis.mostLine'}}</span>
                    <span v-if="totalSize < 1000 && totalSize > 50">{{'common.total'}}<strong> {{totalSize}} </strong>{{'eventAnalysis.line'}}，</span>
                    <span v-if="totalSize > 50">{{'eventAnalysis.currentDisplay'}} {{pageAfter}}~{{pageBefore}} {{'eventAnalysis.line'}}</span>
                </pager>
            </template>
        </div>
    </div>
</template>
<script>
    import { QueryApi, WebServAttrApiV1 } from '@/api';
    import storageKey from '../../common/utils/storageKey';
    import debounce from 'lodash/debounce';
    import {downloadArrayBufferAsFile} from '../../common/utils/downloadUtils';
    import {logError} from '../../monitor';

    export default {
        data() {
            return {
                firstDown: true,

                totalPage: 0,
                totalSize: null,
                userList: [],
                userAttrList: [],
                attributeList: [],
                selectShow: false,
                query: {
                    byFields: [],
                    cid: this.$store.state.user.cid,
                    csvName: '',
                    filter: {
                        conditions: [{
                            attrGenre: '',
                            eventId: '',
                            field: {
                                attrId: ''
                            },
                            function: '',
                            params: [],
                            type: 'user',
                            userGroupRelation: ''
                        }],
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
                dropList: [],
                sortId: ['', ''],

                data: {},
                selectMap: {
                    0: [
                        {id: 'equal', name: this.$t('analysis.equal')},
                        {id: 'notEqual', name: this.$t('analysis.unEqual')},
                        {id: 'contain', name: this.$t('analysis.contains')},
                        {id: 'notContain', name: this.$t('analysis.notContain')},
                        {id: 'isSet', name: this.$t('analysis.value')},
                        {id: 'notSet', name: this.$t('analysis.none')},
                        {id: 'rlike', name: this.$t('analysis.regexMatch')},
                        {id: 'notRlike', name: this.$t('analysis.unMatch')},
                    ],
                    1: [
                        {id: 'equal', name: this.$t('analysis.equal')},
                        {id: 'notEqual', name: this.$t('analysis.unEqual')},
                        {id: 'greater', name: this.$t('analysis.moreThan')},
                        {id: 'less', name: this.$t('analysis.lessThan')},
                        {id: 'greaterEqual', name: this.$t('analysis.moreEqual')},
                        {id: 'lessEqual', name: this.$t('analysis.lessEqual')},
                        {id: 'between', name: this.$t('analysis.range')},
                        {id: 'isSet', name: this.$t('analysis.value')},
                        {id: 'notSet', name: this.$t('analysis.none')},
                    ],
                    2: [
                        {id: 'between', name: this.$t('analysis.absoluteTime')},
                        {id: 'relative', name: this.$t('analysis.relativeTime')},
                        {id: 'relativeBetween', name: this.$t('analysis.relativeTimeRange')},
                        {id: 'isSet', name: this.$t('analysis.value')},
                        {id: 'notSet', name: this.$t('analysis.none')},
                    ],
                    3: [
                        {id: 'equal', name: this.$t('analysis.equal')},
                        {id: 'notEqual', name: this.$t('analysis.unEqual')},
                        {id: 'greater', name: this.$t('analysis.moreThan')},
                        {id: 'less', name: this.$t('analysis.lessThan')},
                        {id: 'greaterEqual', name: this.$t('analysis.moreEqual')},
                        {id: 'lessEqual', name: this.$t('analysis.lessEqual')},
                        {id: 'between', name: this.$t('analysis.range')},
                        {id: 'isSet', name: this.$t('analysis.value')},
                        {id: 'notSet', name: this.$t('analysis.none')},
                    ],
                    100: [
                        {id: 'isTrue', name: this.$t('analysis.true')},
                        {id: 'isFalse', name: this.$t('analysis.false')},
                    ]
                },
                relativeTimeSelectList: [
                    {
                        id: 'within',
                        name: this.$t('analysis.within'),
                    },
                    {
                        id: 'before',
                        name: this.$t('analysis.before'),
                    }
                ],
                //相对当前时间点
                relativeTimeTip: '',
                //相对当前时间区间
                relativeBetweenStartTip: '',
                relativeBetweenEndTip: '',
                paramsObj: '',
                confirmTitle: this.$t('eventAnalysis.userAmount'),
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
                    this.localStorageKey(data);
                },
                deep: true
            },
            'query.pageNum'() {
                let data = JSON.parse(localStorage.getItem(this.key));
                data.userListData.query = this.query;
                this.localStorageKey(data);
            },
        },
        computed: {
            crumbs() {
                return [
                    {name: 'index', text: 'Dmartech'},
                    {
                        name: 'userGroup',
                        text: this.$t('home.userGroup'),
                        params: {id: this.$route.params.id},
                        query: {timeStamp: this.$route.query.timeStamp}
                    },
                    {
                        name: 'groupUserList',
                        text: this.$t('eventAnalysis.userList'),
                        query: {timeStamp: this.$route.query.timeStamp}
                    },
                ];
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
                return (Number(this.query.pageNum) - 1) * 50 + 1;
            },
            pageBefore() {
                return (Number(this.query.pageNum)) * 50;
            },
            pageTotal() {
                return this.totalPage > 1000 ? 1000 : this.totalPage;
            },
            userListTitle() {
                if (!this.titleData) return;
                // let str = this.titleData.sliceByValues.split(',');
                let nameList = this.titleData.titleList.split(',');
                let bookMarkName = this.titleData.markName;
                let value = this.titleData.value;
                let titleType = bookMarkName ? bookMarkName : this.$t('eventAnalysis.accordingTo') + nameList.join(',') + this.$t('eventAnalysis.checkUser');
                // let title = '';
                // str.forEach((item, idx) => {
                //     title += `${nameList[idx]}: ${item}`;
                //     if (idx + 1 < str.length) {
                //         title += ',';
                //     }
                // });
                return `${titleType}  (${this.$t('eventAnalysis.whole')}:${value}${ this.$t('eventAnalysis.people') })`;
            },
            dropUserAttr() {
                return this.userAttrList;
            },
        },
        mounted() {
            if (this.key) {
                this.data = JSON.parse(localStorage.getItem(this.key));
                let data = this.data;
                let sendData = data.sendDataObj;
                this.titleData = data.queryObj;
                if (data.userListData.query) {
                    this.query = data.userListData.query;
                } else {
                    this.query = {
                        id: sendData.id,
                        pageNum: 1,
                        pageSize: 50,
                        cid: this.$store.state.user.cid,
                        attrs: this.attrs
                    };
                    let data = JSON.parse(localStorage.getItem(this.key));
                    data.userListData.query = this.query;
                    this.localStorageKey(data);
                }
                this.sortId = data.userListData.sortId || ['', ''];
                this.getUser();
                this.get();
            } else {
                this.$router.go(-1);
            }
        },
        methods: {
            localStorageKey(data) {
                if (data.userListData.showList)
                    data.userListData.showList = data.userListData.showList.length === 0
                        ? this.dropUserAttr.map(attr => attr.id)
                        : data.userListData.showList;
                storageKey(data, this.key);
            },
            //路由跳转
            routerEvent(id) {
                if (id !== '') {
                    this.$router.push({
                        name: 'groupUserBehavior',
                        query: {timeStamp: this.$route.query.timeStamp},
                        params: {id: id, groupId: this.$route.params.id}
                    });
                }
            },

            resetData() {
                this.query.pageNum = 1;
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
                let data = JSON.parse(localStorage.getItem(this.key));
                data.userListData.query = this.query;
                this.localStorageKey(data);
                QueryApi
                    .getGroupUserList(this.query)
                    .then(({body: {data}}) => {
                        this.userList = data.datas;
                        this.totalPage = data.pageCount > 20 ? 20 : data.pageCount;
                        this.query.pageNum = data.pageNum;
                        this.totalSize = data.totalSize;
                        let newData = JSON.parse(localStorage.getItem(this.key));
                        newData.userListData.filterObj = this.filterObj;
                        this.localStorageKey(newData);
                        this.$loaded();
                    });
            },
            downUserList: debounce(function () {
                QueryApi
                    .getCsvUrl({
                        id: this.query.id,
                        cid: this.query.cid
                    })
                    .then(({body}) => {
                        if (body.code === 204) {
                            if (this.firstDown) this.$toast(this.$t('userGroup.fileGenerate'));
                            this.firstDown = false;
                            this.downUserList();
                        } else if (body.code === 200 && body.data.url) {
                            QueryApi
                                .downCsv(body.data.url)
                                .then(res => {
                                    downloadArrayBufferAsFile(this.userListTitle + '.csv', res.body)
                                        .catch(err => {
                                            let msg = typeof err === 'string' ? err : this.$t('eventAnalysis.fileBed');
                                            logError(`[数据分析-用户分群-用户列表] <user-list/> downUserList 下载csv异常 ${err}`);
                                            this.$toast(msg, 'warn');
                                        });
                                    this.firstDown = true;
                                });
                        } else {
                            this.$toast(this.$t('eventAnalysis.fileError'), 'round-close');
                        }
                    });
            }, 2000)
        }
    };
</script>
<style lang="scss">
    @import "../user-list";
</style>
