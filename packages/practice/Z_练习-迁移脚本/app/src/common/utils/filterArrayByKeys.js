/**
 * 根据 关键字 过滤数组元素
 * Created by naeemo on 2017/3/6.
 * @param {Array} sources
 * @param {String} keyword
 * @param {Array} keys
 * @return {Array}
 */
export default function (sources, keyword, ...keys) {

    if (keyword === '') {
        return sources;
    }
    return sources.filter(item => keys.some(key => String(item[key]).includes(keyword)));
}

