"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2023-01-30 15:00:03
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-02-16 15:47:53
 * @FilePath: \whatAreYouGaoShaLei\packages\psnDB\back\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const koa_1 = __importDefault(require("koa"));
const request_1 = __importDefault(require("request"));
const fs_1 = __importDefault(require("fs"));
const app = new koa_1.default();
const cookie = 's_ecid=MCMID|79672558761901653070950768434632526053; AMCV_BD260C0F53C9733E0A490D45@AdobeOrg=-1124106680|MCIDTS|19387|MCMID|79672558761901653070950768434632526053|MCAAMLH-1675590438|11|MCAAMB-1675590438|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1674992838s|NONE|MCAID|NONE|vVersion|5.2.0; _evga_9736={"uuid":"17f9bc2f8476ac4b"}; _sfid_c0f4={"anonymousId":"17f9bc2f8476ac4b","consents":[]}; da_lid=C09A3F6F9A73EA17232ABB99F3A8DE8D9A|0|0|0; mbox=session#31ab16fd3b1742a687d953140a385052#1674987885|PC#31ab16fd3b1742a687d953140a385052.35_0#1738230443; pdccws_p=s:c3ft0HRfRVOFH01eD5BZckCz7AtQurdK.zA94nt6rafy0V5b6ptTTV6FMiXc6FU+HfY5QZzTGO4M; isSignedIn=true; pdcsi={"psPlusSubscription":{"psPlusTier":"TIER_10","status":"SUBSCRIBED","duration":"12 MONTH","flag":"","isTrial":false,"isPsPlusMember":true},"ubisoftPlusSubscription":{"status":"NEVER","active":false,"eligibleForTrial":false},"emsCriteria":{"psPlus":"active_12m_false_true_false","psNow":"never_none_true_false_false","eaAccess":"never_none_false_false_false"},"loyaltySubscription":{"enrollStatus":"NOT_ENROLLED","statusLevel":"NO_LOYALTY_LEVEL"}}; bm_sz=2863F7E0D21E222AF14A53F7118A0228~YAAQldrARfWfXSeGAQAA0Mn+WBJpIKcX/993r0KljY6SlX1Ccp+0MeifDv31U00eSR25NoZ20gUq2pmrGNBfZWONViVX5QladaGGQI62LinM7FrC/QnFAStb+bksqCk7mFjlSwtnSuDnznK3ORqr9rlqLxW4oFvT0IaBiQEKQBTT6vt1KOTTFgTvjOXqofMtGTu6vDFAp711blh016IJKawRjviujdjpc/zizCHL3p8X2D8hbsxm6MhQ29I29Ijcnmdfz4wVnFEPtffSe7cwZewxfr9JgLJ4esXfwQugaQjWrXEnXVZMRiZG90lUoAG64A65uztfEMbflYTcZHlI4zq1uE0ADPAlmEoGJBHzbGxpAgGRosa9lzdKJSMfxLBznyN+lF5qslOVveGzXMZXaM+/4JH171mvzWfIRvzu42OOe77ehiAFaTIf/t3KpBYvGwyW~4276536~3355701; sc-cmp-id=; _abck=0A2532B47F3A25B48E151C9D7A4DB6C2~-1~YAAQDJA6F7nQRlGGAQAAbkoFWQnGgzWXU30OAh1UDG8wI531u0juVQ/AuaIHkSTK2KaZzn9hJuYtCAAfCkvkfYmLDIHNFWduf1QcLslMn2oS2v9ho+gft3YAtOsIA5ikgVzjPC9RL1XQLu05QPowk4qqBNBB464DnB0FvbSeJtQwzEmqlKpwtDXeY90gDKdwcnqMVHCXxmQEujLOpVyrlfiFv40Ip/JjsQEIQEtd08U7HaOcQDcJ8zhEqptQkyrcQ4d3k+ftFax2RZXa637Z6ENn2csKePe+L2P+m1TwbgD0AQ9oMPhPGP4tvNtFq7ebvcmqTnuGxS08iQKHnwQfFXNQijCo2hBwy1bGLbOXuGekToePkR5rCh42ygy3T36osmYcY0WgNHjjijbyD5vnfDjjbbsdFDEVO9uYTUHWHq1+tqPOfsK7zqpaw2RmvzmIuC2zU/208opH03hCHdA3uMO7+uEnRmTe8zWVWQVh~-1~-1~-1';
// 获取个人信息
const optionsB = {
    method: 'GET',
    url: 'https://web.np.playstation.com/api/graphql/v1/op',
    qs: {
        operationName: 'getProfileOracle',
        variables: '{}',
        extensions: '{"persistedQuery":{"version":1,"sha256Hash":"fc0d765f537f3dce3e0d91c71e85daa401042ba43066acde9f8f584faced10df"}}'
    },
    headers: {
        cookie: cookie
    }
};
// 或由于网络情况导致接口返回异常，请酌情判断
(0, request_1.default)(optionsB, function (error, response, body) {
    if (error)
        throw new Error(error);
    fs_1.default.writeFile("./DB/ProfileOracle.json", body, function (error) {
        if (error) {
            console.info("write error");
        }
        else {
            console.info("write success");
        }
    });
});
