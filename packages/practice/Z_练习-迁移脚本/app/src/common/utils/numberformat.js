/**
 * Created by zz on 2022/3/30.
 * 数值处理
 */

/**
 * 千分位转换 1000 → 1,000
 * @param {*} num 传入的数值
 * @returns 转换后的数值
 */
const thousandthsformat = num => {
    return (num + '').replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g, '$1,');
};

// 解决浮点值相加精度问题
const floatPointSum = (num1, num2) => {
    let sq1 = 0;
    let sq2 = 0;
    let m = 0;
    try {
        sq1 = num1.toString().split('.')[1].length;
    } catch (error) {
        sq1 = 0;
    }
    try {
        sq2 = num2.toString().split('.')[1].length;
    } catch (error) {
        sq2 = 0;
    }
    m = Math.pow(10, Math.max(sq1, sq2));
    return (num1 * m + num2 * m) / m;
};

/**
 ** 乘法函数，用来得到精确的乘法结果
 ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
 ** 调用：floatPoint(arg1,arg2)
 ** 返回值：arg1乘以 arg2的精确结果
 **/
function floatPointMul(arg1, arg2) {

    if ([arg1, arg2].includes(0) || [arg1, arg2].includes('0')) return 0;

    let m = 0,
        s1 = arg1.toString(),
        s2 = arg2.toString();

    if (!s1.split('.')[1]) s1 = s1 + '.0';
    if (!s2.split('.')[1]) s2 = s2 + '.0';

    m += s1.split('.')[1].length;

    m += s2.split('.')[1].length;

    return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m);
}

export { thousandthsformat, floatPointSum, floatPointMul };
