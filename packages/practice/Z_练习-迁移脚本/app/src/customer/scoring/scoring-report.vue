<template>
    <div class="report-container">
        <!-- 面包屑导航 -->
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <div class="page-head">
            <div class="content-view report-title">
                <div class="back"
                    @click="handleBack">
                    <i class="icon icon-fanhui1"></i>
                </div>
                <h1>{{'scoring.scoringReport'| t }}</h1>
            </div>
        </div>
        <div class="page-content">
            <div class="content-view margin">
                <!-- 数据来源 -->
                <div class="data-source white-bg">
                    <label class="data-source-title">{{'scoring.dataSources' | t}}</label>
                    <div class="selector">
                        <selector class="lg"
                            :placeholder="selectPlaceHolder"
                            :options="scoringModelList"
                            v-model="scoringModelId"
                            @select="handleSelect"
                            ></selector>
                    </div>
                </div>
            </div>
            <div class="content-view">
                <!-- 评分趋势 -->
                <div class="score-content white-bg">
                    <div class="score-head">
                        <div class="score-title">
                            {{'scoring.scoreTrends'| t}}
                            <i class="icon icon-help"
                                v-title:right="trendsTip"></i>
                        </div>
                        <date-range :start="startDate"
                            :end="endDate"
                            @change="pickDate"></date-range>
                    </div>
                    <div class="score-trends-echart" ref="trends" v-show="!noDataFlag">
                    </div>
                    <div class="empty-echats" v-show="noDataFlag">
                        <div class="empty-echats-img"></div>
                    </div>
                </div>
                <!-- 最新评分结果 -->
                <div class="score-content white-bg">
                    <div class="score-head">
                        <div class="score-title">
                            {{'scoring.latestScoreResult'| t}}
                            <i class="icon icon-help"
                                v-title:right="resultTip"></i>
                        </div>
                    </div>
                    <div class="total-score-people">
                        <p>{{'scoring.totalPeople'| t}}</p>
                        <p class="total-num">{{totalPeople}}</p>
                        <p class="disabled-text">{{scoringTime}}</p>
                    </div>
                    <div class="table">
                        <table>
                            <thead>
                                <tr>
                                    <th v-for="(item,index) in theadList"
                                        :key="item.id">{{item.name}}
                                        <i v-if="item.id === 3" class="icon icon-help" v-title:right="hoverTip"></i>
                                    </th>
                                </tr>
                            </thead>
                        </table>
                        <table>
                            <tbody>
                                <tr v-for="(item,index) in scoringResultTable"
                                    :key="item.gradeId">
                                    <td>{{item.gradeName}}</td>
                                    <td>{{item.gradeCount}}</td>
                                    <td>{{(item.percentage*100).toFixed(2)}}%</td>
                                    <td>
                                        <button class="btn tag-action-icon"
                                            v-title="$t('scoring.save')"
                                            @click="handleSave(item.gradeName)">
                                            <svg aria-hidden="true"
                                                class="icon-lianxiren">
                                                <use xlink:href="#icon-lianxiren"
                                                    :title="$t('scoring.save')"></use>
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <list-empty v-if="noDataFlag === true"/>
                    </div>
                </div>
            </div>
        </div>
        <!-- 保存分群 -->
        <modal v-if="saveModal"
            :title=" $t('scoring.modalTitle')"
            @close="saveModal = false">
            <p>{{'scoring.modalContent' | t}}</p>
            <template v-slot:buttons>
                <button class="btn btn-md btn-white"
                    @click="saveModal = false">{{'common.cancel' | t}}</button>
                <button class="btn btn-md btn-theme"
                    @click="handleConfirm"
                    :disabled="$has('datacentre_scorerating_swarm')"
                    >{{'common.confirm' | t}}</button>
            </template>
        </modal>
    </div>
</template>
<script type="text/ecmascript-6">
import { ScoringV1 } from '@/api';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/legend';
import format from 'date-fns/format';
import addDays from 'date-fns/add_days';
import {getDateInstance} from '../../common/utils/dateUtils';
import differenceInCalendarDays from 'date-fns/difference_in_calendar_days';
import cloneDeep from 'lodash/cloneDeep';
export default {
    props: {

    },
    data () {
        return {
            id: '',
            trendsTip: this.$t('scoring.trendsTip'),
            resultTip: this.$t('scoring.latestScoreResultTip'),
            hoverTip:this.$t('scoring.AnnotationCopywriter'), 
            startDate: '',
            endDate: '',
            scoringModelList: [],
            scoringModelId: '',
            selectPlaceHolder:this.$t('scoring.selectPlaceHolder'),
            //echart数据
            option: {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross'
                    },
                    textStyle: {
                        fontSize: 12,
                        lineHeight: 14
                    }
                },
                legend: {
                    data: [],
                    icon: 'rect',
                    bottom: 'bottom'
                },
                xAxis: {
                    type: 'category',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false,//标轴刻度是否朝内，默认朝外
                    },
                    interval: 0,
                    data: []
                },
                yAxis: {
                    type: 'value',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: false,//标轴刻度是否朝内，默认朝外
                    },
                },
                series: []
                
            },
            totalPeople: '',//总评分人数
            scoringTime: '',//最新评分时间
            theadList: [{
                id:1,
                name: this.$t('scoring.scoringLeve')
            }, {
                id:2,
                name: this.$t('scoring.population')
            }, {
                id:3,
                name: this.$t('scoring.proportion')
            }, {
                id:4,
                name: this.$t('scoring.operation')
            }],
            scoringResultTable: [],
            saveModal: false, //保存弹窗
            scoringLevel: '',
            echarts: {
                scoringTrends: null
            },
            optionOrigin:'',//option源数据
            gradeItem:{
                gradeCount:0,
                gradeName:''
            },
            gradeList:[],
            noDataFlag:false
        };
    },
    computed: {
        crumbs () {
            return [
                { name: 'wecom', text: 'Dmartech' },
                { name: 'scorerating', text: this.$t('home.customerScoring') },
                Object.assign({}, this.$route, {
                    text: this.$t('scoring.scoringReport')
                })
            ];
        },
    },
    created () {
        // 获取地址栏参数
        let { modelId } = this.$route.query;
        this.id = Number(modelId);
        // 获取评分报告
        this.getScoringResultTableData(this.id);
    },
    mounted () {
        this.optionOrigin = cloneDeep(this.option);
        // 获取时间区间
        this.startDate = format(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        this.endDate = format(new Date(new Date().getTime()), 'YYYY-MM-DD');
        // 获取评分模型列表
        this.getScoringSource();
    },
    methods: {
        // 返回
        handleBack () {
            this.$router.replace('/customer/scorerating');
        },
        // 选择日期
        pickDate ({ start, end }) {
            this.startDate = start;
            this.endDate = end;
            this.getScoringTrendsData(this.id,this.startDate,this.endDate);
        },
        // 保存
        handleSave (level) {
            this.scoringLevel = level;
            this.saveModal = true;
        },
        // 确认
        handleConfirm () {
            const param = {
                modelId: this.id,
                gradeName: this.scoringLevel
            };
            ScoringV1
                .creatContactGroup(param)
                .then((res) => {
                    if (res.body.code === 200) {
                        let url = this.$router.resolve({
                            path: `/customer/swarm`,
                            query:{
                                scoringId: res.body.data.swarm.id
                            }
                        });
                        window.open(url.href, '_blank');
                    }
                });
            this.saveModal = false;
        },
        // 下拉框
        handleSelect () {
            this.gradeList = [];
            this.id = this.scoringModelId;//保存一下当前模型id
            this.getScoringResultTableData(this.scoringModelId);
        },
        // 获取评分报告数据
        getScoringResultTableData (modelId) {
            ScoringV1
                .getscoringTableData(modelId)
                .then(({ body: { data } }) => {
                    this.scoringResultTable = data.grades || '';
                    this.totalPeople = data.total || 0;
                    this.scoringModelId = data.modelId || this.id; //评分模型回显
                    if (data.grades) {
                        this.scoringTime = data.scoringDate.slice(0, -2);
                        data.grades.forEach(item=>{
                            this.gradeList.push(item.gradeName);
                        });
                        this.noDataFlag = false;
                    } else {
                        this.scoringTime = '';
                        this.noDataFlag = true;
                    }
                })
                .then(()=>{
                    this.getScoringTrendsData(this.id);
                });
        },
        // 获取评分趋势
        getScoringTrendsData (modelId) {
            ScoringV1
                .getScoringTrends(modelId, this.startDate, this.endDate)
                .then(({ body: { data } }) => {
                    this.echarts.scoringTrends = echarts.init(this.$refs.trends);
                    let xAxisData = []; //x轴数据
                    let nameList = [];  //legends图例名字
                    let seriesDataArr = []; //y轴数据
                    let seriesData = [];
                    // 获取时间
                    let start = getDateInstance(this.startDate);
                    let end = getDateInstance(this.endDate);
                    let dayDiff = differenceInCalendarDays(end, start);
                    for (let i = 0; i <= dayDiff; i++) {
                        xAxisData[i] = format(addDays(start, i), 'MM-DD');
                    }
                    if (data.trends) {
                        for (let i in data.trends) {
                            if (data.trends[i].length === 0){
                                data.trends[i] = this.gradeList.map(item =>{
                                    this.gradeItem.gradeName = item;
                                    return {...this.gradeItem};
                                });
                            } 
                            seriesDataArr.push(data.trends[i]);
                        }
                        let objLen = Object.keys(data.trends).length;//返回对象的长度
                        // 获取图例名称
                        this.gradeList.forEach((item) => {
                            nameList.push(item);
                        });
                        //获取曲线数据
                        for (let j = 0; j < this.gradeList.length; j++) {
                            let lineItem = new this.seriesItem();
                            for (let k = 0; k < objLen; k++) {
                                if (seriesDataArr[k][j] !== undefined) {
                                    lineItem.name = seriesDataArr[k][j].gradeName;
                                    lineItem.data.push(seriesDataArr[k][j].gradeCount);
                                } else {
                                    lineItem.name = this.gradeList[j].gradeName;
                                    lineItem.data.push(0);
                                }
                            }
                            seriesData.push(lineItem); 
                        }
                        if (this.noDataFlag === false){
                            this.$nextTick(() => {
                                this.echarts.scoringTrends.clear();
                                this.option.xAxis.data = xAxisData;
                                this.option.legend.data = this.unique(nameList);
                                this.option.series = seriesData;
                                this.echarts.scoringTrends.setOption(this.option);
                                this.echarts.scoringTrends.resize();                       
                            });
                        } else {
                            this.echarts.scoringTrends.clear();
                        }
                    }

                });
        },
        unique (arr) {
            return Array.from(new Set(arr));
        },
        seriesItem () {
            return {
                name: '',
                data: [],
                type: 'line',
                smooth: true
            };
        },
        // 获取评分模型列表
        getScoringSource(){
            ScoringV1
                .getScoringSource()
                .then(({body:{data}})=>{
                    for (let i in data.modelList) {
                        this.scoringModelList.push({id:i, name:data.modelList[i]});
                    }
                    this.scoringModelList = this.scoringModelList.reverse();
                });
        },
        resize(){
            this.echarts.scoringTrends.resize();
        }

    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss">
@import "../../common/scss/base/_variables";
@import "../../common/scss/base/_mixin";
.report-container {
    .page-head {
        .report-title {
            display: flex;
            align-items: center;
            .back {
                margin-right: 8px;
                i {
                    cursor: pointer;
                    font-size: 16px;
                    color: $light-green;
                    vertical-align: middle;
                }
            }
        }
    }
    .page-content {
        .white-bg {
            background-color: #fff;
        }
        .data-source {
            padding: 16px;
            .data-source-title {
                display: inline-block;
                margin-left: 6px;
                margin-right: 16px;
                font-size: 14px;
            }
        }
        .score-content {
            margin-bottom: 16px;
            padding: 16px 16px;
            .score-head {
                display: flex;
                justify-content: space-between;
                align-items: center;
                .score-title {
                    font-size: 16px;
                    i {
                        cursor: pointer;
                    }
                }
            }
            .score-trends-echart {
                margin: 0 auto;
                // width: 400px;
                width: 100%;
                height: 300px;
            }
            .empty-echats{
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                height: 300px;
                .empty-echats-img{
                    width: 129px;
                    height: 145px;
                    background-image: url("./img/empty-chart.png");
                }
            }
            .total-score-people {
                margin-top: 12px;
                margin-bottom: 12px;
                font-size: 14px;
                .total-num {
                    color: $color-title;
                    font-size: 16px;
                }
            }
            .table {
                table {
                    thead,
                    tbody {
                        tr {
                            border-bottom: none;
                            td{
                                word-wrap: break-word;
                                white-space: normal;
                            }
                        }
                    }
                }
            }
            
            .tag-action-icon {
                display: inline-block;
                width: 16px;
                height: 16px;
                padding: 0;
                .icon-lianxiren {
                    width: 16px;
                    height: 16px;
                    fill: $theme;
                }
            }
        }
    }
}
</style>
