<template>
    <div class="visualization-chart">
        <div class="types">
            {{'eventAnalysis.chartType' | t}}
            <div v-for="(type,index) in chartTypes" class='btn-content'>
                <button type="button" class="chart-type-btn"
                        v-click-into-view
                        :class="{active: type === chartType && type !== 'bar'}"
                        @click="changeReportType(type,index)">
                    <svg aria-hidden="true">
                        <use v-bind:xlink:href="'#icon-' + type"></use>
                    </svg>
                </button>
                <i class="icon-caret-down icon" v-if="type==='bar'" @click="queryOpen = !queryOpen"
                   :class="[queryOpen ? 'turn-on' : 'turn-off']"></i>
                <transition name='drop'>
                    <div v-if="type==='bar' && queryOpen" class='bar-content' v-blur='closeBarDropDown'>
                        <button type="button" class="chart-type-btn" v-for="(type,index) in barChartTypes"
                                :class="{active: type === chartType}" @click="changeReportType(type,index)"
                                v-if='queryOpen'>
                            <svg aria-hidden="true">
                                <use v-bind:xlink:href="'#icon-' + type"></use>
                            </svg>
                        </button>
                    </div>
                </transition>
            </div>
        </div>

        <div class="visualization-chart-container">
            <div class="data-source-setting data-source-table" :class="{'data-source-table':chartType==='table'}">
                <!--X轴-->
                <template v-if="xAxisShow">
                    <div class='table-content'>
                        <div class='table-left'>
                            <label class="setting-label">{{xAxisName}}
                                <input type='text' class='input' v-model.trim="nameX"
                                       v-on:blur="changeShowName('x',$event)"/>
                                <span class='show-text'>{{'visualization.display' | t}}</span>
                            </label>
                            <selector :options="groupsAll" :value="groupKey"
                                      @input="selectMeasures($event, 'x')"></selector>
                        </div>
                        <div class='table-right'>
                            <svg aria-hidden="true" class="action-icon icon-delete"
                                 @click="clearDataAction('x')">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </div>
                    </div>
                </template>

                <!--仪表图 仪表值和目标值只能选数值型-->
                <template v-if="chartType === 'gauge'">
                    <div class='table-content'>
                        <div class='table-left'>
                            <label class="setting-label">{{'visualization.instrumentName' | t}} {{'visualization.display' | t}}</label>
                            <input type='text' class='input gauge-name' v-model.trim="gaugeName" maxlength="30"
                                   v-on:blur="changeShowName('gauge',$event)"/>
                        </div>
                    </div>
                    <div class='table-content'>
                        <div class='table-left'>
                            <label class="setting-label">{{'visualization.displayForm' | t}}</label>
                            <selector :options="GAUGESHOWLIST" :value="gaugeShow"
                                      @input="selectGaugeShow"></selector>
                        </div>
                    </div>
                </template>

                <!--left Y轴-->
                <template v-if="yAxisLeftShow">
                    <div class='table-content'>
                        <div class='table-left'>
                            <label class="setting-label">
                                <span>{{yAxisLeftName}}</span>
                                <input type='text' class='input' v-model.trim="nameYLeft"
                                       v-on:blur="changeShowName('yLeft',$event)"/>
                                <span class='show-text'>{{'visualization.display' | t}}</span>
                            </label>
                            <selector :options="groupsAllNumber" :value="groupKeyY.left"
                                      @input="selectMeasures($event, 'left')"></selector>
                        </div>
                        <div class='table-right'>
                            <svg aria-hidden="true" class="action-icon icon-delete"
                                 @click="clearDataAction('left')">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </div>
                    </div>
                </template>

                <!--right Y轴-->
                <template v-if="yAxisRightShow">
                    <div class='table-content'>
                        <div class='table-left'>
                            <label class="setting-label">{{yAxisRightName}}
                                <input type='text' class='input' v-model.trim="nameYRight"
                                       v-on:blur="changeShowName('yRight',$event)"/>
                                <span class='show-text'>{{'visualization.display' | t}}</span>
                            </label>
                            <selector :options="groupsAllNumberRight" :value="groupKeyY.right"
                                      @input="selectMeasures($event, 'right')"></selector>
                        </div>
                        <div class='table-right'>
                            <svg aria-hidden="true" class="action-icon icon-delete"
                                 @click="clearDataAction('right')">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </div>
                    </div>
                </template>

                <!--数据分组-->
                <template v-if="dataGroupShow">
                    <div class='table-content'>
                        <div class='table-left'>
                            <label class="setting-label">{{'visualization.dataGroup' | t}}</label>
                            <selector :options="groupsAllDataSource" :value="groupKeyData"
                                      @input="selectMeasures($event, 'source')"></selector>
                        </div>
                        <div class='table-right'>
                            <svg aria-hidden="true" class="action-icon icon-delete"
                                 @click="clearDataAction('source')">
                                <use xlink:href="#icon-round-close"></use>
                            </svg>
                        </div>
                    </div>
                </template>

                <!--饼图的最大切片数-->
                <template v-if="chartType === 'pie'">
                    <div class='table-content'>
                        <div class='table-left'>
                            <label class="setting-label">{{'visualization.mostSlice' | t}}
                                <number-input class='input' :min="1" :max="chartData.length"
                                              v-model="pieMaxSlice" @sync="changeMaxSlice($event)"/>
                            </label>
                            <span class="disabled">{{'visualization.remainSlice' | t}}</span>
                        </div>
                    </div>
                </template>
                <!-- </div> -->

                <!-- 图表 -->
                <template v-if="chartType === 'table'">
                    <div class='table-content' v-for="(item,index) in attributeList">
                        <div class='table-left'>
                            <selector :options="item.data" :value="groupTableData[index]"
                                        @input="selectMeasures($event, 'table',index)"
                                        class='selector-table'></selector>
                            <label class="table-label">
                                <input type='text' class='input' v-model.trim="item.otherName"
                                        v-on:blur="changeTableName($event,index,true)"/>
                                <span class='show-text-table'>{{'visualization.display' | t}}</span>
                            </label>
                        </div>
                        <div class='table-right'>
                            <i class="icon icon-delete" @click='showDeleteAction(index)'></i>
                            <inline-confirm v-if='index===tableIndex && isShowDelete'
                                            @confirm="deleteTable(index)"
                                            @cancel="isShowDelete = false"
                                            :text="$t('visualization.deleteWord')"/>
                        </div>
                    </div>
                    <p class='add-attribute' @click='addSelectes'
                       v-if='groupsAll.length!==groupTableData.length || groupsAll.length === 0'>
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'visualization.addField' | t}}
                    </p>
                    <p class='delete-attribute' @click='clearAllSelectes'
                       v-if='groupsAll.length===groupTableData.length && groupsAll.length !== 0'>
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-jianshao"></use>
                        </svg>
                        {{'visualization.clearAll' | t}}
                    </p>
                    <p class='add-attribute' @click='addAllSelectes' v-if='groupsAll.length!==groupTableData.length'>
                        <svg aria-hidden="true">
                            <use xlink:href="#icon-plus"></use>
                        </svg>
                        {{'visualization.addAll' | t}}
                    </p>
                </template>
            </div>
            <div class="chart-content">
                <div class="chart-config">
                    <span class="chart-title"></span>
                    <span class="zoom-tip" v-if='altShow'>
                        {{'eventAnalysis.press' | t}}<kbd>Alt</kbd>{{'eventAnalysis.key' | t}}，{{'eventAnalysis.scrollWheel' | t}}
                    </span>
                    <slot></slot>
                </div>
                <template v-if="!$store.state.loading">
                    <template v-if="$store.state.loading"></template>
                    <block-empty v-else-if="chartData.length === 0 || groupTableData.length===0 && chartType === 'table' "/>
                    <template v-else-if="chartType === 'table'">
                        <div class='table-chart'>
                            <table>
                                <thead>
                                <tr>
                                    <td v-for='item in showNameTable' :title='item'>{{item}}</td>
                                </tr>
                                </thead>
                            </table>
                            <table>
                                <tbody>
                                <tr class="label-tr" v-for="(item,index) in tableList">
                                    <td v-for='number in item' :title='number'>{{number}}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>
                    <div class="chart" ref="visualChartRef" v-else></div>
                </template>
            </div>
        </div>
    </div>
</template>
<script>
    import cloneDeep from 'lodash/cloneDeep';
    import debounce from 'lodash/debounce';

    import {getLineChart} from './visual-chart/lineChart.js';
    import {getPieChart} from './visual-chart/pieChart.js';
    import {getBarChart} from './visual-chart/barChart.js';
    import {getGaugeChart} from './visual-chart/gaugeChart.js';
    import {getPolarChart} from './visual-chart/polarChart.js';
    // echarts
    import echarts from 'echarts/lib/echarts';
    import 'echarts/lib/chart/pie';
    import 'echarts/lib/chart/line';
    import 'echarts/lib/chart/bar';
    import 'echarts/lib/chart/gauge';
    import 'echarts/lib/component/polar';
    import 'echarts/lib/component/tooltip';
    import 'echarts/lib/component/legend';
    import 'echarts/lib/component/legendScroll';
    import 'echarts/lib/component/title';
    import 'echarts/lib/component/dataZoom';
    //translate
    import { translate as t } from '@/locales';

    // 仪表图 显示形式
    const GAUGESHOWLIST = [
        {id: 1, name: t('eventAnalysis.percentage')},
        {id: 2, name: t('visualization.value')},
    ];

    export default {
        name: 'visualization-chart',
        components: {
            // AxisConfigModal
        },
        props: {
            chartType: String,
            // 分组
            groups: {
                type: Array,
                required: true,
                default: () => [],
            },
            // X轴选中id
            groupKey: [String, Number],
            // y轴选中的id数组
            groupKeyY: {
                type: Object,
                required: false,
                default: () => {
                    let left = '';
                    let right = '';
                    return {left, right};
                },
            },
            // 数据分组选中的id
            groupKeyData: {
                type: String,
                required: false,
                default: () => '',
            },
            groupTableData: {
                type: Array,
                required: false,
                default: [-1],
            },
            // 所有显示名
            showName: {
                type: Object,
                required: false,
                default: () => {
                    // 默认返回空方法
                },
            },
            gaugeShow: {
                type: Number,
                required: false,
                default: 1,
            },
            // 表格显示名
            showNameTable: {
                type: Array,
                required: false,
            },
            // 接口请求到的画图数据
            drawChartData: {
                type: Array,
                required: false,
                default: () => [],
            },
            pieSlice: [String, Number],
            bookMarkName: String,
            attrColName: String,
        },
        data() {
            return {
                // 图表类型
                chartTypes: [
                    'line', // 线图
                    'bar',  // 柱图
                    'pie',  // 饼图
                    'gauge',  // 仪表图
                    'arealine',  // 面积图
                    'polar',  // 极坐标图
                    'table', // 表格图
                ],
                _chart: null,
                // 柱状图下拉框图表类型
                barChartTypes: [
                    'bar',  // 柱图
                    'cross', //横条图
                    'pm',  // 正负柱图
                ],
                // 柱状图下拉框是否显示
                queryOpen: false,
                // 是否显示数据分组选项
                showDataGroup: false,
                isFilter: false,
                // 仪表图
                GAUGESHOWLIST, // 显示形式
                // 表格图表左侧字段
                attributeList: [],
                // 图表列表
                tableList: [],
                isShowDelete: false,
                tableIndex: -1,
                // 清除全部是否显示
                clearAll: false,
            };
        },
        computed: {
            chartData() {
                return this.drawChartData;
            },
            // X轴显示名
            nameX: {
                get() {
                    return this.showName.x;
                },
                set(val) {
                    return val;
                }
            },
            // Y轴左侧显示名
            nameYLeft: {
                get() {
                    return this.showName.yLeft;
                },
                set(val) {
                    return val;
                }
            },
            // Y轴右侧显示名
            nameYRight: {
                get() {
                    return this.showName.yRight;
                },
                set(val) {
                    return val;
                }
            },
            // 仪表名
            gaugeName: {
                get() {
                    return this.showName.gauge;
                },
                set(val) {
                    return val;
                }
            },
            //饼图的最大切片数
            pieMaxSlice: {
                get() {
                    return this.pieSlice;
                },
                set(val) {
                    return val;
                }
            },
            // 全部下拉框
            groupsAll() {
                return [...this.groups];
            },

            // 数值型下拉框（Y轴只可选择数值型下拉框）
            // attrGenre为1和3都是数值型，3为小数
            groupsAllNumber() {
                return this.groups.filter(item => item.attrGenre === 1 || item.attrGenre === 3);
            },

            groupsAllNumberRight() {
                let data = cloneDeep(this.groups.filter(item => item.attrGenre === 1 || item.attrGenre === 3));
                let dataSource = [];
                // 左侧Y轴未选中或为空时，右侧Y轴不可选
                // 左侧Y轴选中时，右侧Y轴可选除了左侧Y轴之外的属性
                if (this.groupKeyY.left === '') {
                    data.filter(item => {
                        if (item) {
                            item.disabled = true;
                            dataSource.push(item);
                        }
                    });
                    return dataSource;
                }
                data.filter(item => {
                    if (item.id === this.groupKeyY.left) {
                        item.disabled = true;
                    }
                    dataSource.push(item);
                });
                return dataSource;
            },

            // 表格图形下拉框
            groupsAllTable() {
                return [...this.groups];
            },

            // 数据分组下拉框
            groupsAllDataSource() {
                let data = cloneDeep(this.groupsAll);
                let dataSource = [];
                // 左侧Y轴与右侧Y轴其中一个有值，数据分组就可选择
                if (this.groupKeyY.right === '' && this.groupKeyY.left === '') {
                    data.filter(item => {
                        if (item) {
                            item.disabled = true;
                            dataSource.push(item);
                        }
                    });
                    this.$emit('update:groupKeyData', '');
                    return dataSource;
                }
                //左侧Y轴为空时，数据分组不可选
                if (this.groupKeyY.left === '') {
                    data.forEach(item => {
                        item.disabled = true;
                    });
                    dataSource = [...data];
                } else {
                    data.filter(item => {
                        if (item.id === this.groupKeyY.right || item.id === this.groupKeyY.left) {
                            item.disabled = true;
                            dataSource.push(item);
                        } else {
                            item.disabled = false;
                            dataSource.push(item);
                        }
                    });
                }
                return dataSource;
            },

            // x轴是否显示
            xAxisShow() {
                let xShow = false;
                switch (this.chartType) {
                    case 'line':
                    case 'bar':
                    case 'cross':
                    case 'pm':
                    case 'arealine':
                    case 'pie':
                    case 'polar' :
                        xShow = true;
                        break;
                    default:
                        xShow = false;
                        break;
                }
                return xShow;
            },

            // x轴名称
            xAxisName() {
                let xName = this.$t('eventAnalysis.XAxis');
                switch (this.chartType) {
                    case 'pie':
                        xName = this.$t('visualization.pieGroup');
                        break;
                    case 'polar':
                        xName = this.$t('eventAnalysis.angularAxis');
                        break;
                    case 'cross':
                        xName = this.$t('visualization.YAxis');
                        break;
                    default:
                        xName = this.$t('eventAnalysis.XAxis');
                        break;
                }
                return xName;
            },

            // left Y轴是否显示
            yAxisLeftShow() {
                let yShow = false;
                switch (this.chartType) {
                    case 'line':
                    case 'bar':
                    case 'cross':
                    case 'pm':
                    case 'arealine':
                    case 'pie':
                    case 'polar':
                    case 'gauge':
                        yShow = true;
                        break;
                    default:
                        yShow = false;
                        break;
                }
                return yShow;
            },

            // left y轴名称
            yAxisLeftName() {
                let YName = this.$t('visualization.YAxis');
                switch (this.chartType) {
                    case 'line':
                    case 'arealine':
                    case 'pm':
                        YName = this.$t('visualization.YAxis');
                        break;
                    case 'cross':
                        YName = this.$t('visualization.lowXAxis');
                        break;
                    case 'pie':
                        YName = this.$t('visualization.pieValue');
                        break;
                    case 'polar':
                        YName = this.$t('eventAnalysis.radiusAxis');
                        break;
                    case 'gauge':
                        YName = this.$t('visualization.meterValue');
                        break;
                    default:
                        YName = this.$t('eventAnalysis.leftYAxis');
                        break;
                }
                return YName;
            },

            // right y轴是否显示， right 数据分组是否显示
            yAxisRightShow() {
                let yShow = false;
                switch (this.chartType) {
                    case 'bar':
                    case 'cross':
                    case 'gauge':
                        yShow = true;
                        break;
                    case 'pm':
                        yShow = false;
                        break;
                    default:
                        yShow = false;
                        break;
                }
                return yShow;
            },

            // right y轴名称
            yAxisRightName() {
                let yName = this.$t('eventAnalysis.rightYAxis');
                switch (this.chartType) {
                    case 'gauge':
                        yName = this.$t('visualization.targetValue');
                        break;
                    case 'cross':
                        yName = this.$t('visualization.upXAxis');
                        break;
                    default:
                        yName = this.$t('eventAnalysis.rightYAxis');
                        break;
                }
                return yName;
            },
            // 是否显示滚轮缩放
            altShow() {
                let alt = false;
                switch (this.chartType) {
                    case 'line':
                    case 'bar':
                    case 'cross':
                    case 'pm':
                    case 'arealine':
                        alt = true;
                        break;
                    default:
                        alt = false;
                        break;
                }
                return alt;
            },

            // 数据分组是否显示
            dataGroupShow() {
                let groupShow = true;
                switch (this.chartType) {
                    case 'pie':
                    case 'gauge':
                    case 'table':
                        groupShow = false;
                        break;
                    default:
                        groupShow = true;
                        break;
                }
                return groupShow;
            },
            // 表格图表时，被选中的值
            leftData() {
                return cloneDeep(this.groupTableData);
            }
        },
        watch: {
            groups(val) {
                if (val) {
                    this.attributeList = [{
                        data: this.groupsAllTable,
                        otherName: '',
                    }];
                }
            },

            // 表格图表下拉框设置不可选状态
            groupTableData(val) {
                if (val.length > 0) { //有选中的值时，其余下拉框不可选
                    this.groupsAllTable.map(table => {
                        table.disabled = false;
                        val.map(item => {
                            if (item === table.id) {
                                table.disabled = true;
                            }
                        });
                    });
                } else {
                    // 无选中的值时，所有的下拉框都可选择
                    this.groupsAllTable.map(table => {
                        table.disabled = false;
                    });
                }
            },
            // 表格图表的显示名
            showNameTable(val) {
                if (val.length > 0) {
                    this.attributeList = [];
                    val.map(item => {
                        this.attributeList.push({data: this.groupsAllTable, otherName: item,});
                    });
                }
            },
            // X轴未选中时，显示名为空
            groupKey(value) {
                if (!value) {
                    this.$emit('update:showName', {
                        x: '',
                        yLeft: this.nameYLeft,
                        yRight: this.nameYRight,
                        gauge: this.gaugeName
                    });
                    this.$emit('update:attrColName', '');
                } else {
                    this.groups.map(item => {
                        if (item.id === value) {
                            this.$emit('update:attrColName', item.attrColName);
                        }
                    });
                }
            },

            'groupKeyY.left'(value) {
                // 左侧Y轴未选中时，显示名为空
                if (!value) {
                    this.$emit('update:showName', {
                        x: this.nameX,
                        yLeft: '',
                        yRight: this.nameYRight,
                        gauge: this.gaugeName
                    });
                }
            },

            'groupKeyY.right'(value) {
                // 右侧Y轴未选中时，显示名为空
                if (!value) {
                    this.$emit('update:showName', {
                        x: this.nameX,
                        yLeft: this.nameYLeft,
                        yRight: '',
                        gauge: this.gaugeName
                    });
                }
            }
        },

        mounted() {
            window.addEventListener('resize', this.resizeChart, false);
        },

        beforeDestroy() {
            window.removeEventListener('resize', this.resizeChart, false);
        },
        methods: {
            closeBarDropDown() {
                this.queryOpen = false;
            },

            // 点击图标类型
            changeReportType(type, index) {
                if (type === 'bar' && index === 1) {
                    this.queryOpen = !this.queryOpen;
                } else if (type !== 'bar' && type !== 'cross' && type !== 'pm') {
                    this.changeType(type, this.chartType);
                    this.queryOpen = false;
                    this.$emit('update:chartType', type);
                } else {
                    this.queryOpen = true;
                    this.changeType(type, this.chartType);
                    this.$emit('update:chartType', type);
                }
            },

            // 点击不同图标类型切换时，若有相同类型的值，不用清空，不同类型的需清空
            // 进入表格图表时，加入所有属性，从表格图表离开时，清空所有属性
            changeType(newType, oldType) {
                if (oldType === 'table') {
                    this.clearData();
                } else if (oldType === 'pie') {
                    this.$emit('update:pieSlice', '');
                } else if (oldType === 'gauge') {
                    this.$emit('update:showName', {
                        x: this.nameX,
                        yLeft: this.nameYLeft,
                        yRight: this.nameYRight,
                        gauge: ''
                    });
                }
                if (oldType === 'table') {
                    this.clearData();
                } else {
                    if (newType === 'table') {
                        let nameArray = [];
                        let idArray = [];
                        if (this.groupKey > 0) {
                            idArray.push(this.groupKey);
                            nameArray.push(this.showName.x);
                        }
                        if (this.groupKeyY.left > 0) {
                            idArray.push(this.groupKeyY.left);
                            nameArray.push(this.showName.yLeft);
                        }
                        if (this.groupKeyY.right > 0) {
                            idArray.push(this.groupKeyY.right);
                            nameArray.push(this.showName.yRight);
                        }
                        if (this.groupKeyData > 0) {
                            idArray.push(this.groupKeyData);
                            this.groups.map(item => {
                                if (item.id === this.groupKeyData) {
                                    nameArray.push(item.name);
                                }
                            });
                        }
                        this.$emit('update:showNameTable', nameArray);
                        this.$emit('update:groupTableData', idArray);
                    } else {
                        switch (newType) {
                            case 'pie':
                                this.$emit('update:groupKeyData', '');
                                this.$emit('update:groupKeyY', {left: this.groupKeyY.left, right: ''});
                                this.$emit('update:showName', {
                                    x: this.nameX,
                                    yLeft: this.nameYLeft,
                                    yRight: '',
                                    gauge: this.gaugeName
                                });
                                break;
                            case 'line':
                            case 'pm':
                            case 'arealine':
                            case 'polar':
                                this.$emit('update:groupKeyY', {left: this.groupKeyY.left, right: ''});
                                this.$emit('update:showName', {
                                    x: this.nameX,
                                    yLeft: this.nameYLeft,
                                    yRight: '',
                                    gauge: this.gaugeName
                                });
                                break;
                            case 'gauge':
                                this.$emit('update:groupKey', '');
                                this.$emit('update:groupKeyData', '');
                                this.$emit('update:showName', {
                                    x: '',
                                    yLeft: this.nameYLeft,
                                    yRight: this.nameYRight,
                                    gauge: this.gaugeName
                                });
                                break;
                        }
                    }
                }
                this.$nextTick(() => {
                    this.sendDrawData();
                });
            },

            // 添加属性
            addSelectes() {
                this.attributeList.push(
                    {
                        data: this.groupsAllTable,
                        otherName: '',
                    }
                );
            },

            // 添加所有属性
            addAllSelectes() {
                let leftDataArray = [];
                let nameArray = [];
                leftDataArray = this.leftData;
                nameArray = this.showNameTable;
                if (this.groupTableData.length === 0) {
                    this.groupsAllTable.map(item => {
                        this.attributeList = [];
                        this.attributeList.push(
                            {
                                data: this.groupsAllTable,
                                otherName: item.name,
                            }
                        );
                        leftDataArray.push(item.id);
                        nameArray.push(item.name);
                    });
                } else {
                    this.groupsAllTable.map(item => {
                        let isExit = false;
                        this.groupTableData.map(data => {
                            if (item.id === data) {
                                isExit = true;
                            }
                        });
                        if (!isExit) {
                            this.attributeList.push(
                                {
                                    data: this.groupsAllTable,
                                    otherName: item.name,
                                }
                            );
                            leftDataArray.push(item.id);
                            nameArray.push(item.name);
                        }
                    });
                }
                this.$emit('update:groupTableData', leftDataArray);
                this.$emit('update:showNameTable', nameArray);
                this.clearAll = true;
                this.$nextTick(() => {
                    this.sendDrawData();
                });
            },

            // 清除所有属性
            clearAllSelectes() {
                this.$emit('update:groupTableData', []);
                this.$emit('update:showNameTable', []);
                this.attributeList = [];
                this.tableList = [];
                this.clearAll = false;
            },

            sendDrawData(val) {
                switch (this.chartType) {
                    case 'gauge':
                        this.$emit('sendDrawData', val);
                        break;
                    case 'table':
                        this.$emit('sendDrawData', val);
                        this.clearChart();
                        break;
                    default:
                        this.$emit('sendDrawData', val);
                        break;
                }
            },

            // 选择下拉框
            selectMeasures(keys, position, index) {
                let leftDataArray = [];
                let nameArray = [];
                switch (position) {
                    case 'x':
                        this.isFilter = false;
                        this.filterGroups(keys, this.groupKeyY.left, 'left', 'update:groupKeyY');
                        this.filterGroups(keys, this.groupKeyY.right, 'right', 'update:groupKeyY');
                        this.filterGroups(keys, this.groupKeyData, 'source', 'update:groupKeyData');

                        this.groupsAll.map(item => {
                            if (item.id === keys) {
                                this.$emit('update:showName', {
                                    x: item.name,
                                    yLeft: this.nameYLeft,
                                    yRight: this.nameYRight,
                                    gauge: this.gaugeName
                                });
                            }
                        });

                        this.$emit('update:groupKey', keys);
                        // 必须等子页面所有的值传到父元素之后才可进行操作
                        this.$nextTick(() => {
                            this.sendDrawData();
                        });
                        break;
                    case 'left':
                        this.isFilter = false;
                        this.filterGroups(keys, this.groupKey, 'x', 'update:groupKey');
                        this.filterGroups(keys, this.groupKeyY.right, 'right', 'update:groupKeyY');
                        this.filterGroups(keys, this.groupKeyData, 'source', 'update:groupKeyData');
                        this.groupKeyY.left = keys;
                        this.groupsAllDataSource.map(item => {
                            // 左侧Y轴选中时，数据分组相应项不可选
                            if (keys === item.id) {
                                this.$emit('update:showName', {
                                    x: this.nameX,
                                    yLeft: item.name,
                                    yRight: this.nameYRight,
                                    gauge: this.gaugeName
                                });
                            }
                        });
                        this.$emit('update:groupKeyY', this.groupKeyY);
                        this.$nextTick(() => {
                            this.sendDrawData();
                        });
                        break;
                    case 'right':
                        this.isFilter = false;
                        this.filterGroups(keys, this.groupKey, 'x', 'update:groupKey');
                        this.filterGroups(keys, this.groupKeyY.left, 'left', 'update:groupKeyY');
                        this.filterGroups(keys, this.groupKeyData, 'source', 'update:groupKeyData');
                        this.groupKeyY.right = keys;
                        this.groupsAllDataSource.map(item => {
                            // 右侧Y轴选中时，数据分组相应项不可选
                            if (keys === item.id) {
                                this.$emit('update:showName', {
                                    x: this.nameX,
                                    yLeft: this.nameYLeft,
                                    yRight: item.name,
                                    gauge: this.gaugeName
                                });
                            }
                        });
                        this.$emit('update:groupKeyY', this.groupKeyY);
                        this.$nextTick(() => {
                            this.sendDrawData();
                        });
                        break;
                    case 'source':
                        this.isFilter = false;
                        this.filterGroups(keys, this.groupKey, 'x', 'update:groupKey');
                        this.$emit('update:groupKeyData', keys.toString());
                        this.$nextTick(() => {
                            this.sendDrawData();
                        });
                        break;
                    case 'table':
                        nameArray = this.showNameTable;
                        this.groupsAllTable.map(item => {
                            if (item.id === keys) {
                                this.attributeList[index].otherName = item.name;
                                this.changeTableName(item.name, index, false);
                                nameArray[index] = item.name;
                            }
                        });
                        leftDataArray = this.leftData;
                        leftDataArray[index] = keys;
                        this.$emit('update:groupTableData', leftDataArray);
                        this.$emit('update:showNameTable', nameArray);
                        this.$nextTick(() => {
                            this.sendDrawData();
                        });
                        break;
                    default:
                        console.error('<analysis-chart> 选择指标时，不能识别的位置：' + position);
                }
            },

            // 选仪表图的显示方式
            selectGaugeShow(val) {
                this.$emit('update:gaugeShow', val);
                this.$nextTick(() => {
                    this.sendDrawData();
                });
            },

            filterGroupKey(keys) {
                this.isFilter = false;
                if (this.groupKey === keys[keys.length - 1]) {
                    this.isFilter = true;
                    this.$emit('update:groupKey', '');
                }
            },

            filterGroups(keys, dataChange, direction, emitText) {
                if (!this.isFilter) {
                    if (dataChange === keys) {
                        this.isFilter = true;
                        // 筛选Y轴
                        if (direction === 'left' && emitText === 'update:groupKeyY' || direction === 'right' && emitText === 'update:groupKeyY') {
                            this.groupKeyY[direction] = '';
                            this.$emit(emitText, this.groupKeyY);
                        } else if (direction === 'source') {//筛选数据分组
                            this.$emit(emitText, '');
                        } else if (direction === 'x') { //筛选X轴
                            this.$emit('update:groupKey', '');
                        }
                    }
                }
            },

            clearData() {
                // 清空X轴/y轴/数据分组选中值以及显示名
                this.$emit('update:groupKey', '');
                this.$emit('update:groupKeyY', {left: '', right: ''});
                this.$emit('update:groupKeyData', '');
                this.$emit('update:showName', {x: '', yLeft: '', yRight: '', gauge: ''});
                this.$emit('update:gaugeShow', 1);
                this.clearAllSelectes();
                // 非饼图时清空 最大切片数
                this.$emit('update:pieSlice', '');
                // 清空图表
                this.$nextTick(() => {
                    this.clearChart();
                });
            },

            // 表格图表更改显示为字段
            changeTableName(e, index, isChange) {
                let nameArray = [];
                this.attributeList.map(item => {
                    nameArray.push(item.otherName);
                });
                if (isChange) {
                    nameArray[index] = e.target.value;
                } else {
                    nameArray[index] = e;
                }
                this.$emit('update:showNameTable', nameArray);
                this.$nextTick(() => {
                    this.sendDrawData();
                });
            },

            showDeleteAction(id) {
                this.isShowDelete = true;
                this.tableIndex = id;
            },

            // 表格图表删除字段
            deleteTable(index) {
                if (this.clearAll) {
                    this.clearAll = false;
                }
                this.attributeList.splice(index, 1);
                this.groupTableData.splice(index, 1);
                let nameArray = [];
                this.attributeList.map(item => {
                    nameArray.push(item.otherName);
                });
                this.$emit('update:showNameTable', nameArray);
                this.isShowDelete = false;
                this.$nextTick(() => {
                    this.sendDrawData();
                });
            },

            // 表格图表画图
            drawChartTable(data) {
                this.clearChart();
                this.tableList = data;
            },

            // 画图
            drawChart(data) {
                // 没有数据，退出画图
                if (data.length === 0) {
                    this.clearChart();
                    return;
                }
                this._chart = echarts.getInstanceByDom(this.$refs.visualChartRef)
                    || echarts.init(this.$refs.visualChartRef);
                switch (this.chartType) {
                    case 'line':
                    case 'arealine':
                        this._chart.setOption(
                            getLineChart(this.chartType, this.showName.x, this.showName.yLeft, data), true);
                        break;
                    case 'bar':
                    case 'cross':
                    case 'pm':
                        this._chart.setOption(
                            getBarChart(this.chartType,
                                this.showName.x, this.showName.yLeft,
                                this.showName.yRight, this.groupKeyY.right, this.groupKeyData, data),
                            true);
                        break;
                    case 'table':
                        this.tableList = data;
                        break;
                    case 'pie':
                        this._chart.setOption(getPieChart(data, this.pieMaxSlice, this.bookMarkName), true);
                        break;
                    case 'gauge':
                        this._chart.setOption(getGaugeChart(this.showName.gauge, this.gaugeShow, this.showName, data),
                            true);
                        break;
                    case 'polar':
                        this._chart.setOption(getPolarChart(data), true);
                        break;
                    default:
                        break;
                }
            },

            // 画布的自适应宽度
            resizeChart: debounce(function () {
                if (this._chart) this._chart.resize();
            }, 300),

            // input框输入变化时触发画图，但不需请求网络
            changeShowName(name, e) {
                switch (name) {
                    case 'x':
                        this.$emit('update:showName', {
                            x: e.target.value,
                            yLeft: this.nameYLeft,
                            yRight: this.nameYRight,
                            gauge: this.gaugeName
                        });
                        break;
                    case 'yLeft':
                        this.$emit('update:showName', {
                            x: this.nameX,
                            yLeft: e.target.value,
                            yRight: this.nameYRight,
                            gauge: this.gaugeName
                        });
                        break;
                    case 'yRight':
                        this.$emit('update:showName', {
                            x: this.nameX,
                            yLeft: this.nameYLeft,
                            yRight: e.target.value,
                            gauge: this.gaugeName
                        });
                        break;
                    case 'gauge':
                        this.$emit('update:showName', {
                            x: this.nameX,
                            yLeft: this.nameYLeft,
                            yRight: this.nameYRight,
                            gauge: e.target.value
                        });
                        break;
                }
                this.$nextTick(() => {
                    this.drawChart(this.chartData);
                    this.sendDrawData(true);
                });
            },

            // 饼图最大切片数变化
            changeMaxSlice(e) {
                this.$emit('update:pieSlice', e.toString());
                this.$nextTick(() => {
                    this.drawChart(this.chartData);
                });
            },

            // 清空图表
            clearChart() {
                if (this._chart) this._chart.clear();
            },

            // 点击删除图标清除选项数据
            clearDataAction(type) {
                switch (type) {
                    case 'x':
                        this.$emit('update:showName', {
                            x: '',
                            yLeft: this.nameYLeft,
                            yRight: this.nameYRight,
                            gauge: this.gaugeName
                        });
                        this.$emit('update:groupKey', '');
                        break;
                    case 'left':
                        this.$emit('update:showName', {
                            x: this.nameX,
                            yLeft: '',
                            yRight: this.nameYRight,
                            gauge: this.gaugeName
                        });
                        this.$emit('update:groupKeyY', {left: '', right: this.groupKeyY.right});
                        break;
                    case 'right':
                        this.$emit('update:showName', {
                            x: this.nameX,
                            yLeft: this.nameYLeft,
                            yRight: '',
                            gauge: this.gaugeName
                        });
                        this.$emit('update:groupKeyY', {left: this.groupKeyY.left, right: ''});
                        break;
                    case 'source':
                        this.$emit('update:groupKeyData', '');
                        break;
                }
                this.sendDrawData();
            }
        },
    };
</script>
<style lang="scss">
    @import "../../common/scss/base/variables";
    @import "../../common/scss/base/mixin";

    // 图表
    .visualization-chart {
        border: 1px solid $border-color;
        background-color: white;
        clear: both;
        @include clearfix();

        &:hover {
            @include box-shadow(0 3px 8px rgba(#8b9daf, .16));
        }

        .types { // 1/4 图表类型选择
            padding: 24px;
            font-size: 16px;
            line-height: 48px;
            color: $color-light-content;
            background-color: $title-bg;
            @include user-select(none);
            border-bottom: 2px solid $select-border;

            .chart-type-btn {
                display: inline-block;
                width: 48px;
                margin-left: 24px;
                padding: 0;
                vertical-align: top;
                border: 1px solid $form-border;
                border-radius: 4px;
                background-color: white;
                @include grayscale(1);
                @include transition();
                cursor: pointer;

                svg {
                    display: block;
                    margin: 11px auto;
                    width: 24px;
                    height: 24px;
                    fill: $theme;
                }

                &:hover {
                    border-color: $light-theme;
                    @include grayscale(0);
                }

                &.active,
                &:active {
                    border-color: $theme;
                    @include grayscale(0);
                    @include box-shadow(0 2px 6px rgba($theme, .25));
                }
            }
            .btn-content {
                display: inline-block;
                position: relative;
                .icon-caret-down {
                    position: absolute;
                    right: 16px;
                    top: 36px;
                    cursor: pointer;
                }
                .bar-content {
                    position: absolute;
                    padding-right: 8px;
                    right: -70px;
                    top: 72px;
                    background-color: white;
                    border: 1px solid $border-color;
                    border-radius: 4px;
                    z-index: 1;
                    display: flex;

                    .chart-type-btn {
                        margin-left: 8px;
                        flex: 1;
                        border: none;
                    }
                    .active {
                        box-shadow: none;
                    }
                }
                .turn-on {
                    transform: rotate(0deg);
                }
                .turn-off {
                    transform: rotate(180deg);
                }
            }
        }

        $chart-content-min-height: 584px;
        $chart-setting-width: 200px;

        .visualization-chart-container {
            display: flex;
        }

        .data-source-setting {
            @include box-sizing();
            width: $chart-setting-width;
            min-height: $chart-content-min-height;
            padding: 16px;
            background-color: $title-bg;
            border-right: 1px solid $border-color;

            .selector {
                width: 144px;
            }
            .selector-table {
                margin-bottom: 8px;
                width: 144px;
            }
            .disabled {
                color: $disabled;
            }
            .add-attribute {
                color: $green;
                position: relative;
                cursor: pointer;
                margin-left: 16px;
                margin-top: 8px;
                svg {
                    position: relative;
                    width: 14px;
                    height: 14px;
                    fill: $green;
                    top: 2px;
                }
            }
            .delete-attribute {
                color: $light-red;
                position: relative;
                cursor: pointer;
                margin-left: 16px;
                margin-top: 8px;
                svg {
                    position: relative;
                    width: 14px;
                    height: 14px;
                    fill: $light-red;
                    top: 2px;
                }
            }
        }
        .data-source-table {
            padding: 16px 0 16px 0;
            max-height: 300px;
            overflow: auto;
        }

        .setting-label {
            display: block;
            line-height: 28px;
            margin-bottom: 4px;

            ~ .setting-label {
                margin-top: 14px;
            }
            input {
                float: right;
                width: 45px;
                height: 16px;
                padding: 4px 4px;
                border-radius: 4px;
            }
            .show-text {
                float: right;
                margin-right: 4px;
                color: $color-light-content;
            }
        }

        .table-content {
            height: 75px;
            padding: 8px 16px 4px 16px;
            border-bottom: 1px dashed $border-color;
            display: flex;

            &:last-child {
                border-bottom: none;
            }
            svg {
                width: 14px;
                height: 14px;
                fill: $color-light-content;
                display: none;
            }
            &:hover {
                background-color: $content-bg;
                .table-right {
                    svg {
                        display: block;
                        &:hover {
                            fill: $light-red;
                        }
                    }
                    .icon-delete {
                        display: inline-block;
                    }
                }
                .data-source-setting {
                    padding: 0;
                }
            }
            .table-label {
                input {
                    float: right;
                    width: 75px;
                }
                .show-text {
                    float: right;
                    margin-right: 4px;
                }
                .show-text-table {
                    line-height: 32px;
                }
            }
            .table-left {
                float: left;
                width: 144px;
                .gauge-name {
                    width: 128px;
                }
            }
            .table-right {
                float: right;
                width: 20px;
                height: 20px;
                margin-top: 22px;

                .icon-delete {
                    font-size: 16px;
                    margin-left: 8px;
                    color: $color-light-content;
                    cursor: pointer;
                    display: none;

                    &:hover {
                        color: $light-red;
                    }
                }
            }
        }

        .chart-content { // 3/3 图表内容
            $chart-height: $chart-content-min-height - 24px - 5px - $input-field-height;

            flex: 1;
            border-left: 1px solid $border-color;

            .chart-config {
                display: flex;
                padding: 24px 24px 5px;
                line-height: $input-field-height;

                .chart-title {
                    flex: 1;
                    @include ellipsis();
                }

                .zoom-tip {
                    color: $disabled;
                    padding: 0 16px 0 8px;
                    @include user-select(none);
                }

                kbd {
                    margin: 0 3px;
                    padding: 3px;
                    border: 1px solid $border-color;
                    border-radius: 4px;
                    @include box-shadow(0 2px 2px $border-color);
                }
            }

            .chart {
                height: $chart-height;
            }

            .table-chart {
                max-width: 1100px;
                overflow: auto;
                max-height: $chart-height;
                margin: 0 auto;
                background-color: white;
            }
            table {
                $row-height: 48px;
                width: 100%;
                table-layout: fixed;
                border-spacing: 0;
                border-collapse: collapse;
                overflow: auto;
                border-left: 1px solid $border-color;
                border-right: 1px solid $border-color;

                tr {
                    border-bottom: 1px solid $border-color;
                    td {
                        height: $row-height - 1;
                        padding: 0 12px;
                        overflow: hidden;
                        @include ellipsis();
                        width: 80px;
                    }
                }

                thead {
                    background-color: $title-bg;
                    color: #6e7376;
                    font-weight: bold;
                }

                tbody {
                    tr {
                        cursor: pointer;

                        .action-icon {
                            $width: 16px;
                            width: $width;
                            height: $width;
                        }

                        &:not(.no-hover):hover {
                            background-color: $select-bg;
                        }
                    }
                }
            }
        }
    }
</style>
