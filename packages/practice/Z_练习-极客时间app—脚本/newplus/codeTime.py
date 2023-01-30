import chardet
import os
import requests

from worm import aa

path_dir_name = 'hahapoint'

Cookie =  'LF_ID=1628558911414-9981319-463889; _ga=GA1.2.1039130042.1628558911; MEIQIA_TRACK_ID=1yUP4S6PWYKSV57l6bSOqYOr39y; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%2217b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_landing_page%22%3A%22https%3A%2F%2Ftime.geekbang.org%2Fcolumn%2Farticle%2F219290%22%2C%22%24latest_utm_source%22%3A%22time_web%22%2C%22%24latest_utm_medium%22%3A%22menu%22%2C%22%24latest_utm_campaign%22%3A%22timewebmenu%22%2C%22%24latest_utm_content%22%3A%22menu%22%2C%22%24latest_utm_term%22%3A%22timewebmenu%22%7D%2C%22%24device_id%22%3A%2217b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991%22%7D; _gcl_au=1.1.1727984302.1656056718; MEIQIA_VISIT_ID=2BEJUhgTUkYGzq3Zt3aUte6X62n; gksskpitn=d1431f40-8406-4a89-9ba3-04a980bb53e6; Hm_lvt_59c4ff31a9ee6263811b23eb921a5083=1655345967,1656056644,1656912620; Hm_lvt_022f847c4e3acd44d4a2481d9187f1e6=1655345967,1656056644,1656912620; _gid=GA1.2.781786892.1656912620; GCID=659227a-4df889f-dcd1e7e-41c9ab0; GRID=659227a-4df889f-dcd1e7e-41c9ab0; ERID=b1477e3-07fd94c-96c6e9e-211cff0; GCESS=BgcE_HSZ_QwBAQkBAQYEJV1xLQ0BAQUEAAAAAAMEw6HCYgEIQPMYAAAAAAAKBAAAAAACBMOhwmIIAQMLAgYABAQAjScA; acw_tc=2760820416569225671908731efdc36565b716c26faf2e5606aad3d6999e78; gk_exp_uid=N2Y3NTJhYTRkYTVmMzBhNTFhZjA2YWFjYzNkNWJhYmI=|1656922569824241520|3c8fcfa97e2d54320d2c007cac904d4db9532f62556cf3ff483fdfdc7df1e9d5; Hm_lpvt_022f847c4e3acd44d4a2481d9187f1e6=1656923785; Hm_lpvt_59c4ff31a9ee6263811b23eb921a5083=1656923785; gk_process_ev={%22count%22:20%2C%22utime%22:1656921271968%2C%22target%22:%22%22%2C%22referrer%22:%22https://time.geekbang.org/resource%22%2C%22referrerTarget%22:%22page_geektime_login%22}; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%221635136%22%2C%22first_id%22%3A%2217b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_landing_page%22%3A%22https%3A%2F%2Ftime.geekbang.org%2Fcolumn%2Farticle%2F219290%22%2C%22%24latest_utm_source%22%3A%22time_web%22%2C%22%24latest_utm_medium%22%3A%22menu%22%2C%22%24latest_utm_campaign%22%3A%22timewebmenu%22%2C%22%24latest_utm_content%22%3A%22menu%22%2C%22%24latest_utm_term%22%3A%22timewebmenu%22%7D%2C%22%24device_id%22%3A%2217b2dace7d90-07ec873155b7fc-87c1b38-2073600-17b2dace7da991%22%7D; SERVERID=1fa1f330efedec1559b3abbcb6e30f50|1656924311|1656912615'

# 课程列表
def get_product_list():
    aa.requests_post_and_save(
        path_dir_name=path_dir_name,
        headers={
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '23',
            'Content-Type': 'application/json',
            'Cookie': str(Cookie), 
            'Host': 'time.geekbang.org',
            'Origin': 'https://time.geekbang.org',
            'Referer': 'https://time.geekbang.org/resource?plus=1&m=0&d=0&c=0&sort=0&order=sort',
            'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'    
        },
        data={
            'label_id': 0,
            'type': 0
        },
        name='product_id_list',
        url= 'https://time.geekbang.org/serv/v1/column/label_skus', 
    )

get_product_list()