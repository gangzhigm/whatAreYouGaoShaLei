var treeMaxDepth = function (root) {
    if (root === null|| root === undefined ||JSON.stringify(root) === '{}') {
      return 0;
    } else {
      var leftDepth = treeMaxDepth(root.left),
        rightDepth = treeMaxDepth(root.right);
      var childDepth = leftDepth > rightDepth ? leftDepth : rightDepth;
      return childDepth + 1;
    }
  }

  console.log(treeMaxDepth([1,2,3,4123,12,412312,5414]))