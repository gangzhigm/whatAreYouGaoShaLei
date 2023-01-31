"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2023-01-30 15:00:03
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-31 14:22:58
 * @FilePath: \whatAreYouGaoShaLei\packages\psnDB\back\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const koa_1 = __importDefault(require("koa"));
const request_1 = __importDefault(require("request"));
const fs_1 = __importDefault(require("fs"));
const app = new koa_1.default();
// 对于任何请求，app将调用该异步函数处理请求：
app.use((ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield next();
    ctx.response.type = 'text/html';
    ctx.response.body = '<h1>Hello, koa2!</h1>';
}));
// async function fn_1(ctx, next){
//     console.info("fn_1 start");
//     await next()
//     console.info('fn_1 end')
// }
// console.info(1);
// app.use(fn_1)
// console.info(2);
// // 发送Get请求
// // 第一个参数:请求的完整URL,包括参数
// // 第二个参数:请求结果回调函数,会传入3个参数,第一个错误,第二个响应对象,第三个请求数据
// request(url,function (error, response, data) {
//     console.log(data)
// });
// request.get(
//     url,
//     {
//     },
//     function (error, response, data) {
//         console.log(data)
//     }
// )
// {
//     url: url,
//     method: "POST",
//     json: true,
//     headers: {
//         "content-type": "application/json",
//     },
//     body: JSON.stringify(requestData)
// },
// var url = 'https://web.np.playstation.com/api/graphql/v1/op?operationName=getPurchasedGameList&variables={"isActive":true,"platform":["ps4","ps5"],"size":347,"start":0,"sortBy":"ACTIVE_DATE","sortDirection":"desc","subscriptionService":"NONE"}&extensions={"persistedQuery":{"version":1,    "sha256Hash":"2c045408b0a4d0264bb5a3edfed4efd49fb4749cf8d216be9043768adff905e2"}}'
// request.get(
//     {
//         url:url,
//         method:"GET",
//         headers:{
//             "Cookie": cookie,
//             "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
//         }
//     },
//     function (error, response, data) {
//         console.log(data)
//         fs.writeFile("./gamelist.json",data,function(error){
//             if(error){
//                 console.info("write error")
//             }
//             else{
//                 console.info("write success")
//             }
//         })
//     }
// )
const cookie = 's_ecid=MCMID|79672558761901653070950768434632526053; AMCV_BD260C0F53C9733E0A490D45@AdobeOrg=-1124106680|MCIDTS|19387|MCMID|79672558761901653070950768434632526053|MCAAMLH-1675590438|11|MCAAMB-1675590438|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1674992838s|NONE|MCAID|NONE|vVersion|5.2.0; eucookiepreference=accept; _evga_9736={"uuid":"17f9bc2f8476ac4b"}; _sfid_c0f4={"anonymousId":"17f9bc2f8476ac4b","consents":[]}; da_lid=C09A3F6F9A73EA17232ABB99F3A8DE8D9A|0|0|0; mbox=session#31ab16fd3b1742a687d953140a385052#1674987885|PC#31ab16fd3b1742a687d953140a385052.35_0#1738230443; sc-cmp-id=; pdccws_p=s:X6LDhZNDlt72QPaJo7ZiZDRLVQWIb_vB.23tnCFkdZUVQ6ibhAjRBhDgrO4QXKSpTjI9lHyYpSS8; isSignedIn=true; pdcsi={"psPlusSubscription":{"psPlusTier":"TIER_10","status":"SUBSCRIBED","duration":"12 MONTH","flag":"","isTrial":false,"isPsPlusMember":true},"ubisoftPlusSubscription":{"status":"NEVER","active":false,"eligibleForTrial":false},"emsCriteria":{"psPlus":"active_12m_false_true_false","psNow":"never_none_true_false_false","eaAccess":"never_none_false_false_false"},"loyaltySubscription":{"enrollStatus":"NOT_ENROLLED","statusLevel":"NO_LOYALTY_LEVEL"}}; bm_sz=6EC0F2B4382A98A0BC680FF239EBDAEF~YAAQldrARXSFhMSFAQAAgT9CBhLBAWUNh+JQsDjfWG5snVxy8mLsg/xnoQrTqZwSChzkDV+wbW+4gzY95NYea89da5lHtu357kxLubTMOl9TAHg83KWft+3toAaikmY4lH6s9pasxwnZuFRT+GNiY1yFO2tfWcnuEK3XMMP7XVHETg7U6IkQmx7hVbY5UagswGNT0y+Ql7Yb5z/HejxJ8C7knH3Bp/b4Iokbc6swb/fYwC+wbxXgadHERRCGA0yGtPgyAPOJoWSKlaxR/5pEFIa89PrprW2f6vARdv5jgJzQOyGcqB+QkrBqkKWdGCX1cfgFQeQx03TxpoXRfX4STYicLXb9ElI4V7RCM/h5bE8DJSmcg2P60PaItBxt4cyV+QzbWBKnPZgi49ry8tGnw0Q6qYr8fF/RaHac9itk96cMsIscvjHxz35SIDzH~4273461~3290929; _abck=563F56116285CCE515B7D099DF91DA92~-1~YAAQldrARXmFhMSFAQAAL0lCBgkv3VFFUAql5YCkqpdqZTEZ7YqkeVjaJOFLr1cejEZFvyeuVIDnKA7MNBw++exoijy3Ux5geRDbY04YfTpzYYGlo56aioXyhASaozoMrre+hxu831EZrialmrWMt6ed0UNMzEDupdHADeyEZTT1i5NsAo/MAStMIPt2fjbMwK34B2ke9xdQ0l18MLu+X+HsUVUUEdmw4OoW2o/tEPIxhXcz4zmWSu1zJfd17WJB/HRr+GZliEjGboth0Kazq0LNShRhwdBt+bFkF99ToOoI3JbZ2c5m5dfrCCkrzacan68/5zpw24qg7KGM+5l/hCw2CGHAiCweSKn6sEYrH67Df9OldqERLDh2XbQoWjz0N4Z16sZF8rLm+YRCoVI7PWdievZ/AP2HceMQJvOhJ0Z8Chwvzd3L9a+O5PtwwYECESuQuywR04h8+4rPH9JjSoDOHU1RCWimQwtPO/r/YiePjFZyA3O02Q2cQlM=~-1~-1~-1';
// // 获取游戏列表
// const optionsA = {
//   method: 'GET',
//   url: 'https://web.np.playstation.com/api/graphql/v1/op',
//   qs: {
//     operationName: 'getPurchasedGameList',
//     variables: '{"isActive":true,"platform":["ps4","ps5"],"size":347,"start":0,"sortBy":"ACTIVE_DATE","sortDirection":"desc","subscriptionService":"NONE"}',
//     extensions: '{"persistedQuery":{"version":1,\n    "sha256Hash":"2c045408b0a4d0264bb5a3edfed4efd49fb4749cf8d216be9043768adff905e2"}}'
//   },
//   headers: {
//     Cookie: cookie
//   }
// };
// request(optionsA, function (error, response, body) {
//     if (error) throw new Error(error);
//     fs.writeFile("./gamelist.json",body,function(error){
//         if(error){
//             console.info("write error")
//         }
//         else{
//             console.info("write success")
//         }
//     })
// });
// // 获取个人信息
// const optionsB = {
//     method: 'GET',
//     url: 'https://web.np.playstation.com/api/graphql/v1/op',
//     qs: {
//       operationName: 'getProfileOracle',
//       variables: '{}',
//       extensions: '{"persistedQuery":{"version":1,"sha256Hash":"fc0d765f537f3dce3e0d91c71e85daa401042ba43066acde9f8f584faced10df"}}'
//     },
//     headers: {
//       cookie: cookie
//     }
//   };
//   request(optionsB, function (error, response, body) {
//     if (error) throw new Error(error);
//     fs.writeFile("./ProfileOracle.json",body,function(error){
//           if(error){
//               console.info("write error")
//           }
//           else{
//               console.info("write success")
//           }
//       })
//   });
// 获取单个游戏图床
const productId = "UP1001-CUSA03979_00-ASIAPLACEHOLDER0";
const optionsC = {
    method: 'GET',
    url: 'https://web.np.playstation.com/api/graphql/v1/op',
    qs: {
        operationName: 'productRetrieveForUpsellWithCtas',
        variables: `{"productId":"UP1001-CUSA03979_00-ASIAPLACEHOLDER0"}`,
        // variables: `{"productId":${productId}}`,
        extensions: '{"persistedQuery":{"version":1,"sha256Hash":"d5b5cd4bdbff9886a426c25df39513e4bf3325b3e0612fbf4a905382123fff56"}}'
    },
    headers: {
        cookie: cookie
    }
};
(0, request_1.default)(optionsC, function (error, response, body) {
    fs_1.default.writeFile("./UP1001-CUSA03979_00-ASIAPLACEHOLDER0.json", body, function (error) {
        if (error) {
            console.info("write error");
        }
        else {
            console.info("write success");
        }
    });
});
// app.listen(3001)
