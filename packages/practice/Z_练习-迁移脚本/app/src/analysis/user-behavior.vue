<!--用户行为分析-->
<template>
    <div class="user-behavior">
        <div class="content-view toolbar">
            <crumbs class="pull-left" :crumbs="crumbs"/>
            <button type="button" class="toolbar-btn" @click="refresh(true)" v-title="$t('eventAnalysis.update')">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-refresh"></use>
                </svg>
            </button>
            <span class="divider"></span>
            <button type="button" class="toolbar-btn" :disabled="loading" @click="downBehavior"
                    v-title="$t('eventAnalysis.downloadCSV')">
                <svg aria-hidden="true">
                    <use xlink:href="#icon-download"></use>
                </svg>
            </button>
        </div>
        <div class="page-head">
            <div class="content-view">
                <h1>{{'visualization.userBehavior' | t}}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin">
                <div class="main-left pull-left">
                    <div class="content-l"><!--柱形图显示-->
                        <div class="chart-top">
                            <span class="pull-left">{{'visualization.eventAmount' | t}}</span>

                            <div class="chart-conditons pull-right">
                                <date-range v-bind="range" format="YYYY-MM-DD HH:mm:ss"
                                            @change="rangeChange"></date-range>
                                <div class="inline">
                                    <span>{{'visualization.eventSelect' | t}}</span>
                                    <selector class="event-select" auto-width type="checkSelect"
                                              :options="eventLabelList" v-model="LabelEvent" @hide="chooseEvents"
                                              :listName="optionEventTips" :search="true" :filterPlaceholder="$t('visualization.labelSelect')">
                                    </selector>
                                </div>
                                <div class="time-btn inline">
                                    <button type="button" v-for="item in time"
                                            :class="unit == item.value?'active':''"
                                            @click="chooseUnit(item.value)">{{item.text}}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button class="cancel-btn btn btn-theme-border btn-md" type="button" v-if="cancelBarBtn"
                                @click="refresh">
                            {{'visualization.uncheck' | t}}
                        </button>
                        <div class="chart-data">
                            <div class="chart-main" id="chart-bar" ref="chartBar" v-show="haveEventAjax">
                            </div>
                            <!-- 没有查找到数据的时候 -->
                            <block-empty v-if="!haveEventAjax"/>
                        </div>
                    </div>
                    <div class="content-l"><!--环比图显示   行为统计-->
                        <div class="chart-top">
                            <span>{{'visualization.behaviorStatistics' | t}}</span>
                        </div>
                        <div class="chart-data">
                            <div class="chart-main" id="chart-pie" ref="chartPie" v-show="haveEventAjax">
                            </div>
                            <!-- 没有查找到数据的时候 -->
                            <block-empty v-if="!haveEventAjax"/>
                        </div>
                    </div>
                    <div class="content-l"><!--时间轴显示   行为序列-->
                        <div class="chart-top">
                            <span>{{'visualization.behavior' | t}}</span>
                            <div class="pull-right">
                                <span>{{'visualization.attributeScreening' | t}}</span>
                                <selector class="event-select" auto-width type="checkSelect"
                                          :options="allAttributeList" v-model="attribute" @hide="chooseAttr"
                                          :listName="optionAttrTips" :search="true">
                                </selector>
                                <button v-if="attrList.length !== 0" class="fold btn btn-theme-border btn-md inline"
                                        type="button"
                                        v-text="unfold ? $t('visualization.fold') : $t('visualization.expand')" @click="unfold = !unfold"></button>
                            </div>

                        </div>
                        <div class="chart-data">
                            <ul class="time-line" v-if="attrList.length">
                                <span class="icon icon-toggle show-up"></span>
                                <li v-for="(attr,index) in attrList">
                                    <div class="time-date">

                                        <span class="time-pointer"></span>
                                        <span class="time-day" v-if="index === 0">{{attr.time.split(' ')[0]}}</span>
                                        <span class="time-day"
                                              v-if="index > 0 && new Date(attrList[index-1].time.split(' ')[0]).getTime() !== new Date(attr.time.split(' ')[0]).getTime()">
                                            {{attr.time.split(' ')[0]}}
                                            </span>
                                        <span class="time-hour">{{attr.time.split(' ')[1]}}</span>
                                    </div>
                                    <div class="time-lable">
                                        <div class="time-title" @click="showEvent(index,$event)">
                                                <span class="icon icon-arrow-down pull-left"
                                                      :style="foldDetails[index] ? 'transform: rotate(180deg)' : ''">
                                                </span>
                                            <span>{{attr.eventName}}</span>
                                        </div>
                                        <transition name="fade">
                                            <div class="time-table" v-show="foldDetails[index]">
                                                <table>
                                                    <tbody :data-no-data="$t('common.noData')">
                                                    <tr v-for="datum in Math.ceil(attr.attrs.length/2)">
                                                        <td>{{attr.attrs[2 * datum - 2].attrName}}</td>
                                                        <td :class="attr.attrs.length != 1 ?'line-r':''">
                                                            {{attr.attrs[2 * datum - 2].attrVal}}
                                                        </td>
                                                        <td v-if="attr.attrs[2 * datum - 1]">
                                                            {{attr.attrs[2 * datum - 1].attrName}}
                                                        </td>
                                                        <td v-if="attr.attrs[2 * datum - 1]">
                                                            {{attr.attrs[2 * datum - 1].attrVal}}
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </transition>

                                    </div>
                                </li>
                                <span class="icon icon-toggle show-down"
                                      :class="currentPage >= pageCount?'un-active':''" @click="addPages"></span>
                            </ul>
                            <block-empty v-else/>
                        </div>
                    </div>
                </div>
                <div class="main-right pull-right">
                    <div class="right-title">{{'eventAnalysis.userAttribute' | t}}</div>
                    <ul class="right-content">
                        <li v-for="item in properties" v-if="properties.length" class="properties">
                            <div>
                                <span class="title-r">{{item.name}}</span>
                                <p>{{item.value ? item.value : `[${$t('eventAnalysis.unknown')}]`}}</p>
                            </div>
                        </li>
                        <li v-if="!properties.length" class="properties">
                            {{'common.noData' | t}}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { QueryApi, ContactApiV1, WebServLabelApiV1 } from '@/api';
    import debounce from 'lodash/debounce';
    import {format, startOfWeek} from 'date-fns';
    import downCsv from '../common/utils/downloadUtils';
    import LINKS from '../LINKS';
    //引入echart
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/chart/bar';
    import 'echarts/lib/component/tooltip';
    //引入 translate
    import {translate} from '@/locales';
    import { mapState } from 'vuex';

    //根据id去重
    function unique(arr) {
        const seen = new Map();
        return arr.filter((a) => {
            return !seen.has(a.id) && seen.set(a.id, 1);
        });
    }

    export default {
        data() {
            return {
                haveEventAjax: false,
                currentPage: 1,
                pageCount: 0,
                label: [],
                properties: [],
                foldDetails: [],
                cancelBarBtn: false,
                lastData: {
                    event: [],
                    unit: '',
                    attrbute: []
                },

                allAttributeList: [],
                attribute: [],
                attrList: [],
                eventTimeList: {},//事件按时间
                eventList: [],//事件按事件次数
                LabelEvent: [],
                allEventList: [],//获得所有事件
                events: [],

                fromDate: '',////事件按时间开始时间
                eventFromDate: '',//事件按时间结束时间
                toDate: '',//事件按事件开始时间
                eventToDate: '',//事件按事件结束时间

                unit: '',
                userId: this.$route.params.id,
                eventLabelList: [],
                sequence: [],
            };
        },
        created() {
            if (this.saveUserSetting) {
                this.unit = this.saveUserSetting.unit;
                this.eventFromDate = this.fromDate = this.saveUserSetting.fromDate;
                this.eventToDate = this.toDate = this.saveUserSetting.toDate;
            } else {
                const today = new Date();
                this.unit = 'day';
                this.eventFromDate = format(startOfWeek(today, {weekStartsOn: 1}), 'YYYY-MM-DD') + ' 00:00:00';
                this.eventToDate = format(today, 'YYYY-MM-DD') + ' 23:59:59';
                this.fromDate = format(startOfWeek(today, {weekStartsOn: 1}), 'YYYY-MM-DD') + ' 00:00:00';
                this.toDate = format(today, 'YYYY-MM-DD') + ' 23:59:59';
            }
        },
        mounted() {
            this.myChartPie = echarts.init(this.$refs.chartPie);
            this.myChartBar = echarts.init(this.$refs.chartBar);

            this.getLabelList();
            this.getUserProperties();
            // canvas自适应
            window.addEventListener('resize', this.resizeChart, false);
        },
        beforeRouteLeave(to, from, next) {
            window.removeEventListener('resize', this.resizeChart, false);
            localStorage.removeItem('saveUserSetting' + this.user.cid);
            next();
        },
        watch: {
            currentPage() {
                this.getUserSequence(true);
            }
        },
        computed: {
            ...mapState(['loading', 'user']),
            unfold: {
                get() {
                    if (this.foldDetails.length === 0) return false;
                    let TLength = this.foldDetails.filter(list => list).length;
                    let FLength = this.foldDetails.filter(list => !list).length;
                    let length = this.foldDetails.length;
                    if (TLength === length) {
                        return true;
                    }
                    if (FLength === length) {
                        return false;
                    }
                },
                set(val) {
                    this.foldDetails = this.attrList.map(() => val);
                }
            },
            crumbs() {
                let crumbs = [];
                const userListQuery = {timeStamp: this.$route.query.timeStamp};
                const query = this.originalDate.bmsId !== '' || this.originalDate.bookmarkId !== ''
                    ? {bmsId: this.originalDate.bmsId || this.originalDate.bookmarkId}
                    : {timeStamp: this.$route.query.timeStamp};
                switch (this.$route.name) {
                    case 'eventUserBehavior':
                        crumbs = [
                            {name: 'index', text: 'Dmartech'},
                            {text: this.$t('eventAnalysis.analysis'), name: 'event', query},
                            {text: this.$t('eventAnalysis.userList'), name: 'eventUserList', query: userListQuery},
                        ];
                        break;
                    case 'userBehavior':
                        crumbs = [
                            {name: 'index', text: 'Dmartech'},
                            {text: this.$t('attributeAnalysis.attributeAnalysis'), name: 'attribute', query},
                            {text: this.$t('eventAnalysis.userList'), name: 'attributeUserList', query: userListQuery},
                        ];
                        break;
                    case 'groupUserBehavior':
                        crumbs = [
                            {name: 'index', text: 'Dmartech'},
                            {
                                text: this.$t('home.userGroup'),
                                name: 'userGroup',
                                params: {id: this.$route.params.groupId},
                                query: userListQuery
                            },
                            {
                                text: this.$t('eventAnalysis.userList'),
                                name: 'groupUserList',
                                params: {id: this.$route.params.groupId},
                                query: userListQuery
                            },
                        ];
                        break;
                }
                crumbs.push(
                    {
                        text: this.$t('visualization.userBehavior'),
                        name: 'userBehavior',
                        query: this.$route.query
                    }
                );
                return crumbs;
            },
            saveUserSetting() {
                return JSON.parse(localStorage.getItem('saveUserSetting' + this.user.cid))
                    ? JSON.parse(localStorage.getItem('saveUserSetting' + this.user.cid)) : '';
            },
            optionEventTips() {
                if (this.LabelEvent.length === 0) {
                    return `${this.$t('visualization.chooseEvent')}`;
                } else if (this.LabelEvent.length === this.allEventList.length) {
                    return `${this.$t('visualization.whole')} (${this.LabelEvent.length}) ${this.$t('common.selectedB')}`;
                }
                return `${this.LabelEvent.length} ${this.$t('common.selectedB')}`;
            },
            optionAttrTips() {
                if (this.attribute.length === 0) {
                    return `${this.$t('visualization.chooseAttribute')}`;
                } else if (this.attribute.length === this.allAttributeList.length) {
                    return `${this.$t('visualization.whole')}(${this.attribute.length})${this.$t('common.selectedB')}`;
                }
                return `${this.attribute.length}${this.$t('common.selectedB')}`;
            },
            isSame() {
                if (this.unit !== this.lastData.unit) {
                    return false;
                }
                if (this.allEventList.length === 0) {
                    return false;
                }
                if (this.fromDate !== this.eventFromDate) {
                    return false;
                }
                if (this.toDate !== this.eventToDate) {
                    return false;
                }
                if (JSON.stringify(this.LabelEvent.sort()) !== this.lastData.event) {
                    return false;
                }
                return true;
            },
            range() {
                return {
                    start: this.fromDate,
                    end: this.toDate
                };
            },
            originalDate() {
                return JSON.parse(localStorage.getItem(this.$route.query.timeStamp));
            },
            time() {
                return [
                    {text: translate('common.day'), value: 'day'},
                    {text: translate('common.week'), value: 'week'},
                    {text: translate('common.month'), value: 'month'}
                ];
            }
        },
        methods: {
            resizeChart: debounce(function () {
                this.myChartPie.resize();
                this.myChartBar.resize();
            }),
            filterAttr(val) {
                let allAttributeList = [];
                val.forEach(list => {
                    allAttributeList = allAttributeList.concat(list.attributes);
                });
                return unique(allAttributeList)
                    .map(list => ({
                        attrGenre: list.attrGenre,
                        attrType: list.attrType,
                        id: list.id,
                        name: list.meaning,
                        attrLength: list.attrLength
                    }));
            },
            //选择时间维度
            chooseUnit(value) {
                this.unit = value;
                this.refresh();
            },
            //行为序列翻页
            addPages() {
                this.currentPage < this.pageCount ? this.currentPage++ : this.currentPage = this.pageCount;
            },
            //获得用户行为序列
            getUserSequence(flag = false) {
                this.$loading();
                let events = [];
                this.LabelEvent.forEach(id => {
                    this.allEventList.forEach(list => {
                        if (id === list.id) {
                            events.push(list);
                        }
                    });
                });
                let eventprops = events.map(list => ({
                    eventId: list.id,
                    props: list.attributes.map(list => list.id)
                }));
                let sequence = this.sequence.map(item => ({
                    attrGenre: item.attrGenre,
                    attrId: item.id,
                    attrName: item.name,
                    numberPrecision: item.attrLength
                }));
                this.lastData.attribute = JSON.stringify(this.attribute.sort());
                //最后一次请求 存储数据
                localStorage.setItem('saveUserSetting' + this.user.cid, JSON.stringify({
                    attribute: this.sequence,
                    events: events,
                    unit: this.unit,
                    fromDate: this.fromDate,
                    toDate: this.toDate
                }));
                events = events.map(list => ({
                    eventId: list.id,
                    eventName: list.name,
                }));
                ContactApiV1
                    .getSequence({
                        cid: this.user.cid,
                        eventIds: events,
                        events: eventprops,
                        fromDate: this.eventFromDate,
                        pagination: {
                            pageNum: this.currentPage,
                            pageSize: 20
                        },
                        propIds: sequence,
                        rollup: this.rollup,
                        toDate: this.eventToDate,
                        unit: this.unit,
                        userId: this.userId

                    })
                    .then(({body: {data}}) => {
                        if (this.currentPage === 1 || !flag) {
                            this.attrList = data.data;
                        } else {
                            this.attrList = this.attrList.concat(data.data);
                        }
                        this.pageCount = data.pageCount;
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            //选择属性
            chooseAttr(val) {
                if (val.length > 0) {
                    this.sequence = val;
                } else {
                    this.sequence = this.allAttributeList.slice(0, 100);
                    this.$toast(this.$t('visualization.defaultAttribute'));
                }
                this.attribute = this.sequence.map(item => item.id);

                if (JSON.stringify(this.attribute.sort()) !== this.lastData.attribute) {
                    this.currentPage = 1;
                    this.getUserSequence();
                }
            },
            //获得事件
            getLabelList() {
                WebServLabelApiV1
                    .getLabelList({
                        type: 0,
                    })
                    .then(({body: {data: {labels}}}) => {
                        this.label = [];
                        labels.forEach((list, idx) => {
                            this.eventLabelList = this.eventLabelList.concat(list.events);
                            if (list.id) {
                                list.index = idx;
                                this.label.push(list);
                            }
                        });
                        //获得用户选择事件或者全选
                        this.allEventList = unique(this.eventLabelList)
                            .map(list => ({
                                id: list.id,
                                name: list.meaning,
                                attributes: list.attributes
                            }));
                        this.eventLabelList = this.allEventList;
                        this.events = this.saveUserSetting
                            ? this.saveUserSetting.events
                                .map(({id}) => this.eventLabelList.find(event => event.id === id))
                            : this.eventLabelList;
                        //获得用户选择属性或者选择前100个
                        this.allAttributeList = this.filterAttr(this.events);
                        this.sequence = this.allAttributeList.slice(0, 100);
                        this.attribute = this.sequence.map(item => item.id);
                        //存储上一次操作
                        this.LabelEvent = this.events.map(list => list.id);
                        this.label.unshift({
                            color: '#fff',
                            events: [],
                            id: '',
                            name: this.$t('visualization.allEvent'),
                        });
                    })
                    .then(() => {
                        this.getAllEventData();
                        this.getUserSequence();
                    });
            },
            //选择标签
            changeLabel(val) {
                if (val.id) {
                    this.eventLabelList = this.label.find(list => list.id === val.id)
                        .events
                        .map(list => ({
                            id: list.id,
                            name: list.meaning,
                            attributes: list.attributes
                        }));
                } else {
                    this.eventLabelList = this.allEventList;
                }
            },
            //选择事件
            chooseEvents(val) {
                //不选事件默认请求所有事件的属性
                let event = val.length > 0 ? val : this.allEventList;
                if (this.LabelEvent.length === 0) {
                    this.$toast(this.$t('visualization.defaultAllEvent'));
                    this.LabelEvent = this.allEventList.map(list => list.id);
                }
                this.events = val;
                this.sequence = this.allAttributeList = this.filterAttr(event);
                this.attribute = this.sequence.map(list => list.id);
                this.refresh();
            },
            //获得用户行为序列
            getUserProperties() {
                if (!this.originalDate) return;
                //储存用户操作
                ContactApiV1
                    .getUserProperties(this.userId)
                    .then(res => {
                        if (res.body.data && res.body.data.attributeList){
                            this.properties = res.body.data.attributeList;
                        }
                    });
            },
            //刷新 val = true 强制刷新
            refresh(val) {
                if (this.haveEventAjax) {
                    this.myChartBar.dispatchAction({
                        type: 'downplay',
                        seriesName: this.optionBar.xAxis.data,
                    });
                    this.cancelBarBtn = false;
                }
                if (!this.isSame || val === true) {
                    this.eventFromDate = this.fromDate;
                    this.eventToDate = this.toDate;
                    this.currentPage = 1;
                    this.getAllEventData();
                    this.getUserSequence();
                }
            },
            //当两组分组的请求都完成以后再将选项拼接起来
            async getAllEventData() {
                await Promise.all([this.getUserEvent(true), this.getUserEvent(false)]);
            },
            getUserEvent(rollup) {
                let events = [];
                this.LabelEvent.forEach(id => {
                    this.allEventList.forEach(list => {
                        if (id === list.id) {
                            events.push(list);
                        }
                    });
                });
                events = events.map(list => ({
                    eventId: list.id,
                    eventName: list.name,
                }));
                this.lastData.unit = this.unit;
                this.lastData.event = JSON.stringify(this.LabelEvent.sort());
                let fromDate = rollup ? this.eventFromDate : this.fromDate;
                let toDate = rollup ? this.eventToDate : this.toDate;
                this.$loaded();
                QueryApi
                    .getUserEvents({
                        cid: this.user.cid,
                        events: events,
                        fromDate: fromDate,
                        rollup: rollup,
                        toDate: toDate,
                        unit: this.unit,
                        userId: this.userId
                    })
                    .then(({body: {data}}) => {
                        if (!data) {
                            this.haveEventAjax = false;
                            return;
                        }
                        this.haveEventAjax = true;
                        this.eventTimeList = data;
                        if (rollup) {
                            this.eventList = data.rows.map(item => ({
                                name: item.eventName,
                                value: item.value
                            }));
                            this.$loaded();
                            this.$nextTick(() => {
                                this.chartPie();
                            });
                        } else {
                            this.$nextTick(() => {
                                this.$loading();
                                this.chartBar();
                            });
                        }
                    });
            },
            //获得时间
            rangeChange(newRange) {
                this.fromDate = newRange.start;
                this.toDate = newRange.end;
                this.refresh(true);
            },
            //画出报表
            chartBar() {
                let _this = this;
                this.myChartBar.resize();
                let fromDate, toDate;
                this.myChartBar.on('click', function (params) {
                    function filterTime(time) {
                        let date = new Date(time);
                        let month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
                        let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
                        return date.getFullYear() + '-' + month + '-' + day;
                    }

                    _this.myChartBar.dispatchAction({
                        type: 'downplay',
                        seriesName: _this.optionBar.xAxis.data,
                    });
                    _this.myChartBar.dispatchAction({
                        type: 'highlight',
                        dataIndex: params.dataIndex,
                    });
                    _this.cancelBarBtn = true;
                    let clickTime;
                    switch (_this.unit) {
                        case 'day':
                            fromDate = params.name;
                            toDate = params.name;
                            break;
                        case 'week':
                            fromDate = filterTime(params.name.split('当周')[0]);
                            toDate = filterTime(new Date(params.name.split('当周')[0]).getTime() + 7 * 24 * 3600 * 1000);
                            break;
                        case 'month':
                            clickTime = new Date(params.name.split('月')[0]);
                            fromDate = filterTime(clickTime);
                            clickTime.setMonth(clickTime.getMonth() + 1);
                            clickTime.setDate(0);
                            toDate = filterTime(clickTime);
                            break;
                    }
                    _this.eventFromDate = fromDate + ' 00:00:00';
                    _this.eventToDate = toDate + ' 24:00:00';
                    _this.getUserEvent(true);
                    _this.getUserSequence();
                });


                this.optionBar = {
                    color: ['#3398DB'],
                    title: {
                        text: this.$t('visualization.eventAmount'),
                        x: 'left',
                        textStyle: {
                            color: '#999',
                        }
                    },
                    tooltip: {
                        //trigger: 'axis',
                    },
                    grid: {
                        top: '12%',
                        left: '3%',
                        right: '4%',
                        bottom: '100px',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            type: 'category',
                            data: this.eventTimeList.series,
                            axisTick: {
                                alignWithLabel: true,
                                show: false
                            }
                        }
                    ],
                    yAxis: [
                        {
                            axisLine: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            splitLine: {
                                lineStyle: {
                                    type: 'dotted'
                                }
                            }
                        }
                    ],
                    dataZoom: [
                        {
                            type: 'slider',
                            show: true,
                            xAxisIndex: [0],
                            start: 0,
                            end: 100,
                            top: 'bottom',
                            left: '80%',
                            right: '80%',
                            bottom: 'auto',
                        }],
                    series: {
                        type: 'bar',
                        name: this.$t('visualization.timesEvent'),
                        itemStyle: {
                            emphasis: {
                                color: '#0cc2a9'
                            }
                        },
                        data: this.eventTimeList.values
                    },
                };
                this.myChartBar.setOption(this.optionBar, true);
            },
            //饼图
            chartPie() {
                this.myChartPie.resize();
                let time = this.eventFromDate.split(' ')[0] === this.eventToDate.split(' ')[0]
                    ? this.eventFromDate.split(' ')[0]
                    : this.eventFromDate.split(' ')[0] + this.$t('eventAnalysis.to') + this.eventToDate.split(' ')[0];
                this.optionPie = {
                    color: [
                        '#3398DB', '#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae', '#749f83',
                        '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'
                    ],
                    title: {
                        text: time + this.$t('visualization.profile'),
                        x: 'center',
                        textStyle: {
                            color: '#999',
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: `{a} <br/> {b}: {c} ${this.$t('visualization.times')}，${this.$t('visualization.proportion')} {d}%`
                    },
                    legend: {
                        type: 'scroll',
                        orient: 'vertical',
                        right: 10,
                        top: 20,
                        bottom: 20
                    },
                    series: [
                        {
                            name: this.$t('visualization.eventName'),
                            type: 'pie',
                            barWidth: '50%',
                            radius: ['40%', '60%'],
                            center: ['50%', '60%'],
                            label: {
                                normal: {
                                    formatter: '{b} \n {d}%'
                                }
                            },
                            data: this.eventList,
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                this.myChartPie.setOption(this.optionPie, true);
            },
            //展开事件明细
            showEvent(index) {
                this.$set(this.foldDetails, index, !this.foldDetails[index]);
            },
            //下载csv文件
            downBehavior() {
                //储存用户操作
                let attrs = this.originalDate.userListData.attrs;
                attrs = attrs.map(list => ({
                    attrGenre: list.attrGenre,
                    attrId: list.id,
                    attrName: list.meaning,
                }));
                let sendObj = {
                    cid: this.user.cid,
                    eventIds: this.LabelEvent.map(list => ({
                        eventId: list
                    })),
                    propIds: this.attribute.map(list => ({
                        attrId: list
                    })),
                    userAttrs: attrs,
                    userId: this.userId,
                    fromDate: this.fromDate,
                    toDate: this.toDate
                };
                downCsv(
                    'post',
                    'param',
                    JSON.stringify(sendObj),
                    LINKS.QUERY_API_BASE + '/api/export/user/properties'
                );
            }
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../common/scss/base/variables";
    @import "../common/scss/base/mixin";

    .user-behavior {
        .main-left {
            position: relative;
            width: 70%;
            height: auto;
            .content-l {
                position: relative;
                border: 1px solid $border-color;
                margin-bottom: 24px;
                background: #fff;
                .chart-conditons {
                    @include clearfix();
                    .time-btn {
                        display: inline-block;
                        border: 1px solid $border-color;
                        background: #fff;
                        border-radius: 4px;
                        overflow: hidden;
                        height: $input-field-height;

                        button {
                            width: auto;
                            height: 100%;
                            margin: 0;
                            border: none;
                            outline: none;
                            cursor: pointer;
                            padding: 1px 13px;
                        }

                        .active {
                            color: white;
                            background-color: $theme;
                            border-color: $theme;
                        }
                    }
                }
                .chart-top {
                    @include clearfix();
                    line-height: $input-field-height;
                    height: $input-field-height;
                    padding: 16px;
                    background: $title-bg;
                    .fold {
                        &:hover {
                            color: #fff;
                            background: $green;
                        }
                    }
                    .event-select {
                        width: 120px;
                    }

                    .inline {
                        display: inline-block;
                        vertical-align: top;
                        margin-left: 18px;
                    }
                }
                .cancel-btn {
                    position: absolute;
                    right: 16px;
                    top: 72px;
                    z-index: 1;
                }
                .chart-data {
                    padding: 16px 18px;
                    .chart-main {
                        height: 300px;
                        margin: 0 auto
                    }
                }
                .time-line {
                    margin: 30px 0;
                    list-style: none;
                    position: relative;
                    min-height: 40px;
                    padding-top: 1px;

                    /* The line */
                    &:before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 24px;
                        bottom: 0;
                        width: 4px;
                        margin-left: -11px;
                        background: $border-color;
                    }
                    .show-up, .show-down {
                        position: absolute;
                        left: 25px;
                        font-size: 30px;
                        margin: 0 0 0 -25px;
                        color: $border-color;
                    }
                    .show-up {
                        top: -30px;
                    }
                    .show-down {
                        bottom: -30px;
                        transform: rotate(180deg);
                        cursor: pointer;
                        color: $green;
                        &.un-active {
                            cursor: inherit;
                            color: $border-color;
                        }
                    }
                    > li {
                        position: relative;
                        margin: 20px 0;
                        cursor: pointer;
                        @include clearfix();
                        .time-date {
                            position: relative;
                            margin-left: calc(18px + 24px);
                            color: $color-light-content;
                            margin-bottom: 8px;
                            .time-day {
                                font-weight: bold;
                                margin-right: 8px;
                            }
                        }
                        // The icons
                        .time-pointer {
                            position: absolute;
                            left: -30px;
                            top: 5px;
                            width: 6px;
                            height: 6px;
                            background: $border-color;
                            border-radius: 50%;
                            &:before, &:after {
                                content: '';
                                display: block;
                                position: absolute;
                                width: 6px;
                                height: 6px;
                                background: #fff;
                            }
                            &:before {
                                top: 6px;
                            }
                            &:after {
                                top: -6px;
                            }
                        }
                        .time-lable {
                            margin-left: calc(24px + 18px);
                            position: relative;
                            width: calc(100% - 24px - 18px);
                            border: 1px solid $border-color;
                            border-radius: 4px;
                            .time-title {
                                padding-left: 18px;
                                height: $input-field-height;
                                line-height: $input-field-height;
                                background-color: $form-border;
                                cursor: pointer;
                            }
                            .time-table {
                                z-index: $index-container;
                                position: relative;
                                overflow: hidden;
                                table {
                                    border-collapse: collapse;
                                    border: none;
                                    margin: 20px;
                                    width: calc(100% - 40px);
                                    td {
                                        width: 180px;
                                        padding: 8px;
                                        &:nth-child(2n-1) {
                                            text-align: right;
                                            width: 150px;
                                            padding-right: 10px;
                                            color: $color-title;
                                        }
                                    }
                                    .line-r {
                                        border-right: 1px solid $border-color;
                                        padding-right: 10px;
                                    }
                                    tbody:empty:before {
                                        display: block;
                                        text-align: center;
                                        font-style: italic;
                                        content: attr(data-no-data);
                                    }
                                }
                            }
                            .icon-arrow-down {
                                margin-right: 8px;
                            }
                        }

                    }
                }
            }
        }
        .main-right {
            position: relative;
            width: 26%;
            height: auto;
            border: 1px solid $border-color;
            border-radius: 3px;
            margin-bottom: 20px;
            background: #fff;
            .right-title {
                position: relative;
                height: 40px;
                line-height: 40px;
                padding: 0 16px;
                border-bottom: 1px solid $border-color;
                background: $title-bg;
            }
            .right-content {
                span {
                    display: block;
                }
                .properties {
                    padding: 16px 20px;
                    line-height: 20px;
                    @include ellipsis();
                    + .properties {
                        border-top: 1px dashed $border-color;
                    }
                }
                .title-r {
                    color: $color-light-content;
                }
            }
        }
    }
</style>
