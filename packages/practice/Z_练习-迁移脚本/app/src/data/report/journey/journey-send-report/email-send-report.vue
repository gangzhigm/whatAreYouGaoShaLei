<template>
    <div class="email-send-report">
        <div class="page-content">
            <div class="content-view back">
                <button class="btn btn-theme btn-md" @click="back">{{'form.bcList' | t}}</button>
            </div>
            <div class="content-view margin report-header">
                {{'data.reportSource' | t}}:
                <journey-task-select :useItems="'export'" :id="journeyId"
                                     :date="dateRange" :taskType="0"
                                     :source="dataSourceId" :customizePartCuts="partCuts"
                                     @select="chosenJourney($event)"
                                     @groupIdQuery="currentGroupId"
                                     @currentJourneyType="currentJourneyType"/>
                <task-selector class="hg" :options="taskList" v-model="taskIdList" @search="searchTask" 
                          @load="loadMoreTask"  v-if="journeyId" @select="selectTask" type="checkSelect" :shortcutAction="true"
                          search="async" :listName="listName" :placeholder="$t('data.selectTask')" @hide="hideTask" @checkOptions="changeTaskId" @confirm="confirmTask"/>
                <div class="edit-area pull-right">
                    <div class="download-action" @click="taskPK">
                        <span class="PK">PK</span>
                    </div>
                    <div class="download-action">
                        <svg aria-hidden="true"
                            @click="goToEmailReport">
                            <use xlink:href="#icon-download"></use>
                        </svg>
                    </div>
                </div>
            </div>
            <div class="content-view margin">
                <div class="charts">
                    <!-- 1. 邮件发送概览 -->
                    <div class="chart half right-margin">
                        <div class="chart-head">
                            <h5>
                                {{'data.Summary' | t}}
                            </h5>
                            <span class="disabled-text" :title="$t('data.realTimes')">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <div class="chart-body lg" :class="{empty: sendTotal.length===0 && !sendTotal_loading}"
                             :no-data="$t('common.noData')">
                            <div class="table" v-if="sendTotal.length!==0 && !sendTotal_loading">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>{{'data.Type' | t}}</th>
                                        <th>{{'data.number' | t}}</th>
                                        <th>{{'data.percentage' | t}}</th>
                                        <th>{{'data.Actions' | t}}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-for="(item,index) in sendTotal">
                                        <td>{{item.name}} &nbsp;
                                            <span class="icon icon-help" v-title:right.line="item.title"
                                                  v-if="item.title"></span>
                                        </td>
                                        <td>{{item.number}}</td>
                                        <td>{{item.percentage}}</td>
                                        <td>
                                            <span class="view-details" v-if="index === 0" @click="viewDetails(item)">
                                                {{'controller.viewDetail' | t}}
                                            </span>
                                            <span v-else>-</span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <ring-loading v-if="sendTotal_loading"/>
                        </div>
                    </div>
                    <!-- 2. 邮件独立点击转化漏斗（基于独立收件人行为统计） -->
                    <div class="chart half">
                        <div class="chart-head">
                            <h5>{{'data.emailPerformances' | t}}
                                <span class="icon icon-help" v-title="$t('data.emailTip')"></span>
                            </h5>
                            <span class="disabled-text" :title="$t('data.realTimes')">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <div class="chart-body lg" ref="sendStatusFunnel" :no-data="$t('common.noData')"
                             :class="{empty: sendTotal.length===0 && !charts.sendStatusFunnel_loading}"></div>
                    </div>
                    <!-- 3. 邮件服务商占比 -->
                    <div class="chart" :class="slimLayout ? 'half' : 'one-third right-margin'">
                        <div class="chart-head down-done">
                            <div class="header-left">
                                <h5>{{'data.emailPercentage' | t}}</h5>
                                <span class="disabled-text over-text" :title="$t('data.realTimes')">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                            </div>
                            <div class="download-action" @click="downLoadDetail('emailPercentage')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-download"></use>
                                </svg>
                            </div>
                        </div>
                        <div class="chart-body md"
                             :class="{empty: servicesProportion.length===0&&!servicesProportion_loading}"
                             :no-data="$t('common.noData')">
                            <div class="table" v-if="servicesProportion.length!==0&&!servicesProportion_loading">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>{{'data.serviceProvider' | t}}</th>
                                        <th>{{'data.recipientNum' | t}}</th>
                                        <th>{{'data.percentage' | t}}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-for="email in servicesProportion">
                                        <td>{{email.service}}</td>
                                        <td>{{email.serviceCount}}</td>
                                        <td>{{email.serviceProportion}} %</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <ring-loading v-if="servicesProportion_loading"/>
                        </div>
                    </div>
                    <!-- 4. 打开设备占比 -->
                    <div class="chart" :class="slimLayout ? 'half right-margin' : 'one-third right-margin'">
                        <div class="chart-head down-done">
                            <div class="header-left">
                                <h5>{{'data.openOpePercentege' | t}}</h5>
                                <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            </div>
                            <div class="download-action" @click="downLoadDetail('openOpePercentege')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-download"></use>
                                </svg>
                            </div>
                        </div>
                        <div class="chart-body md" ref="devicesProportion" :no-data="$t('common.noData')"
                             :class="{empty: charts.devicesProportion_no_data && !charts.devicesProportion_loading}"></div>
                    </div>
                    <!-- 5. 链接点击Top5 -->
                    <div class="chart" :class="slimLayout ? 'half' : 'one-third'">
                        <div class="chart-head down-done">
                            <div class="header-left">
                                <h5>
                                    {{'data.linkClick' | t}}
                                </h5>
                                <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            </div>
                            <div class="download-action" @click="downLoadDetail('linkClick')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-download"></use>
                                </svg>
                            </div>
                        </div>
                        <div class="chart-body md" :class="{empty: top5Links.length === 0 && !top5Links_loading}"
                             :no-data="$t('common.noData')">
                            <div class="table" v-if="top5Links.length !== 0 && !top5Links_loading">
                                <table>
                                    <thead>
                                    <tr>
                                        <th>{{'data.linkTitle' | t}}</th>
                                        <th>{{'data.linkAddress' | t}}</th>
                                        <th>{{'data.numbers' | t}}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-for="(link, index) of top5Links">
                                        <td :title="link.linkName">{{link.linkName}}</td>
                                        <td :title="link.linkUrl"><a :href="link.linkUrl"
                                                                     target="_blank">{{link.linkUrl}}</a></td>
                                        <td width="50px">{{link.linkCount}}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <ring-loading v-if="top5Links_loading"/>
                        </div>
                    </div>
                    <!--6. 不同国家EDM打开/点击情况-->
                    <div class="chart">
                        <div class="chart-head down-done">
                            <div class="header-left">
                                <h5>{{'data.EDMMapTitle' | t}}</h5>
                                <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            </div>
                            <div class="download-action" @click="downLoadDetail('EDMMapTitle')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-download"></use>
                                </svg>
                            </div>
                        </div>
                        <div class="EDM-content">
                            <div class="table chart-body" v-show="!charts.EDMOpen_loading"
                                 :class="{empty: !EDMOpenList.length}" :no-data="$t('common.noData')">
                                <table v-if="EDMOpenList.length">
                                    <thead>
                                    <tr>
                                        <th>{{'data.country' | t}}</th>
                                        <th>{{'data.open' | t}}</th>
                                        <th>{{'data.clicks' | t}}</th>
                                    </tr>
                                    </thead>
                                </table>
                                <div class="scroll tbody" ref="scrollBox">
                                    <table>
                                        <tbody ref="scrollTbody">
                                        <tr v-for="(email,index) in EDMOpenList" @mousemove="showMapTip(index)"
                                            @mouseleave="hiddenMapTip"
                                            :class="{'active': currentCountry === email.country}">
                                            <td>{{email.country}}</td>
                                            <td>{{email.values[0]}}</td>
                                            <td>{{email.values[1]}}</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="chart-body md emd-open" :class="{'full-width': charts.EDMOpen_loading}"
                                 v-show="charts.EDMOpen_loading || EDMOpenList.length" ref="EDMOpen"></div>
                        </div>
                    </div>
                    <!--自定义图表-->
                    <div class="chart white-block" v-if="customLoading">
                        <ring-loading></ring-loading>
                    </div>
                    <template v-if="!customLoading">
                        <div class="chart" v-for="custom in customMapList" :key="custom.id">
                            <div class="chart-head down-done">
                                <h5>
                                    {{custom.name}}
                                    <button class="btn icon icon-close pull-right"
                                            v-title="$t('common.del')"
                                            @click="delCurrentCustomMap(custom.id)"></button>
                                </h5>
                                <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            </div>
                            <div ref="customs" class="chart-body md"
                                 :class="{empty: !custom.conditionList || !custom.conditionList.length}"
                                 :no-data="$t('common.noData')"></div>
                        </div>
                    </template>
                </div>
                <!--创建新报表-->
                <div class="create-map">
                    <transition name="drop">
                        <div class="create-map-content" v-show="createMapOpen"
                             @click="showCreateMapModal = true">{{'data.createNewMap' | t}}
                        </div>
                    </transition>
                    <div class="pull-down" @click="createMapOpen = !createMapOpen">
                        <svg class="down-arrow" :class="[createMapOpen ? 'turn-on' : 'turn-off']">
                            <use xlink:href="#icon-arrow-down"></use>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
        <modal class="create-map-modal" :title="$t('data.createNewMap')" :size="'lg'" @close="closeCreateNewMap"
               v-if="showCreateMapModal">
            <div class="form-field">
                <label class="label">{{'tag.name' | t}}</label>
                <input type="text" class="input" v-model.trim="newMapName" maxlength="30">
            </div>
            <div class="form-field">
                <label class="label">{{'eventAnalysis.norm' | t}}</label>
                <multi-select :options="dataTypeList" v-model="newMapIndex" :dropDirection="'bottom'"
                              :shortcutAction="false" :placeholder="$t('common.selectHolder')"
                              @change="selectNewMapIndex"></multi-select>
            </div>
            <div class="form-field flex">
                <label class="label">{{'metaData.userAttr' | t}}</label>
                <index-selector v-model="newMapUserAttribute" :selectType="'userAttribute'"></index-selector>
            </div>
            <div class="form-field flex">
                <label class="label"></label>
                <div>
                    <div class="disabled-text caution-box">{{'data.cautionTag' | t}}</div>
                    <div class="caution-box">
                        <p class="disabled-text">{{'data.userAttrAttention' | t}}</p>
                        <p class="disabled-text">{{'data.userAttrAttentionSub' | t}}</p>
                    </div>
                </div>
            </div>
            <button slot="buttons" class="btn btn-md btn-white" @click="closeCreateNewMap">{{'common.cancel' | t}}
            </button>
            <button slot="buttons" class="btn btn-md btn-theme"
                    :disabled="saving" @click="saveNewMapData">{{'data.saveAndDraw' | t}}
            </button>
        </modal>
        <!--下载内容modal-->
        <download-modal v-if="showDownloadModal" :inputTheme="currentDownloadName"
                        @confirm="downloadConfirm" @cancel="showDownloadModal = false"></download-modal>
        <!--发送统计查看详情-->
        <view-email-send-details ref="controllerInfo" :emailDetails="emailDetails" @closeDetails="closeDetails"
                                 :journeyType ="journeyType" :totalSent="totalSent"
                                 v-if="detailsFlag" :cycleJoyNumFlag="false"></view-email-send-details>
    </div>
</template>
<script>
    import { ContactApiV1, ContactApiV2, ContactExportApiV1, JourneyApiV1, JourneyApiV2} from '@/api';
    import {getChartInstance, resize, showLoading, hideLoading} from '../chartUtils/chartUtils';
    import {
        getAnnularOption,
        getFunnelOption,
        getNormalWorldMapOption,
        getCustomReport
    } from '../chartUtils/chartOptions';
    import {getDateInstance} from '../../../../common/utils/dateUtils';
    import format from 'date-fns/format';
    import addDays from 'date-fns/add_days';
    import subDays from 'date-fns/sub_days';
    import Range from '../../../../common/components/date-range/Range';
    import journeyTaskSelect from '../components/journey-task-select.vue';
    import indexSelector from '../components/index-selector.vue';
    import emailJourneyCompared from './email-journey-compared.vue';
    import {customIndicatorField} from '../customIndicatorField';
    import downloadModal from '../components/download-modal.vue';
    import ringLoading from '../components/ring-loading.vue';
    import viewEmailSendDetails from '../../../../journey/draggable-form/canvas/controller/sub-controllers/email-controller/view-email-send-details.vue';
    import taskSelector from '../components/task-selector.vue';

    const LOCAL_JOURNEY_DATA = 'LOCAL_JOURNEY_DATA';
    export default {
        data() {
            return {
                slimLayout: false, // 宽度过小时使用紧凑布局
                // 下载数据弹出层
                searchType: 0,
                emailAddress: '',
                emailAddressError: '',
                contacts: [],
                // 图表
                charts: {
                    sendStatusFunnel: null,         // 邮件独立点击转化漏斗 （基于独立收件人行为统计）
                    sendStatusFunnel_loading: true,
                    devicesProportion: null,
                    devicesProportion_loading: true,
                    devicesProportion_no_data: false,        // PC/Mobile独立打开 没有数据
                    EDMOpen: null,                  // 不同国家EDM打开/点击情况
                    EDMOpen_loading: true,
                },
                resizer: null,

                // 数据
                taskStatus: {
                    clickCount: 0,          //点击
                    hardbounce: 0,          //硬弹
                    openCount: 0,           //打开总数
                    ownClick: 0,            //独立点击
                    ownCto: 0,              //独立打开率CTO
                    ownOpen: 0,             //独立打开
                    pushBilling: 0,         //收件人数
                    sendNumber: 0,          //发送总数
                    sendSuccess: 0,         //送达总数
                    softbounce: 0,          //软弹
                    unSubscribe: 0          //退订
                },
                top5Links: [],
                top5Links_loading: true,
                countSum: 0,
                personSum: 0,
                dataSourceList: [
                    {name: this.$t('data.byDates'), id: 0},
                    {name: this.$t('data.byJourney'), id: 1}
                ],
                dataSourceId: 1,
                dateRange: {
                    startDate: '',
                    endDate: ''
                },
                journeyList: [], // 所有旅程列表
                journeyId: null,
                pageNumber: 1,
                totalPage: 1,
                taskList: [],
                taskId: '',
                taskIdList:[], //复选框id
                allChecked:false,//全选
                pageNumberTask: 1,
                totalPageTask: 1,
                loading: false,
                loadingTask: false,
                keyWordTask: '',
                keyWord: '',
                journeyInstantiationId: '',
                journeyName: '',
                taskName: '',
                taskCopyAddress: '',
                endDate: '',
                sendDate: '',
                sendTotal: [],
                sendTotal_loading: true,
                servicesProportion: [],// 邮件服务商占比
                servicesProportion_loading: true,
                EDMOpenList: [], //不同国家EDM打开/点击情况数据列表
                createMapOpen: true, // 创建报表交互
                // 新建报表modal
                showCreateMapModal: false,
                newMapName: '',
                dataTypeList: customIndicatorField.filter(elm => elm.type === 'normal'), // 新建报表指标列表
                newMapIndex: [],
                newMapUserAttribute: [], // 用户属性
                customMapList: [],    // 已建的自定义图表数据列表
                currentCountry: '',
                customMap: [],
                updateDate: '',
                saving: false, //新增图表保存中
                partCuts: ['YESTERDAY', 'TODAY', 'LAST_WEEK', 'THIS_WEEK', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],
                showDownloadModal: false, // 展示下载图表内容modal
                currentDownloadName: '', // 当前点击下载的主题名
                customLoading: false,
                detailsFlag: false,//详情弹窗显隐
                journeyType: -1, //发送列表页的邮件详情 此处周期旅程不显示查询 避免调用"根据旅程模板id查询旅程实例id集合"
                emailDetails: {taskIdList:''},//邮件任务详情
                totalSent: 0,
                currentGroup: '',
                journeyNameList:[],
                totalRow:'',
                pageSize:100,
                totalTask:'',
                originTaskList:[],
            };
        },
        computed: {
            email() {
                return this.$store.state.user.email;
            },
            date() {
                if (this.taskId <= 0) {
                    const end = format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                        start = format(subDays(end, 30));
                    const r = new Range(start, end);
                    return {
                        dates: r.getDatesInStr(),
                        startDate: format(r.start, 'YYYY-MM-DD'),
                        endDate: format(r.end, 'YYYY-MM-DD'),
                    };
                }
                // 根据当前任务算出日期区间 [任务开始时间, 任务结束时间+30天]
                const start = getDateInstance(this.sendDate),
                    end = this.endDate ? getDateInstance(this.endDate) : start;
                let r = new Range(start, addDays(end, 30));
                return {
                    dates: r.getDatesInStr(),
                    startDate: format(r.start, 'YYYY-MM-DD'),
                    endDate: format(r.end, 'YYYY-MM-DD')
                };
            },
            listName(){
                let selectorTitle = '已选择（' + this.taskIdList.length + '/' + this.totalTask + ')';
                return selectorTitle;
            },
        },
        created() {
            this.reLayout();
        },
        async mounted() {
            let journeyData = JSON.parse(localStorage.getItem(LOCAL_JOURNEY_DATA));
            if (journeyData) {
                this.dataSourceId = journeyData.dataSourceId ? 1 : 0;
                this.dateRange = journeyData.dateRange || {startDate: '', endDate: ''};
                this.journeyId = journeyData.journeyId > 0 ? journeyData.journeyId : null;
                this.taskId = journeyData.taskId || null;
                if (journeyData.taskId && typeof (journeyData.taskId) === 'object') {
                    this.taskIdList.push(...journeyData.taskId);
                } else if (journeyData.taskId && typeof (journeyData.taskId) !== 'object') {
                    this.taskIdList.push(journeyData.taskId);
                }
                this.emailDetails.taskIdList = this.taskIdList;
                // 回显旅程和任务
                if (this.journeyId) {
                    await this.checkerTask([], this.taskIdList);
                    this.resizer = resize(this.charts);
                    window.addEventListener('resize', this.resizer);
                    window.addEventListener('resize', this.mapResize);
                    this.renderCharts();
                }
            }
            this.$nextTick(() => {
                this.getUpdateDate();
            });
        },
        beforeRouteLeave(to, from, next) {
            if (to.meta.auth === 'journeyReport') {
                let journeyData = {
                    journeyId: this.journeyId,
                    dataSourceId: this.dataSourceId,
                    dateRange: this.dateRange,
                    taskId: this.taskIdList
                };
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
            } else {
                localStorage.removeItem(LOCAL_JOURNEY_DATA);
            }
            window.removeEventListener('resize', this.resizer);
            window.removeEventListener('resize', this.mapResize);
            next();
        },
        methods: {
            async renderCharts() {
                // 初始化图表实例
                // chart1
                this.sendTotal_loading = true;
                // chart2
                this.charts.sendStatusFunnel_loading = true;
                this.charts.sendStatusFunnel = getChartInstance(this.$refs.sendStatusFunnel);
                showLoading(this.charts.sendStatusFunnel);
                // chart3
                this.servicesProportion_loading = true;
                //chart4
                this.charts.devicesProportion_loading = true;
                this.charts.devicesProportion = getChartInstance(this.$refs.devicesProportion);
                showLoading(this.charts.devicesProportion);
                // chart5
                this.top5Links_loading = true;
                // chart6
                this.charts.EDMOpen_loading = true;
                this.charts.EDMOpen = getChartInstance(this.$refs.EDMOpen);
                showLoading(this.charts.EDMOpen);
                // chart custom
                this.customLoading = true;
                this.devicesProportion_loading = true;
                if (this.taskIdList.length === 0) {
                    this.sendTotal_loading = false;
                    this.charts.sendStatusFunnel_loading = false;
                    this.servicesProportion_loading = false;
                    this.charts.devicesProportion_loading = false;
                    this.top5Links_loading = false;
                    this.charts.EDMOpen_loading = false;
                    this.clearCharts();
                    return;
                }
                // chart1.选中任务id且任务id不为全部时，接口只传任务id，否则只传旅程id
                // let taskId = this.taskId > 0 ? this.taskId : null;
                let taskIdList = this.allChecked ? null : [...this.taskIdList];
                if (this.allChecked === false && taskIdList.length === 0) {
                    return;
                }
                // let journeyId = this.taskId && this.taskId > 0 ? null : this.journeyId;
                let journeyId = this.allChecked ? this.journeyId : null;
                const {body: {data: taskStatus}} = await JourneyApiV1
                    .getEmailTaskStatistics(taskIdList, journeyId); 
                this.taskStatus = taskStatus;
                this.sendTotal = [
                    {
                        name: this.$t('data.sendNum'),
                        title: this.$t('data.tip1'),
                        number: taskStatus.pushBilling,
                        percentage: '100%'
                    },
                    {
                        name: this.$t('data.sendSum'),
                        title: this.$t('data.tip2'),
                        number: taskStatus.sendSuccess,
                        percentage: taskStatus.pushBilling ? (taskStatus.sendSuccess / taskStatus.pushBilling * 100).toFixed(0) + '%' : '--'
                    },
                    {
                        name: this.$t('data.softBounces'),
                        title: this.$t('data.tip3'),
                        number: taskStatus.softbounce,
                        percentage: taskStatus.pushBilling ? (taskStatus.softbounce / taskStatus.pushBilling * 100).toFixed(0) + '%' : '--'
                    },
                    {
                        name: this.$t('data.hardBounces'),
                        title: this.$t('data.tip4'),
                        number: taskStatus.hardbounce,
                        percentage: taskStatus.pushBilling ? (taskStatus.hardbounce / taskStatus.pushBilling * 100).toFixed(0) + '%' : '--'
                    },
                    {
                        name: this.$t('data.renders'),
                        title: this.$t('data.tip5'),
                        number: taskStatus.totalRenders,
                        percentage: '--'
                    },
                    {
                        name: this.$t('data.uniqueRenders'),
                        title: this.$t('data.tip6'),
                        number: taskStatus.uniqueRenders,
                        percentage: taskStatus.sendSuccess ? (taskStatus.uniqueRenders / taskStatus.sendSuccess * 100).toFixed(0) + '%' : '--'
                    },
                    {name: this.$t('data.browser'), title: '', number: taskStatus.browser, percentage: '--'},
                    {name: this.$t('data.emailClient'), title: '', number: taskStatus.mailApp, percentage: '--'},
                    {
                        name: this.$t('data.independenceOpenNum'),
                        title: this.$t('data.tip7'),
                        number: taskStatus.ownOpen,
                        percentage: taskStatus.sendSuccess ? (taskStatus.ownOpen / taskStatus.sendSuccess * 100).toFixed(0) + '%' : '--'
                    },
                    {
                        name: this.$t('data.clickNum'),
                        title: this.$t('data.tip8'),
                        number: taskStatus.clickCount,
                        percentage: '--'
                    },
                    {
                        name: this.$t('data.independenceClickNum'),
                        title: this.$t('data.tip9'),
                        number: taskStatus.ownClick,
                        percentage: taskStatus.sendSuccess ? (taskStatus.ownClick / taskStatus.sendSuccess * 100).toFixed(0) + '%' : '--'
                    },
                    {
                        name: this.$t('data.opeCTO'),
                        title: this.$t('data.tip10'),
                        number: '--',
                        percentage: taskStatus.ownCto + '%'
                    },
                    {
                        name: this.$t('data.complaint'),
                        title: this.$t('data.tip11'),
                        number: taskStatus.spamcomplaints,
                        percentage: taskStatus.sendSuccess ? (taskStatus.spamcomplaints / taskStatus.sendSuccess * 100).toFixed(0) + '%' : '--'
                    },
                    {
                        name: this.$t('data.unSubscriber'),
                        title: this.$t('data.tip12'),
                        number: taskStatus.unSubscribe,
                        percentage: taskStatus.sendSuccess ? (taskStatus.unSubscribe / taskStatus.sendSuccess * 100).toFixed(0) + '%' : '--'
                    },
                ];
                this.sendTotal_loading = false;
                // chart 2 邮件独立点击转化漏斗 （基于独立收件人行为统计）
                this.charts.sendStatusFunnel
                    .setOption(getFunnelOption([
                        {name: this.$t('data.sent'), value: this.taskStatus.pushBilling},
                        {name: this.$t('data.opened'), value: this.taskStatus.ownOpen},
                        {name: this.$t('data.accept'), value: this.taskStatus.sendSuccess},
                        {name: this.$t('data.clicked'), value: this.taskStatus.ownClick}
                    ]));
                hideLoading(this.charts.sendStatusFunnel);
                this.charts.sendStatusFunnel_loading = false;
                // chart 3 服务商占比
                ContactApiV1
                    .servicesProportion(this.journeyInstantiationId, taskIdList) 
                    .then(res => {
                        if (res.body.data.servicesProportionList) {
                            this.servicesProportion = res.body.data.servicesProportionList
                                .sort((a, b) => b.serviceCount - a.serviceCount);
                        }
                        this.servicesProportion_loading = false;
                    })
                    .catch(() => {
                        this.servicesProportion_loading = false;
                    });

                // chart 4 打开设备占比
                this.charts.devicesProportion_no_data = false;
                ContactApiV1
                    .devicesProportion(this.journeyInstantiationId, taskIdList, journeyId)
                    .then(({body: {data: {pcOrMobileOpen}}}) => {
                        if (this.$refs.devicesProportion) {
                            if (Object.keys(pcOrMobileOpen).length === 0) {
                                this.charts.devicesProportion.clear();
                                this.charts.devicesProportion_no_data = true;
                            } else {
                                this.charts.devicesProportion_no_data = false;
                                this.charts.devicesProportion
                                    .setOption(getAnnularOption([
                                        {name: 'Mobile', value: pcOrMobileOpen.mobile},
                                        {name: 'PC', value: pcOrMobileOpen.pc},
                                        {name: this.$t('data.unKnow'), value: pcOrMobileOpen.another}
                                    ], 'email'));
                            }
                        } else {
                            this.charts.devicesProportion.clear();
                            this.charts.devicesProportion_no_data = true;
                        }
                        hideLoading(this.charts.devicesProportion);
                        this.charts.devicesProportion_loading = false;
                    })
                    .catch(() => {
                        this.charts.devicesProportion.clear();
                        this.charts.devicesProportion_no_data = true;
                        hideLoading(this.charts.devicesProportion);
                        this.charts.devicesProportion_loading = false;
                    });

                // chart 5 链接独立点击Top5
                this.top5Links_loading = true;
                ContactApiV1
                    .getLinkTop5(this.journeyInstantiationId, taskIdList, journeyId) 
                    .then(({body: {data: {linkClickRanking}}}) => {
                        //按照点击量排序
                        linkClickRanking = linkClickRanking.sort(function (a, b) {
                            return b.linkCount - a.linkCount;
                        });
                        this.top5Links = linkClickRanking;
                        this.top5Links_loading = false;
                    })
                    .catch(() => {
                        this.top5Links_loading = false;
                    });

                // chart 6 不同国家点击/打开情况
                this.EDMOpenList = [];
                ContactApiV1
                    .getContactMapData({taskInstantiationIds: taskIdList, journeyTemplateId: journeyId}) 
                    .then(({body: {data}}) => {
                        if (this.charts.EDMOpen) this.charts.EDMOpen.clear();
                        if (Object.keys(data.contactMap).length) {
                            for (let keys in data.contactMap) {
                                this.EDMOpenList.push({country: keys, values: data.contactMap[keys].split(',')});
                            }
                            // 判断是解决快速进入离开时，因为页面离开，接口pending，EDMopen的dom不在存在的问题。
                            if (this.$refs.EDMOpen) {
                                // this.charts.EDMOpen = getChartInstance(this.$refs.EDMOpen);
                                let legends = [this.$t('data.open'), this.$t('data.clicks')];
                                this.charts.EDMOpen.setOption(getNormalWorldMapOption(this.EDMOpenList, [], legends));

                                // 地图图表hover跳转到对应列表数据
                                this.charts.EDMOpen.on('mouseover', (param) => {
                                    this.currentCountry = param.data ? param.data.name : '';
                                    // 若出现滚动条，滚动条需滚动到相应数据附近
                                    if (this.$refs.scrollTbody.clientHeight > 300) {
                                        let curIndex = this.EDMOpenList.findIndex(edm =>
                                            edm.country === this.currentCountry);
                                        let trHeight = this.$refs.scrollTbody.childNodes[0].clientHeight;
                                        this.$refs.scrollBox.scrollTop = curIndex * trHeight;
                                    }
                                });
                                this.charts.EDMOpen.on('mouseleave', () => {
                                    this.currentCountry = '';
                                    this.$refs.scrollBox.scrollTop = 0;
                                });
                            }
                        } else {
                            this.charts.EDMOpen.clear();
                        }
                        if (!this.EDMOpenList.length) {
                            this.charts.EDMOpen.clear();
                        }
                        hideLoading(this.charts.EDMOpen);
                        this.charts.EDMOpen_loading = false;
                    })
                    .catch(() => {
                        this.charts.EDMOpen.clear();
                        hideLoading(this.charts.EDMOpen);
                        this.charts.EDMOpen_loading = false;
                    });

                // chart n 自定义图表
                this.getAndDrawCustomMap();
            },
            reLayout() {
                this.slimLayout = window.innerWidth <= 1250;
            },
            // 切换数据来源
            clearData() {
                this.dateRange = {
                    startDate: '',
                    endDate: ''
                };
                this.journeyId = null;
                this.journeyName = '';
                this.taskName = '';
                this.taskId = ''; 
                this.pageNumber = 1;
                this.totalPage = 1;
                this.pageNumberTask = 1;
                this.totalPageTask = 1;
                this.journeyList = [];
                this.taskList = [];
                this.taskIdList = [];
            },
            checkerTask(taskList = [], id) {
                // recover task
                const vm = this;
                let targetTask;
                // targetTask = taskList.find(task =>
                //     task.id === id
                // );
                targetTask = taskList.filter((task)=>{
                    if (id.indexOf(task.id) !== -1) {
                        return task;
                    }
                });
                if (vm.totalPageTask >= vm.pageNumberTask && targetTask.length === 0) {
                    return vm.loadMoreTask(this.checkerTask);
                }
                // if (targetTask) {
                //     vm.taskId = id;
                //     let task = taskList.map((item) => {
                //         if (item.id === id) {
                //             return item;
                //         }
                //     });
                //     this.taskName = task[0].name;
                //     this.copyAddress = task[0].copyAddress;
                // }
            },
            // 选择任务
            selectTask(task) {
                this.emailDetails.taskId = task.journeyTemplateId;
                this.endDate = task.endDate;
                this.taskName = task.name;
                this.copyAddress = task.copyAddress;
                this.journeyInstantiationId = task.journeyInstantiationId;
                this.taskId = task.id;
                this.keyWordTask = '';
                this.pageNumberTask = 1;
                this.taskList = [];
                this.clearCharts();
                // 回显选中的任务
                this.checkerTask([], task.id);
                this.$nextTick(() => {
                    this.renderCharts();
                });
            },
            changeTaskId(){
                this.allChecked = this.taskIdList.length === this.originTaskList.length ? true : false;
                this.emailDetails.taskIdList = this.taskIdList;
                this.emailDetails.allChecked = this.allChecked;
                if (this.totalRow > this.pageSize) {
                    this.pageSize = this.totalRow;
                    this.pageNumberTask = 1;
                    this.taskList = [];
                    this.checkerTask([], this.taskIdList);
                }
            },
            confirmTask() {
                this.hideTask();
                if (this.taskIdList.length === 0) {
                    this.clearCharts();
                    this.customMap = [];    //清空自定义图表
                    this.customMapList = [];
                    return ;
                }
                this.$nextTick(() => {
                    this.renderCharts();
                });
            },
            chosenJourney(data) {
                this.dataSourceId = data.selectType;
                this.dateRange = data.dateRange;
                this.journeyId = data.id;
                this.taskId = '';
                this.taskName = '';
                this.pageNumberTask = 1;
                this.totalPageTask = 1;
                this.taskList = [];
                this.taskIdList = [];
                if (this.journeyId) {
                    // 获取该旅程下的所有任务列表
                    this.loadMoreTask();
                    this.renderCharts();
                } else {
                    this.clearCharts();
                }
                let journeyData = {
                    journeyId: this.journeyId,
                    dataSourceId: this.dataSourceId,
                    dateRange: this.dateRange,
                };
                localStorage.setItem(LOCAL_JOURNEY_DATA, JSON.stringify(journeyData));
            },
            clearCharts() {
                // chart1
                this.taskStatus = {
                    clickCount: 0,          //点击
                    hardbounce: 0,          //硬弹
                    openCount: 0,           //打开总数
                    ownClick: 0,            //独立点击
                    ownCto: 0,              //独立打开率CTO
                    ownOpen: 0,             //独立打开
                    pushBilling: 0,         //收件人数
                    sendNumber: 0,          //发送总数
                    sendSuccess: 0,         //送达总数
                    softbounce: 0,          //软弹
                    unSubscribe: 0          //退订
                };
                this.sendTotal = [];
                // chart2
                this.charts.sendStatusFunnel.clear();
                // chart3
                this.servicesProportion = [];
                // chart4
                this.charts.devicesProportion.clear();
                this.charts.devicesProportion_no_data = true;
                // chart5
                this.top5Links = [];
                // chart6
                this.charts.EDMOpen.clear();
            },
            hideTask() {
                this.keyWordTask = '';
                this.pageNumberTask = 0;
                // this.taskList = [];
                this.loadMoreTask(this.checkerTask);
            },
            searchTask(taskName) {
                this.pageNumberTask = 1;
                this.totalPageTask = Infinity;
                this.keyWordTask = taskName.trim();
                // this.taskList = [];
                this.loadMoreTask();
            },
            async loadMoreTask(checkerTask) {
                if (this.loadingTask) return;
                if (this.pageNumberTask > this.totalPageTask) return;
                this.loadingTask = true;
                // 获取endDate和sendDate之后再画图
                await JourneyApiV2
                    // 0:邮件,1:短信,2:微信
                    .getTasks([], '', [this.journeyId], this.pageNumberTask++, this.keyWordTask, '', 0,
                        this.allChecked === false ? this.taskIdList : null, this.pageSize)
                    .then(({body: {data: {taskInstantiationList, totalPage, totalRow}}}) => {
                        this.totalPageTask = totalPage;
                        taskInstantiationList.forEach((item)=>{
                            item.name = item.emailSendingTime.slice(5,10) + ' ' + item.name;
                        });
                        this.taskList = taskInstantiationList;
                        this.totalRow = totalRow;
                        if (!this.keyWordTask) {
                            this.totalTask = totalRow;
                            this.originTaskList = taskInstantiationList;
                        }
                        // let idx = this.taskList.findIndex(task => task.id === -1);
                        // if (this.taskList && this.taskList.length !== 0 && idx < 0) {
                        //     this.taskList.unshift({id: -1, name: this.$t('data.emailSummary')});
                        // }
                        this.journeyName = taskInstantiationList[0].journeyName;
                        this.endDate = taskInstantiationList[0].endDate;
                        this.sendDate = taskInstantiationList[0].sendDate;
                        this.journeyInstantiationId = taskInstantiationList[0].journeyInstantiationId;
                        this.loadingTask = false;
                        this.$nextTick(() => {
                            this.loadingTask = false;
                            if (typeof checkerTask === 'function') {
                                checkerTask(taskInstantiationList, this.taskIdList);
                            }
                        });
                    })
                    .catch(() => {
                        this.loadingTask = false;
                        this.pageNumberTask--;
                    });
            },
            back() {
                this.$router.push({
                    name: 'journeySendReport'
                });
            },
            goToEmailReport() {
                this.$router.push({
                    name: 'exportOriginalData'
                });
            },
            // 任务PK
            taskPK() {
                if (this.taskIdList.length < 2 || this.taskIdList.length > 4) {
                    this.journeyNameList = '';
                } else {
                    let task = this.taskList.filter((item)=>{
                        return this.taskIdList.indexOf(item.id) !== -1;
                    });
                    this.journeyNameList = task.map((item)=>{
                        return {name: `${item.journeyName} - ${item.name}（${item.sendDate}）`,id: item.id};
                    });
                }
                this.$router.push({
                    name: 'emailJourneyCompared',
                    query:{
                        sendDate:this.dateRange.startDate,
                        endDate:this.dateRange.endDate,
                        journeyId:this.journeyId,
                        taskId: this.taskIdList, 
                        dataSourceId: this.dataSourceId,
                        currentGroup: this.currentGroup,
                        journeyNameList:JSON.stringify(this.journeyNameList)
                    }
                });
            },
            // hover列表表数据显示图表tooltip
            showMapTip(cur) {
                this.charts.EDMOpen.dispatchAction({
                    type: 'showTip',
                    seriesIndex: 0,
                    dataIndex: cur
                });
            },
            hiddenMapTip() {
                this.charts.EDMOpen.dispatchAction({type: 'hideTip'});
            },
            // 关闭新建图表modal
            closeCreateNewMap() {
                this.showCreateMapModal = false;
                this.newMapName = '';
                this.newMapIndex = [];
                this.newMapUserAttribute = [];
            },
            selectNewMapIndex() {
                if (this.newMapIndex.length > 4) {
                    this.$toast(this.$t('data.mostMeasures'), 'warn');
                    this.newMapIndex.pop();
                }
            },
            // 保存自定义图表信息
            saveNewMapData() {
                this.saving = true;
                let setIndex = this.newMapUserAttribute.filter(arr => arr.userAttribute !== '' || arr.relation !== '');
                if (!this.newMapName || !this.newMapIndex.length || !setIndex.length) {
                    this.saving = false;
                    return this.$toast(this.$t('data.refineData'), 'warn');
                }
                if (setIndex.length && setIndex.filter(
                    attr => attr.relation === '' ||
                        attr.userAttribute === '' ||
                        (attr.values === '' && attr.relation === 1) ||
                        (!attr.values.length && attr.relation === 2)
                ).length) {
                    this.saving = false;
                    return this.$toast(this.$t('data.refineData'), 'warn');
                }
                let canIUseUserAttribute = this.newMapUserAttribute.filter(({userAttribute, relation, values}) =>
                    userAttribute !== '' && (values !== '' || values.length || relation === 3));
                let postData = {
                    conditionJson: canIUseUserAttribute.map(
                        // eslint-disable-next-line camelcase
                        ({userAttribute, field_name, field_type, relation, values}) => {
                            let relationString = '';
                            switch (relation) {
                                case 1:
                                    relationString = 'eq';
                                    break;
                                case 2:
                                    relationString = 'belong';
                                    break;
                                case 3:
                                    relationString = 'exists';
                                    break;
                            }
                            return {
                                field_id: userAttribute,
                                field_name,
                                field_type,
                                operation: relationString,
                                value: values
                            };
                        }),
                    name: this.newMapName,
                    target: this.newMapIndex,
                };
                ContactApiV2
                    .createNewMap(postData)
                    .then(() => {
                        this.$toast(this.$t('common.createSuccess'), 'success');
                        this.saving = false;
                        this.closeCreateNewMap();
                        this.getAndDrawCustomMap();
                    })
                    .catch(err => {
                        this.saving = false;
                        this.$toast(err.message, 'warn');
                    });
            },
            // 获取自定义图表
            getAndDrawCustomMap() {
                this.customLoading = true;
                this.customMap = [];
                this.customMapList = [];
                ContactApiV2 
                    .getJourneyDetailsReports(this.allChecked === true ? '' : this.taskIdList, this.journeyInstantiationId)
                    .then(({body: {data}}) => {
                        this.customLoading = false;
                        this.customMapList = data.journeyReportList || [];
                        this.$nextTick(() => {
                            this.customMapList.forEach((elm, cur) => {
                                // custom是由customMapList决定的 进入到当前页接口还未走完， 就离开当前页，导致custom‘丢失’
                                if (this.$refs.customs && this.$refs.customs.length) {
                                    this.customMap.push(getChartInstance(this.$refs.customs[cur]));
                                    let mapData = {};
                                    if (!elm.conditionList.length || !elm.conditionList[0].taskList.length ||
                                        !elm.conditionList[0].taskList[0].targetList) {
                                        mapData.valueName = [];
                                        mapData.mapContent = [];
                                        this.customMap[cur].clear();
                                    } else {
                                        mapData.valueName = !elm.conditionList[0].taskList ? [] :
                                            elm.conditionList[0].taskList[0].targetList.map(elm =>
                                                this.dataTypeList.$getByKey(elm.target).name);
                                        mapData.mapContent = elm.conditionList.map(
                                            ({field, fieldValue, operation, taskList}) => {
                                                return {
                                                    name: `${field}${operation}${fieldValue}`,
                                                    value: taskList.length > 0 ?
                                                        taskList[0].targetList.map(target => target.value) : [],
                                                };
                                            });
                                        this.customMap[cur].setOption(getCustomReport(mapData));
                                    }
                                }
                            });
                        });
                        this.devicesProportion_loading = false;
                    })
                    .catch(() => {
                        this.customLoading = false;
                        this.devicesProportion_loading = false;
                    });
            },
            // 删除自定义列表
            delCurrentCustomMap(id) {
                this.$confirm(this.$t('common.delete'), this.$t('common.deleteSure'))
                    .then(res => {
                        if (res) {
                            ContactApiV2
                                .delCustomMap(id)
                                .then(() => {
                                    this.$toast(this.$t('common.deleteSuccess'), 'success');
                                    this.getAndDrawCustomMap();
                                });
                        }
                    });
            },
            mapResize() {
                this.customMap.forEach(elm => {
                    elm.resize();
                });
            },
            // 获取页面更新时间
            getUpdateDate() {
                JourneyApiV1
                    .getUpdateDate('journey', this.$route.params && this.$route.params.journeyInstantiationId || null)
                    .then((res) => {
                        this.updateDate = res.body.data.date;
                    });
            },
            // 报告下载
            downLoadDetail(type) {
                
                if (this.taskIdList.length === 0) {
                    return this.$toast(this.$t('data.selectTask'), 'warn');
                }
                if (this.taskIdList.length > 1) {
                    return this.$toast(this.$t('data.downLoadWarn'), 'warn');
                }
                this.showDownloadModal = true;
                this.currentDownloadName = this.$t(`data.${type}`);
            },
            // 点击下载
            downloadConfirm(downloadData) {
                this.showDownloadModal = false;
                let filterArr = this.taskList.filter(arr => arr.id !== -1);

                // taskId = -1 为邮件汇总
                let data = {
                    email: downloadData.sendEmail,
                    title: downloadData.theme,
                    type: downloadData.fileType,
                    uniCode: downloadData.dataType,
                    journeyInstantiationId: this.journeyInstantiationId,
                    // taskInstantiationId: this.taskId !== -1 ? this.taskId : filterArr.map(arr => arr.id)
                    //     .toString()
                    taskInstantiationId: this.allChecked === false ? this.taskIdList : filterArr.map(arr => arr.id)
                        .toString()
                };
                let t = this.$t;
                switch (this.currentDownloadName) {
                    case t('data.emailPercentage'):
                        this.downloadEmailPecentage(downloadData);
                        break;
                    case t('data.openOpePercentege'):
                        this.downloadOpenPercentege(data);
                        break;
                    case t('data.linkClick'):
                        this.downloadLinkClick(data);
                        break;
                    case t('data.EDMMapTitle'):
                        this.downloadEDMMapTitle(data);
                        break;
                }
            },
            // 下载邮件服务商
            downloadEmailPecentage(data) {
                let filterArr = this.taskList.filter(arr => arr.id !== -1);
                let downloadData = {
                    email: data.sendEmail,
                    title: data.theme,
                    type: data.fileType,
                    uniCode: data.dataType,
                    // 接口参数需求
                    // journeyInstantiationIds: this.taskId !== -1 ? this.journeyInstantiationId :
                    //     filterArr.map(() => this.journeyInstantiationId),
                    // journeyTemplateIds: this.taskId !== -1 ? this.journeyId : filterArr.map(() => this.journeyId),
                    // taskInstantiationIds: this.taskId !== -1 ? this.taskId : filterArr.map(arr => arr.id),
                    journeyInstantiationIds: this.allChecked === false ? this.journeyInstantiationId :
                        filterArr.map(() => this.journeyInstantiationId),
                    journeyTemplateIds: this.allChecked === false ? this.journeyId : filterArr.map(() => this.journeyId),
                    taskInstantiationIds: this.allChecked === false ? this.taskIdList : filterArr.map(arr => arr.id),
                };

                ContactExportApiV1
                    .downloadServicesProportion(downloadData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                    });
            },
            // 下载设备独立打开
            downloadOpenPercentege(downloadData) {
                ContactExportApiV1
                    .downloadOpenProportion(downloadData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                    });
            },
            // 下载链接独立点击top5
            downloadLinkClick(downloadData) {
                ContactExportApiV1
                    .downloadLinkClick(downloadData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                    });
            },
            // 下载联系人活跃
            downloadEDMMapTitle(downloadData) {
                ContactExportApiV1
                    .downloadContactMap(downloadData)
                    .then(() => {
                        this.$toast(this.$t('data.acceptEmail'), 'success');
                    });
            },
            //发送统计查看详情
            viewDetails(item) {
                this.totalSent = item.number;
                this.detailsFlag = true;
                this.$nextTick(()=>{
                    this.$refs.controllerInfo.toGetEmailDetail(
                        this.journeyType, this.taskIdList);
                });
            },
            closeDetails(flag){
                this.detailsFlag = flag;
            },
            currentGroupId(groupId) {
                this.currentGroup = groupId;
            },
            //获取当前选中旅程
            currentJourneyType(journeyType) {
                this.journeyType = journeyType;
            }
        },
        components: {
            journeyTaskSelect,
            indexSelector,
            emailJourneyCompared,
            downloadModal,
            showLoading,
            hideLoading,
            ringLoading,
            viewEmailSendDetails,
            taskSelector
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .email-send-report {
        .page-content {
            height: calc(100vh - 168px);
        }

        .report-header {
            padding: 16px;
            line-height: $input-field-height;
            background-color: white;
            position: relative;

            .journey-task-select {
                display: inline-block;

                .date-range {
                    vertical-align: middle;
                }

                .journey-picker {
                    width: unset;
                }
            }

            .edit-area {
                display: inline-flex;
            }
        }

        .back {
            margin-top: 24px;
        }

        .EDM-content {
            display: flex;

            .table {
                display: inline-block;
                width: 30%;

                &.empty {
                    margin: 0 auto;
                }
            }

            .emd-open {
                display: inline-block;
                width: 70%;

                &.full-width {
                    margin: 0 auto;
                }
            }

            .scroll {
                max-height: 300px;
                overflow: auto;
            }
        }

        .create-map {
            position: relative;
            margin-bottom: 25px;

            .create-map-content {
                width: 100%;
                background: #fff;
                padding: 15px 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                color: $green;
                cursor: pointer;
            }

            // 向下按钮
            .pull-down {
                position: absolute;
                left: 48.5%;
                width: 3%;
                height: 10px;
                line-height: 10px;
                background-color: $green;
                text-align: center;
                border: none;
                border-radius: 0 0 4px 4px;
                cursor: pointer;
                @include transition(all .3s ease);
                //向下箭头
                .down-arrow {
                    width: 1em;
                    height: .8em;
                    fill: #fff;
                    @include transition(all .3s ease);
                }

                .turn-on {
                    transform: rotate(180deg) scale(1, 0.5);
                }

                .turn-off {
                    transform: rotate(0deg) scale(1, 0.5);
                }
            }
        }

        .create-map-modal {
            .modal-content {
                max-height: 600px;
                min-height: 320px;
                overflow: auto;
            }

            .multi-select {
                min-width: 220px;
            }
        }

        .download-action {
            width: 24px;
            height: 24px;
            line-height: 24px;
            border-radius: 50%;
            background-color: $theme;
            text-align: center;
            cursor: pointer;
            margin-right: 5px;

            svg {
                width: 12px;
                height: 12px;
                margin-top: 6px;
                fill: #fff;
            }

            .PK {
                color: #fff;
            }
        }

        .down-done {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .chart-body.empty {
            div {
                display: none;
            }
        }

        .caution-box {
            display: inline-block;
            vertical-align: top;
        }

        .white-block {
            height: 100px;
            background-color: #fff;
        }
        .view-details{
            cursor: pointer;
            color: $green;
        }
        .header-left{
            width: 90%;
            .over-text {
                display: inline-block;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

    }
</style>
