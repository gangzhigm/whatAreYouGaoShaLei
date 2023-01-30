<template>
    <div class="overview-table-content">
        <div class="overview-table">
            <div class="table-head">
                <div class="table-search">
                    <!--<div class="icon icon-search">-->
                    <!--<input type="text" placeholder="按分组筛选" ref="listKeyWord" v-model="copyListKeyWord"-->
                    <!--@keyup.enter="searchKeyWord" @input="lazySearchKeyword">-->
                    <!--</div>-->
                    <div class="total-check" v-show="!isChangeTable">
                        <checkbox class="data-analysis" v-model="checkedTotal"/>
                        显示合计
                    </div>
                    <div class="total-check" v-show="isChangeTable && compareFromDate">
                        <checkbox class="data-analysis" v-model="checkedOriginalTime"/>
                        按原时间排序
                    </div>
                    <div class="total-check" v-show="isChangeTable && compareFromDate">
                        <checkbox class="data-analysis" v-model="checkedCompareTime"/>
                        按对比时间排序
                    </div>
                    <selector class="report-selec no-radiust selector"
                              type="select"
                              v-show="isChangeTable && compareFromDate && measures.length > 1"
                              :options="indexOptions"
                              v-model="measuresType"></selector>
                </div>
                <div class="table-operate">
                    <span @click="changeTable" class="icon icon-change"
                          :style="{backgroundColor:isChangeTable?'#ecf3fc':'#f6f8fa'}"></span>
                    <span @click="isShowPoint = !isShowPoint" class="icon icon-point"
                          :style="{backgroundColor:isShowPoint?'#ecf3fc':'#f6f8fa'}"></span>
                </div>
            </div>
            <div class="table-box">
                <div class="table-tab" v-if="isShowOnlyMeasure">
                <span :class="compareIndex === 0?'active':''" @click="showCompareData(0)"
                      v-html="originalTimeTab"></span>
                    <span :class="compareIndex === 1?'active':''" @click="showCompareData(1)"
                          v-html="compareTimeTab"></span>
                </div>

                <div class="table-tab" v-if="isShowMoreMeasure">
                <span :class="!checkedTotal && compareIndex === 0?'active':''"
                      @click="showCompareData(0)" v-html="originalTimeTab"></span>
                    <span :class="checkedTotal && compareIndex === 0?'active':''"
                          @click="showSummationData(0)" v-html="'原始时间'+'<br>'+'(合计)'"></span>
                    <span :class="!checkedTotal && compareIndex === 1?'active':''" v-if="compareFromDate"
                          @click="showCompareData(1)" v-html="compareTimeTab"></span>
                    <span :class="checkedTotal && compareIndex === 1?'active':''" v-if="compareFromDate"
                          @click="showSummationData(1)" v-html="'对比时间'+'<br>'+'(合计)'">(合计)</span>
                </div>
                <div class="table-content" ref="tableSummation" v-show="isShowSummation"
                     :style="{height:isShowMoreMeasure?'calc(100% - 40px)':'100%'}"></div>
                <div class="table-content" ref="table" v-show="!isShowSummation"
                     :style="{height:isShowMoreMeasure?'calc(100% - 40px)':'100%'}"></div>
            </div>

            <div class="pages-text">每个指标最多展示 100 条数据</div>
        </div>
    </div>
</template>
<script>
    /**
     * sendObj
     * @param fromDate
     * @param toDate
     * @param compareFromDate
     * @param compareToDate
     * @param fieldNames 显示为名称 || 属性名称
     * @param measureNames 显示为名称 || 事件名称
     * @param measures
     * @param byFields
     * @param unit
     * @param filter
     * @param indexOptions 显示为名称 || 事件名称
     */

    /**
     * change
     * @param measures
     * @param byFields
     */

    /*
* 外部组件通过this.$refs.xxx.setDate(data)传入数据;
* */
    import {
        addArrow,
        addJumpClass,
        effectiveTable,
        orderByGroup,
        orderByNum,
        orderByTime,
        orderByTotal,
        originalHorizontalTable,
        originalVerticalTableTable,
        pointData,
        summationTable,
    } from '../../../event-analysis/table-handle';
    import MegaTable from '../../../../common/utils/MegaTable';
    import debounce from 'lodash/debounce';


    export default {
        name: '',
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            fromDate: String,
            toDate: String,
            compareFromDate: String,
            compareToDate: String,
            fieldNames: Array,
            measureNames: Array,
            indexOptions: Array,
            measures: Array,
            byFields: Array,
        },
        computed: {
            originalTime() {
                return this.fromDate.split(' ')[0] + ' 至 ' + this.toDate.split(' ')[0];
            },
            originalTimeTab() {
                return this.fromDate.split(' ')[0] + '<br>' + this.toDate.split(' ')[0];
            },

            compareTime() {
                return this.compareFromDate.split(' ')[0] + ' 至 ' + this.compareToDate.split(' ')[0];
            },
            compareTimeTab() {
                return this.compareFromDate.split(' ')[0] + '<br>' + this.compareToDate.split(' ')[0];
            },
            pageList() {
                return 999;
            },
            isShowSummation() {
                return this.checkedTotal && this.measures.length > 1 && !this.isChangeTable && this.byFields.length > 0;
            },
            isShowOnlyMeasure() {
                return this.compareFromDate && !this.isChangeTable && this.measures.length === 1;
            },
            isShowMoreMeasure() {
                return this.measures.length > 1 && !this.isChangeTable && this.byFields.length > 0;
            },
            percentMeasureIndices() {
                return this.measures.map((measures, index) => {
                    if (measures.format === '2p') {
                        return index;
                    }
                });
            }
        },
        data() {
            return {
                isShowPoint: false,
                isChangeTable: true,
                isShowChangeTotal: false,
                checkedTotal: false,
                checkedOriginalTime: true,
                checkedCompareTime: false,
                compareIndex: 0,
                copyListKeyWord: '',

                _table: null,
                _tableSummation: null,
                _reportData: [],
                _transposedReportData: [],
                _currentTable: [],
                _summationTable: [],
                _compareSummationTable: [],

                measuresType: 0,
                allData: 0,
                pageNow: 1,
                pageSummationNow: 1,
                totalPage: 0,
                totalSummationPage: 0,
                sortValue: 'desc',
                dataEmpty: false
            };
        },
        mounted() {
            // this.handleData(this.originalData);
        },
        methods: {
            setDate(originalData) {
                if (originalData[0].rows.length === 0) return;
                originalData.forEach((originalData, index) => {
                    if (index < 2) {
                        if (!originalData.rows[0]) return;
                        originalData.rows.map((rows) => {
                            rows.values.map((values) => {
                                values.map((value, valueIdx) => {
                                    if (this.percentMeasureIndices.includes(valueIdx)) {
                                        value[0] = value[0] + '%%';
                                    }
                                });
                            });
                        });
                        originalData.rollupRows.map(rollupRows => {
                            rollupRows.values.map((values) => {
                                values.map((value, valueIdx) => {
                                    if (this.percentMeasureIndices.includes(valueIdx)) {
                                        value[0] = value[0] + '%%';
                                    }
                                });
                            });
                        });
                    }
                });
                let byFields = originalData[0].byFields;
                // let rollupRows = originalData[0].rollupRows;
                let columns = originalData[0].rows;
                let firstColumn = originalData[0].series;
                this.dataEmpty = columns.length === 0 ? true : false;

                let horizontalTable = [],
                    verticalTable = [],
                    compareHorizontalTable = [],
                    // sums = [],
                    // rowIdx = 0,
                    colIdx = 0;
                let byFieldsLen = byFields.length;
                // 转置表格：上侧多出1行表头, 左侧多出 byFields.length + 1(合计) 列
                let colLen = byFieldsLen + firstColumn.length + 1;
                //有对比时间
                if (this.compareFromDate !== '') {
                    // 默认表格：上侧多出1行表头+1行合计、左侧多出1列表头
                    horizontalTable = originalHorizontalTable(this.fieldNames, this.measureNames, originalData[0]);
                    compareHorizontalTable = effectiveTable(
                        originalHorizontalTable(this.fieldNames, this.measureNames, originalData[1]),
                        0
                    );
                    this._compareSummationTable = summationTable(this.fieldNames, this.measureNames, originalData[1]);
                    verticalTable[0] = [];
                    if (this.measures.length === 1) {
                        //转置之后的数组
                        for (colIdx = 0; colIdx < colLen + 1; colIdx++) { // 列
                            if (colIdx < byFieldsLen) {
                                verticalTable[0].push(this.fieldNames[colIdx]);
                            } else if (colIdx === byFieldsLen) {
                                verticalTable[0].push('时间段');
                            } else if (colIdx === byFieldsLen + 1) {
                                verticalTable[0].push('合计');
                            } else {
                                verticalTable[0].push(
                                    originalData[0].series[colIdx - byFieldsLen - 2] + '<br>'
                                    + originalData[1].series[colIdx - byFieldsLen - 2]
                                );
                            }
                        }
                        let rowNum = 3 * this.measures.length;
                        for (let i = 0, rowIdx = 1; rowIdx < columns.length * rowNum; rowIdx += rowNum, i++) { // 行
                            for (let measuresIdx = 0; measuresIdx < rowNum; measuresIdx++) {
                                verticalTable[rowIdx + measuresIdx] = [];
                            }
                            for (colIdx = 0; colIdx < colLen + 1; colIdx++) { // 列
                                let index = rowIdx - i * (rowNum - 1);
                                for (let measuresIdx = 0; measuresIdx < rowNum; measuresIdx++) {

                                    let compareIndex = (rowIdx + measuresIdx - 1) % 3;
                                    let idx = parseInt((rowIdx + measuresIdx - 1) / 3) % this.measures.length;
                                    let time;
                                    if (compareIndex === 0) {
                                        time = this.originalTime;
                                    } else if (compareIndex === 1) {
                                        time = this.compareTime;
                                    } else {
                                        time = '对比';
                                    }

                                    if (colIdx < byFieldsLen) {
                                        verticalTable[rowIdx + measuresIdx]
                                            .push(originalData[0].rows[index - 1].byValues[colIdx]);
                                    } else if (colIdx === byFieldsLen) {
                                        verticalTable[rowIdx + measuresIdx].push({
                                            text: time,
                                            compareIndex: compareIndex
                                        });
                                    } else if (colIdx === byFieldsLen + 1) {
                                        let values = originalData[compareIndex].rollupRows[index - 1]
                                            ? originalData[compareIndex].rollupRows[index - 1].values[0][idx][0] : '-';
                                        verticalTable[rowIdx + measuresIdx].push(values);
                                    } else {
                                        verticalTable[rowIdx + measuresIdx].push(
                                            compareIndex === 2
                                                ? originalData[compareIndex].rows[index - 1]
                                                    .values[colIdx - byFieldsLen - 2][idx][0]
                                                : originalData[compareIndex].rows[index - 1]
                                                    .values[colIdx - byFieldsLen - 2][idx]
                                        );
                                    }
                                }
                            }
                        }
                    } else {
                        //转置之后的数组
                        for (colIdx = 0; colIdx < colLen + 2; colIdx++) { // 列
                            if (colIdx < byFieldsLen) {
                                verticalTable[0].push(this.fieldNames[colIdx]);
                            } else if (colIdx === byFieldsLen) {
                                verticalTable[0].push('指标');
                            } else if (colIdx === byFieldsLen + 1) {
                                verticalTable[0].push('时间段');
                            } else if (colIdx === byFieldsLen + 2) {
                                verticalTable[0].push('合计');
                            } else {
                                verticalTable[0].push(
                                    originalData[0].series[colIdx - byFieldsLen - 3] + '<br>'
                                    + originalData[1].series[colIdx - byFieldsLen - 3]
                                );
                            }
                        }
                        let rowNum = this.measures.length * 3;
                        for (let i = 0, rowIdx = 1; rowIdx < columns.length * rowNum; rowIdx += rowNum, i++) { // 行
                            for (let measuresIdx = 0; measuresIdx < rowNum; measuresIdx++) {
                                verticalTable[rowIdx + measuresIdx] = [];
                            }
                            for (colIdx = 0; colIdx < colLen + 2; colIdx++) { // 列
                                let index = rowIdx - i * (rowNum - 1);
                                for (let measuresIdx = 0; measuresIdx < rowNum; measuresIdx++) {
                                    let compareIndex = (rowIdx + measuresIdx - 1) % 3;
                                    let idx = parseInt((rowIdx + measuresIdx - 1) / 3) % this.measures.length;
                                    let time;
                                    if (compareIndex === 0) {
                                        time = this.fromDate.split(' ')[0] + ' 至 ' + this.toDate.split(' ')[0];
                                    } else if (compareIndex === 1) {
                                        time = this.compareFromDate.split(' ')[0] + ' 至 '
                                            + this.compareToDate.split(' ')[0];
                                    } else {
                                        time = '对比';
                                    }

                                    if (colIdx < byFieldsLen) {
                                        verticalTable[rowIdx + measuresIdx]
                                            .push(originalData[0].rows[index - 1].byValues[colIdx]);
                                    } else if (colIdx === byFieldsLen) {
                                        let obj = compareIndex < 2 ? {
                                            text: this.measureNames[idx],
                                            compareIndex: compareIndex,
                                            userCountInside: this.measures[idx].userCountInside,
                                            measures: this.measures[idx]
                                        } : this.measureNames[idx];
                                        verticalTable[rowIdx + measuresIdx].push(obj);
                                    } else if (colIdx === byFieldsLen + 1) {
                                        verticalTable[rowIdx + measuresIdx].push({
                                            text: time,
                                            compareIndex: compareIndex
                                        });
                                    } else if (colIdx === byFieldsLen + 2) {
                                        let values = originalData[compareIndex].rollupRows[index - 1].values[0][idx][0];
                                        verticalTable[rowIdx + measuresIdx].push(values);
                                    } else {
                                        let values = compareIndex === 2
                                            ? originalData[compareIndex].rows[index - 1]
                                                .values[colIdx - byFieldsLen - 3][idx][0]
                                            : originalData[compareIndex].rows[index - 1]
                                                .values[colIdx - byFieldsLen - 3][idx];
                                        verticalTable[rowIdx + measuresIdx].push(values);
                                    }
                                }

                            }

                        }
                    }
                } else {
                    // 默认表格：上侧多出1行表头+1行合计、左侧多出1列表头
                    horizontalTable = originalHorizontalTable(
                        this.fieldNames, this.measureNames, JSON.parse(JSON.stringify(originalData[0]))
                    );
                    verticalTable = originalVerticalTableTable(
                        this.fieldNames, this.measureNames, this.measures, JSON.parse(JSON.stringify(originalData[0]))
                    );
                }

                if (this.measures.length !== 1) {
                    this._summationTable = summationTable(this.fieldNames, this.measureNames, originalData[0]);
                    this.pagination();
                }

                this._reportData = horizontalTable;
                this._transposedReportData = verticalTable;
                this._compareData = compareHorizontalTable;

                this.pageNow = 1;
                if (this.compareFromDate !== '' && this.isChangeTable) {
                    this.drawCompareTable(this._transposedReportData);
                } else {
                    this.drawTable();
                }
            },

            pushRouter(/*measures, compareIndex, sliceDate, sliceByValues, valueNum*/) {
                // TODO: not clear
                // eslint-disable-next-line
                return;
            },

            showCompareData(index) {
                this.compareIndex = index;
                this.checkedTotal = false;
                this.pageNow = 1;
                this.drawTable();
                if (this.measures.length > 1 && this.byFields.length > 0) {
                    this.pagination();
                }
            },
            showSummationData(index) {
                this.compareIndex = index;
                this.checkedTotal = true;
            },

            pagination() {
                let arr = this.compareIndex === 0 ? this._summationTable : this._compareSummationTable;
                let pageNum = arr.length;
                let _this = this;
                let table;
                let head = arr.slice(0, 1);
                if (this.pageSummationNow - 1 === 0) {
                    table = arr.slice(1, pageNum * this.pageSummationNow);
                } else {
                    table = arr.slice(
                        pageNum * (this.pageSummationNow - 1),
                        10 * (this.pageSummationNow - 1) + (pageNum - 1)
                    );
                }
                table = head.concat(table);
                if (!this._tableSummation) {
                    this._tableSummation = new MegaTable(this.$refs.tableSummation, {
                        className: 'table',
                        data: table,
                        clickHandler: function (cell, {col, row, data}) {
                            _this.measures.forEach((measures, measuresIdx) => {
                                if (measures.userCountInside) {
                                    if (col === measuresIdx + 2) {
                                        _this.pushRouter(measures, _this.compareIndex, '', data[row][1], data[row][col]);
                                    }
                                }
                            });
                        }
                    });
                } else {
                    this._tableSummation.setData(table);
                }
                this.totalSummationPage = Math.ceil(arr.length / pageNum);
                let startCol = this.measures.length !== 1 && this.byFields.length !== 0 ? 2 : 1;
                for (let row = 1; row < table.length; row++) {
                    for (let col = startCol; col < table[row].length; col++) {
                        if (this.measures[col - startCol].userCountInside) {
                            addJumpClass(this.$refs.tableSummation.getElementsByTagName('table')[0].rows[row].cells[col]);
                        }
                    }
                }
            },

            changePage(arr = this._currentTable) {
                let headNum;
                if (this.measures.length > 1 && this.byFields.length > 1) {
                    headNum = 1;
                } else {
                    headNum = !this.isChangeTable && this.checkedTotal ? 2 : 1;
                }
                let head = arr.slice(0, headNum);
                let data = arr.slice(headNum);
                data = data.slice(this.pageList * (this.pageNow - 1), this.pageList * this.pageNow);
                this.allData = arr.length - head.length;
                this.totalPage = Math.ceil(this.allData / this.pageList);
                let table = head.concat(data);
                this.setTable(table);
            },

            tableArrow() {
                //加箭头
                if (!this.isChangeTable) {//添加排序图标
                    if (this.measures.length === 1) {
                        addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0], this.sortValue);
                    } else {
                        if (this.fieldNames.length > 0) {
                            for (let i = 0; i < this.measures.length + 2; i++) {
                                if (i === 0) {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0],
                                        this.sortValue
                                    );
                                } else if (i === 1) {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[1],
                                        this.byFields[0].order
                                    );
                                } else {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[i],
                                        this.measures[i - 2].order
                                    );
                                }
                            }
                        } else {
                            for (let i = 0; i < this.measures.length + 1; i++) {
                                if (i === 0) {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0],
                                        this.sortValue
                                    );
                                } else {
                                    addArrow(
                                        this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[i],
                                        this.measures[i - 1].order
                                    );
                                }
                            }
                        }
                    }

                } else {
                    let current = 0;
                    this.byFields.forEach((list, index) => {
                        if (list.order) {
                            addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[index], list.order);
                        } else {
                            current++;
                            addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[index], '');
                        }
                    });
                    let order = current === this.byFields.length ? this.sortValue : '';
                    if (this.measures.length === 1) {
                        addArrow(
                            this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[this.byFields.length],
                            order
                        );
                    } else {
                        addArrow(
                            this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[this.byFields.length + 1],
                            order
                        );
                    }
                }
            },

            //渲染的表格
            drawTable() {
                let table;
                let _this = this;
                if (!this.isChangeTable) {//转置
                    if (this.compareFromDate !== '' && this.compareIndex === 1) {
                        table = this._compareData;
                    } else {
                        table = this._reportData;
                    }
                    if (!this.checkedTotal) {//不合计
                        let templeArr = JSON.parse(JSON.stringify(table));
                        let noTotalTable;
                        if (this.measures.length === 1) {
                            noTotalTable = templeArr.slice(0, 1).concat(templeArr.slice(2));
                        } else {
                            if (this.byFields.length === 0) {
                                noTotalTable = templeArr.slice(0, 1).concat(templeArr.slice(2));
                            } else {
                                noTotalTable = templeArr;
                            }
                        }
                        table = noTotalTable;
                    }
                    if (this.measures.length === 1) {
                        table = orderByTime(table, this.sortValue);
                    } else {
                        let index = this.measures.findIndex(measures => (measures.order));
                        let position;
                        if (index !== -1) {
                            position = this.byFields.length > 0 ? 2 : 1;
                            table = orderByNum(position + index, table, this.measures[index].order);
                        }
                    }
                } else {
                    table = this._transposedReportData;
                    let total = 0;
                    this.byFields.forEach(list => {
                        if (!list.order) {
                            total++;
                        }
                    });
                    if (total === this.byFields.length) {
                        if (this.measures.length === 1) {
                            table = orderByTotal(this.byFields.length, table, this.sortValue);
                        } else {
                            table = orderByTotal(this.byFields.length + 1, table, this.sortValue);
                        }
                    }

                }
                table = pointData(table, this.isShowPoint);
                _this.changePage(table);

                this._currentTable = table;
                this.tableArrow();
            },

            //对比时间的表格
            drawCompareTable() {
                let table;
                let position = this.measures.length !== 1 ? this.byFields.length + 2 : this.byFields.length + 1;
                let timePosition = this.checkedOriginalTime ? 0 : 1;

                if (!this.isChangeTable) {//转置
                    if (this.compareFromDate !== '' && this.compareIndex === 1) {
                        table = this._compareData;
                    } else {
                        table = this._reportData;
                    }
                } else {
                    table = this._transposedReportData;
                }

                table = pointData(table, this.isShowPoint);
                table = orderByGroup(
                    table, this.sortValue, 3 * this.measures.length, this.measuresType, timePosition, position
                );
                this.allData = table.length - 1;
                this.totalPage = Math.ceil(this.allData / 49);

                this.changePage(table);
                this._currentTable = table;
                addArrow(this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[position], this.sortValue);
            },

            setTable(table) {
                let _this = this;
                if (!this._table) {
                    this._table = new MegaTable(this.$refs.table, {
                        className: 'table',
                        data: table,
                        clickHandler: function (cell, {col, row, data}) {
                            if (_this.compareFromDate !== '' && _this.isChangeTable) {
                                if (row === 0) {
                                    let position = _this.measures.length !== 1
                                        ? _this.byFields.length + 2
                                        : _this.byFields.length + 1;
                                    if (position === col) {
                                        _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                        _this.measures.forEach(list => {
                                            _this.$set(list, 'order', '');
                                        });
                                        _this.byFields.forEach(list => {
                                            _this.$set(list, 'order', '');
                                        });
                                        _this.pageNow = 1;
                                        _this.drawCompareTable();
                                    }
                                } else {
                                    if (_this.measures.length === 1) {
                                        if (_this.measures[0].userCountInside && col > _this.byFields.length) {
                                            let compareIndex = data[row][_this.byFields.length].compareIndex < 2
                                                ? data[row][_this.byFields.length].compareIndex
                                                : 2;
                                            if (compareIndex !== 2) {
                                                let sliceDate = col === _this.byFields.length + 1
                                                    ? ''
                                                    : data[0][col].split('<br>')[compareIndex];
                                                let sliceByValues = _this.byFields.map((list, index) => data[row][index]);
                                                if (sliceDate !== '-') {
                                                    _this.pushRouter(
                                                        _this.measures[0],
                                                        compareIndex,
                                                        sliceDate,
                                                        sliceByValues.join(','),
                                                        data[row][col]
                                                    );
                                                }
                                            }

                                        }
                                    } else {
                                        let compareIndex = data[row][_this.byFields.length].compareIndex < 2
                                            ? data[row][_this.byFields.length].compareIndex
                                            : 2;
                                        if (
                                            data[row][_this.byFields.length].userCountInside
                                            && col > _this.byFields.length + 1
                                        ) {
                                            let sliceDate = col === _this.byFields.length + 2
                                                ? ''
                                                : data[0][col].split('<br>')[compareIndex];
                                            let sliceByValues = _this.byFields.map((list, index) => data[row][index]);
                                            if (sliceDate !== '-') {
                                                _this.pushRouter(
                                                    data[row][_this.byFields.length].measures,
                                                    compareIndex,
                                                    sliceDate,
                                                    sliceByValues.join(','),
                                                    data[row][col]
                                                );
                                            }
                                        }
                                    }


                                }

                            } else {
                                if (!_this.isChangeTable) {//转置 按日期排序
                                    if (col === 0 && row === 0) {
                                        _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                        let table = orderByTime(_this._currentTable, _this.sortValue);
                                        _this.measures.forEach(list => {
                                            _this.$set(list, 'order', '');
                                        });
                                        _this.byFields.forEach(list => {
                                            _this.$set(list, 'order', '');
                                        });
                                        _this.changePage(table);
                                        _this._currentTable = table;
                                        _this.tableArrow();
                                        _this.pageNow = 1;
                                    } else {
                                        if (row === 0) {
                                            if (_this.measures.length !== 1) {
                                                let table = _this._currentTable;
                                                if (col !== 0) {
                                                    _this.sortValue = '';
                                                    addArrow(
                                                        _this.$refs.table.getElementsByTagName('table')[0].rows[0].cells[0],
                                                        ''
                                                    );
                                                }
                                                if (_this.byFields.length > 0) {
                                                    if (col === 1) {
                                                        _this.byFields[0].order = _this.byFields[0].order === 'asc'
                                                            ? 'desc' : 'asc';
                                                        _this.measures.forEach(list => {
                                                            _this.$set(list, 'order', '');
                                                        });
                                                        _this.pageNow = 1;
                                                        _this.$emit('change', {
                                                            byFields: _this.byFields,
                                                            measures: _this.measures
                                                        });
                                                    } else {
                                                        _this.byFields[0].order = '';
                                                        _this.measures.forEach((list, i) => {
                                                            if (i === col - 2) {
                                                                let order = list.order === 'asc' ? 'desc' : 'asc';
                                                                _this.$set(list, 'order', order);
                                                            } else {
                                                                _this.$set(list, 'order', '');
                                                            }
                                                        });

                                                        table = orderByNum(
                                                            col,
                                                            _this._currentTable,
                                                            _this.measures[col - 2].order
                                                        );
                                                    }
                                                } else {
                                                    _this.measures.forEach((list, i) => {
                                                        if (i === col - 1) {
                                                            let order = list.order === 'asc' ? 'desc' : 'asc';
                                                            _this.$set(list, 'order', order);
                                                            table = orderByNum(
                                                                col,
                                                                _this._currentTable,
                                                                _this.measures[col - 1].order,
                                                                _this.checkedTotal
                                                            );
                                                        } else {
                                                            _this.$set(list, 'order', '');
                                                        }
                                                    });
                                                }

                                                _this.changePage(table);
                                                _this._currentTable = table;
                                                _this.tableArrow();

                                            }
                                        }
                                    }

                                } else {
                                    if (row === 0) {
                                        if (_this.measures.length === 1) {
                                            if (col === _this.byFields.length) {//转置 按合计排序
                                                _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                                let table = orderByTotal(
                                                    _this.byFields.length,
                                                    _this._currentTable,
                                                    _this.sortValue
                                                );
                                                _this.measures.forEach(list => {
                                                    _this.$set(list, 'order', '');
                                                });
                                                _this.byFields.forEach(list => {
                                                    _this.$set(list, 'order', '');
                                                });
                                                _this.changePage(table);
                                                _this._currentTable = table;
                                                _this.tableArrow();
                                                addArrow(cell, _this.sortValue);
                                            } else if (col < _this.byFields.length) {
                                                _this.sortValue = '';
                                                _this.byFields.forEach((list, i) => {
                                                    if (i === col) {
                                                        _this.$set(list, 'order', list.order === 'asc' ? 'desc' : 'asc');
                                                    } else {
                                                        _this.$set(list, 'order', '');
                                                    }
                                                });
                                                if (_this.byFields.length !== 0) {
                                                    _this.$emit('change', {
                                                        byFields: _this.byFields,
                                                        measures: _this.measures
                                                    });
                                                }
                                            }
                                        } else {
                                            if (col === _this.byFields.length + 1) {//转置 按合计排序
                                                _this.sortValue = _this.sortValue === 'asc' ? 'desc' : 'asc';
                                                let table = orderByTotal(
                                                    _this.byFields.length + 1,
                                                    _this._currentTable,
                                                    _this.sortValue
                                                );
                                                _this.measures.forEach(list => {
                                                    _this.$set(list, 'order', '');
                                                });
                                                _this.byFields.forEach(list => {
                                                    _this.$set(list, 'order', '');
                                                });
                                                _this.changePage(table);
                                                _this._currentTable = table;
                                                _this.tableArrow();
                                                addArrow(cell, _this.sortValue);
                                            } else if (col < _this.byFields.length) {
                                                _this.byFields.forEach((list, i) => {
                                                    if (i === col) {
                                                        _this.$set(list, 'order', list.order === 'asc' ? 'desc' : 'asc');
                                                    } else {
                                                        _this.$set(list, 'order', '');
                                                    }
                                                });
                                                _this.sortValue = '';
                                                _this.$emit('change', {
                                                    byFields: _this.byFields,
                                                    measures: _this.measures
                                                });
                                            }
                                        }
                                    }

                                    _this.pageNow = 1;
                                }


                                if (_this.byFields.length === 0) {
                                    if (!_this.isChangeTable) {
                                        if (row !== 0) {
                                            if (_this.measures.length === 1) {
                                                if (_this.measures[0].userCountInside && col > 0) {
                                                    let sliceDate = _this.checkedTotal && row === 1 ? '' : data[row][0];
                                                    _this.pushRouter(
                                                        _this.measures[0],
                                                        _this.compareIndex,
                                                        sliceDate,
                                                        '',
                                                        data[row][col]
                                                    );
                                                }
                                            } else {
                                                _this.measures.forEach((measures, measuresIdx) => {
                                                    if (measures.userCountInside) {
                                                        if (col === measuresIdx + 1) {
                                                            let sliceDate = _this.checkedTotal && row === 1
                                                                ? '' : data[row][0];
                                                            _this.pushRouter(
                                                                measures,
                                                                _this.compareIndex,
                                                                sliceDate,
                                                                '',
                                                                data[row][col]
                                                            );
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                    } else {
                                        if (row !== 0) {
                                            if (_this.measures.length === 1) {
                                                if (_this.measures[0].userCountInside) {
                                                    let sliceDate = col === 0 ? '' : data[0][col];
                                                    _this.pushRouter(
                                                        _this.measures[0],
                                                        _this.compareIndex,
                                                        sliceDate,
                                                        '',
                                                        data[row][col]
                                                    );
                                                }
                                            } else {
                                                if (col > 0 && data[row][0].userCountInside) {
                                                    let sliceDate = col === 1 ? '' : data[0][col];
                                                    _this.pushRouter(
                                                        data[row][0].measures,
                                                        _this.compareIndex,
                                                        sliceDate,
                                                        '',
                                                        data[row][col]
                                                    );
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (row !== 0 && col !== 0) {
                                        if (!_this.isChangeTable) {
                                            if (_this.measures.length === 1) {
                                                if (_this.measures[0].userCountInside) {
                                                    let sliceDate = _this.checkedTotal && row === 1 ? '' : data[row][0];
                                                    _this.pushRouter(
                                                        _this.measures[0],
                                                        _this.compareIndex,
                                                        sliceDate,
                                                        data[0][col],
                                                        data[row][col]
                                                    );
                                                }
                                            } else {
                                                _this.measures.forEach((measures, measuresIdx) => {
                                                    if (measures.userCountInside) {
                                                        if (col === measuresIdx + 2) {
                                                            _this.pushRouter(
                                                                measures,
                                                                _this.compareIndex,
                                                                data[row][0],
                                                                data[row][1],
                                                                data[row][col]
                                                            );
                                                        }
                                                    }
                                                });
                                            }
                                        } else {
                                            if (_this.measures.length === 1) {
                                                if (_this.measures[0].userCountInside) {
                                                    let sliceByValues = _this.byFields
                                                        .map((list, index) => data[row][index]);
                                                    let sliceDate = col === 1 ? '' : data[0][col];
                                                    _this.pushRouter(
                                                        _this.measures[0],
                                                        _this.compareIndex,
                                                        sliceDate,
                                                        sliceByValues.join(','),
                                                        data[row][col]
                                                    );
                                                }
                                            } else {
                                                if (col > _this.byFields.length) {
                                                    if (data[row][_this.byFields.length].userCountInside) {
                                                        let sliceByValues = _this.byFields
                                                            .map((list, index) => data[row][index]);
                                                        let sliceDate = col === _this.byFields.length + 1
                                                            ? ''
                                                            : data[0][col];
                                                        let compareIndex = _this.compareFromDate !== ''
                                                            ? data[row][_this.byFields.length].compareIndex
                                                            : _this.compareIndex;
                                                        _this.pushRouter(
                                                            data[row][_this.byFields.length].measures,
                                                            compareIndex,
                                                            sliceDate,
                                                            sliceByValues.join(','),
                                                            data[row][col]
                                                        );
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    });
                } else {
                    this._table.setData(table);
                }
            },

            changeTable() {
                this.isChangeTable = !this.isChangeTable;
                this.copyListKeyWord = '';
                this.pageNow = 1;
                this.sortValue = 'desc';
                this.measures.forEach((measures) => {
                    this.$set(measures, 'order', '');
                });
                this.byFields.forEach((byFields) => {
                    this.$set(byFields, 'order', '');
                });

                if (this.compareFromDate !== '' && this.isChangeTable) {
                    this.drawCompareTable();
                } else {
                    this.drawTable();
                }
            },

            // 筛选行、列
            searchKeyWord() {
                let _currentTable = this._currentTable;
                let table = [];
                if (this.byFields.length === 0) return;
                if (this.copyListKeyWord.trim() === '') {
                    table = _currentTable;
                } else {
                    let keyWordIndex = [];
                    if (!this.isChangeTable) {
                        keyWordIndex[0] = true;
                        if (this.measures.length === 1) {
                            for (let i = 1; i < _currentTable[0].length; i++) {
                                keyWordIndex.push(false);
                                if (_currentTable[0][i].indexOf(this.copyListKeyWord.trim()) !== -1) {
                                    keyWordIndex[i] = true;
                                }
                            }
                        } else {
                            for (let i = 1; i < _currentTable.length; i++) {
                                keyWordIndex.push(false);
                                if (_currentTable[i][1].indexOf(this.copyListKeyWord.trim()) !== -1) {
                                    keyWordIndex[i] = true;
                                }
                            }
                        }
                    } else {
                        for (let i = 1; i < _currentTable.length; i++) {
                            keyWordIndex.push(false);
                            this.byFields.forEach((byFields, index) => {
                                if (_currentTable[i][index].indexOf(this.copyListKeyWord.trim()) !== -1) {
                                    keyWordIndex[i] = true;
                                }
                            });
                        }
                    }

                    if (!this.isChangeTable) {
                        if (this.measures.length === 1) {
                            for (let row = 0; row < _currentTable.length; row++) {
                                table[row] = [];
                                // TODO: not clear
                                // eslint-disable-next-line
                                keyWordIndex.forEach((keyWordIndex, col) => {
                                    if (keyWordIndex) {
                                        table[row].push(_currentTable[row][col]);
                                    }
                                });
                            }
                        } else {
                            keyWordIndex.forEach((keyWordIndex, row) => {
                                if (keyWordIndex) {
                                    table.push(_currentTable[row]);
                                }
                            });
                        }

                    } else {
                        keyWordIndex.forEach((keyWordIndex, row) => {
                            if (keyWordIndex) {
                                table.push(_currentTable[row]);
                            }
                        });
                    }

                    if (!this.isChangeTable) {
                        // numb
                    } else {
                        let headNum;
                        if (this.measures.length > 1 && this.byFields.length > 1) {
                            headNum = 1;
                        } else {
                            headNum = !this.isChangeTable && this.checkedTotal ? 2 : 1;
                        }
                        let head = _currentTable.slice(0, headNum);
                        table = head.concat(table);
                    }
                }
                this.setTable(table);
                return table;
            },

            lazySearchKeyword: debounce(function () {
                this.searchKeyWord();
            }, 3000),
            clearKeyWord: debounce(function () {
                this.copyListKeyWord = '';
                this.searchKeyWord();
            }, 3000),
        },
        watch: {
            checkedTotal() {
                if (this.compareFromDate !== '' && this.isChangeTable) {
                    this.drawCompareTable(this._transposedReportData);
                } else {
                    this.drawTable();
                }
            },
            isShowPoint() {
                if (this.compareFromDate !== '' && this.isChangeTable) {
                    this.drawCompareTable(this._transposedReportData);
                } else {
                    this.drawTable();
                }
            },
            pageNow() {
                if (this.compareFromDate !== '' && this.isChangeTable) {
                    this.drawCompareTable(this._transposedReportData);
                } else {
                    this.drawTable();
                }

                // let table = this.searchKeyWord();
                // this.changePage(table)
            },
            pageSummationNow() {
                this.pagination();
            },
            checkedOriginalTime(val) {
                this.checkedCompareTime = !val;
                this.drawCompareTable();
            },
            checkedCompareTime(val) {
                this.checkedOriginalTime = !val;
            },
            measuresType() {
                this.drawCompareTable();
            },
            copyListKeyWord() {
                this.pageNow = 1;
            }
        },
    };
</script>
<style lang="scss" type="text/scss" rel="stylesheet/scss">
    @import "../../../../common/scss/components/overview-table";
</style>