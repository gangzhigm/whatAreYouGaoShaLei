/**
 * 本地储存数据，返回当前时间戳
 * @param {String} localObjectName
 * @param {Object} queryObj
 * @return {Array}
 */
export default function (queryObj,localObjectName = new Date().getTime()) {
    localStorage.setItem(localObjectName, JSON.stringify(queryObj));
    return localObjectName;
}