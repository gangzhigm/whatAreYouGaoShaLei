import {computeWordsLength} from './mixin';

describe('公用工具方法', function () {
    
    it('字符串宽度计数方法能够正常统计字符串的宽度', function () {
        const testCases = [
            {src: '123abc^&*?><', res: 12},
            {src: '哇哈哈123', res: 9},
            {src: '字符串的扩展', res: 12}
        ];
        
        for (let {src, res} of testCases) {
            expect(computeWordsLength(src))
                .toBe(res);
        }
    });
    
});
