/**
 * Created by naeemo on 2017/2/21.
 */

import mapArray from './mapArray';

describe('mapArray', function () {
    
    mapArray();
    
    /**
     * $getByKey tests
     */
    describe('$getByKey', function () {
        
        let source = [
                {name: 'a', id: 'id_of_a'},
                {name: 'b', id: 'id_of_b'},
                {name: 'c', id: 'id_of_c'},
                {name: 'd', id: 'id_of_d'}
            ],
            arr = [...source],
            otherArr = [...source,
                {name: 'e', id: 'id_of_e'}
            ];
        
        
        it('Array instance has a $getByKey method', function () {
            expect(typeof arr.$getByKey).toBe('function');
        });
        
        it('should return a item with a given key if it exist', function () {
            expect(arr.$getByKey('id_of_b')).toBe(source[1]);
        });
        
        it('should return undefined with a given key if it doesn\'t exist', function () {
            expect(arr.$getByKey('not_existed')).toBe(undefined);
        });
        
        it('each array can have its own key', function () {
            source.$key = 'name';
            expect(source.$getByKey('a')).toEqual(arr.$getByKey('id_of_a'));
        });
        
        it('each array should maintain its own map', function () {
            expect(arr.$getByKey('id_of_e')).toBe(undefined);
            expect(otherArr.$getByKey('id_of_e')).toBe(otherArr[4]);
        });
    });
    
    
    /**
     * $deleteByKey tests
     * this method's return looks like array's splice
     */
    describe('$deleteByKey', function () {
        
        let source = [
            {name: 'a', id: 'id_of_a'},
            {name: 'b', id: 'id_of_b'},
            {name: 'c', id: 'id_of_c'},
            {name: 'd', id: 'id_of_d'}
        ];
    
        
        it('has a $deleteByKey method', function () {
            let arr = source.slice();
            expect(typeof arr.$deleteByKey).toBe('function');
        });
        
        it('$deleteByKey should delete a item if the key exists', function () {
            let arr = source.slice();
            let result = arr.$deleteByKey('id_of_a');
            expect(arr.length).toBe(source.length - 1);
            expect(result.length).toEqual(1);
        });
        
        it('$deleteByKey should return the deleted item', function () {
            let arr = source.slice();
            let result = arr.$deleteByKey('id_of_a');
            expect(result instanceof Array).toBe(true);
            expect(result[0]).toEqual(source[0]);
        });
        
        it('$deleteByKey should return empty array if no item deleted', function () {
            let arr = source.slice();
            let emptyRes = arr.$deleteByKey('not_exist');
            expect(emptyRes instanceof Array).toBe(true);
            expect(emptyRes.length).toEqual(0);
        });
        
        it('$deleteByKey can delete more than one key a time', function () {
            let arr = source.slice();
            let result = arr.$deleteByKey('id_of_b', 'id_of_c');
            expect(result.length).toEqual(2);
            expect(result[0]).toEqual(source[1]);
            expect(result[1]).toEqual(source[2]);
            expect(arr.length).toEqual(2);
        });
        
    });
    
});
