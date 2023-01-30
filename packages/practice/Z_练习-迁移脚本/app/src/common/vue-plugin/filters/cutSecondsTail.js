/**
 * Created by naeemo on 2017/5/10.
 */

/**
 * 切掉日期字符串最后的秒数, 维持 YYYY-MM-DD hh:mm 的格式
 * @param {String} dateStr
 * @return {String}
 */
export default function (dateStr) {
    const empty = dateStr === null || dateStr === '' || dateStr === undefined;
    return empty ? '' : dateStr.replace(/(:\d{2}):\d{2}$/, '$1');
}