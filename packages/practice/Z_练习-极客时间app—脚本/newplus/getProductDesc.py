import os
import random
from worm import worm
from time import sleep
from pamars import pamars
from produceDescClean import produceDescClean

# 课程列表
def get_product_articles_desc(id):
    worm.requests_post_and_save(
        path_dir_name=pamars.path_dir_name,
        headers={
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Connection': 'keep-alive',
            'Content-Length': '73',
            'Content-Type': 'application/json',
            'Cookie': str(pamars.Cookie), 
            'Host': 'time.geekbang.org',
            'Origin': 'https://time.geekbang.org',
            'Referer': 'https://time.geekbang.org/column/intro/'+ str(id) + '?tab=catalog',
            'sec-ch-ua': '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'    
        },
        data={
            'cid': id,
            'order': "earliest",
            'prev': 0,
            'sample': 'false',
            'size': 500
        },
        name='product_articles'+'_'+str(id),
        url= 'https://time.geekbang.org/serv/v1/column/articles', 
    )

class product_articles_desc:
    def get_product_articles_desc_isvip():
        path = os.path.join(pamars.path_dir_name,'isvip_product_id_list_clean'+'.json')
        with open(path,'r',encoding='utf-8') as f:
            for id in f.read().replace('[','').replace(']','').split(','):
                get_product_articles_desc(id=id)
                sleep_timer = random.randint(pamars.sleep_time[0],pamars.sleep_time[1])
                sleep(sleep_timer)
                pass
            pass
            produceDescClean.produceDescClean(path)
        pass
    
    def get_product_articles_desc_notvip():
        path = os.path.join(pamars.path_dir_name,'notvip_product_id_list_clean'+'.json')
        with open(path,'r',encoding='utf-8') as f:
            for id in f.read().replace('[','').replace(']','').split(','):
                get_product_articles_desc(id=id)
                sleep_timer = random.randint(pamars.sleep_time[0],pamars.sleep_time[1])
                sleep(sleep_timer)
                pass
            pass
            produceDescClean.produceDescClean(path)
        pass

    def get_product_articles_desc_all():
        path = os.path.join(pamars.path_dir_name,'all_product_id_list_clean'+'.json')
        with open(path,'r',encoding='utf-8') as f:
            for id in f.read().replace('[','').replace(']','').split(','):
                get_product_articles_desc(id=id)
                sleep_timer = random.randint(pamars.sleep_time[0],pamars.sleep_time[1])
                sleep(sleep_timer)
                pass
            pass
            produceDescClean.produceDescClean(path)
        pass

    def get_product_articles_desc_test():
        path = os.path.join(pamars.path_dir_name,'test_product_id_list_clean'+'.json')
        with open(path,'r',encoding='utf-8') as f:
            for id in f.read().replace('[','').replace(']','').split(','):
                sleep_timer = random.randint(pamars.sleep_time[0],pamars.sleep_time[1])
                print(sleep_timer)
                sleep(sleep_timer)
                pass
            pass
            produceDescClean.produceDescClean(path)
        pass  

product_articles_desc.get_product_articles_desc_test();