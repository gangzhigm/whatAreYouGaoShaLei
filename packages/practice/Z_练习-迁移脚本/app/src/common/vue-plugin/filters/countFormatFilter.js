/**
 * Created by naeemo on 2017/3/22.
 */

const colonTail = function (num, tail = '') {
    
    if (num < 1000) return num + tail;
    
    let trim = String((num / 1000).toFixed(3)).split('.');
    
    tail = ',' + trim[1] + tail;
    
    return colonTail(trim[0], tail);
};

export default function (value) {
    if (isNaN(parseInt(value))) return value;
    return colonTail(value || 0);
}
