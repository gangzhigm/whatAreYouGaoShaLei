import {translate as t} from '@/locales';

export function addArrow(cell, flag) {
    if (cell.getElementsByTagName('div').length > 0) {
        cell.removeChild(cell.getElementsByTagName('div')[0]);
    }
    let div = document.createElement('div');
    div.className = 'sort-box';
    let top = document.createElement('i');
    top.className = 'top-i';
    let bottom = document.createElement('i');
    bottom.className = 'bottom-i';
    if (flag === 'asc') {
        top.className = 'top-i checked';
    } else if (flag === 'desc') {
        bottom.className = 'bottom-i checked';
    }
    div.appendChild(top);
    div.appendChild(bottom);
    cell.appendChild(div);
}

export function getTime(time, unit) {
    let changTime = time;
    if (unit === 'week') {
        changTime = time.substr(0, time.length - 2);
    } else if (unit === 'month') {
        changTime = time.substr(0, time.length - 1);
    } else if (unit === 'year') {
        changTime = time.substr(0, time.length - 1);
    }
    return new Date(changTime).getTime();
}

export function orderByTime(data, flag, unit) {
    let table;
    if (data.length <= 1) {
        return data;
    }
    if (data[1][0] === t('eventAnalysis.summation')) {
        table = data.slice(0, 2);
        table = table.concat(data.slice(2).sort((a, b) => {
            if (flag === 'asc') {
                return getTime(a[0], unit) - getTime(b[0], unit);
            }
            return getTime(b[0], unit) - getTime(a[0], unit);
        }));
    } else {
        table = data.slice(0, 1);
        table = table.concat(data.slice(1).sort((a, b) => {
            if (flag === 'asc') {
                return getTime(a[0], unit) - getTime(b[0], unit);
            }
            return getTime(b[0], unit) - getTime(a[0], unit);
        }));
    }
    return table;
}

function escape(num) {
    return num.replace(/[%]/g, '');
}

export function orderByTotal(position, data, flag) {
    let table;
    table = data.slice(0, 1);
    table = table.concat(data.slice(1).sort((a, b) => {
        if (flag === 'asc') {
            return escape(a[position]) - escape(b[position]);
        }
        return escape(b[position]) - escape(a[position]);
    }));
    return table;
}

export function orderByNum(position, data, flag, change) {
    let table, head;
    if (change) {
        head = data.slice(0, 2);
        table = data.slice(2);
    } else {
        head = data.slice(0, 1);
        table = data.slice(1);
    }
    table = head.concat(table.sort((a, b) => {
        if (a[position] instanceof Array) {
            if (flag === 'asc') {
                return escape(a[position][0]) - escape(b[position][0]);
            }
            return escape(b[position][0]) - escape(a[position][0]);
        }
        if (flag === 'asc') {
            return escape(a[position]) - escape(b[position]);
        }
        return escape(b[position]) - escape(a[position]);
    }));
    return table;
}


export function pointData(arr, flag) {
    if (flag) {
        return arr;
    }
    return arr.map(list => {
        return list.map(item => {
            if (item instanceof Array) {
                return item[0];
            }
            return item;
        });
    });
}

export function originalHorizontalTable(fieldNames, measureNames, data) {
    let byFields = data.byFields,
        rollupRows = data.rollupRows,
        columns = data.rows,
        firstColumn = data.series;

    let horizontalTable = [],
        sums = [],
        rowIdx = 0,
        colIdx = 0;

    if (firstColumn.length === 0) return [];
    if (measureNames.length === 1) {
        // 默认表格：上侧多出1行表头+1行合计、左侧多出1列表头
        for (rowIdx = 0; rowIdx <= firstColumn.length + 1; rowIdx++) { // 行
            horizontalTable[rowIdx] = [];
            for (colIdx = 0; colIdx <= columns.length; colIdx++) { // 列
                if (rowIdx === 0) {
                    horizontalTable[rowIdx].push(colIdx === 0 ? t('time.date') : columns[colIdx - 1].byValues.join(','));
                } else if (rowIdx !== 1) {
                    if (colIdx === 0) {
                        horizontalTable[rowIdx].push(firstColumn[rowIdx - 2]);
                    } else {
                        let cellData = columns[colIdx - 1].values[rowIdx - 2][0];
                        sums[colIdx - 1] = (sums[colIdx - 1] || 0) + (Number(cellData[0]) || 0);
                        horizontalTable[rowIdx].push(cellData);
                    }
                }
                if (rowIdx === firstColumn.length + 1) {
                    if (byFields.length > 0) {
                        horizontalTable[1].push(colIdx === 0 ? t('eventAnalysis.summation') : rollupRows[colIdx - 1].values[0][0][0]);
                    } else {
                        horizontalTable[1].push(colIdx === 0 ? t('eventAnalysis.summation') : rollupRows[colIdx - 1].values[0][0][0]);
                    }

                }

            }
        }
    } else {
        horizontalTable[0] = [];
        if (fieldNames.length > 0) {
            for (colIdx = 0; colIdx <= measureNames.length + 1; colIdx++) { // 列
                if (colIdx === 0) {
                    horizontalTable[0].push(t('time.date'));
                } else if (colIdx === 1) {
                    horizontalTable[0].push(fieldNames.join(','));
                } else {
                    horizontalTable[0].push(measureNames[colIdx - 2]);
                }
            }
        } else {
            for (colIdx = 0; colIdx <= measureNames.length; colIdx++) { // 列
                if (colIdx === 0) {
                    horizontalTable[0].push(t('time.date'));
                } else {
                    horizontalTable[0].push(measureNames[colIdx - 1]);
                }
            }
        }
        if (fieldNames.length > 0) {
            for (
                let i = 0, rowIdx = 1;
                rowIdx < firstColumn.length * columns.length + 1;
                rowIdx += columns.length, i++
            ) { // 行
                for (let measuresIdx = 0; measuresIdx < columns.length; measuresIdx++) {
                    horizontalTable[rowIdx + measuresIdx] = [];
                }
                for (colIdx = 0; colIdx <= measureNames.length + 1; colIdx++) { // 列
                    let index = rowIdx - i * (columns.length - 1);
                    // let colLength = 0;
                    // if (firstColumn[index - 1] === '-') colLength++;
                    for (let measuresIdx = 0; measuresIdx < columns.length; measuresIdx++) {
                        if (colIdx === 0) {
                            horizontalTable[rowIdx + measuresIdx].push(firstColumn[index - 1]);
                        } else if (colIdx === 1) {
                            horizontalTable[rowIdx + measuresIdx].push(columns[measuresIdx].byValues.join(','));
                        } else {
                            horizontalTable[rowIdx + measuresIdx]
                                .push(columns[measuresIdx].values[index - 1][colIdx - 2]);
                        }

                    }

                }
            }
        } else {
            for (let rowIdx = 1; rowIdx <= firstColumn.length + 1; rowIdx++) { // 行
                horizontalTable[rowIdx] = [];
                for (colIdx = 0; colIdx <= measureNames.length; colIdx++) { // 列
                    if (colIdx === 0) {
                        horizontalTable[rowIdx].push(rowIdx === 1 ? t('eventAnalysis.summation') : firstColumn[rowIdx - 2]);
                    } else {
                        horizontalTable[rowIdx]
                            .push(
                                rowIdx === 1
                                    ? rollupRows[0].values[rowIdx - 1][colIdx - 1][0]
                                    : columns[0].values[rowIdx - 2][colIdx - 1]
                            );
                    }
                }
            }
        }


    }

    return horizontalTable;

}

// 转置表格：上侧多出1行表头, 左侧多出 byFields.length + 1(合计) 列
export function originalVerticalTableTable(fieldNames, measureNames, measures, data) {
    let byFields = data.byFields,
        rollupRows = data.rollupRows,
        columns = data.rows,
        firstColumn = data.series;

    let verticalTable = [],
        rowIdx = 0,
        colIdx = 0;
    let byFieldsLen = byFields.length;
    let colLen = byFieldsLen + firstColumn.length + 1;

    if (measureNames.length === 1) {
        for (rowIdx = 0; rowIdx <= columns.length; rowIdx++) { // 行
            verticalTable[rowIdx] = [];
            for (colIdx = 0; colIdx < colLen; colIdx++) { // 列
                if (colIdx < byFieldsLen) {
                    verticalTable[rowIdx]
                        .push(rowIdx === 0 ? fieldNames[colIdx] : columns[rowIdx - 1].byValues[colIdx]);
                } else if (colIdx === byFieldsLen) {
                    verticalTable[rowIdx]
                        .push(rowIdx === 0 ? t('eventAnalysis.summation') : rollupRows[rowIdx - 1].values[0][0][0]);
                } else {
                    verticalTable[rowIdx]
                        .push(
                            rowIdx === 0
                                ? firstColumn[colIdx - byFieldsLen - 1]
                                : columns[rowIdx - 1].values[colIdx - byFieldsLen - 1][0]
                        );
                }
            }
        }
    } else {
        verticalTable[0] = [];
        for (colIdx = 0; colIdx < colLen + 1; colIdx++) { // 列
            if (colIdx < byFieldsLen) {
                verticalTable[0].push(fieldNames[colIdx]);
            } else if (colIdx === byFieldsLen) {
                verticalTable[0].push(t('eventAnalysis.norm'));
            } else if (colIdx === byFieldsLen + 1) {
                verticalTable[0].push(t('eventAnalysis.summation'));
            } else {
                verticalTable[rowIdx].push(firstColumn[colIdx - byFieldsLen - 2]);
            }
        }
        for (let i = 0, rowIdx = 1; rowIdx < columns.length * measureNames.length; rowIdx += measureNames.length, i++) { // 行
            for (let measuresIdx = 0; measuresIdx < measureNames.length; measuresIdx++) {
                verticalTable[rowIdx + measuresIdx] = [];
            }
            for (colIdx = 0; colIdx < colLen + 1; colIdx++) { // 列
                for (let measuresIdx = 0; measuresIdx < measureNames.length; measuresIdx++) {
                    let index = rowIdx - i * (measureNames.length - 1);
                    if (colIdx < byFieldsLen) {
                        verticalTable[rowIdx + measuresIdx].push(columns[index - 1].byValues[colIdx]);
                    } else if (colIdx === byFieldsLen) {
                        verticalTable[rowIdx + measuresIdx].push({
                            text: measureNames[measuresIdx],
                            userCountInside: measures[measuresIdx].userCountInside,
                            measures: measures[measuresIdx],
                            compareIndex: measuresIdx
                        });
                    } else if (colIdx === byFieldsLen + 1) {
                        verticalTable[rowIdx + measuresIdx].push(rollupRows[index - 1].values[0][measuresIdx][0]);
                    } else {
                        verticalTable[rowIdx + measuresIdx]
                            .push(columns[index - 1].values[colIdx - byFieldsLen - 2][measuresIdx]);
                    }
                }

            }

        }
    }
    return verticalTable;
}


const sliceArray = (array, size) => {
    let result = [];
    for (let x = 0; x < Math.ceil(array.length / size); x++) {
        let start = x * size;
        let end = start + size;
        result.push(array.slice(start, end));
    }
    return result;
};

const totalSliceArray = (table, measurePosition, timePosition, comparePosition) => {
    return {
        total: sliceArray(table, 3)[measurePosition][timePosition][comparePosition],
        array: table
    };
};

export function orderByGroup(arr, order, groupSize, measurePosition, timePosition, comparePosition) {
    let head = arr.slice(0, 1);
    let table = arr.slice(1);

    let sortTable = [];
    let sliceTable = sliceArray(table, groupSize);
    for (let i = 0; i < sliceTable.length; i++) {
        sortTable.push(totalSliceArray(sliceTable[i], measurePosition, timePosition, comparePosition));
    }
    sortTable = sortTable.sort((a, b) => {
        if (order === 'asc') {
            return escape(a.total) - escape(b.total);
        }
        return escape(b.total) - escape(a.total);
    });
    let tempArr = [];
    sortTable.forEach(groupList => {
        groupList.array.forEach(item => {
            tempArr.push(item);
        });
    });
    return head.concat(tempArr);
}


export function effectiveTable(arr, position) {
    let table = [];
    arr.forEach(list => {
        if (list[position] !== '-') {
            table.push(list);
        }
    });
    return table;
}


export function addJumpClass(cell) {
    if (cell.getElementsByTagName('p').length > 0) {
        cell.getElementsByTagName('p')[0].className = 'router-p';
    }
}

export function summationTable(fieldNames, measureNames, data) {
    let rollupRows = data.rollupRows,
        columns = data.rows;

    let summationTable = [],
        colIdx = 0;
    summationTable[0] = [];
    if (fieldNames.length > 0) {
        for (colIdx = 0; colIdx <= measureNames.length + 1; colIdx++) { // 列
            if (colIdx === 0) {
                summationTable[0].push(t('time.date'));
            } else if (colIdx === 1) {
                summationTable[0].push(fieldNames.join(','));
            } else {
                summationTable[0].push(measureNames[colIdx - 2]);
            }
        }
    } else {
        for (colIdx = 0; colIdx <= measureNames.length; colIdx++) { // 列
            if (colIdx === 0) {
                summationTable[0].push(t('time.date'));
            } else {
                summationTable[0].push(measureNames[colIdx - 1]);
            }
        }
    }
    // 多指标合计表格
    for (let i = 0, rowIdx = 1; rowIdx < 1 + columns.length; rowIdx += columns.length, i++) { // 行
        for (let measuresIdx = 0; measuresIdx < columns.length; measuresIdx++) {
            summationTable[rowIdx + measuresIdx] = [];
        }
        if (fieldNames.length > 0) {
            for (colIdx = 0; colIdx <= measureNames.length + 1; colIdx++) { // 列
                for (let measuresIdx = 0; measuresIdx < columns.length; measuresIdx++) {

                    if (colIdx === 0) {
                        summationTable[rowIdx + measuresIdx].push(t('eventAnalysis.summation'));
                    } else if (colIdx === 1) {
                        summationTable[rowIdx + measuresIdx].push(columns[measuresIdx].byValues.join(','));
                    } else {
                        summationTable[rowIdx + measuresIdx].push(rollupRows[measuresIdx].values[0][colIdx - 2][0]);
                    }

                }
            }
        } else {
            for (colIdx = 0; colIdx <= measureNames.length; colIdx++) { // 列
                for (let measuresIdx = 0; measuresIdx < columns.length; measuresIdx++) {
                    if (colIdx === 0) {
                        summationTable[rowIdx + measuresIdx].push(t('eventAnalysis.summation'));
                    } else {
                        summationTable[rowIdx + measuresIdx].push(rollupRows[measuresIdx].values[0][colIdx - 1][0]);
                    }
                }
            }
        }

    }

    return summationTable;
}

export function sortData(data) {
    let newData = {
        byFields: data[1].byFields,
        rollupRows: [],
        rows: [],
        series: data[1].series,
        seriesOrigin: data[1].seriesOrigin,
        truncated: data[1].truncated,
    };
    data[1].rollupRows.forEach((changeList, index) => {
        data[0].rollupRows.forEach((list, idx) => {
            if (list.byValues.join('') === changeList.byValues.join('')) {
                newData.rollupRows[idx] = changeList;
                newData.rows[idx] = data[1].rows[index];
            }
        });
    });
    return [data[0], newData, data[2]];
}
