// 两个整数之间的汉明距离指的是这两个数字对应二进制位不同的位置的数目。

// 给出两个整数 x 和 y，计算它们之间的汉明距离。

// 注意：
// 0 ≤ x, y < 231.

// 示例:

// 输入: x = 1, y = 4

// 输出: 2

// 解释:
// 1   (0 0 0 1)
// 4   (0 1 0 0)
//        ↑   ↑

// 上面的箭头指出了对应二进制位不同的位置。
let x=175,y=20
function a(x,y){
    let num=0;
    if(x<0 || y<0 || x>Math.pow(2,31) || y>Math.pow(2,31)){
        return false;
    }
    let strOne = x.toString(2);
    let strTwo = y.toString(2);
    if(strOne.length < Math.max(strOne.length,strTwo.length)){
        strOne=`${'0'.repeat(strTwo.length - strOne.length)}${strOne}`;
    }
    if(strTwo.length < Math.max(strOne.length,strTwo.length)){
        strTwo=`${'0'.repeat(strOne.length - strTwo.length)}${strTwo}`;
    }
    for(let i = 0 ; i < Math.max(strOne.length,strTwo.length); i++){
        if([...strOne][i] !== [...strTwo][i]){
            num++;
        }
    }
    return num;
}
a(x,y)
