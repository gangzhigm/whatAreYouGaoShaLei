import {mount} from '@vue/test-utils';
import NumberInput, {FLOAT, INT, POSITIVE_INT} from './number-input.vue';

const BAD_INPUTS = {
    'asdkfjasdkfa': {positiveInt: '', int: '', float: ''},
    '1asdkfjasdkfa': {positiveInt: 1, int: 1, float: 1},
    '1as-dk +fjasdkfa': {positiveInt: 1, int: 1, float: 1},
    '1a.3s-dk +fjasdkfa': {positiveInt: 13, int: 13, float: 1.3},
    '-2323e2222': {positiveInt: 23232222, int: -23232222, float: -23232222},
    '8763e223': {positiveInt: 8763223, int: 8763223, float: 8763223},
    '-': {positiveInt: '', int: '', float: ''},
    'test test-test test': {positiveInt: '', int: '', float: ''},
    'test test.test test': {positiveInt: '', int: '', float: ''},
    '--': {positiveInt: '', int: '', float: ''},
    '+..': {positiveInt: '', int: '', float: ''},
    '..2.3+++..': {positiveInt: 23, int: 23, float: 2.3},
    '-----..2.3+++..': {positiveInt: 23, int: -23, float: -.23},
    '-asd.d.sd..--+++.ds.sd322k': {positiveInt: 322, int: -322, float: -.322},
};

/**
 * number-input.vue 的测试
 * todo min/max/paste event/precision
 */
describe('<number-input/>', function () {
    
    
    it('should be rendered as a text input', function () {
        const wrapper = mount(NumberInput);
        expect(wrapper.vm.$el.tagName === 'INPUT').toBe(true);
        expect(wrapper.vm.$el.type === 'text').toBe(true);
    });
    
    describe('positive integers', function () {
        
        const wrapper = mount(NumberInput);
        wrapper.setProps({type: POSITIVE_INT});
        
        it('input event', function () {
            const input = wrapper.find('input');
            for (let badKey in BAD_INPUTS) {
                input.element.value = badKey;
                input.trigger('input');
                let l = wrapper.emitted().edit.length;
                expect((wrapper.emitted().edit)[l - 1]).toEqual([BAD_INPUTS[badKey].positiveInt]);
            }
        });
        
        it('change event', function () {
            const input = wrapper.find('input');
            for (let badKey in BAD_INPUTS) {
                input.element.value = badKey;
                input.trigger('change');
                let l = wrapper.emitted().sync.length;
                expect((wrapper.emitted().sync)[l - 1]).toEqual([BAD_INPUTS[badKey].positiveInt]);
            }
        });
        
    });
    
    
    describe('integers', function () {
        
        const wrapper = mount(NumberInput);
        wrapper.setProps({type: INT});
        
        it('input event', function () {
            const input = wrapper.find('input');
            for (let badKey in BAD_INPUTS) {
                input.element.value = badKey;
                input.trigger('input');
                let l = wrapper.emitted().edit.length;
                expect((wrapper.emitted().edit)[l - 1]).toEqual([BAD_INPUTS[badKey].int]);
            }
        });
        
        it('change event', function () {
            const input = wrapper.find('input');
            for (let badKey in BAD_INPUTS) {
                input.element.value = badKey;
                input.trigger('change');
                let l = wrapper.emitted().sync.length;
                expect((wrapper.emitted().sync)[l - 1]).toEqual([BAD_INPUTS[badKey].int]);
            }
        });
        
    });
    
    
    describe('float', function () {
        
        const wrapper = mount(NumberInput);
        wrapper.setProps({type: FLOAT});
        
        it('input event', function () {
            const input = wrapper.find('input');
            for (let badKey in BAD_INPUTS) {
                input.element.value = badKey;
                input.trigger('input');
                let l = wrapper.emitted().edit.length;
                expect((wrapper.emitted().edit)[l - 1]).toEqual([BAD_INPUTS[badKey].float]);
            }
        });
        
        it('change event', function () {
            const input = wrapper.find('input');
            for (let badKey in BAD_INPUTS) {
                input.element.value = badKey;
                input.trigger('change');
                let l = wrapper.emitted().sync.length;
                expect((wrapper.emitted().sync)[l - 1]).toEqual([BAD_INPUTS[badKey].float]);
            }
        });
        
    });
});
