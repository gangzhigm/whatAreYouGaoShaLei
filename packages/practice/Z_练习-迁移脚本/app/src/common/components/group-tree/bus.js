import Vue from 'vue';

export default new Vue();

/**
 * 递归函数来遍历所有数据进行获取
 * @param treeData 属性数据
 * @param arr set自定义属性值后的数组
 * open true分组展开，false：分组收起
 * noSelect true：分组可选可操作，false：不可选不可操作
 */
Vue.prototype.$traverseTree = function (treeData, arr) {
    treeData.forEach(ele => {
        this.$set(ele, 'open', false);
        this.$set(ele, 'noSelect', true);
        // 判断有子元素,并且子元素的长度大于0就再次调用自身
        if (ele.childs && ele.childs.length > 0) {
            let t = [];
            this.$traverseTree(ele.childs, t);
        }
        arr.push(ele);
    });
};
/**
 * 根据指定default(1.默认，0.非默认, 2.全部分组)查找树结构中符合条件的元素
 * @param defaultNum 查询条件 (是否是默认)
 * @param items
 * 素材模块新建素材（邮件/短信/彩信）
 */
Vue.prototype.$getCurrentPart = function (defaultNum, items) {
    let result;
    for (let i in items) {
        let item = items[i];
        if (item.default || item.wxParentId === defaultNum) {
            result = item;
            break;
        } else if (item.childs && item.childs.length > 0) {
            result = this.$getCurrentPart(defaultNum, item.childs);
        }
    }
    return result;
};
/**
 * 根据id获取对应元素
 * @param id  item id
 * @param arr 对应列表
 */
Vue.prototype.$getItself = function (id, arr) {
    let result;
    for (let i in arr) {
        let item = arr[i];
        if (item.id === id) {
            result = item;
            break;
        } else if (item.childs && item.childs.length > 0) {
            result = this.$getItself(id, item.childs);
        }
    }
    return result;
};
/**
 * 根据id找到树结构中对应的childs
 * @param id
 * @param groupList
 */
Vue.prototype.$getPartById = function (id, groupList) {
    let hasFound = false, // 表示是否有找到id值
        result;
    let fn = function (groupList) {
        if (Array.isArray(groupList) && !hasFound) { // 判断是否是数组并且没有的情况下，
            groupList.forEach(item => {
                if (item.id === id) { // 数据循环每个子项，并且判断子项下边是否有id值
                    result = item; // 返回的结果等于每一项
                    hasFound = true; // 并且找到id值
                } else if (item.childs) {
                    fn(item.childs); // 递归调用下边的子项
                }
            });
        }
    };
    fn(groupList); // 调用一下
    return result;
};
//遍历树数据，将open更改为false，分组收起
Vue.prototype.$openToFalse = function (treeArry) {
    treeArry.forEach(obj => {
        if (obj.open === true) {
            obj.open = false;
        }
        if (obj.childs && obj.childs.length > 0) {
            this.$openToFalse(obj.childs);
        }
    });
};
/**
 * 根据id查找 分组的所有父级 并返回数组
 * @param dataArr 树结构数组
 * @param id 选中的分组唯一标识
 * @returns {[]}
 */
Vue.prototype.$getCurrentFathers = function (dataArr, id) {
    let temp = [];
    let forFn = function (arr, id) {
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            //当前分组属性值（parentId）向上递归根据匹配值比对 筛选父级
            let parentId = item.parentId || item.wxParentId;
            let matchVal = item.wxDepartmentId || item.id;
            if (matchVal === id) {
                temp.push(item);
                forFn(dataArr, parentId);
                break;
            } else {
                if (item && item.childs && item.childs.length > 0) {
                    forFn(item.childs, id);
                }
            }
        }
    };
    forFn(dataArr, id);
    return temp;
};
