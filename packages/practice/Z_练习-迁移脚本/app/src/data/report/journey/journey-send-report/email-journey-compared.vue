<template>
    <div class="email-journey-compared">
        <div class="page-content">
            <div class="content-view back">
                <button class="btn btn-theme btn-md" @click="back">{{'form.bcList' | t}}</button>
            </div>
            <div class="content-view margin report-header">
                {{'data.reportSource' | t}}:
                <task-compare-selector v-model="currentSelectJourneys" :taskType="0"/>
                <button class="btn btn-theme btn-md" v-if="currentSelectJourneys.taskIds.length"
                        @click="startPK">{{'common.confirm' | t}}</button>
                <div class="download-action pull-right" @click="exportCompareData">
                    <svg aria-hidden="true">
                        <use xlink:href="#icon-download"></use>
                    </svg>
                </div>
                <div class="download-action pull-right">
                    <span class="PK" @click="goBack">
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-arrow-left"></use>
                        </svg>
                    </span>
                </div>
            </div>
            <div class="content-view margin">
                <div class="charts" ref="charts">
                    <!--邮件发送概览-->
                    <div class="chart">
                        <div class="chart-head">
                            <h5>{{'data.emailSendOverview' | t}}</h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <reload v-if="loadError.summary" @reload="getSummaryData(currentSelectJourneys, reloadPostData)"/>
                        <div v-show="!loadError.summary" ref="summary" class="chart-body md"
                             :class="{empty: !emailSummary['browser']}" :no-data="$t('common.noData')"></div>
                    </div>
                    <!--独立点击打开率CTO-->
                    <div class="chart half">
                        <div class="chart-head">
                            <h5>{{'data.opeCTO' | t}}</h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <reload v-if="loadError.summary" @reload="getSummaryData(currentSelectJourneys, reloadPostData)"/>
                        <div v-show="!loadError.summary" ref="opeCTO" class="chart-body md"
                             :class="{empty: !emailOpeCTO.length}" :no-data="$t('common.noData')"></div>
                    </div>
                    <!--邮件独立点击转化-->
                    <div class="chart half right-margin">
                        <div class="chart-head">
                            <h5>{{'data.emailTransfer' | t}}</h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{'data.realTimes' | t}}</span>
                        </div>
                        <reload v-if="loadError.summary" @reload="getSummaryData(currentSelectJourneys, reloadPostData)"/>
                        <div v-show="!loadError.summary" ref="emailTransfer" class="chart-body md"
                             :class="{empty: !emailTransferList.length}" :no-data="$t('common.noData')"></div>
                    </div>
                    <!--邮件服务商占比-->
                    <div class="chart" :class="{'half': serviceHalf}">
                        <div class="chart-head down-done">
                            <div class="header-left">
                                <h5>{{'data.emailPercentage' | t}}</h5>
                                <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            </div>
                            <div class="download-action pull-right" @click="downloadDetail('emailPercentage')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-download"></use>
                                </svg>
                            </div>
                        </div>
                        <reload v-if="loadError.emailPercentage" @reload="getServicesProportion(currentSelectJourneys, reloadPostData)"/>
                        <div v-show="!loadError.emailPercentage" ref="emailPercentage" class="chart-body md"
                             :class="{empty: !emailPercentage.length}" :no-data="$t('common.noData')"></div>
                    </div>
                    <!--打开设备占比-->
                    <div class="chart half right-margin">
                        <div class="chart-head down-done">
                            <div class="header-left">
                                <h5>{{'data.openOpePercentege' | t}}</h5>
                                <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            </div>
                            <div class="download-action pull-right" @click="downloadDetail('openOpePercentege')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-download"></use>
                                </svg>
                            </div>
                        </div>
                        <reload v-if="loadError.openOpePercentage" @reload="getOpenProportion(currentSelectJourneys, reloadPostData)"/>
                        <div v-show="!loadError.openOpePercentage" ref="openOpePercentage" class="chart-body md"
                             :class="{empty: !emailOpenOpePercentage.pc}" :no-data="$t('common.noData')"></div>
                    </div>
                    <!--链接点击Top5 -->
                    <div class="chart half">
                        <div class="chart-head down-done">
                            <div class="header-left">
                                <h5>{{'data.linkClick' | t}}</h5>
                                <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            </div>
                            <div class="download-action pull-right" @click="downloadDetail('linkClick')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-download"></use>
                                </svg>
                            </div>
                        </div>
                        <reload v-if="loadError.top5Links" @reload="getLinkClick(reloadPostData)"/>
                        <div v-show="!loadError.top5Links" class="chart-body md" :class="{empty: top5Links.length === 0}"
                             :no-data="$t('common.noData')">
                            <div class="table top5-link" v-if="top5Links.length !== 0">
                                <table>
                                    <thead>
                                    <tr>
                                        <th v-for="journey in selectJourneyTask.name" :title="journey.name"
                                            :key="journey.id">{{journey.name}}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td class="top5-link-data" v-for="(link, index) of top5Links" :key="index">
                                            <div class="td-flex"
                                                 v-for="(rank,cur) in link.linkClickRanking" :key="cur">
                                                <span>{{rank.linkName}}</span>
                                                <a :href="rank.linkUrl" target="_blank">{{rank.linkUrl}}</a>
                                                <span>{{rank.linkCount}}</span>
                                            </div>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <!--不同国家EDM打开/点击情况-->
                    <div class="chart">
                        <div class="chart-head down-done">
                            <div class="header-left">
                                <h5>{{'data.EDMMapTitle' | t}}</h5>
                                <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                            </div>
                            <div class="download-action pull-right" @click="downloadDetail('EDMMapTitle')">
                                <svg aria-hidden="true">
                                    <use xlink:href="#icon-download"></use>
                                </svg>
                            </div>
                        </div>
                        <reload v-if="loadError.EDM" @reload="getContactMap(currentSelectJourneys, reloadPostData)"/>
                        <div v-show="!loadError.EDM" class="EDM-content">
                            <div class="table chart-body" :class="{empty: !EDMOpenList.length}" :no-data="$t('common.noData')">
                                <table v-if="EDMOpenList.length">
                                    <thead>
                                    <tr>
                                        <th>{{'data.country' | t}}</th>
                                        <th>{{'data.open' | t}}</th>
                                        <th>{{'data.clicks' | t}}</th>
                                    </tr>
                                    </thead>
                                </table>
                                <div class="tbody scroll" ref="scrollBox">
                                    <table>
                                        <tbody ref="scrollTbody">
                                        <tr v-for="(email,index) in EDMOpenList"
                                            :class="{'active': currentCountry === email.country}"
                                            @mousemove="showMapTip(index)" @mouseleave="hiddenMapTip">
                                            <td :title="email.country">{{email.country}}</td>
                                            <!--values: ['open','clicks','open','clicks']-->
                                            <td>
                                                <div class="td-flex">
                                                    <p v-for="(journey,cur) in selectJourneyTask.name"
                                                       :title="journey.name + ': ' + email.values[cur * 2]"
                                                       :key="journey.id + index">
                                                        {{journey.name}}: {{email.values[cur * 2]}}
                                                    </p>
                                                </div>
                                            </td >
                                            <td >
                                                <div class="td-flex">
                                                    <p v-for="(journey,cur) in selectJourneyTask.name"
                                                       :title="journey.name + ': ' + email.values[cur * 2 + 1]"
                                                       :key="journey.id + index">
                                                        {{journey.name}}: {{email.values[cur * 2 + 1]}}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="chart-body md emd-open" ref="EDMOpen"></div>
                        </div>
                    </div>
                    <!--自定义图表-->
                    <div class="chart" v-for="custom in customMapList" :key="custom.id">
                        <div class="chart-head">
                            <h5>{{custom.name}}</h5>
                            <span class="disabled-text">{{'data.statisticsTime' | t}}：{{updateDate}}</span>
                        </div>
                        <reload v-if="loadError.customer" @reload="getCustomer(currentSelectJourneys, reloadPostData)"/>
                        <div v-show="!loadError.customer" ref="customs" class="chart-body md"
                             :class="{empty: !custom.conditionList.length}" :no-data="$t('common.noData')"></div>
                    </div>
                </div>
            </div>
        </div>

        <!--下载内容modal-->
        <download-modal v-if="showDownloadModal" :inputTheme="currentDownloadName"
                        @confirm="downloadConfirm" @cancel="showDownloadModal = false"></download-modal>
    </div>
</template>

<script>
    import {
        ContactApiV2,
        ContactApiV4,
        ContactExportApiV1,
        JourneyApiV1,
        JourneyApiV4
    } from '@/api';
    import journeyTaskSelect from '../components/journey-task-select.vue';
    import {getChartInstance, resize, showLoading, hideLoading} from '../chartUtils/chartUtils';
    import {
        getLineOption,
        normalStackedBarChart,
        getNormalWorldMapOption,
        mapTimeLine,
        emailSendOverview
    } from '../chartUtils/chartOptions';
    import journeyPicker from '../components/journey-picker.vue';
    import taskCompareSelector from '../components/task-compare-selector.vue';
    import {customIndicatorField} from '../customIndicatorField';
    import downloadModal from '../components/download-modal.vue';
    import reload from '../components/reload.vue';
    // 地图数据整理
    function arrangeMapData(list) {
        let allName = [];

        list.forEach(task =>{
            if (task.contactMap.length && Object.keys(task.contactMap[0]).length) {
                allName = allName.concat(task.contactMap.map(elm => Object.keys(elm)[0]));
            }
        });

        allName = [...new Set(allName)];

        let needData = allName.map(name => {
            return {
                country: name,
                values: []
            };
        });

        needData.forEach(need =>{
            list.forEach((task,cur) =>{
                let current = null;
                task.contactMap.forEach(map =>{
                    if (map[need.country] && map[need.country].length) {
                        current = cur;
                        need.values = need.values.concat(map[need.country]);
                    }
                });
                if (current === null) {
                    need.values = need.values.concat([0,0]);
                }
            });
        });

        return needData;
    }

    export default {
        name: 'email-journey-compared',
        components: {
            journeyTaskSelect,
            journeyPicker,
            taskCompareSelector,
            downloadModal,
            reload
        },
        data() {
            return {
                journeyId: null,
                dateRange: {
                    startDate: '',
                    endDate: ''
                },
                dataSourceId: 1,
                charts: {
                    summary: null,  // 邮件发送概览
                    opeCTO: null,   // 独立点击打开率CTO
                    emailTransfer: null, // 邮件独立点击转化
                    emailPercentage: null, // 邮件服务商占比
                    openOpePercentage: null, // 打开设备占比
                    EDMOpen: null,  // 不同国家EDM打开/点击情况
                    custom: null,   // 自定义图表
                },
                emailSummary: [],   // 邮件发送概览数据
                emailOpeCTO: [],    // 独立点击打开率CTO数据
                emailTransferList: [],  // 邮件独立点击转化数据
                emailPercentage: [], // 邮件服务商占比数据
                emailOpenOpePercentage: [], // 打开设备占比数据
                top5Links: [],      // 链接点击Top5数据
                EDMOpenList: [],    // 不同国家EDM打开/点击情况数据
                customMapList: [],  // 自定义图表数据
                top5Links_loading: false,
                resizer: null,
                currentSelectJourneys: {
                    name: [],
                    ids: [],
                    taskIds: []
                },
                currentCountry: '',
                customMap: [],
                emailStatistics: [
                    {name: this.$t('data.recipientNum'),dataName: 'sendNumber'},
                    {name: this.$t('data.sendNum'),dataName: 'pushBilling'},
                    {name: this.$t('data.sendSum'),dataName: 'sendSuccess'},
                    {name: this.$t('data.hardBounce'),dataName: 'hardbounce'},
                    {name: this.$t('data.softBounce'),dataName: 'softbounce'},
                    {name: this.$t('data.unSubscribe'),dataName: 'unSubscribe'},
                    {name: this.$t('data.clickNum'),dataName: 'clickCount'},
                    {name: this.$t('data.independenceClickNum'),dataName: 'ownClick'},
                    {name: this.$t('data.openNum'),dataName: 'openCount'},
                    {name: this.$t('data.independenceOpenNum'),dataName: 'ownOpen'},
                ], // 发送统计内容字段
                dataTypeList: customIndicatorField.filter(elm => elm.type === 'normal'),
                serviceHalf: true,
                selectJourneyTask: [], // 选择并点击确认的任务
                updateDate: '',
                showDownloadModal: false, // 展示下载图表内容modal
                currentDownloadName: '', // 当前点击下载的主题名
                loadError: {
                    summary: false,
                    emailPercentage: false,
                    openOpePercentage: false,
                    top5Links: false,
                    EDM: false,
                    customer: false
                },                      // 请求失败
                reloadPostData: null,   // 用于重加载
            };
        },
        mounted() {
            this.resizer = resize(this.charts);
            window.addEventListener('resize', this.resizer);
            window.addEventListener('resize',this.mapResize);
            this.getUpdateDate();
            if (typeof this.$route.query.taskId === 'string') {
                this.currentSelectJourneys.taskIds.push(Number(this.$route.query.taskId));
            } else {
                this.$route.query.taskId = this.$route.query.taskId.map(item=>Number(item));
                this.currentSelectJourneys.taskIds.push(...this.$route.query.taskId);
            }
            this.currentSelectJourneys.ids.push(Number(this.$route.query.journeyId));
            if (this.$route.query.journeyNameList) {
                this.currentSelectJourneys.name.push(...JSON.parse(this.$route.query.journeyNameList));
            }
            this.currentSelectJourneys.sourceType = Number(this.$route.query.dataSourceId);
            this.currentSelectJourneys.dateRange = {startDate:this.$route.query.sendDate,endDate:this.$route.query.endDate};
        },
        destroyed() {
            window.removeEventListener('resize', this.resizer);
            window.removeEventListener('resize',this.mapResize);
        },
        methods: {
            back() {
                this.$router.replace({
                    name: 'journeySendReport'
                });
            },
            startPK() {
                if (this.currentSelectJourneys.taskIds.length > 4) {
                    return this.$toast(this.$t('data.mostTasks'),'warn');
                }
                if (this.currentSelectJourneys.taskIds.length < 2) {
                    return this.$toast(this.$t('data.atLeaseTwoTask'),'warn');
                }
                let journey = this.currentSelectJourneys;
                this.selectJourneyTask = {...this.currentSelectJourneys}; // just value
                let postData = {
                    journeyInstantionIds: journey.ids,
                    taskInstantiationIds: journey.taskIds
                };

                this.reloadPostData = postData;

                this.getSummaryData(journey, postData);

                this.getOpenProportion(journey, postData);

                this.getServicesProportion(journey, postData);

                this.getContactMap(journey, postData);

                this.getLinkClick(postData);

                this.getCustomer(journey, postData);
            },
            // 导出PDF格式图表
            exportCompareData() {
                if (!this.selectJourneyTask.taskIds) {
                    return this.$toast(this.$t('data.btnSelectTask'),'warn');
                }
                this.$router.push({name: 'exportOriginalData',query: {type: 6,journey: JSON.stringify(this.selectJourneyTask)}});
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
            mapResize() {
                this.customMap.forEach(elm =>{
                    elm.resize();
                });
            },
            // 获取页面更新时间
            getUpdateDate() {
                JourneyApiV1
                    .getUpdateDate('journey', this.selectJourneyTask && this.selectJourneyTask.ids || null)
                    .then((res) => {
                        this.updateDate = res.body.data.date;
                    });
            },
            // 基础数据获取
            getSummaryData(journey, postData) {
                // clear error txt
                this.loadError.summary = false;
                // clear last times data;
                if (this.charts.summary) this.charts.summary.clear();
                if (this.charts.opeCTO) this.charts.opeCTO.clear();
                if (this.charts.emailTransfer) this.charts.emailTransfer.clear();

                this.charts.summary = getChartInstance(this.$refs.summary);
                this.charts.opeCTO = getChartInstance(this.$refs.opeCTO);
                this.charts.emailTransfer = getChartInstance(this.$refs.emailTransfer);
                // showLoading
                showLoading(this.charts.summary);
                showLoading(this.charts.opeCTO);
                showLoading(this.charts.emailTransfer);
                // 发送统计
                JourneyApiV4
                    .getEmailStatistics(postData)
                    .then(({body:{data}}) =>{
                        // hiddenLoading
                        hideLoading(this.charts.summary);
                        hideLoading(this.charts.opeCTO);
                        hideLoading(this.charts.emailTransfer);

                        this.emailSummary = data;
                        let mapData = {
                            valueName: null,
                            mapContent: null
                        };
                        mapData.valueName = journey.name.map(elm => elm.name);
                        mapData.mapContent = this.emailStatistics.map(name =>{
                            return {
                                name: name.name,
                                value: this.emailSummary[name.dataName],
                            };
                        });
                        this.charts.summary.setOption(emailSendOverview(mapData));

                        // 独立点击打开率CTO
                        this.emailOpeCTO = this.emailSummary.ownCto;
                        if (this.emailOpeCTO.length) {

                            let mapData2 = {
                                valueName: null,
                                mapContent: null
                            };
                            mapData2.valueName = [`${this.$t('data.opeCTO')}(%)`];
                            mapData2.mapContent = journey.name.map((name,cur) =>{
                                return {
                                    name: name.name,
                                    value: [this.emailOpeCTO[cur]]
                                };
                            });
                            this.charts.opeCTO.setOption(emailSendOverview(mapData2));
                        }

                        // 独立点击总数  ownClick

                        let selectItems = [
                            {name: this.$t('data.sendNum'),dataName: 'pushBilling'},
                            {name: this.$t('data.sendSum'),dataName: 'sendSuccess'},
                            {name: this.$t('data.independenceOpen'),dataName: 'ownOpen'},
                            {name: this.$t('data.independenceClick'),dataName: 'ownClick'}
                        ];
                        this.emailTransferList = journey.name.map((name,cur) =>{
                            return {
                                name: name.name,
                                value: selectItems.map(elm => this.emailSummary[elm.dataName][cur]),
                            };
                        });

                        this.charts.emailTransfer.setOption(
                            getLineOption(this.emailTransferList,selectItems.map(item => item.name))
                        );
                    })
                    .catch(() =>{
                        this.loadError.summary = true;
                    });
            },
            getOpenProportion(journey, postData) {
                //打开设备占比  (pc/Mobile独立打开)
                this.loadError.openOpePercentage = false;
                if (this.charts.openOpePercentage) this.charts.openOpePercentage.clear();
                this.charts.openOpePercentage = getChartInstance(this.$refs.openOpePercentage);
                showLoading(this.charts.openOpePercentage);
                ContactApiV4
                    .openProportion(postData)
                    .then(({body:{data}}) =>{
                        // hideLoading
                        hideLoading(this.charts.openOpePercentage);
                        this.emailOpenOpePercentage = data;
                        let mapData = {
                            legendName: null,
                            dataName: null,
                            value: null
                        };
                        mapData.dataName = journey.name.map(elm => elm.name);
                        mapData.legendName = Object.keys(this.emailOpenOpePercentage);
                        mapData.value = Object.keys(this.emailOpenOpePercentage).map(elm =>
                            this.emailOpenOpePercentage[elm]);
                        this.charts.openOpePercentage.setOption(normalStackedBarChart(mapData,true));
                    })
                    .catch(() =>{
                        this.loadError.openOpePercentage = true;
                    });
            },

            getServicesProportion(journey, postData) {
                // 邮件服务商占比
                this.loadError.emailPercentage = false;
                if (this.charts.emailPercentage) this.charts.emailPercentage.clear();
                this.charts.emailPercentage = getChartInstance(this.$refs.emailPercentage);
                showLoading(this.charts.emailPercentage);
                ContactApiV4
                    .getServicesProportion(postData)
                    .then(({body: {data: {servicesProportion}}}) =>{
                        // hideLoading
                        hideLoading(this.charts.emailPercentage);
                        this.emailPercentage = servicesProportion;
                        if (this.emailPercentage.length) {
                            let mapData = {
                                legendName: null,
                                dataName: null,
                                value: null
                            };
                            mapData.dataName = journey.name.map(elm => elm.name);
                            mapData.legendName = this.emailPercentage.map(elm => elm.service);
                            this.serviceHalf = mapData.legendName.length < 8;
                            // 服务商区域大小改变 resize
                            this.$nextTick(() =>{
                                this.charts.emailPercentage.resize();
                            });
                            mapData.value = this.emailPercentage.map(elm => elm.serviceCount);

                            this.charts.emailPercentage.setOption(normalStackedBarChart(mapData,true));
                        }
                    })
                    .catch(() =>{
                        this.loadError.emailPercentage = true;
                    });
            },

            getContactMap(journey, postData) {
                // 不同国家EDM打开/点击情况 (联系人活跃)
                this.loadError.EDM = false;
                if (this.charts.EDMOpen) this.charts.EDMOpen.clear();
                this.charts.EDMOpen = getChartInstance(this.$refs.EDMOpen);
                showLoading(this.charts.EDMOpen);
                ContactApiV4
                    .getContactMap(postData)
                    .then(({body: {data: {taskList}}}) =>{
                        // hideLoading
                        const data = this.selectJourneyTask.name.map(item=>{
                            const task = taskList.find(taskItem=> item.id === taskItem.taskid);
                            return {
                                ...task
                            };
                        });
                        hideLoading(this.charts.EDMOpen);
                        this.EDMOpenList = arrangeMapData(data).map(list => list.country).length ?
                            arrangeMapData(data) : [];
                        let legends = [this.$t('data.open'),this.$t('data.clicks')];
                        let journeyNames = journey.name.map(elm => elm.name);
                        this.charts.EDMOpen.setOption(getNormalWorldMapOption(this.EDMOpenList,journeyNames,legends));

                        // 地图图表hover跳转到对应列表数据
                        this.charts.EDMOpen.on('mouseover',(param) =>{
                            this.currentCountry = param.data ? param.data.name : '';
                            // 若出现滚动条，滚动条需滚动到相应数据附近
                            if (this.$refs.scrollTbody.clientHeight > 300) {
                                let curIndex = this.EDMOpenList.findIndex(edm => edm.country === this.currentCountry);
                                let trHeight = this.$refs.scrollTbody.childNodes[0].clientHeight;
                                this.$refs.scrollBox.scrollTop = curIndex * trHeight;
                            }
                        });
                        this.charts.EDMOpen.on('mouseleave',() =>{
                            this.currentCountry = '';
                            this.$refs.scrollBox.scrollTop = 0;
                        });
                    })
                    .catch(() =>{
                        this.loadError.EDM = true;
                    });
            },

            getLinkClick(postData) {
                // 链接独立点击top5
                this.loadError.top5Links = false;
                ContactApiV4
                    .getLinkClick(postData)
                    .then(({body: {data : {taskList}}}) =>{
                        this.top5Links = taskList;
                    })
                    .catch(() =>{
                        this.loadError.top5Links = true;
                    });
            },

            getCustomer(journey, postData) {
                // 自定义图表
                this.loadError.customer = false;
                this.customMap = [];
                ContactApiV2
                    .getJourneyDetailsReports(postData.taskInstantiationIds,postData.journeyInstantionIds)
                    .then(({body: {data: {journeyReportList}}}) =>{
                        this.customMapList = journeyReportList || [];
                        this.$nextTick(() =>{
                            this.customMapList.forEach((elm,cur) =>{
                                this.customMap.push(getChartInstance(this.$refs.customs[cur]));
                                let mapData = {};
                                let ids = postData.taskInstantiationIds;
                                mapData.valueName = !elm.conditionList[0].taskList ? [] :
                                    elm.conditionList[0].taskList[0].targetList.map(elm =>
                                        this.dataTypeList.$getByKey(elm.target).name);
                                mapData.switchData = elm.conditionList.map(
                                    ({field,fieldValue,operation}) => `${field}${operation}${fieldValue}`);
                                mapData.mapContent = journey.name.map((taskName,cur) => {
                                    return {
                                        name: taskName.name,
                                        value: elm.conditionList.map(({taskList}) => taskList.filter(task =>
                                            task.taskInstantiationId === ids[cur])[0].targetList.map(target =>
                                            target.value))
                                    };
                                });
                                this.customMap[cur].setOption(mapTimeLine(mapData));
                            });
                        });
                    })
                    .catch(() =>{
                        this.loadError.customer = true;
                    });
            },

            // 报告下载
            downloadDetail(type) {
                if (!this.selectJourneyTask.taskIds) {
                    return this.$toast(this.$t('data.btnSelectTask'),'warn');
                }
                this.showDownloadModal = true;
                this.currentDownloadName = this.$t(`data.${type}`);
            },
            downloadConfirm(downloadData) {
                this.showDownloadModal = false;
                let data = {
                    email: downloadData.sendEmail,
                    title: downloadData.theme,
                    type: downloadData.fileType,
                    uniCode: downloadData.dataType,
                    journeyInstantiationIds: this.selectJourneyTask.ids,
                    taskInstantiationIds: this.selectJourneyTask.taskIds
                };
                let t = this.$t;
                switch (this.currentDownloadName) {
                    case t('data.emailPercentage'):
                        // 数据Id未去重，接口要求
                        data.journeyInstantiationIds = this.selectJourneyTask.instantionIds;
                        // 需要 templateId
                        data.journeyTemplateIds = this.selectJourneyTask.templateId;
                        this.downloadEmailPecentage(data);
                        break;
                    case t('data.openOpePercentege'):
                        this.downloadOpenPercentege(data);
                        break;
                    case t('data.linkClick'):
                        // 接口参数需求，这里参数名未统一 tia
                        delete data.journeyInstantiationIds;
                        data.journeyInstantionIds = this.selectJourneyTask.ids;
                        this.downloadLinkClick(data);
                        break;
                    case t('data.EDMMapTitle'):
                        this.downloadEDMMapTitle(data);
                        break;
                }
            },
            // 下载邮件服务商
            downloadEmailPecentage(downloadData) {
                ContactExportApiV1
                    .downloadServicesProportion(downloadData)
                    .then(() =>{
                        this.$toast(this.$t('data.acceptEmail'),'success');
                    });
            },
            // 下载设备独立打开
            downloadOpenPercentege(downloadData) {
                ContactExportApiV1
                    .downloadOpenProportionPK(downloadData)
                    .then(() =>{
                        this.$toast(this.$t('data.acceptEmail'),'success');
                    });
            },
            // 下载链接独立点击top5
            downloadLinkClick(downloadData) {
                ContactExportApiV1
                    .downloadLinkClickPK(downloadData)
                    .then(() =>{
                        this.$toast(this.$t('data.acceptEmail'),'success');
                    });
            },
            // 下载联系人活跃
            downloadEDMMapTitle(downloadData) {
                ContactExportApiV1
                    .downloadContactMapPK(downloadData)
                    .then(() =>{
                        this.$toast(this.$t('data.acceptEmail'),'success');
                    });
            },
            //返回
            goBack() {
                this.$router.push({
                    name:'emailSendReport',
                });
            }
        }
    };
</script>

<style lang="scss">
    @import "../../../../common/scss/base/variables";
    @import "../../../../common/scss/base/mixin";

    .email-journey-compared {
        .page-content {
            height: calc(100vh - 168px);
        }

        .report-header {
            padding: 16px;
            line-height: $input-field-height;
            background-color: white;

            .journey-task-select {
                display: inline-block;

                .journey-picker {
                    width: unset;
                }
            }
        }

        .back {
            margin-top: 24px;
        }

        .table {
            thead {
                tr {
                    th {
                        text-align: center;
                        overflow: hidden;
                    }
                }
            }
            tbody {
                tr {
                    td {
                        text-align: center;
                    }
                    .top5-link-data {
                        padding: 0;
                        border-left: 1px solid #e0e5ea;
                        @include box-sizing(border-box);
                        .td-flex {
                            border-bottom: 1px solid #e0e5ea;
                            padding: 15px 10px;
                            @include box-sizing(border-box);
                        }
                        .td-flex:last-child {
                            border-bottom: 0;
                        }
                    }
                    .top5-link-data:last-child {
                        border-right: 1px solid #e0e5ea;
                    }
                }
            }
            .td-flex {
                display: flex;
                flex-direction: column;
                align-items: center;
                p {
                    width: 100%;
                    @include ellipsis;
                    line-height: 16px;
                }
            }
        }

        .EDM-content {
            display: flex;
            .table {
                display: inline-block;
                width: 30%;
                td {
                    width: 80px;
                }
            }
            .scroll {
                max-height: 300px;
                overflow: auto;
            }
            .emd-open {
                display: inline-block;
                width: 70%;
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
            align-items: center;
            justify-content: space-between;
        }
    }
</style>
