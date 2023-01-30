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

export function originalHorizontalTable(fieldNames, measureNames, data) {
    let columns = data.rows,
        firstColumn = data.series;
    
    let horizontalTable = [],
        colIdx = 0,
        rowIdx;
    
    // 默认表格：上侧多出1行表头+1行合计、左侧多出1列表头
    for (rowIdx = 0; rowIdx <= firstColumn.length; rowIdx++) { // 行
        horizontalTable[rowIdx] = [];
        for (colIdx = 0; colIdx <= columns.length; colIdx++) { // 列
            if (rowIdx === 0) {
                horizontalTable[rowIdx].push(colIdx === 0 ? fieldNames[0] : columns[colIdx - 1].byValues.join(','));
            } else {
                horizontalTable[rowIdx].push(
                    colIdx === 0
                        ? firstColumn[rowIdx - 1]
                        : columns[colIdx - 1].values[rowIdx - 1][0]
                );
            }
            
        }
    }
    
    return horizontalTable;
    
}

