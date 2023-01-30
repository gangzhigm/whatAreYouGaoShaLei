# import requests
# url = "https://account.geekbang.org/account/ticket/login"
# data = {
#     "platform":3,
#     "appid":1,
#     "remember":1,
#     "data":'%7B%22a%22%3A%22FFFF0N00000000009834%22%2C%22c%22%3A%22FFFF0N00000000009834%3Anvc_message%3A1656921270468%3A0.6059493894694712%22%2C%22d%22%3A%22nvc_message%22%2C%22j%22%3A%7B%22test%22%3A1%7D%2C%22h%22%3A%7B%22umidToken%22%3A%22GC83B9A07767CEA6456D183D4F03B85593376CF519840F0EAA4%22%7D%2C%22b%22%3A%22222!j4ahvkPr5wcRO99a59aeVIQ2GW57S0OmKjU0DM9BV2yVHjvaVCUNxJPQIBHT5vuxhfgk0e9WnZmHBJJ16orRffn4RO%2FERgIeWK3YkT0aMrHlAaeEP3AU3XvrGPt%2BCvMLPKvDMefhkieZWBZLskCbIYNDdOG0iQK704AbFzqvn1uDxTdXEsi2SgFy70hMkY9%2FN4yea%2FFJIxX2ZIANu2LjnDJx7ZihOenzKmQT8zLcdPHFPpZc2YGcgK2DMBdjrF7egKvH2Qu1rKoQuZgYTY6Ychn5SouYrFLxX5Gh2T2crKABShSR2YAonXFpaoCrhY%2Ffik02285VstKWEk9Xp8%2FIi2LlRQaHycv4Wvg9bjo6KWm5r7jnYwwwVDwjnzMrQ1V%2BBD%2F6txc7qpXQFUM%2BBoKOxIPH7PG%2FJ3ix6ldsJwXxGx5SUm4CayCf2zJ1cmHViXCtMf4fb7Uxzi3dhWaPrTHP0uZeiZwVFONYFO9OoZW953JlmxWuhUflrO%2Fa7gi3X7lfCjItb9bpAAJTd3WMp6Cvwk3zMW1KvkklQx0am3XFEjD1721R7r%2FvhPHZ%2BYagv3Vco4lAy1EVQy8eNnPqBsYnm6wJ59svDSd09ELD2lUKbGvprHTA9KXY2bhWCrHr7ihRZc5jRJ%2FXarF0m%2B%2FERf23BtWEY32Pa8Rxwz5xZimVq%2BUsb%2FkpAUrvOppInc8%2BfAlo1t%2BqNlxlV%2BSiTEC15q1Go04T80IyOZkJzNhpc%2BVSGczqWg0Wok%2FT5HngYByHnon9u%2B4mA0uaJlBi3dOeA4bA21ix8qA84aanLSZE4%2BCGxl0J%2BIhBxh%2FM2ZM5AnWAjkQD2vj8EvjfhrPPYGtf9eeCJnyjMSfPa%2BkSNZy6zxenmsWZLX195liXnmTva01Txj1p7sN1lk1AmvoXS5Z%2Fz2b8iwKvTdAoARKcOdHZOg%2BVLYII9fjy0PA8hvCtEV5VROeSvV5kANJ1wBMR9XYpC6QXziCM0OI%2Bs4XEnL8dvtuCXW3iiHhkNJtIXf2UJPFNDGeef%2FlvS%2FwGGXuafMDPhzWqORJVU8NHybJQM0JsxImtojBPOcNq2SVT1WAA18Y8R8yuH6Gp9yHTnICpGBkNfWOsq7UIrg8HtUiC1flgU9i47edJsHldwV%2FIg3t5GwRKZSc6%2FRviY2MJOyfkFIsZCNf%2FskiGMMakslJ1NM4arpTTb46z7tnoIlnlxk29xePeHJd75ZALQ4PkSydsq2GHzx4xBmN1%2F6481DqITxSIs03exaPp9y4FqTz4Z01EHSwSluL7aRmZasKew4pG2eUOVHcvy9ClfTvhafim5HPxvSa5hOcExLyTgJnjwrtrbcKNnC1xC4ySQ2kpvaQssde9wqsgdytkV%2BXxaXfK6cM2PlXHCbGzeh%2BENTQOIgdP4q7xUoskrqONr3%2BEO%2BFuHr%2FUriNsUCc0ordc7%2BxABIv1hZcUAs4%2F4QLvo7NuaTsn2ztaCH70r%2F5xulVV8Gn0ZzvrL%2F5easUy%2B%2FtvCeTwm4WBrWW8Kkwg1sdZzF3BRsUb0rzQA05JgQdulkCy4T9Wt3BmKTQWljN%2B7ujDcgXnhS81JT88KWE%2FjtzQz8uJOmRPHZt8R8EUz4WWwv6YIRZCv1ing1Q%2BJz46eU7JohHD78c2QkCEHgUbqtu3hO7M6xOHUaCiQHe165NBtA22FHuhwxlEmJozolBCXyDH5wySosrvJM5KMyb9C1vSGNOQKW7ERHzd2FyTTTpw1k8Qe76tT6XbqAb%2BpS0WEFq0JgVqwVDnKOvexl4QUiQ3yjzbvBHoeDt4JF9Mbp%2FELowauLzEHH3IGtLsRkQ8bNjVMaWQzJGqkSAB%2BIBLE5NXmA%2F8E%2B2AoXuJGhyvTyjQRG3X8cPwT3oxEygEt7f5bgU6aUZXBpJ%2F3FSmN7NPcnKZAKlAbDb80omeDTnNB9B1uwpGb0SC8UdvliR01nGKluCCPSvOCqVmV4kIImDhZSOK%2BMfy%2FJdhqnSpMTF7AvRri1595%2BuWC83T%2FknX2Pkl9RlqNHPMuzjUQ9DmB1Z0gi3HzIoHQ%2FeYa%2Flv95Z4H%2BLQUNWWGrSJFHRC8sDB3zbsaOCr4Tjnx7LpE3AEy1QKTa%2BMMx6mnmgBb9rcGbqgTrXx53qLDUwnr3c0cW4D2vfFwQvCuCJcXIeXb4AR8dYeZvmCJxnwXZGR5LH46%2Fp677%2BpenBIDSKGWoxgDjh1yL5HuM5s7cUpgifDt3qp0LwFByHTTRC1%2BsYYoCPaDYmBiaDsHcRHfHWBuLau7uvYuI3tAxt3hV7Epaj5FaEIELQtZDSFKo1HYyNXZrLsltBYBymwQlSRbGBJcHtMnaet2iEYTF3RXkOxgooFZPLtw9wbsXJk1FzK8TtmxB%2FA2zcaPmaUhs6deLde0ogVgATuf97tKEjjmRK3dBN1bM8Dx1Nqvf%2BU7kY4%2FWxjwzToO33jMH3TYGeht%2BGMvcJn9%2FHYVAI38wHBKfIbdUpmL8RI%2BX0eG98L1%2BezX%2BvJEybSIf14Zl8DFqBhsSd%2F2wno8TMHJppipGG3Mr2KEmZXaoeU%2FzIqKOY7x26eSCm%2BZFolPQtc4nMsKunzs%2Bq1gBhIe8Gtm7ofAWOkrFn4xrFYuUzHgxBLjtVL0b1jxSOAMaVckWUKOxjIGnc7AvZ1%2FjqPJutujAxrdYl8DnjVmfKocmKCtXzjKmbS6Jtmh%2B5Ne%2BTk8VGfeD0lh0JeZaBad2LF2VDCkA9uVUKHY%2BSCEV3RU%2BZPIy%2F8cCxXUZxSXHNRkQIw7xKIoKSx6csaC6kCHHtJ5godTo8fk95H3s0yRt%2BEAZ%2BkkoVInDwiaomfTYple7VzIiITvahSCoSuRjn9i9zZPo9NbnFROEkWAO31Q%2FOsUImbTohLYos61S50T42uiVTN2A6EgwQ94%2FTxdpDAW9mU%2FkyvKZ9JoXEu2cEhlcP2fbIsZMSzB7bMLJwepQv0pL8NR1nHHqxMnpbNAQBWI1buLJYDJIeKzwSEfKihE1IVSMjbyIAJCGDt6RO9YeApvjBsorsMQ8VpdTbfjIXCcNTOLdHBqGZ%2Bp4V3Gk4zH%2BWAyuWJ0Pe88%2B4WSRA4QC2t4fZy8mfRJuHYyPixGLb5C5IquAcCs99HL8RNZSNnaB5j691f1LHwq9wShsPs6Ay55SzgDUpT%2B%2FD0t4%2Bm0dPPQyxpvwaHMZM2CGr61floBUfP1OffiAa5EvYZlHOH8TnR4FFZKSepAZLfkLTt62W6x7hmZm5xLuGNTOhPF9cUP44uUyN%2BXXMkTtaYqb19euyU29MfC4tBQgMIaJnPcdSlMB1FzMK7mDxdiHWnQu1tos2ptKami9gdhnlsBQcjDjII%2Fc9kxuTuSUFafq1ticf77Ey1DsHC1dDNU1lUhb9myQy1X6MnUsx%2FvDwbK%2FvExFUH4pSw%2Bqw8D3kBKHMSU6JxptR%2FRasTcqe2tpCquomzo9wPnG1kbp3tILQMVbzoq%2Bazq5qMPbeyF8%2FGkx4m211ESO7zkR930sJ6W%2BzIbYb6CixVk%2Fbzpc%2BwE4OnCy9rkv%2FyLQnaBOraIE00uFJdhOmkcX3xJN94hKqAP%2FPc1jVvmF3KXpS%2BZF4sw8u734KvkHElSpurvB3zmg%2Fu6Na%2BlQmKWQnMtPuD798IF%2BAVAKGFQSX%2BOFpkUpGRXXBz1mY5Fr%2FNv5SdOrsG4MCOowXsC%2B4th9xZoIu%2FtT30Knzto3ak1%2FeZEvupsgU9%2BNEdtzxnJBs5YUbDFGACRaNWdimMIxNhs2TaRh9RFWtBFlvZDdQ1JyjAEYdfVcXYzwPx3g9pqbEBu9HOoyPjKO9tqh0Cc8vsNxdsT4PVVpO0%2BdFkgSKoddzlzjMIRGZp6dEV6Us8Nu8Bax3rjMtOWhitLCgTzp08pam9s7v0BTvZVGvykNoO4eYwircQisSTI1XTcFI8%2FEU8xSWMNdGA%2FP71HJr8uelL0Y5L5anUMoYzp%2FxpnEUbvuSJ6MwHTmKBVf2gF2zV%2FsH2EVHkW%2BSq7TiB0FITBUbF36qs1Sp56WCT75wR8HBhoMkUiBsxZUXVTC3UluF5PaO%2FvL5Nq%2F%2BvEaIl9Toj0V1KVDFR5Nb9sKb%2FG7SK1DcJRTA4aoE0FNucy0BpxnJNvDppgr8OqjKG5bGaY4QnF7XcL2yRB2qXVZmKVBN8AjKwLcpWqu15q8UAdIpmpMYohxT4hZw3bZFihvjGu%2BJEj4QzDKGCtNxvk3hmjFk38MeVkVTKTeW0CZdPMfsNYKX1%2BOa1GALtImUUaneRYF2oF%2FJPXRTdlyi%2FZ6wVJXqhYkxNCxbnNxuUynmc7s%2BE65zH7pjqzpigVpdYvApWdlwZ%2BpKh0b1xtd3wrDpUSJIwLlZgVMIS42UJ7o9ist0ZmsdVeMCroZ769x3iTvDwgfHMsKZ1QK5ZgF7cNts7piPfYVqQ%2BgS4kw3dckJbZuNhbl5D7etdhYGUgbKOIUIg28G3ox8zEWDk%22%2C%22e%22%3A%22_mmphBeYlcaBmSTQKmbIM-xOItVP7uFTY0Gkx7dGY8OOu02fmTbbQ8TJwo5S8wQyxFTeobcgqh4RB6SlJnz3dfhP9_15dpnrtSqJnvya92AqwVDaHNZgpMg_4xpYvsTMEAm48ZHXJRNfarQNwp4bK2cT8FCFpn3UNT0ZExtCObZpj-R60jwupuq2sUfOi9-5%22%7D',
#     "source":"",
#     "ucode":"",
#     "sc":{
#         "uid":"",
#         "report_source":"Web",
#         "utm_identify":"",
#         "utm_source":"",
#         "utm_medium":"",
#         "utm_campaign":"",
#         "utm_content":"",
#         "utm_term":"",
#         "original_id":"17b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991",
#         "refer":"极客时间"
#     },
#     "cellphone":"17862976392",
#     "password":"830505gexin"
# }

# headers = {
#     'Accept': 'application/json, text/plain, */*',
#     'Accept-Encoding': 'gzip, deflate, br',
#     'Accept-Language': 'zh-CN,zh;q=0.9',
#     'Connection': 'keep-alive',
#     'Content-Length': '3933',
#     'Content-Type': 'application/json',
#     'Host': 'account.geekbang.org',
#     'Origin': 'https://account.geekbang.org',
#     'Referer': 'https://account.geekbang.org/login?redirect=https%3A%2F%2Ftime.geekbang.org%2Fresource',
#     'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
#     'sec-ch-ua-mobile': '?0',
#     'sec-ch-ua-platform': '"Windows"',
#     'Sec-Fetch-Dest': 'empty',
#     'Sec-Fetch-Mode': 'cors',
#     'Sec-Fetch-Site': 'same-origin',
#     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
# }
# rsp = requests.post(url=url, headers=headers, json=data)
# print(rsp.json())

# # 以上是登录

# import requests
# Cookie =  'LF_ID=1628558911414-9981319-463889; _ga=GA1.2.1039130042.1628558911; MEIQIA_TRACK_ID=1yUP4S6PWYKSV57l6bSOqYOr39y; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2217b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_landing_page%22%3A%22https%3A%2F%2Ftime.geekbang.org%2Fcolumn%2Farticle%2F219290%22%2C%22%24latest_utm_source%22%3A%22time_web%22%2C%22%24latest_utm_medium%22%3A%22menu%22%2C%22%24latest_utm_campaign%22%3A%22timewebmenu%22%2C%22%24latest_utm_content%22%3A%22menu%22%2C%22%24latest_utm_term%22%3A%22timewebmenu%22%7D%2C%22%24device_id%22%3A%2217b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991%22%7D; _gcl_au=1.1.1727984302.1656056718; MEIQIA_VISIT_ID=2BEJUhgTUkYGzq3Zt3aUte6X62n; gksskpitn=d1431f40-8406-4a89-9ba3-04a980bb53e6; Hm_lvt_59c4ff31a9ee6263811b23eb921a5083=1655345967,1656056644,1656912620; Hm_lvt_022f847c4e3acd44d4a2481d9187f1e6=1655345967,1656056644,1656912620; _gid=GA1.2.781786892.1656912620; GCID=659227a-4df889f-dcd1e7e-41c9ab0; GRID=659227a-4df889f-dcd1e7e-41c9ab0; ERID=b1477e3-07fd94c-96c6e9e-211cff0; GCESS=BgcE_HSZ_QwBAQkBAQYEJV1xLQ0BAQUEAAAAAAMEw6HCYgEIQPMYAAAAAAAKBAAAAAACBMOhwmIIAQMLAgYABAQAjScA; acw_tc=2760820416569225671908731efdc36565b716c26faf2e5606aad3d6999e78; gk_exp_uid=N2Y3NTJhYTRkYTVmMzBhNTFhZjA2YWFjYzNkNWJhYmI=|1656922569824241520|3c8fcfa97e2d54320d2c007cac904d4db9532f62556cf3ff483fdfdc7df1e9d5; Hm_lpvt_022f847c4e3acd44d4a2481d9187f1e6=1656923785; Hm_lpvt_59c4ff31a9ee6263811b23eb921a5083=1656923785; gk_process_ev={%22count%22:20%2C%22utime%22:1656921271968%2C%22target%22:%22%22%2C%22referrer%22:%22https://time.geekbang.org/resource%22%2C%22referrerTarget%22:%22page_geektime_login%22}; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%221635136%22%2C%22first_id%22%3A%2217b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_landing_page%22%3A%22https%3A%2F%2Ftime.geekbang.org%2Fcolumn%2Farticle%2F219290%22%2C%22%24latest_utm_source%22%3A%22time_web%22%2C%22%24latest_utm_medium%22%3A%22menu%22%2C%22%24latest_utm_campaign%22%3A%22timewebmenu%22%2C%22%24latest_utm_content%22%3A%22menu%22%2C%22%24latest_utm_term%22%3A%22timewebmenu%22%7D%2C%22%24device_id%22%3A%2217b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991%22%7D; SERVERID=1fa1f330efedec1559b3abbcb6e30f50|1656924311|1656912615'
# url = 'https://time.geekbang.org/serv/v3/learn/product'
# data = {
#     'desc': 'true',
#     'expire': 1,
#     'last_learn': 0,
#     'learn_status': 0,
#     'prev': 0,
#     'size': 20,
#     'sort': 1,
#     'type': 'c1',
#     'with_learn_count': 1
# }

# headers = {
#     'Accept': 'application/json, text/plain, */*',
#     'Accept-Encoding': 'gzip, deflate, br',
#     'Accept-Language': 'zh-CN,zh;q=0.9',
#     'Connection': 'keep-alive',
#     'Content-Length': '117',
#     'Content-Type': 'application/json',
#     'Cookie': str(Cookie), 
#     'Host': 'time.geekbang.org',
#     'Origin': 'https://time.geekbang.org',
#     'Referer': 'https://time.geekbang.org/dashboard/course',
#     'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
#     'sec-ch-ua-mobile': '?0',
#     'sec-ch-ua-platform': '"Windows"',
#     'Sec-Fetch-Dest': 'empty',
#     'Sec-Fetch-Mode': 'cors',
#     'Sec-Fetch-Site': 'same-origin',
#     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
# }
# rsp = requests.post(url=url, headers=headers, json=data)
# print(rsp.json())



import os

print(os)
os.makedirs('文件夹演示', exist_ok=True)