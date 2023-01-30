// 给定一个包含 0 和 1 的二维网格地图，其中 1 表示陆地 0 表示水域。

// 网格中的格子水平和垂直方向相连（对角线方向不相连）。整个网格被水完全包围，但其中恰好有一个岛屿（或者说，一个或多个表示陆地的格子相连组成的岛屿）。

// 岛屿中没有“湖”（“湖” 指水域在岛屿内部且不和岛屿周围的水相连）。格子是边长为 1 的正方形。网格为长方形，且宽度和高度均不超过 100 。计算这个岛屿的周长。

 

// 示例 :

// 输入:
// [[0,1,0,0],
//  [1,1,1,0],
//  [0,1,0,0],
//  [1,1,0,0]]

// 输出: 16

// 解释: 它的周长是下面图片中的 16 个黄色的边：


/**
 * @param {number[][]} grid
 * @return {number}
 */
var islandPerimeter = function(grid) {
    var perimeter=0,
        h=grid.length,
        w;

    if(h===0){
        return perimeter;
    }

    w=grid[0].length;

    if(w===0){
        return perimeter;
    }

    for(let i=0;i<h;i++){
        for(let j=0;j<w;j++){
            perimeter+=getOnePer(grid,i,j,w,h);
        }
    }

    return perimeter;
};

function getOnePer(grid,i,j,w,h) {
    var one_per=0,
        one_grid=grid[i][j];
    if(one_grid===1){
        let left=j-1,
            right=j+1,
            up=i-1,
            down=i+1;
        if((left>=0 && grid[i][left]===0) || left===-1){
            one_per+=1;
        }
        if((right<w && grid[i][right]===0) || right===w){
            one_per+=1;
        }
        if((up>=0 && grid[up][j]===0) || up===-1){
            one_per+=1;
        }
        if((down<h && grid[down][j]===0) || down===h){
            one_per+=1;
        }
    }
    return one_per;
}