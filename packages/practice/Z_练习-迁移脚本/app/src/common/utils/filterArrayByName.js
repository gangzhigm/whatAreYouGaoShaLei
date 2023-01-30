/**
 * 根据 name 过滤数组元素
 * Created by naeemo on 2017/3/6.
 * @param {Array} sources
 * @param {String} name
 * @param {String} key
 * @return {Array}
 */
export default function (sources, name, key = 'name') {
    name = name.replace(/\(/g, '\\(');
    name = name.replace(/\)/g, '\\)');
    name = name.replace(/\+/g, '\\+');
    name = name.replace(/\?/g, '\\?');
    name = name.replace(/\$/g, '\\$');

    const len = sources.length;
    const keyReg = new RegExp('^' + name + '.*');
    const looseKeyReg = new RegExp(name, 'ig');

    const result = [];
    let divideIdx = 0;

    for (let i = 0; i < len; i++) {
        const source = sources[i];
        if (keyReg.test(source[key])) {
            result.splice(divideIdx, 0, source);
            divideIdx++;
            continue;
        }
        looseKeyReg.lastIndex = 0;
        if (looseKeyReg.test(source[key])) {
            result.push(source);
        }
    }

    return result;

}
