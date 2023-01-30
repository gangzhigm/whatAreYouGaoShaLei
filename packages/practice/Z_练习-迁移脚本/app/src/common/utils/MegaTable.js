/**
 * 可视窗口外缓存的单元格数
 * @type {number}
 */
// const BUFFER = 5;


/**
 * 默认填充 td 的方法
 * @param {HTMLTableCellElement} td
 * @param data
 * @return td
 */
const defaultCellCreator = (td, data) => {
    data = data === '' ? '-' : data;
    let ele;
    if (data instanceof Array) {
        let text = data[0] === '' ? '-' : data[0];
        if (typeof text === 'string') {
            if (text.slice(text.length - 2) === '%%') {
                text = text.slice(0, text.length - 2) + '%';
            }
        }
        if (data[1] !== '-' && data[1] !== 0) {
            let color = data[1] > 0 ? '#0cc2a9' : '#f06067';
            ele = `<p>${text}</p><span style="color:${color}">${data[1]}%</span>`;
            td.style.lineHeight = 16 + 'px';
        } else {
            ele = `<p>${text}</p>`;
        }
    } else if (typeof data === 'object') {
        ele = data.text === '' ? '-' : data.text;
    } else if (typeof data === 'string') {
        if (data.slice(data.length - 2) === '%%') {
            ele = `<p>${data.slice(0, data.length - 2)}%</p>`;
        } else if (data.slice(data.length - 1) === '%') {
            let color;
            color = data.slice(0, data.length - 1) > 0 ? '#0cc2a9' : '#f06067';
            ele = `<span style="color:${color}">${data}</span>`;//对比时间
        } else {
            ele = `<p>${data}</p>`;
        }
    } else {
        ele = data;
    }
    td.innerHTML = ele;
    return td;
};


/**
 * Create virtual table instance
 * @param {HTMLElement} dom
 * @param {Array<Array>} data
 * @param {String} className
 * @param x
 * @param y
 // * @param row
 // * @param column
 * @param {Function} cellCreator
 * @param {Function} clickHandler
 * @constructor
 */
const MegaTable = function (dom, {
    data,
    className = '',
    x = 0,
    y = 0,
    // row = 50,
    // column = 6,
    cellCreator = defaultCellCreator,
    clickHandler = null
}) {
    const megaTable = this;
    
    this._el = dom;
    // todo virtual table
    // this._viewport = {row: row + BUFFER, column: column + BUFFER};
    this._viewport = {row: data.length, column: data[0].length};
    this._anchor = {x, y};
    this._cellCreator = cellCreator;
    this._className = className;
    if (clickHandler) {
        this._clickHandler = function (e) {
            let cell = e.target;
            while (cell.tagName !== 'TD' && cell.tagName !== 'TH') {
                cell = cell.parentNode;
            }
            let col = cell.cellIndex;
            let row = cell.parentNode.rowIndex;
            clickHandler(cell, {
                col, row, data: megaTable._data
            });
        };
    }
    
    this.setData(data);
    
    return this;
    
};


MegaTable.prototype = {
    _createTable() {
        const table = document.createElement('table');
        const thead = table.createTHead();
        const tbody = table.createTBody();
        
        for (let row = 0; row < this._viewport.row; row++) {
            // first row as thead
            const tr = row === 0 ? thead.insertRow(row) : tbody.insertRow(row - 1);
            for (let column = 0; column < this._viewport.column; column++) {
                let cell;
                if (row === 0) {
                    cell = document.createElement('th');
                    tr.appendChild(cell);
                } else {
                    cell = tr.insertCell(column);
                }
                const absoluteRow = this._anchor.y + row;
                const absoluteColumn = this._anchor.x + column;
                this._cellCreator(cell, this._data[absoluteRow][absoluteColumn]);
            }
        }
        
        this._table = table;
        
        if (this._clickHandler) {
            table.addEventListener('click', this._clickHandler, false);
        }
        
        this._el.appendChild(table);
        return this;
    },
    // update all cell's content
    _updateCell() {
        const table = this._table;
        const rows = table.rows;
        const thead = table.thead || table.createTHead();
        const tbody = table.tBodies.length ? table.tBodies[0] : table.createTBody();
        
        while (rows.length > this._viewport.row) {
            table.deleteRow(-1);
        }
        
        for (let row = 0; row < this._viewport.row; row++) {
            const tr = rows[row]
                || (row === 0 ? thead.insertRow(row) : tbody.insertRow(row - 1));
            
            while (tr.cells.length > this._viewport.column) {
                tr.deleteCell(-1);
            }
            
            for (let column = 0; column < this._viewport.column; column++) {
                const td = tr.cells[column] || tr.insertCell(column);
                const absoluteRow = this._anchor.y + row;
                const absoluteColumn = this._anchor.x + column;
                this._cellCreator(td, this._data[absoluteRow][absoluteColumn]);
            }
        }
    },
    setData(data) {
        // 1. check whether viewport is larger than data;
        const row = data.length;
        const column = row ? data[0].length : 0;
        
        this._data = data;
        
        // todo virtual table
        this._viewport.row = row;
        this._viewport.column = column;

        // 2.1 if table exists, update its cells
        if (this._table) {
            this._updateCell();
        } else {
            // 2.2 create the table, fill cells
            this._createTable();
        }
        
        this._table.classList.add(this._className);
        return this;
    }
};


export default MegaTable;
