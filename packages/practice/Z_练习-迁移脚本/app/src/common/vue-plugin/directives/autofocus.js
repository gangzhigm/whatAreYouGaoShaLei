/**
 * 自动获取焦点
 */
export default {
    name: 'autofocus',
    inserted(el) {
        if ('focus' in el && typeof el.focus === 'function') {
            el.focus();
        }
    }
};
