/**
 * get Array instance a map
 * Created by naeemo on 2017/1/20.
 */

export default function () {
    
    Object.defineProperties(Array.prototype, {
        
        /**
         * return the item found in __key_index_map__ with @param key
         */
        '$getByKey': {
            
            enumerable: false,
            configurable: false,
            
            writable: true,
            value: function (key) {
                
                let index = this.__key_index_map__[key];
                
                if (index !== undefined)
                    return this[index];
                
                return undefined;
                
            }
            
        },
        
        
        /**
         * delete the item(s) found in __key_index_map__ with @param keys.
         * will change the original array.
         * @return array of the deleted items; if none deleted, then [].
         */
        '$deleteByKey': {
            
            enumerable: false,
            configurable: false,
            
            writable: true,
            value: function (keys) {
                
                if (!Array.isArray(keys)) keys = Array.from(arguments);
                
                let result = [];
                let len = keys.length;
                
                while (len--) {
                    let key = keys[len];
                    
                    let index = this.__key_index_map__[key];
                    
                    if (index !== undefined) {
                        result.unshift(...this.splice(index, 1));
                    }
                }
                
                return result;
                
            }
            
        },
    
    
        /**
         * if there is some item whose $key === @param key, return true, otherwise return false
         */
        '$hasKey': {
    
            enumerable: false,
            configurable: false,
    
            writable: true,
            value: function (key) {
        
                let index = this.__key_index_map__[key];
        
                return index !== undefined;
        
            }
    
        },
        
        
        /**
         * 生成 map 的关键字段：默认为 'id'
         * @type String
         */
        '$key': {
            
            enumerable: false,
            configurable: false,
            
            writable: true,
            value: 'id'
            
        },
        
        
        /**
         * 关键字段对应数组序号的 map. Getter保证每个数组实例能够有自己的映射。
         * @type Object
         */
        '__key_index_map__': {
            
            enumerable: false,
            configurable: false,
            
            get: function () {
                
                let map = Object.create(null);
                
                this.forEach((item, index) => {
                    const uniKey = item[this.$key];
                    if (uniKey !== undefined)
                        map[uniKey] = index;
                });
                
                return map;
                
            }
            
        }
        
    });
    
}
