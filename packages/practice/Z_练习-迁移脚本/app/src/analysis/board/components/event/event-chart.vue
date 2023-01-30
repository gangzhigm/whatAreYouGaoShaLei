<template>
    <div class="board-inner-chart">
        <block-empty v-if="dataEmpty"/>
        <template v-else>
            <template v-if="unit !== 'total'">
                <event-table v-if="type === 'reportChart'" v-bind="tableQuery" ref="table" @change="tableChange"/>
                <event-graph v-if="type !== 'reportChart'" v-bind="graphQuery" ref="graph"/>
            </template>
            <ul class="widget-total" v-if="unit === 'total'">
                <li v-for="(sumNum,index) in sumArray" :key="index"
                    :class="{'total-number-more':sumArray.length > 1}">
                    <div class="widget-key">
                        <b>{{sumNum.sum}}</b><span class="widget-unit"></span>
                    </div>
                    <p class="widget-key-caption"> {{sumNum.name}} </p>
                </li>
            </ul>
        </template>
    </div>
</template>
<script>
    import { QueryApi, ServiceApiV2 } from '@/api';
    import {timeOptions} from '../../board.vue';
    import eventGraph from '../board-chart-graph.vue';
    import eventTable from './event-table.vue';
    import {sortData} from '../../../event-analysis/table-handle';
    import cloneDeep from 'lodash/cloneDeep';

    function calculateSum(data, sumIndex) {
        let sum = 0;
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            sum += Number(data[rowIndex].values[0][sumIndex][0]);
        }
        return sum;
    }

    export default {
        components: {
            eventTable,
            eventGraph,
        },
        props: {
            end: String,
            start: String,
            unit: String,
            name: String,
            compareEnd: String,
            compareStart: String,
            timeType: String,
            dynamicTimeParams: Array,
            compareTimeType: String,
            compareDynamicTimeParams: Array,
            originalTime: String,
            compareTime: String,
            measures: Array,
            byFields: Array,
            filter: Object,
            queryName: Object,
            id: Number,
            type: {
                type: String,
                default: 'line'
            },
            attrInfoList: Array,
            // 选中的指标和分组
            measureKeys: Object,
            seriesKeys: Array,
            singleAxisObj: Object, // 坐标轴设置
            pieSlice: ''
        },
        data() {
            return {
                timeOptions,//时间选项
                isShowTime: false,
                //删除
                sumArray: [],
                dataEmpty: true
            };
        },
        mounted() {
            this.$nextTick(() => {
                this.getReportData();
            });
        },
        watch: {
            unit(n, o) {
                if (n === 'total' && this.sumArray.length !== 0) {
                    return;
                }
                if (n !== o) {
                    return this.getReportData();
                }
            }
        },
        computed: {
            query() {
                let time = this.unit !== 'total' ? this.unit : 'year';
                return {
                    fromDate: this.start || '',
                    toDate: this.end || '',
                    compareFromDate: this.compareStart || '',
                    compareToDate: this.compareEnd || '',
                    timeType: this.timeType,
                    dynamicTimeParams: this.dynamicTimeParams,
                    compareTimeType: this.compareTimeType,
                    compareDynamicTimeParams: this.compareDynamicTimeParams,
                    measures: this.measures || [],
                    byFields: this.byFields || [],
                    unit: time || '',
                    filter: this.filter || {},
                    attrInfoList: this.attrInfoList || [],
                    byFieldsFilter: [''],
                    cid: this.$store.state.user.cid,
                    pieSlice: this.pieSlice || ''
                };
            },
            tableQuery() {
                let indexOptions = this.queryName.measureNames.map((list, index) => ({
                    id: index,
                    name: list,
                }));
                return {
                    fieldNames: this.queryName.fieldNames || [],
                    measureNames: this.queryName.measureNames || [],
                    indexOptions: indexOptions || [],
                    ...this.query
                };
            },
            graphQuery() {
                return {
                    chartType: this.type,
                    measureKeys: this.measureKeys,
                    seriesKeys: this.seriesKeys,
                    singleAxisObj: this.singleAxisObj,
                    originalTime: this.originalTime,
                    compareTime: this.compareTime,
                    ...this.tableQuery
                };
            }
        },
        methods: {
            change(obj) {
                this.$emit('change', obj);
                this.$nextTick(() => {
                    this.getReportData();
                });
            },
            tableChange(obj) {
                this.change(obj);
            },
            getReportData() {
                this.$loading();
                ServiceApiV2
                    .checkKuduStatus(this.$store.state.user.cid)
                    .then((res) => {
                        if (res.body.data.status !== 0 && res.body.data.status !== 2) {
                            QueryApi
                                .getEventReportData(this.query)
                                .then(({body: {data}}) => {
                                    this.dataEmpty = data[0].rows.length === 0 || this.seriesKeys.length === 0;
                                    let originalData = this.tableQuery.compareFromDate !== '' ? sortData(data) : data;
                                    this.$nextTick(() => {
                                        this.$refs.table && this.$refs.table.setDate(cloneDeep(originalData));
                                        this.$refs.graph && this.$refs.graph.setData(originalData);
                                    });
                                    this.sumArray = [];
                                    let dataLength = originalData.length === 1 ?
                                        originalData.length : originalData.length - 1;
                                    for (let measures = 0; measures < this.measures.length; measures++) {
                                        for (let i = 0; i < dataLength; i++) {
                                            this.sumArray.push({
                                                sum: calculateSum(originalData[i].rollupRows, measures),
                                                name: this.queryName.measureNames[measures]
                                            });
                                        }
                                    }
                                    this.$loaded();
                                })
                                .catch(() => {
                                    this.$loaded();
                                });
                        }
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            refresh() {
                this.$nextTick(() => {
                    this.getReportData();
                });
            },
            resize() {
                if (this.$refs.graph && this.$refs.graph.resize) {
                    this.$refs.graph.resize();
                }
            },
        }
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../board-inner-chart";
</style>
