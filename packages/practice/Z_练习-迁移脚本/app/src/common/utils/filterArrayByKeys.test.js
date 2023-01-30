import filterArrayByKeys from './filterArrayByKeys';

describe('多键值过滤数组', function () {
    const sources = [
        {name: '234', meaning: 'a2222'},
        {name: 'a234', meaning: 'b2222'},
        {name: 'b234', meaning: 'c2222'},
        {name: 'c234', meaning: 'd2222'},
        {name: 'd234', meaning: 'e2222'},
    ];

    it('能够正常过滤', function () {
        const resFromName = filterArrayByKeys(sources, 'a', 'name');
        const resFromBoth = filterArrayByKeys(sources, 'a', 'name', 'meaning');
        expect(resFromName.length).toBe(1);
        expect(resFromName[0]).toBe(sources[1]);
        expect(resFromBoth.length).toBe(2);
        expect(resFromBoth.includes(sources[0]) && resFromBoth.includes(sources[1])).toBe(true);
    });
});