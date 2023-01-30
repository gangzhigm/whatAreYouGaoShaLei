// 在大小为 2N 的数组 A 中有 N+1 个不同的元素，其中有一个元素重复了 N 次。

// 返回重复了 N 次的那个元素。

 

// 示例 1：

// 输入：[1,2,3,3]
// 输出：3
// 示例 2：

// 输入：[2,1,2,5,3,2]
// 输入：[1,2,2,2,3,5]
// 输出：2
// 示例 3：

// 输入：[5,1,5,2,5,3,5,4]
// 输入：[1,2,3,4,5,5,5,5]
// 输出：5

// 提示：

// 4 <= A.length <= 10000
// 0 <= A[i] < 10000
// A.length 为偶数



/**
 * @param {number[]} A
 * @return {number}
 */
var repeatedNTimes = function(A) {
    let da = A.sort((a,b)=>a-b);
    if( da[A.length/2] == da[A.length/2-1]){
        return da[A.length/2];
    }else if( da[A.length/2+1] == da[A.length/2]){
        return da[A.length/2];
    }else if( da[A.length/2-1] == da[A.length/2-2]){
        return da[A.length/2-1];
    }
};

const array = [5,1,5,2,5,3,5,4];
const asw = repeatedNTimes(array);
console.log(asw)