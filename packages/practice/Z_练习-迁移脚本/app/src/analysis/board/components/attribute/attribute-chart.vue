<template>
    <div class="board-inner-chart">
        <block-empty v-if="dataEmpty"/>
        <template v-else>
            <template v-if="drawType !== 'total'">
                <attribute-table v-if="chartType === 'reportChart'" :sendObj="query" ref="table"
                                 @change="tableChange"></attribute-table>
                <attribute-graph v-if="chartType !== 'reportChart'" ref="graph" v-bind="graphQuery"></attribute-graph>
            </template>
            <ul class="widget-total" v-if="drawType === 'total'">
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
    import { QueryApi } from '@/api';
    import AttributeGraph from '../board-chart-graph.vue';
    import attributeTable from './attribute-table.vue';

    const CALCULATE_SUM = function (data) {
        let sum = 0;
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            sum += Number(data[rowIndex].value);
        }
        return sum;
    };

    export default {
        components: {
            attributeTable,
            AttributeGraph
        },
        props: {
            timeValue: String,
            name: String,
            measures: Array,
            byFields: Array,
            filter: Object,
            id: Number,
            //filterStr
            chartType: String,
            graphX: '',
            listKeyWord: '',
            byFieldIndices: '',
            titleKeyWord: '',
            yAxisData: '',
            // 选中的指标和分组
            measureKeys: Object,
            seriesKeys: Array,
            pieSlice: ''
        },
        data() {
            return {
                byFieldsFilter: ['', ''],
                sumArray: [],
                dataEmpty: true
            };
        },

        watch: {
            drawType(n) {
                if (n !== 'total') {
                    this.$nextTick(() => {
                        return this.resize();
                    });
                }
            },
        },
        computed: {
            drawType() {
                return this.timeValue === 'total' ? 'total' : 'group';
            },
            query() {
                return {
                    cid: this.$store.state.user.cid,
                    measures: this.measures || [],
                    byFields: this.byFields || [],
                    byFieldsFilter: this.byFieldsFilter,
                    filter: this.filter || {},
                    pieSlice: this.pieSlice || ''
                };
            },
            graphQuery() {
                return {
                    chartType: this.chartType,
                    measureKeys: this.measureKeys,
                    seriesKeys: this.seriesKeys,
                    singleAxisObj: this.singleAxisObj,
                    ...this.query
                };
            }
        },
        mounted() {
            //echart组件使用
            this.$nextTick(()=>{
                this.getReportData();
            });
        },
        methods: {
            getReportData() {
                this.$loading();
                QueryApi
                    .getReportData(this.query)
                    .then(({body: {data}}) => {
                        data.rollupRows = data.totalRows;
                        delete data.totalRows;
                        this.dataEmpty = data.rows.length <= 0;
                        this.$nextTick(() => {
                            this.$refs.graph && this.$refs.graph.setData([data]);
                            this.$refs.table && this.$refs.table.setDate(data);
                        });
                        this.sumArray = [];
                        for (let measures = 0; measures < this.measures.length; measures++) {
                            this.sumArray.push({
                                sum: CALCULATE_SUM(data.rollupRows),
                                name: this.measures[measures].attrName
                            });
                        }
                        this.$loaded();
                    })
                    .catch(() => {
                        this.$loaded();
                    });
            },
            refresh() {
                this.getReportData();
            },
            resize() {
                if (this.$refs.graph && this.$refs.graph.resize) {
                    this.$refs.graph.resize();
                }
            },
            change(obj) {
                this.$emit('change', obj);
                this.$nextTick(() => {
                    this.getReportData();
                });
            },
            tableChange(obj) {
                let changObj = {
                    measures: obj.measures,
                    byFields: obj.byFields,
                    byFieldsFilter: ['', '']
                };
                this.byFieldsFilter = obj.byFieldsFilter;
                this.change(changObj);
            },
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../board-inner-chart";
</style>
