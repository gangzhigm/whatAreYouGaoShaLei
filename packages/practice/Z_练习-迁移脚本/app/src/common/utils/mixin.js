// 计算文本长度(中文+2，英文+1); 返回长度number
export function computeWordsLength(content) {
    let count = 0;
    for (let char of content) {
        count += /[\u4e00-\u9fa5]/.test(char) ? 2 : 1;
    }
    return count;
}

// 截取文本长度(中文+2，英文+1); 第二个参数number表示截取并返回字符串前几位; 第三个参数boolean，表示是否后加省略号
export function sliceWords(content, slice, ellipsis) {
    let newStr = '';
    for (let index in content) {
        if (computeWordsLength(newStr) < slice) {
            newStr += content[index];
        }
    }
    if ((newStr !== content) && ellipsis) {
        newStr += '...';
    }
    return newStr;
}


/**
 * get first scrolling outer node
 * @param dom
 */
export function getScrollingBox(dom) {
    const parent = dom.parentNode;
    if (parent === document.body) return parent;
    if (getComputedStyle(dom.parentNode).getPropertyValue('overflow') !== 'visible') return parent;
    return getScrollingBox(parent);
}


export function deleteEmptyInArray(array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === '' || array[i] === undefined) {
            array.splice(i, 1);
            i = i - 1;
        }
    }
    return array;
}

