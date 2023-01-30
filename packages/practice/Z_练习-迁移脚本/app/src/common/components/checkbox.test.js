import {mount} from '@vue/test-utils';
import CheckBox from './checkbox.vue';


describe('<checkbox/>',function(){

    it('含有一个.checkbox的label',function () {
        const wrapper = mount(CheckBox);
        expect(wrapper.vm.$el.tagName === 'LABEL').toBe(true);
        expect(wrapper.contains('label')).toBe(true);
    });

    describe('测试props',function(){

        const  wrapper = mount(CheckBox);

        it('value 是 Array类型，source对应',function () {
            wrapper.setProps({value: [1,2,3,4]});
            wrapper.setProps({source: 1});
            expect(wrapper.contains('label.checked')).toBe(true);

        });

        it('value 是 Array类型，source不对应',function () {
            wrapper.setProps({value: [1,2,3,4]});
            wrapper.setProps({source:5});
            expect(wrapper.contains('label.checked')).toBe(false);

        });

        it('value 是 Boolean类型，source没关系',function () {
            wrapper.setProps({value: true});
            expect(wrapper.contains('label.checked')).toBe(true);

        });

        it('value 是 Boolean类型，source没关系',function () {
            wrapper.setProps({value: false});
            expect(wrapper.contains('label.checked')).toBe(false);

        });


        it('传递disable,true',function () {
            wrapper.setProps({disabled: true});
            expect(wrapper.contains('label.disabled')).toBe(true);
        });


        it('传递disable,false',function () {
            wrapper.setProps({disabled: false});
            expect(wrapper.contains('label.disabled')).toBe(false);
        });
    });

    describe('测试click Array',function () {

        const  wrapper = mount(CheckBox);

        it('click array minus',function () {
            wrapper.setProps({value: [1,2,3,4]});
            wrapper.setProps({source: 1});
            const label = wrapper.find('label');
            label.trigger('click');
            let l = wrapper.emitted().input.length;
            expect((wrapper.emitted().input)[l - 1]).toEqual([[2,3,4]]);

        });
        it('click array add',function () {
            wrapper.setProps({value: [2,3,4]});
            wrapper.setProps({source: 1});
            const label = wrapper.find('label');
            label.trigger('click');
            let l = wrapper.emitted().input.length;
            expect((wrapper.emitted().input)[l - 1]).toEqual([[2,3,4,1]]);

        });
        //不可点击
        it('click array disabled',function () {
            wrapper.setProps({value: [1,2,3,4]});
            wrapper.setProps({source: 1});
            wrapper.setProps({disabled: true});
            const label = wrapper.find('label');
            label.trigger('click');
            //不在发请求
            expect((wrapper.props().value)).toEqual([1,2,3,4]);

        });

        // it('click Boolean',function () {
        //     wrapper.setProps({value: true});
        //     const label=wrapper.find('label');
        //     label.trigger('click')
        //     let l = wrapper.emitted().input.length;
        //     expect((wrapper.emitted().input)[l - 1]).toEqual([false]);
        // })

    });

    describe('测试click Boolean',function () {

        const  wrapper = mount(CheckBox);
        it('click Boolean',function () {
            wrapper.setProps({value: true});
            const label = wrapper.find('label');
            label.trigger('click');
            let l = wrapper.emitted().input.length;
            expect((wrapper.emitted().input)[l - 1]).toEqual([false]);
        });

        it('click Boolean disabled',function () {
            wrapper.setProps({value: true});
            wrapper.setProps({disabled: true});
            const label = wrapper.find('label');
            label.trigger('click');
            //不在发请求
            expect((wrapper.props().value)).toEqual(true);
        });

    });


});

