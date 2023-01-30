// 给定一个二叉树，找出其最大深度。

// 二叉树的深度为根节点到最远叶子节点的最长路径上的节点数。

// 说明: 叶子节点是指没有子节点的节点。

// 示例：
// 给定二叉树 [3,9,20,null,null,15,7]，

//     3
//    / \
//   9  20
//     /  \
//    15   7
// 返回它的最大深度 3 。
// 如果b^n=x，则记n=log(b)(x)
var maxDepth = function (root) {
    let num = 0;
    let sum = 0;
    for (let i = 0; i < root.length / 2; i++) {
        sum += Math.pow(2, num);
        if (root.length > sum && root.length < (sum + Math.pow(2, num + 1))) {
            return num+1;
        }else if(root.length == sum){
            return num+1;
        }else if(root.length == (sum + Math.pow(2, num + 1))){
            return num+1+1;
        } else {
            num++
        }
    }
};
// maxDepth([3, 9, 20, null, null, 15, 73, 9, 20, null, null, 15, 73, 9, 20, null, null, 15, 73, 9, 20, null, null, 15, 7])
console.log(maxDepth([3,9,20,null,null,15,7]))