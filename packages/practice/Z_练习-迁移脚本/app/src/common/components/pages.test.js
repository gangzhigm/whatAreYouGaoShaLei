/*
 * 分页组件单元测试
 * chutt
 * 2018-4-2
 */
import {mount} from '@vue/test-utils';
import pages from './pages.vue';

/**
 * 分页应该实现：
 * 一、样式：
 *     1.页数过多显示...
 * 二、功能：
 *     1.前一页，后一页按钮切换
 *     2.页码为1时，上一页按钮不能点击
 *       页码为最后一页时，下一页按钮不能点击
 *     3.点击页码按钮跳转到相应页面
 *
 *     4.输入页码跳转到相应页面（当前组件中没有）
 */

describe('<pages/>', function() {

    // 上一页按钮
    describe('pages-prev', function() {

        const wrapper = mount(pages, {
            propsData: {
                // 总页数
                total: 20,
                // 当前页
                now: 2, // 0, 1, 2, 21
            }
        });

        it('点击上一页按钮应该跳转到上一页', function() {

            // 找到上一页按钮
            const aList = wrapper.findAll('a');
            aList.wrappers.forEach(item => {
                // console.dir(item.classes());

                let now = wrapper.vm.now;
                let total = wrapper.vm.total;

                // 当前页为第一页时，上一页按钮不显示
                if (now <= 1) {// wrapper.vm.now = 0, 1
                    expect(item.classes().includes('icon-arrow-left')).toBe(false);
                }

                if (item.classes().includes('icon-arrow-left')) {

                    // （当前页不为第一页 && 当前页 <= 总页数） 时，点击上一页，跳转到上一页
                    if (now > 1 && now <= total){ // wrapper.vm.now = 2
                        // 发送点击事件
                        item.trigger('click');
                        expect(wrapper.emitted().page).toEqual([[now - 1]]);
                    }

                    // （当前页 > 总页数） 时，点击上一页，跳转到 最后一页-1
                    if (now > total) {// wrapper.vm.now = 21
                        // 发送点击事件
                        item.trigger('click');
                        expect(wrapper.emitted().page).toEqual([[total - 1]]);
                    }
                }

            });

        });

    });

    // 下一页按钮
    describe('pages-next', function() {

        const wrapper = mount(pages, {
            propsData: {
                // 总页数
                total: 20,
                // 当前页
                now: 19, // 1, 19, (20, 21)
            }
        });

        it('点击下一页按钮应该跳转到下一页', function() {
            // 找到 下一页 按钮
            const aList = wrapper.findAll('a');
            aList.wrappers.forEach(item => {
                // console.dir(item.classes());
                let now = wrapper.vm.now;
                let total = wrapper.vm.total;

                // 当前页 >= 最后一页时，下一页按钮不显示
                if (now >= total) { // now >= 20
                    expect(item.classes().includes('icon-arrow-right')).toBe(false);
                }

                if (item.classes().includes('icon-arrow-right')) {

                    // 当前页不为最后一页时，点击下一页

                    // 下一页值 < total, 下一页为nextPage
                    if (now + 1 < total) { // 1
                        // 发送点击事件
                        item.trigger('click');
                        expect(wrapper.emitted().page).toEqual([[now + 1]]);

                    }

                    // 下一页值 = total, 下一页为total
                    if ( now + 1 === total) {// wrapper.vm.now = 19
                        // 发送点击事件
                        item.trigger('click');
                        expect(wrapper.emitted().page).toEqual([[total]]); // 19
                    }
                }

            });

        });

    });

    // 页码按钮
    describe('page number', function() {

        const wrapper = mount(pages, {
            propsData: {
                // 总页数
                total: 20,
                // 当前页
                now: 1,
            }
        });

        it('点击页码应跳转到相应的页数', function() {
            // 发送点击事件
            const pagesNum = wrapper.find('li');
            pagesNum.trigger('click');

            // 点击页码跳转到相应的页面
            let pageNumber = 1;
            // 点击的页码是否与当前页码相同
            if (pageNumber === wrapper.vm.now) {
                return;
            }
            // todo
            // 点击的页码与当前页码不相同
            // expect(wrapper.vm.now).toBe(pageNumber);
        });

    });

    // props错误校验
    describe('props error', function() {

        it('错误的props校验。总页数为10，props传入的总页数为11，应该跳转到第10页。', function() {
            // 上一页，下一页按钮中已经校验
        });

    });

    // 按钮的重复点击
    describe('Repeat click', function() {

        const wrapper = mount(pages, {
            propsData: {
                // 总页数
                total: 20,
                // 当前页
                now: 1,
            }
        });

        it('重复点击页码按钮，只对最后一次的点击做操作', function() {

            // 发送点击事件
            const pagesNum = wrapper.find('li');
            let l = 100;
            for (let i = 0; i < l.length; i++) {
                if (i = l.length - 1) {
                    pagesNum.trigger('click');

                    // todo
                }
            }

        });

    });

});


