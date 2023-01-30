import Vue from 'vue';
import TipPrototype from '../../components/tip.vue';

// 自动创建、插入实例
const Tip = Vue.extend(TipPrototype),
    normalTip = new Tip().$mount(),
    warnTip = new Tip().$mount();
document.body.appendChild(warnTip.$el);
document.body.appendChild(normalTip.$el);


function toggle (el, open) {
    
    if (!el.dataset) {
        return;
    }
    
    // 1. use proper instance
    const tip = el.dataset.warn ? warnTip : normalTip;
    
    if (open) {
        
        // 2. 如果没有信息，不做更新
        if (!el.dataset.title) {
            return;
        }
        
        // 3. update data & configs
        tip.message = el.dataset.title;             // 展示的内容
        tip.direction = el.dataset.titleDirection;  // 展示的方向：上下左右
        tip.line = el.dataset.line;                 // 是否单行文本
        tip.warn = el.dataset.warn;                 // 警告信息状态
        
        // 4. position the tip
        let {left, right, top, bottom, width, height} = el.getBoundingClientRect();
        switch (tip.direction) {
            case 'top':
                tip.$el.style.left = Math.round(left + width / 2) + 'px';
                tip.$el.style.right = '';
                tip.$el.style.top = Math.round(top - 10) + 'px';
                tip.$el.style.bottom = '';
                break;
            case 'bottom':
                tip.$el.style.left = Math.round(left + width / 2) + 'px';
                tip.$el.style.right = '';
                tip.$el.style.top = Math.round(bottom + 10) + 'px';
                tip.$el.style.bottom = '';
                break;
            case 'bottom-left':
                tip.$el.style.left = Math.round(right) + 'px';
                tip.$el.style.right = '';
                tip.$el.style.top = Math.round(bottom + 10) + 'px';
                tip.$el.style.bottom = '';
                break;
            case 'left':
                tip.$el.style.left = Math.round(left - 10) + 'px';
                tip.$el.style.right = '';
                tip.$el.style.top = Math.round(top + height / 2) + 'px';
                tip.$el.style.bottom = '';
                break;
            case 'right':
                tip.$el.style.left = Math.round(right + 10) + 'px';
                tip.$el.style.right = '';
                tip.$el.style.top = Math.round(top + height / 2) + 'px';
                tip.$el.style.bottom = '';
                break;
        }
        
        // 5. show the tip
        if (!tip.open) {
            tip.show();
        }
        
    } else {
        tip.leave();
    }
    
}


/**
 * 显示
 * @param evt
 */
function show(evt) {
    toggle(evt.target, true);
}


/**
 * 隐藏
 * @param evt
 */
function hide(evt) {
    toggle(evt.target, false);
}


/**
 * simulation of native title attribute
 * @example
 * <span v-title:top="This is a tip over the top.">
 * <span v-title:left.line="This is a single line tip over the left.">
 * Created by naeemo on 2017/3/3.
 */
export default {
    
    name: 'title',
    
    bind(el, binding) {
        el.addEventListener('mouseenter', show, false);
        el.addEventListener('mouseleave', hide, false);
        el.dataset.title = binding.value;                       // 展示的内容
        el.dataset.titleDirection = binding.arg || 'bottom';    // 展示的方向：上下左右
        if (binding.modifiers.line) el.dataset.line = true;     // 是否单行文本
        if (binding.modifiers.warn) el.dataset.warn = true;     // 警告信息状态
    },
    
    update(el, {value, oldValue}) {
        const tip = el.dataset.warn ? warnTip : normalTip;
        
        // actually changed
        if (value !== oldValue) {
            // tip 实例正在展示当前DOM节点
            if (tip.message === el.dataset.title) {
                tip.message = value;
            }
            
            el.dataset.title = value;
            
            if (value === '') {
                toggle(el, false);
            } else {
                // display the tip if its source is 'focused'.
                if (el === document.activeElement || el.contains(document.activeElement)) {
                    tip.show();
                }
            }
        }
    },
    
    unbind(el) {
        // cancel tip if unbinding
        toggle(el, false);
        // un-register events
        el.removeEventListener('mouseenter', show, false);
        el.removeEventListener('mouseleave', hide, false);
    }
    
};
