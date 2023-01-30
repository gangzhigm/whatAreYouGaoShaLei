let passiveSupported = false;

try {
    let options = Object.defineProperty({}, 'passive', {
        get: function () {
            passiveSupported = true;
            return true;
        }
    });
    
    window.addEventListener('test', options, options);
    window.removeEventListener('test', options, options);
} catch (err) {
    passiveSupported = false;
}

export function addMouseWheelListener(el, callback) {
    el.addEventListener('mousewheel', callback, passiveSupported ? {passive: true} : false);
}

export function removeMouseWheelListener(el, callback) {
    el.removeEventListener('mousewheel', callback, passiveSupported ? {passive: true} : false);
}

export function addScrollListener(el, callback) {
    el.addEventListener('scroll', callback, passiveSupported ? {passive: true} : false);
}

export function removeScrollListener(el, callback) {
    el.removeEventListener('scroll', callback, passiveSupported ? {passive: true} : false);
}
