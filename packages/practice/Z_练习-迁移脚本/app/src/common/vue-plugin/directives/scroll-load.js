/**
 * 自定义指令 v-load, 滚动容器底部时调用方法
 * Created by naeemo on 2016/10/28.
 */

/**
 * event handler factory
 * @param {Function} handler
 * @param {Node} dom
 * @return {Function}
 */
function getChecker(handler, dom) {
    let container = dom || document.body;
    let visibleHeight, contentHeight, scrolledLength;
    
    return function () {
        visibleHeight = container.clientHeight;
        contentHeight = container.scrollHeight;
        scrolledLength = container.scrollTop;
        
        if ((scrolledLength + visibleHeight + 150) >= contentHeight) {
            handler();
        }
    };
}


// directive obj
export default {
    
    bind(el, {expression}, vnode) {

        if (typeof vnode.context[expression] !== 'function') {
            console && console.error && console.error('v-load doesn\'t have a handler!');
            return false;
        }
        
        if (el._scrollChecker)
            el.removeEventListener('scroll', el._scrollChecker, false);
        el._scrollChecker = getChecker(vnode.context[expression], el);
        el.addEventListener('scroll', el._scrollChecker, false);
        
    },
    
    unbind(el) {
        el.removeEventListener('scroll', el._scrollChecker, false);
        delete el._scrollChecker;
    }
    
};
