/**
 * Created by naeemo on 2017/3/9.
 */

// 获取输入框光标的位置
export default function getCursorPosition(iptDom,index) {
    let position = 0;
    if (iptDom[index].selectionStart) { // 非IE
        position = iptDom[index].selectionStart;
    } else { // IE
        try {
            let range = document.selection.createRange();
            range.moveStart('character', -iptDom[index].value.length);
            position = range.text.length;
        } catch (e) {
            position = 0;
        }
    }
    
    return position;
}
    