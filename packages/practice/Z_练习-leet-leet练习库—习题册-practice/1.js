// 给定一个整数数组 nums 和一个目标值 target，请你在该数组中找出和为gai目标值的 两个 整数。

// 你可以假设每种输入只会对应一个答案。但是，你不能重复利用这个数组中同样的元素。

// 示例:

// 给定 nums = [2, 7, 11, 15], target = 9

// 因为 nums[0] + nums[1] = 2 + 7 = 9
// 所以返回 [0, 1]


// 双循环嵌套，判断相加是否等于限定值
/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var nums = [2, 7, 11, 15], target = 9;
var twoSum = function(nums, target) {
    for(let [indexOne,itemOne] of nums.entries()){
        for(let [indexTwo,itemTwo] of nums.entries()){
            if(itemOne+itemTwo==target&&indexOne!=indexTwo){
                return [indexOne,indexTwo];
            }
        }
    }
    return 'none nums';
};
twoSum(nums,target);