/**
 * Created by annie on 2019/4/23.
 */

/**
 * 数字添加千位分隔符
 * @param {Number} num
 */

export default function (num) {
    const res = num.toString().replace(/\d+/, function(n){ // 先提取整数部分
        return n.replace(/(\d)(?=(\d{3})+$)/g,function($1){
            return $1 + ',';
        });
    });
    return res;
}
