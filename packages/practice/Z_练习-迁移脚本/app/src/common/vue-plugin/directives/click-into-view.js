import smoothscroll from 'smoothscroll-polyfill';

// polyfill for requestAnimationFrame first
window.requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (/* function */ callback, /* DOMElement element */) {
        window.setTimeout(callback, 1000 / 60);
    };

// polyfill for smoothly scroll
smoothscroll.polyfill();


const scroller = function () {
    this.scrollIntoView({block: 'start', behavior: 'smooth'});
};


/**
 * v-click-into-view
 * 点击滚动到容器顶部
 */
export default {
    bind(el) {
        el.addEventListener('click', scroller, false);
    },
    unbind(el) {
        el.removeEventListener('click', scroller, false);
    }
};
