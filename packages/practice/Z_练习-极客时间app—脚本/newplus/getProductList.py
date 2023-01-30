from worm import worm
from pamars import pamars
from produceListClean import produceListClean

# 课程列表
def get_product_list():
    worm.requests_post_and_save(
        path_dir_name=pamars.path_dir_name,
        headers={
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '23',
            'Content-Type': 'application/json',
            'Cookie': str(pamars.Cookie), 
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
    produceListClean.save_product_all_id_list()
    produceListClean.save_product_isvip_id_list()
    produceListClean.save_product_notvip_id_list()


get_product_list()