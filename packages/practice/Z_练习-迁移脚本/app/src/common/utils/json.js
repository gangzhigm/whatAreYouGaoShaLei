/**
 * 将一个 对象/数组 转为 JSON 字符串，忽略黑名单属性
 * @param {Object|Array} target
 * @param {Array<String>} ignoreKeys
 * @return {string}
 */
export function stringify(target, ...ignoreKeys) {
    return JSON.stringify(target, (key, value) => ignoreKeys.includes(key) ? undefined : value);
}