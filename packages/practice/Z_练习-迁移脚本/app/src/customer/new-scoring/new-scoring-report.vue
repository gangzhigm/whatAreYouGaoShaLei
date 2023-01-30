<template>
    <div class="new-scoring-report">
        <!-- 面包屑导航 -->
        <div class="content-view">
            <crumbs :crumbs="crumbs"></crumbs>
        </div>
        <!-- 模型报告 -->
        <div class="page-head">
            <div class="content-view report-title">
                <div class="back" @click="goBack">
                    <i class="icon icon-fanhui1"></i>
                </div>
                <h1>{{ 'newScoring.modelReports' | t }}</h1>
            </div>
        </div>

        <div class="page-content">
            <div class="content-view margin">
                <!-- 数据来源 -->
                <div class="data-source white-bg">
                    <label class="data-source-title">{{ 'newScoring.dataSources' | t }}</label>
                    <div class="selector">
                        <selector
                            class="lg"
                            :placeholder="selectPlaceHolder"
                            :options="dataSourceList"
                            v-model="sourceId"
                            @select="dataSourceChange"
                        ></selector>
                    </div>
                </div>
            </div>

            <!-- 计算结果 -->
            <div class="computed-result">
                <div class="result-date">
                    <h5>{{ 'newScoring.lastComputationalResult' | t }}:{{ scoringDate || ' -' }}</h5>
                    <button
                        class="btn btn-md btn-theme"
                        :disabled="$has('datacentre_scorerating_swarm')"
                        @click="openSaveModal"
                    >
                        {{ 'newScoring.saveAsSegment' | t }}
                    </button>
                </div>

                <div class="computed-table" v-if="computedResult.comRes">
                    <template v-if="loading">
                        <inline-loading />
                    </template>
                    <table border="1" v-else>
                        <thead>
                            <!-- 第一行 -->
                            <tr>
                                <th colspan="3"></th>
                                <th colspan="7" class="table-title">{{ 'newScoring.eventDimension' | t }}</th>
                            </tr>
                            <!-- 第二行 -->
                            <tr>
                                <th colspan="3"></th>
                                <th>4</th>
                                <th>3</th>
                                <th>2</th>
                                <th>1</th>
                                <th colspan="3" width="24%" class="total-rows table-title">
                                    {{ 'newScoring.totalRows' | t }}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowspan="4" colspan="2" width="24%" class="table-title">
                                    {{ 'newScoring.attributeDimension' | t }}
                                </td>
                                <td>{{ computedResult.comRes[0].name }}</td>
                                <template v-for="(a, i) in computedResult.comRes[0].list">
                                    <td
                                        width="10%"
                                        :key="i"
                                        v-if="i < 4"
                                        :style="{ 'background-color': colorComputed(computedResult.comRes[0].name, i) }"
                                        class="hover-td"
                                    >
                                        <p class="columns-p">{{ thousandthsformat(a.value) }}</p>
                                        <span>{{ a.percent }}%</span>

                                        <div class="hover">
                                            <b>{{ computedResult.comRes[0].name + (4 - i) }}</b>
                                            <p class="columns-p">{{ thousandthsformat(a.value) }}</p>
                                            <span>{{ a.percent }}%</span>
                                        </div>
                                    </td>
                                    <td :key="i" v-else colspan="3" class="total-rows">
                                        <p class="columns-p">{{ thousandthsformat(a.value) }}</p>
                                        <span>{{ a.percent }}%</span>
                                    </td>
                                </template>
                            </tr>
                            <template v-for="(e, index) in computedResult.comRes">
                                <tr v-if="index != 0" :key="e.name">
                                    <td>{{ e.name }}</td>
                                    <template v-for="(l, i) in e.list">
                                        <td
                                            width="10%"
                                            :key="i"
                                            v-if="i < 4"
                                            :style="{ 'background-color': colorComputed(e.name, i) }"
                                            class="hover-td"
                                        >
                                            <p class="columns-p">{{ thousandthsformat(l.value) }}</p>
                                            <span>{{ l.percent }}%</span>

                                            <!-- 划过放大显示 -->
                                            <div class="hover">
                                                <b>{{ e.name + (4 - i) }}</b>
                                                <p class="columns-p">{{ thousandthsformat(l.value) }}</p>
                                                <span>{{ l.percent }}%</span>
                                            </div>
                                        </td>
                                        <!-- 行统计 -->
                                        <td :key="i" v-else colspan="3" class="total-rows">
                                            <p class="columns-p">{{ thousandthsformat(l.value) }}</p>
                                            <span>{{ l.percent }}%</span>
                                        </td>
                                    </template>
                                </tr>
                            </template>
                        </tbody>
                        <!-- 列统计 -->
                        <tfoot>
                            <tr>
                                <td colspan="3" class="table-title">{{ 'newScoring.totalColumns' | t }}</td>
                                <template v-for="(col, i) in computedResult.totalColumns">
                                    <td :key="i">
                                        <p class="columns-p">{{ col.value }}</p>
                                        <span>{{ col.percent }}%</span>
                                    </td>
                                </template>
                                <td colspan="3"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- 保存为分群 -->
            <modal :title="$t('newScoring.saveAsSegment')" v-if="saveModal" @close="saveCancel">
                <div class="form-field">
                    <p>{{ 'newScoring.modalContent' | t }}</p>
                </div>
                <div class="form-field">
                    <selector class="lg" :options="levelList" v-model="levelId"></selector>
                    <p class="error" v-if="showError&&!levelId">{{ errorMsg }}</p>
                </div>
                <template v-slot:buttons>
                    <input
                        type="button"
                        class="btn btn-md btn-theme-border"
                        :value="$t('common.cancel')"
                        @click="saveCancel"
                    />
                    <input
                        type="button"
                        class="btn btn-md btn-theme"
                        :value="$t('common.confirm')"
                        @click="saveConfirm"
                    />
                </template>
            </modal>
        </div>
    </div>
</template>

<script type="text/ecmascript-6">
import { ScoringV2 } from '@/api';
import { thousandthsformat, floatPointSum, floatPointMul } from '@/common/utils/numberformat';

const $lightYellow = '#fcefcb';
const $lightOrange = '#f9ddbc';
const $pink = '#ffc1b9';
const $grey = '#d7d7d7';

const LvA = 'A';
const LvB = 'B';
const LvC = 'C';
const LvD = 'D';

const level = {
    [LvA]: 0,
    [LvB]: 1,
    [LvC]: 2,
    [LvD]: 3
};

let colorRenger = {
    [LvA]: function (i) {
        let color;
        if (i === 0) {
            color = $lightYellow;
        } else if (i === 1) {
            color = $lightOrange;
        } else {
            color = $pink;
        }
        return color;
    },
    [LvB]: function (i) {
        let color;
        if (i === 0) {
            color = $lightYellow;
        } else if (i === 3) {
            color = $pink;
        } else {
            color = $lightOrange;
        }
        return color;
    },
    [LvC]: function (i) {
        let color;
        if (i === 0) {
            color = $grey;
        } else if (i === 1) {
            color = $lightYellow;
        } else {
            color = $lightOrange;
        }
        return color;
    },
    [LvD]: function (i) {
        return [0, 1].includes(i) ? $grey : $lightYellow;
    },
};

export default {
    data () {
        return {
            dataSourceList: [],
            sourceId: '',
            selectPlaceHolder: this.$t('newScoring.selectPlaceHolder'),
            computedResult: {},
            scoringDate: '',
            saveModal: false,
            isSubmit: false,
            levelId: '',
            levelList: [],
            errorMsg: '',
            showError: false,
            loading: true,
            source: {
                id: ''
            },
            sumNum: 0 //评分总数
        };
    },
    computed: {
        crumbs () {
            return [
                { name: 'wecom', text: 'Dmartech' },
                { name: 'scorerating', text: this.$t('newScoring.newScoring') },
                Object.assign({}, this.$route, {
                    text: this.$t('newScoring.modelReports')
                })
            ];
        }
    },
    methods: {
        goBack () {
            this.$router.push({ name: 'scorerating' });
        },
        thousandthsformat, //千分位转换
        floatPointSum, //浮点值相加
        floatPointMul, //浮点值相乘

        // 等级生成A1-A4
        getLvList () {
            let i = 0;
            const lvList = [LvA, LvB, LvC, LvD];

            while (i < 4) {
                this.getIdByIndex(lvList[i]);
                i++;
            }
        },

        getIdByIndex (lv) {
            let i = 1;

            while (i < 5) {
                this.levelList.push({
                    id: lv + i,
                    name: lv + i
                });
                i++;
            }
        },

        //数据来源发生变化时
        dataSourceChange ({ id }) {
            //点击选中的数据来源时不错逻辑处理
            if (id !== this.source.id) {
                this.source = Object.assign({}, { id });
                this.getModelReport();
            }
        },

        //获取数据来源
        getDataSource () {
            ScoringV2.getSource()
                .then(({ body: { data } }) => {
                    this.dataSourceList = [];
                    for (let i in data.modelList) {
                        this.dataSourceList.push({ id: i, name: data.modelList[i] });
                    }

                    this.sourceId = this.$route.query.modelId;
                    this.getModelReport();
                });
        },

        //保存为分群
        openSaveModal () {
            this.showError = false;
            this.errorMsg = '';
            this.levelId = '';
            this.saveModal = true;
        },

        saveCancel () {
            this.saveModal = false;
        },

        //评分模型-创建联系人分群
        saveConfirm () {
            if (this.isSubmit) return;

            this.isSubmit = true;
            if (!this.levelId) {
                this.showError = true;
                this.errorMsg = this.$t('common.dataRequired');
                this.isSubmit = false;
                return;
            }

            this.showError = false;
            this.errorMsg = '';

            const params = {
                modelId: this.sourceId,
                gradeName: this.levelId
            };

            ScoringV2.createContactSwarm(params)
                .then(({ body: { data } }) => {
                    this.$toast(this.$t('common.saveSuccess'), 'success');
                    this.saveModal = false;
                    this.isSubmit = false;

                    let url = this.$router.resolve({
                        path: `/customer/swarm`,
                        query: {
                            scoringId: data.swarm.id
                        }
                    });
                    window.open(url.href, '_blank');
                })
                .catch(() => {
                    this.isSubmit = false;
                });
        },

        //获取报告结果
        getModelReport () {
            this.loading = true;
            ScoringV2.getReport(this.sourceId)
                .then(({ body: { data } }) => {
                    this.scoringDate = data.scoringDate;
                    this.computedResult = {};
                    this.loading = false;

                    // 有数据时的处理
                    if (data.grades.length > 0) {
                        this.getComputedResult(data.grades);
                    } else {
                        //没有数据时的处理
                        const list = this.levelList.map(e => ({
                            gradeCount: 0,
                            gradeName: e.name,
                            percentage: 0,
                        }));
                        this.getComputedResult(list);
                    }
                })
                .catch(() => {
                    this.loading = false;
                });
        },

        /**
         * index：  属性维度的下表例如 a4-a1
         * comRes： 所需要的计算结果
         */
        comResRender (comRes, ele) {
            //属性维度A-D
            const name = ele.gradeName.substring(0, 1);

            //copResI: comRes的下标
            const copResI = level[name];

            //事件维度1-4
            const index = Number(ele.gradeName.substring(1, 2));

            if (!comRes[copResI]) {
                comRes[copResI] = {
                    name,
                    list: new Array(4)
                };
            }

            comRes[copResI].list.splice((4 - index), 1, {
                value: ele.gradeCount,
                percent: this.floatPointMul(ele.percentage, 100)
            });
        },

        //列汇总
        columnsCop (totalColumns, doNum, comRes) {
            comRes.forEach((e) => {
                const lVal = e.list[doNum];
                let value;

                if (!totalColumns[doNum]) {
                    value = lVal.value;
                } else {
                    value = this.floatPointSum(totalColumns[doNum].value, lVal.value);
                }

                totalColumns[doNum] = { value: value, percent: 0 };
            });

            //  列百分比 =  每列数值相加 / 评分总数
            totalColumns = totalColumns.forEach(e => {
                const percent = this.floatPointMul(e.value / this.sumNum, 100);
                e.percent = e.value === 0 ? 0 : Math.floor(percent * 100) / 100;
            });
        },

        //行汇总
        rowCop (comRes) {
            comRes.forEach(e => {
                let value = 0;

                e.list.forEach(e => {
                    value += e.value;
                });

                const percent = this.floatPointMul(value / this.sumNum, 100);

                e.list.splice(4, 0, {
                    percent: value === 0 ? 0 : Math.floor(percent * 100) / 100,
                    value
                });
            });
        },

        //获取计算结果
        getComputedResult (list) {
            let totalColumns = new Array(4);//列
            let comRes = new Array(4); //计算结果

            this.sumNum = 0;
            list.forEach(e => {
                this.comResRender(comRes, e);
                this.sumNum += e.gradeCount;
            });

            //列值相加
            let doColNum = 0;
            while (doColNum < 4) {
                this.columnsCop(totalColumns, doColNum, comRes);
                doColNum++;
            }

            //行值相加
            this.rowCop(comRes);
            this.computedResult = { totalColumns, comRes };
        },

        //背景色分配
        colorComputed (type, index) {
            if (index > 3) return;

            return colorRenger[type](index);
        }
    },
    created () {
        this.getLvList();
        this.getDataSource();
    }
};
</script>

<style lang="scss" type="text/scss" rel="stylesheet/scss" scoped>
@import '../../common/scss/base/_variables';
@import '../../common/scss/base/_mixin';

.new-scoring-report {
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

        .computed-result {
            background-color: #fff;
            min-width: 1000px;
            margin: 0 3%;

            .result-date {
                display: flex;
                padding: 10px 20px;
                justify-content: space-between;

                h5 {
                    line-height: 32px;
                }
            }
        }

        .computed-table {
            padding: 10px 20px;
            table {
                border-color: #d0d0d0;
                width: 100%;
                border-collapse: collapse;
                border-spacing: 0;
                text-align: center;
                td,
                th {
                    height: 60px;
                    background-clip: content-box;
                    padding: 5px;
                    position: relative;

                    .columns-p {
                        font-size: 16px;
                        margin-bottom: 6px;
                    }
                }

                .hover-td {
                    .hover {
                        display: none;
                        position: absolute;
                        width: 140px;
                        height: 75px;
                        box-shadow: 0 0 10px #666;
                        border-radius: 6px;
                        right: -100px;
                        top: -60px;
                        z-index: 1;
                        background: #fff;
                        padding-top: 5px;

                        b {
                            font-size: 14px;
                        }

                        > p {
                            margin-top: 12px;
                        }
                    }
                }

                .hover-td:hover .hover {
                    display: unset;
                }
                .total-rows {
                    text-align: right;
                    padding-right: 10px;
                }
                .table-title {
                    font-size: 16px;
                    font-weight: bold;
                }
            }
        }

        .form-field {
            .error {
                color: $light-red;
            }
        }
    }
}
</style>
