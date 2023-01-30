# 获取个人信息接口

```javascript
import axios from "axios";

const options = {
  method: 'GET',
  url: 'https://web.np.playstation.com/api/graphql/v1/op',
  params: {
    operationName: 'getProfileOracle',
    variables: '{}',
    extensions: '{"persistedQuery":{"version":1,"sha256Hash":"fc0d765f537f3dce3e0d91c71e85daa401042ba43066acde9f8f584faced10df"}}'
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
		"oracleUserProfileRetrieve": {
			"__typename": "ProfileOracle",
			"accountId": "3891301468276772210",
			"age": 27,
			"avatar": {
				"__typename": "Media",
				"url": "https://static-resource.np.community.playstation.net/avatar_xl/SCEI/I0003_XL.png"
			},
			"hashedAccountId": "2d9ce18397d2601b7fe6b36873db4a1427f34d3055c584665f986bbdfa7552b1",
			"isOfficiallyVerified": false,
			"isPsPlusMember": true,
			"locale": "zh-Hans-HK",
			"name": "zhi gang",
			"onlineId": "gzdcr",
			"profilePicture": {
				"__typename": "Media",
				"url": "https://static-resource.np.community.playstation.net/avatar_xl/SCEI/I0003_XL.png"
			},
			"userSubscription": [
				{
					"__typename": "UserSubscription",
					"loyaltyTier": null,
					"subscriptionDuration": null,
					"subscriptionFlag": null,
					"subscriptionStatus": "NEVER",
					"subscriptionTier": null,
					"subscriptionType": "PSNOW"
				},
				{
					"__typename": "UserSubscription",
					"loyaltyTier": null,
					"subscriptionDuration": null,
					"subscriptionFlag": null,
					"subscriptionStatus": "NEVER",
					"subscriptionTier": null,
					"subscriptionType": "EAACCESS"
				},
				{
					"__typename": "UserSubscription",
					"loyaltyTier": null,
					"subscriptionDuration": "12 MONTH",
					"subscriptionFlag": "",
					"subscriptionStatus": "SUBSCRIBED",
					"subscriptionTier": "TIER_10",
					"subscriptionType": "PSPLUS"
				},
				{
					"__typename": "UserSubscription",
					"loyaltyTier": "NO_LOYALTY_LEVEL",
					"subscriptionDuration": null,
					"subscriptionFlag": null,
					"subscriptionStatus": "NOT_ENROLLED",
					"subscriptionTier": null,
					"subscriptionType": "LOYALTY"
				}
			]
		}
	}
}
```