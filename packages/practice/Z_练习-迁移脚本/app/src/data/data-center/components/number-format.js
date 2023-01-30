/**
 * 数据中心  过千的数字格式化
 * @param number
 * @returns {string}
 */
export function formatNumber(number) {
    return number >= 1000 ? (number / 1000).toFixed(1) + 'K' : number;
}