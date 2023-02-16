/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2023-01-30 15:00:03
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-02-16 16:35:24
 * @FilePath: \whatAreYouGaoShaLei\packages\psnDB\back\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import Koa from "koa"
import cors from "koa-cors"
import axios from "axios"
import request from "request"
import fs from "fs"
import path from "path"
const app = new Koa();

const cookie = 's_ecid=MCMID|79672558761901653070950768434632526053; AMCV_BD260C0F53C9733E0A490D45@AdobeOrg=-1124106680|MCIDTS|19387|MCMID|79672558761901653070950768434632526053|MCAAMLH-1675590438|11|MCAAMB-1675590438|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1674992838s|NONE|MCAID|NONE|vVersion|5.2.0; _evga_9736={"uuid":"17f9bc2f8476ac4b"}; _sfid_c0f4={"anonymousId":"17f9bc2f8476ac4b","consents":[]}; da_lid=C09A3F6F9A73EA17232ABB99F3A8DE8D9A|0|0|0; mbox=session#31ab16fd3b1742a687d953140a385052#1674987885|PC#31ab16fd3b1742a687d953140a385052.35_0#1738230443; pdccws_p=s:c3ft0HRfRVOFH01eD5BZckCz7AtQurdK.zA94nt6rafy0V5b6ptTTV6FMiXc6FU+HfY5QZzTGO4M; isSignedIn=true; pdcsi={"psPlusSubscription":{"psPlusTier":"TIER_10","status":"SUBSCRIBED","duration":"12 MONTH","flag":"","isTrial":false,"isPsPlusMember":true},"ubisoftPlusSubscription":{"status":"NEVER","active":false,"eligibleForTrial":false},"emsCriteria":{"psPlus":"active_12m_false_true_false","psNow":"never_none_true_false_false","eaAccess":"never_none_false_false_false"},"loyaltySubscription":{"enrollStatus":"NOT_ENROLLED","statusLevel":"NO_LOYALTY_LEVEL"}}; bm_sz=2863F7E0D21E222AF14A53F7118A0228~YAAQldrARfWfXSeGAQAA0Mn+WBJpIKcX/993r0KljY6SlX1Ccp+0MeifDv31U00eSR25NoZ20gUq2pmrGNBfZWONViVX5QladaGGQI62LinM7FrC/QnFAStb+bksqCk7mFjlSwtnSuDnznK3ORqr9rlqLxW4oFvT0IaBiQEKQBTT6vt1KOTTFgTvjOXqofMtGTu6vDFAp711blh016IJKawRjviujdjpc/zizCHL3p8X2D8hbsxm6MhQ29I29Ijcnmdfz4wVnFEPtffSe7cwZewxfr9JgLJ4esXfwQugaQjWrXEnXVZMRiZG90lUoAG64A65uztfEMbflYTcZHlI4zq1uE0ADPAlmEoGJBHzbGxpAgGRosa9lzdKJSMfxLBznyN+lF5qslOVveGzXMZXaM+/4JH171mvzWfIRvzu42OOe77ehiAFaTIf/t3KpBYvGwyW~4276536~3355701; sc-cmp-id=; _abck=0A2532B47F3A25B48E151C9D7A4DB6C2~-1~YAAQDJA6F7nQRlGGAQAAbkoFWQnGgzWXU30OAh1UDG8wI531u0juVQ/AuaIHkSTK2KaZzn9hJuYtCAAfCkvkfYmLDIHNFWduf1QcLslMn2oS2v9ho+gft3YAtOsIA5ikgVzjPC9RL1XQLu05QPowk4qqBNBB464DnB0FvbSeJtQwzEmqlKpwtDXeY90gDKdwcnqMVHCXxmQEujLOpVyrlfiFv40Ip/JjsQEIQEtd08U7HaOcQDcJ8zhEqptQkyrcQ4d3k+ftFax2RZXa637Z6ENn2csKePe+L2P+m1TwbgD0AQ9oMPhPGP4tvNtFq7ebvcmqTnuGxS08iQKHnwQfFXNQijCo2hBwy1bGLbOXuGekToePkR5rCh42ygy3T36osmYcY0WgNHjjijbyD5vnfDjjbbsdFDEVO9uYTUHWHq1+tqPOfsK7zqpaw2RmvzmIuC2zU/208opH03hCHdA3uMO7+uEnRmTe8zWVWQVh~-1~-1~-1';
let size = 1;
// 获取游戏列表
const optionsA = {
  method: 'GET',
  url: 'https://web.np.playstation.com/api/graphql/v1/op',
  qs: {
    operationName: 'getPurchasedGameList',
    variables: `{"isActive":true,"platform":["ps4","ps5"],"size":${size},"start":0,"sortBy":"ACTIVE_DATE","sortDirection":"desc","subscriptionService":"NONE"}`,
    extensions: '{"persistedQuery":{"version":1,\n    "sha256Hash":"2c045408b0a4d0264bb5a3edfed4efd49fb4749cf8d216be9043768adff905e2"}}'
  },
  headers: {
    Cookie: cookie
  }
};
// 或由于网络情况导致接口返回异常，请酌情判断
request(optionsA, function (error, response, body) {
  const dataA = JSON.parse(body).data.purchasedTitlesRetrieve;
  const dataB = JSON.parse(body).errors;
  if(dataA === null && dataB[0].message.indexOf('Access denied!') >= 0){
    throw new Error('error cookie');
  }
  if (error) throw new Error(error);
  size = JSON.parse(body).data.purchasedTitlesRetrieve.pageInfo.totalCount;
  // 或由于网络情况导致接口返回异常，请酌情判断
  const optionsA = {
    method: 'GET',
    url: 'https://web.np.playstation.com/api/graphql/v1/op',
    qs: {
      operationName: 'getPurchasedGameList',
      variables: `{"isActive":true,"platform":["ps4","ps5"],"size":${size},"start":0,"sortBy":"ACTIVE_DATE","sortDirection":"desc","subscriptionService":"NONE"}`,
      extensions: '{"persistedQuery":{"version":1,\n    "sha256Hash":"2c045408b0a4d0264bb5a3edfed4efd49fb4749cf8d216be9043768adff905e2"}}'
    },
    headers: {
      Cookie: cookie
    }
  };
  request(optionsA, function (error, response, body) {
    const dataA = JSON.parse(body).data.purchasedTitlesRetrieve;
    const dataB = JSON.parse(body).errors;
    if(dataA === null && dataB[0].message.indexOf('Access denied!') >= 0){
      throw new Error('error cookie');
    }
    if (error) throw new Error(error);
    size = JSON.parse(body).data.purchasedTitlesRetrieve.pageInfo.totalCount;
    
    fs.writeFile("./DB/gamelist.json",body,function(error){
          if(error){
              console.info("write error")
          }
          else{
              console.info("write success")
          }
      })
  });
});