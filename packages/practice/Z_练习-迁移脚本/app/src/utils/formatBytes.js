
/**
 * @description 字节容量转换
 * @param {number} size 原始字节数
 * @param {number} digit 小数点位数
 * @returns {number} * 转换后的容量值
 */
export default function formatBytes (size, digit = 2) {
    if (!size) return '0 Bytes';
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let pos = Math.floor(Math.log(size) / Math.log(size));
    return parseFloat((size / Math.pow(1024, pos)).toFixed(digit)) + ' ' + units[pos];
}