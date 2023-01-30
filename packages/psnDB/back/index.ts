/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2023-01-30 15:00:03
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-30 15:24:55
 * @FilePath: \whatAreYouGaoShaLei\packages\psnDB\back\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Koa from "koa"

const app = new Koa();

console.info(app);

async function fn_1(ctx, next){
    console.info("fn_1 start");
    await next()
    console.info('fn_1 end')
}

console.info(1);
app.use(fn_1)
console.info(2);
app.listen(3001)