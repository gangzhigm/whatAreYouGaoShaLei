/**
 * Created by naeemo on 2017/3/9.
 */

// 获取输入框光标的位置
export default function getCursorPosition(iptDom) {
    let position = 0;
    
    if (iptDom.selectionStart) { // 非IE
        position = iptDom.selectionStart;
    } else { // IE
        try {
            let range = document.selection.createRange();
            range.moveStart('character', -iptDom.value.length);
            position = range.text.length;
        } catch (e) {
            position = 0;
        }
    }
    
    return position;
}
    