const targets = new Set();

function checker(e) {
    for (let target of targets) {
        if (!target.contains(e.target)) {
            target._blurCallBack(e.target);
        }
    }
}


/**
 * v-blur
 * when mousedown triggered on document, run the check on all registered dom nodes
 * (the check will pass if the mousedown event was triggered outside the target dom node).
 * if the check pass, trigger the correspond callback.
 */
export default {
    
    bind(el, {expression}, vnode) {
        
        if (typeof vnode.context[expression] !== 'function') {
            throw new Error('v-blur needs a function as handler!');
        }
        
        el._blurCallBack = (e) => {
            vnode.context[expression](e);
        };
        
        targets.add(el);
        
        // just pushed one target, add the listener
        if (targets.size === 1) {
            document.addEventListener('mousedown', checker, true);
        }
    },
    
    unbind(el) {
        
        targets.delete(el);
        
        // no targets any more, remove the listener
        if (targets.size === 0) {
            document.removeEventListener('mousedown', checker, true);
        }
        
        delete el._blurCallBack;
    }
    
};
