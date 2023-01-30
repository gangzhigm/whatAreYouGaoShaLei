<!--
 * @Author: gangzhigm 864853934@qq.com
 * @Date: 2023-01-30 15:33:07
 * @LastEditors: gangzhigm 864853934@qq.com
 * @LastEditTime: 2023-01-30 15:33:59
 * @FilePath: \whatAreYouGaoShaLei\packages\psnDB\DB\getProfileOracle copy.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
# 获取单个游戏图床

```javascript
import axios from "axios";

const options = {
  method: 'GET',
  url: 'https://web.np.playstation.com/api/graphql/v1/op',
  params: {
    operationName: 'productRetrieveForUpsellWithCtas',
    variables: '{"productId":"UP1001-CUSA03979_00-ASIAPLACEHOLDER0"}',
    extensions: '{"persistedQuery":{"version":1,"sha256Hash":"d5b5cd4bdbff9886a426c25df39513e4bf3325b3e0612fbf4a905382123fff56"}}'
  },
  headers: {
    cookie: 's_ecid=MCMID|79672558761901653070950768434632526053; AMCV_BD260C0F53C9733E0A490D45@AdobeOrg=-1124106680|MCIDTS|19387|MCMID|79672558761901653070950768434632526053|MCAAMLH-1675590438|11|MCAAMB-1675590438|RKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y|MCOPTOUT-1674992838s|NONE|MCAID|NONE|vVersion|5.2.0; eucookiepreference=accept; _evga_9736={"uuid":"17f9bc2f8476ac4b"}; _sfid_c0f4={"anonymousId":"17f9bc2f8476ac4b","consents":[]}; da_lid=C09A3F6F9A73EA17232ABB99F3A8DE8D9A|0|0|0; mbox=session#31ab16fd3b1742a687d953140a385052#1674987885|PC#31ab16fd3b1742a687d953140a385052.35_0#1738230443; pdccws_p=s:aanlk0IAWdAE1SFaeQupH_7H8TtIakwP.dVxvCOUw273Jj42buN6ieujeRS2PWS6gMkHMreCGvR4; isSignedIn=true; pdcsi={"psPlusSubscription":{"psPlusTier":"TIER_10","status":"SUBSCRIBED","duration":"12 MONTH","flag":"","isTrial":false,"isPsPlusMember":true},"ubisoftPlusSubscription":{"status":"NEVER","active":false,"eligibleForTrial":false},"emsCriteria":{"psPlus":"active_12m_false_true_false","psNow":"never_none_true_false_false","eaAccess":"never_none_false_false_false"},"loyaltySubscription":{"enrollStatus":"NOT_ENROLLED","statusLevel":"NO_LOYALTY_LEVEL"}}; sc-cmp-id=; bm_sz=699EA47736E1C399CF51863D6DA4A0AD~YAAQTvw7FwQ2a9WFAQAAtIRHARL+1IfQYvCbrsY4bs/7MoBp3MYjoI9LgYMIy+HrGvFxgGLxJQLNaC/DHaJmGkkxiZNCOLLnQpS8NcecGIy7dkQQmdG68ji3ZQcl5Wjdjy7ikWDU82+EHxoFhm9UoHaPPf+69geijAVEGCh7xg0KHOl7Qyi8j9gyxwL0oTL9cFucl60KQX2oHgpPAo6zqc/nkHY7BgwDClhFat0zydhbS6gx55c9Tfr2ujpQ1GVyTUjIiXd0i5OuN8i6mrSf9j+ckZOuGcgjAzBZjlfyhz1hOe3g6r+FiCUv/RNL5jBVPA4rdG+RtLSoWt2KWsUY7JdwYmnyLJzEHW4QZSNWqDOhKPbZCXlk7bQxCs1jfhuKtWZ/eiN6l8gC1D7n1umnGEoj4M+Oep4b1Ll11a051vNIEKhPDHdLgg==~3617585~4600377; _abck=563F56116285CCE515B7D099DF91DA92~-1~YAAQnGgDF8WJ6+2FAQAAXDteAQlozBBzarSxU2uN3qm3HvCBROfChtTQ81HDFnFBYGaYl9UYZwcJIf5BMkzHUfvmKd96L0rThPDHOFlxtUi7VyzgGe6WE/qkiApztqgHaqZvjlKIncF1KRBogXWBj3KRrpVbZ8smEPrXVjzm7b1PJH9ZDI+JdwIyY/7vh3LyvhVGZjqEcFFMfuoCCFMhiXS1DU7XWsDE39rNHEwgiju6Twa7oqMxvOO6ZIKXxo27KYQekGt2Wf57EAF0vNWXISrHyx7hbBQ8nBrtr7veuUnA7AVMEA9zLbHQ4lN2XVyXWKpCIiKaEOqefXfPNt01gfpCPKo2cM/CCcfiUzhpXlNq9Yiw1k3Eq3u3ii7mXoSmzwVzBMAG8BywWzuS2c7wde/Z1gH2hsGnc+Y/m65H1OpGkXTBNDCURGDKyGz2CdEOlaNWKUsP8ek+HnJajTW0xnfDHTe6QjHQOwCBveNHjE5LejfANpc6EJqqZQc=~-1~-1~-1'
  }
};

axios.request(options).then(function (response) {
  console.log(response.data);
}).catch(function (error) {
  console.error(error);
});
```



```json
{
	"data": {
		"productRetrieve": {
			"__typename": "Product",
			"concept": {
				"__typename": "Concept",
				"id": "216051",
				"media": [
					{
						"__typename": "Media",
						"role": "GAMEHUB_COVER_ART",
						"type": "IMAGE",
						"url": "https://image.api.playstation.com/vulcan/img/rnd/202010/1520/ViKFKlCfahoC4r0pKoXzHG6O.png"
					},
					{
						"__typename": "Media",
						"role": "LOGO",
						"type": "IMAGE",
						"url": "https://image.api.playstation.com/vulcan/img/rnd/202010/2122/sYtJcPQnk13yKoGqFaym8ioG.png"
					},
					{
						"__typename": "Media",
						"role": "MASTER",
						"type": "IMAGE",
						"url": "https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA03979_00/2/i_001dc6840592651af45f02312f1577964eacf959f82337314eb0e0398a66b002/i/icon0.png"
					}
				],
				"name": "BioShock: The Collection",
				"products": [
					{
						"__typename": "Product",
						"edition": {
							"__typename": "ProductEdition",
							"features": [],
							"name": "",
							"ordering": null,
							"type": "OTHER"
						},
						"id": "UP1001-CUSA03979_00-ASIAPLACEHOLDER0",
						"media": [
							{
								"__typename": "Media",
								"role": "BACKGROUND",
								"type": "IMAGE",
								"url": "https://image.api.playstation.com/cdn/UP1001/CUSA03979_00/zSsjKVbHAUxULrkswaXLQCZMlLFhfZGX.png"
							},
							{
								"__typename": "Media",
								"role": "GAMEHUB_COVER_ART",
								"type": "IMAGE",
								"url": "https://image.api.playstation.com/vulcan/img/rnd/202010/1520/ViKFKlCfahoC4r0pKoXzHG6O.png"
							},
							{
								"__typename": "Media",
								"role": "LOGO",
								"type": "IMAGE",
								"url": "https://image.api.playstation.com/vulcan/img/rnd/202010/2122/sYtJcPQnk13yKoGqFaym8ioG.png"
							},
							{
								"__typename": "Media",
								"role": "MASTER",
								"type": "IMAGE",
								"url": "https://image.api.playstation.com/vulcan/img/cfn/11307QpVmqagVcRAFe17k7t0Q-CLBHI3N-W-AEiwr56-91ZI_3DjQ1w2mkE8faAkMGlVsZdwp9bbe_qW_34OBfH-GLYPOIf7.png"
							}
						],
						"platforms": [
							"PS4"
						],
						"topCategory": "GAME",
						"concept": {
							"__typename": "Concept",
							"id": "216051"
						},
						"isInWishlist": false,
						"isWishlistable": true,
						"name": "生化奇兵：典藏版 (英文版)",
						"skus": [
							{
								"__typename": "Sku",
								"id": "UP1001-CUSA03979_00-ASIAPLACEHOLDER0-H002",
								"name": "英文版"
							}
						],
						"webctas": [
							{
								"__typename": "GameCTA",
								"action": {
									"__typename": "Action",
									"param": [
										{
											"__typename": "ActionParam",
											"name": "entitlementIds",
											"value": "[\"UP1001-CUSA03979_00-BIOSHOCKCOMPLETE\",\"UP1001-CUSA03980_00-BIOSHOCKCOMPLETE\"]"
										},
										{
											"__typename": "ActionParam",
											"name": "userId",
											"value": null
										},
										{
											"__typename": "ActionParam",
											"name": "skuId",
											"value": "UP1001-CUSA03979_00-ASIAPLACEHOLDER0-H002"
										},
										{
											"__typename": "ActionParam",
											"name": "isEntitledViaSubscription",
											"value": "true"
										}
									],
									"type": "DOWNLOAD"
								},
								"hasLinkedConsole": true,
								"meta": {
									"__typename": "CTAMeta",
									"exclusive": false,
									"ineligibilityReasons": [
										{
											"__typename": "IneligibilityReason",
											"names": [],
											"type": "UNKNOWN"
										}
									],
									"playabilityDate": null,
									"upSellService": "NONE"
								},
								"type": "DOWNLOAD",
								"price": {
									"__typename": "Price",
									"applicability": null,
									"basePrice": null,
									"basePriceValue": null,
									"campaignId": null,
									"currencyCode": null,
									"discountText": null,
									"discountedPrice": null,
									"discountedValue": null,
									"endTime": null,
									"isExclusive": null,
									"isFree": false,
									"isTiedToSubscription": null,
									"qualifications": null,
									"rewardId": null,
									"serviceBranding": [
										"NONE"
									],
									"upsellText": null
								}
							},
							{
								"__typename": "GameCTA",
								"action": {
									"__typename": "Action",
									"param": [
										{
											"__typename": "ActionParam",
											"name": "skuId",
											"value": "UP1001-CUSA03979_00-ASIAPLACEHOLDER0-H002"
										},
										{
											"__typename": "ActionParam",
											"name": "rewardId",
											"value": "OUTRIGHT"
										}
									],
									"type": "ADD_TO_CART"
								},
								"hasLinkedConsole": null,
								"meta": {
									"__typename": "CTAMeta",
									"exclusive": false,
									"ineligibilityReasons": [
										{
											"__typename": "IneligibilityReason",
											"names": [],
											"type": "UNKNOWN"
										}
									],
									"playabilityDate": null,
									"upSellService": "NONE"
								},
								"type": "ADD_TO_CART",
								"price": {
									"__typename": "Price",
									"applicability": "APPLICABLE",
									"basePrice": "HK$398.00",
									"basePriceValue": 39800,
									"campaignId": "PROMO-PROD-00003984",
									"currencyCode": "HKD",
									"discountText": "-80%",
									"discountedPrice": "HK$79.60",
									"discountedValue": 7960,
									"endTime": "1675267140000",
									"isExclusive": false,
									"isFree": false,
									"isTiedToSubscription": false,
									"qualifications": [],
									"rewardId": "OFFER-PROD-3984_80",
									"serviceBranding": [
										"NONE"
									],
									"upsellText": "立省80%"
								}
							}
						]
					}
				]
			},
			"id": "UP1001-CUSA03979_00-ASIAPLACEHOLDER0",
			"topCategory": "GAME"
		}
	}
}
```