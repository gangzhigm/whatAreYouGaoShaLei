import confirm from './confirm';
import {mount} from '@vue/test-utils';

const wrapper = mount(confirm, {
    propsData: {
        title: '确认删除'
    }
});

describe('<confirm>', () => {

    it('wrapper analysis test', () => {
        //wrapper是否存在
        expect(wrapper.exists()).toBe(true);
        expect(typeof wrapper.vm.sure).toBe('function');
        expect(wrapper.findAll('input').length).toBe(2);
        //其父级是否是hidden
        expect(wrapper.isVisible()).toBe(true);
        expect(wrapper.props().title).toBe('确认删除');
    });

    it('sure事件触发', () => {
        wrapper.vm.$emit('sure');
        expect(wrapper.emitted('sure')).toBeTruthy();
        expect(wrapper.emitted('sure').length).toBe(1);
        wrapper.vm.$emit('sure');
        expect(wrapper.emitted('sure').length).toBe(2);
    });

    it('cancel事件触发', () => {
        wrapper.vm.$emit('cancel');
        expect(wrapper.emitted('cancel')).toBeTruthy();
        expect(wrapper.emitted('cancel').length).toBe(1);
        wrapper.vm.$emit('cancel');
        expect(wrapper.emitted('cancel').length).toBe(2);
    });
});

describe('点击事件', () => {

    const buttonArray = wrapper.findAll('input');

    it('点击确定按钮', () => {
        buttonArray.at(1).trigger('click');
        expect(wrapper.emitted('confirm').length).toBe(1);
    });

    it('点击取消按钮', () => {
        buttonArray.at(0).trigger('click');
        expect(wrapper.emitted('cancel').length).toBe(3);
    });

    it('点击回车键', () => {
        expect(typeof wrapper.vm.keyDown).toBe('function');
        // wrapper.trigger('keyup.enter')
        // expect(wrapper.emitted('confirm').length).toBe(2)

    });

    it('点击小叉号', () => {
        wrapper.find('modal').trigger('close');
        expect(wrapper.emitted('cancel').length).toBe(4);
    });

});

